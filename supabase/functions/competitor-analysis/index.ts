import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompetitorAnalysisRequest {
  query: string
  competitors?: string[]
  analysisType: 'market' | 'features' | 'pricing' | 'marketing' | 'general'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, competitors = [], analysisType = 'general' }: CompetitorAnalysisRequest = await req.json()
    
    console.log('Competitor analysis request:', { query, competitors, analysisType })

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not found')
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Construct detailed prompt based on analysis type
    let systemPrompt = ''
    let userPrompt = query

    switch (analysisType) {
      case 'market':
        systemPrompt = 'Sen bir pazar analisti uzmanısın. Spor bahis ve casino sektörü hakkında derinlemesine analiz yap. Rakiplerin pazar pozisyonlarını, güçlü yönlerini, zayıflıklarını ve fırsatları detaylandır. En az 10 farklı kaynaktan alıntı yap ve her analizi destekleyici verilerle güçlendir.'
        userPrompt = `Pazar analizi: ${query}. ${competitors.length > 0 ? `Özellikle şu rakiplere odaklan: ${competitors.join(', ')}` : ''} Detaylı pazar payları, büyüme oranları, kullanıcı demografileri ve rekabet stratejilerini analiz et.`
        break
      case 'features':
        systemPrompt = 'Sen bir ürün analisti uzmanısın. Spor bahis ve casino platformlarının özelliklerini, kullanıcı deneyimini ve teknolojik avantajlarını detaylandır. Her özellik için kaynak göster ve karşılaştırmalı analiz yap.'
        userPrompt = `Özellik analizi: ${query}. ${competitors.length > 0 ? `Şu platformları karşılaştır: ${competitors.join(', ')}` : ''} Mobil uygulamalar, canlı bahis, oyun çeşitliliği, ödeme yöntemleri ve kullanıcı arayüzü özelliklerini detaylı analiz et.`
        break
      case 'pricing':
        systemPrompt = 'Sen bir fiyatlandırma stratejisti uzmanısın. Bahis oranları, komisyon oranları, bonus sistemleri ve fiyatlandırma modellerini analiz et. Her veriyi kaynaklarıyla destekle.'
        userPrompt = `Fiyatlandırma analizi: ${query}. ${competitors.length > 0 ? `Bu platformların fiyatlandırmasını incele: ${competitors.join(', ')}` : ''} Bahis oranları, komisyon yapıları, hoşgeldin bonusları ve sadakat programlarını karşılaştır.`
        break
      case 'marketing':
        systemPrompt = 'Sen bir dijital pazarlama uzmanısın. Spor bahis sektöründeki pazarlama stratejilerini, reklam kampanyalarını ve marka konumlandırmalarını analiz et. Sosyal medya presence, influencer ortaklıkları ve sponsorluk anlaşmalarını detaylandır.'
        userPrompt = `Pazarlama analizi: ${query}. ${competitors.length > 0 ? `Şu markaların pazarlama stratejilerini incele: ${competitors.join(', ')}` : ''} Reklam harcamaları, sosyal medya stratejileri, sponsorluklar ve marka imajı analizi yap.`
        break
      default:
        systemPrompt = 'Sen bir iş zekası uzmanısın. Spor bahis ve casino sektörü hakkında kapsamlı analiz yap. Her bilgiyi güvenilir kaynaklarla destekle ve en az 10 farklı kaynaktan alıntı yap.'
        userPrompt = `Genel analiz: ${query}. ${competitors.length > 0 ? `Bu rakipleri analiz et: ${competitors.join(', ')}` : ''}`
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 4000,
        return_related_questions: true
      }),
    })

    if (!response.ok) {
      console.error('Perplexity API error:', response.status, await response.text())
      return new Response(
        JSON.stringify({ error: 'Perplexity API request failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log('Perplexity API response received successfully')
    
    // Log the analysis for admin review
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store analysis in database for future reference
    const { error: dbError } = await supabase
      .from('competitor_analyses')
      .insert({
        query,
        competitors,
        analysis_type: analysisType,
        result: data.choices[0].message.content,
        related_questions: data.related_questions || []
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't fail the request if database logging fails
    }

    return new Response(
      JSON.stringify({
        analysis: data.choices[0].message.content,
        related_questions: data.related_questions || [],
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in competitor analysis function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})