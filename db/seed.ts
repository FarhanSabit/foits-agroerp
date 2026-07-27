/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from "./connection";
import { 
  agroErpState, 
  suppliers, 
  warehouses, 
  inventory, 
  batches, 
  customers, 
  employees, 
  ledger, 
  activities 
} from "./schema";

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
    { id: "act1", timestamp: "2026-07-26 18:30", user: "Ahsan Rahman", action: "Approved PR", details: "PR-2026-0041 approved with total estimate ৳7,00,000" },
    { id: "act2", timestamp: "2026-07-26 17:15", user: "Sultana Begum", action: "MRP Run Complete", details: "MRP executed for Premium Broiler Starter Feed (1,000 Bags) - Shortage of Maize detected" },
    { id: "act3", timestamp: "2026-07-26 16:00", user: "Tareq Anis", action: "Dispatched Delivery", details: "DM-TA-14-3021 departed central depot for Gazipur destination" }
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

async function seed() {
  console.log("Starting Seeding via Drizzle ORM...");

  try {
    // 1. Seed State Table
    console.log("Seeding agro_erp_state...");
    await db.insert(agroErpState)
      .values({
        id: "current_state",
        stateJson: initialERPState,
      })
      .onConflictDoUpdate({
        target: agroErpState.id,
        set: { stateJson: initialERPState, updatedAt: new Date() }
      });
    console.log("agro_erp_state seeded!");

    // 2. Seed Suppliers
    console.log("Seeding Suppliers...");
    for (const s of initialERPState.suppliers) {
      await db.insert(suppliers)
        .values({
          id: s.id,
          code: s.code,
          name: s.name,
          type: s.type,
          contactPerson: s.contactPerson,
          phone: s.phone,
          email: s.email,
          address: s.address,
          creditDays: s.creditDays,
          rating: s.rating,
          status: s.status,
        })
        .onConflictDoUpdate({
          target: suppliers.id,
          set: {
            name: s.name,
            type: s.type,
            contactPerson: s.contactPerson,
            phone: s.phone,
            email: s.email,
            address: s.address,
            creditDays: s.creditDays,
            rating: s.rating,
            status: s.status,
          }
        });
    }

    // 3. Seed Warehouses
    console.log("Seeding Warehouses...");
    for (const w of initialERPState.warehouses) {
      await db.insert(warehouses)
        .values({
          id: w.id,
          name: w.name,
          location: w.location,
          type: w.type,
          capacity: w.capacity,
          utilized: w.utilized,
        })
        .onConflictDoUpdate({
          target: warehouses.id,
          set: {
            name: w.name,
            location: w.location,
            type: w.type,
            capacity: w.capacity,
            utilized: w.utilized,
          }
        });
    }

    // 4. Seed Inventory
    console.log("Seeding Inventory...");
    for (const i of initialERPState.inventory) {
      await db.insert(inventory)
        .values({
          id: i.id,
          code: i.code,
          name: i.name,
          category: i.category,
          uom: i.uom,
          availableStock: i.availableStock,
          reorderLevel: i.reorderLevel,
          safetyStock: i.safetyStock,
          unitValue: i.unitValue,
          warehouseId: i.warehouseId,
          status: i.status,
        })
        .onConflictDoUpdate({
          target: inventory.id,
          set: {
            name: i.name,
            category: i.category,
            uom: i.uom,
            availableStock: i.availableStock,
            reorderLevel: i.reorderLevel,
            safetyStock: i.safetyStock,
            unitValue: i.unitValue,
            warehouseId: i.warehouseId,
            status: i.status,
          }
        });
    }

    // 5. Seed Batches
    console.log("Seeding Batches...");
    for (const b of initialERPState.batches) {
      await db.insert(batches)
        .values({
          id: b.id,
          itemCode: b.itemCode,
          batchNumber: b.batchNumber,
          quantity: b.quantity,
          manufactureDate: b.manufactureDate,
          expiryDate: b.expiryDate,
          warehouseId: b.warehouseId,
        })
        .onConflictDoUpdate({
          target: batches.id,
          set: {
            itemCode: b.itemCode,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            manufactureDate: b.manufactureDate,
            expiryDate: b.expiryDate,
            warehouseId: b.warehouseId,
          }
        });
    }

    // 6. Seed Customers
    console.log("Seeding Customers...");
    for (const c of initialERPState.customers) {
      await db.insert(customers)
        .values({
          id: c.id,
          code: c.code,
          name: c.name,
          territory: c.territory,
          creditLimit: c.creditLimit,
          balance: c.balance,
          status: c.status,
        })
        .onConflictDoUpdate({
          target: customers.id,
          set: {
            name: c.name,
            territory: c.territory,
            creditLimit: c.creditLimit,
            balance: c.balance,
            status: c.status,
          }
        });
    }

    // 7. Seed Employees
    console.log("Seeding Employees...");
    for (const e of initialERPState.employees) {
      await db.insert(employees)
        .values({
          id: e.id,
          code: e.code,
          name: e.name,
          designation: e.designation,
          department: e.department,
          attendanceRate: e.attendanceRate,
          grossSalary: e.grossSalary,
        })
        .onConflictDoUpdate({
          target: employees.id,
          set: {
            name: e.name,
            designation: e.designation,
            department: e.department,
            attendanceRate: e.attendanceRate,
            grossSalary: e.grossSalary,
          }
        });
    }

    // 8. Seed Ledger
    console.log("Seeding Ledger Accounts...");
    for (const l of initialERPState.ledger) {
      await db.insert(ledger)
        .values({
          code: l.code,
          name: l.name,
          type: l.type,
          balance: l.balance,
        })
        .onConflictDoUpdate({
          target: ledger.code,
          set: {
            name: l.name,
            type: l.type,
            balance: l.balance,
          }
        });
    }

    // 9. Seed Activities
    console.log("Seeding Activities...");
    for (const a of initialERPState.activities) {
      await db.insert(activities)
        .values({
          id: a.id,
          timestamp: a.timestamp,
          user: a.user,
          action: a.action,
          details: a.details,
        })
        .onConflictDoUpdate({
          target: activities.id,
          set: {
            timestamp: a.timestamp,
            user: a.user,
            action: a.action,
            details: a.details,
          }
        });
    }

    console.log("🎉 Seeding completed successfully using Drizzle ORM!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
