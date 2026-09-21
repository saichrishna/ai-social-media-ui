import type { CorpusItemSource } from "@/types/brand";

export function corpusSourceLabel(source: CorpusItemSource | string): string {
  switch (source) {
    case "mini_talk":
      return "Mini talk";
    case "full_talk":
      return "Full talk";
    case "paste":
      return "Paste";
    case "type":
      return "Typed";
    case "studio_edit":
      return "Studio edit";
    case "legacy_transcript":
      return "Transcript";
    case "legacy_answer":
      return "Earlier answer";
    default:
      return "Capture";
  }
}
