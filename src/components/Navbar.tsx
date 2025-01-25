import { Link, useLocation } from 'react-router-dom';
import { OrganizationSelector } from './common/OrganizationSelector';
import { Container } from '@chakra-ui/react';

const Navbar = () => {

  const location = useLocation();

  return (
    <nav className="bg-white  border-b px-4 py-2">

      <Container maxW={'6xl'} className='flex  justify-between items-center'>
        <Link to="/" className="text-xl gap-2 items-center flex font-bold">
              <img className='size-16' src="https://raw.githubusercontent.com/RFCHH/pis-frontend/refs/heads/main/src/Assests/Navitronix.png?token=GHSAT0AAAAAAC2DPAWM5TZFDVR67PBMCMOOZ4U7DEA" alt="" srcset="" />
              Navitronix
            </Link>
        <div className="flex items-center space-x-6">
           
            <div className="flex items-center gap-4">
              <Link to="/organizations" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/organizations" ? 'text-indigo-900 font-semibold bg-indigo-50 rounded-lg px-2.5 py-1.5 border border-indigo-200' : 'text-neutral-400'}`}>
                Organizations
              </Link>
              <Link to="/areas" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/areas" ? 'text-indigo-900 font-semibold bg-indigo-50 rounded-lg px-2.5 py-1.5 border border-indigo-200' : 'text-neutral-400'}`}>
                Areas
              </Link>
              <Link to="/depots" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/depots" ? 'text-indigo-900 font-semibold bg-indigo-50 rounded-lg px-2.5 py-1.5 border border-indigo-200' : 'text-neutral-400'}`}>
                Depots
              </Link>
              <Link to="/routes" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/routes" ? 'text-indigo-900 font-semibold bg-indigo-50 rounded-lg px-2.5 py-1.5 border border-indigo-200' : 'text-neutral-400'}`}>
                Routes
              </Link>
              <Link to="/roles" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/roles" ? 'text-indigo-900 font-semibold bg-indigo-50 rounded-lg px-2.5 py-1.5 border border-indigo-200' : 'text-neutral-400'}`}>
                Roles
              </Link>
              <Link to="/users" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/users" ? 'text-indigo-900 font-semibold bg-indigo-50 rounded-lg px-2.5 py-1.5 border border-indigo-200 ' : 'text-neutral-400'}`}>
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
