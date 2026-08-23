# Plano de Otimização de Performance — Awã Tech

Este plano visa melhorar a velocidade de carregamento e a responsividade do site AWÃ TECH, tanto na versão adulta quanto na infantil.

## Problemas Identificados
- Lenteza percebida pelo usuário ao navegar ou carregar o site.
- Imagens pesadas e carregamento de fontes síncrono.
- Grande quantidade de componentes pesados (vídeos, players) carregados de uma vez.
- Cache de queries que pode estar sendo invalidado excessivamente ou não sendo aproveitado.

## Ações Propostas

### 1. Otimização de Imagens e Assets
- Implementar `loading="lazy"` em todas as imagens que não estão na "dobra superior" (above the fold).
- Garantir que as imagens de logo e fundo usem `fetchPriority="high"` para carregamento prioritário.
- Revisar o uso de `lovable-assets` para garantir que as URLs apontem para versões otimizadas.

### 2. Otimização de Fontes e CSS
- Adicionar `font-display: swap` nas definições de fontes (já presente, mas verificar consistência).
- Usar `preconnect` e `dns-prefetch` para os domínios de fontes e Supabase no `src/routes/__root.tsx`.
- Minimizar layouts shift (CLS) reservando espaço para imagens e vídeos.

### 3. Otimização de Dados (React Query)
- Ajustar `staleTime` e `gcTime` globalmente ou por rota para evitar refetches desnecessários.
- Implementar `prefetchQuery` para rotas comuns como `/infantil` e `/adulto` a partir da home.
- Otimizar a query de `site_config` para ser carregada uma única vez e cacheada agressivamente.

### 4. Code Splitting e Lazy Loading
- Usar `React.lazy` para componentes pesados como `GlossarioInfantil`, `VideoMenu` e ferramentas administrativas.
- Suspense em níveis granulares para não bloquear a renderização da página toda.

### 5. Otimização de Hardware e Rendering
- Aplicar `will-change: transform` e `backface-visibility: hidden` em elementos com animações frequentes.
- Usar `content-visibility: auto` em seções longas (como listas do dicionário ou músicas).

## Detalhes Técnicos
- **Ficheiros a editar:**
  - `src/routes/__root.tsx`: Otimizar preconnect e metatags.
  - `src/routes/index.tsx`: Implementar prefetch de rotas.
  - `src/routes/infantil.tsx` e `src/routes/adulto.tsx`: Lazy loading de componentes e otimização de imagens.
  - `src/components/home/logo.tsx`: Garantir prioridade alta.
  - `src/styles.css`: Adicionar otimizações de rendering CSS.
