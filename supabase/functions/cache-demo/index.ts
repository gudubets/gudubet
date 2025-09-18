import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Redis } from "https://esm.sh/@upstash/redis@1.31.6?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Redis client (Upstash)
const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "" // mümkünse anon key + RLS kullan
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "get";
    const key = url.searchParams.get("key");
    const ttl = parseInt(url.searchParams.get("ttl") || "300"); // saniye

    switch (action) {
      case "get": {
        if (!key) {
          return new Response(
            JSON.stringify({ error: "Key parameter required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        const cached = await redis.get(key);
        if (cached) {
          return new Response(
            JSON.stringify({ success: true, data: cached, cached: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: null, cached: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "set": {
        if (!key) {
          return new Response(
            JSON.stringify({ error: "Key parameter required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        const body = await req.json();
        await redis.set(key, body.data, { ex: ttl });

        return new Response(
          JSON.stringify({ success: true, message: "Data cached successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "delete": {
        if (!key) {
          return new Response(
            JSON.stringify({ error: "Key parameter required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        const deleted = await redis.del(key);
        return new Response(
          JSON.stringify({ success: true, deleted: !!deleted }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "games": {
        const cacheKey = "popular_games:v1";
        const cached = await redis.get(cacheKey);

        if (cached) {
          return new Response(
            JSON.stringify({ success: true, data: cached, cached: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        // DB'den al
        const { data: games, error } = await supabase
          .from("casino_games")
          .select("id,name,provider,thumb_url,is_featured,updated_at")
          .eq("is_featured", true)
          .limit(10);

        if (error) {
          console.error("Database error:", error);
          return new Response(
            JSON.stringify({ error: "Failed to fetch games" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        // Redis'e yaz (5 dk)
        await redis.set(cacheKey, games, { ex: 300 });

        return new Response(
          JSON.stringify({ success: true, data: games, cached: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      default:
        return new Response(
          JSON.stringify({
            error: "Invalid action. Use: get, set, delete, games",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }
  } catch (error) {
    console.error("Cache demo error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
