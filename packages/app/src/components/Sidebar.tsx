import React from "react";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Factory,
  Globe,
  ShoppingBag,
  Landmark,
  UserRound,
  Truck,
  MessageCircle,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isBangla: boolean;
  role: string;
  permissions?: string[];
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  isBangla,
  role,
  permissions
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", labelEn: "Executive Dashboard", labelBn: "নির্বাহী ড্যাশবোর্ড", icon: BarChart3, perm: "view_dashboard" },
    { id: "procurement", labelEn: "Procurement (SCM)", labelBn: "ক্রয় ও সরবরাহ", icon: ShoppingCart, perm: "manage_procurement" },
    { id: "inventory", labelEn: "Inventory (Stock)", labelBn: "ইনভেন্টরি ও মজুদ", icon: Package, perm: "manage_inventory" },
    { id: "production", labelEn: "Production & MRP", labelBn: "উৎপাদন ও এমআরপি", icon: Factory, perm: "manage_production" },
    { id: "commercial", labelEn: "Commercial & LC", labelBn: "বাণিজ্যিক ও এলসি", icon: Globe, perm: "manage_commercial" },
    { id: "sales", labelEn: "Sales & Distribution", labelBn: "বিক্রয় ও বিতরণ", icon: ShoppingBag, perm: "manage_sales" },
    { id: "finance", labelEn: "Finance & Ledger", labelBn: "অর্থ ও খতিয়ান", icon: Landmark, perm: "manage_finance" },
    { id: "hr", labelEn: "HR & Payroll", labelBn: "এইচআর ও পে-রোল", icon: UserRound, perm: "manage_hr" },
    { id: "logistics", labelEn: "Logistics & Fleet", labelBn: "পরিবহন ও বহর", icon: Truck, perm: "manage_logistics" },
    { id: "crm", labelEn: "CRM & Customers", labelBn: "সিআরএম ও কাস্টমার", icon: MessageCircle, perm: "manage_crm" },
    { id: "support", labelEn: "Support & Tickets", labelBn: "সহায়তা ও টিকিট", icon: HelpCircle, perm: "manage_support" },
    { id: "operational_excellence", labelEn: "Operational Excellence", labelBn: "কার্যকরী উৎকর্ষ", icon: Sparkles, perm: "view_dashboard" }
  ];

  // Limit visibility based on user role or granular permissions
  const filteredMenuItems = menuItems.filter((item) => {
    if (permissions && permissions.length > 0) {
      if (role === "CFO") return true;
      return permissions.includes(item.perm);
    }
    if (role === "SCM Manager") {
      return !["finance", "hr", "crm"].includes(item.id);
    }
    if (role === "Warehouse Admin") {
      return !["finance", "hr", "crm", "commercial", "procurement", "sales", "operational_excellence"].includes(item.id);
    }
    if (role === "Sales Officer") {
      return ["dashboard", "sales", "crm", "support"].includes(item.id);
    }
    if (role === "Finance Officer") {
      return ["dashboard", "finance", "commercial", "procurement", "support"].includes(item.id);
    }
    return true; // CFO / Admin
  });

  return (
    <aside
      id="erp-sidebar"
      className={`glass-sidebar text-slate-800 dark:text-slate-100 flex flex-col transition-all duration-300 h-screen sticky top-0 z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="p-2 bg-indigo-600/90 rounded-lg text-white shrink-0">
              <Factory className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-md leading-none text-slate-900 dark:text-white">AGRO ERP</span>
              <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 tracking-widest uppercase">
                OITS Dhaka
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="p-2 bg-indigo-600/90 rounded-lg text-white mx-auto">
            <Factory className="h-5 w-5" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none transition-colors cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left text-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none cursor-pointer ${
                isActive
                  ? "bg-indigo-600/90 dark:bg-indigo-500/90 text-white font-semibold shadow-lg shadow-indigo-500/15 border border-white/10"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/5"
              }`}
              title={collapsed ? (isBangla ? item.labelBn : item.labelEn) : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white"}`} />
              {!collapsed && (
                <span className="truncate transition-opacity duration-200">
                  {isBangla ? item.labelBn : item.labelEn}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-slate-200/50 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
        {!collapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="font-mono truncate">DB: PostgreSQL Online</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 justify-between">
              <span>VER 1.0.0</span>
              <span>OITS DHAKA</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
}
