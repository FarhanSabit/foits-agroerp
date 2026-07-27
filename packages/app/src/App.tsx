/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  initialSuppliers,
  initialInventory,
  initialWarehouses,
  initialBatches,
  initialRequisitions,
  initialRFQs,
  initialPurchaseOrders,
  initialGoodsReceipts,
  initialWorkOrders,
  initialSalesOrders,
  initialTrips,
  initialEmployees,
  initialLedger,
  initialJournal,
  initialCustomers,
  initialTickets,
  initialActivities,
  initialNotifications,
  ERPState,
  DocStatus,
  SupplierType,
  TicketStatus,
  AccountType,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceipt
} from "./types";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { CurrencyManager } from "@agro-erp/shared-utils";
import GoldenFlow from "./components/GoldenFlow";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import ProcurementModule from "./components/ProcurementModule";
import ProductionModule from "./components/ProductionModule";
import OtherModules from "./components/OtherModules";
import AIAssistant from "./components/AIAssistant";
import OperationalExcellence from "./components/OperationalExcellence";
import AuthModal from "./components/AuthModal";
import RoleManagerModal from "./components/RoleManagerModal";
import AccessDeniedView from "./components/AccessDeniedView";
import { initialUsers, UserAccount } from "./types";

import {
  Search,
  Sparkles,
  Command,
  TrendingUp,
  X,
  Plus,
  HelpCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  Cpu
} from "lucide-react";

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={i} className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/20 dark:bg-indigo-500/30 px-1 py-0.5 rounded text-[11px]">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function App() {

  // Global ERP State initialization
  const [state, setState] = useState<ERPState>({
    suppliers: initialSuppliers,
    inventory: initialInventory,
    warehouses: initialWarehouses,
    batches: initialBatches,
    requisitions: initialRequisitions,
    rfqs: initialRFQs,
    purchaseOrders: initialPurchaseOrders,
    goodsReceipts: initialGoodsReceipts,
    workOrders: initialWorkOrders,
    salesOrders: initialSalesOrders,
    trips: initialTrips,
    employees: initialEmployees,
    ledger: initialLedger,
    journal: initialJournal,
    customers: initialCustomers,
    tickets: initialTickets,
    activities: initialActivities,
    notifications: initialNotifications,
    forecastQty: 1000,
    selectedProductId: "FG001",
    currentDemoStep: 0,
    currency: "BDT"
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState("dashboard");
  const [currencyRerender, setCurrencyRerender] = useState(0);

  // Sync Currency from State
  useEffect(() => {
    const fetchRates = async () => {
      try {
        if (state.currency === "BDT") {
          CurrencyManager.setCurrency("BDT", 1, "৳");
          setCurrencyRerender(c => c + 1);
          return;
        }
        
        // Fetch real-time rate
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/BDT");
        const data = await response.json();
        
        if (state.currency === "USD") {
          const rate = data.rates.USD || 0.0091; // fallback
          CurrencyManager.setCurrency("USD", rate, "$");
        } else if (state.currency === "EUR") {
          const rate = data.rates.EUR || 0.0084; // fallback
          CurrencyManager.setCurrency("EUR", rate, "€");
        }
        setCurrencyRerender(c => c + 1);
      } catch (err) {
        console.error("Failed to fetch exchange rates", err);
        // Fallback
        if (state.currency === "USD") CurrencyManager.setCurrency("USD", 0.0091, "$");
        if (state.currency === "EUR") CurrencyManager.setCurrency("EUR", 0.0084, "€");
        setCurrencyRerender(c => c + 1);
      }
    };
    fetchRates();
  }, [state.currency]);
  
  // RBAC & Authentication State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem("agro_erp_users");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved users:", e);
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("agro_erp_current_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved current user:", e);
    }
    return initialUsers[0]; // Default to Dr. Ahsan Rahman (CFO / Admin)
  });

  const [userRole, setUserRole] = useState<string>(() => currentUser?.role || "CFO");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roleManagerOpen, setRoleManagerOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isBangla, setIsBangla] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Automated Monitoring: Overdue Purchase Orders
  useEffect(() => {
    if (isLoading) return;

    const scanOverduePOs = () => {
      const today = new Date();
      const overduePOs = state.purchaseOrders.filter(po => {
        if (po.deliveryStatus === "Received") return false;
        const requiredDate = new Date(po.requiredDate);
        return requiredDate < today;
      });

      if (overduePOs.length > 0) {
        setState(prev => {
          const newNotifications = [...prev.notifications];
          let updated = false;

          overduePOs.forEach(po => {
            const notifId = `overdue-po-${po.id}`;
            if (!newNotifications.some(n => n.id === notifId)) {
              newNotifications.unshift({
                id: notifId,
                title: "Overdue Purchase Order",
                message: `PO ${po.poNumber} from ${po.supplierName} is overdue. Expected: ${po.requiredDate}.`,
                time: "Just now",
                category: "Procurement" as any, // category was not in enum but union in Notification
                read: false
              });
              updated = true;
            }
          });

          if (updated) {
            return { ...prev, notifications: newNotifications };
          }
          return prev;
        });
      }
    };

    // Run once on load and then every 5 minutes
    scanOverduePOs();
    const interval = setInterval(scanOverduePOs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.purchaseOrders, isLoading]);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("agro_erp_users", JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users:", e);
    }
  }, [users]);

  // Sync currentUser to localStorage & keep userRole updated
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem("agro_erp_current_user", JSON.stringify(currentUser));
      } catch (e) {
        console.error("Failed to save current user:", e);
      }
      setUserRole(currentUser.role);
    } else {
      localStorage.removeItem("agro_erp_current_user");
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setAuthModalOpen(false);
  };

  const handleRegisterSuccess = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setUserRole(newUser.role);
    setAuthModalOpen(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setAuthModalOpen(true);
  };

  const handleUpdateUsers = (updatedUsers: UserAccount[]) => {
    setUsers(updatedUsers);
    if (currentUser) {
      const match = updatedUsers.find((u) => u.id === currentUser.id);
      if (match) {
        setCurrentUser(match);
        setUserRole(match.role);
      }
    }
  };

  // RBAC Permission Check per Module Tab
  const hasTabPermission = (tabId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "CFO") return true;

    const tabPermMap: Record<string, string> = {
      dashboard: "view_dashboard",
      procurement: "manage_procurement",
      inventory: "manage_inventory",
      production: "manage_production",
      commercial: "manage_commercial",
      sales: "manage_sales",
      finance: "manage_finance",
      hr: "manage_hr",
      logistics: "manage_logistics",
      crm: "manage_crm",
      support: "manage_support",
      operational_excellence: "view_dashboard"
    };

    const requiredPerm = tabPermMap[tabId];
    if (!requiredPerm) return true;
    return currentUser.permissions.includes(requiredPerm);
  };

  // 1. Fetch initial state from Neon DB via Express API
  useEffect(() => {
    async function initConnection() {
      try {
        const healthRes = await fetch("/api/health");
        const healthData = await healthRes.json();
        if (healthData.status === "ok") {
          setDbConnected(true);
        } else {
          setDbError("Database returned status: unhealthy");
        }
      } catch (err: any) {
        setDbError(err.message || "Failed to contact Express server");
      }

      try {
        const stateRes = await fetch("/api/erp/state");
        if (stateRes.ok) {
          const fetchedState = await stateRes.json();
          setState(fetchedState);
        }
      } catch (err: any) {
        console.error("Failed to load ERP state from DB:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initConnection();
  }, []);

  // 2. Debounced persistence to Neon DB when state updates
  useEffect(() => {
    if (isLoading) return;

    const syncTimeout = setTimeout(async () => {
      try {
        await fetch("/api/erp/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state })
        });
      } catch (err) {
        console.error("Failed to sync state to Neon DB:", err);
      }
    }, 1000);

    return () => clearTimeout(syncTimeout);
  }, [state, isLoading]);

  // Reset database state back to initial seed data
  const handleResetDB = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/erp/reset", { method: "POST" });
      if (res.ok) {
        const seededState = await res.json();
        setState(seededState);
      }
    } catch (err) {
      console.error("Failed to reset Neon DB:", err);
    } finally {
      setIsLoading(false);
    }
  };


  // Mark notification as read
  const handleMarkNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    }));
  };

  // Step 0: Set Forecast Demand
  const handleSetForecast = (qty: number) => {
    setState((prev) => {
      const logs = [
        {
          timestamp: "2026-07-26 18:40",
          user: "Sultana Begum",
          action: "Forecast Demand Configured",
          details: `Poultry Feed demand updated to ${qty} Bags.`
        },
        ...prev.activities
      ];
      return {
        ...prev,
        forecastQty: qty,
        activities: logs,
        currentDemoStep: prev.currentDemoStep === 0 ? 1 : prev.currentDemoStep
      };
    });
  };

  // Step 1: Run MRP Calculation
  const handleRunMRP = () => {
    setState((prev) => {
      // Explode Poultry Feed BOM
      const totalMaizeNeeded = 30 * prev.forecastQty; // 30KG Maize per Feed bag
      const maizeStockItem = prev.inventory.find((i) => i.code === "RM001");
      const currentMaizeStock = maizeStockItem ? maizeStockItem.availableStock : 0;
      const maizeShortage = Math.max(0, totalMaizeNeeded - currentMaizeStock);

      const logs = [
        {
          timestamp: "2026-07-26 18:41",
          user: "Sultana Begum",
          action: "MRP Calculation Triggered",
          details: `Exploded Poultry Feed BOM. Total Maize required: ${totalMaizeNeeded.toLocaleString()} KG. Shortage detected: ${maizeShortage.toLocaleString()} KG.`
        },
        ...prev.activities
      ];

      const notifications = [
        {
          id: "mrp-alert",
          title: "MRP Shortage Detected",
          message: `Maize is short by ${maizeShortage.toLocaleString()} KG for forecast demand.`,
          time: "Just now",
          category: "Inventory" as const,
          read: false
        },
        ...prev.notifications
      ];

      return {
        ...prev,
        activities: logs,
        notifications,
        currentDemoStep: prev.currentDemoStep === 1 ? 2 : prev.currentDemoStep
      };
    });
    if (currentTab !== "production") setCurrentTab("production");
  };

  // Revert PR or PO version snapshot
  const handleRevertVersion = (docType: "PR" | "PO", docId: string, versionNumber: number) => {
    setState((prev) => {
      if (docType === "PR") {
        const targetPR = prev.requisitions.find(r => r.id === docId);
        if (!targetPR || !targetPR.versions) return prev;
        const ver = targetPR.versions.find(v => v.versionNumber === versionNumber);
        if (!ver || !ver.snapshot) return prev;

        return {
          ...prev,
          requisitions: prev.requisitions.map(r => r.id === docId ? { ...ver.snapshot, versions: targetPR.versions } : r),
          activities: [
            {
              timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
              user: userRole || "SCM Manager",
              action: `Reverted PR to Version ${versionNumber}`,
              details: `PR ${targetPR.prNumber} restored to state from v${versionNumber}`
            },
            ...prev.activities
          ]
        };
      } else {
        const targetPO = prev.purchaseOrders.find(p => p.id === docId);
        if (!targetPO || !targetPO.versions) return prev;
        const ver = targetPO.versions.find(v => v.versionNumber === versionNumber);
        if (!ver || !ver.snapshot) return prev;

        return {
          ...prev,
          purchaseOrders: prev.purchaseOrders.map(p => p.id === docId ? { ...ver.snapshot, versions: targetPO.versions } : p),
          activities: [
            {
              timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
              user: userRole || "SCM Manager",
              action: `Reverted PO to Version ${versionNumber}`,
              details: `PO ${targetPO.poNumber} restored to state from v${versionNumber}`
            },
            ...prev.activities
          ]
        };
      }
    });
  };

  const handleAutoGeneratePreventivePR = (itemCode: string, qty: number) => {
    handleRaisePR(itemCode, qty);
    setCurrentTab("procurement");
  };
  const handleRaisePR = (itemCode: string, qty: number) => {
    setState((prev) => {
      const item = prev.inventory.find((i) => i.code === itemCode);
      const itemName = item ? item.name : "Raw Material";

      const newPR: PurchaseRequisition = {
        id: `pr-${Date.now()}`,
        prNumber: "PR-2026-0041",
        department: "Production Planning",
        requestedBy: "Sultana Begum",
        requestedDate: "2026-07-26",
        requiredDate: "2026-08-05",
        items: [{ itemCode, itemName, qty, uom: item ? item.uom : "KG" }],
        totalEstimatedValue: qty * (item ? item.unitValue : 35),
        status: DocStatus.PENDING,
        approvalChain: []
      };

      const logs = [
        {
          timestamp: "2026-07-26 18:42",
          user: "Sultana Begum",
          action: "Raised Purchase Requisition",
          details: `PR-2026-0041 raised for ${qty.toLocaleString()} KG of Maize.`
        },
        ...prev.activities
      ];

      const notifications = [
        {
          id: `notif-${Date.now()}`,
          title: "New Requisition (PR)",
          message: `PR-2026-0041 raised by SCM for ${qty.toLocaleString()} KG Maize. Requires CFO authorization.`,
          time: "Just now",
          category: "Approval" as const,
          read: false
        },
        ...prev.notifications
      ];

      return {
        ...prev,
        requisitions: [newPR, ...prev.requisitions.filter(r => r.prNumber !== "PR-2026-0041")],
        activities: logs,
        notifications,
        currentDemoStep: prev.currentDemoStep === 2 ? 3 : prev.currentDemoStep
      };
    });
    if (currentTab !== "procurement") setCurrentTab("procurement");
  };

  // Step 3: Approve Requisition (CFO Mode)
  const handleApprovePR = (id: string, signatureDataUrl?: string, signatoryName?: string) => {
    setState((prev) => {
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedPRs = prev.requisitions.map((r) =>
        r.id === id
          ? {
              ...r,
              status: DocStatus.APPROVED,
              signatureUrl: signatureDataUrl || r.signatureUrl,
              signedBy: signatoryName || "Dr. Ahsan Rahman",
              signedDate: todayStr,
              approvalChain: [
                {
                  approver: signatoryName || "Dr. Ahsan Rahman",
                  role: "CFO",
                  actionDate: todayStr,
                  comments: "Budget authorized with E-Signature.",
                  signatureUrl: signatureDataUrl
                }
              ]
            }
          : r
      );

      const logs = [
        {
          timestamp: "2026-07-26 18:43",
          user: signatoryName || "Ahsan Rahman",
          action: "PR Budget Authorized (E-Signed)",
          details: `PR-2026-0041 approved with attached manager e-signature.`
        },
        ...prev.activities
      ];

      const notifications = [
        {
          id: `notif-app-${Date.now()}`,
          title: "PR E-Signed & Approved",
          message: `PR-2026-0041 was signed by ${signatoryName || "CFO"}. RFQ door is unlocked.`,
          time: "Just now",
          category: "Approval" as const,
          read: false
        },
        ...prev.notifications
      ];

      return {
        ...prev,
        requisitions: updatedPRs,
        activities: logs,
        notifications,
        currentDemoStep: prev.currentDemoStep === 3 ? 4 : prev.currentDemoStep
      };
    });
  };

  const handleBulkApprovePR = (ids: string[], signatureDataUrl?: string, signatoryName?: string) => {
    setState((prev) => {
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedPRs = prev.requisitions.map((r) =>
        ids.includes(r.id)
          ? {
              ...r,
              status: DocStatus.APPROVED,
              signatureUrl: signatureDataUrl || r.signatureUrl,
              signedBy: signatoryName || "Dr. Ahsan Rahman",
              signedDate: todayStr,
              approvalChain: [
                {
                  approver: signatoryName || "Dr. Ahsan Rahman",
                  role: "CFO",
                  actionDate: todayStr,
                  comments: "Bulk budget authorized with E-Signature.",
                  signatureUrl: signatureDataUrl
                }
              ]
            }
          : r
      );

      const logs = [
        {
          timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
          user: signatoryName || "Ahsan Rahman",
          action: "Bulk PR Budget Authorized (E-Signed)",
          details: `${ids.length} PRs approved with attached manager e-signature.`
        },
        ...prev.activities
      ];

      const notifications = [
        {
          id: `notif-app-${Date.now()}`,
          title: "Bulk PRs E-Signed & Approved",
          message: `${ids.length} PRs were signed by ${signatoryName || "CFO"}.`,
          time: "Just now",
          category: "Approval" as const,
          read: false
        },
        ...prev.notifications
      ];

      return {
        ...prev,
        requisitions: updatedPRs,
        activities: logs,
        notifications,
        currentDemoStep: prev.currentDemoStep === 3 ? 4 : prev.currentDemoStep
      };
    });
  };

  // Step 4: Raise RFQ
  const handleRaiseRFQ = (prNumber: string) => {
    setState((prev) => {
      const newRFQ = {
        id: `rfq-${Date.now()}`,
        rfqNumber: "RFQ-2026-0012",
        prNumber,
        issueDate: "2026-07-26",
        closeDate: "2026-07-29",
        status: "Open" as const,
        suppliersInvited: ["SUP001", "SUP002"],
        comparisonMatrix: [
          { supplierCode: "SUP001", supplierName: "XYZ Grain Trading", pricePerUnit: 34.5, leadTimeDays: 5, paymentTerms: "30 Days Credit", score: 92 },
          { supplierCode: "SUP002", supplierName: "Dhaka Agri-Chemicals", pricePerUnit: 35.8, leadTimeDays: 3, paymentTerms: "15 Days Credit", score: 88 }
        ]
      };

      const logs = [
        {
          timestamp: "2026-07-26 18:44",
          user: "Sultana Begum",
          action: "Issued RFQ door",
          details: `RFQ-2026-0012 issued to XYZ Trading and Dhaka Agri for competitive pricing.`
        },
        ...prev.activities
      ];

      return {
        ...prev,
        rfqs: [newRFQ, ...prev.rfqs.filter(r => r.rfqNumber !== "RFQ-2026-0012")],
        activities: logs,
        currentDemoStep: prev.currentDemoStep === 4 ? 5 : prev.currentDemoStep
      };
    });
    if (currentTab !== "procurement") setCurrentTab("procurement");
  };

  // Step 5: Award PO based on lowest bidder comparison
  const handleAwardSupplier = (rfqNumber: string, supplierCode: string) => {
    setState((prev) => {
      const supplierObj = prev.suppliers.find((s) => s.code === supplierCode) || prev.suppliers[0];
      const rfqObj = prev.rfqs.find((r) => r.rfqNumber === rfqNumber);
      const prObj = rfqObj ? prev.requisitions.find((p) => p.prNumber === rfqObj.prNumber) : prev.requisitions[0];
      const prItem = prObj ? prObj.items[0] : { itemCode: "RM001", itemName: "Maize (Yellow Grade A)", qty: 20000, uom: "KG" };

      const totalAmount = prItem.qty * 34.5;

      const newPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        poNumber: "PO-2026-0092",
        rfqNumber,
        supplierId: supplierObj.id,
        supplierName: supplierObj.name,
        orderDate: "2026-07-26",
        totalAmount,
        approvalStatus: DocStatus.PENDING,
        items: [
          {
            itemCode: prItem.itemCode,
            itemName: prItem.itemName,
            qty: prItem.qty,
            uom: prItem.uom,
            unitPrice: 34.5,
            totalPrice: totalAmount
          }
        ],
        deliveryStatus: "Pending",
        requiredDate: "2026-08-05"
      };

      const logs = [
        {
          timestamp: "2026-07-26 18:45",
          user: "Sultana Begum",
          action: "PO Drafted",
          details: `PO-2026-0092 drafted to XYZ Grain Trading. Estimate BDT ${CurrencyManager.format(totalAmount)}.`
        },
        ...prev.activities
      ];

      const notifications = [
        {
          id: `po-pending-${Date.now()}`,
          title: "PO Pending Authorization",
          message: `PO-2026-0092 requires CFO authorization. Supplier: XYZ Grain Trading`,
          time: "Just now",
          category: "Approval" as const,
          read: false
        },
        ...prev.notifications
      ];

      return {
        ...prev,
        purchaseOrders: [newPO, ...prev.purchaseOrders.filter(p => p.poNumber !== "PO-2026-0092")],
        activities: logs,
        notifications,
        currentDemoStep: prev.currentDemoStep === 5 ? 6 : prev.currentDemoStep
      };
    });
  };

  // Step 6: Approve Purchase Order
  const handleApprovePO = (id: string, signatureDataUrl?: string, signatoryName?: string) => {
    setState((prev) => {
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedPOs = prev.purchaseOrders.map((p) =>
        p.id === id
          ? {
              ...p,
              approvalStatus: DocStatus.APPROVED,
              signatureUrl: signatureDataUrl || p.signatureUrl,
              signedBy: signatoryName || "Dr. Ahsan Rahman",
              signedDate: todayStr
            }
          : p
      );

      const logs = [
        {
          timestamp: "2026-07-26 18:46",
          user: signatoryName || "Ahsan Rahman",
          action: "PO Approved (E-Signed)",
          details: `PO approved with attached manager e-signature.`
        },
        ...prev.activities
      ];

      return {
        ...prev,
        purchaseOrders: updatedPOs,
        activities: logs,
        currentDemoStep: prev.currentDemoStep === 6 ? 7 : prev.currentDemoStep
      };
    });
  };

  // Step 7: Post GRN (Goods Receipt) & QC
  const handlePostGRN = (poNumber: string, receivedItems: any[], signatureDataUrl?: string, signatoryName?: string) => {
    setState((prev) => {
      const po = prev.purchaseOrders.find((p) => p.poNumber === poNumber) || prev.purchaseOrders[0];
      const todayStr = new Date().toISOString().split("T")[0];

      const newGRN: GoodsReceipt = {
        id: `grn-${Date.now()}`,
        grnNumber: "GRN-2026-0112",
        poNumber,
        supplierName: po.supplierName,
        receivedDate: todayStr,
        receivedBy: signatoryName || "Sultana Begum",
        signatureUrl: signatureDataUrl,
        signedBy: signatoryName || "Sultana Begum",
        signedDate: todayStr,
        items: receivedItems.map((i) => ({
          itemCode: i.itemCode,
          itemName: i.itemName,
          orderedQty: i.qty,
          receivedQty: i.qty,
          uom: i.uom,
          qcPassed: true,
          qcComments: "Moisture 11.2%, Standard yellow corn specs passed."
        })),
        postedToInventory: true
      };

      // Mutate raw material inventory (add Maize stock)
      const updatedInventory = prev.inventory.map((item) => {
        if (item.code === "RM001") {
          return {
            ...item,
            availableStock: item.availableStock + 20000,
            status: "Normal" as const
          };
        }
        return item;
      });

      // AP Liability created
      const updatedLedger = prev.ledger.map((acc) => {
        if (acc.code === "2100") {
          return { ...acc, balance: acc.balance + po.totalAmount }; // AP liability increases
        }
        if (acc.code === "1300") {
          return { ...acc, balance: acc.balance + po.totalAmount }; // RM asset increases
        }
        return acc;
      });

      // Double entry journal posting
      const newJournal = {
        id: `jv-${Date.now()}`,
        voucherNo: "JV-2026-0742",
        date: "2026-07-26",
        description: "RM Inventory received & Liability recorded (GRN-2026-0112)",
        lines: [
          { accountCode: "1300", accountName: "Raw Material Inventory", debit: po.totalAmount, credit: 0 },
          { accountCode: "2100", accountName: "Accounts Payable", debit: 0, credit: po.totalAmount }
        ]
      };

      const updatedPOs = prev.purchaseOrders.map((p) =>
        p.poNumber === poNumber ? { ...p, deliveryStatus: "Received" as const } : p
      );

      const logs = [
        {
          timestamp: "2026-07-26 18:47",
          user: "Sultana Begum",
          action: "Goods Received (GRN)",
          details: `GRN-2026-0112 posted. Maize stock increased by 20,000 KG. General Ledger liability registered.`
        },
        ...prev.activities
      ];

      return {
        ...prev,
        goodsReceipts: [newGRN, ...prev.goodsReceipts],
        inventory: updatedInventory,
        ledger: updatedLedger,
        journal: [newJournal, ...prev.journal],
        purchaseOrders: updatedPOs,
        activities: logs,
        currentDemoStep: prev.currentDemoStep === 7 ? 8 : prev.currentDemoStep
      };
    });
    if (currentTab !== "inventory") setCurrentTab("inventory");
  };

  // Link Scanned Invoice to Goods Receipt Note
  const handleLinkInvoiceToGRN = (grnId: string, invoiceUrl: string) => {
    setState((prev) => {
      const updatedGRNs = prev.goodsReceipts.map((grn) =>
        grn.id === grnId ? { ...grn, scannedInvoiceUrl: invoiceUrl } : grn
      );

      const logs = [
        {
          timestamp: "2026-07-26 19:00",
          user: "SCM Manager",
          action: "Invoice Scanned & Linked",
          details: `Linked physical invoice snapshot directly to GRN: ${prev.goodsReceipts.find(g => g.id === grnId)?.grnNumber || grnId}.`
        },
        ...prev.activities
      ];

      return {
        ...prev,
        goodsReceipts: updatedGRNs,
        activities: logs
      };
    });
  };

  // Step 8: Verify Inventory (Just advances flow step)
  const handleVerifyInventory = () => {
    setState((prev) => ({
      ...prev,
      currentDemoStep: prev.currentDemoStep === 8 ? 9 : prev.currentDemoStep
    }));
    if (currentTab !== "inventory") setCurrentTab("inventory");
  };

  // Step 9: Launch Work Order, Issue Materials, Produce FG
  const handleLaunchWO = (productId: string, qty: number) => {
    setState((prev) => {
      // Consume Maize (RM001) from Inventory (30,000 KG Maize consumed to make 1,000 bags feed)
      const updatedInventory = prev.inventory.map((item) => {
        if (item.code === "RM001") {
          return { ...item, availableStock: Math.max(0, item.availableStock - 30000) };
        }
        if (item.code === "FG001") {
          return { ...item, availableStock: item.availableStock + qty }; // Broiler Starter stock increases
        }
        return item;
      });

      // Update work order state
      const updatedWOs = prev.workOrders.map((wo) =>
        wo.productCode === productId
          ? { ...wo, status: "Completed" as const, producedQty: qty, materialIssued: true }
          : wo
      );

      // Inventory valuations update
      const costValue = 30000 * 35; // Valuation details
      const updatedLedger = prev.ledger.map((acc) => {
        if (acc.code === "1300") {
          return { ...acc, balance: Math.max(0, acc.balance - costValue) }; // RM asset decreases
        }
        if (acc.code === "1310") {
          return { ...acc, balance: acc.balance + costValue }; // FG asset increases
        }
        return acc;
      });

      const logs = [
        {
          timestamp: "2026-07-26 18:48",
          user: "Sultana Begum",
          action: "Factory Milling Complete",
          details: `WO24001 finished. 30,000 KG Maize milled and consumed. 1,000 Bags Premium Broiler Feed transferred to Gazipur FG Depot.`
        },
        ...prev.activities
      ];

      return {
        ...prev,
        inventory: updatedInventory,
        workOrders: updatedWOs,
        ledger: updatedLedger,
        activities: logs,
        currentDemoStep: prev.currentDemoStep === 9 ? 10 : prev.currentDemoStep
      };
    });
  };

  // Step 10: Dispatch Sales Order (Logistics scheduler)
  const handleDispatchSalesOrder = (id: string) => {
    setState((prev) => {
      const so = prev.salesOrders.find((s) => s.id === id) || prev.salesOrders[0];

      const updatedSO = prev.salesOrders.map((s) =>
        s.id === id ? { ...s, deliveryStatus: "Delivered" as const } : s
      );

      // Trip departs
      const updatedTrips = prev.trips.map((t) =>
        t.tripNumber === "TRIP-0492" ? { ...t, status: "Delivered" as const } : t
      );

      const logs = [
        {
          timestamp: "2026-07-26 18:49",
          user: "Tareq Anis",
          action: "Sales Shipment Delivered",
          details: `SO-2026-0152 flatbed flat-dispatched. Delivered 500 Bags of feed to Kazi Farms.`
        },
        ...prev.activities
      ];

      return {
        ...prev,
        salesOrders: updatedSO,
        trips: updatedTrips,
        activities: logs,
        currentDemoStep: prev.currentDemoStep === 10 ? 11 : prev.currentDemoStep
      };
    });
  };

  // Step 11: Collect payment & post ledger
  const handlePostCollection = (id: string) => {
    setState((prev) => {
      const so = prev.salesOrders.find((s) => s.id === id) || prev.salesOrders[0];

      const updatedSO = prev.salesOrders.map((s) =>
        s.id === id ? { ...s, status: DocStatus.COLLECTED } : s
      );

      // Cash Increases, receivables decrease
      const updatedLedger = prev.ledger.map((acc) => {
        if (acc.code === "1010") {
          return { ...acc, balance: acc.balance + so.totalAmount }; // Cash in Bank increases
        }
        if (acc.code === "1200") {
          return { ...acc, balance: Math.max(0, acc.balance - so.totalAmount) }; // AR decreases
        }
        return acc;
      });

      const newJournal = {
        id: `jv-${Date.now()}`,
        voucherNo: "JV-2026-0743",
        date: "2026-07-26",
        description: "Distributor collection posted (SO-2026-0152)",
        lines: [
          { accountCode: "1010", accountName: "Bank Asia General A/C", debit: so.totalAmount, credit: 0 },
          { accountCode: "1200", accountName: "Accounts Receivable", debit: 0, credit: so.totalAmount }
        ]
      };

      const logs = [
        {
          timestamp: "2026-07-26 18:50",
          user: "Ahsan Rahman",
          action: "AR Collection Deposited",
          details: `Collected ${CurrencyManager.format(so.totalAmount)} from Kazi Farms. Journal posted.`
        },
        ...prev.activities
      ];

      return {
        ...prev,
        salesOrders: updatedSO,
        ledger: updatedLedger,
        journal: [newJournal, ...prev.journal],
        activities: logs,
        currentDemoStep: 0 // Reset walkthrough to step 1
      };
    });
    if (currentTab !== "dashboard") setCurrentTab("dashboard");
  };

  const handleImportCompleted = (type: "inventory" | "ledger", importedItems: any[]) => {
    setState((prev) => {
      if (type === "inventory") {
        return {
          ...prev,
          inventory: [...importedItems, ...prev.inventory]
        };
      } else {
        return {
          ...prev,
          ledger: [...importedItems, ...prev.ledger]
        };
      }
    });
  };

  // Connect Step execution triggers inside Golden Flow timelines
  const handleExecuteGoldenStep = (stepIdx: number) => {
    switch (stepIdx) {
      case 0:
        handleSetForecast(1000);
        break;
      case 1:
        handleRunMRP();
        break;
      case 2:
        handleRaisePR("RM001", 20000);
        break;
      case 3:
        handleApprovePR(state.requisitions[0].id);
        break;
      case 4:
        handleRaiseRFQ("PR-2026-0041");
        break;
      case 5:
        handleAwardSupplier("RFQ-2026-0012", "SUP001");
        break;
      case 6:
        handleApprovePO(state.purchaseOrders[0].id);
        break;
      case 7:
        handlePostGRN(state.purchaseOrders[0].poNumber, [
          { itemCode: "RM001", itemName: "Maize (Yellow Grade A)", qty: 20000, uom: "KG" }
        ]);
        break;
      case 8:
        handleVerifyInventory();
        break;
      case 9:
        handleLaunchWO("FG001", 1000);
        break;
      case 10:
        handleDispatchSalesOrder(state.salesOrders[0].id);
        break;
      case 11:
        handlePostCollection(state.salesOrders[0].id);
        break;
    }
  };

  // Global search keywords action mapping
  const getFilteredSearchResults = () => {
    if (!globalSearchQuery.trim()) return [];
    const query = globalSearchQuery.toLowerCase();
    const results = [];

    // Search Suppliers
    state.suppliers.forEach((s) => {
      if (s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)) {
        results.push({ category: "Supplier", name: s.name, details: `Code: ${s.code} | Rating: ★${s.rating}`, action: () => { setCurrentTab("procurement"); setSearchOpen(false); } });
      }
    });

    // Search Inventory
    state.inventory.forEach((i) => {
      if (i.name.toLowerCase().includes(query) || i.code.toLowerCase().includes(query)) {
        results.push({ category: "Inventory Item", name: i.name, details: `Stock: ${i.availableStock} ${i.uom}`, action: () => { setCurrentTab("inventory"); setSearchOpen(false); } });
      }
    });

    // Search PO
    state.purchaseOrders.forEach((po) => {
      if (po.poNumber.toLowerCase().includes(query) || po.supplierName.toLowerCase().includes(query)) {
        results.push({ category: "Purchase Order", name: po.poNumber, details: `Supplier: ${po.supplierName} | ${CurrencyManager.format(po.totalAmount)}`, action: () => { setCurrentTab("procurement"); setSearchOpen(false); } });
      }
    });

    // Search Sales
    state.salesOrders.forEach((so) => {
      if (so.orderNumber.toLowerCase().includes(query) || so.customerName.toLowerCase().includes(query)) {
        results.push({ category: "Sales Order", name: so.orderNumber, details: `Customer: ${so.customerName} | ${CurrencyManager.format(so.totalAmount)}`, action: () => { setCurrentTab("sales"); setSearchOpen(false); } });
      }
    });

    return results;
  };

  // Header quick action dispatcher
  const handleQuickAction = (action: string) => {
    if (action === "create_pr") {
      handleRaisePR("RM001", 20000);
    } else if (action === "create_rfq") {
      handleRaiseRFQ("PR-2026-0041");
    } else if (action === "create_po") {
      handleAwardSupplier("RFQ-2026-0012", "SUP001");
    } else if (action === "issue_wo") {
      handleLaunchWO("FG001", 1000);
    } else if (action === "create_so") {
      setState((prev) => {
        const newSO = {
          id: `so-${Date.now()}`,
          orderNumber: `SO-2026-${Math.floor(Math.random() * 900) + 100}`,
          customerName: "Kazi Farms Group",
          customerCode: "CUST001",
          orderDate: new Date().toISOString().split('T')[0],
          items: [{ productCode: "FG001", productName: "Poultry Feed (Premium)", qty: 500, uom: "Bags", unitPrice: 2200, totalPrice: 1100000 }],
          totalAmount: 1100000,
          status: DocStatus.PENDING,
          deliveryStatus: "Pending" as const
        };
        return {
          ...prev,
          salesOrders: [newSO, ...prev.salesOrders],
          notifications: [
            { id: `notif-${Date.now()}`, title: "New Sales Order Registered", message: `SO for Kazi Farms of ${CurrencyManager.format(1100000)} has been created.`, time: "Just Now", category: "System" as const, read: false },
            ...prev.notifications
          ]
        };
      });
    } else if (action === "approve_all_cfo") {
      setState((prev) => {
        const approvedReqs = prev.requisitions.map((r) => ({ ...r, status: DocStatus.APPROVED }));
        const approvedPOs = prev.purchaseOrders.map((p) => ({ ...p, approvalStatus: DocStatus.APPROVED }));
        return {
          ...prev,
          requisitions: approvedReqs,
          purchaseOrders: approvedPOs,
          notifications: [
            { id: `notif-${Date.now()}`, title: "All Requisitions & POs Approved", message: "CFO bulk approval successfully applied across SCM pipeline.", time: "Just Now", category: "Approval" as const, read: false },
            ...prev.notifications
          ]
        };
      });
    } else if (action === "financial_report_cfo") {
      setCurrentTab("finance");
      setState((prev) => ({
        ...prev,
        notifications: [
          { id: `notif-${Date.now()}`, title: "Financial Dashboard Loaded", message: "Analytical models and ledger account valuations are ready.", time: "Just Now", category: "Finance" as const, read: false },
          ...prev.notifications
        ]
      }));
    } else if (action === "log_stock_intake") {
      setCurrentTab("procurement");
      handlePostGRN("PO-2026-0043", [
        { itemCode: "RM001", itemName: "Maize (Yellow Grade A)", qty: 10000, uom: "KG" }
      ]);
    } else if (action === "physical_audit_warehouse") {
      setState((prev) => ({
        ...prev,
        notifications: [
          { id: `notif-${Date.now()}`, title: "Physical Audit Triggered", message: "Discrepancy logs dispatched to SCM Manager for signature.", time: "Just Now", category: "System" as const, read: false },
          ...prev.notifications
        ]
      }));
    }
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? "dark bg-[#070a13]" : "bg-slate-50"}`}>
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/60 dark:border-white/10 shadow-xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl animate-pulse">
              <Database className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white font-mono tracking-wide">
              {isBangla ? "নিওন ডাটাবেজ সংযুক্ত হচ্ছে..." : "CONNECTING NEON DB"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isBangla 
                ? "ওআইটিএস ঢাকা অ্যাগ্রো ইআরপি ডাটাবেজ সুরক্ষার সাথে সিঙ্ক হচ্ছে।" 
                : "Synchronizing OITS Dhaka Agro ERP records securely with Neon serverless cluster."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Host Engine:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">AWS East-2</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Neon Auth:</span>
              <span className="text-green-600 dark:text-green-400 font-bold">Enabled</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">SSL Channel:</span>
              <span className="text-green-600 dark:text-green-400 font-bold">Require & Bound</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono border-t border-slate-200/50 dark:border-white/5 pt-2">
              <span className="text-slate-400">Status:</span>
              {dbError ? (
                <span className="text-red-500 font-bold truncate max-w-[200px]" title={dbError}>
                  Offline: {dbError}
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 animate-pulse">
                  <Cpu className="h-3 w-3 animate-spin text-indigo-500" />
                  Seeding / Fetching...
                </span>
              )}
            </div>
          </div>

          {dbError && (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold font-mono tracking-wider transition-colors"
            >
              RETRY CONNECTION
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="flex w-full bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-100 transition-colors font-sans antialiased overflow-hidden relative">
        
        {/* Background Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* Left Sidebar */}
        <div className={`relative z-40 flex shrink-0 transition-all duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed lg:static inset-y-0 left-0`}>
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
              setMobileSidebarOpen(false);
            }}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            isBangla={isBangla}
            role={userRole}
            permissions={currentUser?.permissions}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}

        {/* Main content grid */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          
          {/* Header sticky top */}
          <Header
            notifications={state.notifications}
            markNotificationRead={handleMarkNotificationRead}
            isBangla={isBangla}
            setIsBangla={setIsBangla}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            triggerSearchOpen={() => setSearchOpen(true)}
            onQuickAction={handleQuickAction}
            dbConnected={dbConnected}
            onResetDB={handleResetDB}
            role={userRole}
            onChangeRole={(newRole) => {
              setUserRole(newRole);
              if (currentUser) {
                const match = users.find((u) => u.role === newRole);
                if (match) setCurrentUser(match);
              }
            }}
            currency={state.currency || "BDT"}
            onToggleCurrency={(curr) => setState((prev) => ({ ...prev, currency: curr }))}
            onAutoGeneratePreventivePR={handleAutoGeneratePreventivePR}
            currentUser={currentUser}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onOpenRoleManagerModal={() => setRoleManagerOpen(true)}
            onSignOut={handleSignOut}
            toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          {/* Golden Flow Timeline Bar */}
          <GoldenFlow
            currentStep={state.currentDemoStep}
            setCurrentStep={(st) => setState((prev) => ({ ...prev, currentDemoStep: st }))}
            onExecuteStep={handleExecuteGoldenStep}
            isBangla={isBangla}
          />

          {/* Tab/Route View panel */}
          <main className="flex-1 p-3 sm:p-6 overflow-y-auto scrollbar-thin">
            <div className="max-w-7xl mx-auto animate-in fade-in duration-200">
              
              {!hasTabPermission(currentTab) ? (
                <AccessDeniedView
                  requiredPermission={`manage_${currentTab}`}
                  tabTitle={currentTab.toUpperCase()}
                  currentUser={currentUser}
                  onOpenAuthModal={() => setAuthModalOpen(true)}
                  onGoToDashboard={() => setCurrentTab("dashboard")}
                  isBangla={isBangla}
                />
              ) : (
                <>
                  {currentTab === "dashboard" && (
                    <ExecutiveDashboard
                      state={state}
                      onApprovePR={handleApprovePR}
                      onApprovePO={handleApprovePO}
                      isBangla={isBangla}
                      role={userRole}
                      darkMode={darkMode}
                      onNavigateTab={(tab) => setCurrentTab(tab)}
                    />
                  )}

                  {currentTab === "procurement" && (
                    <ProcurementModule
                      state={state}
                      onRaisePR={handleRaisePR}
                      onRaiseRFQ={handleRaiseRFQ}
                      onAwardSupplier={handleAwardSupplier}
                      onPostGRN={handlePostGRN}
                      onApprovePR={handleApprovePR}
                      onBulkApprovePR={handleBulkApprovePR}
                      onApprovePO={handleApprovePO}
                      onLinkInvoiceToGRN={handleLinkInvoiceToGRN}
                      onRevertVersion={handleRevertVersion}
                      isBangla={isBangla}
                      isLoading={isLoading}
                    />
                  )}

                  {currentTab === "production" && (
                    <ProductionModule
                      state={state}
                      onSetForecast={handleSetForecast}
                      onRunMRP={handleRunMRP}
                      onRaisePR={handleRaisePR}
                      onLaunchWO={handleLaunchWO}
                      isBangla={isBangla}
                    />
                  )}

                  {currentTab === "operational_excellence" && (
                    <OperationalExcellence
                      state={state}
                      isBangla={isBangla}
                      darkMode={darkMode}
                    />
                  )}

                  {/* Other modules handles (Inventory, Finance, Sales, etc.) */}
                  {["inventory", "commercial", "sales", "finance", "hr", "logistics", "crm", "support"].includes(currentTab) && (
                    <OtherModules
                      tab={currentTab}
                      state={state}
                      onDispatchSalesOrder={handleDispatchSalesOrder}
                      onPostCollection={handlePostCollection}
                      isBangla={isBangla}
                      onImportCompleted={handleImportCompleted}
                    />
                  )}
                </>
              )}

            </div>
          </main>
        </div>

        {/* AI Co-Pilot chat drawer toggle button */}
        <button
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className="fixed bottom-6 right-6 p-4 bg-indigo-600/90 dark:bg-indigo-500/90 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-110 active:scale-95 group focus-visible:ring-4 focus-visible:ring-indigo-300 border border-white/10"
          aria-label="Toggle AI Co-Pilot"
        >
          <Sparkles className="h-6 w-6 shrink-0 text-yellow-300" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold font-mono tracking-widest pl-1">
            AI CO-PILOT
          </span>
        </button>

        {/* AI Assistant drawer container */}
        {aiAssistantOpen && (
          <div className="fixed inset-y-0 right-0 z-50 flex animate-in slide-in-from-right duration-200">
            {/* Backdrop click closer */}
            <div onClick={() => setAiAssistantOpen(false)} className="bg-black/20 backdrop-blur-xs flex-1 w-screen hidden md:block"></div>
            <AIAssistant
              state={state}
              onExecuteAction={(act, payload) => {
                if (act === "generate_pr") {
                  handleRaisePR(payload.itemCode, payload.qty);
                } else if (act === "approve_pr") {
                  handleApprovePR(payload.id);
                } else if (act === "approve_po") {
                  handleApprovePO(payload.id);
                } else if (act === "next_demo_step") {
                  handleExecuteGoldenStep(state.currentDemoStep);
                }
              }}
              isBangla={isBangla}
            />
          </div>
        )}

        {/* Command palette global search modal */}
        {searchOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-24 z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[400px] animate-in zoom-in-95 duration-100">
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder={isBangla ? "সার্চ কোড, পণ্য বা ভেন্ডর..." : "Type code, vendor, or product name..."}
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 text-xs flex-1"
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-700/60">
                {getFilteredSearchResults().length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs font-medium">
                    {globalSearchQuery ? "No matching records found in ERP ledger." : "Try searching 'Maize', 'SUP001', or 'PO-2026-0092'"}
                  </div>
                ) : (
                  getFilteredSearchResults().map((res, idx) => (
                    <button
                      key={idx}
                      onClick={res.action}
                      className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded mr-2">
                          {res.category}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          <HighlightText text={res.name} query={globalSearchQuery} />
                        </span>
                        <span className="text-slate-400 text-[11px] block mt-0.5">
                          <HighlightText text={res.details} query={globalSearchQuery} />
                        </span>
                      </div>
                      <Command className="h-4 w-4 text-slate-400" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal (Login / Register / Switch Account) */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          isBangla={isBangla}
        />

        {/* RBAC Role & Permission Admin Console */}
        <RoleManagerModal
          isOpen={roleManagerOpen}
          onClose={() => setRoleManagerOpen(false)}
          users={users}
          currentUser={currentUser}
          onUpdateUsers={handleUpdateUsers}
          isBangla={isBangla}
        />

      </div>
    </div>
  );
}
