import { useState } from "react";

const useAuthRegister = () => {
  const [fields, setFields] = useState([
    { name: "name", label: "Name", type: "text", placeholder: "e.g. AutoCentral", value: "" },
    { name: "reg_name", label: "Registered Name", type: "text", placeholder: "e.g. AutoCentral Inc.", value: "" },
    { name: "email", label: "Email", type: "email", placeholder: "e.g. example@gmail.com", value: "" },
    { name: "phone_number", label: "Phone Number", type: "text", placeholder: "e.g. +91 76126 78694", value: "" },
    { name: "user_name", label: "Registered Username", type: "text", placeholder: "e.g. autoCentral_user", value: "" },
    { name: "password", label: "Password", type: "password", placeholder: "Enter your password", value: "" },
    { name: "address", label: "Address", type: "text", placeholder: "e.g. 123 Main Street, Anytown", value: "" },

  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", fields);
    // Here you can handle API request
  };

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    
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

export default useAuthRegister;
