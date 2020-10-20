/**
 * Created by jakubniezgoda on 18/10/2018.
 * modified by woody zcn on 16/11/2019
 */

class InputsUtils {

    static DEFAULT_VALUE_STRING = '';
    static DEFAULT_VALUE_NUMBER = 0;
    static DEFAULT_VALUE_BOOLEAN = false;

    static STRING_VALUE_SURROUND_CHAR = '"';
    static EMPTY_STRING = '""';

    static validateValues = {
            'max_uplink_rate': InputsUtils.multiple256,
            'max_downlink_rate': InputsUtils.multiple256,
            'not_allowed_app' : InputsUtils.notAllowedApp,
            'direction': InputsUtils.checkDirection,
            'ip_rate': InputsUtils.multiple256,
            'max_tcp_session': InputsUtils.range0To65535,
            'max_total_session': InputsUtils.range0To65535,
            'max_udp_session': InputsUtils.range0To65535,
            'Max-Monthly-Session_value': InputsUtils.isinteger,
            'Max_Monthly_Traffic_value': InputsUtils.isinteger,
            'Max_all_session_value': InputsUtils.isinteger,
            'login_time_value': InputsUtils.login_time_value,
            'password':InputsUtils.value_lenth
    };
    /* Helper functions */

    static getEnhancedStringValue(value) {
        let {Json} = Stage.Utils;
        let stringValue = Json.getStringValue(value);

        if (stringValue === '') {
            return InputsUtils.EMPTY_STRING;
        } else {
            let valueType = Json.toType(value);
            let castedValue = Json.getTypedValue(stringValue);
            let castedValueType = Json.toType(castedValue);

            if (valueType !== castedValueType) {
                stringValue = `"${stringValue}"`;
            }

            return stringValue;
        }
    }

    static getInputFieldInitialValue(defaultValue, type = undefined) {
        if (_.isNil(defaultValue)) {
            switch (type) {
                case 'boolean':
                    return InputsUtils.DEFAULT_VALUE_BOOLEAN;
                case 'integer':
                    return InputsUtils.DEFAULT_VALUE_NUMBER;
                case 'string':
                default:
                    return InputsUtils.DEFAULT_VALUE_STRING;
            }
        } else {
            switch (type) {
                case 'boolean':
                case 'integer':
                    return defaultValue;
                case 'string':
                default:
                    return InputsUtils.getEnhancedStringValue(defaultValue);
            }
        }
    }


    /* Components */

    static getRevertToDefaultIcon(name, value, defaultValue, inputChangeFunction) {
        let {RevertToDefaultIcon} = Stage.Basic;
        let {Json} = Stage.Utils;

        const stringValue = Json.getStringValue(value);
        const typedValue = _.startsWith(stringValue, InputsUtils.STRING_VALUE_SURROUND_CHAR) &&
                           _.endsWith(stringValue, InputsUtils.STRING_VALUE_SURROUND_CHAR) &&
                           _.size(stringValue) > 1
            ? stringValue.slice(1, -1)
            : Json.getTypedValue(value);

        const typedDefaultValue = defaultValue;
        const cloudifyTypedDefaultValue = InputsUtils.getInputFieldInitialValue(defaultValue, Json.toCloudifyType(typedDefaultValue));

        const revertToDefault = () => inputChangeFunction(null, {name, value: cloudifyTypedDefaultValue});

        return _.isNil(typedDefaultValue)
            ? undefined
            : <RevertToDefaultIcon value={typedValue} defaultValue={typedDefaultValue} onClick={revertToDefault} />;
    }

    static getFormInputField(name, value, defaultValue, description, onChange, error, type) {
        let {Form} = Stage.Basic;

        switch (type) {
            case 'boolean':
                return (
                    <Form.Field key={name} help={description} required={_.isNil(defaultValue)}>
                        {InputsUtils.getInputField(name, value, defaultValue, onChange, error, type)}
                    </Form.Field>
                );
            case 'integer':
                return (
                    <Form.Field key={name} error={error} help={description} required={_.isNil(defaultValue)} label={name}>
                        {InputsUtils.getInputField(name, value, defaultValue, onChange, error, type)}
                    </Form.Field>
                );
            case 'string':
            default:
                return (
                    <Form.Field key={name} error={error} help={description} required={_.isNil(defaultValue)} label={name}>
                        {InputsUtils.getInputField(name, value, defaultValue, onChange, error, type)}
                    </Form.Field>
                );
        }

    }

