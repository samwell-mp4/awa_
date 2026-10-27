/**
 * Registro de Sincronização e Linha do Tempo das Músicas (Salvo Diretamente no Código).
 *
 * Este arquivo é atualizado automaticamente pelo Editor de Timeline.
 * Cada música contém a lista de versos com segundo de início e fim.
 */

export interface SavedSongRange {
  start: number;
  end: number;
  text?: string;
  translation?: string;
}

export interface SavedSongTimeline {
  id: string;
  title: string;
  duration: number;
  ranges: SavedSongRange[];
  updatedAt: string;
}

export const SONGS_TIMELINE_DATA: Record<string, SavedSongTimeline> = {
  "ab54cdad-3f17-4a13-bf2e-f4f4158bd102": {
    "id": "ab54cdad-3f17-4a13-bf2e-f4f4158bd102",
    "title": "Muká Mukaú",
    "duration": 90.046984,
    "ranges": [
      {
        "start": 6,
        "end": 9,
        "text": "Pataxó  Muká, mukaú",
        "translation": "Pataxó"
      },
      {
        "start": 9,
        "end": 12.2,
        "text": "Muká, mukaú (2X)",
        "translation": "Unir, reunir (3X)"
      },
      {
        "start": 13.31,
        "end": 17,
        "text": "Pataxó mayõ werimehe",
        "translation": "Povo Pataxó unido"
      },
      {
        "start": 17,
        "end": 22,
        "text": "Mayõ werimere (3X)",
        "translation": "Unido (2X)"
      },
      {
        "start": 22,
        "end": 30,
        "text": "Ertõ, ertõ, ertõ pataxó (2X)",
        "translation": "Força, força, força Pataxó (2X)"
      },
      {
        "start": 30,
        "end": 38,
        "text": "Kotê kawi suniatá heruê (2X)",
        "translation": "Bebemos o cauim sagrado (2X)"
      },
      {
        "start": 38,
        "end": 47,
        "text": "Heruê, hê-hê-heruê, heruê (4X)",
        "translation": "Heruê, hê-hê-heruê, heruê (4X)"
      },
      {
        "start": 47,
        "end": 50,
        "text": "Pataxó  Muká, mukaú",
        "translation": "Pataxó"
      },
      {
        "start": 50,
        "end": 55,
        "text": "Muká, mukaú (2X)",
        "translation": "Unir, reunir (3X)"
      },
      {
        "start": 55,
        "end": 59,
        "text": "Pataxó mayõ werimehe",
        "translation": "Povo Pataxó unido"
      },
      {
        "start": 59,
        "end": 63,
        "text": "Mayõ werimere (3X)",
        "translation": "Unido (2X)"
      },
      {
        "start": 63,
        "end": 71,
        "text": "Ertõ, ertõ, ertõ pataxó (2X)",
        "translation": "Força, força, força Pataxó (2X)"
      },
      {
        "start": 71,
        "end": 80,
        "text": "Kotê kawi suniatá heruê (2X)",
        "translation": "Bebemos o cauim sagrado (2X)"
      },
      {
        "start": 80,
        "end": 89.95,
        "text": "Heruê, hê-hê-heruê, heruê (4X)",
        "translation": "Heruê, hê-hê-heruê, heruê (4X)"
      }
    ],
    "updatedAt": "2026-10-27T12:57:54.500Z"
  },
  "title_mukamukau": {
    "id": "ab54cdad-3f17-4a13-bf2e-f4f4158bd102",
    "title": "Muká Mukaú",
    "duration": 90.046984,
    "ranges": [
      {
        "start": 6,
        "end": 9,
        "text": "Pataxó  Muká, mukaú",
        "translation": "Pataxó"
      },
      {
        "start": 9,
        "end": 12.2,
        "text": "Muká, mukaú (2X)",
        "translation": "Unir, reunir (3X)"
      },
      {
        "start": 13.31,
        "end": 17,
        "text": "Pataxó mayõ werimehe",
        "translation": "Povo Pataxó unido"
      },
      {
        "start": 17,
        "end": 22,
        "text": "Mayõ werimere (3X)",
        "translation": "Unido (2X)"
      },
      {
        "start": 22,
        "end": 30,
        "text": "Ertõ, ertõ, ertõ pataxó (2X)",
        "translation": "Força, força, força Pataxó (2X)"
      },
      {
        "start": 30,
        "end": 38,
        "text": "Kotê kawi suniatá heruê (2X)",
        "translation": "Bebemos o cauim sagrado (2X)"
      },
      {
        "start": 38,
        "end": 47,
        "text": "Heruê, hê-hê-heruê, heruê (4X)",
        "translation": "Heruê, hê-hê-heruê, heruê (4X)"
      },
      {
        "start": 47,
        "end": 50,
        "text": "Pataxó  Muká, mukaú",
        "translation": "Pataxó"
      },
      {
        "start": 50,
        "end": 55,
        "text": "Muká, mukaú (2X)",
        "translation": "Unir, reunir (3X)"
      },
      {
        "start": 55,
        "end": 59,
        "text": "Pataxó mayõ werimehe",
        "translation": "Povo Pataxó unido"
      },
      {
        "start": 59,
        "end": 63,
        "text": "Mayõ werimere (3X)",
        "translation": "Unido (2X)"
      },
      {
        "start": 63,
        "end": 71,
        "text": "Ertõ, ertõ, ertõ pataxó (2X)",
        "translation": "Força, força, força Pataxó (2X)"
      },
      {
        "start": 71,
        "end": 80,
        "text": "Kotê kawi suniatá heruê (2X)",
        "translation": "Bebemos o cauim sagrado (2X)"
      },
      {
        "start": 80,
        "end": 89.95,
        "text": "Heruê, hê-hê-heruê, heruê (4X)",
        "translation": "Heruê, hê-hê-heruê, heruê (4X)"
      }
    ],
    "updatedAt": "2026-10-27T12:57:54.500Z"
  },
  "b4f4d1d5-193d-4f2f-91a4-d6bc5e370712": {
    "id": "b4f4d1d5-193d-4f2f-91a4-d6bc5e370712",
    "title": "Ãguarê",
    "duration": 94.551655,
    "ranges": [
      {
        "start": 4.5,
        "end": 11.9,
        "text": "Ãguaré dxaháiõ ĩtohã meá dxê",
        "translation": "Ãguaré, guardião da mata"
      },
      {
        "start": 12,
        "end": 18.4,
        "text": "Ãguaré dxaháiõ ĩtohã meá dxê ãgnaray",
        "translation": "Ãguaré nos protege"
      },
      {
        "start": 18.5,
        "end": 23.5,
        "text": "Tânará mehexó iupúkjitaiá suniatá",
        "translation": "Na força dos antepassados"
      },
      {
        "start": 23.5,
        "end": 29.5,
        "text": "Uhitué apônẽ iuá meá nõmaysõ",
        "translation": "Caminhamos junto na terra"
      },
      {
        "start": 30.5,
        "end": 39.5,
        "text": "Kahabiutxê ê, ê, ê, ê uu",
        "translation": "Cantamos, cantamos"
      },
      {
        "start": 39.5,
        "end": 49.5,
        "text": "Kahabiutxê ê ,ê,é,ê uu",
        "translation": "Cabtamos,cantamos"
      },
      {
        "start": 48.5,
        "end": 55,
        "text": "Ãguaré dxaháiõ ĩtohã meá dxê",
        "translation": "Ãguaré, guardião da mata"
      },
      {
        "start": 55,
        "end": 61,
        "text": "Ãguaré dxaháiõ ĩtohã meá dxê ãgnaray",
        "translation": "Ãguaré nos protege"
      },
      {
        "start": 61,
        "end": 67,
        "text": "Tânará mehexó iupúkjitaiá suniatá",
        "translation": "Na força dos antepassados"
      },
      {
        "start": 67.5,
        "end": 72,
        "text": "Uhitué apônẽ iuá meá nõmaysõ",
        "translation": "Caminhamos junto na terra"
      },
      {
        "start": 72,
        "end": 81,
        "text": "Kahabiutxê ê, ê, ê, ê uu",
        "translation": "Cantamos, cantamos"
      },
      {
        "start": 81,
        "end": 92.05,
        "text": "Kahabiutxê ê ,ê,é,ê uu",
        "translation": "Cabtamos,cantamos"
      }
    ],
    "updatedAt": "2026-10-27T13:24:14.565Z"
  },
  "title_aguare": {
    "id": "b4f4d1d5-193d-4f2f-91a4-d6bc5e370712",
    "title": "Ãguarê",
    "duration": 94.551655,
    "ranges": [
      {
        "start": 4.5,
        "end": 11.9,
        "text": "Ãguaré dxaháiõ ĩtohã meá dxê",
        "translation": "Ãguaré, guardião da mata"
      },
      {
        "start": 12,
        "end": 18.4,
        "text": "Ãguaré dxaháiõ ĩtohã meá dxê ãgnaray",
        "translation": "Ãguaré nos protege"
      },
      {
        "start": 18.5,
        "end": 23.5,
        "text": "Tânará mehexó iupúkjitaiá suniatá",
        "translation": "Na força dos antepassados"
      },
      {
        "start": 23.5,
        "end": 29.5,
        "text": "Uhitué apônẽ iuá meá nõmaysõ",
        "translation": "Caminhamos junto na terra"
      },
      {
        "start": 30.5,
        "end": 39.5,
        "text": "Kahabiutxê ê, ê, ê, ê uu",
        "translation": "Cantamos, cantamos"
      },
      {
        "start": 39.5,
        "end": 49.5,
        "text": "Kahabiutxê ê ,ê,é,ê uu",
        "translation": "Cabtamos,cantamos"
      },
      {
        "start": 48.5,
        "end": 55,
        "text": "Ãguaré dxaháiõ ĩtohã meá dxê",
        "translation": "Ãguaré, guardião da mata"
      },
      {
        "start": 55,
        "end": 61,
        "text": "Ãguaré dxaháiõ ĩtohã meá dxê ãgnaray",
        "translation": "Ãguaré nos protege"
      },
      {
        "start": 61,
        "end": 67,
        "text": "Tânará mehexó iupúkjitaiá suniatá",
        "translation": "Na força dos antepassados"
      },
      {
        "start": 67.5,
        "end": 72,
        "text": "Uhitué apônẽ iuá meá nõmaysõ",
        "translation": "Caminhamos junto na terra"
      },
      {
        "start": 72,
        "end": 81,
        "text": "Kahabiutxê ê, ê, ê, ê uu",
        "translation": "Cantamos, cantamos"
      },
      {
        "start": 81,
        "end": 92.05,
        "text": "Kahabiutxê ê ,ê,é,ê uu",
        "translation": "Cabtamos,cantamos"
      }
    ],
    "updatedAt": "2026-10-27T13:24:14.565Z"
  },
  "9a78b5ba-4b6d-4238-8d8c-ef1519dead19": {
    "id": "9a78b5ba-4b6d-4238-8d8c-ef1519dead19",
    "title": "Tava lá dentro da mata",
    "duration": 120.465125,
    "ranges": [
      {
        "start": 3,
        "end": 7,
        "text": "Tava la dentro da mata",
        "translation": "Tava la dentro da mata"
      },
      {
        "start": 7,
        "end": 11,
        "text": "Pra que mandou me chamar?",
        "translation": "Pra que mandou me chamar?"
      },
      {
        "start": 11,
        "end": 14,
        "text": "Tava la dentro da mata",
        "translation": "Tava la dentro da mata"
      },
      {
        "start": 15,
        "end": 17,
        "text": "Pra que mandou me chamar?",
        "translation": "Pra que mandou me chamar?"
      },
      {
        "start": 17,
        "end": 20,
        "text": "Eu sou índio guerreiro",
        "translation": "Eu sou índio guerreiro"
      },
      {
        "start": 21,
        "end": 24,
        "text": "índio guerreiro de Orubá",
        "translation": "índio guerreiro de Orubá"
      },
      {
        "start": 24,
        "end": 29,
        "text": "Eu sou índio guerreiro",
        "translation": "Eu sou índio guerreiro"
      },
      {
        "start": 29,
        "end": 34,
        "text": "índio guerreiro de Orubá",
        "translation": "índio guerreiro de Orubá"
      },
      {
        "start": 34,
        "end": 46,
        "text": "Hêa, hêa, hêá, hôa (4x)",
        "translation": "Hêa, hêa, hêá, hôa (4x)"
      },
      {
        "start": 46,
        "end": 49,
        "text": "Hêa hêa, heá (3x)",
        "translation": "Hêa hêa, heá (3x)"
      },
      {
        "start": 49,
        "end": 53,
        "text": "Hêá, hêa",
        "translation": "Hêá, hêa"
      },
      {
        "start": 53,
        "end": 57,
        "text": "Hêá, hêa (3x)",
        "translation": "Hêá, hêa  (3x)"
      }
    ],
    "updatedAt": "2026-10-27T14:47:40.579Z"
  },
  "title_tavaladentrodamata": {
    "id": "9a78b5ba-4b6d-4238-8d8c-ef1519dead19",
    "title": "Tava lá dentro da mata",
    "duration": 120.465125,
    "ranges": [
      {
        "start": 3,
        "end": 7,
        "text": "Tava la dentro da mata",
        "translation": "Tava la dentro da mata"
      },
      {
        "start": 7,
        "end": 11,
        "text": "Pra que mandou me chamar?",
        "translation": "Pra que mandou me chamar?"
      },
      {
        "start": 11,
        "end": 14,
        "text": "Tava la dentro da mata",
        "translation": "Tava la dentro da mata"
      },
      {
        "start": 15,
        "end": 17,
        "text": "Pra que mandou me chamar?",
        "translation": "Pra que mandou me chamar?"
      },
      {
        "start": 17,
        "end": 20,
        "text": "Eu sou índio guerreiro",
        "translation": "Eu sou índio guerreiro"
      },
      {
        "start": 21,
        "end": 24,
        "text": "índio guerreiro de Orubá",
        "translation": "índio guerreiro de Orubá"
      },
      {
        "start": 24,
        "end": 29,
        "text": "Eu sou índio guerreiro",
        "translation": "Eu sou índio guerreiro"
      },
      {
        "start": 29,
        "end": 34,
        "text": "índio guerreiro de Orubá",
        "translation": "índio guerreiro de Orubá"
      },
      {
        "start": 34,
        "end": 46,
        "text": "Hêa, hêa, hêá, hôa (4x)",
        "translation": "Hêa, hêa, hêá, hôa (4x)"
      },
      {
        "start": 46,
        "end": 49,
        "text": "Hêa hêa, heá (3x)",
        "translation": "Hêa hêa, heá (3x)"
      },
      {
        "start": 49,
        "end": 53,
        "text": "Hêá, hêa",
        "translation": "Hêá, hêa"
      },
      {
        "start": 53,
        "end": 57,
        "text": "Hêá, hêa (3x)",
        "translation": "Hêá, hêa  (3x)"
      }
    ],
    "updatedAt": "2026-10-27T14:47:40.579Z"
  },
  "title_tavadentrodamata": {
    "id": "9a78b5ba-4b6d-4238-8d8c-ef1519dead19",
    "title": "Tava lá dentro da mata",
    "duration": 120.465125,
    "ranges": [
      {
        "start": 3,
        "end": 7,
        "text": "Tava la dentro da mata",
        "translation": "Tava la dentro da mata"
      },
      {
        "start": 7,
        "end": 11,
        "text": "Pra que mandou me chamar?",
        "translation": "Pra que mandou me chamar?"
      },
      {
        "start": 11,
        "end": 14,
        "text": "Tava la dentro da mata",
        "translation": "Tava la dentro da mata"
      },
      {
        "start": 15,
        "end": 17,
        "text": "Pra que mandou me chamar?",
        "translation": "Pra que mandou me chamar?"
      },
      {
        "start": 17,
        "end": 20,
        "text": "Eu sou índio guerreiro",
        "translation": "Eu sou índio guerreiro"
      },
      {
        "start": 21,
        "end": 24,
        "text": "índio guerreiro de Orubá",
        "translation": "índio guerreiro de Orubá"
      },
      {
        "start": 24,
        "end": 29,
        "text": "Eu sou índio guerreiro",
        "translation": "Eu sou índio guerreiro"
      },
      {
        "start": 29,
        "end": 34,
        "text": "índio guerreiro de Orubá",
        "translation": "índio guerreiro de Orubá"
      },
      {
        "start": 34,
        "end": 46,
        "text": "Hêa, hêa, hêá, hôa (4x)",
        "translation": "Hêa, hêa, hêá, hôa (4x)"
      },
      {
        "start": 46,
        "end": 49,
        "text": "Hêa hêa, heá (3x)",
        "translation": "Hêa hêa, heá (3x)"
      },
      {
        "start": 49,
        "end": 53,
        "text": "Hêá, hêa",
        "translation": "Hêá, hêa"
      },
      {
        "start": 53,
        "end": 57,
        "text": "Hêá, hêa (3x)",
        "translation": "Hêá, hêa  (3x)"
      }
    ],
    "updatedAt": "2026-10-27T14:47:40.579Z"
  },
  "516137ad-2ba0-46b9-a665-3968dbb36750": {
    "id": "516137ad-2ba0-46b9-a665-3968dbb36750",
    "title": "Casa na serra",
    "duration": 90.557823,
    "ranges": [
      {
        "start": 4,
        "end": 10,
        "text": "Tem uma casa lá na serra que só tem pé de guiné (2x)",
        "translation": "Tem uma casa lá na serra que só tem pé de guiné (2x)"
      },
      {
        "start": 11,
        "end": 17,
        "text": "Ô quem é que mora lá é o pajé (2x)",
        "translation": "Ô quem é que mora lá é o pajé (2x)"
      },
      {
        "start": 17,
        "end": 24,
        "text": "Porque ele mora lá, porque nós moramos aqui (2x)",
        "translation": "Porque ele mora lá, porque nós moramos aqui (2x)"
      },
      {
        "start": 24,
        "end": 31,
        "text": "É benzendo nossa Aldeia para nada atrapalhar (2x)",
        "translation": "É benzendo nossa Aldeia para nada atrapalhar (2x)"
      },
      {
        "start": 31,
        "end": 46,
        "text": "Ô hena, hena hena heô (4x)",
        "translation": "Ô hena, hena hena heô (4x)"
      },
      {
        "start": 46,
        "end": 53,
        "text": "Tem uma casa lá na serra que só tem pé de guiné (2x)",
        "translation": "Tem uma casa lá na serra que só tem pé de guiné (2x)"
      },
      {
        "start": 53,
        "end": 60,
        "text": "Ô quem é que mora lá é o pajé (2x)",
        "translation": "Ô quem é que mora lá é o pajé (2x)"
      },
      {
        "start": 60,
        "end": 67,
        "text": "Porque ele mora lá, porque nós moramos aqui (2x)",
        "translation": "Porque ele mora lá, porque nós moramos aqui (2x)"
      },
      {
        "start": 67,
        "end": 74,
        "text": "É benzendo nossa Aldeia para nada atrapalhar (2x)",
        "translation": "É benzendo nossa Aldeia para nada atrapalhar (2x)"
      },
      {
        "start": 74,
        "end": 90,
        "text": "Ô hena, hena hena heô (4x)",
        "translation": "Ô hena, hena hena heô (4x)"
      }
    ],
    "updatedAt": "2026-10-27T15:01:20.954Z"
  },
  "title_casanaserra": {
    "id": "516137ad-2ba0-46b9-a665-3968dbb36750",
    "title": "Casa na serra",
    "duration": 90.557823,
    "ranges": [
      {
        "start": 4,
        "end": 10,
        "text": "Tem uma casa lá na serra que só tem pé de guiné (2x)",
        "translation": "Tem uma casa lá na serra que só tem pé de guiné (2x)"
      },
      {
        "start": 11,
        "end": 17,
        "text": "Ô quem é que mora lá é o pajé (2x)",
        "translation": "Ô quem é que mora lá é o pajé (2x)"
      },
      {
        "start": 17,
        "end": 24,
        "text": "Porque ele mora lá, porque nós moramos aqui (2x)",
        "translation": "Porque ele mora lá, porque nós moramos aqui (2x)"
      },
      {
        "start": 24,
        "end": 31,
        "text": "É benzendo nossa Aldeia para nada atrapalhar (2x)",
        "translation": "É benzendo nossa Aldeia para nada atrapalhar (2x)"
      },
      {
        "start": 31,
        "end": 46,
        "text": "Ô hena, hena hena heô (4x)",
        "translation": "Ô hena, hena hena heô (4x)"
      },
      {
        "start": 46,
        "end": 53,
        "text": "Tem uma casa lá na serra que só tem pé de guiné (2x)",
        "translation": "Tem uma casa lá na serra que só tem pé de guiné (2x)"
      },
      {
        "start": 53,
        "end": 60,
        "text": "Ô quem é que mora lá é o pajé (2x)",
        "translation": "Ô quem é que mora lá é o pajé (2x)"
      },
      {
        "start": 60,
        "end": 67,
        "text": "Porque ele mora lá, porque nós moramos aqui (2x)",
        "translation": "Porque ele mora lá, porque nós moramos aqui (2x)"
      },
      {
        "start": 67,
        "end": 74,
        "text": "É benzendo nossa Aldeia para nada atrapalhar (2x)",
        "translation": "É benzendo nossa Aldeia para nada atrapalhar (2x)"
      },
      {
        "start": 74,
        "end": 90,
        "text": "Ô hena, hena hena heô (4x)",
        "translation": "Ô hena, hena hena heô (4x)"
      }
    ],
    "updatedAt": "2026-10-27T15:01:20.954Z"
  },
  "f3564ec8-492b-449f-8ab2-f17b431ea893": {
    "id": "f3564ec8-492b-449f-8ab2-f17b431ea893",
    "title": "Zoada da cabaça",
    "duration": 81.64652,
    "ranges": [
      {
        "start": 4.5,
        "end": 12,
        "text": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar",
        "translation": "Quando eu vejo a zoada da cabaça"
      },
      {
        "start": 12,
        "end": 18,
        "text": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar",
        "translation": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar"
      },
      {
        "start": 18,
        "end": 32.95,
        "text": "Mas eu canto é pra Tupã, pra Tupã me ajudar.(2x)",
        "translation": "Mas eu canto é pra Tupã, pra Tupã me ajudar.(2x)"
      },
      {
        "start": 33,
        "end": 46,
        "text": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar",
        "translation": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar"
      },
      {
        "start": 46,
        "end": 61,
        "text": "Mas eu canto é pra Tupã, pra Tupã me ajudar.(2x)",
        "translation": "Mas eu canto é pra Tupã, pra Tupã me ajudar.(2x)"
      },
      {
        "start": 61,
        "end": 75,
        "text": "Adeus lua nova, adeus lua cheia, (2x)",
        "translation": "Adeus lua nova, adeus lua cheia, 2xAdeus lua nova, adeus lua cheia, (2x)"
      },
      {
        "start": 75,
        "end": 81,
        "text": "Eu canto é pra Tupã, vou voltar pra minha Aldeia.",
        "translation": ""
      }
    ],
    "updatedAt": "2026-10-27T15:07:54.702Z"
  },
  "title_zoadadacabaca": {
    "id": "f3564ec8-492b-449f-8ab2-f17b431ea893",
    "title": "Zoada da cabaça",
    "duration": 81.64652,
    "ranges": [
      {
        "start": 4.5,
        "end": 12,
        "text": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar",
        "translation": "Quando eu vejo a zoada da cabaça"
      },
      {
        "start": 12,
        "end": 18,
        "text": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar",
        "translation": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar"
      },
      {
        "start": 18,
        "end": 32.95,
        "text": "Mas eu canto é pra Tupã, pra Tupã me ajudar.(2x)",
        "translation": "Mas eu canto é pra Tupã, pra Tupã me ajudar.(2x)"
      },
      {
        "start": 33,
        "end": 46,
        "text": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar",
        "translation": "Quando eu vejo a zoada da cabaça, me dá vontade de cantar"
      },
      {
        "start": 46,
        "end": 61,
        "text": "Mas eu canto é pra Tupã, pra Tupã me ajudar.(2x)",
        "translation": "Mas eu canto é pra Tupã, pra Tupã me ajudar.(2x)"
      },
      {
        "start": 61,
        "end": 75,
        "text": "Adeus lua nova, adeus lua cheia, (2x)",
        "translation": "Adeus lua nova, adeus lua cheia, 2xAdeus lua nova, adeus lua cheia, (2x)"
      },
      {
        "start": 75,
        "end": 81,
        "text": "Eu canto é pra Tupã, vou voltar pra minha Aldeia.",
        "translation": ""
      }
    ],
    "updatedAt": "2026-10-27T15:07:54.703Z"
  },
  "26dbc433-6dc5-4366-8f71-ea589e420ebc": {
    "id": "26dbc433-6dc5-4366-8f71-ea589e420ebc",
    "title": "Passarinho tá cantando",
    "duration": 54.056054,
    "ranges": [
      {
        "start": 3,
        "end": 10,
        "text": "Passarinho tá cantando oh, passarinho tá cantando",
        "translation": "Passarinho tá cantando oh, passarinho tá cantando"
      },
      {
        "start": 10,
        "end": 16,
        "text": "Passarinho tá cantando oh, passarinho tá cantando",
        "translation": "Passarinho tá cantando oh, passarinho tá cantando"
      },
      {
        "start": 16,
        "end": 18,
        "text": "Com seu canto bonito",
        "translation": "Com seu canto bonito"
      },
      {
        "start": 18,
        "end": 23,
        "text": "oh lê lê vai voando no ar oh lá lá",
        "translation": "lê lê vai voando no ar oh lá lá"
      },
      {
        "start": 23,
        "end": 26,
        "text": "Chama rá, rá, rá oh lê lê",
        "translation": "Chama rá, rá, rá oh lê lê"
      },
      {
        "start": 26,
        "end": 30,
        "text": "Chama rá, rá, rá oh lá lá",
        "translation": "Chama rá, rá, rá oh lá lá"
      },
      {
        "start": 30,
        "end": 43,
        "text": "Passarinho tá cantando oh (2x)",
        "translation": "Passarinho tá cantando oh, passarinho tá cantando"
      },
      {
        "start": 43,
        "end": 45,
        "text": "Com seu canto bonito",
        "translation": "Com seu canto bonito"
      },
      {
        "start": 45,
        "end": 49,
        "text": "oh lê lê vai voando no ar oh lá lá",
        "translation": "lê lê vai voando no ar oh lá lá"
      },
      {
        "start": 49,
        "end": 52,
        "text": "Chama rá, rá, rá oh lê lê",
        "translation": "Chama rá, rá, rá oh lê lê"
      },
      {
        "start": 52,
        "end": 54.06,
        "text": "Chama rá, rá, rá oh lá lá",
        "translation": "Chama rá, rá, rá oh lá lá"
      }
    ],
    "updatedAt": "2026-10-27T15:19:32.317Z"
  },
  "title_passarinhotacantando": {
    "id": "26dbc433-6dc5-4366-8f71-ea589e420ebc",
    "title": "Passarinho tá cantando",
    "duration": 54.056054,
    "ranges": [
      {
        "start": 3,
        "end": 10,
        "text": "Passarinho tá cantando oh, passarinho tá cantando",
        "translation": "Passarinho tá cantando oh, passarinho tá cantando"
      },
      {
        "start": 10,
        "end": 16,
        "text": "Passarinho tá cantando oh, passarinho tá cantando",
        "translation": "Passarinho tá cantando oh, passarinho tá cantando"
      },
      {
        "start": 16,
        "end": 18,
        "text": "Com seu canto bonito",
        "translation": "Com seu canto bonito"
      },
      {
        "start": 18,
        "end": 23,
        "text": "oh lê lê vai voando no ar oh lá lá",
        "translation": "lê lê vai voando no ar oh lá lá"
      },
      {
        "start": 23,
        "end": 26,
        "text": "Chama rá, rá, rá oh lê lê",
        "translation": "Chama rá, rá, rá oh lê lê"
      },
      {
        "start": 26,
        "end": 30,
        "text": "Chama rá, rá, rá oh lá lá",
        "translation": "Chama rá, rá, rá oh lá lá"
      },
      {
        "start": 30,
        "end": 43,
        "text": "Passarinho tá cantando oh (2x)",
        "translation": "Passarinho tá cantando oh, passarinho tá cantando"
      },
      {
        "start": 43,
        "end": 45,
        "text": "Com seu canto bonito",
        "translation": "Com seu canto bonito"
      },
      {
        "start": 45,
        "end": 49,
        "text": "oh lê lê vai voando no ar oh lá lá",
        "translation": "lê lê vai voando no ar oh lá lá"
      },
      {
        "start": 49,
        "end": 52,
        "text": "Chama rá, rá, rá oh lê lê",
        "translation": "Chama rá, rá, rá oh lê lê"
      },
      {
        "start": 52,
        "end": 54.06,
        "text": "Chama rá, rá, rá oh lá lá",
        "translation": "Chama rá, rá, rá oh lá lá"
      }
    ],
    "updatedAt": "2026-10-27T15:19:32.317Z"
  },
  "75f99580-ab1b-4b44-9824-1782910ed7c3": {
    "id": "75f99580-ab1b-4b44-9824-1782910ed7c3",
    "title": "Txihí mirawê",
    "duration": 65.085671,
    "ranges": [
      {
        "start": 4,
        "end": 8.52,
        "text": "Txihí mirawê (2x)",
        "translation": "Antepassado (2X)"
      },
      {
        "start": 8.52,
        "end": 12.24,
        "text": "Wãkhomãk upú heruê",
        "translation": "Antepassado, antepassado"
      },
      {
        "start": 12.24,
        "end": 16,
        "text": "Txihí mirawê txihí mirawê",
        "translation": "Antepassado,Antepassado"
      },
      {
        "start": 16,
        "end": 20,
        "text": "Wãkhomãk upú heruwê",
        "translation": "Wãkhomãk upú heruwê"
      },
      {
        "start": 20,
        "end": 35,
        "text": "Waê, waê, waê, waê torotê uĩ pakhê (2x)",
        "translation": "Waê, waê, waê, waê nossa terra sagrada"
      },
      {
        "start": 35,
        "end": 39,
        "text": "Txihí mirawê txihí mirawê",
        "translation": "Txihí mirawê txihí mirawê (2x)"
      },
      {
        "start": 39,
        "end": 42,
        "text": "Wãkhomãk u͂pú heruwê",
        "translation": "Wãkhomãk u͂pú heruwê"
      },
      {
        "start": 42,
        "end": 45,
        "text": "Txihí mirawê txihí mirawê",
        "translation": "Txihí mirawê txihí mirawê (2x)"
      },
      {
        "start": 45,
        "end": 48,
        "text": "Wãkhomãk u͂pú heruwê",
        "translation": "Wãkhomãk u͂pú heruwê"
      },
      {
        "start": 48,
        "end": 64,
        "text": "Waê, waê, waê, waê torotê uĩ pakhê (2x)",
        "translation": "Waê, waê, waê, waê torotê uĩ pakhê (2x)"
      }
    ],
    "updatedAt": "2026-10-27T15:26:33.902Z"
  },
  "title_txihimirawe": {
    "id": "75f99580-ab1b-4b44-9824-1782910ed7c3",
    "title": "Txihí mirawê",
    "duration": 65.085671,
    "ranges": [
      {
        "start": 4,
        "end": 8.52,
        "text": "Txihí mirawê (2x)",
        "translation": "Antepassado (2X)"
      },
      {
        "start": 8.52,
        "end": 12.24,
        "text": "Wãkhomãk upú heruê",
        "translation": "Antepassado, antepassado"
      },
      {
        "start": 12.24,
        "end": 16,
        "text": "Txihí mirawê txihí mirawê",
        "translation": "Antepassado,Antepassado"
      },
      {
        "start": 16,
        "end": 20,
        "text": "Wãkhomãk upú heruwê",
        "translation": "Wãkhomãk upú heruwê"
      },
      {
        "start": 20,
        "end": 35,
        "text": "Waê, waê, waê, waê torotê uĩ pakhê (2x)",
        "translation": "Waê, waê, waê, waê nossa terra sagrada"
      },
      {
        "start": 35,
        "end": 39,
        "text": "Txihí mirawê txihí mirawê",
        "translation": "Txihí mirawê txihí mirawê (2x)"
      },
      {
        "start": 39,
        "end": 42,
        "text": "Wãkhomãk u͂pú heruwê",
        "translation": "Wãkhomãk u͂pú heruwê"
      },
      {
        "start": 42,
        "end": 45,
        "text": "Txihí mirawê txihí mirawê",
        "translation": "Txihí mirawê txihí mirawê (2x)"
      },
      {
        "start": 45,
        "end": 48,
        "text": "Wãkhomãk u͂pú heruwê",
        "translation": "Wãkhomãk u͂pú heruwê"
      },
      {
        "start": 48,
        "end": 64,
        "text": "Waê, waê, waê, waê torotê uĩ pakhê (2x)",
        "translation": "Waê, waê, waê, waê torotê uĩ pakhê (2x)"
      }
    ],
    "updatedAt": "2026-10-27T15:26:33.902Z"
  },
  "0033ea83-33d2-41d7-8adb-f6df06c17bb6": {
    "id": "0033ea83-33d2-41d7-8adb-f6df06c17bb6",
    "title": "Pataxó — Luz do amor",
    "duration": 90.046984,
    "ranges": [
      {
        "start": 6,
        "end": 9,
        "text": "Pataxó  Muká, mukaú",
        "translation": "Pataxó"
      },
      {
        "start": 9,
        "end": 12.2,
        "text": "Muká, mukaú (2X)",
        "translation": "Unir, reunir (3X)"
      },
      {
        "start": 13.31,
        "end": 17,
        "text": "Pataxó mayõ werimehe",
        "translation": "Povo Pataxó unido"
      },
      {
        "start": 17,
        "end": 22,
        "text": "Mayõ werimere (3X)",
        "translation": "Unido (2X)"
      },
      {
        "start": 22,
        "end": 30,
        "text": "Ertõ, ertõ, ertõ pataxó (2X)",
        "translation": "Força, força, força Pataxó (2X)"
      },
      {
        "start": 30,
        "end": 38,
        "text": "Kotê kawi suniatá heruê (2X)",
        "translation": "Bebemos o cauim sagrado (2X)"
      },
      {
        "start": 38,
        "end": 47,
        "text": "Heruê, hê-hê-heruê, heruê (4X)",
        "translation": "Heruê, hê-hê-heruê, heruê (4X)"
      },
      {
        "start": 47,
        "end": 50,
        "text": "Pataxó  Muká, mukaú",
        "translation": "Pataxó"
      },
      {
        "start": 50,
        "end": 55,
        "text": "Muká, mukaú (2X)",
        "translation": "Unir, reunir (3X)"
      },
      {
        "start": 55,
        "end": 59,
        "text": "Pataxó mayõ werimehe",
        "translation": "Povo Pataxó unido"
      },
      {
        "start": 59,
        "end": 63,
        "text": "Mayõ werimere (3X)",
        "translation": "Unido (2X)"
      },
      {
        "start": 63,
        "end": 71,
        "text": "Ertõ, ertõ, ertõ pataxó (2X)",
        "translation": "Força, força, força Pataxó (2X)"
      },
      {
        "start": 71,
        "end": 80,
        "text": "Kotê kawi suniatá heruê (2X)",
        "translation": "Bebemos o cauim sagrado (2X)"
      },
      {
        "start": 80,
        "end": 89.95,
        "text": "Heruê, hê-hê-heruê, heruê (4X)",
        "translation": "Heruê, hê-hê-heruê, heruê (4X)"
      }
    ],
    "updatedAt": "2026-10-27T15:27:36.528Z"
  },
  "title_pataxoluzdoamor": {
    "id": "0033ea83-33d2-41d7-8adb-f6df06c17bb6",
    "title": "Pataxó — Luz do amor",
    "duration": 90.046984,
    "ranges": [
      {
        "start": 6,
        "end": 9,
        "text": "Pataxó  Muká, mukaú",
        "translation": "Pataxó"
      },
      {
        "start": 9,
        "end": 12.2,
        "text": "Muká, mukaú (2X)",
        "translation": "Unir, reunir (3X)"
      },
      {
        "start": 13.31,
        "end": 17,
        "text": "Pataxó mayõ werimehe",
        "translation": "Povo Pataxó unido"
      },
      {
        "start": 17,
        "end": 22,
        "text": "Mayõ werimere (3X)",
        "translation": "Unido (2X)"
      },
      {
        "start": 22,
        "end": 30,
        "text": "Ertõ, ertõ, ertõ pataxó (2X)",
        "translation": "Força, força, força Pataxó (2X)"
      },
      {
        "start": 30,
        "end": 38,
        "text": "Kotê kawi suniatá heruê (2X)",
        "translation": "Bebemos o cauim sagrado (2X)"
      },
      {
        "start": 38,
        "end": 47,
        "text": "Heruê, hê-hê-heruê, heruê (4X)",
        "translation": "Heruê, hê-hê-heruê, heruê (4X)"
      },
      {
        "start": 47,
        "end": 50,
        "text": "Pataxó  Muká, mukaú",
        "translation": "Pataxó"
      },
      {
        "start": 50,
        "end": 55,
        "text": "Muká, mukaú (2X)",
        "translation": "Unir, reunir (3X)"
      },
      {
        "start": 55,
        "end": 59,
        "text": "Pataxó mayõ werimehe",
        "translation": "Povo Pataxó unido"
      },
      {
        "start": 59,
        "end": 63,
        "text": "Mayõ werimere (3X)",
        "translation": "Unido (2X)"
      },
      {
        "start": 63,
        "end": 71,
        "text": "Ertõ, ertõ, ertõ pataxó (2X)",
        "translation": "Força, força, força Pataxó (2X)"
      },
      {
        "start": 71,
        "end": 80,
        "text": "Kotê kawi suniatá heruê (2X)",
        "translation": "Bebemos o cauim sagrado (2X)"
      },
      {
        "start": 80,
        "end": 89.95,
        "text": "Heruê, hê-hê-heruê, heruê (4X)",
        "translation": "Heruê, hê-hê-heruê, heruê (4X)"
      }
    ],
    "updatedAt": "2026-10-27T15:27:36.531Z"
  },
  "d5232629-0ac7-45c9-b3e5-3ab3aff649ee": {
    "id": "d5232629-0ac7-45c9-b3e5-3ab3aff649ee",
    "title": "A maré encheu",
    "duration": 39.172063,
    "ranges": [
      {
        "start": 3.2,
        "end": 11.9,
        "text": "A maré encheu, tornou vazar, de longe muito longe eu avistei o mar",
        "translation": "A maré encheu, tornou vazar, de longe muito longe eu avistei o mar"
      },
      {
        "start": 12,
        "end": 20.9,
        "text": "Minha casinha coberta de sapé, meu arco, minha flecha, minha cabaça de mé",
        "translation": "Minha casinha coberta de sapé, meu arco, minha flecha, minha cabaça de mé"
      },
      {
        "start": 21,
        "end": 29,
        "text": "A maré encheu, tornou vazar, de longe muito longe eu avistei o mar",
        "translation": "A maré encheu, tornou vazar, de longe muito longe eu avisto o mar"
      },
      {
        "start": 29,
        "end": 39.14,
        "text": "Minha casinha coberta de sapé, meu arco, minha flecha, minha cabaça de mé",
        "translation": "Minha casinha coberta de sapé, meu arco, minha flecha, minha cabaça de mé"
      }
    ],
    "updatedAt": "2026-10-27T15:28:32.957Z"
  },
  "title_amareencheu": {
    "id": "d5232629-0ac7-45c9-b3e5-3ab3aff649ee",
    "title": "A maré encheu",
    "duration": 39.172063,
    "ranges": [
      {
        "start": 3.2,
        "end": 11.9,
        "text": "A maré encheu, tornou vazar, de longe muito longe eu avistei o mar",
        "translation": "A maré encheu, tornou vazar, de longe muito longe eu avistei o mar"
      },
      {
        "start": 12,
        "end": 20.9,
        "text": "Minha casinha coberta de sapé, meu arco, minha flecha, minha cabaça de mé",
        "translation": "Minha casinha coberta de sapé, meu arco, minha flecha, minha cabaça de mé"
      },
      {
        "start": 21,
        "end": 29,
        "text": "A maré encheu, tornou vazar, de longe muito longe eu avistei o mar",
        "translation": "A maré encheu, tornou vazar, de longe muito longe eu avisto o mar"
      },
      {
        "start": 29,
        "end": 39.14,
        "text": "Minha casinha coberta de sapé, meu arco, minha flecha, minha cabaça de mé",
        "translation": "Minha casinha coberta de sapé, meu arco, minha flecha, minha cabaça de mé"
      }
    ],
    "updatedAt": "2026-10-27T15:28:32.957Z"
  },
  "e097b46c-dd02-4c1a-bec1-0b2dca3e26c6": {
    "id": "e097b46c-dd02-4c1a-bec1-0b2dca3e26c6",
    "title": "Ãhô muhú txihi Pataxó",
    "duration": 77.067029,
    "ranges": [
      {
        "start": 4,
        "end": 14,
        "text": "Ãhô muhú txihi Pataxó",
        "translation": "Não amoleça"
      },
      {
        "start": 14,
        "end": 15.8,
        "text": "Kamayurá",
        "translation": "Não durma índio Pataxó corajoso"
      },
      {
        "start": 15.8,
        "end": 18,
        "text": "Patxutxá takap akuã",
        "translation": "Furar com lança e flecha"
      },
      {
        "start": 18,
        "end": 23,
        "text": "Patxitxa mikay dxihi Mukueme",
        "translation": "Cortar com facão não-índio mau"
      },
      {
        "start": 23,
        "end": 26,
        "text": "Txuhap muká penaô",
        "translation": "Heruê eiê, heruê eiê, eiê"
      },
      {
        "start": 26,
        "end": 29,
        "text": "Henuhé ãhô hõ",
        "translation": "Heruê"
      },
      {
        "start": 29,
        "end": 41.32,
        "text": "Heruê eiê, heruê eiê, eiê Heruê (2x)",
        "translation": ""
      },
      {
        "start": 41.82,
        "end": 48,
        "text": "Ãhô muhú txihi Pataxó",
        "translation": "Não amoleça"
      },
      {
        "start": 48,
        "end": 50,
        "text": "Kamayurá",
        "translation": "Não durma índio Pataxó corajoso"
      },
      {
        "start": 50,
        "end": 53,
        "text": "Patxutxá takap akuã",
        "translation": "Furar com lança e flecha"
      },
      {
        "start": 53,
        "end": 56.95,
        "text": "Patxitxa mikay dxihi Mukueme",
        "translation": "Cortar com facão não-índio mau"
      },
      {
        "start": 56.95,
        "end": 60,
        "text": "Txuhap muká penaô",
        "translation": "Heruê eiê, heruê eiê, eiê"
      },
      {
        "start": 60,
        "end": 63,
        "text": "Henuhé ãhô hõ",
        "translation": "Heruê"
      },
      {
        "start": 63,
        "end": 77,
        "text": "Heruê eiê, heruê eiê, eiê Heruê (2x)",
        "translation": ""
      }
    ],
    "updatedAt": "2026-10-27T15:35:45.954Z"
  },
  "title_ahomuhutxihipataxo": {
    "id": "e097b46c-dd02-4c1a-bec1-0b2dca3e26c6",
    "title": "Ãhô muhú txihi Pataxó",
    "duration": 77.067029,
    "ranges": [
      {
        "start": 4,
        "end": 14,
        "text": "Ãhô muhú txihi Pataxó",
        "translation": "Não amoleça"
      },
      {
        "start": 14,
        "end": 15.8,
        "text": "Kamayurá",
        "translation": "Não durma índio Pataxó corajoso"
      },
      {
        "start": 15.8,
        "end": 18,
        "text": "Patxutxá takap akuã",
        "translation": "Furar com lança e flecha"
      },
      {
        "start": 18,
        "end": 23,
        "text": "Patxitxa mikay dxihi Mukueme",
        "translation": "Cortar com facão não-índio mau"
      },
      {
        "start": 23,
        "end": 26,
        "text": "Txuhap muká penaô",
        "translation": "Heruê eiê, heruê eiê, eiê"
      },
      {
        "start": 26,
        "end": 29,
        "text": "Henuhé ãhô hõ",
        "translation": "Heruê"
      },
      {
        "start": 29,
        "end": 41.32,
        "text": "Heruê eiê, heruê eiê, eiê Heruê (2x)",
        "translation": ""
      },
      {
        "start": 41.82,
        "end": 48,
        "text": "Ãhô muhú txihi Pataxó",
        "translation": "Não amoleça"
      },
      {
        "start": 48,
        "end": 50,
        "text": "Kamayurá",
        "translation": "Não durma índio Pataxó corajoso"
      },
      {
        "start": 50,
        "end": 53,
        "text": "Patxutxá takap akuã",
        "translation": "Furar com lança e flecha"
      },
      {
        "start": 53,
        "end": 56.95,
        "text": "Patxitxa mikay dxihi Mukueme",
        "translation": "Cortar com facão não-índio mau"
      },
      {
        "start": 56.95,
        "end": 60,
        "text": "Txuhap muká penaô",
        "translation": "Heruê eiê, heruê eiê, eiê"
      },
      {
        "start": 60,
        "end": 63,
        "text": "Henuhé ãhô hõ",
        "translation": "Heruê"
      },
      {
        "start": 63,
        "end": 77,
        "text": "Heruê eiê, heruê eiê, eiê Heruê (2x)",
        "translation": ""
      }
    ],
    "updatedAt": "2026-10-27T15:35:45.954Z"
  },
  "2ac08317-9490-43de-ae1e-3ad86eff1c93": {
    "id": "2ac08317-9490-43de-ae1e-3ad86eff1c93",
    "title": "Bahia, terra de São Salvador",
    "duration": 40.75102,
    "ranges": [
      {
        "start": 3.5,
        "end": 10,
        "text": "Bahia terra de São Salvador (2x)",
        "translation": "Bahia terra de São Salvador (2x)"
      },
      {
        "start": 10,
        "end": 13,
        "text": "Nós viemos de uma tribo valente",
        "translation": "Nós viemos de uma tribo valente"
      },
      {
        "start": 13,
        "end": 17,
        "text": "Andamos para frente, voltamos para trás",
        "translation": "Andamos para frente, voltamos para trás"
      },
      {
        "start": 17,
        "end": 24,
        "text": "Nós somos índios queremos chegar (2x)",
        "translation": "Nós somos índios queremos chegar (2x)"
      },
      {
        "start": 24,
        "end": 31,
        "text": "Bahia terra de São Salvador (2x)",
        "translation": "Bahia terra de São Salvador (2x)"
      },
      {
        "start": 31,
        "end": 33.78,
        "text": "Nós viemos de uma tribo valente",
        "translation": "Nós viemos de uma tribo valente"
      },
      {
        "start": 33.78,
        "end": 37.5,
        "text": "Andamos para frente, voltamos para trás",
        "translation": "Andamos para frente, voltamos para trás"
      },
      {
        "start": 37.5,
        "end": 40.75,
        "text": "Nós somos índios queremos chegar (2x)",
        "translation": "Nós somos índios queremos chegar (2x)"
      }
    ],
    "updatedAt": "2026-10-27T15:39:46.946Z"
  },
  "title_bahiaterradesaosalvador": {
    "id": "2ac08317-9490-43de-ae1e-3ad86eff1c93",
    "title": "Bahia, terra de São Salvador",
    "duration": 40.75102,
    "ranges": [
      {
        "start": 3.5,
        "end": 10,
        "text": "Bahia terra de São Salvador (2x)",
        "translation": "Bahia terra de São Salvador (2x)"
      },
      {
        "start": 10,
        "end": 13,
        "text": "Nós viemos de uma tribo valente",
        "translation": "Nós viemos de uma tribo valente"
      },
      {
        "start": 13,
        "end": 17,
        "text": "Andamos para frente, voltamos para trás",
        "translation": "Andamos para frente, voltamos para trás"
      },
      {
        "start": 17,
        "end": 24,
        "text": "Nós somos índios queremos chegar (2x)",
        "translation": "Nós somos índios queremos chegar (2x)"
      },
      {
        "start": 24,
        "end": 31,
        "text": "Bahia terra de São Salvador (2x)",
        "translation": "Bahia terra de São Salvador (2x)"
      },
      {
        "start": 31,
        "end": 33.78,
        "text": "Nós viemos de uma tribo valente",
        "translation": "Nós viemos de uma tribo valente"
      },
      {
        "start": 33.78,
        "end": 37.5,
        "text": "Andamos para frente, voltamos para trás",
        "translation": "Andamos para frente, voltamos para trás"
      },
      {
        "start": 37.5,
        "end": 40.75,
        "text": "Nós somos índios queremos chegar (2x)",
        "translation": "Nós somos índios queremos chegar (2x)"
      }
    ],
    "updatedAt": "2026-10-27T15:39:46.946Z"
  },
  "c19a6dea-b18e-4119-ba0a-d7d9b92863ed": {
    "id": "c19a6dea-b18e-4119-ba0a-d7d9b92863ed",
    "title": "Tuhutary Paxixá",
    "duration": 133.688896,
    "ranges": [
      {
        "start": 5.23,
        "end": 8.2,
        "text": "Tuhutary paxixá",
        "translation": "Hoje vou cantar, dançar"
      },
      {
        "start": 8.2,
        "end": 12.05,
        "text": "Suniatá hamiá",
        "translation": "Com meus parentes"
      },
      {
        "start": 12.05,
        "end": 15.11,
        "text": "Hû iõp Kanã taputary",
        "translation": "Na terra, minha aldeia Pataxó"
      },
      {
        "start": 15.11,
        "end": 20,
        "text": "Ui hahão Kanã pataxi pataxó",
        "translation": "Quero ter o coração forte e guerreiro"
      },
      {
        "start": 20,
        "end": 24,
        "text": "Tokere dxé io kawata",
        "translation": "Alegre com muita paz, reunidos"
      },
      {
        "start": 24,
        "end": 28,
        "text": "Tiba kamaywrá",
        "translation": "Deus vem nos dar proteção (3X)"
      },
      {
        "start": 28,
        "end": 35,
        "text": "Uhitué hu nitxi wekanã mukairá",
        "translation": ""
      },
      {
        "start": 35,
        "end": 47.75,
        "text": "Niamissu apôy hõtehô niamitãg (3X)",
        "translation": ""
      },
      {
        "start": 48.25,
        "end": 51.22,
        "text": "Tuhutary paxixá",
        "translation": "Hoje vou cantar, dançar"
      },
      {
        "start": 51.22,
        "end": 55.07,
        "text": "Suniatá hamiá",
        "translation": "Com meus parentes"
      },
      {
        "start": 55.07,
        "end": 58.13,
        "text": "Hû iõp Kanã taputary",
        "translation": "Na terra, minha aldeia Pataxó"
      },
      {
        "start": 58.13,
        "end": 63.02,
        "text": "Ui hahão Kanã pataxi pataxó",
        "translation": "Quero ter o coração forte e guerreiro"
      },
      {
        "start": 63.02,
        "end": 67.02,
        "text": "Tokere dxé io kawata",
        "translation": "Alegre com muita paz, reunidos"
      },
      {
        "start": 67.02,
        "end": 71.02,
        "text": "Tiba kamaywrá",
        "translation": "Deus vem nos dar proteção (3X)"
      },
      {
        "start": 71.02,
        "end": 78.02,
        "text": "Uhitué hu nitxi wekanã mukairá",
        "translation": ""
      },
      {
        "start": 78.02,
        "end": 90.77,
        "text": "Niamissu apôy hõtehô niamitãg (3X)",
        "translation": ""
      },
      {
        "start": 91.27,
        "end": 94.24,
        "text": "Tuhutary paxixá",
        "translation": "Hoje vou cantar, dançar"
      },
      {
        "start": 94.24,
        "end": 98.09,
        "text": "Suniatá hamiá",
        "translation": "Com meus parentes"
      },
      {
        "start": 98.09,
        "end": 101.15,
        "text": "Hû iõp Kanã taputary",
        "translation": "Na terra, minha aldeia Pataxó"
      },
      {
        "start": 101.15,
        "end": 106.04,
        "text": "Ui hahão Kanã pataxi pataxó",
        "translation": "Quero ter o coração forte e guerreiro"
      },
      {
        "start": 106.04,
        "end": 110.04,
        "text": "Tokere dxé io kawata",
        "translation": "Alegre com muita paz, reunidos"
      },
      {
        "start": 110.04,
        "end": 114.04,
        "text": "Tiba kamaywrá",
        "translation": "Deus vem nos dar proteção (3X)"
      },
      {
        "start": 114.04,
        "end": 121.04,
        "text": "Uhitué hu nitxi wekanã mukairá",
        "translation": ""
      },
      {
        "start": 121.04,
        "end": 133.688896,
        "text": "Niamissu apôy hõtehô niamitãg (3X)",
        "translation": ""
      },
      {
        "start": 134.29,
        "end": 133.688896,
        "text": "Tuhutary paxixá",
        "translation": "Hoje vou cantar, dançar"
      },
      {
        "start": 137.26,
        "end": 133.688896,
        "text": "Suniatá hamiá",
        "translation": "Com meus parentes"
      },
      {
        "start": 141.11,
        "end": 133.688896,
        "text": "Hû iõp Kanã taputary",
        "translation": "Na terra, minha aldeia Pataxó"
      },
      {
        "start": 144.17,
        "end": 133.688896,
        "text": "Ui hahão Kanã pataxi pataxó",
        "translation": "Quero ter o coração forte e guerreiro"
      },
      {
        "start": 149.06,
        "end": 133.688896,
        "text": "Tokere dxé io kawata",
        "translation": "Alegre com muita paz, reunidos"
      },
      {
        "start": 153.06,
        "end": 133.688896,
        "text": "Tiba kamaywrá",
        "translation": "Deus vem nos dar proteção (3X)"
      },
      {
        "start": 157.06,
        "end": 133.688896,
        "text": "Uhitué hu nitxi wekanã mukairá",
        "translation": ""
      },
      {
        "start": 164.06,
        "end": 133.688896,
        "text": "Niamissu apôy hõtehô niamitãg (3X)",
        "translation": ""
      }
    ],
    "updatedAt": "2026-10-27T15:45:03.284Z"
  },
  "title_tuhutarypaxixa": {
    "id": "c19a6dea-b18e-4119-ba0a-d7d9b92863ed",
    "title": "Tuhutary Paxixá",
    "duration": 133.688896,
    "ranges": [
      {
        "start": 5.23,
        "end": 8.2,
        "text": "Tuhutary paxixá",
        "translation": "Hoje vou cantar, dançar"
      },
      {
        "start": 8.2,
        "end": 12.05,
        "text": "Suniatá hamiá",
        "translation": "Com meus parentes"
      },
      {
        "start": 12.05,
        "end": 15.11,
        "text": "Hû iõp Kanã taputary",
        "translation": "Na terra, minha aldeia Pataxó"
      },
      {
        "start": 15.11,
        "end": 20,
        "text": "Ui hahão Kanã pataxi pataxó",
        "translation": "Quero ter o coração forte e guerreiro"
      },
      {
        "start": 20,
        "end": 24,
        "text": "Tokere dxé io kawata",
        "translation": "Alegre com muita paz, reunidos"
      },
      {
        "start": 24,
        "end": 28,
        "text": "Tiba kamaywrá",
        "translation": "Deus vem nos dar proteção (3X)"
      },
      {
        "start": 28,
        "end": 35,
        "text": "Uhitué hu nitxi wekanã mukairá",
        "translation": ""
      },
      {
        "start": 35,
        "end": 47.75,
        "text": "Niamissu apôy hõtehô niamitãg (3X)",
        "translation": ""
      },
      {
        "start": 48.25,
        "end": 51.22,
        "text": "Tuhutary paxixá",
        "translation": "Hoje vou cantar, dançar"
      },
      {
        "start": 51.22,
        "end": 55.07,
        "text": "Suniatá hamiá",
        "translation": "Com meus parentes"
      },
      {
        "start": 55.07,
        "end": 58.13,
        "text": "Hû iõp Kanã taputary",
        "translation": "Na terra, minha aldeia Pataxó"
      },
      {
        "start": 58.13,
        "end": 63.02,
        "text": "Ui hahão Kanã pataxi pataxó",
        "translation": "Quero ter o coração forte e guerreiro"
      },
      {
        "start": 63.02,
        "end": 67.02,
        "text": "Tokere dxé io kawata",
        "translation": "Alegre com muita paz, reunidos"
      },
      {
        "start": 67.02,
        "end": 71.02,
        "text": "Tiba kamaywrá",
        "translation": "Deus vem nos dar proteção (3X)"
      },
      {
        "start": 71.02,
        "end": 78.02,
        "text": "Uhitué hu nitxi wekanã mukairá",
        "translation": ""
      },
      {
        "start": 78.02,
        "end": 90.77,
        "text": "Niamissu apôy hõtehô niamitãg (3X)",
        "translation": ""
      },
      {
        "start": 91.27,
        "end": 94.24,
        "text": "Tuhutary paxixá",
        "translation": "Hoje vou cantar, dançar"
      },
      {
        "start": 94.24,
        "end": 98.09,
        "text": "Suniatá hamiá",
        "translation": "Com meus parentes"
      },
      {
        "start": 98.09,
        "end": 101.15,
        "text": "Hû iõp Kanã taputary",
        "translation": "Na terra, minha aldeia Pataxó"
      },
      {
        "start": 101.15,
        "end": 106.04,
        "text": "Ui hahão Kanã pataxi pataxó",
        "translation": "Quero ter o coração forte e guerreiro"
      },
      {
        "start": 106.04,
        "end": 110.04,
        "text": "Tokere dxé io kawata",
        "translation": "Alegre com muita paz, reunidos"
      },
      {
        "start": 110.04,
        "end": 114.04,
        "text": "Tiba kamaywrá",
        "translation": "Deus vem nos dar proteção (3X)"
      },
      {
        "start": 114.04,
        "end": 121.04,
        "text": "Uhitué hu nitxi wekanã mukairá",
        "translation": ""
      },
      {
        "start": 121.04,
        "end": 133.688896,
        "text": "Niamissu apôy hõtehô niamitãg (3X)",
        "translation": ""
      },
      {
        "start": 134.29,
        "end": 133.688896,
        "text": "Tuhutary paxixá",
        "translation": "Hoje vou cantar, dançar"
      },
      {
        "start": 137.26,
        "end": 133.688896,
        "text": "Suniatá hamiá",
        "translation": "Com meus parentes"
      },
      {
        "start": 141.11,
        "end": 133.688896,
        "text": "Hû iõp Kanã taputary",
        "translation": "Na terra, minha aldeia Pataxó"
      },
      {
        "start": 144.17,
        "end": 133.688896,
        "text": "Ui hahão Kanã pataxi pataxó",
        "translation": "Quero ter o coração forte e guerreiro"
      },
      {
        "start": 149.06,
        "end": 133.688896,
        "text": "Tokere dxé io kawata",
        "translation": "Alegre com muita paz, reunidos"
      },
      {
        "start": 153.06,
        "end": 133.688896,
        "text": "Tiba kamaywrá",
        "translation": "Deus vem nos dar proteção (3X)"
      },
      {
        "start": 157.06,
        "end": 133.688896,
        "text": "Uhitué hu nitxi wekanã mukairá",
        "translation": ""
      },
      {
        "start": 164.06,
        "end": 133.688896,
        "text": "Niamissu apôy hõtehô niamitãg (3X)",
        "translation": ""
      }
    ],
    "updatedAt": "2026-10-27T15:45:03.284Z"
  },
  "88a25101-27e6-48c9-a86b-7c2f85c804e0": {
    "id": "88a25101-27e6-48c9-a86b-7c2f85c804e0",
    "title": "Kanã Pataxí Petoĩ",
    "duration": 53.361393,
    "ranges": [
      {
        "start": 6,
        "end": 12,
        "text": "Kanã pataxí petoĩ",
        "translation": "Nossa aldeia Pataxó"
      },
      {
        "start": 12,
        "end": 19,
        "text": "Baixutxê nãahã pokaiaré",
        "translation": "Caminha firme com força"
      },
      {
        "start": 19,
        "end": 22.29,
        "text": "Ahnã petoĩ puhuy",
        "translation": "Nossa aldeia sagrada"
      },
      {
        "start": 22.29,
        "end": 27.47,
        "text": "Ahnã petoĩ akuã",
        "translation": "Nossa aldeia guerreira"
      },
      {
        "start": 27.47,
        "end": 34.37,
        "text": "Ahnã petoĩ sara dxahá txóp haré",
        "translation": "Nossa aldeia canta e dança em festa"
      },
      {
        "start": 34.37,
        "end": 48,
        "text": "Kahab'txê siratã(2x)",
        "translation": "Alegres, unidos"
      },
      {
        "start": 48,
        "end": 53.27,
        "text": "Dxahá umip apóy umip mayõ",
        "translation": "Hoje e sempre, todos juntos"
      }
    ],
    "updatedAt": "2026-10-27T15:48:33.938Z"
  },
  "title_kanapataxipetoi": {
    "id": "88a25101-27e6-48c9-a86b-7c2f85c804e0",
    "title": "Kanã Pataxí Petoĩ",
    "duration": 53.361393,
    "ranges": [
      {
        "start": 6,
        "end": 12,
        "text": "Kanã pataxí petoĩ",
        "translation": "Nossa aldeia Pataxó"
      },
      {
        "start": 12,
        "end": 19,
        "text": "Baixutxê nãahã pokaiaré",
        "translation": "Caminha firme com força"
      },
      {
        "start": 19,
        "end": 22.29,
        "text": "Ahnã petoĩ puhuy",
        "translation": "Nossa aldeia sagrada"
      },
      {
        "start": 22.29,
        "end": 27.47,
        "text": "Ahnã petoĩ akuã",
        "translation": "Nossa aldeia guerreira"
      },
      {
        "start": 27.47,
        "end": 34.37,
        "text": "Ahnã petoĩ sara dxahá txóp haré",
        "translation": "Nossa aldeia canta e dança em festa"
      },
      {
        "start": 34.37,
        "end": 48,
        "text": "Kahab'txê siratã(2x)",
        "translation": "Alegres, unidos"
      },
      {
        "start": 48,
        "end": 53.27,
        "text": "Dxahá umip apóy umip mayõ",
        "translation": "Hoje e sempre, todos juntos"
      }
    ],
    "updatedAt": "2026-10-27T15:48:33.952Z"
  }
};
