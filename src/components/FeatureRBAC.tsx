import React from 'react';
import useLoggedUserStore from '@/store/useLoggedUserStore';
import { hasUserFeature } from '@/utils/featureFlags';

interface RBACProps {
  features: string[];
  children: React.ReactNode;
}

const FeatureRBAC: React.FC<RBACProps> = ({ features, children }) => {
  const user = useLoggedUserStore(state => state.user);

  const hasAccess = (() => {
    if (!user) return false;
    if (!features || features.length === 0) return true;

    return features.some((f) => hasUserFeature(user, f));
  })();

  return hasAccess ? <>{children}</> : null;
};

export default FeatureRBAC;
