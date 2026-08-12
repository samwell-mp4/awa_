# Plano de Implementação: Professor Akuã Infantil

Adicionar o Professor Akuã à área infantil do site, integrando-o com o dicionário Patxôhã completo para responder a perguntas de alunos (crianças) com uma interface lúdica e voz humana.

## Alterações

### 1. Backend & Lógica
- **`src/lib/akua-chat.functions.ts`**:
    - Atualizar o `handler` para aceitar um parâmetro `mode: 'adulto' | 'infantil'`.
    - Ajustar o `system prompt` quando o modo for `infantil`: tom mais simples, lúdico, encorajador e focado em crianças.
    - Garantir que o dicionário completo seja carregado (como já é feito, mas reforçando a prioridade de busca).

### 2. Componentes UI (Kids)
- **`src/components/kids/akua-chat-kids.tsx`** (Novo):
    - Criar um componente de chat com design "kids-theme" (cores vibrantes, bordas arredondadas, ícones amigáveis).
    - Integrar com `askAkua` e `speakText` (TTS).
    - Usar a voz `google/gemini-2.0-flash` (ou equivalente já configurado) com tom acolhedor.
    - Incluir animação do Professor Akuã (avatar).

### 3. Integração na Navegação Infantil
- **`src/routes/infantil.tsx`**:
    - Adicionar um novo "hotspot" ou botão flutuante para acessar o Professor Akuã.
- **`src/routeTree.gen.ts`**: (Gerado automaticamente, mas a nova rota deve ser criada).
- **`src/routes/professor-infantil.tsx`** (Novo):
    - Rota dedicada para o chat infantil, protegida por `AreaGate`.

### 4. Dicionário no Chat
- Garantir que o Professor Akuã no modo infantil explique palavras do dicionário Patxôhã de forma didática, comparando com a natureza e o cotidiano da criança.

## Detalhes Técnicos
- O chat usará a `createServerFn` `askAkua` já existente, otimizada com o novo prompt.
- Design seguirá o padrão de "placas de madeira" e elementos da floresta já presentes na área infantil.
- Suporte multi-idioma via `i18next`.

## Verificação
- Testar o chat no modo infantil com perguntas simples ("O que é Awere?").
- Verificar se a voz é reproduzida automaticamente após a resposta.
- Validar o layout responsivo em dispositivos móveis.
