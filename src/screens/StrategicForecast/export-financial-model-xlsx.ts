// ─────────────────────────────────────────────────────────────────────
// Strategic Forecast — Excel Export (browser, ExcelJS)
//
// Premium-clean .xlsx export of the live FinancialModelBundle. Reads
// row.values directly from the on-page audit model — never recomputes.
// One sheet ("Strategic Model") with dark title bar, champagne year
// bands, subtle section dividers, frozen panes, and number formats.
// ─────────────────────────────────────────────────────────────────────

import type { FinancialModelBundle, FinancialModelRow } from "./financial-model-rows";

// ── Public constants ────────────────────────────────────────────────

const SHEET_NAME = "Strategic Model";
const FILE_NAME = "spectra-strategic-financial-model-72-months.xlsx";
const EXPECTED_MONTHS = 72;
const META_COL_COUNT = 3;
const TOTAL_COLS = META_COL_COUNT + EXPECTED_MONTHS;

const NUM_FORMAT_CURRENCY = '"$"#,##0;[Red]("$"#,##0);"-"';
const NUM_FORMAT_NUMBER = '#,##0;[Red](#,##0);"-"';
const NUM_FORMAT_PERCENT = "0.0%";

const C = {
  titleBg: "FF1A1A1A",
  titleText: "FFFFFFFF",
  titleAccent: "FFEAB776",
  subtitleBg: "FFEFE7DC",
  subtitleText: "FF1A1A1A",
  yearBandLabelBg: "FFFAFAF8",
  yearBandLabelText: "FF1A1A1A",
  yearBandPrimaryBg: "FFF7E6C8",
  yearBandAltBg: "FFFFF6E8",
  yearBandText: "FF8A6540",
  colHeaderBg: "FFFAFAF8",
  colHeaderText: "FF333333",
  colHeaderSub: "FF888888",
  sectionBg: "FFF3F0E9",
  sectionText: "FF8A6540",
  emphasizeBg: "FFFFF6E8",
  emphasizeText: "FF1A1A1A",
  rowEvenBg: "FFFCFBF8",
  rowOddBg: "FFFFFFFF",
  metaText: "FF666666",
  metricText: "FF1A1A1A",
  borderSoft: "FFE6DED2",
  borderHeavy: "FFB18059",
  footerBg: "FFFAFAF8",
  footerText: "FF888888",
};

// Required emphasized metrics — used as a structural sanity check.
const REQUIRED_EMPHASIZED = [
  "Ending subscribers",
  "Recurring revenue (MRR)",
  "Total revenue",
  "EBITDA",
  "Cash balance",
];

// ── Public API ──────────────────────────────────────────────────────

export async function exportFinancialModelToXlsx(model: FinancialModelBundle): Promise<void> {
  validateModel(model);

  const ExcelJSMod = await import("exceljs");
  const ExcelJS: typeof import("exceljs") =
    (ExcelJSMod as { default?: typeof import("exceljs") }).default ?? ExcelJSMod;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Spectra";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", xSplit: META_COL_COUNT, ySplit: 4 }],
  });

  const monthLabels = model.forecast.monthLabels.slice(0, EXPECTED_MONTHS);

  setColumnWidths(sheet);
  buildTitleRow(sheet);
  buildSubtitleRow(sheet);
  buildYearBandRow(sheet, monthLabels);
  buildColumnHeaderRow(sheet, monthLabels);
  buildBody(sheet, model.rows);
  buildFooter(sheet);

  await downloadWorkbook(workbook);
}

// ── Validation ──────────────────────────────────────────────────────

function validateModel(model: FinancialModelBundle): void {
  if (!model || !Array.isArray(model.rows) || model.rows.length === 0) {
    throw new Error("Excel export aborted: model has no rows.");
  }
  const monthLabels = model.forecast?.monthLabels ?? [];
  if (monthLabels.length < EXPECTED_MONTHS) {
    throw new Error(
      `Excel export aborted: expected ${EXPECTED_MONTHS} month labels, got ${monthLabels.length}.`,
    );
  }
  for (const row of model.rows) {
    if (!Array.isArray(row.values) || row.values.length < EXPECTED_MONTHS) {
      throw new Error(
        `Excel export aborted: "${row.metric}" has ${row.values?.length ?? 0} values; expected ≥${EXPECTED_MONTHS}.`,
      );
    }
  }
  const emphasizedMetrics = new Set(
    model.rows.filter((r) => r.emphasize).map((r) => r.metric),
  );
  for (const required of REQUIRED_EMPHASIZED) {
    if (!emphasizedMetrics.has(required)) {
      throw new Error(`Excel export aborted: missing required emphasized row "${required}".`);
    }
  }
}

// ── Layout helpers ──────────────────────────────────────────────────

function fill(argb: string) {
  return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb } };
}

