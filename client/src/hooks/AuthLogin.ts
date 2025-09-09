import { useState } from "react";

const useAuthLogin = () => {
  const [fields, setFields] = useState([
    {
      name: "phone_number",
      label: "Phone Number",
      type: "text",
      placeholder: "e.g. +91 76126 78694",
      value: "",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
      value: "",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", fields);
    // Here you can handle API request
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFields = [...fields];
    newFields[index].value = event.target.value;
    setFields(newFields);
  };

  return {
    fields,
    handleSubmit,
    handleInputChange,
  };
};

export default useAuthLogin;


