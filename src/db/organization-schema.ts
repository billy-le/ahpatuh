import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const organizationSchema = sqliteTable("organization", {
  id: integer().primaryKey(),
  name: text().notNull(),
  phoneNumber: text(),
  email: text(),
  website: text(),
  timezone: text(),
});

export const addressSchema = sqliteTable("address", {
  id: integer().primaryKey(),
  street1: text().notNull(),
  street2: text(),
  city: text().notNull(),
  state: text().notNull(),
  country: text().notNull(),
  postalCode: text().notNull(),
  organizationId: integer()
    .references(() => organizationSchema.id)
    .notNull(),
});

export const businessHours = sqliteTable("business_hours", {
  id: integer().primaryKey(),
  organizationId: integer()
    .references(() => organizationSchema.id)
    .notNull(),
  dayOfWeek: integer().$type<0 | 1 | 2 | 3 | 4 | 5 | 6>().notNull(),
  timeOpen: integer({ mode: "timestamp" }).notNull(),
  timeClose: integer({ mode: "timestamp" }).notNull(),
  isClosed: integer({ mode: "boolean" }).default(false),
});

export const employeeSchema = sqliteTable("employee", {
  id: integer().primaryKey(),
  organizationid: integer()
    .references(() => organizationSchema.id)
    .notNull(),
  userId: integer().references(() => user.id),
  firstName: text().notNull(),
  lastName: text().notNull(),
  isActive: integer({ mode: "boolean" }).default(false),
  hiredDate: integer({ mode: "timestamp" }),
  role: text(),
});
