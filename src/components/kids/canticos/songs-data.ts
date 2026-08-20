export interface LyricLine {
  pataxo: string;
  portugues: string;
  time: number; // In seconds
}

export interface KidSong {
  id: string;
  title: string;
  image: string;
  audio: string;
  lyrics: LyricLine[];
  author?: string;
  culturalInfo?: string;
  credits?: string;
  authorizedBy?: string;
}

export const CANTICOS_DATA: KidSong[] = [
  {
    id: "hino-pataxo-kids",
    title: "Hino Pataxó (Versão Infantil)",
    image: "/src/assets/musicas-infantil-bg.jpg",
    audio: "https://pxabkwabefkajiggcmjq.supabase.co/storage/v1/object/public/songs/hino_pataxo.mp3",
    lyrics: [
      { pataxo: "Pataxó hã-hã-hãe", portugues: "Nós somos Pataxó", time: 0 },
      { pataxo: "Mokoi petá raiz", portugues: "Uma só raiz", time: 4 },
      { pataxo: "Awã Tech, vida viva", portugues: "Tecnologia, vida viva", time: 8 },
      { pataxo: "Nih hã, nih hã", portugues: "Olhe aqui, olhe aqui", time: 12 },
    ],
    author: "Comunidade Pataxó",
    culturalInfo: "Cântico de união e força do povo Pataxó.",
    credits: "Awã Tech Educação",
    authorizedBy: "Lideranças da Aldeia"
  },
  {
    id: "dança-da-chuva",
    title: "Dança da Chuva",
    image: "/src/assets/infantil-categorias-bg.jpg",
    audio: "https://pxabkwabefkajiggcmjq.supabase.co/storage/v1/object/public/songs/danca_chuva.mp3",
    lyrics: [
      { pataxo: "Wá, wá, wá", portugues: "Água, água, água", time: 0 },
      { pataxo: "Kíriri hitá", portugues: "O sol se vai", time: 5 },
      { pataxo: "Tupã awê", portugues: "Espírito agradece", time: 10 },
    ],
    author: "Ancestrais",
    culturalInfo: "Cântico para celebrar a vinda da chuva.",
    credits: "Awã Tech Infantil",
    authorizedBy: "Conselho de Anciãos"
  }
];
