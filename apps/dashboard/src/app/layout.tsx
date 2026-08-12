import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RouterOne — Dashboard",
  description: "Real-time cost, savings, and latency analytics for your RouterOne LLM proxy.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black font-mono text-sm">
        <header className="border-b-2 border-black p-4 flex justify-between items-center">
          <div className="font-bold text-xl uppercase tracking-tight">RouterOne</div>
          <nav className="flex gap-4">
            <a href="/" className="font-bold uppercase hover:underline">Dashboard</a>
            <a href="/evaluation" className="font-bold uppercase hover:underline">Evaluation</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
