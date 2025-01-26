import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Organizations from "./pages/Organizations";
import Areas from "./pages/Areas";
import Depots from "./pages/Depots";
import Users from "./pages/Users";
import AppRoutes from "./pages/Routes";
import Settings from "./pages/Settings";
import Roles from "./pages/Roles";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { CreateRoute } from "./pages/CreateRoute";
import EntryPage from "./components/EntryPage";
import { HomeChakra } from "./components/Navbar-chakra";
import { Container, Flex } from "@chakra-ui/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="h-screen flex flex-col  w-screen overflow-hidden bg-stone-100">
          <Navbar />
          <Flex className="overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to={"organizations"} />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/areas" element={<Areas />} />
              <Route path="/depots" element={<Depots />} />
              <Route path="/users" element={<Users />} />
              <Route path="/routes" element={<AppRoutes />} />
              <Route path="/create-route" element={<CreateRoute />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/roles" element={<Roles />} />
            </Routes>
          </Flex>
        </div>
      </BrowserRouter>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
