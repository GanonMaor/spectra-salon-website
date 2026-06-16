#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const INVENTORY_FILE = path.resolve(__dirname, "../reports/pol-customer-usage/shade-inventory.json");
const JSON_OUTPUT_FILE = path.resolve(__dirname, "../reports/pol-customer-usage/pol-shade-map.json");
const CSV_OUTPUT_FILE = path.resolve(__dirname, "../reports/pol-customer-usage/pol-shade-map.csv");

const LEVELS = {
  1: "Black",
  2: "Very dark brown",
  3: "Dark brown",
  4: "Brown",
  5: "Light brown",
  6: "Dark blonde",
  7: "Blonde",
  8: "Light blonde",
  9: "Very light blonde",
  10: "Lightest blonde",
  11: "Ultra light blonde",
  12: "High-lift blonde",
};

const LOREAL_REFLECTS = {
  "0": "Natural",
  "1": "Ash / blue",
  "2": "Iridescent / violet",
  "3": "Gold",
  "4": "Copper",
  "5": "Mahogany / red-violet",
  "6": "Red",
  "7": "Green / matte",
  "8": "Mocha",
};

const WELLA_REFLECTS = {
  "0": "Natural",
  "1": "Ash",
  "2": "Matt / green",
  "3": "Gold",
  "4": "Red / warm",
  "5": "Mahogany",
  "6": "Violet",
  "7": "Brown",
  "8": "Pearl",
  "9": "Cendre",
};

const IGORA_REFLECTS = {
  "0": "Natural",
  "1": "Cendre",
  "2": "Ash",
  "3": "Matt / green",
  "4": "Beige",
  "5": "Gold",
  "6": "Chocolate",
  "7": "Copper",
  "8": "Red",
  "9": "Violet",
};

const MATRIX_REFLECTS = {
  "0": "Neutral",
  "1": "Ash",
  "2": "Violet",
  "3": "Gold / warm",
  "4": "Copper",
  "5": "Mahogany / brown",
  "6": "Red",
  "7": "Jade",
  "8": "Mocha",
  "9": "Pearl",
};

const KEUNE_REFLECTS = {
  "0": "Natural",
  "1": "Ash",
  "2": "Pearl",
  "3": "Gold",
  "4": "Copper",
  "5": "Mahogany",
  "6": "Red",
  "7": "Violet",
  "8": "Mocha / brown",
  "9": "Green / anti-red",
};

const SOURCES = [
  {
    label: "L'Oréal Professionnel hair colour numbering",
    url: "https://www.lorealprofessionnel.co.uk/what-do-the-numbers-in-hair-colour-mean",
  },
  {
    label: "L'Oréal Professionnel shade charts",
    url: "https://us.lorealprofessionnel.com/pro-resources/shade-charts",
  },
  {
    label: "L'Oréal Dia Light demi-permanent and Diactivateur guidance",
    url: "https://us.lorealprofessionnel.com/all-products/hair-color/dia-light",
  },
  {
    label: "Schwarzkopf IGORA Royal numbering",
    url: "https://www.schwarzkopf-professional.com/gb/en/colour/igora/royal.html",
  },
  {
    label: "Wella colour numbering system",
    url: "https://blog.wella.com/us/color-charts",
  },
  {
    label: "Matrix haircolor reflect system",
    url: "https://www.matrix.com/professional-hair-color/color-charts",
  },
  {
    label: "Keune Tinta Color reference",
    url: "https://www.keune.com/education/color-charts/",
  },
];

function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return clean(value).toUpperCase().replace(/\s+/g, " ");
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function productLine(brand, series) {
  const text = `${normalize(brand)} ${normalize(series)}`;
  if (/DIA LIGHT|DIALIGHT/.test(text)) return { colorLine: "L'Oréal Dia Light", colorTechnology: "Demi-permanent acidic gloss / toner" };
  if (/DIA COLOR|DIA RICHESSE/.test(text)) return { colorLine: "L'Oréal Dia Color / Dia Richesse", colorTechnology: "Demi-permanent alkaline color" };
  if (/INOA/.test(text)) return { colorLine: "L'Oréal INOA", colorTechnology: "Permanent oil-based color" };
  if (/MAJIREL|COOL COVER|MAJIREL GLOW/.test(text)) return { colorLine: "L'Oréal Majirel", colorTechnology: "Permanent oxidative color" };
  if (/LUO/.test(text)) return { colorLine: "L'Oréal Luo Color", colorTechnology: "Permanent / light-reflective color" };
  if (/BLOND STUDIO|BLOND STUDIO|PLATINIUM|BLEACH/.test(text)) return { colorLine: "Lightener / bleach", colorTechnology: "Lightening product" };
  if (/IGORA|VIBRANCE|CHROMA ID|BLONDME|VARIO BLOND|COLOR10/.test(text)) return { colorLine: "Schwarzkopf Professional", colorTechnology: "Professional color / lightener family" };
  if (/WELLA|COLOR TOUCH|BLONDOR|WELLOXON/.test(text)) return { colorLine: "Wella Professionals", colorTechnology: "Professional color / developer / lightener family" };
  if (/MATRIX|SOCOLOR|SO COLOR|SYNC|TONAL CONTROL|SUPER SYNC/.test(text)) return { colorLine: "Matrix", colorTechnology: "Permanent or demi-permanent color family" };
  if (/KEUNE|TINTA/.test(text)) return { colorLine: "Keune Tinta Color", colorTechnology: "Permanent color family" };
  return { colorLine: clean(series) || clean(brand) || "Unknown", colorTechnology: "Unknown / supporting product" };
}

