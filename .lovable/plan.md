# Plano para corrigir a persistência dos Números

O usuário relatou que, após atualizar as palavras na seção "Aprender Números" através do painel administrativo, os dados voltam ao estado anterior após atualizar a página ou sair e entrar novamente.

## Problema Identificado
Ao analisar o código em `src/routes/aprender-numeros.tsx`, notei que a lógica de tradução automática (`useAutoTranslate`) pode estar sobrescrevendo os valores exibidos. O componente usa `NUMEROS.map(n => n.pt)` para gerar a lista de tradução, e se a tradução falhar ou estiver em cache com valores antigos, ela pode exibir dados incorretos.

No entanto, o sintoma principal ("as letras volta antigo") sugere que o carregamento inicial ou a persistência no banco de dados não está refletindo as mudanças salvas.
1. O painel admin em `src/components/admin/numbers-admin.tsx` salva no `site_config` com a chave `aprender_numeros`.
2. A rota pública `src/routes/aprender-numeros.tsx` carrega esses dados.
3. Se a tradução automática estiver ativa (idioma diferente de PT), ela traduz os textos.

## Ações Propostas

### 1. Corrigir a Interface de Administrador
* Garantir que o estado `busy` seja gerenciado corretamente para evitar que o usuário saia antes do término do upload.
* Adicionar logs de erro mais claros.

### 2. Otimizar a Rota de Exibição
* Ajustar `src/routes/aprender-numeros.tsx` para garantir que o `useMemo` que processa os números seja robusto.
* Verificar se o `useAutoTranslate` está interferindo quando o idioma é Português (onde não deveria agir).

### 3. Verificar Sincronização de Cache
* Invalidação forçada do cache do React Query após o salvamento no admin para garantir que a rota pública receba os dados frescos.

## Detalhes Técnicos
* Arquivos a editar:
    * `src/components/admin/numbers-admin.tsx`: Refinar lógica de salvamento e feedback.
    * `src/routes/aprender-numeros.tsx`: Garantir que os dados do banco tenham prioridade absoluta sobre o `DEFAULT_NUMEROS` e verificar comportamento do `useAutoTranslate`.
* Verificar se a tabela `site_config` está recebendo o JSON correto.

**Nota:** O usuário mencionou que "as letras volta antigo". Isso geralmente acontece quando o `initialState` ou um `fallback` (como o `DEFAULT_NUMEROS`) é renderizado por engano ou quando a atualização do banco falha silenciosamente.
