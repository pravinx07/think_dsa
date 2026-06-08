import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

type DataContextType = {
  data: any;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>({
    user: null,
    strongAreas: [],
    weakAreas: [],
    recommendedProblems: [],
    recentActivity: [],
    patterns: [],
    weaknessInsights: [],
    hintStats: null,
    roadmap: [],
    history: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchApi } = useApi();

  const refreshData = async () => {
    setLoading(true);
    try {
      const [home, analytics, roadmap, history] = await Promise.all([
        fetchApi('/dashboard/home'),
        fetchApi('/dashboard/analytics'),
        fetchApi('/dashboard/roadmap'),
        fetchApi('/dashboard/history'),
      ]);

      setData({
        ...home,
        ...analytics,
        ...roadmap,
        ...history,
      });
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [fetchApi]);

  return (
    <DataContext.Provider value={{ data, loading, error, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