function softBorder() {
  return {
    top: { style: "thin" as const, color: { argb: C.borderSoft } },
    bottom: { style: "thin" as const, color: { argb: C.borderSoft } },
    left: { style: "thin" as const, color: { argb: C.borderSoft } },
    right: { style: "thin" as const, color: { argb: C.borderSoft } },
  };
}

function setColumnWidths(sheet: import("exceljs").Worksheet): void {
  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 36;
  sheet.getColumn(3).width = 50;
  for (let c = 4; c <= TOTAL_COLS; c++) {
    sheet.getColumn(c).width = 13;
  }
}

// ── Header rows ─────────────────────────────────────────────────────

function buildTitleRow(sheet: import("exceljs").Worksheet): void {
  const row = sheet.getRow(1);
  row.height = 36;
  sheet.mergeCells(1, 1, 1, TOTAL_COLS);
  const cell = sheet.getCell(1, 1);
  cell.value = {
    richText: [
      { text: "SPECTRA", font: { name: "Helvetica Neue", size: 16, bold: true, color: { argb: C.titleAccent } } },
      { text: "    ·    ", font: { name: "Helvetica Neue", size: 16, color: { argb: "FF888888" } } },
      { text: "72-Month Strategic Financial Model", font: { name: "Helvetica Neue", size: 16, color: { argb: C.titleText } } },
    ],
  };
  cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  cell.fill = fill(C.titleBg);
}

function buildSubtitleRow(sheet: import("exceljs").Worksheet): void {
  const row = sheet.getRow(2);
  row.height = 20;
  sheet.mergeCells(2, 1, 2, TOTAL_COLS);
  const cell = sheet.getCell(2, 1);
  cell.value =
    "Live audit-layer export. Every monthly cell is read directly from the on-page model — no parallel calculation. Scenario based on current assumptions; not a guarantee of future performance.";
  cell.font = { name: "Helvetica Neue", size: 10, italic: true, color: { argb: C.subtitleText } };
  cell.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: false };
  cell.fill = fill(C.subtitleBg);
}

