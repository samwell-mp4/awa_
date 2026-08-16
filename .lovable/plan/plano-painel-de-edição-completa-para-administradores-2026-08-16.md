# Plano: Painel de Edição Completa para Administradores

Implementar uma interface administrativa unificada para gerenciar conteúdos e configurações tanto da área adulta quanto infantil, permitindo que o administrador altere textos, imagens e layouts diretamente pelo painel.

## Ações e Alterações

### Configuração do Banco de Dados
- Criar a tabela `site_config` no banco de dados para armazenar configurações dinâmicas de layout, textos e branding.
- Definir chaves como `landing_hero`, `branding_adulto`, `branding_infantil`, `menu_links` e `admin_permissions`.
- Configurar RLS e privilégios para permitir apenas administradores editarem essas configurações.

### Expansão do Painel Admin
- **Nova aba "Site Geral":** Interface para editar o Hero da landing page (títulos, descrições, vídeos de fundo).
- **Gerenciador de Mídia:** Upload ou troca de URLs de logos e vídeos promocionais para ambos os perfis.
- **Edição de Menus:** Permitir adicionar ou remover itens dos menus globais e infantis diretamente pelo painel.
- **Visual Builder Simples:** Controles para mudar cores primárias e tokens visuais (gradientes, sombras) que refletem em todo o site.

### Integração no Frontend
- Atualizar a Landing Page (`src/routes/index.tsx`) para consumir dados dinâmicos do `site_config` em vez de objetos fixos como `MENU_I18N`.
- Sincronizar as rotas `/adulto` e `/infantil` com o branding definido no admin.
- Implementar um sistema de cache/revalidação para garantir que as mudanças no painel reflitam instantaneamente no site para todos os usuários.

## Detalhes Técnicos
- Utilização de `createServerFn` para operações de leitura e escrita seguras no servidor.
- Migração de estados locais hardcoded para consultas via TanStack Query no componente raiz.
- Interface administrativa construída com componentes shadcn/ui customizados para o tema AWÃ TECH.
- Armazenamento de configurações complexas em formato JSONB no Supabase para flexibilidade.
