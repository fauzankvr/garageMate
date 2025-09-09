import { assets } from '../../../assets/assets';

const AuthHeader = () => {
  return (
    <header className="flex items-center px-5 h-12 shadow-sm bg-white">
      <img src={assets.logo} alt="Logo" className="h-7 w-auto ml-5" />
    </header>
  );
};

export default  AuthHeader
