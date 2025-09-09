
import AuthHeader from '../../components/layout/headers/AuthHeader';
import InputField from '../../components/common/input/input';
import useAuthLogin from '../../hooks/AuthLogin';

const Login = () => {
  const { handleInputChange, handleSubmit, fields } = useAuthLogin();

  return (
    <div>

         <AuthHeader/>
        <div className="flex w-full h-screen justify-center items-center px-4 bg-gray-50">
       
      <div className="w-full md:w-1/3 flex flex-col justify-center items-center">
        {/* Title */}
        <h1 className="font-semibold text-2xl mb-6 text-gray-800">Welcome back</h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          {/* Dynamic Input Fields */}
          {fields.map((field, index) => (
            <InputField
              key={field.name}
              label={field.label}
              placeholder={field.placeholder}
              name={field.name}
              type={field.type}
              value={field.value}
              onChange={(e) => handleInputChange(index, e)}
              className="mb-4 w-full"
            />
          ))}

          {/* Login Button */}
          <button
            type="submit"
            className="flex items-center justify-center bg-blue-100 text-gray-800 font-medium w-full py-3 rounded-full hover:bg-blue-200 transition"
          >
            Login
          </button>

          {/* Signup Link */}
          <p className="text-gray-500 text-sm mt-4">
            Don’t have an account?{' '}
            <a href="/signup" className="text-blue-500 font-medium hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
