export interface Model {
  id: string;
  name: string;
  provider: "google" | "openai";
}
export const MODELS:Model[] = [
  { id: "gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro" , provider: "google"},
  { id: "gemini-2.5-flash-preview-05-20", name: "Gemini 2.5 Flash",provider: "google" },
  { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro",provider: "google" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini",provider: "openai" }
];