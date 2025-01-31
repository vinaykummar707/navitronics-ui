import React from 'react';
import useAuthStore from '../store/authStore';

interface RBACProps {
  roles: string[];
  children: React.ReactNode;
}

const RBAC: React.FC<RBACProps> = ({ roles, children }) => {
  const userRole = useAuthStore(state => state.user?.userRole);
  const hasAccess = userRole ? roles.includes(userRole) : false;

  return hasAccess ? <>{children}</> : null;
};

export default RBAC;
