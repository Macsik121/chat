import React, { FC } from 'react';

const InputField: FC<{
    inputName: string;
    label: string;
}> = ({
    inputName,
    label
}) => {
    return (
        <div className="field-wrap">
            <input
                type="text"
                className="field"
                name={inputName}
                required={true}
            />
            <label className="label-field">{label}:</label>
        </div>
    )
}

export default InputField;
