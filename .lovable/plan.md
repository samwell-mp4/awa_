# Plano de Implementação: Upload e Gravação de Áudio no Admin Infantil

Adicionar a funcionalidade de upload e gravação de áudio no painel administrativo para as seções "Aprender Números", "Músicas", "Histórias", "Jogos" e "Trilhas", permitindo a atualização instantânea de conteúdos via celular ou desktop.

## Alterações Propostas

### Backend & Segurança
- As tabelas e o bucket de storage `songs` já existem e possuem permissões configuradas.
- O admin utilizará o cliente `supabaseAdmin` (em server functions) ou o cliente comum com RLS (dependendo da operação) para gerenciar os arquivos.

### Frontend (Componentes Admin)
- **Aprender Números (`src/components/admin/numbers-admin.tsx`)**:
  - [X] Substituir campos de URL de áudio pelo componente `UploadOrUrl`.
  - [X] Implementar lógica de upload para o bucket `songs`.
- **Músicas (`src/components/admin/songs-admin.tsx`)**:
  - [ ] Validar se o componente `UploadOrUrl` está funcionando para áudio e capas.
  - [ ] Garantir que o prefixo de storage seja organizado (`audio/`, `covers/`).
- **Histórias, Jogos e Trilhas**:
  - Atualmente, estas seções usam dados estáticos em arquivos de rota ou JSON.
  - O plano é migrar gradualmente para `site_config` ou tabelas dedicadas para permitir edição dinâmica.
  - **Histórias**: Criar aba no Admin para gerenciar `STORIES` via `site_config` com suporte a upload de áudio/imagem.
  - **Jogos**: Criar aba no Admin para gerenciar `GAMES` via `site_config` com suporte a upload de áudio/ícones.
  - **Trilhas**: Criar aba no Admin para gerenciar `totemStyles` e descrições via `site_config`.

## Detalhes Técnicos
- Utilizar `supabase.storage.from("songs").upload()` para envio de arquivos.
- Utilizar `createSignedUrl` para gerar links de acesso (já configurado para 1 ano).
- Integrar o componente de áudio do navegador para gravação direta (opcional, dependendo da API do dispositivo).

## Verificação
- Testar upload de um arquivo MP3 no admin de Números.
- Verificar se o áudio reflete na página `/aprender-numeros`.
- Testar acesso via celular para garantir que o input de arquivo abre a galeria/gravador.
