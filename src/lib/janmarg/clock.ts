/** Fixed demo clock so expiry checks do not drift between runs. */
export const DEMO_TODAY = "2026-09-29";
export const DEMO_NOW = "2026-09-29T16:05:00+05:30";
export const DEMO_OTP = "482913";
export const DATA_MODE = "demoMock" as const;

export function isExpired(expiry: string | null, asOf = DEMO_TODAY): boolean {
  if (!expiry) return false;
  return expiry < asOf;
}
