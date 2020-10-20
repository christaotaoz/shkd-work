/**
 * Created by jakub.niezgoda on 26/07/2018.
 */

import WizardButton from './WizardButton';
import BlueprintStep from './steps/BlueprintStep';
import InfrastructureStep from './steps/InfrastructureStep';
import PluginsStep from './steps/PluginsStep';
import SecretsStep from './steps/SecretsStep';
import InputsStep from './steps/InputsStep';
import ConfirmationStep from './steps/ConfirmationStep';
import InstallStep from './steps/InstallStep';

const configurationDefaults = {
    showHelloWorldWizardButton: true,
    helloWorldWizardButtonLabel: 'Hello World 向导',
    showDeploymentWizardButton: true,
    deploymentWizardButtonLabel: '部署 向导'
};

Stage.defineWidget({
    id: 'deploymentWizardButtons',
    name: 'Deployment Wizard Buttons',
    description: 'Shows buttons to start deployment wizard',
    initialWidth: 2,
    initialHeight: 8,
    hasReadme: true,
    hasStyle: true,
    isReact: true,
    showHeader: false,
    showBorder: false,
    categories: [Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    initialConfiguration: [
        {id: 'showHelloWorldWizardButton', name: 'Show Hello World Wizard button',
            default: configurationDefaults.showHelloWorldWizardButton,
            type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: 'helloWorldWizardButtonLabel', name: 'Hello World Wizard button label',
            default: 'Iaas Hello World向导',
            type: Stage.Basic.GenericField.STRING_TYPE},
        {id: 'showDeploymentWizardButton', name: 'Show Deployment Wizard button',
            default: configurationDefaults.showDeploymentWizardButton,
            type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: 'deploymentWizardButtonLabel', name: 'Deployment Wizard button label',
            default: '部署向导',
            type: Stage.Basic.GenericField.STRING_TYPE}
    ],
    permission: Stage.GenericConfig.WIDGET_PERMISSION('deploymentWizardButtons'),

    render: function(widget, data, error, toolbox) {
        let {Divider} = Stage.Basic;

        const helloWorldWizardSteps = [
            InfrastructureStep,
            PluginsStep,
            SecretsStep,
            InputsStep,
            ConfirmationStep,
            InstallStep
        ];
        const deploymentWizardSteps = [
            BlueprintStep,
            PluginsStep,
            SecretsStep,
            InputsStep,
            ConfirmationStep,
            InstallStep
        ];
        const {
            showHelloWorldWizardButton = configurationDefaults.showHelloWorldWizardButton,
            showDeploymentWizardButton = configurationDefaults.showDeploymentWizardButton,
            helloWorldWizardButtonLabel = 'Iaas Hello World向导',
            deploymentWizardButtonLabel = '部署向导'
        } = widget.configuration;

        return (
            <React.Fragment>
            {
                showHelloWorldWizardButton &&
                <WizardButton color='red' icon='globe' name={helloWorldWizardButtonLabel}
                              wizardTitle='Hello World 向导'
                              steps={helloWorldWizardSteps} toolbox={toolbox} />
            }
            {
                showHelloWorldWizardButton && showDeploymentWizardButton &&
                <Divider hidden />
            }
            {
                showDeploymentWizardButton &&
                <WizardButton color='teal' icon='wizard' name={deploymentWizardButtonLabel}
                              wizardTitle='部署 向导'
                              steps={deploymentWizardSteps}
                              toolbox={toolbox} />
            }
            </React.Fragment>
        );
    }

});