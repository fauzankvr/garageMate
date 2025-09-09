import Dashboard from "../components/ui/Dashboard";

const Home = () => {
  return (
    <div className="mx-8 sm:mx-16 xl:mx-24 relative">
      <div className="text-center mt-20 mb-8">
        <div className="inline-flex items-center justify-center gap-4 px-6 py-1.5 mb-4 border border-blue-500/20 rounded-full text-sm">
          <p>Welcome to your Garage mate</p>
        </div>
        <h1 className="text-3xl sm:text-6xl font-semibold sm:leading-[4.5rem] text-gray-700">
          Your own <span className="text-blue-600">billing</span>
          <br /> platform.
        </h1>
        <p className="my-6 sm:my-8 max-w-2xl mx-auto text-neutral-600 max-sm:text-xs">
          This is your space to think out loud, to share what matters, and to
          write without filters. Whether it's one word or a thousand, your story
          starts right here.
        </p>
      </div>
      <Dashboard/>
    </div>
  );
};

export default Home;
