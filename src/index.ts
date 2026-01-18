// MacroBet Economic Data - Public API

// Supabase client and types
export {
  supabase,
  getCategories,
  getIndicatorsByCategory,
  getLatestValues,
  getLatestValuesByCategory,
  getIndicatorHistory,
  getCategoriesWithIndicators,
  subscribeToIndicatorUpdates,
} from "./lib/supabase";

export type {
  MacroCategory,
  MacroIndicator,
  IndicatorValue,
  LatestIndicatorValue,
  CategoryWithIndicators,
} from "./lib/supabase";

// React hooks
export {
  useMacroData,
  useCategoriesWithIndicators,
  useIndicatorHistory,
  useRefreshFredData,
} from "./hooks/useMacroData";
