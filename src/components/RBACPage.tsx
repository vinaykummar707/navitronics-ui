import React from 'react';
import useAuthStore from '../store/authStore';
import { FeatherShieldQuestion } from '@subframe/core';
import useLoggedUserStore from '@/store/useLoggedUserStore';

interface RBACProps {
  roles: string[];
  features: string[];
  children: React.ReactNode;

}

const RBACPage: React.FC<RBACProps> = ({ roles, features, children }) => {
  const user = useLoggedUserStore(state => state.user);
  const userRole = user?.role?.name;
  const hasAccess = userRole ? (roles.length === 0 || roles.includes(userRole)) : false;

  const hasFeatureAccess = useLoggedUserStore(state => {
    if (!state.user) return false;
    if (state.user.role?.name === 'master') return true;
    if (!features || features.length === 0) return true;

    const userObj = state.user as any;
    const userOrg = state.user.organization as any;

    return features.some((f) => {
      if (userObj && userObj[f] !== undefined && userObj[f] !== null) {
        return Boolean(userObj[f]);
      }
      return userOrg ? Boolean(userOrg[f]) : false;
    });
  });




  return hasAccess && hasFeatureAccess ? <>{children}</> : <>
    <div className="w-full h-full bg-background">
      <div className="flex h-full w-full flex-col items-center justify-center gap-">
        <h2 className="text-heading-2 font-heading-2 text-default-font">Access Denied</h2>
        <p className="text-body font-body text-subtext-color">You do not have permission to view this content.</p>
      </div>
    </div>
  </>;
};

export default RBACPage;
