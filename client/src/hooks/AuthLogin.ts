import { useState } from "react";
import { type ChangeEvent, type FormEvent } from "react"; // Use type-only imports
import axiosInstance from "../axios/axios";

interface Field {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  value: string;
  error?: string;
}

const useAuthLogin = () => {
  const [fields, setFields] = useState<Field[]>([
    {
      name: "password",
      label: "Password",
      placeholder: "Enter your password",
      type: "password",
      value: "",
      error: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateField = (field: Field): string => {
    if (!field.value.trim()) {
      return `${field.label} is required`;
    }
    return "";
  };

  const handleInputChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newFields = [...fields];
    newFields[index] = {
      ...newFields[index],
      value: event.target.value,
      error: "",
    };
    setFields(newFields);
    setError(null); // Clear API error on input change
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Client-side validation
    const newFields = fields.map((field) => ({
      ...field,
      error: validateField(field),
    }));
    setFields(newFields);

    if (newFields.some((field) => field.error)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        password: fields[0].value,
      });
      if (response.data.success) {
        // Handle successful login (e.g., redirect, store token, etc.)
        console.log("Login successful");
        localStorage.setItem("token", response.data);
        window.location.href = '/dashboard';
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { handleInputChange, handleSubmit, fields, loading, error };
};

export default useAuthLogin;
