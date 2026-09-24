import { ILoggedUser, IUser } from "@/types/IUser";
import { ROLES } from "@/constants/roles";

export type CustomerTier = "super_admin" | "regular" | "stu";

/**
 * Checks if the logged in user is Navitronix Super Admin ('master' or 'super_admin').
 */
export function isSuperAdmin(user: ILoggedUser | IUser | null | undefined): boolean {
  if (!user) return false;
  const roleName = (user as any).role?.name?.toLowerCase() || "";
  return roleName === "master" || roleName === "super_admin";
}

/**
 * Checks if the user is a Regular Customer (independent body builder, freelancer).
 * A regular customer does not belong to an STU organization, has no regions, and has no depots.
 */
export function isRegularCustomer(user: ILoggedUser | IUser | null | undefined): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return false;

  // Explicit customer type
  if ((user as any).customer_type === "regular") return true;
  if ((user as any).organization?.customer_type === "regular") return true;

  // If role is explicitly 'user'
  const roleName = (user as any).role?.name?.toLowerCase() || "";
  if (roleName === "guest") return false;
  if (roleName === "user") return true;

  // If user has no organization assigned
  if (!user.organization_id) return true;

  return false;
}

/**
 * Checks if the user is an STU Customer (organized business: State Transport Undertaking or private bus operator).
 * STU customers have a mandatory organization, and manage a hierarchy of regions, depots, and staff users.
 */
export function isSTUCustomer(user: ILoggedUser | IUser | null | undefined): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return false;
  if (isRegularCustomer(user)) return false;

  const roleName = (user as any).role?.name?.toLowerCase() || "";
  if (["organization_admin", "depot_admin", "region_admin"].includes(roleName)) {
    return true;
  }

  return Boolean(user.organization_id);
}

/**
 * Resolves the primary customer tier of the user.
 */
export function getCustomerTier(user: ILoggedUser | IUser | null | undefined): CustomerTier {
  if (isSuperAdmin(user)) return "super_admin";
  if (isRegularCustomer(user)) return "regular";
  return "stu";
}

/**
 * Resolves the default landing route for a logged-in user.
 * Only roles with assigned access to the dashboard page navigate to '/home/dashboard'.
 * Roles without dashboard access are navigated to their respective primary route.
 */
export function getDefaultRouteForUser(currentUser: any): string {
  if (!currentUser) return "/login";
  if (isSuperAdmin(currentUser)) return "/home/organizations";
  if (isRegularCustomer(currentUser)) return "/home/regular-routes";
  const role = currentUser.role?.name?.toLowerCase();
  switch (role) {
    case ROLES.ORGANIZATION_ADMIN:
    case ROLES.REGION_ADMIN:
      return "/home/dashboard";
    case ROLES.GUEST:
      return "/home/organizations";
    case ROLES.DEPOT_ADMIN:
      return "/home/routes";
    default:
      return "/home/routes";
  }
}
