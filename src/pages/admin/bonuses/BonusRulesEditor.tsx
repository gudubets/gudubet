import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Save, Plus, X, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBonusRules, useUpsertBonusRules } from '@/hooks/useBonusRules';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const DEFAULT_RULES = {
  category_weights: { 
    slots: 1.0, 
    live_casino: 0.1, 
    sports: 0.5,
    table_games: 0.8
  },
  min_bet: 1,
  max_bet: 1000,
  excluded_providers: [] as string[],
  included_games: [] as string[],
  game_contribution_rates: {} as Record<string, number>
};

interface ListEditorProps {
  list: string[];
  onRemove: (index: number) => void;
  onAdd: (value: string) => void;
  placeholder: string;
  title: string;
}

function ListEditor({ list, onRemove, onAdd, placeholder, title }: ListEditorProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list?.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {item}
            <button
              onClick={() => onRemove(index)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function BonusRulesEditor() {
  const { id } = useParams<{ id: string }>();
  const bonusId = id!;
  const { data: existingRules } = useBonusRules(bonusId);
  const upsertRules = useUpsertBonusRules();
  const { toast } = useToast();

  const [rules, setRules] = useState(DEFAULT_RULES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingRules?.rules) {
      setRules(prev => ({ 
        ...prev, 
        ...existingRules.rules,
        category_weights: { 
          ...prev.category_weights, 
          ...(existingRules.rules.category_weights || {}) 
        }
      }));
    }
  }, [existingRules]);

  const updateCategoryWeight = (category: string, value: number) => {
    setRules(prev => ({
      ...prev,
      category_weights: {
        ...prev.category_weights,
        [category]: value
      }
    }));
  };

  const addExcludedProvider = (provider: string) => {
    setRules(prev => ({
      ...prev,
      excluded_providers: [...prev.excluded_providers, provider]
    }));
  };

  const removeExcludedProvider = (index: number) => {
    setRules(prev => ({
      ...prev,
      excluded_providers: prev.excluded_providers.filter((_, i) => i !== index)
    }));
  };

  const addIncludedGame = (game: string) => {
    setRules(prev => ({
      ...prev,
      included_games: [...prev.included_games, game]
    }));
  };

  const removeIncludedGame = (index: number) => {
    setRules(prev => ({
      ...prev,
      included_games: prev.included_games.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await upsertRules.mutateAsync({
        bonus_id: bonusId,
        rules
      });

      toast({
        title: "Success",
        description: "Bonus rules saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save bonus rules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/bonuses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bonuses
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Bonus Rules Editor</h1>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure how this bonus behaves during wagering. Category weights determine
          how much each game type contributes to wagering requirements.
        </AlertDescription>
      </Alert>

      {/* Category Weights */}
      <Card>
        <CardHeader>
          <CardTitle>Game Category Weights</CardTitle>
          <CardDescription>
            Define how much each game category contributes to wagering requirements (0.0 - 1.0)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(rules.category_weights).map(([category, weight]) => (
              <div key={category} className="space-y-2">
                <Label className="text-sm capitalize">
                  {category.replace('_', ' ')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => updateCategoryWeight(category, parseFloat(e.target.value) || 0)}
                />
                <div className="text-xs text-muted-foreground">
                  {(weight * 100).toFixed(0)}% contribution
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bet Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Betting Limits</CardTitle>
          <CardDescription>Set minimum and maximum bet amounts for bonus wagering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Bet (TRY)</Label>
              <Input
                type="number"
                min="0"
                value={rules.min_bet}
                onChange={(e) => setRules(prev => ({ ...prev, min_bet: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Bet (TRY)</Label>
              <Input
                type="number"
                min="1"
                value={rules.max_bet}
                onChange={(e) => setRules(prev => ({ ...prev, max_bet: parseInt(e.target.value) || 1000 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Excluded Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Excluded Providers</CardTitle>
          <CardDescription>Game providers that don't count towards wagering requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <ListEditor
            list={rules.excluded_providers}
            onAdd={addExcludedProvider}
            onRemove={removeExcludedProvider}
            placeholder="Enter provider key (e.g., pragmatic_play)"
            title="Excluded Providers"
          />
        </CardContent>
      </Card>

      {/* Included Games */}
      <Card>
        <CardHeader>
          <CardTitle>Specific Included Games</CardTitle>
          <CardDescription>Specific games that are allowed (leave empty to allow all games)</CardDescription>
        </CardHeader>
        <CardContent>
          <ListEditor
            list={rules.included_games}
            onAdd={addIncludedGame}
            onRemove={removeIncludedGame}
            placeholder="Enter game ID"
            title="Allowed Games"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Rules'}
        </Button>
      </div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Raw JSON (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(rules, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}