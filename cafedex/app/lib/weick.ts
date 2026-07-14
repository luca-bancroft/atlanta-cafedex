// The five categories behind The Weick Index. A cafe's base rating (0-5) is
// the count of these criteria a submitter marks as met.
export const WEICK_TAGS = [
  "Brew",
  "Color",
  "Sweet Treats",
  "Decoration",
  "Study Layout",
] as const;

export type WeickTag = (typeof WEICK_TAGS)[number];
