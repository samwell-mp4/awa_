export type Song = {
  id: string;
  title: string;
  audioUrl: string;
  lines: { pat: string; pt: string }[];
};

export const songsData: Song[] = [
  {
    id: "1",
    title: "Cântico Pataxó 1",
    audioUrl: "https://pxabkwabefkajiggcmjq.supabase.co/storage/v1/object/public/songs/cantico1.mp3",
    lines: [
      { pat: "Hãhãhãe, pataxó!", pt: "Somos Pataxó!" },
      { pat: "Hãhãhãe, pataxó!", pt: "Somos Pataxó!" },
      { pat: "Eã, eã, eã!", pt: "Eã, eã, eã!" },
      { pat: "Na aldeia, na floresta", pt: "Na aldeia, na floresta" },
      { pat: "Nossos cantos vamos cantar", pt: "Nossos cantos vamos cantar" },
      { pat: "Hãhãhãe, pataxó!", pt: "Somos Pataxó!" },
      { pat: "Hãhãhãe, pataxó!", pt: "Somos Pataxó!" },
      { pat: "Eã, eã, eã!", pt: "Eã, eã, eã!" },
    ],
  },
];
