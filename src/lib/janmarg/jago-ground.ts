const FILE_QUESTION =
  /\b(why|blocked|block|stuck|next|status|my|file|certificate|name|offer|passport|income|mismatch|क्यों|अटक|आगे|स्थिति|मेरी|फ़ाइल|प्रमाण|नाम|आय)\b/i;

export function isFileQuestion(query: string): boolean {
  return FILE_QUESTION.test(query);
}

/** File fact first, then one rule sentence. Used when the model is absent or ignores the file. */
export function composeGrounded(query: string, fileText: string, passage: string | null): string | null {
  const file = fileText.trim();
  const rule = passage?.trim() ?? "";
  if (isFileQuestion(query)) {
    if (!file && !rule) return null;
    if (!file) return rule;
    if (!rule || file.includes(rule.slice(0, 40))) return file;
    return `${file} ${rule}`.slice(0, 700);
  }
  return rule || null;
}

export function respectsFile(answer: string, fileText: string): boolean {
  const words = fileText
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 4);
  if (words.length === 0) return true;
  const hay = answer.toLowerCase();
  const hits = words.filter((word) => hay.includes(word)).length;
  return hits >= Math.min(2, words.length);
}
