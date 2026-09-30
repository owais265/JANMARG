/** Fixed width so a future xAI model can replace this column without a new table. */
export const DEMO_DIM = 64;

export type EmbeddingResult = {
  vector: number[];
  provider: "xai" | "demoHash";
};

/** Temporary stand-in. Not a semantic model. */
export function demoEmbed(text: string): number[] {
  const vector = new Array<number>(DEMO_DIM).fill(0);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 2);
  for (const token of tokens) {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
      hash = Math.imul(hash ^ token.charCodeAt(index), 16777619);
    }
    const slot = Math.abs(hash) % DEMO_DIM;
    vector[slot] += (hash & 1) === 0 ? 1 : -1;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

let xaiBlocked = false;

export async function embedText(text: string, apiKey: string | undefined): Promise<EmbeddingResult> {
  const model = process.env.XAI_EMBEDDING_MODEL || "v1";
  if (apiKey && !xaiBlocked) {
    try {
      const response = await fetch("https://api.x.ai/v1/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          input: [text.slice(0, 2000)],
          encoding_format: "float",
          dimensions: DEMO_DIM,
        }),
      });
      if (response.ok) {
        const body = (await response.json()) as { data?: { embedding?: number[] }[] };
        const vector = body.data?.[0]?.embedding;
        if (vector && vector.length === DEMO_DIM) return { vector, provider: "xai" };
      }
      xaiBlocked = true;
    } catch {
      xaiBlocked = true;
    }
  }
  return { vector: demoEmbed(text), provider: "demoHash" };
}
