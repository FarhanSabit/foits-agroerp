/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Neon Connection
const dbUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_UITCkph9EPF0@ep-young-water-ay3vvudw-pooler.c-5.us-east-2.aws.neon.tech/agrodb?sslmode=require&channel_binding=require";
const sql = neon(dbUrl);

app.use(express.json({ limit: "50mb" }));

// Default Initial State for Seeding
const initialERPState = {
  suppliers: [
    { id: "s1", code: "SUP001", name: "XYZ Grain Trading", type: "Raw Material Supplier", contactPerson: "Abul Kalam", phone: "01711-234567", email: "kalam@xyzgrain.com", address: "Khulna Port Area, Khulna", creditDays: 30, rating: 4.8, status: "Active" },
    { id: "s2", code: "SUP002", name: "Dhaka Agri-Chemicals", type: "Raw Material Supplier", contactPerson: "Anisur Rahman", phone: "01819-876543", email: "info@dhakaagri.com", address: "Tejgaon I/A, Dhaka", creditDays: 15, rating: 4.5, status: "Active" },
    { id: "s3", code: "SUP003", name: "Bengal Packaging Ind.", type: "Packaging Vendor", contactPerson: "Sultana Begum", phone: "01911-555666", email: "sbegum@bengalpack.com", address: "Savar, Dhaka", creditDays: 45, rating: 4.2, status: "Active" },
    { id: "s4", code: "SUP004", name: "Delta Machinery Spares", type: "Machinery & Spares", contactPerson: "Zamil Akhtar", phone: "01552-111222", email: "zamil@deltamach.com", address: "Chittagong Port, CTG", creditDays: 30, rating: 4.6, status: "Active" },
    { id: "s5", code: "SUP005", name: "Standard Logistics Services", type: "Service Provider", contactPerson: "Kamrul Islam", phone: "01712-999000", email: "kamrul@stdlogistics.com", address: "Motijheel C/A, Dhaka", creditDays: 60, rating: 4.4, status: "Active" }
  ],
  warehouses: [
    { id: "w1", name: "Raw Material Silo - 1", location: "Mymensingh Plant", type: "Raw Material", capacity: 5000, utilized: 3100 },
    { id: "w2", name: "Finished Goods Depot", location: "Gazipur Central", type: "Finished Goods", capacity: 3000, utilized: 1200 },
    { id: "w3", name: "Consumable Store", location: "Mymensingh Plant", type: "General", capacity: 1000, utilized: 450 }
  ],
  inventory: [
    { id: "i1", code: "RM001", name: "Maize (Yellow Grade A)", category: "Raw Material", uom: "KG", availableStock: 40000, reorderLevel: 50000, safetyStock: 20000, unitValue: 35, warehouseId: "w1", status: "Low Stock" },
    { id: "i2", code: "RM002", name: "Soybean Meal (46% Protein)", category: "Raw Material", uom: "KG", availableStock: 65000, reorderLevel: 40000, safetyStock: 15000, unitValue: 58, warehouseId: "w1", status: "Normal" },
    { id: "i3", code: "RM003", name: "Poultry Vitamin Mix", category: "Raw Material", uom: "KG", availableStock: 12000, reorderLevel: 5000, safetyStock: 2000, unitValue: 120, warehouseId: "w1", status: "Normal" },
    { id: "i4", code: "PK001", name: "Woven PP Bags (50KG capacity)", category: "Packaging", uom: "Pcs", availableStock: 45000, reorderLevel: 20000, safetyStock: 8000, unitValue: 18, warehouseId: "w3", status: "Normal" },
    { id: "i5", code: "FG001", name: "Premium Broiler Starter Feed", category: "Finished Goods", uom: "Bags", availableStock: 1500, reorderLevel: 1000, safetyStock: 500, unitValue: 2450, warehouseId: "w2", status: "Normal" },
    { id: "i6", code: "FG002", name: "Floating Fish Feed (Premium)", category: "Finished Goods", uom: "Bags", availableStock: 800, reorderLevel: 1200, safetyStock: 400, unitValue: 1850, warehouseId: "w2", status: "Low Stock" }
  ],
  batches: [
    { id: "b1", itemCode: "FG001", batchNumber: "BAT-BR-2607A", quantity: 1000, manufactureDate: "2026-07-20", expiryDate: "2027-01-20", warehouseId: "w2" },
    { id: "b2", itemCode: "FG001", batchNumber: "BAT-BR-2607B", quantity: 500, manufactureDate: "2026-07-22", expiryDate: "2027-01-22", warehouseId: "w2" },
    { id: "b3", itemCode: "FG002", batchNumber: "BAT-FF-2606A", quantity: 800, manufactureDate: "2026-06-15", expiryDate: "2026-12-15", warehouseId: "w2" }
  ],
  requisitions: [
    {
      id: "pr1",
      prNumber: "PR-2026-0041",
      department: "Production Planning",
      requestedBy: "Sultana Begum",
      requestedDate: "2026-07-25",
      requiredDate: "2026-08-05",
      items: [
        { itemCode: "RM001", itemName: "Maize (Yellow Grade A)", qty: 20000, uom: "KG" }
      ],
      totalEstimatedValue: 700000,
      status: "Approved",
      approvalChain: [
        { approver: "Dr. Ahsan Rahman", role: "CFO", actionDate: "2026-07-25", comments: "Budget allocated and approved." }
      ]
    }
  ],
  rfqs: [
    {
      id: "rfq1",
      rfqNumber: "RFQ-2026-0012",
      prNumber: "PR-2026-0041",
      issueDate: "2026-07-25",
      closeDate: "2026-07-28",
      status: "Open",
      suppliersInvited: ["SUP001", "SUP002"],
      comparisonMatrix: [
        { supplierCode: "SUP001", supplierName: "XYZ Grain Trading", pricePerUnit: 34.5, leadTimeDays: 5, paymentTerms: "30 Days Credit", score: 92 },
        { supplierCode: "SUP002", supplierName: "Dhaka Agri-Chemicals", pricePerUnit: 35.8, leadTimeDays: 3, paymentTerms: "15 Days Credit", score: 88 }
      ]
    }
  ],
  purchaseOrders: [
    {
      id: "po1",
      poNumber: "PO-2026-0092",
      rfqNumber: "RFQ-2026-0012",
      supplierId: "s1",
      supplierName: "XYZ Grain Trading",
      orderDate: "2026-07-26",
      totalAmount: 690000,
      approvalStatus: "Approved",
      items: [
        { itemCode: "RM001", itemName: "Maize (Yellow Grade A)", qty: 20000, uom: "KG", unitPrice: 34.5, totalPrice: 690000 }
      ],
      deliveryStatus: "Pending"
    }
  ],
  goodsReceipts: [],
  workOrders: [
    { id: "wo1", woNumber: "WO24001", productCode: "FG001", productName: "Premium Broiler Starter Feed", plannedQty: 1000, producedQty: 0, status: "Scheduled", startDate: "2026-07-28", endDate: "2026-07-30", materialIssued: false }
  ],
  customers: [
    { id: "c1", code: "CUS001", name: "Kazi Farms Hatchery", territory: "Gazipur", creditLimit: 5000000, balance: 1200000, status: "Active" },
    { id: "c2", code: "CUS002", name: "Aftab Feed & Poultry", territory: "Kishoreganj", creditLimit: 3000000, balance: 450000, status: "Active" },
    { id: "c3", code: "CUS003", name: "CP Bangladesh Ltd", territory: "Mymensingh", creditLimit: 10000000, balance: 2500000, status: "Active" },
    { id: "c4", code: "CUS004", name: "Bengal Feed Distributor", territory: "Jessore", creditLimit: 2000000, balance: 0, status: "Active" }
  ],
  salesOrders: [
    {
      id: "so1",
      orderNumber: "SO-2026-0152",
      customerCode: "CUS001",
      customerName: "Kazi Farms Hatchery",
      orderDate: "2026-07-26",
      items: [
        { productCode: "FG001", productName: "Premium Broiler Starter Feed", qty: 500, uom: "Bags", unitPrice: 2450, totalPrice: 1225000 }
      ],
      totalAmount: 1225000,
      status: "Approved",
      deliveryStatus: "Pending"
    }
  ],
  trips: [
    { id: "t1", tripNumber: "TRIP-0492", vehicleNo: "DM-TA-14-3021", driverName: "Rahmat Ullah", route: "Gazipur - Central Depot Route", eta: "2026-07-27 12:00", status: "Loading", fuelIssuedLiters: 80, fuelCost: 10400 }
  ],
  employees: [
    { id: "e1", code: "EMP001", name: "Dr. Ahsan Rahman", designation: "Chief Financial Officer (CFO)", department: "Finance & Accounts", attendanceRate: 98.5, grossSalary: 180000 },
    { id: "e2", code: "EMP002", name: "Sultana Begum", designation: "Factory General Manager", department: "Production & Planning", attendanceRate: 96.2, grossSalary: 120000 },
    { id: "e3", code: "EMP003", name: "Tareq Anis", designation: "Logistics Coordinator", department: "Logistics & Fleet", attendanceRate: 94.0, grossSalary: 65000 },
    { id: "e4", code: "EMP004", name: "Dr. Abul Kashem", designation: "Quality Assurance Chemist", department: "Quality Control", attendanceRate: 99.1, grossSalary: 85000 }
  ],
  ledger: [
    { code: "1010", name: "Bank Asia General A/C", type: "Asset", balance: 18000000 },
    { code: "1200", name: "Accounts Receivable", type: "Asset", balance: 23000000 },
    { code: "1300", name: "Raw Material Inventory", type: "Asset", balance: 5170000 },
    { code: "1310", name: "Finished Goods Inventory", type: "Asset", balance: 3675000 },
    { code: "2100", name: "Accounts Payable", type: "Liability", balance: 14000000 },
    { code: "3000", name: "Retained Earnings", type: "Equity", balance: 11845000 },
    { code: "4000", name: "Poultry Feed Sales", type: "Revenue", balance: 85000000 },
    { code: "5000", name: "Raw Material Purchases", type: "Expense", balance: 65000000 }
  ],
  journal: [
    {
      id: "je1",
      voucherNo: "JV-2026-0741",
      date: "2026-07-26",
      description: "Opening balances alignment",
      lines: [
        { accountCode: "1010", accountName: "Bank Asia General A/C", debit: 18000000, credit: 0 },
        { accountCode: "1200", accountName: "Accounts Receivable", debit: 23000000, credit: 0 },
        { accountCode: "2100", accountName: "Accounts Payable", debit: 0, credit: 14000000 }
      ]
    }
  ],
  tickets: [
    { id: "tk1", ticketId: "TCK-2607-001", createdBy: "Tareq Anis", subject: "GPS tracker sensor delay on DM-TA-14-3021", priority: "Medium", status: "Open", assignedTo: "Support IT", createdDate: "2026-07-26 10:15" },
    { id: "tk2", ticketId: "TCK-2607-002", createdBy: "Sultana Begum", subject: "BOM revision permissions for Fish Feed Premium", priority: "High", status: "Resolved", assignedTo: "Systems Admin", createdDate: "2026-07-25 14:30" }
  ],
  activities: [
    { timestamp: "2026-07-26 18:30", user: "Ahsan Rahman", action: "Approved PR", details: "PR-2026-0041 approved with total estimate ৳7,00,000" },
    { timestamp: "2026-07-26 17:15", user: "Sultana Begum", action: "MRP Run Complete", details: "MRP executed for Premium Broiler Starter Feed (1,000 Bags) - Shortage of Maize detected" },
    { timestamp: "2026-07-26 16:00", user: "Tareq Anis", action: "Dispatched Delivery", details: "DM-TA-14-3021 departed central depot for Gazipur destination" }
  ],
  notifications: [
    { id: "n1", title: "Low Stock Alert", message: "Maize (Yellow Grade A) stock is below safety levels (40,000 KG left)", time: "1 hr ago", category: "Inventory", read: false },
    { id: "n2", title: "PR Pending Approval", message: "Sultana Begum raised PR-2026-0041 for 20,000 KG Maize", time: "2 hrs ago", category: "Approval", read: false },
    { id: "n3", title: "Daily Sales Target Complete", message: "Revenue target surpassed for Gazipur Sector", time: "4 hrs ago", category: "Finance", read: true }
  ],
  forecastQty: 1000,
  selectedProductId: "FG001",
  currentDemoStep: 0
};

