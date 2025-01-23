import { useLocation, Navigate } from 'react-router-dom';
import EntryPage from '../components/EntryPage';

export const CreateRoute = () => {
  const location = useLocation();
  const { areaId, depotId } = location.state || {};

  if (!areaId || !depotId) {
    return <Navigate to="/routes" replace />;
  }

  return <EntryPage areaId={areaId} depotId={depotId} />;
};