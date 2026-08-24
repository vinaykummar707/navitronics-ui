import useLoggedUserStore from '@/store/useLoggedUserStore';

interface RBACProps {
  features: string[];
  children: React.ReactNode;
}

const FeatureRBAC: React.FC<RBACProps> = ({ features, children }) => {
  const user = useLoggedUserStore(state => state.user);

  const hasAccess = (() => {
    if (!user) return false;
    if (user.role?.name === 'master') return true;
    if (!features || features.length === 0) return true;

    const userObj = user as any;
    const userOrg = user.organization as any;

    return features.some((f) => {
      if (userObj && userObj[f] !== undefined && userObj[f] !== null) {
        return Boolean(userObj[f]);
      }
      return userOrg ? Boolean(userOrg[f]) : false;
    });
  })();

  return hasAccess ? <>{children}</> : null;
};

export default FeatureRBAC;
