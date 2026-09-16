import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RBACPage from "./components/RBACPage";
import { ROLES } from "./constants/roles";
import useLoggedUserStore from "./store/useLoggedUserStore";
import { LanguageConfigProvider } from "./context/LanguageConfigContext";
import { useTheme } from "next-themes";

// Lazy-loaded page components for route-level code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const OrganizationsPage = lazy(() => import("./pages/v2/OrganizationsPage"));
const AreasPage = lazy(() => import("./pages/v2/RegionsPage"));
const DepotsPage = lazy(() => import("./pages/v2/DepotsPage"));
const UsersPage = lazy(() => import("./pages/v2/UsersPage"));
const Roles = lazy(() => import("./pages/Roles"));
const LanguageModify = lazy(() => import("./components/LanguageModify"));
const RoutesPage = lazy(() => import("./pages/v2/RoutesPage"));
const StopsPage = lazy(() => import("./pages/v2/StopsPage"));
const Settings = lazy(() => import("./pages/Settings"));
const UtilityPage = lazy(() => import("./pages/v2/UtilityPage"));
const FontConfigurationPage = lazy(() => import("./pages/v2/FontConfigurationPage"));
const RouteCreatePage = lazy(() => import("./pages/v2/CreateRoutePage"));
const CreateRoutePageV1 = lazy(() => import("./pages/v1/CreateRoutePageV1"));
const UserLoginForm = lazy(() =>
  import("./ui/components/UserLoginForm").then((module) => ({
    default: module.UserLoginForm,
  }))
);

const PageLoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-default-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-800" />
      <span className="text-caption font-caption text-subtext-color">Loading...</span>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const protectedRoutes = [
  {
    path: "organizations",
    roles: [ROLES.MASTER],
    features: [],
    element: <OrganizationsPage />,
  },
  {
    path: "regions",
    roles: [ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER],
    features: ["PIS", "PAS", "ITMS"],
    element: <AreasPage />,
  },
  {
    path: "depots",
    roles: [
      ROLES.REGION_ADMIN,
      ROLES.ORGANIZATION_ADMIN,
      ROLES.MASTER,
    ],
    features: ["PIS", "PAS", "ITMS"],
    element: <DepotsPage />,
  },
  {
    path: "users",
    roles: [ROLES.MASTER],
    features: [],
    element: <UsersPage />,
  },
  {
    path: "roles",
    roles: [ROLES.MASTER],
    features: [],
    element: <Roles />,
  },
  {
    path: "fonts",
    roles: [ROLES.MASTER],
    features: [],
    element: <LanguageModify />,
  },
  { path: "routes", element: <RoutesPage />, features: ["PIS", "PAS", "ITMS"], roles: [ROLES.DEPOT_ADMIN, ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER] },
  { path: "stops", element: <StopsPage />, features: ["PAS", "ITMS"], roles: [ROLES.DEPOT_ADMIN, ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER] },
  { path: "settings", element: <Settings /> },
  { path: "utility", element: <UtilityPage /> },
  { path: "font-configuration", roles: [ROLES.MASTER], features: [], element: <FontConfigurationPage /> },
] as const;

function App() {
  const getDefaultRouteForRole = (role: string) => {
    switch (role) {
      case ROLES.MASTER:
        return "/home/organizations";
      case ROLES.ORGANIZATION_ADMIN:
        return "/home/regions";
      case ROLES.REGION_ADMIN:
        return "/home/depots";
      case ROLES.DEPOT_ADMIN:
        return "/home/routes";
      case ROLES.USER:
        return "/home/routes";
      default:
        return "/home";
    }
  };

  const user = useLoggedUserStore((state) => state.user);
  const { resolvedTheme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="routes/create/:areaId/:depotId"
              element={
                <ProtectedRoute>
                  <RBACPage
                    roles={[
                      ROLES.MASTER,
                      ROLES.ORGANIZATION_ADMIN,
                      ROLES.REGION_ADMIN,
                      ROLES.DEPOT_ADMIN,
                    ]}
                    features={["v2_routes"]}
                  >
                    <LanguageConfigProvider>
                      <RouteCreatePage />
                    </LanguageConfigProvider>
                  </RBACPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="routes/create-v1/:areaId/:depotId"
              element={
                <ProtectedRoute>
                  <RBACPage
                    roles={[
                      ROLES.MASTER,
                      ROLES.ORGANIZATION_ADMIN,
                      ROLES.REGION_ADMIN,
                      ROLES.DEPOT_ADMIN,
                    ]}
                    features={["v1_routes"]}
                  >
                    <LanguageConfigProvider>
                      <CreateRoutePageV1 />
                    </LanguageConfigProvider>
                  </RBACPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="routes/create-v1/:areaId/:depotId/:routeId"
              element={
                <ProtectedRoute>
                  <RBACPage
                    roles={[
                      ROLES.MASTER,
                      ROLES.ORGANIZATION_ADMIN,
                      ROLES.REGION_ADMIN,
                      ROLES.DEPOT_ADMIN,
                    ]}
                    features={["v1_routes"]}
                  >
                    <LanguageConfigProvider>
                      <CreateRoutePageV1 />
                    </LanguageConfigProvider>
                  </RBACPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="routes/create/:areaId/:depotId/:routeId"
              element={
                <ProtectedRoute>
                  <RBACPage
                    roles={[
                      ROLES.MASTER,
                      ROLES.ORGANIZATION_ADMIN,
                      ROLES.REGION_ADMIN,
                      ROLES.DEPOT_ADMIN,
                    ]}
                    features={["v2_routes"]}
                  >
                    <LanguageConfigProvider>
                      <RouteCreatePage />
                    </LanguageConfigProvider>
                  </RBACPage>
                </ProtectedRoute>
              }
            />
            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <Navigate
                    to={getDefaultRouteForRole(user?.role?.name?.toLowerCase() || "")}
                    replace
                  />
                }
              />

              {protectedRoutes.map((route: any) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.roles ? (
                      <RBACPage roles={route.roles} features={route.features}>
                        {route.element}
                      </RBACPage>
                    ) : (
                      route.element
                    )
                  }
                />
              ))}
            </Route>

            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <div className="flex min-h-screen w-screen flex-col items-start bg-default-background overflow-y-auto">
                    <UserLoginForm />
                  </div>
                </PublicRoute>
              }
            />
          </Routes>
        </Suspense>
        <ToastContainer
          className={"text-sm"}
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
      </Router>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
