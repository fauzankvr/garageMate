
import { Link } from "react-router-dom";
import { navLinks } from "./HeaderData";
import UserActions from "./UserActions";

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm border-b px-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left - Logo */}
        <div className="text-xl font-bold">DetailerPro</div>

        <div className="flex items-center gap-5">
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="text-gray-700 hover:text-blue-500 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right - Notifications & Profile */}
          <UserActions/>
        </div>
      </div>
    </header>
  );
};

export default Header;
