#########
# Copyright (c) 2014 GigaSpaces Technologies Ltd. All rights reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
#  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or0 implied.
#  * See the License for the specific language governing permissions and
#  * limitations under the License.

# Stdlib imports
import urllib


# Third party imports

# Cloudify imports
from cloudify.exceptions import NonRecoverableError

# This package imports
from cloudify_vsphere.utils import op
from vsphere_plugin_common import (
    with_network_client,
    remove_runtime_properties
)
from vsphere_plugin_common.constants import (
    VSWITCH_NAME,
    VSWITCH_PNIC,
    VSWITCH_PORTGROUP,
    VSWITCH_RUNTIME_PROPERTIES,
    LOAD_BALANCE,
    SECURITY_POLICY_CONVERT,
    NIC_TEAMING_POLICY_CONVERT,
    LINK_DISCOVERY_PROTOCOL_OPERATION,
    LINK_DISCOVERY_PROTOCOL_PROTOCOL,
)
from cloudify_vsphere.utils.feedback import check_name_for_special_characters


@op
@with_network_client
def create(ctx,
           network_client,
           vswitch,
           # use_existing_resource,
           bondbridge,
           # securitypolicy,
           # nicteamingpolicy,
           # trafficshapingpolicy
    ):

    check_name_for_special_characters(vswitch['name'])
    vswitch_name = vswitch['name']

    mtu = vswitch['mtu']

    existing_id = network_client.get_vswitch_by_name(
        name=urllib.unquote(vswitch_name)
    )

    # if use_existing_resource:
    #     if not existing_id:
    #         raise NonRecoverableError(
    #             'Could not use existing virtual switch "{name}" '
    #             'as no virtual switch by that name exists!'
    #             ''.format(name=vswitch_name)
    #         )

    if existing_id :
        raise NonRecoverableError(
            'Could not create new virtual switch "{name}" '
            'as a virtual switch by that name already exists'
            ''.format(
                name=vswitch_name,
            )
        )

    nics = bondbridge.get('nicdevice', '').split(',')
    if nics[0] == '':
        raise NonRecoverableError(
            "Create virtual switch failed :"
            "Lack of necessary parameters nicdevice"
        )
    else:
        nicdevice = nics

    for nic in nicdevice:
        if network_client.is_pnic_used_by_vswitch(
                urllib.unquote(nic)
        ):
            raise NonRecoverableError(
                "Create virtual switch failed :"
                "physical nic {name} used by vswitch"
                "".format(name=nic)
            )

    #
    # model = bondbridge.get('linkdiscovermodel', 'listen')
    # if model not in LINK_DISCOVERY_PROTOCOL_OPERATION:
    #     raise  NonRecoverableError(
    #         "The content of operation "
    #         "cannot be identified."
    #         "operation is {ops}, "
    #         "But available value is {link}"
    #         "".format(ops=model,
    #                   link = str(LINK_DISCOVERY_PROTOCOL_OPERATION))
    #     )

    # protocol = bondbridge.get('linkdiscoverprotocol', 'cdp')
    # if protocol not in LINK_DISCOVERY_PROTOCOL_PROTOCOL:
    #     raise NonRecoverableError(
    #         "The content of protocol "
    #         "cannot be identified."
    #         "operation is {pro}, "
    #         "But available value is {link}"
    #         "".format(pro=protocol,
    #                   link=str(LINK_DISCOVERY_PROTOCOL_PROTOCOL))
    #     )

    security = {}
    # for key,value in SECURITY_POLICY_CONVERT.items():
    #     if key in securitypolicy:
    #         security.setdefault(value, securitypolicy[key])

    nicteaming = {}
    # for key,value in NIC_TEAMING_POLICY_CONVERT.items():
    #     if (key in nicteamingpolicy and
    #         isinstance(nicteamingpolicy[key], bool)):
    #         nicteaming.setdefault(value, nicteamingpolicy[key])
    #
    #     elif(key == 'loadbalance' and
    #         nicteamingpolicy[key] in LOAD_BALANCE):
    #         nicteaming.setdefault(value, nicteamingpolicy[key])
    #
    #     elif key == 'rollingorder':
    #         nicteaming.setdefault(value,nicteamingpolicy.get(key, False))
    #
    #     elif key in ['activenic', 'standbynic']:
    #         nic = nicteamingpolicy.get(key, '').split(',')
    #         if nic[0] == '':
    #             nicteaming.setdefault(value, [])
    #         else:
    #             nicteaming.setdefault(value, nic)
    if nicteaming['activeNic'] == []:
        nicteaming['activeNic'] = nicdevice


    shaping = {}
    # if ('trafficshaping' in trafficshapingpolicy and
    #         isinstance(trafficshapingpolicy['trafficshaping'], bool)):
    #     shaping['enabled'] = trafficshapingpolicy['trafficshaping']
    #
    # if shaping.get('enabled', False):
    #     shaping['averageBandwidth'] = \
    #         trafficshapingpolicy.get('averagebandwidth', 100000)
    #     shaping['peakBandwidth'] = \
    #         trafficshapingpolicy.get('peakbandwidth', 100000)
    #     shaping['burstSize'] = \
    #         trafficshapingpolicy.get('burstsize', 102400)

    ctx.logger.debug(
        'Creating called {name} and mtu {mtu} on '
        '{nics}'.format(
            name=vswitch_name,
            mtu=mtu,
            nics=str(nicdevice),
        )
    )
    newvswitchs = network_client.create_standard_vswitch(
        mtu=mtu,
        name=vswitch_name,
        nicdevice=nicdevice,
        operation='listen',
        protocol='cdp',
        numports=1024,
        securitypolicy=security,
        shapingpolicy=shaping,
        nicteamingpolicy=nicteaming
    )
    nics = []
    for vswitch, host in newvswitchs:
        nics.extend(vswitch.pnic)

    runtime_properties = ctx.instance.runtime_properties
    runtime_properties[VSWITCH_NAME] = vswitch_name
    runtime_properties[VSWITCH_PNIC] = nics

    ctx.logger.info('Successfully created virtual switch: {name}'
                    ''.format(name=vswitch_name))

