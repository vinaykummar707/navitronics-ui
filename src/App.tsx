import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import HomePage from "./pages/HomePage";
import AppRoutes from "./pages/Routes";
import Settings from "./pages/Settings";
import Roles from "./pages/Roles";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import DisplayConfigForm from "./components/DisplayConfigForm";
import LanguageModify from "./components/LanguageModify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrganizationsPage from "./pages/v2/OrganizationsPage";
import AreasPage from "./pages/v2/AreasPage";
import DepotsPage from "./pages/v2/DepotsPage";
import { UserLoginForm } from "./ui/components/UserLoginForm";
import UsersPage from "./pages/v2/UsersPage";
import RBAC from "./components/RBAC";
import RBACPage from "./components/RBACPage";
import { ROLES } from "./constants/roles";
import useAuthStore from "./store/authStore";
import RoutesPage from "./pages/v2/RoutesPage";
import StopsPage from "./pages/v2/StopsPage";
import CCTVPage from "./pages/v2/CCTVPage";
import { features } from "node:process";
import RouteCreatePage from "./pages/v2/CreateRoutePage";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
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
      features: ["PIS"],
      element: <AreasPage />,
    },
    {
      path: "depots",
      roles: [
        ROLES.REGION_ADMIN,
        ROLES.ORGANIZATION_ADMIN,
        ROLES.MASTER,
      ],
      features: ["PIS"],
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
    { path: "routes", element: <RoutesPage />, features: ["PIS"], roles: [ROLES.DEPOT_ADMIN, ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER] },
    { path: "stops", element: <StopsPage />, features: ["PAS"], roles: [ROLES.DEPOT_ADMIN, ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER] },
    { path: "cctv", element: <CCTVPage />, features: ["PAS", "ITMS"], roles: [ROLES.DEPOT_ADMIN, ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER] },
    { path: "create-route", element: <DisplayConfigForm /> },
    // { path: "routes/create/:areaId/:depotId", features: ['PIS'], roles: [ROLES.DEPOT_ADMIN, ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER], element: <RouteCreatePage /> },
    { path: "settings", element: <Settings /> },
  ] as const;

  // write a function that return route path based on role to navigate to after login
  const getDefaultRouteForRole = (role: string) => {
    switch (role) {
      case ROLES.MASTER:
        return "/home/organizations";
      case ROLES.ORGANIZATION_ADMIN:
        return "/home/regions";
      case ROLES.REGION_ADMIN:
        return "/home/routes";
      case ROLES.DEPOT_ADMIN:
        return "/home/routes";
      case ROLES.USER:
        return "/home/routes";
      default:
        return "/home";
    }
  }

  const user = useAuthStore((state) => state.user); // Get user details


  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="routes/create/:areaId/:depotId" element={<RouteCreatePage/>} />
          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>}>
            <Route index element={<Navigate to={getDefaultRouteForRole(user?.userRole || "")} replace />} />

            {protectedRoutes.map((route: any) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.roles ? (
                    <RBACPage roles={route.roles} features={route.features}>{route.element}</RBACPage>
                  ) : (
                    route.element
                  )
                }
              />
            ))}
          </Route>

          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><div className="flex h-screen w-screen flex-col items-start bg-default-background">
            <UserLoginForm />
          </div></PublicRoute>} />
        </Routes>
        <ToastContainer
          className={'text-sm'}
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;


// {
//   version: "",
//   data: [
//     {},{}
//   ]
// }
