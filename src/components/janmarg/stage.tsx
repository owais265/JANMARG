import type { ReactNode } from "react";

const schemes = ["Pre-Matric", "Post-Matric", "Top Class", "NFST", "Overseas"];

export function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <aside className="stage-aside">
        <p className="text-sm tracking-[0.18em] text-[#e7d7b4] uppercase">Ministry of Tribal Affairs</p>
        <div>
          <h1 className="font-display text-7xl leading-none text-[#f7f3ea]">JANMARG</h1>
          <p className="mt-4 max-w-md text-lg text-[#d9e4db]">
            One student path across five scholarships. See what is stuck, what is verified, and when money moves.
          </p>
        </div>
        <ol className="max-w-sm space-y-2">
          {schemes.map((name, index) => (
            <li key={name} className="flex items-center gap-3 text-[#f4efe4]">
              <span className="grid size-7 place-items-center rounded-full bg-white/10 text-sm text-[#e39b2b] tabular-nums">
                {index + 1}
              </span>
              {name}
            </li>
          ))}
        </ol>
        <p className="max-w-md text-sm leading-relaxed text-[#c9d5cc]">
          JANMARG is one student path across the five Ministry of Tribal Affairs scholarships. It shows what is stuck, what is verified, and when a payment step exists. No Aadhaar number is stored.
        </p>
        <p className="text-sm text-[#e39b2b]">Ministry of Tribal Affairs · five schemes</p>
      </aside>
      <div className="stage-clip">
        <div className="stage-phone">{children}</div>
      </div>
    </div>
  );
}
