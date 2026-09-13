import React from 'react';
import { FeatherShieldQuestion } from '@subframe/core';
import useLoggedUserStore from '@/store/useLoggedUserStore';
import { hasUserFeature } from '@/utils/featureFlags';

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
    if (!features || features.length === 0) return true;

    return features.some((f) => hasUserFeature(state.user, f));
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