function buildYearBandRow(sheet: import("exceljs").Worksheet, monthLabels: string[]): void {
  const row = sheet.getRow(3);
  row.height = 22;

  sheet.mergeCells(3, 1, 3, META_COL_COUNT);
  const labelCell = sheet.getCell(3, 1);
  labelCell.value = "Plan view";
  labelCell.font = {
    name: "Helvetica Neue",
    size: 9,
    bold: true,
    color: { argb: C.yearBandLabelText },
  };
  labelCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  labelCell.fill = fill(C.yearBandLabelBg);

  for (let y = 0; y < 6; y++) {
    const startCol = META_COL_COUNT + 1 + y * 12;
    const endCol = startCol + 11;
    sheet.mergeCells(3, startCol, 3, endCol);
    const cell = sheet.getCell(3, startCol);
    const startLabel = monthLabels[y * 12] ?? "";
    const endLabel = monthLabels[y * 12 + 11] ?? "";
    cell.value = `Year ${y + 1}    ·    ${startLabel} → ${endLabel}`;
    cell.font = {
      name: "Helvetica Neue",
      size: 10,
      bold: true,
      color: { argb: C.yearBandText },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = fill(y % 2 === 0 ? C.yearBandPrimaryBg : C.yearBandAltBg);
  }
}

function buildColumnHeaderRow(sheet: import("exceljs").Worksheet, monthLabels: string[]): void {
  const row = sheet.getRow(4);
  row.height = 30;

  const labels = ["Section", "Metric", "Formula / Assumption"];
  for (let i = 0; i < labels.length; i++) {
    const cell = sheet.getCell(4, i + 1);
    cell.value = labels[i];
    cell.font = {
      name: "Helvetica Neue",
      size: 9,
      bold: true,
      color: { argb: C.colHeaderText },
    };
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    cell.fill = fill(C.colHeaderBg);
    cell.border = {
      bottom: { style: "medium", color: { argb: C.borderHeavy } },
    };
  }

  for (let i = 0; i < EXPECTED_MONTHS; i++) {
    const col = META_COL_COUNT + 1 + i;
    const cell = sheet.getCell(4, col);
    const label = monthLabels[i] ?? "";
    cell.value = `M${i + 1}\n${label}`;
    cell.font = {
      name: "Helvetica Neue",
      size: 9,
      color: { argb: C.colHeaderText },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.fill = fill(C.colHeaderBg);
    cell.border = {
      bottom: { style: "medium", color: { argb: C.borderHeavy } },
    };
  }
}

// ── Body ────────────────────────────────────────────────────────────

function buildBody(sheet: import("exceljs").Worksheet, rows: FinancialModelRow[]): void {
  let excelRow = 5;
  let lastSection: string | null = null;
  let zebraIdx = 0;

  for (const row of rows) {
    if (row.section !== lastSection) {
      writeSectionDivider(sheet, excelRow, row.section);
      excelRow++;
      lastSection = row.section;
      zebraIdx = 0;
    }

    writeMetricRow(sheet, excelRow, row, zebraIdx);
    excelRow++;
    zebraIdx++;
  }
}

function writeSectionDivider(
  sheet: import("exceljs").Worksheet,
  rowIdx: number,
  section: string,
): void {
  const row = sheet.getRow(rowIdx);
  row.height = 18;

  sheet.mergeCells(rowIdx, 1, rowIdx, META_COL_COUNT);
  const labelCell = sheet.getCell(rowIdx, 1);
  labelCell.value = section.toUpperCase();
  labelCell.font = {
    name: "Helvetica Neue",
    size: 9,
    bold: true,
    color: { argb: C.sectionText },
  };
  labelCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  labelCell.fill = fill(C.sectionBg);

  for (let c = META_COL_COUNT + 1; c <= TOTAL_COLS; c++) {
    const cell = sheet.getCell(rowIdx, c);
    cell.fill = fill(C.sectionBg);
  }
}

function writeMetricRow(
  sheet: import("exceljs").Worksheet,
  rowIdx: number,
  source: FinancialModelRow,
  zebraIdx: number,
): void {
  const row = sheet.getRow(rowIdx);
  row.height = source.emphasize ? 20 : 18;

  const baseBg = source.emphasize
    ? C.emphasizeBg
    : zebraIdx % 2 === 0
      ? C.rowEvenBg
      : C.rowOddBg;
  const numFmt = numFmtFor(source.format);

  const sectionCell = sheet.getCell(rowIdx, 1);
  sectionCell.value = source.section;
  sectionCell.font = {
    name: "Helvetica Neue",
    size: 9,
    color: { argb: C.metaText },
  };
  sectionCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sectionCell.fill = fill(baseBg);

  const metricCell = sheet.getCell(rowIdx, 2);
  metricCell.value = source.metric;
  metricCell.font = {
    name: "Helvetica Neue",
    size: 10,
    bold: !!source.emphasize,
    color: { argb: source.emphasize ? C.emphasizeText : C.metricText },
  };
  metricCell.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: true };
  metricCell.fill = fill(baseBg);

  const formulaCell = sheet.getCell(rowIdx, 3);
  formulaCell.value = source.formula;
  formulaCell.font = {
    name: "Helvetica Neue",
    size: 9,
    italic: true,
    color: { argb: C.metaText },
  };
  formulaCell.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: true };
  formulaCell.fill = fill(baseBg);

  for (let i = 0; i < EXPECTED_MONTHS; i++) {
    const col = META_COL_COUNT + 1 + i;
    const cell = sheet.getCell(rowIdx, col);
    const v = source.values[i];

    if (source.format === "text") {
      cell.value = String(v ?? "");
    } else {
      const num = typeof v === "number" && Number.isFinite(v) ? v : null;
      cell.value = num;
      if (numFmt) cell.numFmt = numFmt;
    }

    cell.font = {
      name: "Menlo, Consolas, monospace",
      size: 9,
      bold: !!source.emphasize,
      color: { argb: source.emphasize ? C.emphasizeText : C.metricText },
    };
    cell.alignment = { vertical: "middle", horizontal: "right", indent: 1 };
    cell.fill = fill(baseBg);
  }

  if (source.emphasize) {
    for (let c = 1; c <= TOTAL_COLS; c++) {
      const cell = sheet.getCell(rowIdx, c);
      cell.border = {
        top: { style: "thin", color: { argb: C.borderSoft } },
        bottom: { style: "thin", color: { argb: C.borderSoft } },
      };
    }
  }
}

function numFmtFor(format: FinancialModelRow["format"]): string | null {
  switch (format) {
    case "currency":
      return NUM_FORMAT_CURRENCY;
    case "number":
      return NUM_FORMAT_NUMBER;
    case "percent":
      return NUM_FORMAT_PERCENT;
    case "text":
    default:
      return null;
  }
}

// ── Footer ──────────────────────────────────────────────────────────

function buildFooter(sheet: import("exceljs").Worksheet): void {
  const lastRow = sheet.lastRow?.number ?? 4;
  const footerRowIdx = lastRow + 2;
  const row = sheet.getRow(footerRowIdx);
  row.height = 22;
  sheet.mergeCells(footerRowIdx, 1, footerRowIdx, TOTAL_COLS);
  const cell = sheet.getCell(footerRowIdx, 1);
  cell.value =
    "Scenario model based on current assumptions. Sourced from the live Strategic Forecast audit layer. Not a guarantee of future performance.";
  cell.font = {
    name: "Helvetica Neue",
    size: 9,
    italic: true,
    color: { argb: C.footerText },
  };
  cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  cell.fill = fill(C.footerBg);
}

// ── Download ────────────────────────────────────────────────────────

async function downloadWorkbook(workbook: import("exceljs").Workbook): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILE_NAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// `softBorder` is exported for potential reuse but unused for the
// current minimal-border design. Keep here so tests / future polish
// can opt in without re-deriving styling tokens.
export { softBorder };
