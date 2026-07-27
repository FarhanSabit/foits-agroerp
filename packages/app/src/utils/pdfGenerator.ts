import jsPDF from "jspdf";

export function generateGRNPdf(grn: {
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  deliveryChallanNo: string;
  qcStatus: string;
  receivedDate: string;
  items: Array<{ itemName: string; qtyReceived: number; uom: string; unitPrice: number }>;
  receivedBy: string;
}) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("OITS DHAKA AGRO ERP", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL GOODS RECEIPT NOTE (GRN)", 14, 27);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 27);

  // Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 36, 3, 3, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`GRN Number: ${grn.grnNumber}`, 20, 52);
  doc.text(`PO Reference: ${grn.poNumber}`, 20, 60);
  doc.text(`Supplier: ${grn.supplierName}`, 20, 68);

  doc.text(`Challan No: ${grn.deliveryChallanNo}`, 110, 52);
  doc.text(`QC Status: ${grn.qcStatus}`, 110, 60);
  doc.text(`Received Date: ${grn.receivedDate}`, 110, 68);

  // Table Headers
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.rect(14, 85, 182, 10, "F");
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ITEM DESCRIPTION", 20, 91.5);
  doc.text("QTY RECEIVED", 100, 91.5);
  doc.text("UOM", 135, 91.5);
  doc.text("EST. VALUE (BDT)", 160, 91.5);

  let y = 102;
  let totalVal = 0;
  grn.items.forEach((item) => {
    const itemVal = item.qtyReceived * (item.unitPrice || 42);
    totalVal += itemVal;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(item.itemName, 20, y);
    doc.text(item.qtyReceived.toLocaleString(), 100, y);
    doc.text(item.uom, 135, y);
    doc.text(`BDT ${itemVal.toLocaleString()}`, 160, y);
    y += 8;
  });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, 196, y + 2);

  // Total Summary
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Total Value:", 120, y + 10);
  doc.text(`BDT ${totalVal.toLocaleString()}`, 160, y + 10);

  // Footer Signatures
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Received & Audited By: ${grn.receivedBy}`, 14, 270);

  if ((grn as any).signatureUrl) {
    try {
      doc.addImage((grn as any).signatureUrl, "PNG", 125, 245, 45, 18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`Signed by ${(grn as any).signedBy || "Manager"} on ${(grn as any).signedDate || "Today"}`, 110, 266);
    } catch (e) {
      console.warn("Could not render signature on PDF", e);
    }
  }
  doc.text("Authorized Store In-charge Signature: _______________________", 100, 270);

  doc.save(`GRN_${grn.grnNumber}.pdf`);
}

export function generateSOPdf(so: {
  orderNumber: string;
  customerName: string;
  date: string;
  productName: string;
  quantity: number;
  totalCost: number;
  status: string;
  signatureUrl?: string;
  signedBy?: string;
  signedDate?: string;
}) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("OITS DHAKA AGRO ERP", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL SALES ORDER INVOICE", 14, 27);

  doc.setTextColor(224, 231, 255);
  doc.setFontSize(9);
  doc.text(`Date: ${so.date}`, 150, 27);

  // Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 32, 3, 3, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Sales Order #: ${so.orderNumber}`, 20, 52);
  doc.text(`Customer Name: ${so.customerName}`, 20, 60);

  doc.text(`Order Status: ${so.status}`, 120, 52);
  doc.text(`Authorized By: Commercial Sales Dept`, 120, 60);

  // Table
  doc.setFillColor(238, 242, 255);
  doc.rect(14, 82, 182, 10, "F");
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PRODUCT DETAILS", 20, 88.5);
  doc.text("QUANTITY", 100, 88.5);
  doc.text("UNIT PRICE", 135, 88.5);
  doc.text("TOTAL AMOUNT", 165, 88.5);

  const unitPrice = so.quantity > 0 ? so.totalCost / so.quantity : 0;
  let y = 98;
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(so.productName, 20, y);
  doc.text(so.quantity.toLocaleString(), 100, y);
  doc.text(`BDT ${unitPrice.toFixed(0)}`, 135, y);
  doc.text(`BDT ${so.totalCost.toLocaleString()}`, 165, y);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 6, 196, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total Payable:", 115, y + 14);
  doc.text(`BDT ${so.totalCost.toLocaleString()}`, 165, y + 14);

  // Footer Signatures
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("OITS Dhaka Commercial Sales Desk - System Generated Order", 14, 270);

  if (so.signatureUrl) {
    try {
      doc.addImage(so.signatureUrl, "PNG", 125, 245, 45, 18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`E-Signed by ${so.signedBy || "Manager"} on ${so.signedDate || "Today"}`, 110, 266);
    } catch (e) {
      console.warn("Could not render signature on PDF", e);
    }
  }
  doc.text("Customer Stamp / Signature: _______________________", 100, 270);

  doc.save(`SalesOrder_${so.orderNumber}.pdf`);
}

export function downloadGRNPDF(grn: any, isBangla?: boolean) {
  generateGRNPdf({
    grnNumber: grn.grnNumber || "GRN-2026-001",
    poNumber: grn.poNumber || "PO-2026-001",
    supplierName: grn.supplierName || "Default Supplier",
    deliveryChallanNo: grn.deliveryChallanNo || "CH-98765",
    qcStatus: grn.items?.[0]?.qcPassed ? "QC PASSED" : "QC PENDING",
    receivedDate: grn.receivedDate || new Date().toISOString().split("T")[0],
    items: (grn.items || []).map((i: any) => ({
      itemName: i.itemName || i.itemCode || "Raw Material Item",
      qtyReceived: i.receivedQty || i.qty || 100,
      uom: i.uom || "MT",
      unitPrice: i.unitPrice || 45000
    })),
    receivedBy: grn.receivedBy || "Store Manager",
    signatureUrl: grn.signatureUrl,
    signedBy: grn.signedBy,
    signedDate: grn.signedDate
  } as any);
}

export function downloadSOPDF(so: any, isBangla?: boolean) {
  generateSOPdf({
    orderNumber: so.orderNumber || so.id || "SO-2026-001",
    customerName: so.customerName || "Agro Dealer Enterprise",
    date: so.date || new Date().toISOString().split("T")[0],
    productName: so.productName || so.items?.[0]?.productName || "NPK Fertilizer 50kg Bags",
    quantity: so.quantity || so.items?.[0]?.qty || 500,
    totalCost: so.totalCost || so.totalAmount || 1250000,
    status: so.status || "CONFIRMED",
    signatureUrl: so.signatureUrl,
    signedBy: so.signedBy,
    signedDate: so.signedDate
  });
}

export const downloadSalesOrderPDF = downloadSOPDF;

