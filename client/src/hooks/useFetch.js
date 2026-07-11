import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify options to prevent infinite loops in dependency array
  const optionsString = JSON.stringify(options);

  const fetchData = useCallback(async (abortController) => {
    setIsLoading(true);
    try {
      const response = await api.get(url, {
        ...JSON.parse(optionsString),
        signal: abortController?.signal
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      // Ignore errors caused by the request being aborted
      if (err.name === 'CanceledError' || err.message === 'canceled') return; 
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [url, optionsString]);

  useEffect(() => {
    if (!url) return;
    
    // Create an abort controller to cancel requests if the component unmounts early
    const abortController = new AbortController();
    fetchData(abortController);
    
    return () => abortController.abort();
  }, [fetchData]);

  // Expose a refetch function so components can manually trigger a data refresh
  const refetch = () => fetchData(new AbortController());

  return { data, isLoading, error, refetch };
};  