function developerInfo(shade, series) {
  const text = `${normalize(shade)} ${normalize(series)}`;
  const match = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:(\d+)\s*VOL\.?)?/i) || text.match(/(\d+)\s*VOL\.?/i);
  if (!match && !/DEVELOPER|DEVELOPERS|OXYDANT|DIACTIVATOR|ACTIVATEUR|CREAM\s*PEROXIDE/.test(text)) return null;

  const percent = match?.[2] ? Number(match[1]) : match?.[1] && text.includes("%") ? Number(match[1]) : null;
  const volume = match?.[2] ? Number(match[2]) : match?.[1] && /VOL/.test(text) ? Number(match[1]) : percent ? Math.round(percent * 10 / 3) * 10 : null;
  const inferredVolume = volume || (percent === 1.8 ? 6 : percent === 2.7 ? 9 : percent === 4.5 ? 15 : percent === 6 ? 20 : percent === 9 ? 30 : percent === 12 ? 40 : null);
  const inferredPercent = percent || (inferredVolume === 6 ? 1.8 : inferredVolume === 9 ? 2.7 : inferredVolume === 15 ? 4.5 : inferredVolume === 20 ? 6 : inferredVolume === 30 ? 9 : inferredVolume === 40 ? 12 : null);
  const uses =
    inferredVolume === 6 ? "Very low-volume Dia activator; subtle reflect / gloss / tone-on-tone" :
    inferredVolume === 9 ? "Low-volume Dia activator; standard deposit and tonal reveal" :
    inferredVolume === 15 ? "Low-volume Dia activator; stronger reflect / intensity" :
    inferredVolume === 20 ? "Standard developer for grey coverage and 1-2 levels of lift" :
    inferredVolume === 30 ? "Stronger developer for highlights, balayage, and 2-3 levels of lift" :
    inferredVolume === 40 ? "Maximum standard developer for high lift / bleach work" :
    "Oxidant / developer used to activate color or lightener";

  return {
    productType: "developer_oxidant",
    productTypeLabel: "Developer / oxidant / cream peroxide",
    developerPercent: inferredPercent,
    developerVolume: inferredVolume,
    meaning: uses,
    confidence: inferredVolume ? "high" : "medium",
  };
}

function lightenerInfo(shade, series) {
  const text = `${normalize(shade)} ${normalize(series)}`;
  if (!/BLEACH|BLOND|BLONDE|PLATINIUM|PLATINUM|BONDER|WHITE|DECOLOR|LIGHTENER|EFASSOR|HIGH\s*LIFT|HL\s|^HL|P[0-9]|SOLARIS/.test(text)) return null;
  const isBonder = /BONDER|OLAPLEX|PLEX|SMARTBOND|NO\.?1/.test(text);
  return {
    productType: isBonder ? "bond_builder" : "lightener_bleach",
    productTypeLabel: isBonder ? "Bond builder / lightening support" : "Lightener / bleach",
    meaning: isBonder
      ? "Bond-building or protective additive used with lightening/color services"
      : "Lightening product used for blonding, highlights, balayage, or decolorizing",
    confidence: "high",
  };
}

function treatmentInfo(brand, series, shade) {
  const text = `${normalize(brand)} ${normalize(series)} ${normalize(shade)}`;
  if (/OLAPLEX|PLEX|NO\.?1|SMARTBOND/.test(text)) {
    return {
      productType: "bond_builder",
      productTypeLabel: "Bond builder / color support",
      meaning: "Bond-building additive used to support lightening or color services",
      confidence: "high",
    };
  }
  if (!/TREATMENT|KERATIN|INTENSIVE HAIR|MINERAL|MASK|SHAMPOO|CONDITIONER|REPAIR|HY LOREN|MOLECULISSE|BIOTIN|BOTANICA|NORMAL HAIR|X-TENSO|REBELLIOUS|ORGANIC|BOTOX/.test(text)) return null;
  return {
    productType: "treatment_care",
    productTypeLabel: "Treatment / care product",
    meaning: "Care, treatment, smoothing, repair, or support product rather than a hair color shade",
    confidence: "high",
  };
}

