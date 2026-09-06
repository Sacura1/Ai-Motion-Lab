export type Track = "creator" | "masterclass";
export const tracks = {
  creator: {
    name: "Creator",
    price: 20000,
    weeks: 2,
    subtitle: "Your first idea. Your first film.",
    description:
      "For beginners ready to turn their imagination into finished animations.",
    skills: [
      "AI image generation & character creation",
      "Animation prompting",
      "Character consistency",
      "Camera movement & cinematic scenes",
    ],
    outcome: "Build your foundation in AI animation.",
  },
  masterclass: {
    name: "Masterclass",
    price: 50000,
    weeks: 3,
    subtitle: "Create with a professional edge.",
    description:
      "For creators ready to make polished work for brands, campaigns and clients.",
    skills: [
      "Advanced prompting & storytelling",
      "Multi-scene animation & cinematic direction",
      "Advanced character consistency",
      "Brand & product advertisements",
      "Advanced editing, voice & sound design",
      "Professional workflows & packaging client work",
    ],
    outcome: "Take your ideas into commercial production.",
  },
};
export const money = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
export type Project = {
  title: string;
  summary: string;
  detail: string;
  resultLabel: string;
  result: string;
  amount?: string;
  youtubeId: string;
  poster: string;
};
export const projects: Project[] = [
  {
    title: "BLOK Capital, explained",
    summary:
      "A short video introducing BLOK Capital to someone completely new to crypto.",
    detail:
      "I had to go with an African inspired style for this one, paired with a British accent.",
    resultLabel: "Recognition",
    result: "Got a big shoutout from the project for the work.",
    youtubeId: "1OTTV4ciGDQ",
    poster: "https://i.ytimg.com/vi/1OTTV4ciGDQ/maxresdefault.jpg",
  },
  {
    title: "MEME — story first",
    summary: "A Pixar style animation for a meme crypto project called MEME.",
    detail:
      "I created this one with a strong focus on storytelling, making it more engaging and interesting to watch.",
    resultLabel: "Project Earnings",
    result: "This one got me $200 in the bag (about ₦268k).",
    amount: "$200 · ₦268k",
    youtubeId: "wXgPgnDayxQ",
    poster: "https://i.ytimg.com/vi/wXgPgnDayxQ/maxresdefault.jpg",
  },
  {
    title: "Stock Impaler — lore in motion",
    summary:
      "A hyper realistic animation created for a crypto project called Stock Impaler.",
    detail:
      "This one was built around the project’s lore, with a strong focus on pacing, sound design and music to bring the story together.",
    resultLabel: "Competition Win",
    result: "Won $500 (₦670k) from this one.",
    amount: "$500 · ₦670k",
    youtubeId: "UyF5T_rM2ug",
    poster: "https://i.ytimg.com/vi/UyF5T_rM2ug/maxresdefault.jpg",
  },
  {
    title: "The $2,300 trailer",
    summary:
      "A short movie trailer created for a public competition hosted by a project.",
    detail:
      "It was built around the project’s lore, with strong pacing, storytelling and compelling visuals to bring the story to life.",
    resultLabel: "Competition Win",
    result:
      "This one got me one of my biggest wins — $2,300 (₦3,000,000).",
    amount: "$2,300 · ₦3,000,000",
    youtubeId: "kL4dplZLI7I",
    poster: "https://i.ytimg.com/vi/kL4dplZLI7I/maxresdefault.jpg",
  },
];
