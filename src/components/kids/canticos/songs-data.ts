import { speak } from "@/lib/speak";

export interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics_patxoha: string;
  lyrics_portugues: string;
}

export const SONGS: Song[] = [
  {
    id: "hãhãhãe",
    title: "Hãhãhãe, Pataxó!",
    artist: "Aldeia Pataxó",
    lyrics_patxoha: `Hãhãhãe, pataxó!
Hãhãhãe, pataxó!
Eã, eã, eã!

Na aldeia, na floresta
Nossos cantos vamos cantar

Hãhãhãe, pataxó!
Hãhãhãe, pataxó!
Eã, eã, eã!`,
    lyrics_portugues: `Somos Pataxó!
Somos Pataxó!
Eã, eã, eã!

Na aldeia, na floresta
Nossos cantos vamos cantar

Somos Pataxó!
Somos Pataxó!
Eã, eã, eã!`,
  }
];
