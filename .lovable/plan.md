# Plano de Implementação: Portal Admin de Acesso Rápido

Integração de um overlay de login administrativo com credenciais simplificadas (`admin` / `awa2026`) conforme solicitado, mantendo a hierarquia visual organizada no painel.

## 1. Login Administrativo (Overlay)
- Implementar um componente de overlay em `src/routes/_authenticated/admin.tsx` que aparece caso o usuário ainda não tenha validado o acesso rápido (`localStorage.getItem('adminLogado') !== 'sim'`).
- O design seguirá exatamente o padrão solicitado: fundo gradiente verde escuro, card central branco com sombras e inputs estilizados.
- As credenciais padrão serão `admin` e `awa2026`, mas serão lidas dinamicamente das configurações do banco de dados (tabela `site_config`, chave `menu_hamburguer` que agora contém `admin_user` e `admin_pass`).

## 2. Painel Administrativo (Layout)
- Adicionar a aba **Acesso & Login** no componente `LayoutAdmin` (`src/components/admin/layout-admin.tsx`).
- Nesta aba, permitir que o administrador altere o usuário e a senha do acesso rápido.
- O mapeamento dos menus seguirá a árvore solicitada:
  - **Aparência**: Hotspots infantis, logos, vídeos de fundo.
  - **Conteúdo**: Textos globais, landing page.
  - **Acesso & Login**: Credenciais de emergência.

## 3. Segurança & Persistência
- O estado de "logado no portal rápido" será persistido no `localStorage`.
- Este sistema funciona como uma camada de UI sobre o RBAC do Supabase, garantindo que mesmo um usuário logado com Google precise da senha do painel para operar as ferramentas administrativas críticas se assim configurado.

## Detalhes Técnicos
- **Local:** `src/routes/_authenticated/admin.tsx` e `src/components/admin/layout-admin.tsx`.
- **Configuração**: Chave `menu_hamburguer` na tabela `site_config`.
- **Estilo**: Tailwind CSS para replicar o design inline solicitado (green gradient, white card).