    static multiple256(inputValue){
        let inputValueType = Stage.Utils.Json.toCloudifyType(inputValue);
        if(inputValueType !== 'integer')
            return false;
        if(inputValue % 256){
            return false;
        }
        return true;
    }

    static notAllowedApp(inputValue){
        let allowed = ['game','video','mobile','webmail'];
        let inputs = inputValue.split(',');
        let valid = true;
        inputs.forEach((app) => {
            for(let i = 0;i < allowed.length; i++){
                if(app === allowed[i]){
                    valid = true;
                    return true;
                }
            }
            valid = false;
            return false;
        })
        return valid;
    }

    static checkDirection(inputValue){
        let dir = ['in','out','both'];
        for(let i = 0;i < dir.length; i++){
            if(inputValue === dir[i]){
                return true;
            }
        }
        return false;
    }

    static range0To65535(inputValue){
        let inputValueType = Stage.Utils.Json.toCloudifyType(inputValue);
        if(inputValueType !== 'integer')
            return false;
        if(inputValue <= 65535 && inputValue >= 0){
            return true;
        }
        return false;
    }

    static isinteger(inputValue){
        let inputValueType = Stage.Utils.Json.toCloudifyType(inputValue);
        if(inputValueType !== 'integer')
            return false;
        return true;
    }

    static  login_time_value(inputValue){
        return /([0-1][0-9]|[2][0-3]):([0-5][0-9])-([0-1][0-9]|[2][0-3]):([0-5][0-9])\/([0-1][0-9]|[2][0-3]):([0-5][0-9])-([0-1][0-9]|[2][0-3]):([0-5][0-9])/.test(inputValue)
        }

    static  value_lenth(inputValue){
        if (inputValue.length >= 6)
            return true;
        return false
         }


    static getInputField(name, value, defaultValue, onChange, error, type) {
        let {Form} = Stage.Basic;

        switch (type) {
            case 'boolean':
                return (
                    <React.Fragment>
                        <Form.Checkbox name={name} toggle label={name} checked={value} onChange={onChange} />
                        &nbsp;&nbsp;&nbsp;
                        {InputsUtils.getRevertToDefaultIcon(name, value, defaultValue, onChange)}
                    </React.Fragment>
                );

            case 'integer':
                return <Form.Input name={name} value={value} fluid error={!!error} type='number'
                                   icon={InputsUtils.getRevertToDefaultIcon(name, value, defaultValue, onChange)}
                                   onChange={onChange} />;

            case 'string':
            default:
                return _.includes(value, '\n')
                    ?
                    <Form.Group>
                        <Form.Field width={15}>
                            <Form.TextArea name={name} value={value} onChange={onChange} />
                        </Form.Field>
                        <Form.Field width={1} style={{textAlign: 'center'}}>
                            {InputsUtils.getRevertToDefaultIcon(name, value, defaultValue, onChange)}
                        </Form.Field>
                    </Form.Group>
                    :
                    <Form.Input name={name} value={value} fluid error={!!error}
                                icon={InputsUtils.getRevertToDefaultIcon(name, value, defaultValue, onChange)}
                                onChange={onChange} />;
        }
    }

    static getInputFields(inputs, onChange, inputsState, errorsState) {
        let enhancedInputs
            = _.sortBy(
                _.map(inputs, (input, name) => ({'name': name, ...input})),
                [(input => !_.isNil(input.default)), 'name']);

        return _.map(enhancedInputs, (input) =>
            InputsUtils.getFormInputField(input.name,
                                          inputsState[input.name] // Always return defined value to avoid rendering uncontrolled inputs
                                          || InputsUtils.getInputFieldInitialValue(undefined, input.type),
                                          input.default,
                                          input.description,
                                          onChange,
                                          errorsState[input.name],
                                          input.type)
        );
    }


    /* Inputs for field values (string values) */

    static getInputsInitialValuesFrom(plan) {
        let inputs = {};

        _.forEach(plan, (inputObj, inputName) => {
            inputs[inputName] = InputsUtils.getInputFieldInitialValue(inputObj.default, inputObj.type);
        });

        return inputs;
    }

