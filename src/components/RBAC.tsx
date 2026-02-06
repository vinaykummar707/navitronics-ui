import React from 'react';
import useAuthStore from '../store/authStore';
import { FeatherShieldQuestion } from '@subframe/core';

interface RBACProps {
  roles: string[];
  features: string[];
  children: React.ReactNode;
}

const RBAC: React.FC<RBACProps> = ({ roles, features, children }) => {
  const userRole = useAuthStore(state => state.user?.userRole);
  const hasAccess = userRole ? roles.includes(userRole) : false;
  const hasFeatureAccess = useAuthStore(state => {
    const userOrganization = state.user?.organization;
    return features ? features.every(f => userOrganization[f]) : userRole === 'master' ? true : false; // If no features specified, allow access for master role
  });

  return hasAccess && hasFeatureAccess ? <>{children}</> : <>
    {/* <div className="w-full h-full bg-background">
      <div className="flex h-full w-full flex-col items-center justify-center gap-">
        <h2 className="text-heading-2 font-heading-2 text-default-font">Access Denied</h2>
        <p className="text-body font-body text-subtext-color">You do not have permission to view this content.</p>
      </div>
    </div> */}
  </>;
};

export default RBAC;
