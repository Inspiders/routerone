"use client";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="p-8 lg:p-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b-2 border-white/20 pb-12">
          <div>
            <div className="text-2xl font-black uppercase tracking-tighter mb-4">Routerone</div>
            <p className="text-sm font-mono opacity-60 leading-relaxed">
              Open-source proxy to reduce LLM costs 
              without changing application code.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">Documentation</div>
            <ul className="space-y-2 text-sm font-mono">
              <li><a href="#" className="hover:underline">Quick Start</a></li>
              <li><a href="#" className="hover:underline">Route Configuration</a></li>
              <li><a href="#" className="hover:underline">API Reference</a></li>
              <li><a href="#" className="hover:underline">Self-Hosting Guide</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">Community</div>
            <ul className="space-y-2 text-sm font-mono">
              <li><a href="https://github.com/Inspiders/routerone" className="hover:underline">GitHub</a></li>
              <li><a href="#" className="hover:underline">Issues</a></li>
              <li><a href="#" className="hover:underline">Discussions</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-xs font-mono opacity-50">
            Licensed under MIT. No warranties. Use at your own risk.
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/Inspiders/routerone"
              className="inline-block border-2 border-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              VIEW ON GITHUB
            </a>
            <a
              href="#self-hosted"
              className="inline-block border-2 border-white px-6 py-3 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-transparent hover:text-white transition-colors"
            >
              GET STARTED IN 5 MIN
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
