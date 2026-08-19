# Plano de Implementação: Modelos de Telas e Design Admin

Este plano detalha a criação de um sistema de "Modelos de Telas" (Templates) no painel administrativo, permitindo que o administrador escolha entre diferentes estilos visuais para as áreas Adulto, Infantil e Músicas.

## Alterações

### Banco de Dados
- Criar a tabela `public.ui_templates` para armazenar definições de modelos (nome, categoria: adulto/infantil/musicas, config JSON).
- Adicionar campos de seleção de template em `public.site_config` (chaves: `active_template_adulto`, `active_template_infantil`, `active_template_musicas`).
- Garantir permissões RLS e Grants para `authenticated` e `service_role`.

### Backend (Server Functions)
- Criar `src/lib/templates.functions.ts` para buscar modelos disponíveis e atualizar o modelo ativo.
- Integrar verificações de permissão (`has_permission`) para restringir quem pode trocar o design estrutural.

### Frontend (Admin)
- **Novo Componente:** `src/components/admin/templates-admin.tsx`
    - Galeria visual de modelos com miniaturas.
    - Botão "Aplicar Modelo" com confirmação.
    - Integração com `SiteConfig` para persistência.
- **Integração no Layout Admin:** Adicionar aba "Modelos de Telas" em `LayoutAdmin` e `SongsAdmin`.

### Frontend (Aplicação)
- Atualizar as rotas `/adulto`, `/infantil` e `/musicas-infantil` para ler o template ativo e renderizar o componente correspondente.
- Criar variantes de layout para as páginas principais (ex: `HeroModern` vs `HeroClassic`).

## Detalhes Técnicos
- O sistema usará o padrão de "Configuração Centralizada" via `site_config`.
- Templates infantis focarão em temas (Jungle, Sea, Sky).
- Templates adultos focarão em densidade de informação (Minimal, Grid, List).
- Músicas terão opções de player (Full Screen vs Mini Overlay).

## Próximos Passos
1. Executar migração SQL para tabelas e dados iniciais de templates.
2. Desenvolver a interface de seleção no painel Admin.
3. Refatorar as rotas para suporte a layouts dinâmicos baseados no banco de dados.
