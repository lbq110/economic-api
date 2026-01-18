import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  getCategories,
  getLatestValues,
  getLatestValuesByCategory,
  getIndicatorHistory,
  getCategoriesWithIndicators,
  subscribeToIndicatorUpdates,
  MacroCategory,
  LatestIndicatorValue,
  IndicatorValue,
  CategoryWithIndicators,
} from "../lib/supabase";

interface UseMacroDataOptions {
  categoryId?: string;
  enableRealtime?: boolean;
}

interface UseMacroDataReturn {
  categories: MacroCategory[];
  latestValues: LatestIndicatorValue[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch macro economic data from Supabase
 *
 * @example
 * // Fetch all categories and latest values
 * const { categories, latestValues, isLoading } = useMacroData();
 *
 * @example
 * // Fetch data for a specific category
 * const { latestValues, isLoading } = useMacroData({ categoryId: 'treasury' });
 *
 * @example
 * // Enable realtime updates
 * const { latestValues } = useMacroData({ enableRealtime: true });
 */
export function useMacroData(
  options: UseMacroDataOptions = {}
): UseMacroDataReturn {
  const { categoryId, enableRealtime = false } = options;

  const [categories, setCategories] = useState<MacroCategory[]>([]);
  const [latestValues, setLatestValues] = useState<LatestIndicatorValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [categoriesData, valuesData] = await Promise.all([
        getCategories(),
        categoryId
          ? getLatestValuesByCategory(categoryId)
          : getLatestValues(),
      ]);

      setCategories(categoriesData);
      setLatestValues(valuesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const subscription = subscribeToIndicatorUpdates((newValue) => {
      setLatestValues((prev) => {
        // Update or add the new value
        const existingIndex = prev.findIndex(
          (v) => v.indicator_id === newValue.indicator_id
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            value: newValue.value,
            previous_value: newValue.previous_value,
            change_percent: newValue.change_percent,
            data_date: newValue.data_date,
            fetched_at: newValue.fetched_at,
          };
          return updated;
        }

        return prev;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [enableRealtime]);

  return {
    categories,
    latestValues,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to fetch all categories with their indicators and latest values
 */
export function useCategoriesWithIndicators() {
  const [data, setData] = useState<CategoryWithIndicators[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getCategoriesWithIndicators();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook to fetch historical data for a specific indicator
 *
 * @example
 * const { history, isLoading } = useIndicatorHistory('treasury_10y', 30);
 */
export function useIndicatorHistory(indicatorId: string, limit: number = 30) {
  const [history, setHistory] = useState<IndicatorValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!indicatorId) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await getIndicatorHistory(indicatorId, limit);
      setHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      setIsLoading(false);
    }
  }, [indicatorId, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { history, isLoading, error, refetch: fetchData };
}

/**
 * Hook to trigger FRED data refresh via Edge Function
 *
 * @example
 * const { refresh, isRefreshing } = useRefreshFredData();
 * await refresh(); // Refresh all indicators
 * await refresh(['treasury_10y', 'vix']); // Refresh specific indicators
 */
export function useRefreshFredData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async (indicatorIds?: string[]) => {
    try {
      setIsRefreshing(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke(
        "fetch-fred-data",
        {
          body: indicatorIds ? { indicator_ids: indicatorIds } : {},
        }
      );

      if (fnError) throw fnError;
      return data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to refresh data");
      setError(error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { refresh, isRefreshing, error };
}
