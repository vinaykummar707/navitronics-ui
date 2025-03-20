import { Link, Location, useLocation } from 'react-router-dom';
import { OrganizationSelector } from './common/OrganizationSelector';
import { Container } from '@chakra-ui/react';
import useAuthStore from '@/store/authStore';
import RBAC from './RBAC';
import { ROLES } from '../constants/roles';

const NavbarTwo = () => {
  const location: Location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav className="bg-white border-b py-3">
      <Container fluid className='flex justify-between items-center'>
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-6">
            <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link
                to="/home/organizations"
                className={`text-sm  ${
                  location.pathname === "/home/organizations" 
                    ? 'bg-nav_blue-600 text-white py-1.5 px-4 bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-900'
                }`}
              >
                Organizations
              </Link>
            </RBAC>

            <RBAC roles={[ROLES.AREA_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link
                to="/home/areas"
                className={`text-sm  ${
                  location.pathname === "/home/areas" 
                    ? 'bg-nav_blue-600 text-white py-1.5 px-4 bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-900'
                }`}
              >
                Areas
              </Link>
            </RBAC>

            <RBAC roles={[ROLES.DEPOT_ADMIN, ROLES.AREA_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link
                to="/home/depots"
                className={`text-sm  ${
                  location.pathname === "/home/depots" 
                    ? 'bg-nav_blue-600 text-white py-1.5 px-4 bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-900'
                }`}
              >
                Depots
              </Link>
            </RBAC>

            <Link
              to="/home/routes"
              className={`text-sm    ${
                (location.pathname.includes("route") ) 
                  ? ' bg-nav_blue-600 text-white py-1.5 px-4 bg-stone-1000 rounded-lg border-stone-200' 
                  : 'text-neutral-900'
              }`}
            >
              Routes
            </Link>

            <RBAC roles={[ROLES.MASTER]}>
              <Link
                to="/home/roles"
                className={`text-sm  ${
                  location.pathname === "/home/roles" 
                    ? 'bg-nav_blue-600 text-white py-1.5 px-4 bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-900'
                }`}
              >
                Roles
              </Link>
            </RBAC>

            <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link
                to="/home/users"
                className={`text-sm  ${
                  location.pathname === "/home/users" 
                    ? 'bg-nav_blue-600 text-white py-1.5 px-4 bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-900'
                }`}
              >
                Users
              </Link>
            </RBAC>

            <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link
                to="/home/fonts"
                className={`text-sm  ${
                  location.pathname === "/home/fonts" 
                    ? 'bg-nav_blue-600 text-white py-1.5 px-4 bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-900'
                }`}
              >
                Fonts
              </Link>
            </RBAC>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className='text-gray-500 text-sm'>Selected Organization</span>
          <OrganizationSelector />
        </div>
      </Container>
    </nav>
  );
};

export default NavbarTwo;
