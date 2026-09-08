# Plano: modernização global de UI/UX Awã Tech

## Direção aprovada
- **Cores:** Mata e coral — floresta `#123524`, mata `#3E7C4F`, coral `#E46F51` e creme `#FFF5E8`.
- **Tipografia:** Sora nos títulos e Manrope nos textos.
- **Organização:** composição editorial, com hierarquia clara, imagens fortes e menos aparência de “cartões empilhados”.
- Preservar a identidade adulta escura e premium e a identidade infantil viva e lúdica.

## Etapa 1 — Base consistente e acessível
- Atualizar os tokens globais de cor, tipografia, borda, foco, sombra, espaçamento e movimento.
- Criar variantes consistentes para botões adultos e infantis, com alvos de toque adequados e estados hover, ativo, foco e desabilitado.
- Padronizar campos, áreas de conteúdo, mensagens de carregamento, vazio, erro e sucesso.
- Adicionar atalho “Pular para o conteúdo”, foco de teclado claro e suporte a movimento reduzido.

## Etapa 2 — Navegação e estrutura compartilhada
- Refinar cabeçalho adulto e infantil, mantendo menus e permissões existentes.
- Unificar a apresentação dos rodapés públicos sem remover links legais ou informações de pagamento.
- Melhorar legibilidade, contraste e espaçamentos no celular e computador.
- Remover dependência de cores soltas nos elementos compartilhados e usar os novos tokens.

## Etapa 3 — Páginas e fluxos principais
- Aplicar hierarquia editorial à página inicial sem trocar textos, imagens, vídeos ou destinos.
- Padronizar títulos, ações, filtros, listas e estados nas áreas Adulto, Infantil, Dicionário, Trilhas, Músicas, Histórias, Jogos, Planos, Conta e Autenticação.
- Preservar players, áudio, tradução, assinatura, proteção de acesso e administração.
- Garantir que a área de cânticos mantenha seu desenho infantil específico e sem menu inferior.

## Etapa 4 — Administração e formulários
- Unificar botões, campos, seções, feedback e densidade visual do painel administrativo.
- Melhorar leitura, navegação por teclado, áreas de toque e organização de formulários longos.
- Manter permissões, salvamento, prévias e gerenciamento de conteúdo inalterados.

## Verificação
- Validar rotas principais em desktop e celular, incluindo menus, formulários, filtros, áudio e vídeos.
- Conferir ausência de sobreposição, corte de texto, rolagem horizontal e estados vazios/carregando.
- Executar testes direcionados e confirmar compilação sem erros.

## Detalhes técnicos
- Centralizar estilos em tokens semânticos no CSS global e componentes compartilhados.
- Migrar gradualmente controles repetidos para componentes existentes, sem refatorar regras de negócio.
- Manter animações curtas e leves; desativá-las quando o dispositivo solicitar movimento reduzido.
- Não alterar banco de dados, autenticação, pagamentos ou conteúdo cultural.
