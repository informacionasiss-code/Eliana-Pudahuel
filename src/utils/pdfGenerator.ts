import { jsPDF } from "jspdf";
import "jspdf-autotable";
import type { Client, ClientMovement, PaymentSchedule } from "../types";

declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: AutoTableOptions) => jsPDF;
        lastAutoTable: { finalY: number };
    }
}

interface AutoTableOptions {
    head?: string[][];
    body?: (string | number)[][];
    startY?: number;
    theme?: "striped" | "grid" | "plain";
    headStyles?: Record<string, unknown>;
    bodyStyles?: Record<string, unknown>;
    columnStyles?: Record<number, Record<string, unknown>>;
    margin?: { left?: number; right?: number };
    tableWidth?: "auto" | "wrap" | number;
    styles?: Record<string, unknown>;
    alternateRowStyles?: Record<string, unknown>;
    foot?: string[][];
    footStyles?: Record<string, unknown>;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getPaymentScheduleLabel = (schedule?: PaymentSchedule): string => {
    switch (schedule) {
        case "biweekly": return "Quincenal";
        case "monthly": return "Fin de Mes";
        case "immediate":
        default: return "Inmediato";
    }
};

interface ClientReportOptions {
    client: Client;
    movements: ClientMovement[];
    dateFrom?: Date | null;
    dateTo?: Date | null;
    storeName?: string;
}

export const generateClientReport = ({
    client,
    movements,
    dateFrom,
    dateTo,
    storeName = "Minimarket Eliana Pudahuel"
}: ClientReportOptions): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header con gradiente simulado
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFillColor(55, 48, 163);
    doc.rect(0, 35, pageWidth, 5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(storeName, 14, 18);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("📋 ESTADO DE CUENTA - CLIENTE FIADO", 14, 30);

    doc.setFontSize(9);
    doc.text(`Generado: ${formatDateTime(new Date().toISOString())}`, pageWidth - 60, 15);

    if (dateFrom || dateTo) {
        const fromStr = dateFrom ? formatDate(dateFrom.toISOString()) : "Inicio";
        const toStr = dateTo ? formatDate(dateTo.toISOString()) : "Hoy";
        doc.text(`Período: ${fromStr} - ${toStr}`, pageWidth - 60, 23);
    }

    let yPos = 55;

    // Info del cliente - tarjeta estilizada
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, yPos - 5, pageWidth - 28, 45, 4, 4, "FD");

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(client.name, 20, yPos + 8);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const col1X = 20;
    const col2X = pageWidth / 2 + 10;

    doc.text(`Límite de Crédito: ${formatCurrency(client.limit)}`, col1X, yPos + 20);
    doc.text(`Modalidad: ${getPaymentScheduleLabel(client.payment_schedule)}`, col1X, yPos + 30);
    doc.text(`Estado: ${client.authorized ? "✅ Autorizado" : "❌ Bloqueado"}`, col2X, yPos + 20);

    // Saldo destacado
    doc.setFillColor(client.balance > 0 ? 254 : 220, client.balance > 0 ? 226 : 252, client.balance > 0 ? 226 : 231);
    doc.roundedRect(col2X - 5, yPos + 24, 70, 14, 2, 2, "F");
    doc.setTextColor(client.balance > 0 ? 185 : 22, client.balance > 0 ? 28 : 101, client.balance > 0 ? 28 : 52);
    doc.setFont("helvetica", "bold");
    doc.text(`Saldo: ${formatCurrency(client.balance)}`, col2X, yPos + 33);

    yPos += 55;

    // Resumen estadístico
    const totalConsumos = movements.filter(m => m.type === "fiado").reduce((s, m) => s + m.amount, 0);
    const totalAbonos = movements.filter(m => m.type !== "fiado").reduce((s, m) => s + m.amount, 0);
    const numCompras = movements.filter(m => m.type === "fiado").length;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("📊 RESUMEN DEL PERÍODO", 14, yPos);
    yPos += 8;

    const boxW = (pageWidth - 42) / 3;

    // Box 1 - Consumos
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(14, yPos, boxW, 28, 3, 3, "F");
    doc.setTextColor(127, 29, 29);
    doc.setFontSize(9);
    doc.text("Total Consumos", 14 + boxW / 2, yPos + 10, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(totalConsumos), 14 + boxW / 2, yPos + 21, { align: "center" });

