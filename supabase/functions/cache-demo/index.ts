import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number, ttl: number }>()

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'get'
    const key = url.searchParams.get('key')
    const ttl = parseInt(url.searchParams.get('ttl') || '300') // Default 5 minutes

    console.log(`Cache action: ${action}, key: ${key}`)

    switch (action) {
      case 'get': {
        if (!key) {
          return new Response(
            JSON.stringify({ error: 'Key parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const cached = cache.get(key)
        if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
          console.log(`Cache hit for key: ${key}`)
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: cached.data, 
              cached: true,
              age: Math.floor((Date.now() - cached.timestamp) / 1000)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`Cache miss for key: ${key}`)
        return new Response(
          JSON.stringify({ success: true, data: null, cached: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'set': {
        if (!key) {
          return new Response(
            JSON.stringify({ error: 'Key parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const body = await req.json()
        cache.set(key, {
          data: body.data,
          timestamp: Date.now(),
          ttl: ttl
        })

        console.log(`Cache set for key: ${key}, TTL: ${ttl}s`)
        return new Response(
          JSON.stringify({ success: true, message: 'Data cached successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        if (!key) {
          return new Response(
            JSON.stringify({ error: 'Key parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const deleted = cache.delete(key)
        console.log(`Cache delete for key: ${key}, existed: ${deleted}`)
        
        return new Response(
          JSON.stringify({ success: true, deleted }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'clear': {
        const size = cache.size
        cache.clear()
        console.log(`Cache cleared, ${size} items removed`)
        
        return new Response(
          JSON.stringify({ success: true, message: `Cleared ${size} cached items` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'stats': {
        const stats = {
          size: cache.size,
          keys: Array.from(cache.keys()),
          memory_usage: JSON.stringify(cache).length
        }
        
        return new Response(
          JSON.stringify({ success: true, stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'games': {
        // Demo: Cache popular games data
        const cacheKey = 'popular_games'
        const cached = cache.get(cacheKey)
        
        if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: cached.data, 
              cached: true,
              age: Math.floor((Date.now() - cached.timestamp) / 1000)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Fetch from database
        const { data: games, error } = await supabase
          .from('casino_games')
          .select('*')
          .eq('is_featured', true)
          .limit(10)

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch games' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Cache the result
        cache.set(cacheKey, {
          data: games,
          timestamp: Date.now(),
          ttl: 300 // 5 minutes
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: games, 
            cached: false,
            message: 'Data fetched and cached'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: get, set, delete, clear, stats, games' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Cache demo error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})