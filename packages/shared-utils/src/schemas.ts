/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from "zod";

export const SupplierTypeSchema = z.enum([
  "Raw Material Supplier",
  "Packaging Vendor",
  "Machinery & Spares",
  "Service Provider"
]);

export const DocStatusSchema = z.enum([
  "Pending Approval",
  "Approved",
  "Rejected",
  "Draft",
  "Completed",
  "Received",
  "Dispatched",
  "Collected"
]);

export const AccountTypeSchema = z.enum([
  "Asset",
  "Liability",
  "Equity",
  "Revenue",
  "Expense"
]);

export const TicketPrioritySchema = z.enum([
  "Low",
  "Medium",
  "High",
  "Critical"
]);

export const TicketStatusSchema = z.enum([
  "Open",
  "Pending",
  "Resolved",
  "Closed"
]);

export const SupplierSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  type: SupplierTypeSchema,
  contactPerson: z.string(),
  phone: z.string(),
  email: z.string(),
  address: z.string(),
  creditDays: z.number(),
  rating: z.number(),
  status: z.enum(["Active", "Inactive"])
});

export const InventoryItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  category: z.enum(["Raw Material", "Packaging", "Consumables", "Finished Goods"]),
  uom: z.string(),
  availableStock: z.number(),
  reorderLevel: z.number(),
  safetyStock: z.number(),
  unitValue: z.number(),
  warehouseId: z.string(),
  status: z.enum(["Normal", "Low Stock", "Out of Stock"])
});

export const WarehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  type: z.enum(["Raw Material", "Finished Goods", "General"]),
  capacity: z.number(),
  utilized: z.number()
});

export const StockBatchSchema = z.object({
  id: z.string(),
  itemCode: z.string(),
  batchNumber: z.string(),
  quantity: z.number(),
  manufactureDate: z.string(),
  expiryDate: z.string(),
  warehouseId: z.string()
});

export const PurchaseRequisitionItemSchema = z.object({
  itemCode: z.string(),
  itemName: z.string(),
  qty: z.number(),
  uom: z.string()
});

export const ApprovalChainSchema = z.object({
  approver: z.string(),
  role: z.string(),
  actionDate: z.string(),
  comments: z.string()
});

export const PurchaseRequisitionSchema = z.object({
  id: z.string(),
  prNumber: z.string(),
  department: z.string(),
  requestedBy: z.string(),
  requestedDate: z.string(),
  requiredDate: z.string(),
  items: z.array(PurchaseRequisitionItemSchema),
  totalEstimatedValue: z.number(),
  status: DocStatusSchema,
  approvalChain: z.array(ApprovalChainSchema)
});

export const ComparisonMatrixItemSchema = z.object({
  supplierCode: z.string(),
  supplierName: z.string(),
  pricePerUnit: z.number(),
  leadTimeDays: z.number(),
  paymentTerms: z.string(),
  score: z.number()
});

export const RFQSchema = z.object({
  id: z.string(),
  rfqNumber: z.string(),
  prNumber: z.string(),
  issueDate: z.string(),
  closeDate: z.string(),
  status: z.enum(["Open", "Closed", "Completed"]),
  suppliersInvited: z.array(z.string()),
  comparisonMatrix: z.array(ComparisonMatrixItemSchema)
});

export const PurchaseOrderItemSchema = z.object({
  itemCode: z.string(),
  itemName: z.string(),
  qty: z.number(),
  uom: z.string(),
  unitPrice: z.number(),
  totalPrice: z.number()
});

export const PurchaseOrderSchema = z.object({
  id: z.string(),
  poNumber: z.string(),
  rfqNumber: z.string(),
  supplierId: z.string(),
  supplierName: z.string(),
  orderDate: z.string(),
  totalAmount: z.number(),
  approvalStatus: DocStatusSchema,
  items: z.array(PurchaseOrderItemSchema),
  deliveryStatus: z.enum(["Pending", "Partially Received", "Received"])
});

export const GoodsReceiptItemSchema = z.object({
  itemCode: z.string(),
  itemName: z.string(),
  orderedQty: z.number(),
  receivedQty: z.number(),
  uom: z.string(),
  qcPassed: z.boolean(),
  qcComments: z.string()
});

