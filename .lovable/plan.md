# Plano de Implementação: Controle de Acesso e Gestão Dinâmica (Adulto e Infantil)

O objetivo é expandir o painel administrativo para permitir o controle total e independente das áreas Adulto e Infantil, conforme solicitado pelo administrador principal.

## Ações Propostas

### 1. Backend e Estrutura de Dados
- **Configurações Dinâmicas**: Expansão da tabela `site_config` para suportar novas chaves de layout específicas para a área Adulta (Hero, banners, links).
- **Gerenciamento de Módulos**: Adição de flags na tabela `site_config` para ativar/desativar módulos inteiros (ex: esconder Dicionário ou Trilhas temporariamente) via admin.

### 2. Painel Administrativo (Novo e Expandido)
- **Aba "Experiências"**: Nova seção centralizada para alternar entre a gestão da área Adulto e Infantil.
- **Editor Adulto**:
    - Gerenciar o Hero da página `/adulto` (Título, Subtítulo, Imagem).
    - Configurar os cards de "Trilhas em Destaque".
- **Editor Infantil**:
    - Melhorar a gestão de "Hotspots" (atalhos do mapa).
    - Upload direto de novos vídeos de fundo e logos para a área mirim.
- **Aba "Conteúdo Mestre"**:
    - Interface unificada para Dicionário, Músicas e Trilhas, com filtros por público-alvo (Adulto/Infantil).

### 3. Integração na Interface do Usuário
- **Landing Page Dinâmica**: Atualizar `src/routes/index.tsx` para ler as labels e visibilidade das experiências diretamente do banco.
- **Hubs Contextuais**: Garantir que `src/routes/adulto.tsx` e `src/routes/infantil.tsx` respeitem as cores, imagens e textos definidos no painel admin em tempo real.

## Detalhes Técnicos
- Utilização de `createServerFn` para persistência segura no banco de dados.
- Revalidação de cache via TanStack Query (`invalidateQueries`) para que as mudanças apareçam instantaneamente para os usuários.
- Preservação do bypass de paywall para administradores, garantindo que o teste das mudanças seja fluido.