@op
@with_network_client
def update(ctx,
           network_client,
           vswitch,
           bondbridge,
           securitypolicy,
           nicteamingpolicy,
           trafficshapingpolicy
    ):
    check_name_for_special_characters(vswitch['name'])

    vswitch_name = vswitch['name']
    mtu = vswitch.get('mtu', None)

    existing_id = network_client.get_vswitch_by_name(
        name=urllib.unquote(vswitch_name)
    )

    if not existing_id :
        raise NonRecoverableError(
            'Could not update virtual switch "{name}" '
            'as a virtual switch by that name have not exists.'
            ''.format(
                name=vswitch_name
            )
        )

    #get a virtual switch obj
    vswitchobj, host = existing_id[0]

    ctx.logger.debug(
        "Update a virtual switch :\n"
        "vswitch arguments is {vs} \n"
        "bond bridge is {br} \n"
        "security policy is {sec} \n"
        "nic teaming policy is {nt} \n"
        "traffic shaping policy is {tr}\n".format(
            vs = str(vswitch),
            br = str(bondbridge),
            sec = str(securitypolicy),
            nt = str(nicteamingpolicy),
            tr = str(trafficshapingpolicy)
        )
    )

    #if nicdevice is '',it means config nic device is []
    nicdevice = bondbridge.get('nicdevice')
    if nicdevice:
        nicdevice = nicdevice.split(',')
        for nic in nicdevice:
            if network_client.is_pnic_used_by_vswitch(
                    name=urllib.unquote(nic),
                    vswitch=vswitch_name,
            ):
                raise NonRecoverableError(
                    "Update virtual switch failed :"
                    "physical nic {name} used by "
                    "other vswitch".format(name=nic)
                )

    elif nicdevice == '':
        nicdevice = []

    model = bondbridge.get('linkdiscovermodel')
    if (model and
        model not in LINK_DISCOVERY_PROTOCOL_OPERATION):
        raise  NonRecoverableError(
            "The content of operation "
            "cannot be identified."
            "operation is {ops}, "
            "But available value is {link}"
            "".format(ops=model,
                      link = str(LINK_DISCOVERY_PROTOCOL_OPERATION))
        )

    protocol = bondbridge.get('linkdiscoverprotocol')
    if (protocol and
        protocol not in LINK_DISCOVERY_PROTOCOL_PROTOCOL):
        raise NonRecoverableError(
            "The content of protocol "
            "cannot be identified."
            "operation is {pro}, "
            "But available value is {link}"
            "".format(pro=protocol,
                      link=str(LINK_DISCOVERY_PROTOCOL_PROTOCOL))
        )

    security = {}
    for key,value in SECURITY_POLICY_CONVERT.items():
        if (key in securitypolicy and
            securitypolicy[key] != None):
            security.setdefault(value, securitypolicy[key])

    nicteaming = {}
    for key,value in NIC_TEAMING_POLICY_CONVERT.items():

        if (key not in nicteamingpolicy or
            nicteamingpolicy[key] == None):
            continue

        if isinstance(nicteamingpolicy[key], bool):
            nicteaming.setdefault(value, nicteamingpolicy[key])

        elif(key == 'loadbalance' and
             nicteamingpolicy[key] in LOAD_BALANCE):
            nicteaming.setdefault(value, nicteamingpolicy[key])

        elif key == 'rollingorder':
            nicteaming.setdefault(value,nicteamingpolicy[key])

        elif key in ['activenic', 'standbynic'] :
            nic = nicteamingpolicy.get(key, '').split(',')
            if nic[0] == '':
                nicteaming.setdefault(value, [])
            else:
                nicteaming.setdefault(value, nic)

    shaping = {}
    if ('trafficshaping' in trafficshapingpolicy and
        isinstance(trafficshapingpolicy['trafficshaping'], bool)):
        shaping['enabled'] = trafficshapingpolicy['trafficshaping']

    if shaping.get('enabled', vswitchobj.spec.policy.shapingPolicy.enabled):
        if 'averagebandwidth' in trafficshapingpolicy:
            shaping['averageBandwidth'] = \
                trafficshapingpolicy['averagebandwidth']

        if 'peakbandwidth' in trafficshapingpolicy:
            shaping['peakBandwidth'] = \
                trafficshapingpolicy['peakbandwidth']

        if 'burstsize' in trafficshapingpolicy:
            shaping['burstSize'] = \
                trafficshapingpolicy['burstsize']

    #if no change about this vswitch has occured,
    #then return directly
    if not (mtu or nicdevice or
            model or protocol or
            security or shaping or nicteaming):
        ctx.logger.info(
            'Successfully update virtual switch: {name}: \n'
            'No changes have taken place on the vswitch'
            ''.format(name=vswitch_name))
        return

    newvswitches = network_client.edit_standard_vswitch(
        mtu=mtu,
        name=vswitch_name,
        nicdevice=nicdevice,
        operation=model,
        numports=None,
        protocol=protocol,
        securitypolicy=security,
        shapingpolicy=shaping,
        nicteamingpolicy=nicteaming
    )

    nics = []
    pgs = []
    for vswitch, host in newvswitches:
        nics.extend(vswitch.pnic)
        pgs.extend(vswitch.portgroup)

    runtime_properties = ctx.instance.runtime_properties

    runtime_properties[VSWITCH_NAME] = vswitch_name
    runtime_properties[VSWITCH_PNIC] = nics
    runtime_properties[VSWITCH_PORTGROUP] = pgs

    ctx.logger.info('Successfully update virtual switch: {name}'
                    ''.format(name=vswitch_name))

@op
@with_network_client
def delete(ctx,
           network_client,
           vswitch):

    check_name_for_special_characters(vswitch['name'])
    vswitch_name = vswitch['name']

    vswitch_name = urllib.unquote(vswitch_name)

    existing_id = network_client.get_vswitch_by_name(
        name=vswitch_name
    )

    if not existing_id:
        ctx.logger.info(
            'Successfully deleted virtual switch: {name} .'
            'Cause virtual switch not found'
        )
        return

    ctx.logger.info(
        'Deleting {name}'
        ''.format(name=vswitch_name)
    )

    network_client.delete_vswitch(vswitch_name)

    remove_runtime_properties(VSWITCH_RUNTIME_PROPERTIES, ctx)

    ctx.logger.info(
        'Successfully deleted virtual switch: {name}'
        ''.format(name=vswitch['name']))



