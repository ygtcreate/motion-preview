import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const motions = sqliteTable("motions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  duration: real("duration").notNull(),
  fps: integer("fps").notNull(),
  fileSize: integer("file_size").notNull(),
  updatedAt: text("updated_at").notNull(),
  r2Key: text("r2_key").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});
