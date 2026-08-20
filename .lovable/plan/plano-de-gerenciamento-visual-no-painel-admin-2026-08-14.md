# Plano de Gerenciamento Visual no Painel Admin

Implementar uma nova aba "Design & Layout" no painel administrativo para permitir a customização visual das rotas (cores, emojis e assets) sem necessidade de alteração no código.

## Alterações

### 1. Banco de Dados (Supabase)
- Criar a tabela `site_config` para armazenar as configurações globais e de rotas.
- Habilitar RLS e permissões para administradores.
- Inserir os dados iniciais baseados nas constantes atuais (`hotspots` e `navGroups`).

### 2. Backend (TanStack Start)
- Criar `src/lib/admin-layout.functions.ts` com funções para ler e salvar as configurações.

### 3. Painel Administrativo
- Criar `src/components/admin/layout-admin.tsx` com interface para editar:
  - **Menu Infantil**: Alterar ícones (emojis), nomes e cores dos atalhos.
  - **Identidade**: Trocar links de logos e vídeos de fundo.
  - **Traduções Rápidas**: Atalho para editar termos comuns do menu.
- Adicionar a aba "Design" em `src/routes/_authenticated/admin.tsx`.

### 4. Componentização
- Atualizar `src/routes/infantil.tsx` para buscar os hotspots dinamicamente do banco de dados (via query com fallback para as constantes atuais).
- Atualizar `src/lib/home-content.ts` (ou criar um hook) para consumir as configurações dinâmicas de navegação.

## Detalhes Técnicos
- A tabela `site_config` terá uma estrutura de chave-valor ou JSON para flexibilidade: `key` (ex: `infantil_hotspots`), `value` (JSON).
- Uso de `useQuery` para garantir que o cache seja invalidado ao salvar alterações no admin.

## Segurança
- Todas as operações de escrita serão protegidas pelo middleware `requireSupabaseAuth` e validação da role `admin` no servidor.
