# Copyright (c) 2019 Cloudify Platform Ltd. All rights reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Stdlib imports

# Third party imports
from pyVmomi import vim

# Cloudify imports
from cloudify.exceptions import NonRecoverableError

# This package imports
from cloudify_vsphere.utils import op
from vsphere_plugin_common import (
    with_server_client,
    remove_runtime_properties,
)
from vsphere_plugin_common.constants import (
    HYPERVISOR_HOST_ID,
    HYPERVISOR_HOST_RUNTIME_PROPERTIES,
)

#zhutao
import atexit
import argparse
import getpass
from pyVim.connect import SmartConnectNoSSL,Disconnect,SmartConnect
from pyVmomi import vmodl
import subprocess

@op
@with_server_client
def create(ctx, server_client, name, use_external_resource):
    esxi_host_ip = ctx.node.properties['connection_config'].get('esxi_ip')
    esxi_host_username = ctx.node.properties['connection_config'].get('esxi_username')
    esxi_host_password = ctx.node.properties['connection_config'].get('esxi_password')
    vcenter_ip  = ctx.node.properties['connection_config'].get('host')
    vcenter_username  = ctx.node.properties['connection_config'].get('username')
    vcenter_password  = ctx.node.properties['connection_config'].get('password')
    vmware_client = VMWareClient(vcenter_ip, vcenter_username, vcenter_password)
    ctx.logger.debug('Connect to vcenter (%s) successfully !'%str(vcenter_ip))
    
    resource_pool_name = ctx.node.properties['connection_config'].get('resource_pool_name')
    datacenter_name = ctx.node.properties['connection_config'].get('datacenter_name')
    # cluster_name = ctx.node.properties['connection_config'].get('cluster_name')
    # ctx.logger.debug('++++++++++++++++++++++++++datacenter_name:%s'%str(datacenter_name))
    # dc = server_client._get_obj_by_name(vim.Datacenter, datacenter_name).hostFolder.AddStandaloneHost(spec=host_connect_spec,addConnected=True)
    # ctx.logger.debug('++++++++++++++++++++++++++dc:%s'%str(dc))
    # if not dc:
    #     vmware_client.create_datacenter(datacenter_name)
    #     ctx.logger.debug('datacenter:%s is created'%str(datacenter_name))
    #
    # eh = server_client._get_obj_by_name(vim.HostSystem,esxi_host_ip)

    ctx.logger.debug('esxi_host_ip 55 = %s' % str(esxi_host_ip))
    existing_id = server_client._get_obj_by_name(
        vim.Datacenter,
        datacenter_name,
    )
    si = SmartConnectNoSSL(host=vcenter_ip, user=vcenter_username, pwd=vcenter_password,
                                   port=443)
    if existing_id is not None:
        existing_id = existing_id.id
    else:
        folder = si.RetrieveContent().rootFolder
        # ctx.logger.info('folder78=%s'%str(folder))
        host_connect_spec = vim.host.ConnectSpec()
        host_connect_spec.hostName = esxi_host_ip
        host_connect_spec.userName = esxi_host_username
        host_connect_spec.password = esxi_host_password
        host_connect_spec.force = True
        host_connect_spec.sslThumbprint = get_ssl_thumbprint(esxi_host_ip)

        folder.CreateDatacenter(name=datacenter_name).hostFolder.AddStandaloneHost(spec=host_connect_spec,
                                                                                  addConnected=True)
        #ctx.logger.debug('new_host.hostFolder 90 = %s' % str(new_host.hostFolder))
        ctx.logger.debug('Add host to vcenter successfully')

        existing_id = server_client._get_obj_by_name(
            vim.Datacenter,
            datacenter_name,
            use_cache=False
        )

    runtime_properties = ctx.instance.runtime_properties
    runtime_properties['vsphere_datacenter_id'] = existing_id



    existing_id = server_client._get_obj_by_name(
        vim.ResourcePool,
        resource_pool_name,
    )
    ctx.logger.info('existing_id 103= %s'%str(existing_id))
    if existing_id is not None:

        existing_id = existing_id.id
    else:
        dc = si.content.rootFolder.childEntity
        for d in dc:
            for i in d.hostFolder.childEntity:
                ctx.logger.info('dc.hostFolder name  = %s'%str(i.name))
                #在指定esxi创建资源池
                if i.name == esxi_host_ip:
                    cr = d.hostFolder.childEntity[0]

                    rootResourcePool = cr.resourcePool

                    configSpec = vim.ResourceConfigSpec()
                    cpuAllocationInfo = vim.ResourceAllocationInfo()
                    memAllocationInfo = vim.ResourceAllocationInfo()
                    sharesInfo = vim.SharesInfo(level='normal')

                    cpuAllocationInfo.reservation = 0
                    cpuAllocationInfo.expandableReservation = True
                    cpuAllocationInfo.shares = sharesInfo
                    cpuAllocationInfo.limit = -1

                    memAllocationInfo.reservation = 0
                    memAllocationInfo.expandableReservation = True
                    memAllocationInfo.shares = sharesInfo
                    memAllocationInfo.limit = -1

                    configSpec.cpuAllocation = cpuAllocationInfo
                    configSpec.memoryAllocation = memAllocationInfo

                    rootResourcePool.CreateResourcePool(resource_pool_name, configSpec)
                    while True:
                        existing_p_id = server_client._get_obj_by_name(
                            vim.ResourcePool,
                            resource_pool_name,
                            use_cache=False
                        )
                        if existing_p_id:
                            ctx.logger.debug(
                                "Resource_pool created successful!")

                            existing_id = existing_p_id.id
                            break    

    runtime_properties = ctx.instance.runtime_properties
    runtime_properties['vsphere_resource_pool_id'] = existing_id


    

