import { Link, useLocation } from 'react-router-dom';
import { OrganizationSelector } from './common/OrganizationSelector';
import { Container } from '@chakra-ui/react';

const Navbar = () => {

  const location = useLocation();

  return (
    <nav className="bg-white  border-b px-4 py-2">

      <Container maxW={'8xl'} className='flex  justify-between items-center'>
        <Link to="/" className="text-xl gap-2 items-center flex font-bold">
          <img className='size-16' src="/src/assets/Navitronix.png" alt="" srcSet="" />
          Navitronix
        </Link>
        <div className="flex items-center space-x-6">

          <div className="flex items-center gap-8">
            <Link to="/home/organizations" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/organizations" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg   border-stone-200' : 'text-neutral-400'}`}>
              Organizations
            </Link>
            <Link to="/home/areas" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/areas" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg   border-stone-200' : 'text-neutral-400'}`}>
              Areas
            </Link>
            <Link to="/home/depots" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/depots" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg   border-stone-200' : 'text-neutral-400'}`}>
              Depots
            </Link>
            <Link to="/home/routes" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/routes" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg   border-stone-200' : 'text-neutral-400'}`}>
              Routes
            </Link>
            <Link to="/home/roles" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/roles" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg   border-stone-200' : 'text-neutral-400'}`}>
              Roles
            </Link>
            <Link to="/home/users" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/users" ? 'text-stone-900 font-semibold bg-stone-1000 rounded-lg   border-stone-200 ' : 'text-neutral-400'}`}>
              Users
            </Link>


            {/* <Link to="/settings" className="text-sm text-neutral-1000 hover:text-neutral-700">
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
