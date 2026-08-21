# Plano de Otimização de Performance - Awã Tech

O objetivo deste plano é reduzir o tempo de carregamento (LCP e FCP) e melhorar a interatividade geral do site, otimizando o carregamento de imagens, vídeos e fontes, além de implementar técnicas de pré-carregamento e lazy loading.

## Alterações Propostas

### 1. Otimização de Assets e Imagens
- **Lazy Loading em Massa**: Garantir que todas as imagens de cards e seções secundárias usem `loading="lazy"`.
- **Fetch Priority**: Definir `fetchPriority="high"` apenas para o Hero e Logo principal em cada página para acelerar o LCP.
- **Tamanho das Imagens**: Ajustar os atributos `width` e `height` em componentes como `Logo` e `ExperienceCard` para evitar Layout Shifts.
- **Backgrounds**: Substituir backgrounds pesados por versões otimizadas ou usar `linear-gradient` como placeholder enquanto a imagem carrega.

### 2. Otimização de Vídeos
- **Preload="none"**: Configurar `preload="none"` para vídeos de apresentação que não estão em destaque imediato.
- **Video Menu**: Garantir que o vídeo de fundo da área infantil seja o menor possível e use `preload="auto"` com cautela.

### 3. Melhorias na Interatividade e Audio
- **Prefetch de Audio**: Expandir o uso de `prewarmNarration` para trilhas e histórias, garantindo que o áudio esteja pronto antes do clique.
- **Web Speech API**: Manter o uso da API nativa do navegador para fala, que é instantânea e não consome banda.

### 4. Refatoração de Componentes (Performance)
- **Code Splitting**: Verificar se componentes pesados como o `GlossarioInfantil` podem ser carregados sob demanda se necessário (embora o TanStack Router já ajude nisso).
- **CSS**: Mover animações pesadas para `will-change` se necessário para garantir 60fps em dispositivos móveis.

## Detalhes Técnicos
- **LCP (Largest Contentful Paint)**: Foco na imagem `infantil-logo-new.jpg` e no vídeo do menu infantil.
- **CLS (Cumulative Layout Shift)**: Definir dimensões fixas para containers de imagem.
- **TBT (Total Blocking Time)**: Otimizar o carregamento de fontes (Fredoka, Baloo 2, Plus Jakarta Sans) via `<link rel="preload">` no `__root.tsx`.

---
*Nota: Este plano foca em melhorias de performance sem alterar o design visual aprovado pelo usuário.*