function directMixInfo(shade, series) {
  const text = `${normalize(shade)} ${normalize(series)}`;
  if (!/CORRECT|MIX|CLEAR|BOOSTER|INTENSIFIER|0\/|0\.|0-|MM\s|MC\s|VERT|GREEN|ROUGE|RED|ASH VIOLET|ASH \+|\bASH\b|\bMATTE\b|\bVIOLET\b|\bNATURAL\b|GOLD\/YELLOW|\bBLUE\b|UL-V\+/.test(text)) return null;
  return {
    productType: "mixer_corrector",
    productTypeLabel: "Mixer / corrector / clear",
    meaning: "Direct tone, corrective additive, clear, or mixer used to adjust a formula",
    confidence: "medium",
  };
}

function reflectMapForBrand(brand, series) {
  const text = `${normalize(brand)} ${normalize(series)}`;
  if (/SCHWARZKOPF|IGORA|VIBRANCE|CHROMA ID/.test(text)) return { system: "Schwarzkopf / IGORA", separator: "-", reflects: IGORA_REFLECTS };
  if (/WELLA|COLOR TOUCH|KOLESTON|ILLUMINA/.test(text)) return { system: "Wella", separator: "/", reflects: WELLA_REFLECTS };
  if (/MATRIX|SOCOLOR|SO COLOR|SYNC|TONAL CONTROL|SUPER SYNC/.test(text)) return { system: "Matrix", separator: ".", reflects: MATRIX_REFLECTS };
  if (/KEUNE|TINTA/.test(text)) return { system: "Keune", separator: ".", reflects: KEUNE_REFLECTS };
  return { system: "L'Oréal / international dot system", separator: ".", reflects: LOREAL_REFLECTS };
}

function parseNumericShade(brand, series, shade) {
  const raw = clean(shade).toUpperCase();
  const text = raw
    .replace(/,/g, ".")
    .replace(/\s+/g, "")
    .replace(/^(CC|CI|C|R|HR|LIGHT|DARK)/, "")
    .replace(/(CC|F|S)$/, "")
    .replace(/[A-Z]+$/, "");
  const namedDepth = raw.match(/^(LIGHT|DARK)\s*(\.\d{1,3})$/);
  if (namedDepth) {
    const level = namedDepth[1] === "LIGHT" ? 9 : 6;
    const alternate = parseNumericShade(brand, series, `${level}${namedDepth[2]}`);
    if (alternate) {
      return {
        ...alternate,
        meaning: `${namedDepth[1] === "LIGHT" ? "Light" : "Dark"} tonal family shade / ${alternate.meaning}`,
        confidence: "medium",
      };
    }
  }
  const chroma = raw.match(/^(\d{1,2})[,.](\d)-(\d)$/);
  if (chroma) {
    const level = Number(chroma[1]);
    return {
      productType: "hair_color_shade",
      productTypeLabel: "Hair color shade",
      shadeSystem: "Schwarzkopf / Chroma ID variant",
      level,
      levelName: LEVELS[level] || `Level ${level}`,
      reflectCode: `${chroma[2]}-${chroma[3]}`,
      reflects: [
        { code: chroma[2], role: "primary", tone: IGORA_REFLECTS[chroma[2]] || "Unknown reflect" },
        { code: chroma[3], role: "secondary", tone: IGORA_REFLECTS[chroma[3]] || "Unknown reflect" },
      ],
      colorFamily: level >= 8 ? "Blonde" : level >= 5 ? "Brown / dark blonde" : "Dark brown / black",
      meaning: `${LEVELS[level] || `Level ${level}`} with ${IGORA_REFLECTS[chroma[2]] || "unknown"} and ${IGORA_REFLECTS[chroma[3]] || "unknown"} tone direction`,
      confidence: "medium",
    };
  }
  const matrixMulti = raw.match(/^(\d{1,2})([A-Z]{1,3})\/(\d{1,2}[./-]\d{1,3})$/);
  if (matrixMulti) {
    const level = Number(matrixMulti[1]);
    const alternate = parseNumericShade(brand, series, matrixMulti[3]);
    if (alternate) {
      return {
        ...alternate,
        meaning: `${LEVELS[level] || `Level ${level}`} alpha-numeric shade (${matrixMulti[2]}) / ${alternate.meaning}`,
        confidence: "medium",
      };
    }
  }
  const map = reflectMapForBrand(brand, series);
  let match = text.match(/^(\d{1,2})[./-](\d{1,3})$/);
  if (!match && text.match(/^\d{1,2}$/)) match = [text, text, ""];
  if (!match && text.match(/^\d{2,4}$/)) {
    const levelLength = text.length >= 3 && Number(text.slice(0, 2)) <= 12 ? 2 : 1;
    match = [text, text.slice(0, levelLength), text.slice(levelLength)];
  }
  if (!match) return null;

  const level = Number(match[1]);
  if (!Number.isFinite(level) || level < 1 || level > 12) return null;

  const reflectDigits = match[2] || "0";
  const reflects = reflectDigits
    .split("")
    .filter(Boolean)
    .map((digit, index) => ({
      code: digit,
      role: index === 0 ? "primary" : "secondary",
      tone: map.reflects[digit] || "Unknown reflect",
    }));

  const reflectText = reflects.map((r) => r.tone).join(" + ") || "Natural";
  const levelName = LEVELS[level] || `Level ${level}`;
  const family =
    level >= 8 ? "Blonde" :
    level >= 5 ? "Brown / dark blonde" :
    "Dark brown / black";

  return {
    productType: "hair_color_shade",
    productTypeLabel: "Hair color shade",
    shadeSystem: map.system,
    level,
    levelName,
    reflectCode: reflectDigits,
    reflects,
    colorFamily: family,
    meaning: `${levelName}${reflectText && reflectText !== "Natural" ? ` with ${reflectText} reflect` : " natural shade"}`,
    confidence: reflects.every((r) => r.tone !== "Unknown reflect") ? "high" : "medium",
  };
}

