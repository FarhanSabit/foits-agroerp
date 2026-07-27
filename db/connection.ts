/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_UITCkph9EPF0@ep-young-water-ay3vvudw-pooler.c-5.us-east-2.aws.neon.tech/agrodb?sslmode=require&channel_binding=require";

const client = neon(databaseUrl);
export const db = drizzle(client, { schema });