export const GoodsReceiptSchema = z.object({
  id: z.string(),
  grnNumber: z.string(),
  poNumber: z.string(),
  supplierName: z.string(),
  receivedDate: z.string(),
  receivedBy: z.string(),
  items: z.array(GoodsReceiptItemSchema),
  postedToInventory: z.boolean()
});

export const WorkOrderSchema = z.object({
  id: z.string(),
  woNumber: z.string(),
  productCode: z.string(),
  productName: z.string(),
  plannedQty: z.number(),
  producedQty: z.number(),
  status: z.enum(["Scheduled", "In Progress", "Completed"]),
  startDate: z.string(),
  endDate: z.string(),
  materialIssued: z.boolean()
});

export const SalesOrderItemSchema = z.object({
  productCode: z.string(),
  productName: z.string(),
  qty: z.number(),
  uom: z.string(),
  unitPrice: z.number(),
  totalPrice: z.number()
});

export const SalesOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerName: z.string(),
  customerCode: z.string(),
  orderDate: z.string(),
  items: z.array(SalesOrderItemSchema),
  totalAmount: z.number(),
  status: DocStatusSchema,
  deliveryStatus: z.enum(["Pending", "Dispatched", "Delivered"])
});

export const DeliveryTripSchema = z.object({
  id: z.string(),
  tripNumber: z.string(),
  vehicleNo: z.string(),
  driverName: z.string(),
  route: z.string(),
  eta: z.string(),
  status: z.enum(["Loading", "In Transit", "Delivered"]),
  fuelIssuedLiters: z.number(),
  fuelCost: z.number()
});

export const EmployeeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  designation: z.string(),
  department: z.string(),
  attendanceRate: z.number(),
  grossSalary: z.number()
});

export const LedgerAccountSchema = z.object({
  code: z.string(),
  name: z.string(),
  type: AccountTypeSchema,
  balance: z.number()
});

export const JournalLineSchema = z.object({
  accountCode: z.string(),
  accountName: z.string(),
  debit: z.number(),
  credit: z.number()
});

export const JournalEntrySchema = z.object({
  id: z.string(),
  voucherNo: z.string(),
  date: z.string(),
  description: z.string(),
  lines: z.array(JournalLineSchema)
});

export const CustomerSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  territory: z.string(),
  creditLimit: z.number(),
  balance: z.number(),
  status: z.enum(["Active", "Inactive"])
});

export const SupportTicketSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  createdBy: z.string(),
  subject: z.string(),
  priority: TicketPrioritySchema,
  status: TicketStatusSchema,
  assignedTo: z.string(),
  createdDate: z.string()
});

export const ActivityLogSchema = z.object({
  timestamp: z.string(),
  user: z.string(),
  action: z.string(),
  details: z.string()
});

export const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  time: z.string(),
  category: z.enum(["Approval", "Inventory", "Production", "Finance", "System"]),
  read: z.boolean()
});

// Primary ERP State Schema
export const ERPStateSchema = z.object({
  suppliers: z.array(SupplierSchema),
  inventory: z.array(InventoryItemSchema),
  warehouses: z.array(WarehouseSchema),
  batches: z.array(StockBatchSchema),
  requisitions: z.array(PurchaseRequisitionSchema),
  rfqs: z.array(RFQSchema),
  purchaseOrders: z.array(PurchaseOrderSchema),
  goodsReceipts: z.array(GoodsReceiptSchema),
  workOrders: z.array(WorkOrderSchema),
  salesOrders: z.array(SalesOrderSchema),
  trips: z.array(DeliveryTripSchema),
  employees: z.array(EmployeeSchema),
  ledger: z.array(LedgerAccountSchema),
  journal: z.array(JournalEntrySchema),
  customers: z.array(CustomerSchema),
  tickets: z.array(SupportTicketSchema),
  activities: z.array(ActivityLogSchema),
  notifications: z.array(NotificationSchema),
  forecastQty: z.number(),
  selectedProductId: z.string(),
  currentDemoStep: z.number()
});
