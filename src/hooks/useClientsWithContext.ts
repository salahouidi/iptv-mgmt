import { useEffect } from 'react';
import { useClients } from './useApi';
import { useClientContext } from '../contexts/ClientContext';
import { ClientFilters } from '../types/database';

export function useClientsWithContext(filters?: ClientFilters) {
  const { refreshTrigger, setClients } = useClientContext();
  const { data, loading, error, refetch } = useClients(filters);

  console.log('🔍 useClientsWithContext: refreshTrigger =', refreshTrigger);

  // Update context when data changes
  useEffect(() => {
    if (data?.items) {
      console.log('🔄 useClientsWithContext: Updating context with', data.items.length, 'clients');
      setClients(data.items);
    }
  }, [data, setClients]);

  // Refetch when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 useClientsWithContext: Refresh trigger changed, refetching...');
      refetch();
    }
  }, [refreshTrigger, refetch]);

  return { data, loading, error, refetch };
}
