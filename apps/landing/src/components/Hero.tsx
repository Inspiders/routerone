"use client";

export default function Hero() {
  return (
    <section className="border-b-2 border-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: Copy */}
        <div className="p-8 lg:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-black flex flex-col justify-center">
          <div className="mb-6">
            <span className="inline-block border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-widest">
              OPEN SOURCE — SELF-HOSTED
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-8">
            SLASH YOUR LLM<br />
            API COSTS IN<br />
            SECONDS
          </h1>
          <p className="text-lg lg:text-xl font-medium mb-8 max-w-lg leading-relaxed">
            Change the <code className="font-mono bg-black text-white px-1">base_url</code> in your SDK. 
            Routerone automatically picks the cheapest model capable of answering 
            with sufficient quality. Zero code changes in your app.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/Inspiders/routerone"
              className="inline-block border-2 border-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              VIEW ON GITHUB
            </a>
            <a
              href="#self-hosted"
              className="inline-block border-2 border-black px-8 py-4 text-sm font-bold uppercase tracking-widest bg-black text-white hover:bg-white hover:text-black transition-colors"
            >
              GET STARTED IN 5 MIN
            </a>
          </div>
        </div>

        {/* Right: Code Block */}
        <div className="p-8 lg:p-16 bg-black text-white flex flex-col justify-center">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-widest opacity-50">BEFORE / AFTER</span>
          </div>
          <div className="space-y-6 font-mono text-sm">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 mb-2">BEFORE</div>
              <div className="border border-white/30 p-4">
                <pre className="overflow-x-auto">
{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // default baseUrl — paying full price
});`}
                </pre>
              </div>
            </div>
            <div className="text-center text-2xl">↓</div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 mb-2">AFTER</div>
              <div className="border border-white/30 p-4 bg-white text-black">
                <pre className="overflow-x-auto">
{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-r1-<your-key>",
  baseURL: "http://localhost:3000/v1", // ← just this
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
