import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core"

export const cities = pgTable("cities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  code: varchar({ length: 2 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type City = typeof cities.$inferSelect
export type NewCity = typeof cities.$inferInsert
