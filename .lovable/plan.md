# Sistema multilíngue completo (PT / EN / ES + Patxohã fixo)

Decisões que assumi (você pulou as perguntas):
- **Estratégia:** adicionar colunas `*_en` e `*_es` nas tabelas de conteúdo e preencher automaticamente via Lovable AI numa migração-única + botão no admin para re-traduzir. Fallback para PT quando vazio.
- **Patxohã:** permanece intocado nos campos originais (`pt_word`, `letra`, `texto_patxoha`) e é sempre exibido junto da tradução escolhida em músicas, dicionário, saudações, missão e histórias.

## O que muda no banco

Adicionar colunas de tradução (todas nullable, default NULL) em:

- `dictionary`: `meaning_en`, `meaning_es`, `example_en`, `example_es`
- `songs`: `title_en`, `title_es`, `artist_en`, `artist_es`, `description_en`, `description_es`
- `daily_mission`: `question_en`, `question_es`, `options_en jsonb`, `options_es jsonb`
- `daily_video`: `title_en`, `title_es`, `description_en`, `description_es`
- `trails`: `name_en`, `name_es`, `description_en`, `description_es`
- `ambient_videos`: `title_en`, `title_es`

Patxohã não ganha coluna nova — já está no campo original.

## Backend

- Nova server function `translateContentRow` (admin-only, usa AI Gateway) que traduz uma linha inteira e grava as colunas `_en` / `_es`.
- Nova server function `translateAllContent` que roda em batch por tabela (com progresso). Exposta como botão no admin.
- Após a migração, disparo `translateAllContent` uma vez para popular tudo.

## Frontend

- Helper `pickLang(row, lang, field)` que retorna `row[field+'_'+lang] || row[field]`.
- Refactor dos componentes de leitura para usar `pickLang`:
  - `musicas.tsx` (galeria + player) — mostra título/artista/descrição no idioma; letra Patxohã sempre visível.
  - `dicionario.tsx` — significado no idioma; palavra Patxohã sempre em destaque.
  - `daily-mission-card.tsx`, `greeting-of-moment.tsx`, `daily-video`, `trails-grid`, `trilhas.$slug` — mesmo padrão.
- Remover o `useAutoTranslate` runtime desses componentes (agora vem do banco).
- Troca de idioma continua instantânea (i18next já faz).

## Admin

- Novo painel "Traduções" com botão "Traduzir tudo agora" e "Retraduzir esta linha" em cada tabela existente do admin.

## Fora do escopo (confirmar depois)

- Áudio TTS multilíngue (narração do Professor Akuã) — pode ser adicionado num segundo passo.
- Tradução de vídeos gravados (só metadados mudam; áudio original permanece).

## Ordem de execução

1. Migração SQL (adiciona colunas).
2. Server functions de tradução.
3. UI de admin (botão "traduzir tudo").
4. Refactor dos componentes de leitura com `pickLang`.
5. Rodar tradução em massa uma vez.

Aprove para eu executar — começo pela migração.