import { useState } from "react";
import instance from "../axios/axios";


const CreateVehicle = () => {
  const [vehicle, setVehicle] = useState({
    costumerId: "",
    model: "",
    brand: "",
    year: "",
    registration_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await instance.post("/vehicle", vehicle);
      setMessage("Vehicle created successfully!");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to create vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Create Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="costumerId"
          placeholder="Customer ID"
          value={vehicle.costumerId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="model"
          placeholder="Model"
          value={vehicle.model}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="brand"
          placeholder="Brand"
          value={vehicle.brand}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="year"
          placeholder="Year"
          value={vehicle.year}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="registration_number"
          placeholder="Registration Number"
          value={vehicle.registration_number}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Creating..." : "Create Vehicle"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default CreateVehicle;
