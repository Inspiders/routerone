import { pgTable, serial, varchar, text, timestamp, jsonb, integer, boolean, real, numeric } from "drizzle-orm/pg-core";

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  qualityThreshold: real("quality_threshold").notNull().default(0.7),
  minQualityModel: varchar("min_quality_model", { length: 255 }).notNull(),
  modelsConfig: jsonb("models_config").notNull().$type<{
    models: Array<{
      provider: string;
      model: string;
      costPer1kInput: number;
      costPer1kOutput: number;
      qualityScore: number;
    }>;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  prefix: varchar("prefix", { length: 20 }).notNull(),
  hash: text("hash").notNull(),
  lastChars: varchar("last_chars", { length: 8 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => apiKeys.id),
  routeId: integer("route_id").references(() => routes.id),
  provider: varchar("provider", { length: 100 }).notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  cost: numeric("cost", { precision: 12, scale: 6 }).notNull().default("0"),
  baselineCost: numeric("baseline_cost", { precision: 12, scale: 6 }).notNull().default("0"),
  savings: numeric("savings", { precision: 12, scale: 6 }).notNull().default("0"),
  latencyMs: integer("latency_ms").notNull().default(0),
  fallback: boolean("fallback").notNull().default(false),
  fallbackFromModel: varchar("fallback_from_model", { length: 255 }),
  statusCode: integer("status_code").notNull().default(200),
  errorMessage: text("error_message"),
  requestBody: jsonb("request_body"),
  responseBody: jsonb("response_body"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const goldenDatasets = pgTable("golden_datasets", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").references(() => routes.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cases: jsonb("cases").notNull().$type<Array<{
    input: string;
    expectedOutput?: string;
    criteria?: string[];
  }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const evaluationResults = pgTable("evaluation_results", {
  id: serial("id").primaryKey(),
  goldenDatasetId: integer("golden_dataset_id").references(() => goldenDatasets.id).notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  score: real("score").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type RequestLog = typeof requestLogs.$inferSelect;
export type GoldenDataset = typeof goldenDatasets.$inferSelect;
export type EvaluationResult = typeof evaluationResults.$inferSelect;
