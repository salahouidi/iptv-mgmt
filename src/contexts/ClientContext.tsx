import React, { createContext, useContext, useCallback, useState } from 'react';
import { Client } from '../types/database';

interface ClientContextType {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  removeClient: (clientId: number) => void;
  refreshClients: () => void;
  refreshTrigger: number;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const addClient = useCallback((client: Client) => {
    console.log('🔄 ClientContext: Adding client', client);
    setClients(prev => {
      const updated = [...prev, client];
      console.log('🔄 ClientContext: Updated clients list', updated.length);
      return updated;
    });
    setRefreshTrigger(prev => {
      const newTrigger = prev + 1;
      console.log('🔄 ClientContext: Refresh trigger updated to', newTrigger);
      return newTrigger;
    });
  }, []);

  const updateClient = useCallback((updatedClient: Client) => {
    setClients(prev => 
      prev.map(client => 
        client.id_client === updatedClient.id_client ? updatedClient : client
      )
    );
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const removeClient = useCallback((clientId: number) => {
    setClients(prev => prev.filter(client => client.id_client !== clientId));
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const refreshClients = useCallback(() => {
    setRefreshTrigger(prev => {
      const newTrigger = prev + 1;
      console.log('🔄 ClientContext: Manual refresh trigger updated to', newTrigger);
      return newTrigger;
    });
  }, []);

  const value: ClientContextType = {
    clients,
    setClients,
    addClient,
    updateClient,
    removeClient,
    refreshClients,
    refreshTrigger
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
}
