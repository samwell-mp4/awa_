CREATE TABLE public.user_settings (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    voice_model text DEFAULT 'google/gemini-2.5-flash',
    assistant_name text DEFAULT 'Professor Akuã',
    language text DEFAULT 'pt-BR',
    lingua_ancestral text DEFAULT 'Patxôhã',
    instrucao text DEFAULT 'Fale com sabedoria, calma e respeito. Ensine com a voz do povo Pataxó.',
    respostas_em_voz boolean DEFAULT true,
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
ON public.user_settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);