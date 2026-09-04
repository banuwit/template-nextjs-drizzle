import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core"

export const countries = pgTable("countries", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  code: varchar({ length: 2 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type Country = typeof countries.$inferSelect
export type NewCountry = typeof countries.$inferInsert
