import { describe, it, expect } from 'vitest';

// Business logic test for MRP calculations and Inventory Reconciliation
function calculateMRPRequirement(forecastQty: number, currentStock: number, safetyStock: number) {
  const netRequirement = Math.max(0, forecastQty + safetyStock - currentStock);
  const plannedOrderBatches = Math.ceil(netRequirement / 1000) * 1000; // batch size 1000
  return { netRequirement, plannedOrderBatches };
}

function reconcileInventory(ledgerBalance: number, physicalCount: number) {
  const discrepancy = physicalCount - ledgerBalance;
  const status = discrepancy === 0 ? "Reconciled" : discrepancy > 0 ? "Surplus" : "Shrinkage";
  return { discrepancy, status };
}

describe('Agro ERP Business Logic Tests', () => {
  it('calculates MRP net requirement correctly', () => {
    const result = calculateMRPRequirement(5000, 2000, 1000);
    expect(result.netRequirement).toBe(4000);
    expect(result.plannedOrderBatches).toBe(4000);
  });

  it('handles MRP when stock is sufficient', () => {
    const result = calculateMRPRequirement(2000, 5000, 500);
    expect(result.netRequirement).toBe(0);
    expect(result.plannedOrderBatches).toBe(0);
  });

  it('reconciles inventory discrepancies (surplus)', () => {
    const rec = reconcileInventory(10000, 10250);
    expect(rec.discrepancy).toBe(250);
    expect(rec.status).toBe("Surplus");
  });

  it('reconciles inventory discrepancies (shrinkage)', () => {
    const rec = reconcileInventory(10000, 9800);
    expect(rec.discrepancy).toBe(-200);
    expect(rec.status).toBe("Shrinkage");
  });

  it('reconciles inventory when perfectly matched', () => {
    const rec = reconcileInventory(5000, 5000);
    expect(rec.discrepancy).toBe(0);
    expect(rec.status).toBe("Reconciled");
  });
});
