// Supabase Edge Function: fetch-fred-data
// Fetches economic data from FRED API and stores it in Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

interface FredObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

interface Indicator {
  id: string;
  fred_series_id: string;
  name: string;
  frequency: string;
}

// Fetch data from FRED API
async function fetchFredData(
  seriesId: string,
  apiKey: string,
  limit: number = 2
): Promise<FredObservation[]> {
  const url = new URL(FRED_BASE_URL);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", limit.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`FRED API error for ${seriesId}: ${response.statusText}`);
  }

  const data: FredResponse = await response.json();
  return data.observations || [];
}

// Calculate percentage change
function calculateChangePercent(
  current: number | null,
  previous: number | null
): number | null {
  if (current === null || previous === null || previous === 0) {
    return null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

// Parse FRED value (handles "." for missing data)
function parseFredValue(value: string): number | null {
  if (value === "." || value === "" || value === "ND") {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

Deno.serve(async (req) => {
  try {
    // CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const fredApiKey = Deno.env.get("FRED_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!fredApiKey) {
      throw new Error("Missing FRED_API_KEY environment variable");
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional indicator filter
    let indicatorIds: string[] | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        indicatorIds = body.indicator_ids || null;
      } catch {
        // No body or invalid JSON, fetch all indicators
      }
    }

    // Fetch indicators from database
    let query = supabase
      .from("macro_indicators")
      .select("id, fred_series_id, name, frequency")
      .eq("is_active", true)
      .not("fred_series_id", "is", null);

    if (indicatorIds && indicatorIds.length > 0) {
      query = query.in("id", indicatorIds);
    }

    const { data: indicators, error: indicatorsError } = await query;

    if (indicatorsError) {
      throw new Error(`Failed to fetch indicators: ${indicatorsError.message}`);
    }

    if (!indicators || indicators.length === 0) {
      return new Response(
        JSON.stringify({ message: "No indicators to fetch", updated: 0 }),
        { status: 200, headers }
      );
    }

    // Fetch data for each indicator
    const results: {
      indicator_id: string;
      name: string;
      status: string;
      error?: string;
    }[] = [];

    let successCount = 0;
    let errorCount = 0;

    for (const indicator of indicators as Indicator[]) {
      try {
        // Fetch latest 2 observations to calculate change
        const observations = await fetchFredData(
          indicator.fred_series_id,
          fredApiKey,
          2
        );

        if (observations.length === 0) {
          results.push({
            indicator_id: indicator.id,
            name: indicator.name,
            status: "no_data",
          });
          continue;
        }

        const latestObs = observations[0];
        const previousObs = observations.length > 1 ? observations[1] : null;

        const currentValue = parseFredValue(latestObs.value);
        const previousValue = previousObs
          ? parseFredValue(previousObs.value)
          : null;
        const changePercent = calculateChangePercent(currentValue, previousValue);

        // Upsert the indicator value
        const { error: upsertError } = await supabase
          .from("indicator_values")
          .upsert(
            {
              indicator_id: indicator.id,
              value: currentValue,
              previous_value: previousValue,
              change_percent: changePercent,
              data_date: latestObs.date,
              fetched_at: new Date().toISOString(),
            },
            {
              onConflict: "indicator_id,data_date",
            }
          );

        if (upsertError) {
          throw new Error(upsertError.message);
        }

        results.push({
          indicator_id: indicator.id,
          name: indicator.name,
          status: "success",
        });
        successCount++;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          indicator_id: indicator.id,
          name: indicator.name,
          status: "error",
          error: errorMessage,
        });
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Fetched ${successCount} indicators, ${errorCount} errors`,
        updated: successCount,
        errors: errorCount,
        results,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in fetch-fred-data:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
