import React from 'react';
import useLoggedUserStore from '@/store/useLoggedUserStore';
import { hasUserFeature } from '@/utils/featureFlags';

interface RBACProps {
  roles: string[];
  features: string[];
  children: React.ReactNode;
}

const RBAC: React.FC<RBACProps> = ({ roles, features, children }) => {
  const user = useLoggedUserStore(state => state.user);
  const userRole = user?.role?.name;
  const hasAccess = userRole ? (roles.length === 0 || roles.includes(userRole)) : false;

  const hasFeatureAccess = useLoggedUserStore(state => {
    if (!state.user) return false;
    if (!features || features.length === 0) return true;

    return features.some((f) => hasUserFeature(state.user, f));
  });

  return hasAccess && hasFeatureAccess ? <>{children}</> : null;
};

export default RBAC;
