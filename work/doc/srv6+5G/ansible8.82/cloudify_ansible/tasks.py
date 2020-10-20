# Copyright (c) 2019 Cloudify Platform Ltd. All rights reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from cloudify.decorators import operation
from cloudify.exceptions import (
    NonRecoverableError,
    OperationRetry
)

from script_runner.tasks import (
    execute,
    process_execution,
    ProcessException
)

from cloudify_ansible_sdk import (
    AnsiblePlaybookFromFile,
    CloudifyAnsibleSDKError
)
from cloudify_ansible import (
    ansible_playbook_node,
    ansible_relationship_source,
    utils
)

UNREACHABLE_CODES = [None, 2, 4]
SUCCESS_CODES = [0]


@operation(resumable=True)
def cleanup(ctx, **_):
    utils.cleanup(ctx)


@operation(resumable=True)
def set_playbook_config(ctx, **kwargs):
    utils.set_playbook_config_as_runtime_properties(ctx, kwargs)


def secure_log_playbook_args(_ctx, args, **_):
    """
    This function takes playbook_args and check against sensitive_keys
    to hide that sensitive values when logging
    """
    def _log(data, sensitive_keys, log_message="", parent_hide=False):
        """
        ::param data : dict to check againt sensitive_keys
        ::param sensitive_keys : a list of keys we want to hide the values for
        ::param log_message : a string to append the message to
        ::param parent_hide : boolean flag to pass if the parent key is
                              in sensitive_keys
        """
        for key in data:
            # check if key in sensitive_keys or parent_hide
            hide = parent_hide or (key in sensitive_keys)
            value = data[key]
            # handle dict value incase sensitive_keys was inside another key
            if isinstance(value, dict):
                # call _log function recusivly to handle the dict value
                log_message += "{0} : \n".format(key)
                v = _log(value, sensitive_keys, "", hide)
                log_message += "  {0}".format("  ".join(v.splitlines(True)))
            else:
                # if hide true hide the value with "*"
                log_message += "{0} : {1}\n".format(key, '*'*len(value)
                                                         if hide else value)
        return log_message

    log_message = _log(args, args.get("sensitive_keys", {}))
    _ctx.logger.debug("playbook_args: \n {0}".format(log_message))


@operation(resumable=True)
@ansible_playbook_node
def run(playbook_args, ansible_env_vars, _ctx, **_):
    secure_log_playbook_args(_ctx, playbook_args)

    try:
        playbook = AnsiblePlaybookFromFile(**playbook_args)
        utils.assign_environ(ansible_env_vars)
        process = {}
        process['env'] = ansible_env_vars
        process['args'] = playbook.process_args
        # check if ansible_playbook_executable_path was provided
        # if not provided default to "ansible-playbook" which will use the
        # executable included in the plugin
        script_path = \
            playbook_args.get("ansible_playbook_executable_path",
                              "ansible-playbook")

        # Prepare the script which need to be run
        playbook.execute(
            process_execution,
            script_func=execute,
            script_path=script_path,
            ctx=_ctx,
            process=process
        )
    except CloudifyAnsibleSDKError as sdk_error:
        raise NonRecoverableError(sdk_error)
    except ProcessException as process_error:
        if process_error.exit_code in UNREACHABLE_CODES:
            raise OperationRetry(
                'One or more hosts are unreachable.')
        if process_error.exit_code not in SUCCESS_CODES:
            raise NonRecoverableError(
                'One or more hosts failed.')


@operation(resumable=True)
@ansible_relationship_source
def ansible_requires_host(new_sources_dict, _ctx, **_):
    utils.update_sources_from_target(new_sources_dict, _ctx)


@operation(resumable=True)
@ansible_relationship_source
def ansible_remove_host(new_sources_dict, _ctx, **_):
    utils.cleanup_sources_from_target(new_sources_dict, _ctx)
