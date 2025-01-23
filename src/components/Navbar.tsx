import { Link } from 'react-router-dom';
import { OrganizationSelector } from './common/OrganizationSelector';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold">
              Navitronics
            </Link>
            <div className="flex gap-4">
              <Link to="/organizations" className="hover:text-gray-300 transition-colors">
                Organizations
              </Link>
              <Link to="/areas" className="hover:text-gray-300 transition-colors">
                Areas
              </Link>
              <Link to="/depots" className="hover:text-gray-300 transition-colors">
                Depots
              </Link>
              <Link to="/users" className="hover:text-gray-300 transition-colors">
                Users
              </Link>
              <Link to="/roles" className="hover:text-gray-300 transition-colors">
                Roles
              </Link>
              <Link to="/routes" className="hover:text-gray-300 transition-colors">
                Routes
              </Link>
              <Link to="/settings" className="hover:text-gray-300 transition-colors">
                Settings
              </Link>
            </div>
          </div>
          <OrganizationSelector />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
