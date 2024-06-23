import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const FormRow = ({ type, name, labelText, defaultValue, onChange }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue || "");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className="form-row">
      <label htmlFor={name} className="form-label">
        {labelText || name}
      </label>
      <div className="password-input-wrapper">
        {type !== "search" ? (
          <input
            type={type === "password" && !passwordVisible ? "password" : "text"}
            name={name}
            id={name}
            className="form-input"
            value={inputValue}
            onChange={handleInputChange}
            required
          />
        ) : (
          <input
            type={type === "password" && !passwordVisible ? "password" : "text"}
            name={name}
            id={name}
            className="form-input"
            value={inputValue}
            onChange={handleInputChange}
          />
        )}

        {type === "password" ? (
          <button
            type="button"
            className="password-toggle-button"
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? (
              <AiOutlineEyeInvisible size={25} />
            ) : (
              <AiOutlineEye size={25} />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default FormRow;
