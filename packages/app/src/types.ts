/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Explicit Enum declarations (no const enums, as per rules)
export enum SupplierType {
  RAW_MATERIAL = "Raw Material Supplier",
  PACKAGING = "Packaging Vendor",
  MACHINERY = "Machinery & Spares",
  SERVICES = "Service Provider"
}

export enum DocStatus {
  PENDING = "Pending Approval",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  DRAFT = "Draft",
  COMPLETED = "Completed",
  RECEIVED = "Received",
  DISPATCHED = "Dispatched",
  COLLECTED = "Collected"
}

export enum AccountType {
  ASSET = "Asset",
  LIABILITY = "Liability",
  EQUITY = "Equity",
  REVENUE = "Revenue",
  EXPENSE = "Expense"
}

export enum VehicleStatus {
  AVAILABLE = "Available",
  ON_TRIP = "On Trip",
  MAINTENANCE = "Under Maintenance",
  OUT_OF_SERVICE = "Out of Service"
}

export enum TicketPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export enum TicketStatus {
  OPEN = "Open",
  PENDING = "Pending",
  RESOLVED = "Resolved",
  CLOSED = "Closed"
}

// Interfaces
export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: SupplierType;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  creditDays: number;
  rating: number;
  status: "Active" | "Inactive";
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: "Raw Material" | "Packaging" | "Consumables" | "Finished Goods";
  uom: string;
  availableStock: number;
  reorderLevel: number;
  safetyStock: number;
  unitValue: number; // in BDT (৳)
  warehouseId: string;
  status: "Normal" | "Low Stock" | "Out of Stock";
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  type: "Raw Material" | "Finished Goods" | "General";
  capacity: number; // in Metric Tons (MT)
  utilized: number;
}

