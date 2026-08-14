"use client";

export default function Proof() {
  return (
    <section className="border-b-2 border-black">
      <div className="p-8 lg:p-16">
        <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-4">
          PROOF
        </h2>
        <p className="text-lg font-medium mb-12 max-w-2xl">
          Difficulty-based routing + continuous evaluation with golden datasets. 
          Every new model is tested before entering production routing.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-2 border-black">
          {/* Screenshot 1: Cost dashboard */}
          <div className="border-b-2 lg:border-b-0 lg:border-r-2 border-black p-4">
            <div className="border-2 border-black p-2 mb-4">
              <div className="bg-black text-white p-2 text-xs font-mono uppercase tracking-widest">
                DASHBOARD — COST PER DAY
              </div>
              <div className="p-8 bg-white">
                <div className="flex items-end gap-2 h-48 border-b-2 border-black pb-2">
                  {[40, 35, 55, 30, 45, 25, 38, 42, 28, 48, 32, 50, 36, 44, 30, 52, 38, 46, 34, 40, 36, 42, 30, 48, 35, 44, 32, 50, 38, 46].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                      <div className="bg-black" style={{ height: `${h}%` }} />
                      <div className="bg-gray-400" style={{ height: `${h * 0.3}%` }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs font-mono">
                  <span>Day 1</span>
                  <span>Day 30</span>
                </div>
                <div className="mt-4 flex gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-black" />
                    <span>Baseline</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-400" />
                    <span>Actual Cost</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm font-mono">
              Actual cost vs. baseline (always using the most expensive model). 
              The gray area is money that stopped being spent.
            </p>
          </div>

          {/* Screenshot 2: Evaluation scores */}
          <div className="p-4">
            <div className="border-2 border-black p-2 mb-4">
              <div className="bg-black text-white p-2 text-xs font-mono uppercase tracking-widest">
                EVALUATION ENGINE — SCORES BY MODEL
              </div>
              <div className="p-8 bg-white space-y-3">
                {[
                  { model: "gpt-4o", score: 95, provider: "openai" },
                  { model: "claude-3-opus", score: 93, provider: "anthropic" },
                  { model: "llama3-70b", score: 82, provider: "groq" },
                  { model: "gpt-3.5-turbo", score: 78, provider: "openai" },
                  { model: "llama3-8b", score: 72, provider: "groq" },
                ].map((m) => (
                  <div key={m.model} className="flex items-center gap-2">
                    <div className="w-32 text-xs font-mono font-bold">{m.provider}/{m.model}</div>
                    <div className="flex-1 h-6 border-2 border-black relative">
                      <div className="h-full bg-black" style={{ width: `${m.score}%` }} />
                    </div>
                    <div className="w-12 text-right text-xs font-mono font-bold">{m.score}%</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm font-mono">
              Every model is evaluated against golden datasets before becoming 
              eligible for production routing.
            </p>
          </div>
        </div>

        {/* Proof metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-black mt-8">
          {[
            ["AVG REDUCTION", "60–85%"],
            ["CACHE HIT RATE", "15–30%"],
            ["FALLBACK RATE", "< 5%"],
            ["MODELS SUPPORTED", "100+"],
          ].map(([label, value]) => (
            <div key={label} className="border-r-2 border-b-2 md:border-b-0 last:border-r-0 border-black p-6">
              <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{label}</div>
              <div className="text-3xl font-black">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
