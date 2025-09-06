-- Create competitor_analyses table for storing analysis results
CREATE TABLE public.competitor_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  competitors TEXT[] DEFAULT '{}',
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('market', 'features', 'pricing', 'marketing', 'general')),
  result TEXT NOT NULL,
  related_questions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.competitor_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Only admins can view competitor analyses" 
ON public.competitor_analyses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Only admins can create competitor analyses" 
ON public.competitor_analyses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_competitor_analyses_updated_at
  BEFORE UPDATE ON public.competitor_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_competitor_analyses_type ON public.competitor_analyses(analysis_type);
CREATE INDEX idx_competitor_analyses_created_at ON public.competitor_analyses(created_at DESC);