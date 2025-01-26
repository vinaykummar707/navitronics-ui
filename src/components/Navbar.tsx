import { Link, useLocation, useNavigate } from 'react-router-dom';
import { OrganizationSelector } from './common/OrganizationSelector';
import { Container } from '@chakra-ui/react';
import useAuthStore from '@/store/authStore';

const Navbar = () => {

  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate()

  const accessControl = {
    organizations: ['organization_admin', 'master'],
    users: ['organization_admin', 'master'],
    roles: ['organization_admin', 'master'],
    areas: ['area_admin', 'organization_admin', 'master'],
    depots: ['depot_admin', 'area_admin', 'organization_admin', 'master'],
  };

  const canAccess = (route) => {
    return accessControl[route]?.includes(user.userRole);
  };

  return (
    <nav className="bg-white  border-b  ">

      <Container fluid className='flex  justify-between items-center'>
        <Link to="/" className="text-xl gap-2 items-center flex font-bold">
          <img className='size-16' src="/assets/Navitronix.png" alt="" srcSet="" />
          Navitronix
        </Link>
        {/* <div className="flex items-center space-x-6">

          <div className="flex items-center gap-8">
            {canAccess('organizations') && (
              <Link to="/home/organizations" className={`text-sm hover:text-neutral-700 ${location.pathname === "/home/organizations" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg border-stone-200' : 'text-neutral-400'}`}>
                Organizations
              </Link>
            )}
            {canAccess('areas') && (
              <Link to="/home/areas" className={`text-sm hover:text-neutral-700 ${location.pathname === "/home/areas" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg border-stone-200' : 'text-neutral-400'}`}>
                Areas
              </Link>
            )}
            {canAccess('depots') && (
              <Link to="/home/depots" className={`text-sm hover:text-neutral-700 ${location.pathname === "/home/depots" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg border-stone-200' : 'text-neutral-400'}`}>
                Depots
              </Link>
            )}
            <Link to="/home/routes" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/routes" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg   border-stone-200' : 'text-neutral-400'}`}>
              Routes
            </Link>
            {canAccess('roles') && (
            <Link to="/home/roles" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/roles" ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg   border-stone-200' : 'text-neutral-400'}`}>
              Roles
            </Link>
              )}
            {canAccess('users') && (
              <Link to="/home/users" className={`text-sm  hover:text-neutral-700 ${location.pathname === "/home/users" ? 'text-stone-900 font-semibold bg-stone-1000 rounded-lg   border-stone-200 ' : 'text-neutral-400'}`}>
                Users
              </Link>
            )}

            {/* <Link to="/settings" className="text-sm text-neutral-1000 hover:text-neutral-700">
                Settings
              </Link> 
          </div>
        </div> */}

        <div className="flex items-center space-x-2">
          {/* <OrganizationSelector /> */}
          <button
            className="border-neutral-200 bg-neutral-100 border rounded-md flex flex-col px-3 py-2 text-sm "
          >
            <span>{user.userName} - {user.userRole}</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login')
            }}
            className="bg-red-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </Container>


    </nav>
  );
};

export default Navbar;
