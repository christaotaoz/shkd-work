########
# Copyright (c) 2014 GigaSpaces Technologies Ltd. All rights reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
#    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    * See the License for the specific language governing permissions and
#    * limitations under the License.


from setuptools import setup

# Replace the place holders with values for your project

setup(

    # Do not use underscores in the plugin name.
    name='pa-plugin',

    version='1.0',
    author='Jianghao',
    author_email='ENTER-AUTHOR-EMAIL-HERE',
    description='plugin for panabit',

    # This must correspond to the actual packages in the plugin.
    packages=['cfy',
              'pa_plugin_task'],

    license='LICENSE',
    zip_safe=True,
    install_requires=[
        # Necessary dependency for developing plugins, do not remove!
        "cloudify-plugins-common>=3.4",
        "pyyaml>=3.10",
        "wagon==0.6.0",
    ],
#    test_requires=[
#        "cloudify-dsl-parser>=4.1a1"
#        "nose"
#    ]
)
