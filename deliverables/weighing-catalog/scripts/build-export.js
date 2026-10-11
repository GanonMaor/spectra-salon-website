#!/usr/bin/env node
/**
 * Read-only export of a weighing-system catalog snapshot.
 * Does not modify source catalogs, the spreadsheet, or the database.
 *
 * Source rows: data/catalog-brands/*.json
 * Upstream of those files: data/products_1781528628322.xlsx
 *   via scripts/build-catalog-truth.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const OUT = path.resolve(__dirname, "..");
const { isValidBarcode } = require(path.join(ROOT, "scripts/lib/product-catalog/schema"));
const { parseDeveloperStrength } = require(path.join(ROOT, "scripts/lib/product-truth/catalog-normalizer"));

const EXPORTED_AT = new Date().toISOString();
const CATALOG_VERSION = "2026-09-27.1";

const BRAND_DISPLAY = {
  "L'OREAL PROFESSIONNEL": {
    displayName: "L'Oréal Professionnel",
    source: "scripts/lib/beauty-intelligence/brand-dictionary.js BRAND_DICTIONARY['L'OREAL PROFESSIONNEL'].displayName",
  },
  "WELLA PROFESSIONALS": {
    displayName: "Wella Professionals",
    source: "scripts/lib/beauty-intelligence/brand-dictionary.js BRAND_DICTIONARY['WELLA PROFESSIONALS'].displayName",
  },
  SCHWARZKOPF: {
    displayName: "Schwarzkopf Professional",
    source: "scripts/lib/beauty-intelligence/brand-dictionary.js BRAND_DICTIONARY['SCHWARZKOPF'].displayName",
  },
  SCHWARZKOPF_CANADA: {
    displayName: "Schwarzkopf Professional",
    source: "scripts/lib/beauty-intelligence/brand-dictionary.js normalizeBrandKey() maps any brand containing SCHWARZKOPF to SCHWARZKOPF. The stored brand string SCHWARZKOPF_CANADA is preserved and not merged.",
  },
};

const LINE_DICTIONARY = {
  MAJIREL: { displayName: "Majirel", productType: "permanent_color" },
  "DIA LIGHT": { displayName: "Dia Light", productType: "acidic_toner" },
  "DIA LIGHT 60G": { displayName: "Dia Light 60g", productType: "acidic_toner" },
  DIACTIVATOR: { displayName: "Diactivator", productType: "developer" },
  "OXYDANT DEVELOPERS": { displayName: "Oxydant Developers", productType: "developer" },
  KOLESTONE: { displayName: "Koleston Perfect", productType: "permanent_color" },
  "COLOR TOUCH": { displayName: "Color Touch", productType: "demi_permanent" },
  "IGORA ROYAL": { displayName: "Igora Royal", productType: "permanent_color" },
  "IGORA VIBRANCE": { displayName: "Igora Vibrance", productType: "demi_permanent" },
  BLONDME: { displayName: "BlondMe", productType: "lightener" },
};

const SELECTIONS = [
  {
    file: "data/catalog-brands/l-oreal-professionnel.json",
    series: ["MAJIREL", "DIA LIGHT", "DIA LIGHT 60g", "DIACTIVATOR", "OXYDANT DEVELOPERS"],
    market: null,
  },
  {
    file: "data/catalog-brands/wella-professionals.json",
    series: [
      "KOLESTONE",
      "COLOR TOUCH",
      "WELLOXON DEVELOPERS",
      "COLOR TOUCH DEVELOPERS",
      "COLOR TOUCH PLUS DEVELOPERS",
    ],
    market: null,
  },
  {
    file: "data/catalog-brands/schwarzkopf.json",
    series: [
      "IGORA ROYAL",
      "IGORA VIBRANCE",
      "BLONDME",
      "IGORA ROYAL DEVELOPERS",
      "IGORA VIBRANCE DEVELOPERS",
      "BLONDME DEVELOPERS",
      "BLONDME LIGHTENERS",
    ],
    market: null,
  },
  {
    file: "data/catalog-brands/schwarzkopf-canada.json",
    series: ["IGORA ROYAL", "IGORA VIBRANCE", "BLONDME"],
    market: {
      code: "CA",
      sourceLabel: "CANADA",
      evidence: "Brand string SCHWARZKOPF_CANADA and file name schwarzkopf-canada.json. Code CA is a normalization of that suffix.",
    },
  },
];

const RELATED_NOT_EXPORTED = [
  { file: "data/catalog-brands/l-oreal-professionnel.json", series: ["MAJIREL FUNDA", "COOL COVER", "MAJICREME", "INOA DEVELOPERS", "BS DEVELOPERS", "LUO COLOR DEVELOPERS"] },
  { file: "data/catalog-brands/wella-professionals.json", series: ["GALON DEVELOPERS", "BLONDOR DEVELOPERS", "COLOR TOUCH PLUS"] },
  { file: "data/catalog-brands/wella-professionals-jp.json", series: ["KOLESTON PERFECT +"] },
  { file: "data/catalog-brands/l-oreal-professionnel-jp.json", series: ["Alluria FASHION", "Alluria cream oxydant"] },
  { file: "data/catalog-brands/schwarzkopf-professional-jp.json", series: ["IGORA ROYAL PIXAM-F", "IGORA ROYAL PIXAM-G"] },
];

const MIXING_ROLE_BY_TYPE = {
  color: "color",
  toner: "toner",
  developer: "developer",
  bleach: "lightener",
  treatment: "treatment",
  straightening: "straightening",
  perm: "other",
  plex: "additive",
  retail: "other",
  accessory: "other",
  other: "other",
};

const FLAG_STATUS = {
  0: "active",
  1: "deleted",
  2: "deprecated",
  3: "barcode_conflict",
};

function slug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function blankToNull(value) {
  if (value == null) return null;
  const text = String(value);
  return text.trim() === "" ? null : text;
}

function weightField(value, sourceField) {
  if (value == null || value === "") {
    return { value: null, unit: null, presence: "missing", sourceField };
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { value: null, unit: null, presence: "unparsed", raw: value, sourceField };
  }
  return {
    value,
    unit: "g",
    unitStatus: "schema_convention",
    unitSource: "scripts/lib/product-catalog/workbook-builder.js FORMAT_REFERENCE_ROWS",
    presence: value === 0 ? "zero" : "present",
    sourceField,
  };
}

function parseExplicitStrength(shade) {
  const raw = String(shade || "");
  const pct = raw.match(/(\d+(?:[.,]\d+)?)\s*%/);
  const vol = raw.match(/(\d+(?:[.,]\d+)?)\s*vol\b/i);
  if (!pct && !vol) return null;
  const num = (token) => Number(String(token).replace(",", "."));
  return {
    percent: pct ? num(pct[1]) : null,
    volume: vol ? num(vol[1]) : null,
    volumeUnit: vol ? "vol" : null,
    percentExplicit: Boolean(pct),
    volumeExplicit: Boolean(vol),
    raw,
    inferredCounterpart: false,
  };
}

function parseLevelGrouping(familyShade) {
  const raw = String(familyShade || "").trim();
  const match = raw.match(/^LEVEL\s+(\d+)$/i);
  if (!match) return null;
  return {
    numeric: Number(match[1]),
    raw,
    status: "catalog_grouping",
    sourceField: "familyShade",
    note: "Taken only from the spreadsheet grouping label. Not parsed from the shade code.",
  };
}

function indexLocalImages() {
  const map = new Map();
  const base = path.join(ROOT, "public/catalog-products");
  if (!fs.existsSync(base)) return map;
  for (const brandDir of fs.readdirSync(base)) {
    const dir = path.join(base, brandDir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      const id = file.replace(/\.[^.]+$/, "");
      map.set(id, { absolute: path.join(dir, file), publicPath: `public/catalog-products/${brandDir}/${file}` });
    }
  }
  return map;
}

function compareProduct(a, b) {
  const keys = [
    a.brand.source.localeCompare(b.brand.source),
    a.productLine.source.localeCompare(b.productLine.source),
    a.shadeCode.localeCompare(b.shadeCode),
    a.source.productId.localeCompare(b.source.productId),
  ];
  return keys.find((value) => value !== 0) || 0;
}

function loadSelection(selection) {
  const absolute = path.join(ROOT, selection.file);
  const rows = JSON.parse(fs.readFileSync(absolute, "utf8"));
  const wanted = new Set(selection.series);
  const present = new Set(rows.map((row) => row.series));
  const missing = selection.series.filter((series) => !present.has(series));
  if (missing.length) {
    throw new Error(`Missing series in ${selection.file}: ${missing.join(", ")}`);
  }
  return rows.filter((row) => wanted.has(row.series));
}

function build() {
  const localImages = indexLocalImages();
  const brands = new Map();
  const lines = new Map();
  const products = [];
  const seenIds = new Map();
  const assetDir = path.join(OUT, "assets");
  fs.mkdirSync(assetDir, { recursive: true });

  for (const selection of SELECTIONS) {
    const rows = loadSelection(selection);
    const counts = new Map();
    for (const row of rows) counts.set(row.series, (counts.get(row.series) || 0) + 1);

    for (const row of rows) {
      const sourceBrand = row.brand;
      const brandSlug = slug(sourceBrand);
      const brandId = `brand:${brandSlug}`;
      if (!brands.has(brandId)) {
        const display = BRAND_DISPLAY[sourceBrand] || { displayName: sourceBrand, source: "no dictionary entry; display name equals the source string" };
        brands.set(brandId, {
          id: brandId,
          sourceBrand,
          displayName: display.displayName,
          displayNameSource: display.source,
          market: selection.market,
        });
      }

      const lineSlug = slug(row.series);
      const lineId = `line:${brandSlug}:${lineSlug}`;
      if (!lines.has(lineId)) {
        const dict = LINE_DICTIONARY[String(row.series).toUpperCase()] || null;
        lines.set(lineId, {
          id: lineId,
          brandId,
          sourceSeries: row.series,
          displayName: dict ? dict.displayName : row.series,
          displayNameSource: dict
            ? "scripts/lib/beauty-intelligence/brand-dictionary.js"
            : "no dictionary entry; display name equals the source series",
          dictionaryProductType: dict ? dict.productType : null,
          dictionaryProductTypeStatus: dict ? "documentation_only" : "not_in_source",
          sourceFile: selection.file,
          market: selection.market,
          localExtract: {
            exportedCount: counts.get(row.series),
            sourceFileCount: counts.get(row.series),
            status: "all_rows_in_source_series_exported",
          },
          manufacturerCompleteness: "unknown",
        });
      }

      if (seenIds.has(row.id)) {
        throw new Error(`Duplicate source product id ${row.id} in ${selection.file} and ${seenIds.get(row.id)}`);
      }
      seenIds.set(row.id, selection.file);

      const barcodes = Array.isArray(row.barcodes)
        ? row.barcodes.map((barcode) => String(barcode))
        : [];
      const strength = parseExplicitStrength(row.shade);
      const type = String(row.type || "").trim() || "other";
      const mixingRole = MIXING_ROLE_BY_TYPE[type] || "other";
      const shadeLevel = parseLevelGrouping(row.familyShade);
      const imageName = blankToNull(row.image);
      const local = localImages.get(row.id) || null;
      let localAsset = null;
      if (local) {
        const destName = `${row.id}${path.extname(local.absolute)}`;
        const destRel = path.join("assets", brandSlug, destName);
        const destAbs = path.join(OUT, destRel);
        fs.mkdirSync(path.dirname(destAbs), { recursive: true });
        fs.copyFileSync(local.absolute, destAbs);
        localAsset = destRel.split(path.sep).join("/");
      }

      const codeParser = parseDeveloperStrength(row.shade);
      products.push({
        id: `src:${row.id}`,
        source: {
          productId: row.id,
          file: selection.file,
          upstreamSpreadsheet: "data/products_1781528628322.xlsx",
        },
        brandId,
        productLineId: lineId,
        brand: {
          source: sourceBrand,
          display: brands.get(brandId).displayName,
        },
        productLine: {
          source: row.series,
          display: lines.get(lineId).displayName,
        },
        shadeCode: String(row.shade ?? ""),
        shadeLevel,
        shadeFamilies: [],
        shadeFamilyStatus: "not_in_source",
        sourceGrouping: blankToNull(row.familyShade),
        productType: MIXING_ROLE_BY_TYPE[type] ? type : "other",
        rawType: blankToNull(row.rawType) || type,
        mixingRole,
        mixingRoleStatus: MIXING_ROLE_BY_TYPE[type] ? "mapped_from_catalog_type" : "unmapped_type_kept_as_other",
        developerStrength: strength,
        developerStrengthPresence: strength
          ? "present"
          : type === "developer"
            ? "missing"
            : "not_applicable",
        package: {
          materialWeight: weightField(row.materialWeight, "materialWeight"),
          packingWeight: weightField(row.packingWeight, "packingWeight"),
        },
        barcodes,
        catalogNo: blankToNull(row.catalogNo),
        hairColor: blankToNull(row.hairColor),
        catalogStatus: FLAG_STATUS[row.flag] || "unknown",
        sourceFlag: row.flag,
        price: {
          amount: typeof row.price === "number" ? row.price : null,
          currency: "ILS",
          currencySource: "spreadsheet column ILS, documented in scripts/lib/product-catalog/workbook-builder.js",
          scope: "catalog_spreadsheet",
          isSalonPrice: false,
          presence: row.price == null ? "missing" : row.price === 0 ? "zero" : "present",
        },
        costPerGram: null,
        countsTowardDeveloperTarget: null,
        market: selection.market,
        image: {
          sourceFilename: imageName,
          sourcePublicPath: local ? local.publicPath : null,
          localAsset,
          included: Boolean(localAsset),
        },
        derived: {
          productKind: {
            value: blankToNull(row.productKind),
            status: "inferred",
            source: "scripts/build-catalog-truth.js inferProductKind",
          },
          shadeDescription: blankToNull(row.shadeDesc)
            ? {
                value: row.shadeDesc,
                status: "heuristic",
                source: "scripts/build-catalog-truth.js describeShade",
              }
            : null,
          verificationUrl: {
            value: row.verificationUrl || null,
            status: "search_link_not_evidence",
            source: "scripts/build-catalog-truth.js buildVerificationUrl; reports/catalog-verification-audit/README.md says products with actual source evidence: 0",
          },
          codeStrengthParser: codeParser
            ? {
                percent: codeParser.percent,
                volume: codeParser.volume,
                strengthKey: codeParser.strengthKey,
                source: "scripts/lib/product-truth/catalog-normalizer.js parseDeveloperStrength",
              }
            : null,
        },
      });
    }
  }

  products.sort(compareProduct);

  const imageUse = new Map();
  for (const product of products) {
    if (!product.image.sourceFilename) continue;
    const key = `${product.source.file}::${product.image.sourceFilename}`;
    imageUse.set(key, (imageUse.get(key) || 0) + 1);
  }

  const assets = products.map((product) => {
    const key = product.image.sourceFilename ? `${product.source.file}::${product.image.sourceFilename}` : null;
    const sharedCount = key ? imageUse.get(key) : 0;
    let scope = "missing_filename";
    if (product.image.sourceFilename && sharedCount > 1) scope = "shared_filename";
    else if (product.image.sourceFilename) scope = "unique_filename";
    return {
      productId: product.id,
      sourceProductId: product.source.productId,
      sourceFilename: product.image.sourceFilename,
      scope,
      sharedWithProductCount: sharedCount,
      exactProductPhoto: false,
      localAsset: product.image.localAsset,
      included: product.image.included,
      sourcePublicPath: product.image.sourcePublicPath,
      reason: product.image.included
        ? "Copied from public/catalog-products because the file name matches the source product id."
        : "The catalog stores a filename. That file is not in the repository, including public/catalog-products. No substitute image was used.",
    };
  });

  const includedAssets = assets.filter((asset) => asset.included).length;
  fs.writeFileSync(
    path.join(assetDir, "NO_LOCAL_ASSETS.txt"),
    includedAssets === 0
      ? "No local image bytes were copied. The selected series store image filenames, and those files are not present in this repository. See asset-manifest.json.\n"
      : `${includedAssets} local file(s) were copied. See asset-manifest.json.\n`,
    "utf8",
  );

  const brandList = [...brands.values()].sort((a, b) => a.id.localeCompare(b.id));
  const lineList = [...lines.values()].sort((a, b) => a.id.localeCompare(b.id));

  const catalog = {
    catalogVersion: CATALOG_VERSION,
    exportedAt: EXPORTED_AT,
    contract: "spectra-weighing-catalog/1",
    contractStatus: "snapshot",
    inventions: "none",
    fieldsLeftEmpty: [
      "shadeFamilies",
      "costPerGram",
      "countsTowardDeveloperTarget",
      "mixRatio",
      "salonPrice",
      "salonStock",
    ],
    source: {
      brandFiles: SELECTIONS.map((selection) => selection.file),
      upstreamSpreadsheet: "data/products_1781528628322.xlsx",
      generator: "scripts/build-catalog-truth.js",
      note: "Rows were read from the generated brand JSON. A spot check of product ff1264f7-f6e5-11ec-9cb4-6045bd925463 and Diactivator 1.8% matched the spreadsheet columns. shadeDesc, productKind, flag, and verificationUrl are produced by build-catalog-truth.js and are not spreadsheet columns.",
    },
    counts: {
      brands: brandList.length,
      productLines: lineList.length,
      products: products.length,
      localImages: includedAssets,
    },
    brands: brandList,
    productLines: lineList,
    products,
  };

  writeJson(path.join(OUT, "catalog.json"), catalog);
  writeJson(path.join(OUT, "asset-manifest.json"), {
    catalogVersion: CATALOG_VERSION,
    exportedAt: EXPORTED_AT,
    localImagesIncluded: includedAssets,
    assets,
  });
  writeJson(
    path.join(OUT, "id-map.json"),
    products.map((product) => ({
      exportId: product.id,
      sourceProductId: product.source.productId,
      sourceFile: product.source.file,
      sourceBrand: product.brand.source,
      sourceSeries: product.productLine.source,
      shadeCode: product.shadeCode,
    })),
  );

  const summary = summarize(catalog, assets);
  writeJson(path.join(OUT, "export-summary.json"), summary);
  writeExamples(catalog, summary);
  writeQualityReport(summary);
  return summary;
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function summarize(catalog, assets) {
  const products = catalog.products;
  const byType = countBy(products, (product) => product.productType);
  const byRole = countBy(products, (product) => product.mixingRole);
  const byStatus = countBy(products, (product) => product.catalogStatus);
  const byLine = countBy(products, (product) => `${product.brand.source} / ${product.productLine.source}`);
  const shadeLevels = new Map();
  for (const product of products) {
    if (!product.shadeLevel) continue;
    shadeLevels.set(product.shadeLevel.numeric, (shadeLevels.get(product.shadeLevel.numeric) || 0) + 1);
  }

  const barcodeToProducts = new Map();
  let invalidBarcodes = 0;
  let productsWithoutBarcode = 0;
  let leadingZeroBarcodes = 0;
  for (const product of products) {
    if (!product.barcodes.length) productsWithoutBarcode += 1;
    for (const barcode of product.barcodes) {
      if (barcode.startsWith("0")) leadingZeroBarcodes += 1;
      if (!isValidBarcode(barcode)) invalidBarcodes += 1;
      if (!barcodeToProducts.has(barcode)) barcodeToProducts.set(barcode, []);
      barcodeToProducts.get(barcode).push(product.id);
    }
  }
  const multiBarcode = [...barcodeToProducts.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([barcode, ids]) => ({ barcode, productIds: ids, count: ids.length }))
    .sort((a, b) => b.count - a.count || a.barcode.localeCompare(b.barcode));

  const strengthDisagreements = [];
  for (const product of products) {
    const code = product.derived.codeStrengthParser;
    const explicit = product.developerStrength;
    if (!code && !explicit) continue;
    const percentDiffers = (explicit && explicit.percent) !== (code && code.percent) &&
      !sameNumber(explicit && explicit.percent, code && code.percent);
    const volumeDiffers = !sameNumber(explicit && explicit.volume, code && code.volume);
    if (percentDiffers || volumeDiffers) {
      strengthDisagreements.push({
        productId: product.id,
        shadeCode: product.shadeCode,
        explicit,
        codeParser: code,
      });
    }
  }

  const special = products
    .filter((product) => /90[0-9]|901|904|(^|\s)99(\s|$)|CLEAR|BOOST|HIGH\s*LIFT|MIXT|^HL\b|1\/2/i.test(`${product.shadeCode} ${product.sourceGrouping || ""}`))
    .map((product) => ({
      productId: product.id,
      sourceSeries: product.productLine.source,
      shadeCode: product.shadeCode,
      sourceGrouping: product.sourceGrouping,
      shadeLevel: product.shadeLevel ? product.shadeLevel.numeric : null,
      productType: product.productType,
    }));

  const related = RELATED_NOT_EXPORTED.map((entry) => {
    const rows = JSON.parse(fs.readFileSync(path.join(ROOT, entry.file), "utf8"));
    return {
      file: entry.file,
      series: entry.series.map((series) => ({
        series,
        count: rows.filter((row) => row.series === series).length,
      })),
    };
  });

  const crossMarket = multiBarcode.filter((match) => {
    const files = new Set(match.productIds.map((id) => products.find((product) => product.id === id).source.file));
    return files.size > 1;
  });

  return {
    catalogVersion: catalog.catalogVersion,
    exportedAt: catalog.exportedAt,
    counts: catalog.counts,
    byType,
    byRole,
    byStatus,
    byLine,
    shadeLevelPresent: products.filter((product) => product.shadeLevel).length,
    shadeLevelAbsent: products.filter((product) => !product.shadeLevel).length,
    shadeLevelZero: products.filter((product) => product.shadeLevel && product.shadeLevel.numeric === 0).length,
    shadeFamiliesEmpty: products.filter((product) => product.shadeFamilies.length === 0).length,
    developerStrengthPresent: products.filter((product) => product.developerStrength).length,
    developerStrengthMissing: products.filter((product) => product.developerStrengthPresence === "missing").length,
    packingWeightZero: products.filter((product) => product.package.packingWeight.presence === "zero").length,
    packingWeightMissing: products.filter((product) => product.package.packingWeight.presence === "missing").length,
    materialWeightMissing: products.filter((product) => product.package.materialWeight.presence === "missing").length,
    priceZero: products.filter((product) => product.price.presence === "zero").length,
    productsWithoutBarcode,
    invalidBarcodes,
    leadingZeroBarcodes,
    multiBarcodeCount: multiBarcode.length,
    multiBarcodeTop: multiBarcode.slice(0, 12),
    crossMarketBarcodeMatches: crossMarket.length,
    strengthDisagreementCount: strengthDisagreements.length,
    strengthDisagreementSample: strengthDisagreements.slice(0, 15),
    specialShadeCount: special.length,
    specialShadeSample: special.slice(0, 40),
    imageFilenamePresent: assets.filter((asset) => asset.sourceFilename).length,
    imageFilenameMissing: assets.filter((asset) => !asset.sourceFilename).length,
    sharedImageFilenames: assets.filter((asset) => asset.scope === "shared_filename").length,
    uniqueImageFilenames: assets.filter((asset) => asset.scope === "unique_filename").length,
    localImages: assets.filter((asset) => asset.included).length,
    shadeLevels: [...shadeLevels.entries()].sort((a, b) => a[0] - b[0]).map(([level, count]) => ({ level, count })),
    sourceGroupings: Object.entries(countBy(products, (product) => product.sourceGrouping || "(blank)"))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40),
    related,
    halfStepShades: products.filter((product) => /1\/2/.test(product.shadeCode)).map((product) => ({
      productId: product.id,
      shadeCode: product.shadeCode,
      sourceGrouping: product.sourceGrouping,
      shadeLevel: product.shadeLevel,
    })),
  };
}

function sameNumber(left, right) {
  if (left == null && right == null) return true;
  return left === right;
}

function countBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Object.fromEntries(map);
}

function writeExamples(catalog, summary) {
  const dir = path.join(OUT, "api-examples");
  fs.mkdirSync(dir, { recursive: true });
  const products = catalog.products;

  const byShade = (series, shade, filePart) => products.find((product) =>
    product.productLine.source === series &&
    product.shadeCode === shade &&
    (!filePart || product.source.file.includes(filePart)));

  const majirel50 = byShade("MAJIREL", "5.0", "l-oreal-professionnel.json");
  const majirel901 = products.find((product) => product.productLine.source === "MAJIREL" && product.shadeCode === "901S");
  const diactivator = products.find((product) => product.shadeCode === "1.8%   6 Vol." && product.productLine.source === "DIACTIVATOR");
  const treatment = products.find((product) => product.productType === "treatment");
  const lightener = products.find((product) => product.productType === "bleach");
  const gloss = products.find((product) => product.shadeCode === "GLOSS CLEAR 250ml");
  const multi = summary.multiBarcodeTop[0];
  const multiProducts = multi
    ? multi.productIds.map((id) => products.find((product) => product.id === id))
    : [];

  const search = paginate(products, {
    brandId: majirel50.brandId,
    productLineId: majirel50.productLineId,
    productType: "color",
    shadeLevel: 5,
    page: 1,
    limit: 2,
  });

  writeJson(path.join(dir, "catalog-snapshot.json"), {
    request: { method: "GET", path: "/weighing-catalog" },
    response: {
      catalogVersion: catalog.catalogVersion,
      exportedAt: catalog.exportedAt,
      contractStatus: "proposed-contract-over-local-snapshot",
      counts: catalog.counts,
    },
  });
  writeJson(path.join(dir, "brands.json"), {
    request: { method: "GET", path: "/brands" },
    response: { brands: catalog.brands },
  });
  writeJson(path.join(dir, "product-lines.json"), {
    request: { method: "GET", path: "/product-lines" },
    response: { productLines: catalog.productLines },
  });
  writeJson(path.join(dir, "search-majirel-level-5.json"), {
    request: {
      method: "GET",
      path: "/products",
      query: {
        brandId: majirel50.brandId,
        productLineId: majirel50.productLineId,
        productType: "color",
        shadeLevel: 5,
        page: 1,
        limit: 2,
      },
    },
    response: search,
  });
  writeJson(path.join(dir, "product-majirel-5-0.json"), {
    request: { method: "GET", path: `/products/${majirel50.id}` },
    response: majirel50,
  });
  writeJson(path.join(dir, "product-majirel-901s.json"), {
    request: { method: "GET", path: `/products/${majirel901.id}` },
    response: majirel901,
  });
  writeJson(path.join(dir, "product-diactivator-1-8.json"), {
    request: { method: "GET", path: `/products/${diactivator.id}` },
    response: diactivator,
  });
  writeJson(path.join(dir, "product-igora-treatment.json"), {
    request: { method: "GET", path: `/products/${treatment.id}` },
    response: treatment,
  });
  writeJson(path.join(dir, "product-lightener.json"), {
    request: { method: "GET", path: `/products/${lightener.id}` },
    response: lightener,
  });
  writeJson(path.join(dir, "product-dia-light-gloss-clear.json"), {
    request: { method: "GET", path: `/products/${gloss.id}` },
    response: gloss,
  });
  writeJson(path.join(dir, "barcode-multiple-matches.json"), {
    request: { method: "GET", path: `/barcodes/${multi.barcode}` },
    response: {
      barcode: multi.barcode,
      matchCount: multiProducts.length,
      matches: multiProducts.map(publicCard),
    },
  });
  writeJson(path.join(dir, "barcode-no-match.json"), {
    request: { method: "GET", path: "/barcodes/0000000000000" },
    response: { barcode: "0000000000000", matchCount: 0, matches: [] },
  });
  writeJson(path.join(dir, "filters.json"), {
    request: { method: "GET", path: "/filters" },
    response: buildFilters(products),
  });
  writeJson(path.join(dir, "mixing-for-diactivator.json"), {
    request: { method: "GET", path: `/products/${diactivator.id}/mixing` },
    response: {
      productId: diactivator.id,
      note: "Rules are in mixing-rules.json. No numeric mix ratio is attached to this product.",
      developerStrength: diactivator.developerStrength,
      countsTowardDeveloperTarget: null,
      applicableRuleIds: [
        "no-mix-ratio-stored",
        "no-developer-target-formula",
        "diactivator-dictionary-note",
        "percent-volume-tables-are-not-mix-ratios",
      ],
    },
  });

  writeJson(path.join(OUT, "example-index.json"), {
    majirel50: majirel50.id,
    majirel901: majirel901.id,
    diactivator: diactivator.id,
    treatment: treatment.id,
    lightener: lightener.id,
    gloss: gloss.id,
    multiBarcode: multi.barcode,
  });
}

function publicCard(product) {
  return {
    id: product.id,
    sourceProductId: product.source.productId,
    brand: product.brand,
    productLine: product.productLine,
    shadeCode: product.shadeCode,
    productType: product.productType,
    mixingRole: product.mixingRole,
    catalogStatus: product.catalogStatus,
    market: product.market,
    barcodes: product.barcodes,
  };
}

function paginate(products, query) {
  let rows = products.filter((product) => {
    if (query.brandId && product.brandId !== query.brandId) return false;
    if (query.productLineId && product.productLineId !== query.productLineId) return false;
    if (query.productType && product.productType !== query.productType) return false;
    if (query.shadeLevel != null && (!product.shadeLevel || product.shadeLevel.numeric !== query.shadeLevel)) return false;
    return true;
  });
  rows.sort(compareProduct);
  const page = query.page;
  const limit = query.limit;
  const start = (page - 1) * limit;
  return {
    total: rows.length,
    page,
    limit,
    sort: ["brand.source", "productLine.source", "shadeCode", "source.productId"],
    products: rows.slice(start, start + limit).map(publicCard),
  };
}

function buildFilters(products) {
  const levels = [...new Set(products.filter((product) => product.shadeLevel).map((product) => product.shadeLevel.numeric))].sort((a, b) => a - b);
  const percents = [...new Set(products.filter((product) => product.developerStrength && product.developerStrength.percent != null).map((product) => product.developerStrength.percent))].sort((a, b) => a - b);
  const volumes = [...new Set(products.filter((product) => product.developerStrength && product.developerStrength.volume != null).map((product) => product.developerStrength.volume))].sort((a, b) => a - b);
  return {
    brands: [...new Set(products.map((product) => product.brandId))].sort(),
    productLines: [...new Set(products.map((product) => product.productLineId))].sort(),
    productTypes: [...new Set(products.map((product) => product.productType))].sort(),
    mixingRoles: [...new Set(products.map((product) => product.mixingRole))].sort(),
    shadeLevels: levels,
    shadeFamilies: [],
    developerPercents: percents,
    developerVolumes: volumes,
    catalogStatuses: [...new Set(products.map((product) => product.catalogStatus))].sort(),
    markets: ["CA"],
  };
}

function writeQualityReport(summary) {
  const lines = [];
  const push = (text) => lines.push(text);
  push("# דוח איכות נתונים");
  push("");
  push(`גרסת קטלוג: \`${summary.catalogVersion}\`. זמן ייצוא: \`${summary.exportedAt}\`.`);
  push("");
  push("הדוח מתאר את מה שנמצא בקבצי המקור. הוא לא משלים ערכים חסרים.");
  push("");
  push("## כיסוי");
  push("");
  push(`- מותגים (מפתחות מקור): ${summary.counts.brands}`);
  push(`- סדרות: ${summary.counts.productLines}`);
  push(`- מוצרים: ${summary.counts.products}`);
  push(`- תמונות מקומיות שנכללו: ${summary.counts.localImages}`);
  push("");
  push("כל שורה בסדרה שנבחרה יוצאה. זה כיסוי של הקובץ המקומי, לא אישור שהסדרה המסחרית של היצרן מלאה. לא הושוותה מפת גוונים רשמית.");
  push("");
  push("### לפי סדרה");
  push("");
  for (const [name, count] of Object.entries(summary.byLine).sort((a, b) => a[0].localeCompare(b[0]))) {
    push(`- ${name}: ${count}`);
  }
  push("");
  push("### לפי סוג מוצר מהשדה type");
  push("");
  for (const [name, count] of Object.entries(summary.byType).sort()) push(`- ${name}: ${count}`);
  push("");
  push("### לפי תפקיד שקילה שמופה מה־type");
  push("");
  for (const [name, count] of Object.entries(summary.byRole).sort()) push(`- ${name}: ${count}`);
  push("");
  push("### לפי flag של הקטלוג");
  push("");
  for (const [name, count] of Object.entries(summary.byStatus).sort()) push(`- ${name}: ${count}`);
  push("");
  push("## מה לא מולא");
  push("");
  push(`- משפחת גוון טונאלית: ${summary.shadeFamiliesEmpty} מתוך ${summary.counts.products} מוצרים עם מערך ריק. אין שדה כזה במקור. השדה familyShade הוא תווית קיבוץ, לרוב LEVEL N, ולא משפחה.`);
  push(`- עומק גוון מתווית LEVEL: קיים ב־${summary.shadeLevelPresent} מוצרים. חסר ב־${summary.shadeLevelAbsent}. מתוכם LEVEL 0 נשמר כאפס ב־${summary.shadeLevelZero} מוצרים, לא כערך חסר.`);
  push("- עומק לא נגזר מהספרה הראשונה של קוד הגוון. קודים כגון 901S ו־904S נשארו מחרוזות, עם shadeLevel ריק כשתווית הקיבוץ אינה LEVEL N.");
  push(`- חוזק חמצן מפורש במחרוזת הגוון: ${summary.developerStrengthPresent}. חמצנים בלי אחוז או Vol מפורשים: ${summary.developerStrengthMissing}.`);
  push("- יחס ערבוב, בסיס חישוב חמצן, ומחיר לגרם: לא קיימים. costPerGram הוא null בכל הרשומות.");
  push("- מחיר ומלאי של סלון: לא יוצאו.");
  push("");
  push("## אריזה");
  push("");
  push("היחידה גרם היא מוסכמת הסכמה ב־workbook-builder.js, לא יחידה שכתובה על כל שורה. לא בוצעה המרה ממ״ל.");
  push("");
  push(`- packingWeight חסר: ${summary.packingWeightMissing}`);
  push(`- packingWeight שווה 0: ${summary.packingWeightZero}. האפס נשמר. הוא לא הומר ל־null.`);
  push(`- materialWeight חסר: ${summary.materialWeightMissing}`);
  push(`- מחיר 0: ${summary.priceZero}`);
  push("");
  push("דוגמה לפער יחידות שנשמר ולא הוכרע: Dia Light, גוון `GLOSS CLEAR 250ml`, עם materialWeight 250. הטקסט אומר 250ml והעמודות מתועדות כגרמים. שני הערכים נשמרו בנפרד.");
  push("");
  push("## ברקודים");
  push("");
  push(`- מוצרים בלי ברקוד: ${summary.productsWithoutBarcode}`);
  push(`- מחרוזות ברקוד שלא עברו את בדיקת EAN-13 / EAN-8 / UPC-A של scripts/lib/product-catalog/schema.js: ${summary.invalidBarcodes}. הן נשמרו.`);
  push(`- מחרוזות עם אפס מוביל: ${summary.leadingZeroBarcodes}. האפס נשמר.`);
  push(`- ברקודים שמופיעים על יותר ממוצר אחד בייצוא: ${summary.multiBarcodeCount}`);
  push(`- מתוכם התאמות חוצות קבצי מקור: ${summary.crossMarketBarcodeMatches}. הרשומות לא מוזגו.`);
  push("");
  push("## חוזק חמצן מול הקוד הקיים");
  push("");
  push("כשיש אחוז מפורש, `parseDeveloperStrength` מתעלמת מה־Vol המפורש וממלאת `volume` רק אם האחוז נמצא ב־`PERCENT_TO_VOL`. 1.8, 2.7, 4.5 ו־3.75 אינם בטבלה, ולכן הפונקציה מחזירה `volume: null` למרות שהטקסט אומר 6, 9, 15 ו־12.5 Vol. הייצוא שמר את שני המספרים המפורשים, בלי להשלים צד חסר מהטבלה.");
  push("");
  push(`פערי פרשנות מול הפונקציה: ${summary.strengthDisagreementCount}.`);
  push("");
  for (const row of summary.strengthDisagreementSample) {
    push(`- \`${row.shadeCode}\` (${row.productId}): explicit ${JSON.stringify(row.explicit)} ; code ${JSON.stringify(row.codeParser)}`);
  }
  push("");
  push("## גוונים מיוחדים שנשמרו כמחרוזת");
  push("");
  push(`נמצאו ${summary.specialShadeCount} רשומות שהטקסט שלהן כולל 90x, 901, 904, 99, CLEAR, BOOST, HIGH LIFT, MIXT או HL. עומק הושם רק אם familyShade הוא בדיוק LEVEL ומספר.`);
  push("");
  for (const row of summary.specialShadeSample) {
    push(`- ${row.sourceSeries} / \`${row.shadeCode}\` / grouping \`${row.sourceGrouping}\` / shadeLevel ${row.shadeLevel == null ? "null" : row.shadeLevel} / ${row.productType}`);
  }
  push("");
  push("## חצאי רמות");
  push("");
  push("קוד שמכיל `1/2` נשמר כמו שהוא. אם familyShade הוא LEVEL 10, העומק בייצוא הוא 10 כי כך כתוב בקיבוץ, לא 10.5. החצי נשאר רק בקוד הגוון.");
  push("");
  for (const row of summary.halfStepShades) {
    push(`- \`${row.shadeCode}\` grouping \`${row.sourceGrouping}\``);
  }
  push("");
  push("## תמונות");
  push("");
  push(`- שם קובץ במקור: ${summary.imageFilenamePresent}`);
  push(`- בלי שם קובץ: ${summary.imageFilenameMissing}`);
  push(`- שם קובץ משותף ליותר ממוצר אחד: ${summary.sharedImageFilenames} רשומות`);
  push(`- שם קובץ ייחודי לרשומה: ${summary.uniqueImageFilenames}`);
  push(`- קבצים מקומיים שנמצאו והועתקו: ${summary.localImages}`);
  push("");
  push("הקבצים בשם `lpm0000.png` וכדומה אינם בתיקיית הפרויקט. ב־`public/catalog-products/loreal-professionnel` יש 31 תמונות, והן שייכות לסדרות אחרות (Absolut Repair, Blond Studio, Metal Detox, Serie Expert). הן לא שויכו למוצרי הצבע של הייצוא.");
  push("");
  push("## סדרות קיימות שלא יוצאו");
  push("");
  push("הן לא חסרות מהדיסק. הן מחוץ לבחירה, כי השם אינו הסדרה המבוקשת, או שאין במקור כלל שמקשר אותן לסדרה שנבחרה.");
  push("");
  for (const entry of summary.related) {
    push(`### ${entry.file}`);
    push("");
    for (const series of entry.series) {
      push(`- ${series.series}: ${series.count} שורות בקובץ`);
    }
    push("");
  }
  push("Majirel Funda קיימת כסדרת מקור נפרדת. טבלת הכינויים בקוד ממפה אותה ל־MAJIREL. המיפוי לא הופעל, והשורות לא מוזגו לתוך Majirel.");
  push("");
  push("Galon Developers קיימת אצל Wella, כולל שורה `Shinfinity Activator`, בלי כלל מקור שמקשר אותה ל־Koleston או ל־Color Touch.");
  push("");
  push("קובצי JP אינם מכילים את שמות הסדרות Majirel, Dia Light, Koleston או Igora Royal. יש בהם שמות אחרים, כגון Alluria ו־Koleston Perfect +. הם לא אוחדו לייצוא.");
  push("");
  push("## סתירות שנשמרו");
  push("");
  push("- מילון BlondMe מגדיר את הסדרה כ־lightener. בקובץ schwarzkopf.json סדרת BLONDME היא type color. סוג המוצר בייצוא נלקח מהשדה type, לא מהמילון.");
  push("- Dia Light ו־Color Touch ו־Igora Vibrance מסומנים במילון כ־acidic toner או demi. השדה type בקטלוג הוא color. הייצוא לא שדרג את הסוג.");
  push("- `catalog-normalizer.js` בונה מפתח זהות בלי גודל אריזה. `migrations/020_canonical_product_database.sql` אומר שגודל אריזה הוא חלק מהזהות. הייצוא שמר שורה נפרדת לכל productId.");
  push("- טבלת האחוז/נפח בקוד אינה זהה לכל הזוגות המפורשים. למשל Diactivator כתוב 1.8% ו־6 Vol, בעוד Color Touch כתוב 1.9% ו־6 Vol.");
  push("");
  push("## נתוני דמו שלא נכנסו");
  push("");
  push("`netlify/functions/inventory.js` מכיל שורות הדגמה של Salon Look, עם level מספרי ומחירים בדולר. אלה לא רשומות קטלוג. הן לא יוצאו.");
  push("");
  fs.writeFileSync(path.join(OUT, "data-quality-report.md"), lines.join("\n"), "utf8");
}

const summary = build();
console.log(JSON.stringify({
  counts: summary.counts,
  byType: summary.byType,
  byStatus: summary.byStatus,
  shadeLevelPresent: summary.shadeLevelPresent,
  shadeLevelAbsent: summary.shadeLevelAbsent,
  developerStrengthPresent: summary.developerStrengthPresent,
  multiBarcodeCount: summary.multiBarcodeCount,
  localImages: summary.localImages,
  specialShadeCount: summary.specialShadeCount,
  strengthDisagreementCount: summary.strengthDisagreementCount,
}, null, 2));
