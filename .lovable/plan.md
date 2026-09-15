# Documentário do Intercâmbio Cultural e Territorial

## O que encontrei na pasta do Drive
- Um único vídeo: **Aroeira ajustes.mp4**, com **4,58 GB**, compartilhado por link.

## O que será feito
- Criar uma seção "Documentário" dentro da página do Intercâmbio Cultural e Territorial.
- Player bonito, escuro, no mesmo estilo do site, funcionando em celular e computador, com tela cheia.
- O documentário toca como uma única peça, com áudio original e sincronizado.
- Nenhuma outra página é alterada.

## Sobre dividir o vídeo em partes de 250 MB
Um vídeo de 4,58 GB daria cerca de 19 partes. Eu consigo dividir sem perder trechos e sem
mexer em áudio e vídeo (corte direto, sem recompressão), mas para isso o arquivo precisa ser
baixado, cortado e depois publicado na hospedagem do site — são muitos gigabytes de download
e envio, o processo é demorado e pode falhar no meio.

Existe um caminho mais simples e imediato: exibir o vídeo direto do Google Drive dentro do
site, em um player integrado à página. Não precisa dividir nada, o áudio vem junto, e o vídeo
já fica disponível hoje. A única exigência é que a pasta continue compartilhada por link.

## Arquivos que serão modificados
- `src/routes/intercambio.tsx` — nova seção do documentário.
- `src/components/aldeia-velha/documentario.tsx` — novo player (arquivo novo).
- `src/lib/aldeia-velha-content.ts` — título, descrição e endereço do documentário.

## Verificação
- Abrir a página do Intercâmbio, tocar o documentário e conferir imagem e som.
- Testar em celular e computador, incluindo tela cheia.
