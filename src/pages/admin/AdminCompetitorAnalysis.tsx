import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, TrendingUp, Target, DollarSign, Megaphone, BarChart3 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface AnalysisResult {
  analysis: string
  related_questions: string[]
  timestamp: string
}

const CompetitorAnalysis = () => {
  const [query, setQuery] = useState("")
  const [competitors, setCompetitors] = useState("")
  const [analysisType, setAnalysisType] = useState<'market' | 'features' | 'pricing' | 'marketing' | 'general'>('general')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  const analysisTypes = [
    { value: 'general', label: 'Genel Analiz', icon: BarChart3, color: 'bg-blue-500' },
    { value: 'market', label: 'Pazar Analizi', icon: TrendingUp, color: 'bg-green-500' },
    { value: 'features', label: 'Özellik Analizi', icon: Target, color: 'bg-purple-500' },
    { value: 'pricing', label: 'Fiyatlandırma Analizi', icon: DollarSign, color: 'bg-yellow-500' },
    { value: 'marketing', label: 'Pazarlama Analizi', icon: Megaphone, color: 'bg-red-500' },
  ]

  const handleAnalysis = async () => {
    if (!query.trim()) {
      toast.error("Lütfen analiz etmek istediğiniz konuyu girin")
      return
    }

    setLoading(true)
    try {
      const competitorList = competitors
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0)

      const { data, error } = await supabase.functions.invoke('competitor-analysis', {
        body: {
          query: query.trim(),
          competitors: competitorList,
          analysisType
        }
      })

      if (error) {
        console.error('Analysis error:', error)
        toast.error("Analiz sırasında bir hata oluştu")
        return
      }

      setResult(data as AnalysisResult)
      toast.success("Analiz başarıyla tamamlandı!")
      
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error("Analiz sırasında bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const selectedAnalysisType = analysisTypes.find(type => type.value === analysisType)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rakip Analizi</h1>
        <p className="text-muted-foreground">
          Perplexity AI ile güçlendirilmiş kapsamlı rakip analizi yapın
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Analysis Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analiz Parametreleri
            </CardTitle>
            <CardDescription>
              Analiz etmek istediğiniz konuyu ve rakipleri belirtin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analysisType">Analiz Türü</Label>
              <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${type.color}`} />
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="query">Analiz Konusu</Label>
              <Textarea
                id="query"
                placeholder="Örn: Türkiye'deki spor bahis platformlarının pazar durumu"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitors">Rakipler (Opsiyonel)</Label>
              <Input
                id="competitors"
                placeholder="Bet365, Bwin, Nesine, virgülle ayırın"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Virgülle ayırarak birden fazla rakip girebilirsiniz
              </p>
            </div>

            <Button 
              onClick={handleAnalysis} 
              disabled={loading || !query.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analiz Yapılıyor...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analiz Yap
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Type Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedAnalysisType && (
                <>
                  <selectedAnalysisType.icon className="h-5 w-5" />
                  {selectedAnalysisType.label}
                </>
              )}
            </CardTitle>
            <CardDescription>
              Seçili analiz türü hakkında bilgi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisType === 'market' && (
              <div className="space-y-2">
                <p className="text-sm">Pazar analizi şunları içerir:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Pazar payları ve büyüme oranları</li>
                  <li>Kullanıcı demografileri</li>
                  <li>Rekabet stratejileri</li>
                  <li>Pazar fırsatları ve tehditler</li>
                </ul>
              </div>
            )}
            {analysisType === 'features' && (
              <div className="space-y-2">
                <p className="text-sm">Özellik analizi şunları içerir:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Platform özellikleri karşılaştırması</li>
                  <li>Mobil uygulama deneyimi</li>
                  <li>Canlı bahis özellikleri</li>
                  <li>Oyun çeşitliliği ve kalitesi</li>
                </ul>
              </div>
            )}
            {analysisType === 'pricing' && (
              <div className="space-y-2">
                <p className="text-sm">Fiyatlandırma analizi şunları içerir:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Bahis oranları karşılaştırması</li>
                  <li>Komisyon yapıları</li>
                  <li>Bonus ve promosyon stratejileri</li>
                  <li>Sadakat programları</li>
                </ul>
              </div>
            )}
            {analysisType === 'marketing' && (
              <div className="space-y-2">
                <p className="text-sm">Pazarlama analizi şunları içerir:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Reklam stratejileri</li>
                  <li>Sosyal medya presence</li>
                  <li>Sponsorluk anlaşmaları</li>
                  <li>Marka konumlandırması</li>
                </ul>
              </div>
            )}
            {analysisType === 'general' && (
              <div className="space-y-2">
                <p className="text-sm">Genel analiz şunları içerir:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Genel pazar durumu</li>
                  <li>Rakip güçlü/zayıf yönleri</li>
                  <li>Fırsat ve tehdit analizi</li>
                  <li>Stratejik öneriler</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiz Sonuçları</CardTitle>
              <CardDescription>
                {new Date(result.timestamp).toLocaleString('tr-TR')} tarihinde tamamlandı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {result.analysis}
                </pre>
              </div>
            </CardContent>
          </Card>

          {result.related_questions && result.related_questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>İlgili Sorular</CardTitle>
                <CardDescription>
                  Analizi derinleştirmek için bu soruları da sorabilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.related_questions.map((question, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setQuery(question)}
                    >
                      {question}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default CompetitorAnalysis