@op
@with_server_client
def delete(ctx, server_client, name, use_external_resource):
    if use_external_resource:
        ctx.logger.info(
            'Not deleting existing hypervisor host: {name}'.format(
                name=name,
            )
        )
    else:
        ctx.logger.info(
            'Not deleting hypervisor host {name} as creation and deletion of '
            'hypervisor_hosts is not currently supported by this plugin.'
            .format(name=name,)
        )
    remove_runtime_properties(HYPERVISOR_HOST_RUNTIME_PROPERTIES, ctx)

def create_datacenter(dcname=None, service_instance=None, folder=None):
    """
    Creates a new datacenter with the given name.
    Any % (percent) character used in this name parameter must be escaped,
    unless it is used to start an escape sequence. Clients may also escape
    any other characters in this name parameter.
    An entity name must be a non-empty string of
    less than 80 characters. The slash (/), backslash (\) and percent (%)
    will be escaped using the URL syntax. For example, %2F
    This can raise the following exceptions:
    vim.fault.DuplicateName
    vim.fault.InvalidName
    vmodl.fault.NotSupported
    vmodl.fault.RuntimeFault
    ValueError raised if the name len is > 79
    https://github.com/vmware/pyvmomi/blob/master/docs/vim/Folder.rst
    Required Privileges
    Datacenter.Create
    :param folder: Folder object to create DC in. If None it will default to
                   rootFolder
    :param dcname: Name for the new datacenter.
    :param service_instance: ServiceInstance connection to a given vCenter
    :return:
    """
    if len(dcname) > 79:
        raise ValueError("The name of the datacenter must be under "
                         "80 characters.")
    if folder is None:
        folder = service_instance.content.rootFolder

    if folder is not None and isinstance(folder, vim.Folder):
        dc_moref = folder.CreateDatacenter(name=dcname)
        return dc_moref

def create_folder(content, host_folder, folder_name):
    host_folder.CreateFolder(folder_name)

def get_obj(content, vimtype, name):
    obj = None
    container = content.viewManager.CreateContainerView(
        content.rootFolder, vimtype, True)
    for c in container.view:
        if c.name == name:
            obj = c
            break
    return obj

def get_ssl_thumbprint(host_ip):
    p1 = subprocess.Popen(('echo', '-n'), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p2 = subprocess.Popen(('openssl', 's_client', '-connect', '{0}:443'.format(host_ip)), stdin=p1.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p3 = subprocess.Popen(('openssl', 'x509', '-noout', '-fingerprint', '-sha1'), stdin=p2.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out = p3.stdout.read()
    ssl_thumbprint = out.split(b'=')[-1].strip()
    return ssl_thumbprint.decode("utf-8")

def wait_for_tasks(service_instance, tasks):
    """Given the service instance si and tasks, it returns after all the
   tasks are complete
   """
    property_collector = service_instance.content.propertyCollector
    task_list = [str(task) for task in tasks]
    # Create filter
    obj_specs = [vmodl.query.PropertyCollector.ObjectSpec(obj=task)
                 for task in tasks]
    property_spec = vmodl.query.PropertyCollector.PropertySpec(type=vim.Task,
                                                               pathSet=[],
                                                               all=True)
    filter_spec = vmodl.query.PropertyCollector.FilterSpec()
    filter_spec.objectSet = obj_specs
    filter_spec.propSet = [property_spec]
    pcfilter = property_collector.CreateFilter(filter_spec, True)
    try:
        version, state = None, None
        # Loop looking for updates till the state moves to a completed state.
        while len(task_list):
            update = property_collector.WaitForUpdates(version)
            for filter_set in update.filterSet:
                for obj_set in filter_set.objectSet:
                    task = obj_set.obj
                    for change in obj_set.changeSet:
                        if change.name == 'info':
                            state = change.val.state
                        elif change.name == 'info.state':
                            state = change.val
                        else:
                            continue

                        if not str(task) in task_list:
                            continue

                        if state == vim.TaskInfo.State.success:
                            # Remove task from taskList
                            task_list.remove(str(task))
                        elif state == vim.TaskInfo.State.error:
                            raise task.info.error
            # Move to next version
            version = update.version
    finally:
        if pcfilter:
            pcfilter.Destroy()

class VMWareClient:
    def __init__(self, host, user, password, port=443, insecure=True):
        if insecure:
            self._service_instance = SmartConnectNoSSL(host=host, user=user, pwd=password, port=port)
        else:
            self._service_instance = SmartConnect(host=host, user=user, pwd=password, port=port)
        self._host = host
        self._user = user
        self._password = password
        atexit.register(Disconnect, self._service_instance)
        self._content = self._service_instance.RetrieveContent()

    def create_datacenter(self, name):
        folder = self._content.rootFolder
        return folder.CreateDatacenter(name=name)

    def create_cluster(self, name, datacenter):
        host_folder = datacenter.hostFolder
        cluster_spec = vim.cluster.ConfigSpecEx()
        return host_folder.CreateClusterEx(name=name, spec=cluster_spec)

    def add_host_to_vc(self, host_ip, host_username, host_password, datacenter_name, cluster_name):
        host_connect_spec = vim.host.ConnectSpec()
        host_connect_spec.hostName = host_ip
        host_connect_spec.userName = host_username
        host_connect_spec.password = host_password
        host_connect_spec.force = True
        host_connect_spec.sslThumbprint = get_ssl_thumbprint(host_ip)
        datacenter = self.create_datacenter(datacenter_name)
        cluster = self.create_cluster(cluster_name, datacenter)
        add_host_task = cluster.AddHost(spec=host_connect_spec, asConnected=True)
        wait_for_tasks(self._service_instance, [add_host_task])



