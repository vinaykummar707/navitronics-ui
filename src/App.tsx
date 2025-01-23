import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Organizations from './pages/Organizations';
import Areas from './pages/Areas';
import Depots from './pages/Depots';
import Users from './pages/Users';
import AppRoutes from './pages/Routes';
import Settings from './pages/Settings';
import Roles from './pages/Roles';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

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
      <Router>
        <div className="h-screen w-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/depots" element={<Depots />} />
            <Route path="/users" element={<Users />} />
            <Route path="/routes" element={<AppRoutes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/roles" element={<Roles />} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App
