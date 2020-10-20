from setuptools import setup


setup(

    # Do not use underscores in the plugin name.
    name='mongo-plugin',

    version='1.0',
    author='chris',
    author_email='christaotao@163.com',
    description='plugin for mongo',

    # This must correspond to the actual packages in the plugin.
    packages=[
              'mongo_task',
              ],

    license='LICENSE',
    zip_safe=True,
    install_requires=[
        # Necessary dependency for developing plugins, do not remove!
        "cloudify-plugins-common>=3.4",
        "pyyaml>=3.10",
        "wagon==0.6.0",
    ],

)
