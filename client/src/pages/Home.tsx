
import { FiArrowRight } from "react-icons/fi"; // Importing an arrow icon for the button
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };
  return (
    // Added a subtle background gradient for more visual depth
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-8 sm:mx-16 xl:mx-24 relative z-10">
        <div className="text-center mt-20 mb-8">
          {/* --- UPDATED BADGE --- */}
          {/* Made the text more specific to the business */}
          <div className="inline-flex items-center justify-center gap-2 px-6 py-1.5 mb-4 bg-white border border-blue-500/20 rounded-full text-sm shadow-sm">
            <p>Ozon Detailing Solutions</p>
          </div>

          {/* --- ENHANCED HEADLINE --- */}
          {/* Changed the text to be about car care, not "billing" */}
          <h1 className="text-4xl sm:text-6xl font-bold sm:leading-[4.5rem] text-gray-800">
            The Ultimate Shine
            <br /> for Your <span className="text-blue-600">Ride</span>.
          </h1>

          {/* --- REVISED DESCRIPTION --- */}
          {/* The description now explains what the business does */}
          <p className="my-6 sm:my-8 max-w-2xl mx-auto text-neutral-600 max-sm:text-sm">
            From showroom-quality detailing to routine washes and premium
            products, manage all your car care needs from one convenient
            dashboard.
          </p>

          {/* --- NEW BUTTON (CALL TO ACTION) --- */}
          {/* Added a flex container to center the button */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handleClick}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
            >
              <span>Go to Dashboard</span>
              <FiArrowRight className="text-lg" />
            </button>
          </div>
        </div>
      </div>
      {/* --- Optional: Added a decorative background element for more flair --- */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-5"
        style={{ backgroundImage: "url('/car-pattern.svg')" }} // Example: you would need to create this SVG pattern
      ></div>
    </div>
  );
};

export default Home;
