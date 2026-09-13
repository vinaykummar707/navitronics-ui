export const ROLES = {
  MASTER: 'master',
  SUPER_ADMIN: 'master',
  ORGANIZATION_ADMIN: 'organization_admin',
  AREA_ADMIN: 'area_admin',
  REGION_ADMIN: 'region_admin',
  DEPOT_ADMIN: 'depot_admin',
  USER: 'user',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  master: 'Super Admin',
  super_admin: 'Super Admin',
  organization_admin: 'Organization Admin',
  area_admin: 'Area Admin',
  region_admin: 'Region Admin',
  depot_admin: 'Depot Admin',
  user: 'User',
};

export const getRoleLabel = (roleName?: string | null): string => {
  if (!roleName) return '—';
  if (ROLE_LABELS[roleName]) return ROLE_LABELS[roleName];
  if (roleName.toLowerCase() === 'master') return 'Super Admin';
  return roleName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

