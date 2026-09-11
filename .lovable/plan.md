# Reconstruir o Dicionário Patxôhã 2015

## Objetivo
Substituir somente a página atual do dicionário por uma versão completa, fiel às 46 páginas do PDF enviado e fácil de usar no celular e computador.

## O que será feito
- Reprocessar as 46 páginas do material e gerar novamente os verbetes nas duas direções: Português → Patxôhã e Patxôhã → Português.
- Preservar grafia, acentos, apóstrofos, variantes, páginas de origem, categorias, regras e terminações presentes no documento.
- Deduplicar apenas repetições idênticas, sem apagar traduções ou variantes distintas.
- Manter uma busca única, rápida e sem exigir acentos.
- Criar um controle direto **PT ⇄ PATXÔHÃ** para inverter a direção da consulta.
- Organizar as categorias existentes no material, incluindo família, alimentos, animais, natureza, corpo humano, verbos e números.
- Manter o áudio por palavra Patxôhã, usando gravação quando existir e leitura do dispositivo como alternativa.
- Separar a gramática, diferenciando visualmente português e Patxôhã e mantendo as regras na ordem do PDF.
- Preservar a identidade visual atual do Awã Tech; nenhuma outra página será alterada.

## Validação
- Conferir cobertura das 46 páginas e totais extraídos.
- Testar busca, inversão, filtros de categoria, áudio e gramática.
- Validar a página em computador e celular, além dos testes e da compilação do projeto.

## Detalhes técnicos
- A fonte será extraída localmente do PDF enviado, sem depender de serviços externos.
- Os dados serão armazenados em arquivos estruturados e defensivos, evitando falhas quando um registro estiver incompleto.
- A listagem continuará paginada/carregada em blocos para manter boa velocidade com milhares de verbetes.
