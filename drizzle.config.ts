/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_UITCkph9EPF0@ep-young-water-ay3vvudw-pooler.c-5.us-east-2.aws.neon.tech/agrodb?sslmode=require&channel_binding=require",
  },
});
