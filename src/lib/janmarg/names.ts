/** Ignore case, dots, and repeated spaces. Real spelling changes stay manual. */
export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

export function classifyName(left: string, right: string): "match" | "auto" | "manual" {
  if (left.trim() === right.trim()) return "match";
  if (normalizeName(left) === normalizeName(right)) return "auto";
  return "manual";
}

export function namesEquivalent(left: string, right: string): boolean {
  return classifyName(left, right) !== "manual";
}
