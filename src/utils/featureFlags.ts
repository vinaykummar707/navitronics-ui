import { ILoggedUser } from "@/types/IUser";

/**
 * Checks if a user has access to a specific feature flag.
 * Evaluates in order:
 * 1. Super Admin ('master') -> always has access
 * 2. User-level flag (if explicitly set)
 * 3. Organization-level flag (if explicitly set)
 * 4. Feature-specific default fallback:
 *    - 'v2_routes' defaults to true (standard modern routes)
 *    - 'v1_routes' defaults to false (legacy format)
 *    - other features default to false
 */
export function hasUserFeature(
  user: ILoggedUser | null | undefined,
  feature: string
): boolean {
  if (!user) return false;
  if (user.role?.name === "master") return true;

  const userObj = user as any;
  const userOrg = user.organization as any;

  // 1. Explicit user-level flag
  if (userObj && userObj[feature] !== undefined && userObj[feature] !== null) {
    return Boolean(userObj[feature]);
  }

  // 2. Explicit organization-level flag
  if (userOrg && userOrg[feature] !== undefined && userOrg[feature] !== null) {
    return Boolean(userOrg[feature]);
  }

  // 3. Sensible defaults
  if (feature === "v2_routes") {
    return true;
  }
  if (feature === "v1_routes") {
    return false;
  }

  return false;
}

/**
 * Returns an object containing the user's route capabilities:
 * - hasV1Routes: can create/export V1 routes
 * - hasV2Routes: can create/export V2 routes
 * - isDualUser: can create/export both V1 and V2 routes
 * - isV1Only: can ONLY create/export V1 routes
 * - isV2Only: can ONLY create/export V2 routes
 */
export function getUserRouteAccess(user: ILoggedUser | null | undefined) {
  const hasV1 = hasUserFeature(user, "v1_routes");
  const hasV2 = hasUserFeature(user, "v2_routes");

  return {
    hasV1Routes: hasV1,
    hasV2Routes: hasV2,
    isDualUser: hasV1 && hasV2,
    isV1Only: hasV1 && !hasV2,
    isV2Only: hasV2 && !hasV1,
  };
}
