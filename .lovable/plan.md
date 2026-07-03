
## O que está quebrado hoje

1. **Grátis vira Premium (e vice-versa) entre preview e produção.** A função `has_premium_access` no banco não filtra por `environment`, então uma assinatura de teste desbloqueia o app publicado, e uma assinatura ao vivo não é reconhecida na preview.
2. **Assinatura vencida continua liberando.** A função ignora `current_period_end` — se o webhook não atualizar o status, o acesso nunca expira.
3. **Cancelamento tira acesso na hora.** Você escolheu: quem cancelar deve continuar Premium até o fim do período pago. Hoje isso não acontece.
4. **`past_due` some.** Quando o cartão falha, nada aparece na tela.
5. **Sem portal do cliente.** Assinante não consegue cancelar, trocar cartão ou ver faturas de dentro do app.
6. **Retorno do checkout mudo.** `/planos?checkout=success` não avisa "processando pagamento" nem força recarga enquanto o webhook chega.
7. **Sem páginas legais.** Termos, Reembolso e Privacidade não existem — sem elas a Paddle não libera cobrança real.
8. **Sem "esqueci a senha".** Reset de senha não tem rota.
9. **Sair não limpa cache.** Ao trocar de usuário, dados Premium do usuário anterior ficam em memória.

## Como vou consertar

### 1. Regra de acesso Premium (migration)
Nova função `has_active_subscription(user_id, check_env)`:
- Filtra por `environment` (sandbox/live corretos).
- Aceita `active`/`trialing` **enquanto `current_period_end` for futuro**.
- Aceita `canceled` **enquanto `current_period_end` for futuro** (mantém acesso até o fim do período pago — cancelamento no fim do ciclo).
- Trata `past_due` como ativo por 3 dias após `current_period_end` (janela de tentativa de recobrança da Paddle).

Reescrevo `has_premium_access(user_id, check_env)` para usar essa lógica + isenção de admin. Assinatura antiga continua chamando com o env correto.

### 2. Hook e guarda de servidor
- `useSubscription`: passar `env` para a RPC, expor `status`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `plan` (mensal/semestral) para a tela de conta.
- `assertPremium` (servidor): passar `env` derivado da assinatura mais recente do usuário e admin.

### 3. Portal do cliente Paddle + tela "Minha assinatura"
- Nova server function `openCustomerPortal({ subscriptionId })` — cria sessão do portal via SDK Paddle e retorna URL.
- Nova rota `/minha-conta` (protegida por `_authenticated`):
  - Mostra plano atual, próxima cobrança, status (com aviso de `past_due`).
  - Botão "Gerenciar assinatura" abre portal Paddle em nova aba.
  - Botão "Sair da conta" com limpeza correta de cache.
  - Se não for Premium, mostra CTA para `/planos`.
- Adiciono link "Minha conta" no menu.

### 4. UX de checkout
- `/planos?checkout=success`: toast "Pagamento recebido, processando…", `refetch` da assinatura a cada 2s por 30s, redireciona para `/minha-conta` quando `isPremium` virar true.

### 5. Páginas legais (obrigatórias pela Paddle)
Vendedor: **Akuã** (pessoa física). Crio três rotas públicas:
- `/termos` — Termos de Uso (com cláusulas obrigatórias: identificação do vendedor, Paddle como Merchant of Record, uso aceitável, IP, IA generativa, suspensão).
- `/reembolso` — Política de Reembolso (30 dias, via paddle.net).
- `/privacidade` — Política de Privacidade (Akuã como controladora, categorias de dados, Paddle como recipient, LGPD).
Linko as três no rodapé.

### 6. Reset de senha
- Rota pública `/reset-password` que consome o hash `type=recovery` e chama `updateUser({ password })`.
- Link "Esqueci minha senha" na tela `/auth` que dispara `resetPasswordForEmail` com `redirectTo` correto.

### 7. Higiene de sign-out
- Nova função `signOut()` compartilhada: `queryClient.cancelQueries()` → `clear()` → `supabase.auth.signOut()` → `navigate('/auth', {replace:true})`.

## Como testar na preview

O banner laranja "Modo de teste" fica visível no topo — se ele aparecer, estamos em sandbox.

**Fluxo de assinar:**
1. Criar conta em `/auth`.
2. Ir em `/planos` → "Assinar Mensal".
3. No checkout Paddle, usar cartão **`4242 4242 4242 4242`**, CVC `123`, validade qualquer data futura, CEP qualquer.
4. Voltar para `/planos?checkout=success` → aparece "Pagamento recebido…" → redireciona para `/minha-conta` em poucos segundos.
5. Conferir se Dicionário, Trilhas, Professor Akuã, Tradutor, Vídeos e Músicas abrem sem paywall.

**Fluxo de cancelar (mantém acesso):**
1. Em `/minha-conta`, "Gerenciar assinatura" → cancelar no portal Paddle.
2. Voltar ao app → status mostra "Cancelada, ativa até DD/MM" → conteúdo Premium continua liberado.

**Testar cartão recusado:**
- Usar `4000 0000 0000 0002` no checkout → deve mostrar erro sem criar assinatura.

**Testar past_due:**
- Assinar com `4000 0027 6000 3184` (sucede na hora, falha na renovação). Para forçar a renovação, avanço a data de cobrança pela API Paddle — posso rodar isso pra você depois.

**Para ir ao vivo** (aceitar dinheiro real), publicar o app e clicar "Verify" em `?view=payments`. As páginas legais que vou criar cobrem o readiness check.