    static validateInputTypes(plan, inputs) {
        let errors = [];
        let inputsAreValid = true;

        _.forEach(plan, (inputObj, inputName) => {
            const expectedValueType = inputObj.type;
            const inputValue = inputs[inputName];

            if (!_.isUndefined(expectedValueType) && !_.isUndefined(inputValue)) {
                const inputValueType = Stage.Utils.Json.toCloudifyType(inputValue);
                if ((expectedValueType === 'boolean' || expectedValueType === 'integer') &&
                    (expectedValueType !== inputValueType)) {
                    errors.push(inputName);
                    inputsAreValid = false;
                }
            }
        });

        if (!inputsAreValid) {
            throw new Error(`The following fields have invalid types: ${_.join(errors, ', ')}.`);
        }
    }

    static getUpdatedInputs(plan, currentValues, newValues) {
        let inputs = {};

        InputsUtils.validateInputTypes(plan, newValues);

        _.forEach(plan, (inputObj, inputName) => {
            let newValue = newValues[inputName];
            let currentValue = currentValues[inputName];

            if (_.isNil(newValue)) {
                inputs[inputName] = currentValue;
            } else {
                inputs[inputName] = InputsUtils.getInputFieldInitialValue(newValue, inputObj.type);
            }
        });

        return inputs;
    }


    /* Inputs for REST API (typed values) */

    static getPlanForUpdate(plan, inputsValues) {
        let newPlan = _.cloneDeep(plan);

        _.forEach(newPlan, (inputObj, inputName) => {
            if (!_.isUndefined(inputsValues[inputName]) && !_.isUndefined(newPlan[inputName].default)) {
                newPlan[inputName].default = inputsValues[inputName];
            }
        });

        return newPlan;
    }


    static getInputsToSendAndValidate(inputs, inputsValues, inputsWithoutValues,inputsErrorValue) {
        let {Json} = Stage.Utils;
        let deploymentInputs = {};
        let inputsAreValid = true;
        let errors = [];

        _.forEach(inputs, (inputObj, inputName) => {
            let stringInputValue = String(inputsValues[inputName]);
            let typedInputValue = Json.getTypedValue(stringInputValue);

            if (_.isEmpty(stringInputValue) && _.isNil(inputObj.default)) {
                inputsWithoutValues[inputName] = true;
            } else if (_.startsWith(stringInputValue, InputsUtils.STRING_VALUE_SURROUND_CHAR) &&
                       _.endsWith(stringInputValue, InputsUtils.STRING_VALUE_SURROUND_CHAR) &&
                       _.size(stringInputValue) > 1) {
                typedInputValue = stringInputValue.slice(1, -1);
            }
            _.forEach(this.validateValues,(validateFunction, validateInputName) => {
                if(inputName === validateInputName) {
                    inputsAreValid = validateFunction(typedInputValue);
                    if(inputsAreValid === false){
                        inputsErrorValue[inputName] = true;
                    }
                }
            });
            if (!_.isEqual(typedInputValue, inputObj.default)) {
                deploymentInputs[inputName] = typedInputValue;
            }
        });
        return deploymentInputs;
    }


    static getInputsToSend(inputs, inputsValues, inputsWithoutValues) {
        let {Json} = Stage.Utils;
        let deploymentInputs = {};

        _.forEach(inputs, (inputObj, inputName) => {
            let stringInputValue = String(inputsValues[inputName]);
            let typedInputValue = Json.getTypedValue(stringInputValue);

            if (_.isEmpty(stringInputValue) && _.isNil(inputObj.default)) {
                inputsWithoutValues[inputName] = true;
            } else if (_.startsWith(stringInputValue, InputsUtils.STRING_VALUE_SURROUND_CHAR) &&
                       _.endsWith(stringInputValue, InputsUtils.STRING_VALUE_SURROUND_CHAR) &&
                       _.size(stringInputValue) > 1) {
                typedInputValue = stringInputValue.slice(1, -1);
            }

            if (!_.isEqual(typedInputValue, inputObj.default)) {
                deploymentInputs[inputName] = typedInputValue;
            }
        });

        return deploymentInputs;
    }


    static addErrors(inputsWithoutValues, errors) {
        _.forEach(_.keys(inputsWithoutValues), (inputName) => errors[inputName] = `Please provide ${inputName}`);
    }
    static addValueErrors(inputsValueError, errors){
        _.forEach(_.keys(inputsValueError), (inputName) => errors[inputName] = `${inputName} 输入值错误，请按照帮助信息修改`);
    }

}

Stage.defineCommon({
    name: 'InputsUtils',
    common: InputsUtils
});