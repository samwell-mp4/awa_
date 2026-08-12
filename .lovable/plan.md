# Auditoria completa e responsividade total

O app tem 30+ rotas (adulto, infantil, jogos, músicas, trilhas, dicionário, admin, auth, etc.). Vou fazer em 3 fases:

## Fase 1 — Diagnóstico (sem alterar código)
1. Rodar build/typecheck e capturar erros reais.
2. Rodar Playwright headless nas rotas principais (`/`, `/adulto`, `/infantil`, `/jogos`, `/musicas`, `/trilhas`, `/dicionario`, `/auth`, `/planos`, `/minha-conta`) em 3 viewports: **mobile 375px**, **tablet 768px**, **desktop 1280px**.
3. Coletar: erros de console, requests que falham, elementos que estouram tela horizontalmente, textos cortados, botões inacessíveis.
4. Rodar security scan do backend.

## Fase 2 — Correções
5. Corrigir qualquer erro de runtime/build encontrado.
6. Corrigir warnings `inputValidator` → `validator` nos server functions.
7. Ajustar componentes com problemas de responsividade usando o padrão:
   - Headers com `grid grid-cols-[minmax(0,1fr)_auto]` + `min-w-0` + `truncate`
   - Grids de cards adaptativos (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
   - Tipografia fluida (`text-base sm:text-lg lg:text-xl`)
   - Padding responsivo (`px-4 sm:px-6 lg:px-8`)
   - Menus/navegação com versão mobile (sheet/drawer)

## Fase 3 — Validação
8. Re-testar as mesmas rotas nos 3 viewports.
9. Anexar screenshots comparativos.
10. Publicar a nova versão.

## Escopo importante
- **Não** vou refazer o design (cores, fontes, layout geral) — só ajustar quebras.
- **Não** vou mexer em lógica de negócio, banco de dados ou pagamentos, a menos que encontre um bug real.
- Foco em: crashes, links quebrados, layout quebrado em mobile/tablet.

## Tempo estimado
Isto é uma tarefa grande (30+ rotas × 3 viewports = ~90 checagens). Vou trabalhar em várias mensagens: uma para diagnóstico, uma ou mais para correções priorizadas por gravidade.

Confirma que posso seguir?
