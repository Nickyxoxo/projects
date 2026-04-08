import { pgTable, index, unique, pgPolicy, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("users_username_unique").on(table.username),
	pgPolicy("users_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("users_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

// 游戏记录表
export const gameRecords = pgTable("game_records", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	scenario: varchar({ length: 100 }).notNull(),
	finalScore: integer("final_score").notNull(),
	result: varchar({ length: 20 }).notNull(), // 'success' 或 'failed'
	playedAt: timestamp("played_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("game_records_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("game_records_played_at_idx").using("btree", table.playedAt.desc().nullsLast().op("timestamptz_ops")),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
