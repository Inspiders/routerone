const MOCK_DATASETS = [
  {
    golden_datasets: {
      id: 1,
      name: "support-ticket-golden-20",
      cases: new Array(20),
    },
    routes: {
      name: "support-ticket-classify",
    },
  },
  {
    golden_datasets: {
      id: 2,
      name: "code-review-golden-15",
      cases: new Array(15),
    },
    routes: {
      name: "code-review",
    },
  },
  {
    golden_datasets: {
      id: 3,
      name: "summarize-golden-10",
      cases: new Array(10),
    },
    routes: {
      name: "summarize",
    },
  },
];

const MOCK_RESULTS = [
  { id: 1, model: "gpt-4o",          provider: "openai",    score: 0.95, createdAt: new Date("2026-08-22") },
  { id: 2, model: "claude-3-opus",   provider: "anthropic", score: 0.93, createdAt: new Date("2026-08-21") },
  { id: 3, model: "llama3-70b-8192", provider: "groq",      score: 0.82, createdAt: new Date("2026-08-20") },
  { id: 4, model: "gpt-3.5-turbo",   provider: "openai",    score: 0.78, createdAt: new Date("2026-08-19") },
  { id: 5, model: "llama3-8b-8192",  provider: "groq",      score: 0.72, createdAt: new Date("2026-08-18") },
];

export default async function EvaluationPage() {
  let datasets: typeof MOCK_DATASETS = [];
  let results: typeof MOCK_RESULTS = [];

  try {
    const { db, goldenDatasets, evaluationResults, routes } = await import("@routerone/shared");
    const { desc, eq } = await import("drizzle-orm");

    datasets = (await db.select().from(goldenDatasets)
      .leftJoin(routes, eq(goldenDatasets.routeId, routes.id))) as any;

    results = (await db.select().from(evaluationResults)
      .orderBy(desc(evaluationResults.createdAt))
      .limit(50)) as any;
  } catch {
    console.warn("[evaluation-page] DB not available — serving mock evaluation data");
    datasets = MOCK_DATASETS;
    results = MOCK_RESULTS;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2 tracking-tighter">EVALUATION ENGINE</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border-4 border-black p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">GOLDEN DATASETS</h2>
          <table className="w-full border-2 border-black border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-black text-white">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Route</th>
                <th className="p-2 text-right">Cases</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d: any) => (
                <tr key={d.golden_datasets.id} className="border-b border-black hover:bg-gray-100">
                  <td className="p-2">{d.golden_datasets.name}</td>
                  <td className="p-2">{d.routes?.name || "—"}</td>
                  <td className="p-2 text-right">{d.golden_datasets.cases?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-4 border-black p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">EVALUATION RESULTS</h2>
          <table className="w-full border-2 border-black border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-black text-white">
                <th className="p-2 text-left">Model</th>
                <th className="p-2 text-left">Provider</th>
                <th className="p-2 text-right">Score</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: any) => (
                <tr key={r.id} className="border-b border-black hover:bg-gray-100">
                  <td className="p-2">{r.model}</td>
                  <td className="p-2">{r.provider}</td>
                  <td className="p-2 text-right font-bold">{(r.score * 100).toFixed(1)}%</td>
                  <td className="p-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-4 border-black p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">SCORES BY MODEL</h2>
        <div className="space-y-2">
          {results.map((r: any) => (
            <div key={r.id} className="flex items-center gap-2">
              <div className="w-40 text-xs font-mono font-bold">{r.provider}/{r.model}</div>
              <div className="flex-1 h-6 border-2 border-black relative">
                <div className="h-full bg-black" style={{ width: `${r.score * 100}%` }} />
              </div>
              <div className="w-16 text-right text-xs font-mono font-bold">{(r.score * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
