import React from "react";
interface InputFieldProps {
  label?: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}
const InputField : React.FC<InputFieldProps> = ({  label,  type = "text",  name,  value,  onChange,  placeholder,  error,  className = "",}) => {
  return (
    <div className={`w-5/6 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-400">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 p-2 w-full  bg-gray-50 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputField;