import { Link, useLocation } from 'react-router-dom';
import { OrganizationSelector } from './common/OrganizationSelector';
import { Container } from '@chakra-ui/react';
import useAuthStore from '@/store/authStore';
import RBAC from './RBAC';
import { ROLES } from '../constants/roles';

const NavbarTwo = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav className="bg-white border-b py-3">
      <Container fluid className='flex justify-between items-center'>
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-8">
            <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link 
                to="/home/organizations" 
                className={`text-sm hover:text-neutral-700 ${
                  location.pathname === "/home/organizations" 
                    ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-400'
                }`}
              >
                Organizations
              </Link>
            </RBAC>

            <RBAC roles={[ROLES.AREA_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link 
                to="/home/areas" 
                className={`text-sm hover:text-neutral-700 ${
                  location.pathname === "/home/areas" 
                    ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-400'
                }`}
              >
                Areas
              </Link>
            </RBAC>

            <RBAC roles={[ROLES.DEPOT_ADMIN, ROLES.AREA_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link 
                to="/home/depots" 
                className={`text-sm hover:text-neutral-700 ${
                  location.pathname === "/home/depots" 
                    ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-400'
                }`}
              >
                Depots
              </Link>
            </RBAC>

            <Link 
              to="/home/routes" 
              className={`text-sm hover:text-neutral-700 ${
                location.pathname === "/home/routes" 
                  ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg border-stone-200' 
                  : 'text-neutral-400'
              }`}
            >
              Routes
            </Link>

            <RBAC roles={[ROLES.MASTER]}>
              <Link 
                to="/home/roles" 
                className={`text-sm hover:text-neutral-700 ${
                  location.pathname === "/home/roles" 
                    ? 'text-stone-900 font-bold bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-400'
                }`}
              >
                Roles
              </Link>
            </RBAC>

            <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
              <Link 
                to="/home/users" 
                className={`text-sm hover:text-neutral-700 ${
                  location.pathname === "/home/users" 
                    ? 'text-stone-900 font-semibold bg-stone-1000 rounded-lg border-stone-200' 
                    : 'text-neutral-400'
                }`}
              >
                Users
              </Link>
            </RBAC>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <OrganizationSelector />
        </div>
      </Container>
    </nav>
  );
};

export default NavbarTwo;
