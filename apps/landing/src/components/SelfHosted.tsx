"use client";

export default function SelfHosted() {
  return (
    <section id="self-hosted" className="border-b-2 border-black">
      <div className="p-8 lg:p-16">
        <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-4">
          SELF-HOSTED, ALWAYS
        </h2>
        <p className="text-lg font-medium mb-12 max-w-2xl">
          Routerone runs on your infrastructure. Your data. Your keys. 
          Zero managed SaaS by third parties. Zero lock-in.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-2 border-black">
          {/* Docker Compose */}
          <div className="border-b-2 lg:border-b-0 lg:border-r-2 border-black p-8">
            <h3 className="text-2xl font-black uppercase mb-6">DOCKER COMPOSE</h3>
            <div className="border-2 border-black p-4 bg-black text-white font-mono text-sm overflow-x-auto">
              <pre>{`git clone https://github.com/Inspiders/routerone.git
cd routerone
cp .env.example .env
# Edit .env with your API keys

docker compose up --build

# Ready. Proxy at localhost:3000
# Dashboard at localhost:3001`}</pre>
            </div>
            <p className="mt-4 text-sm font-mono">
              5 minutes. Postgres, Redis, LiteLLM, Proxy and Dashboard.
            </p>
          </div>

          {/* Kubernetes */}
          <div className="p-8">
            <h3 className="text-2xl font-black uppercase mb-6">KUBERNETES</h3>
            <div className="border-2 border-black p-4 bg-black text-white font-mono text-sm overflow-x-auto">
              <pre>{`# Helm chart (coming soon)
helm repo add routerone https://routerone.github.io/charts
helm install routerone routerone/routerone \
  --set openai.apiKey=$OPENAI_API_KEY \
  --set anthropic.apiKey=$ANTHROPIC_API_KEY

# Or apply manifests directly
kubectl apply -f k8s/`}</pre>
            </div>
            <p className="mt-4 text-sm font-mono">
              StatefulSet for Postgres, Deployment for proxy, 
              Ingress to expose the endpoint.
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black mt-8 border-t-0">
          {[
            ["NO VENDOR LOCK-IN", "Open source. Replace LiteLLM or the proxy whenever you want."],
            ["NO DATA LEAVES", "Nothing leaves your cluster. Requests, responses, logs — all local."],
            ["NO HIDDEN FEES", "Zero commission. Zero markup. You only pay what providers charge."],
          ].map(([title, desc]) => (
            <div key={title} className="border-b-2 md:border-b-0 md:border-r-2 last:border-r-0 border-black p-6">
              <div className="text-xs font-bold uppercase tracking-widest mb-2">{title}</div>
              <p className="text-sm font-mono leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
