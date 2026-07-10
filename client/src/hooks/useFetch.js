import { useState, useEffect } from 'react';
import api from '../services/api';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(url, options);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, isLoading, error };
};