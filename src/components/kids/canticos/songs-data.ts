export interface Song {
  id: string;
  title: string;
  patxohaTitle: string;
  lyrics: {
    patxoha: string[];
    portugues: string[];
  };
}

export const SONGS: Song[] = [
  {
    id: "somos-pataxo",
    title: "Somos Pataxó",
    patxohaTitle: "Hãhãhãe, Pataxó!",
    lyrics: {
      patxoha: [
        "Hãhãhãe, pataxó!",
        "Hãhãhãe, pataxó!",
        "Eã, eã, eã!",
        "Na aldeia, na floresta",
        "Nossos cantos vamos cantar",
        "Hãhãhãe, pataxó!",
        "Hãhãhãe, pataxó!",
        "Eã, eã, eã!"
      ],
      portugues: [
        "Somos Pataxó!",
        "Somos Pataxó!",
        "Eã, eã, eã!",
        "Na aldeia, na floresta",
        "Nossos cantos vamos cantar",
        "Somos Pataxó!",
        "Somos Pataxó!",
        "Eã, eã, eã!"
      ]
    }
  }
];