export interface StockBatch {
  id: string;
  itemCode: string;
  batchNumber: string;
  quantity: number;
  manufactureDate: string;
  expiryDate: string;
  warehouseId: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  department: string;
  requestedBy: string;
  requestedDate: string;
  requiredDate: string;
  items: {
    itemCode: string;
    itemName: string;
    qty: number;
    uom: string;
  }[];
  totalEstimatedValue: number;
  status: DocStatus;
  approvalChain: {
    approver: string;
    role: string;
    actionDate: string;
    comments: string;
  }[];
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  prNumber: string;
  issueDate: string;
  closeDate: string;
  status: "Open" | "Closed" | "Completed";
  suppliersInvited: string[]; // Supplier codes
  comparisonMatrix: {
    supplierCode: string;
    supplierName: string;
    pricePerUnit: number;
    leadTimeDays: number;
    paymentTerms: string;
    score: number;
  }[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  totalAmount: number;
  approvalStatus: DocStatus;
  items: {
    itemCode: string;
    itemName: string;
    qty: number;
    uom: string;
    unitPrice: number;
    totalPrice: number;
  }[];
  deliveryStatus: "Pending" | "Partially Received" | "Received";
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  receivedDate: string;
  receivedBy: string;
  items: {
    itemCode: string;
    itemName: string;
    orderedQty: number;
    receivedQty: number;
    uom: string;
    qcPassed: boolean;
    qcComments: string;
  }[];
  postedToInventory: boolean;
  scannedInvoiceUrl?: string;
}

export interface ProductBOM {
  productCode: string;
  productName: string;
  uom: string;
  materials: {
    materialCode: string;
    materialName: string;
    qtyNeededPerFG: number; // e.g. amount of Maize per 1 unit of Poultry Feed
    uom: string;
  }[];
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  productCode: string;
  productName: string;
  plannedQty: number;
  producedQty: number;
  status: "Scheduled" | "In Progress" | "Completed";
  startDate: string;
  endDate: string;
  materialIssued: boolean;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerCode: string;
  orderDate: string;
  items: {
    productCode: string;
    productName: string;
    qty: number;
    uom: string;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  status: DocStatus;
  deliveryStatus: "Pending" | "Dispatched" | "Delivered";
}

export interface DeliveryTrip {
  id: string;
  tripNumber: string;
  vehicleNo: string;
  driverName: string;
  route: string;
  eta: string;
  status: "Loading" | "In Transit" | "Delivered";
  fuelIssuedLiters: number;
  fuelCost: number;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  designation: string;
  department: string;
  attendanceRate: number;
  grossSalary: number;
}

export interface LedgerAccount {
  code: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface JournalEntry {
  id: string;
  voucherNo: string;
  date: string;
  description: string;
  lines: {
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  territory: string;
  creditLimit: number;
  balance: number;
  status: "Active" | "Inactive";
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  createdBy: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  createdDate: string;
}

export interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  category: "Approval" | "Inventory" | "Production" | "Finance" | "System";
  read: boolean;
}

// Live Demo State Holder
export interface ERPState {
  suppliers: Supplier[];
  inventory: InventoryItem[];
  warehouses: Warehouse[];
  batches: StockBatch[];
  requisitions: PurchaseRequisition[];
  rfqs: RFQ[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  workOrders: WorkOrder[];
  salesOrders: SalesOrder[];
  trips: DeliveryTrip[];
  employees: Employee[];
  ledger: LedgerAccount[];
  journal: JournalEntry[];
  customers: Customer[];
  tickets: SupportTicket[];
  activities: ActivityLog[];
  notifications: Notification[];
  forecastQty: number;
  selectedProductId: string;
  currentDemoStep: number; // 0-11 representing the Golden Flow step
}

// INITIAL SEED DATA
export const initialSuppliers: Supplier[] = [
  { id: "s1", code: "SUP001", name: "XYZ Grain Trading", type: SupplierType.RAW_MATERIAL, contactPerson: "Abul Kalam", phone: "01711-234567", email: "kalam@xyzgrain.com", address: "Khulna Port Area, Khulna", creditDays: 30, rating: 4.8, status: "Active" },
  { id: "s2", code: "SUP002", name: "Dhaka Agri-Chemicals", type: SupplierType.RAW_MATERIAL, contactPerson: "Anisur Rahman", phone: "01819-876543", email: "info@dhakaagri.com", address: "Tejgaon I/A, Dhaka", creditDays: 15, rating: 4.5, status: "Active" },
  { id: "s3", code: "SUP003", name: "Bengal Packaging Ind.", type: SupplierType.PACKAGING, contactPerson: "Sultana Begum", phone: "01911-555666", email: "sbegum@bengalpack.com", address: "Savar, Dhaka", creditDays: 45, rating: 4.2, status: "Active" },
  { id: "s4", code: "SUP004", name: "Delta Machinery Spares", type: SupplierType.MACHINERY, contactPerson: "Zamil Akhtar", phone: "01552-111222", email: "zamil@deltamach.com", address: "Chittagong Port, CTG", creditDays: 30, rating: 4.6, status: "Active" },
  { id: "s5", code: "SUP005", name: "Standard Logistics Services", type: SupplierType.SERVICES, contactPerson: "Kamrul Islam", phone: "01712-999000", email: "kamrul@stdlogistics.com", address: "Motijheel C/A, Dhaka", creditDays: 60, rating: 4.4, status: "Active" }
];

export const initialWarehouses: Warehouse[] = [
  { id: "w1", name: "Raw Material Silo - 1", location: "Mymensingh Plant", type: "Raw Material", capacity: 5000, utilized: 3100 },
  { id: "w2", name: "Finished Goods Depot", location: "Gazipur Central", type: "Finished Goods", capacity: 3000, utilized: 1200 },
  { id: "w3", name: "Consumable Store", location: "Mymensingh Plant", type: "General", capacity: 1000, utilized: 450 }
];

export const initialInventory: InventoryItem[] = [
  { id: "i1", code: "RM001", name: "Maize (Yellow Grade A)", category: "Raw Material", uom: "KG", availableStock: 40000, reorderLevel: 50000, safetyStock: 20000, unitValue: 35, warehouseId: "w1", status: "Low Stock" },
  { id: "i2", code: "RM002", name: "Soybean Meal (46% Protein)", category: "Raw Material", uom: "KG", availableStock: 65000, reorderLevel: 40000, safetyStock: 15000, unitValue: 58, warehouseId: "w1", status: "Normal" },
  { id: "i3", code: "RM003", name: "Poultry Vitamin Mix", category: "Raw Material", uom: "KG", availableStock: 12000, reorderLevel: 5000, safetyStock: 2000, unitValue: 120, warehouseId: "w1", status: "Normal" },
  { id: "i4", code: "PK001", name: "Woven PP Bags (50KG capacity)", category: "Packaging", uom: "Pcs", availableStock: 45000, reorderLevel: 20000, safetyStock: 8000, unitValue: 18, warehouseId: "w3", status: "Normal" },
  { id: "i5", code: "FG001", name: "Premium Broiler Starter Feed", category: "Finished Goods", uom: "Bags", availableStock: 1500, reorderLevel: 1000, safetyStock: 500, unitValue: 2450, warehouseId: "w2", status: "Normal" },
  { id: "i6", code: "FG002", name: "Floating Fish Feed (Premium)", category: "Finished Goods", uom: "Bags", availableStock: 800, reorderLevel: 1200, safetyStock: 400, unitValue: 1850, warehouseId: "w2", status: "Low Stock" }
];

export const initialBatches: StockBatch[] = [
  { id: "b1", itemCode: "FG001", batchNumber: "BAT-BR-2607A", quantity: 1000, manufactureDate: "2026-07-20", expiryDate: "2027-01-20", warehouseId: "w2" },
  { id: "b2", itemCode: "FG001", batchNumber: "BAT-BR-2607B", quantity: 500, manufactureDate: "2026-07-22", expiryDate: "2027-01-22", warehouseId: "w2" },
  { id: "b3", itemCode: "FG002", batchNumber: "BAT-FF-2606A", quantity: 800, manufactureDate: "2026-06-15", expiryDate: "2026-12-15", warehouseId: "w2" }
];

export const productBOMs: ProductBOM[] = [
  {
    productCode: "FG001",
    productName: "Premium Broiler Starter Feed",
    uom: "Bags", // 1 Bag = 50KG. Let's explode for 1 Bag of FG (50KG)
    materials: [
      { materialCode: "RM001", materialName: "Maize (Yellow Grade A)", qtyNeededPerFG: 30, uom: "KG" }, // 60% of 50KG
      { materialCode: "RM002", materialName: "Soybean Meal (46% Protein)", qtyNeededPerFG: 15, uom: "KG" }, // 30% of 50KG
      { materialCode: "RM003", materialName: "Poultry Vitamin Mix", qtyNeededPerFG: 2.5, uom: "KG" }, // 5% of 50KG
      { materialCode: "PK001", materialName: "Woven PP Bags (50KG capacity)", qtyNeededPerFG: 1, uom: "Pcs" }
    ]
  },
  {
    productCode: "FG002",
    productName: "Floating Fish Feed (Premium)",
    uom: "Bags", // 1 Bag = 25KG
    materials: [
      { materialCode: "RM001", materialName: "Maize (Yellow Grade A)", qtyNeededPerFG: 10, uom: "KG" },
      { materialCode: "RM002", materialName: "Soybean Meal (46% Protein)", qtyNeededPerFG: 12, uom: "KG" },
      { materialCode: "RM003", materialName: "Poultry Vitamin Mix", qtyNeededPerFG: 1, uom: "KG" },
      { materialCode: "PK001", materialName: "Woven PP Bags (50KG capacity)", qtyNeededPerFG: 1, uom: "Pcs" }
    ]
  }
];

export const initialRequisitions: PurchaseRequisition[] = [
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
    status: DocStatus.APPROVED,
    approvalChain: [
      { approver: "Dr. Ahsan Rahman", role: "CFO", actionDate: "2026-07-25", comments: "Budget allocated and approved." }
    ]
  }
];

export const initialRFQs: RFQ[] = [
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
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po1",
    poNumber: "PO-2026-0092",
    rfqNumber: "RFQ-2026-0012",
    supplierId: "s1",
    supplierName: "XYZ Grain Trading",
    orderDate: "2026-07-26",
    totalAmount: 690000,
    approvalStatus: DocStatus.APPROVED,
    items: [
      { itemCode: "RM001", itemName: "Maize (Yellow Grade A)", qty: 20000, uom: "KG", unitPrice: 34.5, totalPrice: 690000 }
    ],
    deliveryStatus: "Pending"
  }
];

export const initialGoodsReceipts: GoodsReceipt[] = [];

export const initialWorkOrders: WorkOrder[] = [
  { id: "wo1", woNumber: "WO24001", productCode: "FG001", productName: "Premium Broiler Starter Feed", plannedQty: 1000, producedQty: 0, status: "Scheduled", startDate: "2026-07-28", endDate: "2026-07-30", materialIssued: false }
];

export const initialCustomers: Customer[] = [
  { id: "c1", code: "CUS001", name: "Kazi Farms Hatchery", territory: "Gazipur", creditLimit: 5000000, balance: 1200000, status: "Active" },
  { id: "c2", code: "CUS002", name: "Aftab Feed & Poultry", territory: "Kishoreganj", creditLimit: 3000000, balance: 450000, status: "Active" },
  { id: "c3", code: "CUS003", name: "CP Bangladesh Ltd", territory: "Mymensingh", creditLimit: 10000000, balance: 2500000, status: "Active" },
  { id: "c4", code: "CUS004", name: "Bengal Feed Distributor", territory: "Jessore", creditLimit: 2000000, balance: 0, status: "Active" }
];

export const initialSalesOrders: SalesOrder[] = [
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
    status: DocStatus.APPROVED,
    deliveryStatus: "Pending"
  }
];

export const initialTrips: DeliveryTrip[] = [
  { id: "t1", tripNumber: "TRIP-0492", vehicleNo: "DM-TA-14-3021", driverName: "Rahmat Ullah", route: "Gazipur - Central Depot Route", eta: "2026-07-27 12:00", status: "Loading", fuelIssuedLiters: 80, fuelCost: 10400 }
];

export const initialEmployees: Employee[] = [
  { id: "e1", code: "EMP001", name: "Dr. Ahsan Rahman", designation: "Chief Financial Officer (CFO)", department: "Finance & Accounts", attendanceRate: 98.5, grossSalary: 180000 },
  { id: "e2", code: "EMP002", name: "Sultana Begum", designation: "Factory General Manager", department: "Production & Planning", attendanceRate: 96.2, grossSalary: 120000 },
  { id: "e3", code: "EMP003", name: "Tareq Anis", designation: "Logistics Coordinator", department: "Logistics & Fleet", attendanceRate: 94.0, grossSalary: 65000 },
  { id: "e4", code: "EMP004", name: "Dr. Abul Kashem", designation: "Quality Assurance Chemist", department: "Quality Control", attendanceRate: 99.1, grossSalary: 85000 }
];

export const initialLedger: LedgerAccount[] = [
  { code: "1010", name: "Bank Asia General A/C", type: AccountType.ASSET, balance: 18000000 }, // ৳ 1.8 Cr
  { code: "1200", name: "Accounts Receivable", type: AccountType.ASSET, balance: 23000000 }, // ৳ 2.3 Cr
  { code: "1300", name: "Raw Material Inventory", type: AccountType.ASSET, balance: 5170000 }, // ৳ 51.7 Lakh
  { code: "1310", name: "Finished Goods Inventory", type: AccountType.ASSET, balance: 3675000 }, // ৳ 36.7 Lakh
  { code: "2100", name: "Accounts Payable", type: AccountType.LIABILITY, balance: 14000000 }, // ৳ 1.4 Cr
  { code: "3000", name: "Retained Earnings", type: AccountType.EQUITY, balance: 11845000 },
  { code: "4000", name: "Poultry Feed Sales", type: AccountType.REVENUE, balance: 85000000 }, // ৳ 8.5 Cr Sales
  { code: "5000", name: "Raw Material Purchases", type: AccountType.EXPENSE, balance: 65000000 }
];

export const initialJournal: JournalEntry[] = [
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
];

export const initialTickets: SupportTicket[] = [
  { id: "tk1", ticketId: "TCK-2607-001", createdBy: "Tareq Anis", subject: "GPS tracker sensor delay on DM-TA-14-3021", priority: TicketPriority.MEDIUM, status: TicketStatus.OPEN, assignedTo: "Support IT", createdDate: "2026-07-26 10:15" },
  { id: "tk2", ticketId: "TCK-2607-002", createdBy: "Sultana Begum", subject: "BOM revision permissions for Fish Feed Premium", priority: TicketPriority.HIGH, status: TicketStatus.RESOLVED, assignedTo: "Systems Admin", createdDate: "2026-07-25 14:30" }
];

export const initialActivities: ActivityLog[] = [
  { timestamp: "2026-07-26 18:30", user: "Ahsan Rahman", action: "Approved PR", details: "PR-2026-0041 approved with total estimate ৳7,00,000" },
  { timestamp: "2026-07-26 17:15", user: "Sultana Begum", action: "MRP Run Complete", details: "MRP executed for Premium Broiler Starter Feed (1,000 Bags) - Shortage of Maize detected" },
  { timestamp: "2026-07-26 16:00", user: "Tareq Anis", action: "Dispatched Delivery", details: "DM-TA-14-3021 departed central depot for Gazipur destination" }
];

export const initialNotifications: Notification[] = [
  { id: "n1", title: "Low Stock Alert", message: "Maize (Yellow Grade A) stock is below safety levels (40,000 KG left)", time: "1 hr ago", category: "Inventory", read: false },
  { id: "n2", title: "PR Pending Approval", message: "Sultana Begum raised PR-2026-0041 for 20,000 KG Maize", time: "2 hrs ago", category: "Approval", read: false },
  { id: "n3", title: "Daily Sales Target Complete", message: "Revenue target surpassed for Gazipur Sector", time: "4 hrs ago", category: "Finance", read: true }
];
