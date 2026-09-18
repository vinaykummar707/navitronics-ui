import React from 'react';
import useLoggedUserStore from '@/store/useLoggedUserStore';
import { hasUserFeature } from '@/utils/featureFlags';
import { isRegularCustomer, isSuperAdmin } from '@/utils/customerType';
import { ROLES } from '@/constants/roles';

interface RBACProps {
  roles: string[];
  features: string[];
  children: React.ReactNode;
}

const RBACPage: React.FC<RBACProps> = ({ roles, features, children }) => {
  const user = useLoggedUserStore(state => state.user);
  const userRole = user?.role?.name?.toLowerCase();
  const lowerRoles = roles.map(r => r.toLowerCase());

  const isSuper = isSuperAdmin(user);
  const isRegular = isRegularCustomer(user);

  let hasAccess = false;
  if (roles.length === 0) {
    hasAccess = true;
  } else if (isSuper && lowerRoles.includes(ROLES.MASTER)) {
    hasAccess = true;
  } else if (isRegular && (lowerRoles.includes(ROLES.USER) || lowerRoles.includes("regular"))) {
    hasAccess = true;
  } else if (userRole && lowerRoles.includes(userRole)) {
    hasAccess = true;
  }

  const hasFeatureAccess = useLoggedUserStore(state => {
    if (!state.user) return false;
    if (!features || features.length === 0) return true;

    return features.some((f) => hasUserFeature(state.user, f));
  });

  return hasAccess && hasFeatureAccess ? <>{children}</> : (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
        <h2 className="text-heading-2 font-heading-2 text-default-font">Access Denied</h2>
        <p className="text-body font-body text-subtext-color">You do not have permission to view this content.</p>
      </div>
    </div>
  );
};

export default RBACPage;
