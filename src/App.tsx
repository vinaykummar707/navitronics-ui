import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import HomePage from "./pages/HomePage";
import Login from "./components/Login";
import Organizations from "./pages/Organizations";
import Areas from "./pages/Areas";
import Depots from "./pages/Depots";
import Users from "./pages/Users";
import AppRoutes from "./pages/Routes";
import Settings from "./pages/Settings";
import Roles from "./pages/Roles";
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import { CreateRoute } from "./pages/CreateRoute";
import PublicRoute from "./components/PublicRoute";
import EntryPage from "./components/EntryPage";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {

  const user = useAuthStore((state) => state.user);
    // Define role-based access mapping
    const accessControl = {
      organizations: ['organization_admin', 'master'],
      areas: ['area_admin', 'organization_admin', 'master'],
      depots: ['depot_admin', 'area_admin', 'organization_admin', 'master'],
      users: ['organization_admin', 'master'],
      roles: ['organization_admin', 'master'],
    };
  
    const canAccess = (route) => {
      return accessControl[route]?.includes(user?.userRole);
    };

  return (
  <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>}>
            {canAccess('organizations') && <Route path="organizations" element={<Organizations />} />}
            {canAccess('areas') && <Route path="areas" element={<Areas />} />}
            {canAccess('depots') && <Route path="depots" element={<Depots />} />}
            {canAccess('users') && <Route path="users" element={<Users />} />}
            {canAccess('roles') && <Route path="roles" element={<Roles />} />}
            <Route path="routes" element={<AppRoutes />} />
            <Route path="create-route" element={<CreateRoute />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
