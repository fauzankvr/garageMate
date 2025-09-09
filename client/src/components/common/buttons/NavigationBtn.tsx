import React from "react";
import { useNavigate } from "react-router-dom";

interface CardProps {
  title: string;
  description?: string;
  path: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, path, icon }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className="cursor-pointer bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition duration-300 ease-in-out w-full sm:w-64"
    >
      <div className="text-3xl mb-4 text-blue-600">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default Card;
