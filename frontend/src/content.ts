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
  caption: string;
  youtubeId: string;
  poster: string;
};
// Supply real YouTube IDs and local poster paths. Hidden until real work is added.
export const projects: Project[] = [];
