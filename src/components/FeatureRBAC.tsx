import React from 'react';
import useAuthStore from '../store/authStore';
import { FeatherShieldQuestion } from '@subframe/core';

interface RBACProps {
  features: string[];
  children: React.ReactNode;
}

const FeatureRBAC: React.FC<RBACProps> = ({ features, children }) => {
  const userOrganization = useAuthStore(state => state.user.organization);
  const hasAccess = userOrganization ? features.every(f => userOrganization[f]) : false;

  

return hasAccess ? <>{children}</> : null;
};

export default FeatureRBAC;
