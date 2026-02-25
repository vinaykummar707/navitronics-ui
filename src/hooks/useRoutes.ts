import { routeCrud, IRoute } from "@/types/IRoute";
import { toast } from "react-toastify";

export function useRoutes(depotId?: string) {
  const { useList, useDelete, useCreate } = routeCrud;
  const {
    data: routesData,
    refetch: refetchRoutes
  } = useList({
    filters: { depot_id: depotId || "", deleted: false },
    orderBy: { column: "created_at", ascending: false },
    skip: !depotId
  });

  const routes = routesData?.data as IRoute[];

  const { mutate: deleteRoute } = useDelete();
  const { mutate: createRoute } = useCreate();

  const handleEditRoute = (routeId: string) => {
    // navigate logic (assuming from usage context)
  };

  const handleDeleteRoute = (routeId: string) => {
    deleteRoute(routeId, {
      onSuccess: () => {
        toast.success("Route deleted successfully");
        refetchRoutes();
      },
      onError: (error) => {
        toast.error(`Error deleting route: ${error.message || "Unknown error"}`);
      },
    });
  };

  const duplicateRoute = (originalRoute: IRoute, routeNumberSuffix: string) => {
    const newRoute = { ...originalRoute, route_number: `${originalRoute.route_number}${routeNumberSuffix}` };
    // Remove id for duplication
    delete newRoute.id;
    createRoute(newRoute, {
      onSuccess: () => {
        toast.success("Route duplicated successfully");
        refetchRoutes();
      },
      onError: (error) => {
        toast.error(`Error duplicating route: ${error.message || "Unknown error"}`);
      },
    });
  };

  return { routes, refetchRoutes, handleEditRoute, handleDeleteRoute, duplicateRoute };
}