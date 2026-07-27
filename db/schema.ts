/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, text, varchar, integer, timestamp, jsonb, doublePrecision, boolean } from "drizzle-orm/pg-core";

// 1. JSON State Table (Backward Compatible / Single document state sync)
export const agroErpState = pgTable("agro_erp_state", {
  id: varchar("id", { length: 50 }).primaryKey(),
  stateJson: jsonb("state_json").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Normalized Relational Schema for Agro ERP Domains
export const suppliers = pgTable("suppliers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  creditDays: integer("credit_days").default(30),
  rating: doublePrecision("rating").default(5.0),
  status: varchar("status", { length: 50 }).default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const warehouses = pgTable("warehouses", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  capacity: integer("capacity").notNull(),
  utilized: integer("utilized").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id", { length: 50 }).primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  uom: varchar("uom", { length: 20 }).notNull(),
  availableStock: integer("available_stock").notNull(),
  reorderLevel: integer("reorder_level").notNull(),
  safetyStock: integer("safety_stock").notNull(),
  unitValue: doublePrecision("unit_value").notNull(),
  warehouseId: varchar("warehouse_id", { length: 50 }).references(() => warehouses.id),
  status: varchar("status", { length: 50 }).default("Normal"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const batches = pgTable("batches", {
  id: varchar("id", { length: 50 }).primaryKey(),
  itemCode: varchar("item_code", { length: 50 }).notNull(),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull(),
  manufactureDate: varchar("manufacture_date", { length: 50 }),
  expiryDate: varchar("expiry_date", { length: 50 }),
  warehouseId: varchar("warehouse_id", { length: 50 }).references(() => warehouses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  territory: varchar("territory", { length: 255 }),
  creditLimit: doublePrecision("credit_limit").default(0.0),
  balance: doublePrecision("balance").default(0.0),
  status: varchar("status", { length: 50 }).default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: varchar("id", { length: 50 }).primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  attendanceRate: doublePrecision("attendance_rate").default(100.0),
  grossSalary: doublePrecision("gross_salary").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ledger = pgTable("ledger", {
  code: varchar("code", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  balance: doublePrecision("balance").default(0.0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id", { length: 50 }).primaryKey(),
  timestamp: varchar("timestamp", { length: 100 }).notNull(),
  user: varchar("user", { length: 100 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
});
