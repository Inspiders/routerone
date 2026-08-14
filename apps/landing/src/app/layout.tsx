import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RouterOne — Cut Your LLM API Costs in Seconds",
  description:
    "Open-source, self-hosted LLM proxy that automatically routes each request to the cheapest model capable of answering with quality. Change only the base_url. Zero code changes in your app.",
  keywords: [
    "LLM proxy",
    "OpenAI proxy",
    "LLM cost reduction",
    "AI cost optimization",
    "self-hosted LLM gateway",
    "open source LLM router",
    "LiteLLM",
    "Anthropic proxy",
    "Groq",
  ],
  authors: [{ name: "RouterOne" }],
  openGraph: {
    title: "RouterOne — Cut Your LLM API Costs in Seconds",
    description:
      "Self-hosted LLM proxy that picks the cheapest model capable of answering with quality. Change only the base_url.",
    url: "https://routerone.dev",
    siteName: "RouterOne",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RouterOne — Cut Your LLM API Costs in Seconds",
    description:
      "Self-hosted LLM proxy. Change the base_url, save 60–85% on LLM API costs automatically.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