    // Box 2 - Abonos
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(21 + boxW, yPos, boxW, 28, 3, 3, "F");
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Total Abonos", 21 + boxW + boxW / 2, yPos + 10, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(totalAbonos), 21 + boxW + boxW / 2, yPos + 21, { align: "center" });

    // Box 3 - Compras
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(28 + boxW * 2, yPos, boxW, 28, 3, 3, "F");
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("N° de Compras", 28 + boxW * 2 + boxW / 2, yPos + 10, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(String(numCompras), 28 + boxW * 2 + boxW / 2, yPos + 21, { align: "center" });

    yPos += 40;

    // Tabla de movimientos
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("📝 DETALLE DE MOVIMIENTOS", 14, yPos);
    yPos += 5;

    if (movements.length === 0) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("No hay movimientos en el período seleccionado.", 14, yPos + 10);
    } else {
        const tableData = movements.map(m => [
            formatDateTime(m.created_at),
            m.type === "fiado" ? "🔴 Compra" : m.type === "abono" ? "🟢 Abono" : "🟢 Pago Total",
            m.description || "-",
            m.type === "fiado" ? `+${formatCurrency(m.amount)}` : `-${formatCurrency(m.amount)}`
        ]);

        doc.autoTable({
            head: [["Fecha", "Tipo", "Descripción", "Monto"]],
            body: tableData,
            foot: [[
                "",
                "",
                "SALDO PENDIENTE:",
                formatCurrency(client.balance)
            ]],
            startY: yPos,
            theme: "striped",
            headStyles: {
                fillColor: [30, 58, 138],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 9,
                halign: "center"
            },
            bodyStyles: { fontSize: 8 },
            footStyles: {
                fillColor: [254, 243, 199],
                textColor: [146, 64, 14],
                fontStyle: "bold",
                fontSize: 10
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 28 },
                2: { cellWidth: "auto" },
                3: { cellWidth: 32, halign: "right" }
            },
            margin: { left: 14, right: 14 },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${i} de ${pageCount} • ${storeName} • Documento generado automáticamente`, pageWidth / 2, pageHeight - 6, { align: "center" });
    }

    const fileName = `estado_cuenta_${client.name.replace(/\s+/g, "_").toLowerCase()}_${formatDate(new Date().toISOString()).replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
};

interface SummaryReportOptions {
    clients: Client[];
    dateFrom?: Date | null;
    dateTo?: Date | null;
    storeName?: string;
}

export const generateSummaryReport = ({
    clients,
    dateFrom,
    dateTo,
    storeName = "Minimarket Eliana Pudahuel"
}: SummaryReportOptions): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header profesional
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 42, "F");
    doc.setFillColor(55, 48, 163);
    doc.rect(0, 37, pageWidth, 5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(storeName, 14, 18);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("📊 REPORTE GENERAL DE DEUDAS", 14, 32);

    doc.setFontSize(9);
    doc.text(`Generado: ${formatDateTime(new Date().toISOString())}`, pageWidth - 55, 15);
    if (dateFrom || dateTo) {
        const fromStr = dateFrom ? formatDate(dateFrom.toISOString()) : "Inicio";
        const toStr = dateTo ? formatDate(dateTo.toISOString()) : "Hoy";
        doc.text(`Período: ${fromStr} - ${toStr}`, pageWidth - 55, 24);
    }

    let yPos = 55;

    // Métricas principales
    const totalDebt = clients.reduce((s, c) => s + c.balance, 0);
    const clientsWithDebt = clients.filter(c => c.balance > 0);
    const avgDebt = clientsWithDebt.length > 0 ? totalDebt / clientsWithDebt.length : 0;
    const maxDebt = Math.max(...clients.map(c => c.balance), 0);
    const totalLimit = clients.reduce((s, c) => s + c.limit, 0);
    const utilizationRate = totalLimit > 0 ? (totalDebt / totalLimit) * 100 : 0;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("📈 MÉTRICAS PRINCIPALES", 14, yPos);
    yPos += 8;

    const mBoxW = (pageWidth - 56) / 4;

    // Deuda Total
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(14, yPos, mBoxW, 30, 3, 3, "F");
    doc.setTextColor(127, 29, 29);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("DEUDA TOTAL", 14 + mBoxW / 2, yPos + 10, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(totalDebt), 14 + mBoxW / 2, yPos + 22, { align: "center" });

    // Clientes con Deuda
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(21 + mBoxW, yPos, mBoxW, 30, 3, 3, "F");
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("CON DEUDA", 21 + mBoxW + mBoxW / 2, yPos + 10, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${clientsWithDebt.length} / ${clients.length}`, 21 + mBoxW + mBoxW / 2, yPos + 22, { align: "center" });

    // Promedio
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(28 + mBoxW * 2, yPos, mBoxW, 30, 3, 3, "F");
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("PROMEDIO", 28 + mBoxW * 2 + mBoxW / 2, yPos + 10, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(avgDebt), 28 + mBoxW * 2 + mBoxW / 2, yPos + 22, { align: "center" });

    // Utilización
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(35 + mBoxW * 3, yPos, mBoxW, 30, 3, 3, "F");
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("UTILIZACIÓN", 35 + mBoxW * 3 + mBoxW / 2, yPos + 10, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${utilizationRate.toFixed(1)}%`, 35 + mBoxW * 3 + mBoxW / 2, yPos + 22, { align: "center" });

    yPos += 45;

    // Top 5 Deudores
    if (clientsWithDebt.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("🔝 TOP 5 MAYORES DEUDORES", 14, yPos);
        yPos += 5;

        const top5 = [...clientsWithDebt].sort((a, b) => b.balance - a.balance).slice(0, 5);
        const topData = top5.map((c, i) => [
            `${i + 1}°`,
            c.name,
            c.authorized ? "✅" : "❌",
            getPaymentScheduleLabel(c.payment_schedule),
            formatCurrency(c.limit),
            formatCurrency(c.balance),
            `${((c.balance / c.limit) * 100).toFixed(0)}%`
        ]);

        doc.autoTable({
            head: [["#", "Cliente", "Estado", "Modalidad", "Límite", "Deuda", "Uso"]],
            body: topData,
            startY: yPos,
            theme: "striped",
            headStyles: {
                fillColor: [185, 28, 28],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 9
            },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 12, halign: "center" },
                1: { cellWidth: "auto" },
                2: { cellWidth: 18, halign: "center" },
                3: { cellWidth: 28 },
                4: { cellWidth: 28, halign: "right" },
                5: { cellWidth: 28, halign: "right" },
                6: { cellWidth: 18, halign: "center" }
            },
            margin: { left: 14, right: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 12;
    }

    // Tabla completa
    if (yPos + 50 > pageHeight) {
        doc.addPage();
        yPos = 20;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("📋 LISTADO COMPLETO DE CLIENTES", 14, yPos);
    yPos += 5;

    const allData = clients.map(c => [
        c.name,
        c.authorized ? "✅" : "❌",
        getPaymentScheduleLabel(c.payment_schedule),
        formatCurrency(c.limit),
        formatCurrency(c.balance),
        c.balance > 0 ? `${((c.balance / c.limit) * 100).toFixed(0)}%` : "-"
    ]);

    doc.autoTable({
        head: [["Cliente", "Estado", "Modalidad", "Límite", "Saldo", "Uso"]],
        body: allData,
        foot: [[
            `TOTAL: ${clients.length} clientes`,
            `${clients.filter(c => c.authorized).length} activos`,
            "",
            formatCurrency(totalLimit),
            formatCurrency(totalDebt),
            `${utilizationRate.toFixed(1)}%`
        ]],
        startY: yPos,
        theme: "striped",
        headStyles: {
            fillColor: [71, 85, 105],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 9
        },
        bodyStyles: { fontSize: 8 },
        footStyles: {
            fillColor: [30, 58, 138],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: 20, halign: "center" },
            2: { cellWidth: 30 },
            3: { cellWidth: 28, halign: "right" },
            4: { cellWidth: 28, halign: "right" },
            5: { cellWidth: 20, halign: "center" }
        },
        margin: { left: 14, right: 14 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${i} de ${pageCount} • ${storeName} • Reporte Confidencial`, pageWidth / 2, pageHeight - 6, { align: "center" });
    }

    const fileName = `reporte_deudas_${formatDate(new Date().toISOString()).replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
};
