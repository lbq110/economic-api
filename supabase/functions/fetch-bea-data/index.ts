// Supabase Edge Function: fetch-bea-data
// Fetches economic data from BEA API and stores it in Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BEA_BASE_URL = "https://apps.bea.gov/api/data/";

interface BeaDataItem {
  TableName: string;
  SeriesCode: string;
  LineNumber: string;
  LineDescription: string;
  TimePeriod: string;
  DataValue: string;
  METRIC_NAME: string;
  CL_UNIT: string;
  UNIT_MULT: string;
}

interface BeaResponse {
  BEAAPI: {
    Results: {
      Data: BeaDataItem[];
    };
  };
}

interface BeaSeries {
  id: string;
  table_id: string;
  series_code: string;
  line_description: string;
}

interface BeaTable {
  id: string;
  table_name: string;
  frequency: string;
}

// Convert BEA time period to date
function periodToDate(timePeriod: string): string {
  // Handle quarterly: 2024Q1 -> 2024-03-31
  const quarterMatch = timePeriod.match(/^(\d{4})Q(\d)$/);
  if (quarterMatch) {
    const year = quarterMatch[1];
    const quarter = parseInt(quarterMatch[2]);
    const monthEnd = quarter * 3;
    const lastDay = new Date(parseInt(year), monthEnd, 0).getDate();
    return `${year}-${monthEnd.toString().padStart(2, "0")}-${lastDay}`;
  }

  // Handle annual: 2024 -> 2024-12-31
  const yearMatch = timePeriod.match(/^(\d{4})$/);
  if (yearMatch) {
    return `${yearMatch[1]}-12-31`;
  }

  // Handle monthly: 2024M01 -> 2024-01-31
  const monthMatch = timePeriod.match(/^(\d{4})M(\d{2})$/);
  if (monthMatch) {
    const year = monthMatch[1];
    const month = parseInt(monthMatch[2]);
    const lastDay = new Date(parseInt(year), month, 0).getDate();
    return `${year}-${month.toString().padStart(2, "0")}-${lastDay}`;
  }

  return timePeriod;
}

// Parse BEA value (handles commas and special cases)
function parseBeaValue(value: string): number | null {
  if (!value || value === "---" || value === "N/A" || value === "(NA)") {
    return null;
  }
  // Remove commas
  const cleaned = value.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
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

// Fetch data from BEA API
async function fetchBeaData(
  apiKey: string,
  tableName: string,
  frequency: string,
  years: string
): Promise<BeaDataItem[]> {
  const url = new URL(BEA_BASE_URL);
  url.searchParams.set("UserID", apiKey);
  url.searchParams.set("method", "GetData");
  url.searchParams.set("DatasetName", "NIPA");
  url.searchParams.set("TableName", tableName);
  url.searchParams.set("Frequency", frequency);
  url.searchParams.set("Year", years);
  url.searchParams.set("ResultFormat", "JSON");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`BEA API error: ${response.statusText}`);
  }

  const data: BeaResponse = await response.json();
  return data.BEAAPI?.Results?.Data || [];
}

Deno.serve(async (req) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const beaApiKey = Deno.env.get("BEA_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!beaApiKey) {
      throw new Error("Missing BEA_API_KEY environment variable");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional table filter
    let tableIds: string[] | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        tableIds = body.table_ids || null;
      } catch {
        // No body or invalid JSON
      }
    }

    // Get current and previous year for data fetching
    const currentYear = new Date().getFullYear();
    const years = `${currentYear - 1},${currentYear}`;

    // Fetch BEA tables configuration
    let tableQuery = supabase
      .from("bea_tables")
      .select("id, table_name, frequency")
      .eq("is_active", true);

    if (tableIds && tableIds.length > 0) {
      tableQuery = tableQuery.in("id", tableIds);
    }

    const { data: tables, error: tablesError } = await tableQuery;

    if (tablesError) {
      throw new Error(`Failed to fetch BEA tables: ${tablesError.message}`);
    }

    if (!tables || tables.length === 0) {
      return new Response(
        JSON.stringify({ message: "No BEA tables to fetch", updated: 0 }),
        { status: 200, headers }
      );
    }

    // Fetch series configuration
    const { data: allSeries, error: seriesError } = await supabase
      .from("bea_series")
      .select("id, table_id, series_code, line_description")
      .eq("is_active", true);

    if (seriesError) {
      throw new Error(`Failed to fetch BEA series: ${seriesError.message}`);
    }

    const seriesByTable = (allSeries as BeaSeries[]).reduce(
      (acc, series) => {
        if (!acc[series.table_id]) {
          acc[series.table_id] = [];
        }
        acc[series.table_id].push(series);
        return acc;
      },
      {} as Record<string, BeaSeries[]>
    );

    const results: {
      table_id: string;
      status: string;
      series_updated: number;
      error?: string;
    }[] = [];

    let totalUpdated = 0;
    let errorCount = 0;

    // Process each table
    for (const table of tables as BeaTable[]) {
      try {
        const tableSeries = seriesByTable[table.id] || [];
        if (tableSeries.length === 0) {
          results.push({
            table_id: table.id,
            status: "no_series",
            series_updated: 0,
          });
          continue;
        }

        // Fetch data from BEA API
        const beaData = await fetchBeaData(
          beaApiKey,
          table.table_name,
          table.frequency,
          years
        );

        // Create lookup for series codes
        const seriesLookup = tableSeries.reduce(
          (acc, s) => {
            acc[s.series_code] = s;
            return acc;
          },
          {} as Record<string, BeaSeries>
        );

        // Group data by series code
        const dataBySeriesCode: Record<string, BeaDataItem[]> = {};
        for (const item of beaData) {
          if (seriesLookup[item.SeriesCode]) {
            if (!dataBySeriesCode[item.SeriesCode]) {
              dataBySeriesCode[item.SeriesCode] = [];
            }
            dataBySeriesCode[item.SeriesCode].push(item);
          }
        }

        let seriesUpdated = 0;

        // Process each series
        for (const [seriesCode, items] of Object.entries(dataBySeriesCode)) {
          const series = seriesLookup[seriesCode];

          // Sort by time period descending
          items.sort((a, b) => b.TimePeriod.localeCompare(a.TimePeriod));

          const latestItem = items[0];
          const previousItem = items.length > 1 ? items[1] : null;

          const currentValue = parseBeaValue(latestItem.DataValue);
          const previousValue = previousItem
            ? parseBeaValue(previousItem.DataValue)
            : null;
          const changePercent = calculateChangePercent(
            currentValue,
            previousValue
          );

          // Upsert the value
          const { error: upsertError } = await supabase
            .from("bea_values")
            .upsert(
              {
                series_id: series.id,
                value: currentValue,
                previous_value: previousValue,
                change_percent: changePercent,
                time_period: latestItem.TimePeriod,
                period_date: periodToDate(latestItem.TimePeriod),
                fetched_at: new Date().toISOString(),
              },
              {
                onConflict: "series_id,time_period",
              }
            );

          if (upsertError) {
            console.error(
              `Error upserting ${series.id}: ${upsertError.message}`
            );
          } else {
            seriesUpdated++;
          }
        }

        results.push({
          table_id: table.id,
          status: "success",
          series_updated: seriesUpdated,
        });
        totalUpdated += seriesUpdated;

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          table_id: table.id,
          status: "error",
          series_updated: 0,
          error: errorMessage,
        });
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Updated ${totalUpdated} series from ${tables.length} tables, ${errorCount} errors`,
        updated: totalUpdated,
        tables_processed: tables.length,
        errors: errorCount,
        results,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in fetch-bea-data:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
