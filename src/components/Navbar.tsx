import { Link, useLocation } from 'react-router-dom';
import { OrganizationSelector } from './common/OrganizationSelector';
import { Container } from '@chakra-ui/react';

const Navbar = () => {

  const location = useLocation();

  return (
    <nav className="bg-white  border-b px-4 py-3">

      <Container maxW={'6xl'} className='flex  justify-between items-center'>
      <Link to="/" className="text-lg">
              Navitronics
            </Link>
        <div className="flex items-center space-x-6">
           
            <div className="flex gap-6">
              <Link to="/organizations" className={`text-sm text-neutral-400 hover:text-neutral-700 ${location.pathname === "/organizations" ? 'text-blue-500 font-medium' : ''}`}>
                Organizations
              </Link>
              <Link to="/areas" className="text-sm text-neutral-400 hover:text-neutral-700">
                Areas
              </Link>
              <Link to="/depots" className="text-sm text-neutral-400 hover:text-neutral-700">
                Depots
              </Link>
              <Link to="/routes" className="text-sm text-neutral-400 hover:text-neutral-700">
                Routes
              </Link>
              <Link to="/roles" className="text-sm text-neutral-400 hover:text-neutral-700">
                Roles
              </Link>
              <Link to="/users" className="text-sm text-neutral-400 hover:text-neutral-700">
                Users
              </Link>
            
           
              {/* <Link to="/settings" className="text-sm text-neutral-500 hover:text-neutral-700">
                Settings
              </Link> */}
            </div>
          </div>

        <div className="flex items-center space-x-4">
            <OrganizationSelector />
          </div>
      </Container>
        
       
    </nav>
  );
};

export default Navbar;
