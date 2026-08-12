"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

interface DashboardData {
  daily: Array<{ date: string; cost: number; baseline: number; savings: number; requests: number }>;
  byRoute: Array<{ name: string; cost: number; baseline: number; savings: number; requests: number }>;
  byModel: Array<{ model: string; cost: number; requests: number; avgLatency: number }>;
  fallbackRate: number;
  totalRequests: number;
  totalCost: number;
  totalBaseline: number;
  totalSavings: number;
  latencyP50: number;
  latencyP95: number;
  cacheStats: Array<{ name: string; hits: number; misses: number; rate: string }>;
}

const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-data")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-xl font-bold">LOADING...</div>;
  if (!data) return <div className="p-8 text-xl font-bold">ERROR LOADING DATA</div>;

  const savingsRate = data.totalBaseline > 0 ? ((data.totalSavings / data.totalBaseline) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-4">
      <h1 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2 tracking-tighter">
        ROUTERONE — DASHBOARD
      </h1>

      <div className="grid grid-cols-6 gap-0 border-4 border-black mb-8">
        {[
          ["REQUESTS", data.totalRequests.toString()],
          ["ACTUAL COST", `$${data.totalCost.toFixed(4)}`],
          ["BASELINE", `$${data.totalBaseline.toFixed(4)}`],
          ["SAVINGS", `$${data.totalSavings.toFixed(4)}`],
          ["SAVINGS %", `${savingsRate}%`],
          ["FALLBACK", `${data.fallbackRate.toFixed(1)}%`],
        ].map(([label, value]) => (
          <div key={label} className="border-r-2 border-black last:border-r-0 p-4 bg-white">
            <div className="text-xs font-bold uppercase tracking-widest opacity-50">{label}</div>
            <div className="text-2xl font-black mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-0 border-4 border-black mb-8">
        <div className="border-r-2 border-black p-4">
          <div className="text-xs font-bold uppercase tracking-widest opacity-50">LATENCY P50</div>
          <div className="text-4xl font-black">{data.latencyP50}ms</div>
        </div>
        <div className="p-4">
          <div className="text-xs font-bold uppercase tracking-widest opacity-50">LATENCY P95</div>
          <div className="text-4xl font-black">{data.latencyP95}ms</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border-4 border-black p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">COST PER DAY</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="date" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip contentStyle={{border: "2px solid #000", borderRadius: 0}} />
              <Legend />
              <Area type="monotone" dataKey="cost" stackId="1" stroke="#000" fill="#000" name="Actual Cost" />
              <Area type="monotone" dataKey="baseline" stackId="2" stroke="#666" fill="#666" name="Baseline" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="border-4 border-black p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">CUMULATIVE SAVINGS</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="date" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip contentStyle={{border: "2px solid #000", borderRadius: 0}} />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#000" strokeWidth={2} dot={false} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border-4 border-black p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">COST BY ROUTE</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byRoute}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="name" tick={{fontSize: 10}} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip contentStyle={{border: "2px solid #000", borderRadius: 0}} />
              <Legend />
              <Bar dataKey="cost" fill="#000" name="Cost" />
              <Bar dataKey="baseline" fill="#666" name="Baseline" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border-4 border-black p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">COST BY MODEL</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.byModel} dataKey="cost" nameKey="model" cx="50%" cy="50%" outerRadius={80}>
                {data.byModel.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{border: "2px solid #000", borderRadius: 0}} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-4 border-black p-4 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">SEMANTIC CACHE</h2>
        <div className="grid grid-cols-3 gap-0">
          {data.cacheStats.map((stat) => (
            <div key={stat.name} className="border-r-2 border-black last:border-r-0 p-3">
              <div className="text-xs font-bold uppercase">{stat.name}</div>
              <div className="text-xl font-black">{stat.rate}% HIT</div>
              <div className="text-xs opacity-60">{stat.hits} hits / {stat.misses} misses</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-4 border-black p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">EXPORT REPORT</h2>
        <div className="flex gap-2">
          <a href="/api/reports/csv" className="border-2 border-black px-4 py-2 font-bold uppercase hover:bg-black hover:text-white transition-colors">CSV</a>
          <a href="/api/reports/json" className="border-2 border-black px-4 py-2 font-bold uppercase hover:bg-black hover:text-white transition-colors">JSON</a>
        </div>
      </div>
    </div>
  );
}