function classify(item) {
  const { brand, series, shade } = item;
  const line = productLine(brand, series);
  const developer = developerInfo(shade, series);
  if (developer) return { ...line, ...developer };
  const lightener = lightenerInfo(shade, series);
  if (lightener) return { ...line, ...lightener };
  const treatment = treatmentInfo(brand, series, shade);
  if (treatment) return { ...line, ...treatment };
  const mixer = directMixInfo(shade, series);
  if (mixer) return { ...line, ...mixer };
  const color = parseNumericShade(brand, series, shade);
  if (color) return { ...line, ...color };
  return {
    ...line,
    productType: "unknown_or_unmapped",
    productTypeLabel: "Unknown / unmapped",
    meaning: "Needs manual review against the manufacturer chart or product catalog",
    confidence: "low",
  };
}

function main() {
  if (!fs.existsSync(INVENTORY_FILE)) {
    throw new Error(`Inventory file not found: ${INVENTORY_FILE}. Run the extraction step first.`);
  }

  const input = JSON.parse(fs.readFileSync(INVENTORY_FILE, "utf8"));
  const entries = input.inventory.map((item) => {
    const classification = classify(item);
    return {
      ...item,
      ...classification,
    };
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    sourceInventory: path.relative(path.resolve(__dirname, ".."), INVENTORY_FILE),
    totalEntries: entries.length,
    uniqueShadeLabels: new Set(entries.map((entry) => entry.shade)).size,
    byProductType: {},
    byConfidence: {},
    byColorLine: {},
    references: SOURCES,
  };

  for (const entry of entries) {
    summary.byProductType[entry.productType] = (summary.byProductType[entry.productType] || 0) + 1;
    summary.byConfidence[entry.confidence] = (summary.byConfidence[entry.confidence] || 0) + 1;
    summary.byColorLine[entry.colorLine] = (summary.byColorLine[entry.colorLine] || 0) + 1;
  }

  const output = { summary, entries };
  fs.writeFileSync(JSON_OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  const columns = [
    "brand",
    "series",
    "shade",
    "productType",
    "productTypeLabel",
    "colorLine",
    "colorTechnology",
    "shadeSystem",
    "level",
    "levelName",
    "reflectCode",
    "meaning",
    "developerPercent",
    "developerVolume",
    "colorFamily",
    "confidence",
    "grams",
    "rows",
    "customers",
  ];
  const csv = [
    columns.join(","),
    ...entries.map((entry) => columns.map((column) => csvEscape(entry[column])).join(",")),
  ].join("\n");
  fs.writeFileSync(CSV_OUTPUT_FILE, `${csv}\n`, "utf8");

  console.log(`Wrote ${entries.length} mapped entries to ${path.relative(process.cwd(), JSON_OUTPUT_FILE)}`);
  console.log(`Wrote CSV to ${path.relative(process.cwd(), CSV_OUTPUT_FILE)}`);
  console.log(JSON.stringify({
    byProductType: summary.byProductType,
    byConfidence: summary.byConfidence,
    unmapped: entries.filter((entry) => entry.productType === "unknown_or_unmapped").length,
    topUnmapped: entries
      .filter((entry) => entry.productType === "unknown_or_unmapped")
      .slice(0, 15)
      .map((entry) => `${entry.brand} | ${entry.series} | ${entry.shade} | ${round(entry.grams)}g`),
  }, null, 2));
}

main();
