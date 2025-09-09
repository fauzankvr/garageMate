
import RegisterHeader from "../../components/layout/headers/AuthHeader";
import InputField from "../../components/common/input/input";
import useAuthRegister from "../../hooks/AuthRegister";
import { assets } from "../../assets/assets";

const Register = () => {
  const { fields, handleSubmit, handleInputChange } = useAuthRegister();
  // const [image, setImage] = useState<File | null>(null);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <RegisterHeader />

      <section className="flex justify-center items-start w-full py-10">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-8 w-full max-w-5xl grid grid-cols-2 gap-6"
        >
          {/* Dynamic Fields */}
          {fields.slice(0, 2).map((field, index) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={field.value}
              placeholder={field.placeholder}
              onChange={(e) => handleInputChange(index, e)}
              className="w-full"
            />
          ))}
          {fields.slice(2, 3).map((field, index) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={field.value}
              placeholder={field.placeholder}

              onChange={(e) => handleInputChange(index + 2, e)}
              className="w-full"
            />
          ))}
          {/* Remaining Input Fields */}
          {fields.slice(3).map((field, index) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={field.value}
              placeholder={field.placeholder}

              onChange={(e) => handleInputChange(index + 3, e)}
              className="w-full"
            />
          ))}

          {/* Logo Upload */}
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            {/* <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full overflow-hidden">
              <label
                htmlFor="image"
                className="cursor-pointer w-full h-full flex items-center justify-center text-blue-400 text-sm font-medium"
              >
                Upload Logo
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div> */}

<div className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full overflow-hidden">
  <img
    src={assets.profile_img} // <-- Replace with your actual image path
    alt="Logo"
    className="w-full h-full object-cover"
  />
</div>


          </div>

          {/* Submit Button */}
          <div className="col-span-2 flex justify-center">
            <button
              type="submit"
              className="bg-black hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition"
            >
              Register
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Register;
