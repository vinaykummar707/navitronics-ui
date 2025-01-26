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

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Redirect "/" to "/home" */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
                <HomePage />
            }
          >
            {/* Nested routes with relative paths */}
            <Route index element={<Organizations />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="areas" element={<Areas />} />
            <Route path="depots" element={<Depots />} />
            <Route path="users" element={<Users />} />
            <Route path="routes" element={<AppRoutes />} />
            <Route path="create-route" element={<EntryPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="roles" element={<Roles />} />
          </Route>

          {/* Login Route */}

          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        </Routes>
      </Router>

      <ReactQueryDevtools initialIsOpen={false} />


    </QueryClientProvider>
  );
}

export default App;
