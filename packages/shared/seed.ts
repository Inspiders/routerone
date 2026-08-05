import { db, routes, goldenDatasets } from "./src/db";

async function seed() {
  console.log("Seeding database...");

  const supportRoute = await db.insert(routes).values({
    name: "support-ticket-classify",
    description: "Classify support tickets by priority and category",
    qualityThreshold: 0.75,
    minQualityModel: "gpt-4o",
    modelsConfig: {
      models: [
        { provider: "groq", model: "llama3-8b-8192", costPer1kInput: 0.05, costPer1kOutput: 0.10, qualityScore: 0.72 },
        { provider: "openai", model: "gpt-3.5-turbo", costPer1kInput: 0.50, costPer1kOutput: 1.50, qualityScore: 0.82 },
        { provider: "openai", model: "gpt-4o", costPer1kInput: 5.00, costPer1kOutput: 15.00, qualityScore: 0.95 },
      ],
    },
  }).returning();

  const codeRoute = await db.insert(routes).values({
    name: "code-review",
    description: "Code review and improvement suggestions",
    qualityThreshold: 0.85,
    minQualityModel: "gpt-4o",
    modelsConfig: {
      models: [
        { provider: "groq", model: "llama3-70b-8192", costPer1kInput: 0.59, costPer1kOutput: 0.79, qualityScore: 0.80 },
        { provider: "openai", model: "gpt-4o", costPer1kInput: 5.00, costPer1kOutput: 15.00, qualityScore: 0.95 },
      ],
    },
  }).returning();

  const summarizeRoute = await db.insert(routes).values({
    name: "summarize",
    description: "Summarize long texts",
    qualityThreshold: 0.65,
    minQualityModel: "gpt-3.5-turbo",
    modelsConfig: {
      models: [
        { provider: "groq", model: "llama3-8b-8192", costPer1kInput: 0.05, costPer1kOutput: 0.10, qualityScore: 0.70 },
        { provider: "openai", model: "gpt-3.5-turbo", costPer1kInput: 0.50, costPer1kOutput: 1.50, qualityScore: 0.85 },
      ],
    },
  }).returning();

  await db.insert(goldenDatasets).values({
    routeId: supportRoute[0].id,
    name: "support-ticket-golden-20",
    description: "20 support ticket classification cases",
    cases: [
      { input: "Server is down and all clients are offline. URGENT!", expectedOutput: "priority: critical, category: infrastructure" },
      { input: "How do I change my password?", expectedOutput: "priority: low, category: authentication" },
      { input: "Error 500 on checkout. We are losing sales.", expectedOutput: "priority: high, category: payments" },
      { input: "Suggestion: add dark mode", expectedOutput: "priority: low, category: feature-request" },
      { input: "Database corrupted after update", expectedOutput: "priority: critical, category: database" },
      { input: "Cannot login with 2FA", expectedOutput: "priority: high, category: authentication" },
      { input: "Monthly report not generating PDF", expectedOutput: "priority: medium, category: reports" },
      { input: "API returning 429 too frequently", expectedOutput: "priority: high, category: api" },
      { input: "Request new staging environment", expectedOutput: "priority: low, category: infrastructure" },
      { input: "Data leak detected in logs", expectedOutput: "priority: critical, category: security" },
      { input: "Wrong translation on checkout page", expectedOutput: "priority: medium, category: i18n" },
      { input: "Webhook not firing after payment", expectedOutput: "priority: high, category: payments" },
      { input: "Question about pricing plans", expectedOutput: "priority: low, category: sales" },
      { input: "Memory leak in notification service", expectedOutput: "priority: high, category: performance" },
      { input: "Request access to Git repository", expectedOutput: "priority: low, category: access" },
      { input: "Timeout on 30% of requests", expectedOutput: "priority: critical, category: performance" },
      { input: "Bug: export button not working on Safari", expectedOutput: "priority: medium, category: frontend" },
      { input: "Request rollback to previous version", expectedOutput: "priority: high, category: deploy" },
      { input: "Question about GDPR and data retention", expectedOutput: "priority: medium, category: compliance" },
      { input: "SSL certificate expiring in 2 days", expectedOutput: "priority: high, category: security" },
    ],
  });

  console.log("Seed complete. Created routes:", supportRoute[0].id, codeRoute[0].id, summarizeRoute[0].id);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
