# Copyright (c) 2014-2020 Cloudify Platform Ltd. All rights reserved
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


from setuptools import setup

setup(
    name='cloudify-fabric-plugin',
    version='1.6.0',
    author='Cloudify',
    author_email='hello@cloudify.co',
    packages=['fabric_plugin'],
    license='LICENSE',
    description='Plugin for remotely running fabric tasks and commands',
    install_requires=[
        'cloudify-common>=4.4.0',
        'paramiko>=1.18.3',
        'fabric>=1.13.1,<2.0', # 2+ branch has API changes
        'six>=1.8.0',
    ]
)