// Database Initialization Helper
async function initDatabase() {
  try {
    console.log("Checking and initializing Neon Database...");
    
    // Create the schema state table
    await sql`
      CREATE TABLE IF NOT EXISTS agro_erp_state (
        id VARCHAR(50) PRIMARY KEY,
        state_json JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Check if initial record exists
    const rows = await sql`SELECT id FROM agro_erp_state WHERE id = 'current_state'`;
    
    if (rows.length === 0) {
      console.log("Seeding initial state data into Neon DB...");
      await sql`
        INSERT INTO agro_erp_state (id, state_json)
        VALUES ('current_state', ${JSON.stringify(initialERPState)})
      `;
      console.log("Database seeded successfully!");
    } else {
      console.log("Database table agro_erp_state is already present & seeded.");
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Call database initializer
initDatabase();

// API: Health Check
app.get("/api/health", async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ status: "ok", dbTime: result[0].now, neonAuth: "enabled" });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// API: Get ERP State
app.get("/api/erp/state", async (req, res) => {
  try {
    const rows = await sql`SELECT state_json FROM agro_erp_state WHERE id = 'current_state'`;
    if (rows.length > 0) {
      res.json(rows[0].state_json);
    } else {
      res.json(initialERPState);
    }
  } catch (error: any) {
    console.error("Error fetching state:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Save ERP State
app.post("/api/erp/state", async (req, res) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ error: "Missing state object in request body" });
    }
    await sql`
      INSERT INTO agro_erp_state (id, state_json, updated_at)
      VALUES ('current_state', ${JSON.stringify(state)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET state_json = EXCLUDED.state_json, updated_at = CURRENT_TIMESTAMP
    `;
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving state:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Reset ERP State
app.post("/api/erp/reset", async (req, res) => {
  try {
    await sql`
      INSERT INTO agro_erp_state (id, state_json, updated_at)
      VALUES ('current_state', ${JSON.stringify(initialERPState)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET state_json = EXCLUDED.state_json, updated_at = CURRENT_TIMESTAMP
    `;
    res.json(initialERPState);
  } catch (error: any) {
    console.error("Error resetting state:", error);
    res.status(500).json({ error: error.message });
  }
});

// Integration setup for development and production
async function run() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only bind port if we are NOT running as a Vercel Serverless Function
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

run();

export default app;
