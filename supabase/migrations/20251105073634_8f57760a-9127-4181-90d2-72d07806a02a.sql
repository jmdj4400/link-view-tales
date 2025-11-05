-- Create leads table for capturing contact information
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'contact_form',
  form_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for leads
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = user_id);

-- Create lead_forms table for customizable forms
CREATE TABLE public.lead_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Form fields configuration
  collect_name BOOLEAN DEFAULT true,
  collect_phone BOOLEAN DEFAULT false,
  collect_message BOOLEAN DEFAULT true,
  custom_fields JSONB,
  
  -- Styling
  button_text TEXT DEFAULT 'Submit',
  success_message TEXT DEFAULT 'Thank you! We''ll be in touch soon.',
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  redirect_url TEXT,
  send_confirmation_email BOOLEAN DEFAULT false,
  
  -- Analytics
  submission_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on lead_forms
ALTER TABLE public.lead_forms ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead_forms
CREATE POLICY "Users can view own forms"
  ON public.lead_forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public forms are viewable"
  ON public.lead_forms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can insert own forms"
  ON public.lead_forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms"
  ON public.lead_forms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms"
  ON public.lead_forms FOR DELETE
  USING (auth.uid() = user_id);

-- Add form_id foreign key to leads
ALTER TABLE public.leads ADD CONSTRAINT leads_form_id_fkey 
  FOREIGN KEY (form_id) REFERENCES public.lead_forms(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_form_id ON public.leads(form_id);
CREATE INDEX idx_lead_forms_user_id ON public.lead_forms(user_id);

-- Add trigger for lead_forms updated_at
CREATE TRIGGER update_lead_forms_updated_at
  BEFORE UPDATE ON public.lead_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment submission count
CREATE OR REPLACE FUNCTION increment_form_submissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.form_id IS NOT NULL THEN
    UPDATE lead_forms
    SET submission_count = COALESCE(submission_count, 0) + 1
    WHERE id = NEW.form_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to increment submission count
CREATE TRIGGER on_lead_submission
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION increment_form_submissions();