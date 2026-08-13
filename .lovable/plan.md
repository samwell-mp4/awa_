# Plan: Criar Seção "Cânticos Infantis Pataxó"

Implementação de uma área musical infantil interativa com foco na preservação cultural, apresentando cânticos em Pataxó e Português verso a verso, com player sincronizado e estética de "livro digital indígena".

## 1. Estrutura de Dados
- Criar `src/components/kids/canticos/songs-data.ts` para armazenar os cânticos iniciais.
- Estrutura de cada cântico:
  ```typescript
  {
    id: string;
    title: string;
    image: string;
    audio: string;
    lyrics: { pataxo: string; portugues: string; time: number }[];
    author?: string;
    culturalInfo?: string;
    credits?: string;
  }
  ```

## 2. Componentes de UI
- **SongPlayer**: Player central com controles de áudio (Play/Pause, Progresso, Tempo, Voltar/Avançar, Volume).
- **LyricColumns**: Exibição em duas colunas (Pataxó à esquerda, Português à direita) com destaque sincronizado do verso ativo.
- **SongHeader**: Cabeçalho personalizado com grafismos, bambu e elementos da floresta.
- **SongList**: Lista de seleção para a criança escolher outros cânticos.

## 3. Roteamento e Segurança
- Criar a rota principal em `src/routes/canticos-infantis.tsx`.
- Usar `requireArea("infantil")` para garantir que apenas usuários com plano infantil (ou admin) acessem.
- **NÃO exibir o menu inferior** padrão do app nesta tela, conforme solicitado.

## 4. Visual e Experiência (Kids Theme)
- Utilizar a classe `.kids-theme` global.
- Aplicar grafismos Pataxó e texturas de madeira/natureza no fundo.
- Botões grandes e acessíveis, com animações suaves (`kid-bounce`, `kid-wiggle`).
- Layout responsivo: colunas lado a lado no desktop/tablet e empilhadas no celular.

## Detalhes Técnicos
- Reutilizar a lógica de `src/lib/lyric-sync.ts` para garantir precisão na sincronização das letras.
- Implementar o estado global de interrupção de áudio ao clicar na tela (padrão já existente no projeto).
- Integrar com `useTranslation` para suportar eventuais rótulos em múltiplos idiomas.

## Próximos Passos
1. Definir o arquivo de dados `songs-data.ts`.
2. Desenvolver os componentes em `src/components/kids/canticos/`.
3. Montar a rota final integrando os componentes.
