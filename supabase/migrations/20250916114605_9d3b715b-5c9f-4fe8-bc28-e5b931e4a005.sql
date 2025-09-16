-- Enable Row Level Security on game-related tables
ALTER TABLE public.casino_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_categories ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.game_providers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access to casino games and related data
CREATE POLICY "Allow public read access to casino games" 
ON public.casino_games 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to casino categories" 
ON public.casino_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to game providers" 
ON public.game_providers 
FOR SELECT 
USING (true);

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key from casino_games to casino_categories
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'casino_games_category_id_fkey' 
        AND table_name = 'casino_games'
    ) THEN
        ALTER TABLE public.casino_games 
        ADD CONSTRAINT casino_games_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.casino_categories(id);
    END IF;
    
    -- Add foreign key from casino_games to game_providers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'casino_games_provider_id_fkey' 
        AND table_name = 'casino_games'
    ) THEN
        ALTER TABLE public.casino_games 
        ADD CONSTRAINT casino_games_provider_id_fkey 
        FOREIGN KEY (provider_id) REFERENCES public.game_providers(id);
    END IF;
END $$;