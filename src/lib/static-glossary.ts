/**
 * Glossário estático PT → EN/ES para textos curtos dos jogos e trilhas infantis.
 * Usado pelo useAutoTranslate antes de chamar a IA, garantindo que o espanhol
 * e o inglês apareçam imediatamente (mesmo offline ou com a IA lenta).
 */
type Entry = { en: string; es: string };

export const STATIC_GLOSSARY: Record<string, Entry> = {
  // Navegação / ações
  "Aldeia": { en: "Village", es: "Aldea" },
  "Menu": { en: "Menu", es: "Menú" },
  "Próximo": { en: "Next", es: "Siguiente" },
  "De novo": { en: "Again", es: "Otra vez" },
  "Jogar de novo": { en: "Play again", es: "Jugar otra vez" },
  "Tentar de novo": { en: "Try again", es: "Intentar de nuevo" },
  "Nova rodada": { en: "New round", es: "Nueva ronda" },
  "Rodada": { en: "Round", es: "Ronda" },
  "Começar!": { en: "Start!", es: "¡Empezar!" },
  "Limpar": { en: "Clear", es: "Borrar todo" },
  "Borracha": { en: "Eraser", es: "Goma" },
  "Tamanho": { en: "Size", es: "Tamaño" },
  "Desenho:": { en: "Drawing:", es: "Dibujo:" },

  // Jogos — títulos e descrições
  "Jogos Awã Tech": { en: "Awã Tech Games", es: "Juegos Awã Tech" },
  "Escolha um jogo e vamos brincar na aldeia!": {
    en: "Pick a game and let's play in the village!",
    es: "¡Elige un juego y vamos a jugar en la aldea!",
  },
  "Jogos em Inglês": { en: "Games in English", es: "Juegos en inglés" },
  "Aprenda inglês brincando!": { en: "Learn English by playing!", es: "¡Aprende inglés jugando!" },
  "Memória da Floresta": { en: "Forest Memory", es: "Memoria del Bosque" },
  "Ache os pares de bichos e plantas.": {
    en: "Find the pairs of animals and plants.",
    es: "Encuentra las parejas de animales y plantas.",
  },
  "Pares Patxôhã": { en: "Patxôhã Pairs", es: "Parejas Patxôhã" },
  "Ligue a palavra ao desenho certo.": {
    en: "Match the word to the right picture.",
    es: "Une la palabra con el dibujo correcto.",
  },
  "Caça aos Bichos": { en: "Animal Hunt", es: "Caza de Animales" },
  "Toque no bichinho antes que ele suma!": {
    en: "Tap the animal before it disappears!",
    es: "¡Toca al animalito antes de que desaparezca!",
  },
  "Acerte a Palavra": { en: "Guess the Word", es: "Acierta la Palabra" },
  "Veja a figura e toque na palavra certa.": {
    en: "Look at the picture and tap the right word.",
    es: "Mira la figura y toca la palabra correcta.",
  },
  "Ordene os Números": { en: "Order the Numbers", es: "Ordena los Números" },
  "Coloque os números do menor ao maior.": {
    en: "Put the numbers from smallest to biggest.",
    es: "Coloca los números de menor a mayor.",
  },
  "Junte a Cor ao Nome": { en: "Match Color to Name", es: "Une el Color al Nombre" },
  "Toque na cor certa para cada nome.": {
    en: "Tap the right color for each name.",
    es: "Toca el color correcto para cada nombre.",
  },
  "Adivinhe o Bicho": { en: "Guess the Animal", es: "Adivina el Animal" },
  "Ouça a dica e escolha o bichinho!": {
    en: "Listen to the hint and pick the animal!",
    es: "¡Escucha la pista y elige el animalito!",
  },
  "Desenhar e Colorir": { en: "Draw and Color", es: "Dibujar y Colorear" },
  "Pinte símbolos e bichos da aldeia.": {
    en: "Paint village symbols and animals.",
    es: "Pinta símbolos y animales de la aldea.",
  },

  // Mensagens de jogo
  "Você achou todos!": { en: "You found them all!", es: "¡Los encontraste todos!" },
  "Todos os pares!": { en: "All the pairs!", es: "¡Todas las parejas!" },
  "Muito bem! All correct!": { en: "Great job! All correct!", es: "¡Muy bien! ¡Todo correcto!" },
  "Qual é a palavra?": { en: "What is the word?", es: "¿Cuál es la palabra?" },
  "Toque nos números do menor ao maior": {
    en: "Tap the numbers from smallest to biggest",
    es: "Toca los números de menor a mayor",
  },
  "Você acertou tudo!": { en: "You got it all right!", es: "¡Acertaste todo!" },
  "Quase! Tente de novo.": { en: "Almost! Try again.", es: "¡Casi! Inténtalo de nuevo." },
  "Fim! Você pegou": { en: "Done! You caught", es: "¡Fin! Atrapaste" },
  "bichinhos": { en: "animals", es: "animalitos" },
  "Pinte o desenho tocando na tela.": {
    en: "Paint the drawing by touching the screen.",
    es: "Pinta el dibujo tocando la pantalla.",
  },

  // Cores
  "Vermelho": { en: "Red", es: "Rojo" },
  "Azul": { en: "Blue", es: "Azul" },
  "Amarelo": { en: "Yellow", es: "Amarillo" },
  "Verde": { en: "Green", es: "Verde" },
  "Roxo": { en: "Purple", es: "Morado" },
  "Laranja": { en: "Orange", es: "Naranja" },

  // Natureza / família / bichos usados nos pares
  "Água": { en: "Water", es: "Agua" },
  "Fogo": { en: "Fire", es: "Fuego" },
  "Sol": { en: "Sun", es: "Sol" },
  "Lua": { en: "Moon", es: "Luna" },
  "Terra": { en: "Earth", es: "Tierra" },
  "Arara": { en: "Macaw", es: "Guacamayo" },
  "Macaco": { en: "Monkey", es: "Mono" },
  "Tartaruga": { en: "Turtle", es: "Tortuga" },
  "Onça": { en: "Jaguar", es: "Jaguar" },
  "Folha": { en: "Leaf", es: "Hoja" },
  "Flor": { en: "Flower", es: "Flor" },
  "Cachorro": { en: "Dog", es: "Perro" },
  "Gato": { en: "Cat", es: "Gato" },
  "Pássaro": { en: "Bird", es: "Pájaro" },
  "Peixe": { en: "Fish", es: "Pez" },
  "Um": { en: "One", es: "Uno" },
  "Dois": { en: "Two", es: "Dos" },
  "Três": { en: "Three", es: "Tres" },
  "Quatro": { en: "Four", es: "Cuatro" },
};

/** Retorna a tradução estática (en/es) ou undefined. */
export function staticTranslate(text: string, lang: string): string | undefined {
  if (lang !== "en" && lang !== "es") return undefined;
  const entry = STATIC_GLOSSARY[text.trim()];
  return entry ? entry[lang as "en" | "es"] : undefined;
}
