import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core"

export const provinces = pgTable("provinces", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  code: varchar({ length: 2 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type Province = typeof provinces.$inferSelect
export type NewProvince = typeof provinces.$inferInsert
