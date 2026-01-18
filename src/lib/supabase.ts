import { createClient } from "@supabase/supabase-js";

// Database types
export interface MacroCategory {
  id: string;
  name: string;
  name_en: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface MacroIndicator {
  id: string;
  category_id: string;
  fred_series_id: string | null;
  name: string;
  name_en: string;
  unit: string | null;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  source: string;
  is_active: boolean;
  sort_order: number;
}

export interface IndicatorValue {
  id: string;
  indicator_id: string;
  value: number | null;
  previous_value: number | null;
  change_percent: number | null;
  data_date: string;
  fetched_at: string;
}

export interface LatestIndicatorValue {
  id: string;
  indicator_id: string;
  name: string;
  name_en: string;
  unit: string | null;
  frequency: string;
  category_id: string;
  category_name: string;
  category_name_en: string;
  value: number | null;
  previous_value: number | null;
  change_percent: number | null;
  data_date: string;
  fetched_at: string;
}

export interface CategoryWithIndicators {
  id: string;
  name: string;
  name_en: string;
  icon: string | null;
  color: string | null;
  indicators: Array<{
    id: string;
    name: string;
    name_en: string;
    unit: string | null;
    frequency: string;
    latest_value: {
      value: number | null;
      previous_value: number | null;
      change_percent: number | null;
      data_date: string;
      fetched_at: string;
    } | null;
  }>;
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API functions
export async function getCategories(): Promise<MacroCategory[]> {
  const { data, error } = await supabase
    .from("macro_categories")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data || [];
}

export async function getIndicatorsByCategory(
  categoryId: string
): Promise<MacroIndicator[]> {
  const { data, error } = await supabase
    .from("macro_indicators")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data || [];
}

export async function getLatestValues(): Promise<LatestIndicatorValue[]> {
  const { data, error } = await supabase
    .from("latest_indicator_values")
    .select("*");

  if (error) throw error;
  return data || [];
}

export async function getLatestValuesByCategory(
  categoryId: string
): Promise<LatestIndicatorValue[]> {
  const { data, error } = await supabase
    .from("latest_indicator_values")
    .select("*")
    .eq("category_id", categoryId);

  if (error) throw error;
  return data || [];
}

export async function getIndicatorHistory(
  indicatorId: string,
  limit: number = 30
): Promise<IndicatorValue[]> {
  const { data, error } = await supabase
    .from("indicator_values")
    .select("*")
    .eq("indicator_id", indicatorId)
    .order("data_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getCategoriesWithIndicators(): Promise<
  CategoryWithIndicators[]
> {
  const { data, error } = await supabase.rpc("get_categories_with_indicators");

  if (error) throw error;
  return data || [];
}

// Realtime subscription helper
export function subscribeToIndicatorUpdates(
  callback: (payload: IndicatorValue) => void
) {
  return supabase
    .channel("indicator_values_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "indicator_values",
      },
      (payload) => {
        callback(payload.new as IndicatorValue);
      }
    )
    .subscribe();
}
