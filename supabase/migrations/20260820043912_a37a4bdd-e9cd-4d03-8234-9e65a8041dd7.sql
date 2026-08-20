-- =============================================
-- TABELAS PARA INTEGRAÇÃO PADDLE — Awã Tech
-- =============================================

-- Tabela de Clientes Paddle
CREATE TABLE IF NOT EXISTS public.paddle_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  paddle_customer_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permissões
GRANT SELECT ON public.paddle_customers TO authenticated;
GRANT ALL ON public.paddle_customers TO service_role;

-- RLS
ALTER TABLE public.paddle_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer record" ON public.paddle_customers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Índice para buscas rápidas na tabela de assinaturas existente
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_customer_id ON public.subscriptions(paddle_customer_id);

-- Adicionar campos de agendamento na tabela de assinaturas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='scheduled_change_action') THEN
    ALTER TABLE public.subscriptions ADD COLUMN scheduled_change_action TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='scheduled_change_at') THEN
    ALTER TABLE public.subscriptions ADD COLUMN scheduled_change_at TIMESTAMPTZ;
  END IF;
END $$;
