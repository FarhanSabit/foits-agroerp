-- ====================================================================
-- OITS Dhaka — Agro ERP Dummy Data Seeding SQL Script
-- Target Database Name: agrodb
-- Compatible with: PostgreSQL / Neon Serverless Postgres
-- ====================================================================

-- 1. Create Tables (If not already created by ORM)
CREATE TABLE IF NOT EXISTS agro_erp_state (
  id VARCHAR(50) PRIMARY KEY,
  state_json JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  credit_days INTEGER DEFAULT 30,
  rating DOUBLE PRECISION DEFAULT 5.0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  utilized INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  uom VARCHAR(20) NOT NULL,
  available_stock INTEGER NOT NULL,
  reorder_level INTEGER NOT NULL,
  safety_stock INTEGER NOT NULL,
  unit_value DOUBLE PRECISION NOT NULL,
  warehouse_id VARCHAR(50) REFERENCES warehouses(id),
  status VARCHAR(50) DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batches (
  id VARCHAR(50) PRIMARY KEY,
  item_code VARCHAR(50) NOT NULL,
  batch_number VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  manufacture_date VARCHAR(50),
  expiry_date VARCHAR(50),
  warehouse_id VARCHAR(50) REFERENCES warehouses(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  territory VARCHAR(255),
  credit_limit DOUBLE PRECISION DEFAULT 0.0,
  balance DOUBLE PRECISION DEFAULT 0.0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  attendance_rate DOUBLE PRECISION DEFAULT 100.0,
  gross_salary DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  balance DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(50) PRIMARY KEY,
  timestamp VARCHAR(100) NOT NULL,
  "user" VARCHAR(100) NOT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT
);

-- 2. Clear Existing Data (Optional/Safe execution)
TRUNCATE TABLE activities, batches, inventory, warehouses, suppliers, customers, employees, ledger, agro_erp_state CASCADE;

-- 3. Seed JSON Application State Record
INSERT INTO agro_erp_state (id, state_json) VALUES (
  'current_state',
  '{
    "suppliers": [
      {"id": "s1", "code": "SUP001", "name": "XYZ Grain Trading", "type": "Raw Material Supplier", "contactPerson": "Abul Kalam", "phone": "01711-234567", "email": "kalam@xyzgrain.com", "address": "Khulna Port Area, Khulna", "creditDays": 30, "rating": 4.8, "status": "Active"},
      {"id": "s2", "code": "SUP002", "name": "Dhaka Agri-Chemicals", "type": "Raw Material Supplier", "contactPerson": "Anisur Rahman", "phone": "01819-876543", "email": "info@dhakaagri.com", "address": "Tejgaon I/A, Dhaka", "creditDays": 15, "rating": 4.5, "status": "Active"},
      {"id": "s3", "code": "SUP003", "name": "Bengal Packaging Ind.", "type": "Packaging Vendor", "contactPerson": "Sultana Begum", "phone": "01911-555666", "email": "sbegum@bengalpack.com", "address": "Savar, Dhaka", "creditDays": 45, "rating": 4.2, "status": "Active"}
    ],
    "warehouses": [
      {"id": "w1", "name": "Raw Material Silo - 1", "location": "Mymensingh Plant", "type": "Raw Material", "capacity": 5000, "utilized": 3100},
      {"id": "w2", "name": "Finished Goods Depot", "location": "Gazipur Central", "type": "Finished Goods", "capacity": 3000, "utilized": 1200},
      {"id": "w3", "name": "Consumable Store", "location": "Mymensingh Plant", "type": "General", "capacity": 1000, "utilized": 450}
    ],
    "inventory": [
      {"id": "i1", "code": "RM001", "name": "Maize (Yellow Grade A)", "category": "Raw Material", "uom": "KG", "availableStock": 40000, "reorderLevel": 50000, "safetyStock": 20000, "unitValue": 35, "warehouseId": "w1", "status": "Low Stock"},
      {"id": "i2", "code": "RM002", "name": "Soybean Meal (46% Protein)", "category": "Raw Material", "uom": "KG", "availableStock": 65000, "reorderLevel": 40000, "safetyStock": 15000, "unitValue": 58, "warehouseId": "w1", "status": "Normal"}
    ],
    "batches": [
      {"id": "b1", "itemCode": "FG001", "batchNumber": "BAT-BR-2607A", "quantity": 1000, "manufactureDate": "2026-07-20", "expiryDate": "2027-01-20", "warehouseId": "w2"}
    ],
    "requisitions": [],
    "rfqs": [],
    "purchaseOrders": [],
    "goodsReceipts": [],
    "workOrders": [
      {"id": "wo1", "woNumber": "WO24001", "productCode": "FG001", "productName": "Premium Broiler Starter Feed", "plannedQty": 1000, "producedQty": 0, "status": "Scheduled", "startDate": "2026-07-28", "endDate": "2026-07-30", "materialIssued": false}
    ],
    "customers": [
      {"id": "c1", "code": "CUS001", "name": "Kazi Farms Hatchery", "territory": "Gazipur", "creditLimit": 5000000, "balance": 1200000, "status": "Active"},
      {"id": "c2", "code": "CUS002", "name": "Aftab Feed & Poultry", "territory": "Kishoreganj", "creditLimit": 3000000, "balance": 450000, "status": "Active"}
    ],
    "salesOrders": [],
    "trips": [],
    "employees": [
      {"id": "e1", "code": "EMP001", "name": "Dr. Ahsan Rahman", "designation": "Chief Financial Officer (CFO)", "department": "Finance & Accounts", "attendanceRate": 98.5, "grossSalary": 180000},
      {"id": "e2", "code": "EMP002", "name": "Sultana Begum", "designation": "Factory General Manager", "department": "Production & Planning", "attendanceRate": 96.2, "grossSalary": 120000}
    ],
    "ledger": [
      {"code": "1010", "name": "Bank Asia General A/C", "type": "Asset", "balance": 18000000},
      {"code": "1200", "name": "Accounts Receivable", "type": "Asset", "balance": 23000000}
    ],
    "journal": [],
    "tickets": [],
    "activities": [
      {"id": "act1", "timestamp": "2026-07-26 18:30", "user": "Ahsan Rahman", "action": "Approved PR", "details": "PR-2026-0041 approved with total estimate ৳7,00,000"}
    ],
    "notifications": [],
    "forecastQty": 1000,
    "selectedProductId": "FG001",
    "currentDemoStep": 0
  }'::jsonb
);

-- 4. Seed Suppliers Relational Table
INSERT INTO suppliers (id, code, name, type, contact_person, phone, email, address, credit_days, rating, status) VALUES
('s1', 'SUP001', 'XYZ Grain Trading', 'Raw Material Supplier', 'Abul Kalam', '01711-234567', 'kalam@xyzgrain.com', 'Khulna Port Area, Khulna', 30, 4.8, 'Active'),
('s2', 'SUP002', 'Dhaka Agri-Chemicals', 'Raw Material Supplier', 'Anisur Rahman', '01819-876543', 'info@dhakaagri.com', 'Tejgaon I/A, Dhaka', 15, 4.5, 'Active'),
('s3', 'SUP003', 'Bengal Packaging Ind.', 'Packaging Vendor', 'Sultana Begum', '01911-555666', 'sbegum@bengalpack.com', 'Savar, Dhaka', 45, 4.2, 'Active');

-- 5. Seed Warehouses Relational Table
INSERT INTO warehouses (id, name, location, type, capacity, utilized) VALUES
('w1', 'Raw Material Silo - 1', 'Mymensingh Plant', 'Raw Material', 5000, 3100),
('w2', 'Finished Goods Depot', 'Gazipur Central', 'Finished Goods', 3000, 1200),
('w3', 'Consumable Store', 'Mymensingh Plant', 'General', 1000, 450);

-- 6. Seed Inventory Relational Table
INSERT INTO inventory (id, code, name, category, uom, available_stock, reorder_level, safety_stock, unit_value, warehouse_id, status) VALUES
('i1', 'RM001', 'Maize (Yellow Grade A)', 'Raw Material', 'KG', 40000, 50000, 20000, 35, 'w1', 'Low Stock'),
('i2', 'RM002', 'Soybean Meal (46% Protein)', 'Raw Material', 'KG', 65000, 40000, 15000, 58, 'w1', 'Normal');

-- 7. Seed Batches Relational Table
INSERT INTO batches (id, item_code, batch_number, quantity, manufacture_date, expiry_date, warehouse_id) VALUES
('b1', 'FG001', 'BAT-BR-2607A', 1000, '2026-07-20', '2027-01-20', 'w2');

-- 8. Seed Customers Relational Table
INSERT INTO customers (id, code, name, territory, credit_limit, balance, status) VALUES
('c1', 'CUS001', 'Kazi Farms Hatchery', 'Gazipur', 5000000, 1200000, 'Active'),
('c2', 'CUS002', 'Aftab Feed & Poultry', 'Kishoreganj', 3000000, 450000, 'Active');

-- 9. Seed Employees Relational Table
INSERT INTO employees (id, code, name, designation, department, attendance_rate, gross_salary) VALUES
('e1', 'EMP001', 'Dr. Ahsan Rahman', 'Chief Financial Officer (CFO)', 'Finance & Accounts', 98.5, 180000),
('e2', 'EMP002', 'Sultana Begum', 'Factory General Manager', 'Production & Planning', 96.2, 120000);

-- 10. Seed Ledger Relational Table
INSERT INTO ledger (code, name, type, balance) VALUES
('1010', 'Bank Asia General A/C', 'Asset', 18000000),
('1200', 'Accounts Receivable', 'Asset', 23000000);

-- 11. Seed Activities Relational Table
INSERT INTO activities (id, timestamp, "user", action, details) VALUES
('act1', '2026-07-26 18:30', 'Ahsan Rahman', 'Approved PR', 'PR-2026-0041 approved with total estimate ৳7,00,000');

-- ====================================================================
-- Seeding Successful!
-- ====================================================================
