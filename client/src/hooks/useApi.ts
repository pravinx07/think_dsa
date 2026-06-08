import { useAuth } from '@clerk/react';
import { useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export const useApi = () => {
  const { getToken } = useAuth();

  const fetchApi = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    return res.json();
  }, [getToken]);

  return { fetchApi };
};
