"use client";

export default function HowItWorks() {
  return (
    <section className="border-b-2 border-black">
      <div className="p-8 lg:p-16">
        <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-12">
          HOW IT WORKS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black">
          {/* Client */}
          <div className="border-b-2 md:border-b-0 md:border-r-2 border-black p-8">
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">01</div>
            <h3 className="text-2xl font-black uppercase mb-4">CLIENT</h3>
            <p className="font-mono text-sm leading-relaxed">
              Your app makes a normal request to the OpenAI or Anthropic SDK. 
              Only the <code className="bg-black text-white px-1">base_url</code> changes.
            </p>
          </div>

          {/* Proxy */}
          <div className="border-b-2 md:border-b-0 md:border-r-2 border-black p-8 bg-black text-white">
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">02</div>
            <h3 className="text-2xl font-black uppercase mb-4">ROUTERONE</h3>
            <p className="font-mono text-sm leading-relaxed">
              Classifies request difficulty. Checks semantic cache. 
              Picks the cheapest model capable of answering with quality. 
              If it fails, tries the next one and logs the cost.
            </p>
          </div>

          {/* Providers */}
          <div className="p-8">
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">03</div>
            <h3 className="text-2xl font-black uppercase mb-4">PROVIDERS</h3>
            <p className="font-mono text-sm leading-relaxed">
              LiteLLM routes to OpenAI, Anthropic, Groq, DeepSeek or others. 
              The client receives the response in the original format. 
              Zero code changes.
            </p>
          </div>
        </div>

        {/* Visual diagram */}
        <div className="mt-12 border-2 border-black p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-sm font-bold">
            <div className="border-2 border-black px-6 py-4 w-full md:w-auto text-center">
              YOUR APP
            </div>
            <div className="text-2xl hidden md:block">→</div>
            <div className="border-2 border-black px-6 py-4 w-full md:w-auto text-center bg-black text-white">
              ROUTERONE PROXY
            </div>
            <div className="text-2xl hidden md:block">→</div>
            <div className="border-2 border-black px-6 py-4 w-full md:w-auto text-center">
              LITELLM
            </div>
            <div className="text-2xl hidden md:block">→</div>
            <div className="flex gap-2">
              <div className="border-2 border-black px-3 py-4 text-center text-xs">OPENAI</div>
              <div className="border-2 border-black px-3 py-4 text-center text-xs">ANTHROPIC</div>
              <div className="border-2 border-black px-3 py-4 text-center text-xs">GROQ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
