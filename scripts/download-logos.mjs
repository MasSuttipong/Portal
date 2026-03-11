#!/usr/bin/env node

/**
 * One-time script to download company logos for seed data.
 * Uses Clearbit Logo API (primary) and Google Favicons (fallback).
 * Run: node scripts/download-logos.mjs
 */

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGOS_DIR = resolve(__dirname, "../public/logos");

// Company ID → domain mapping
const COMPANY_DOMAINS = {
  // insurance-companies.json
  "ins-1": "dhipaya.co.th",
  "ins-2": "bangkokinsurance.com",
  "ins-3": "bhi.co.th",
  "ins-4": "krungthaipanich.co.th",
  "ins-5": "kwi.co.th",
  "ins-6": "kwi.co.th",
  "ins-7": "chubb.com",
  "ins-8": "chubb.com",
  "ins-9": "dhipaya.co.th",
  "ins-10": "dhipaya-life.co.th",
  "ins-11": "thailife.com",
  "ins-12": "indara.co.th",
  "ins-13": "navakij.co.th",
  "ins-14": "muangthaiinsurance.com",
  "ins-15": "muangthai.co.th",
  "ins-16": "manulife.co.th",
  "ins-17": "bdms.co.th",
  "ins-18": "viriyah.co.th",
  "ins-19": "siamcityinsurance.com",
  "ins-20": "smk.co.th",
  "ins-21": "azay.co.th",
  "ins-22": "seic.co.th",
  "ins-23": "selic.co.th",
  "ins-24": "asiainsurance.co.th",
  "ins-25": "msig-thai.com",
  "ins-26": "aia.co.th",
  "ins-27": "axa.co.th",
  "ins-28": "ioibkk.co.th",
  "ins-29": "falconinsurance.co.th",
  "ins-30": "prudential.co.th",
  "ins-31": "pacificcross.co.th",
  "ins-32": "ocean.co.th",
  "ins-33": "generali.co.th",
  "ins-34": "fwd.co.th",
  "ins-35": "scblife.co.th",

  // self-insured.json (standalone)
  "si-1": "bakerhughes.com",
  "si-2": "starbucks.co.th",
  "si-3": "datapath.com",
  "si-4": "ge.com",
  "si-5": "megawecare.com",
  "si-6": "pruksa.com",
  "si-7": "scgchemicals.com",
  "si-8": "thaibev.com",
  "si-9": "thaiunion.com",
  "si-10": "scg.com",
  "si-11": "true.th",
  "si-12": "boonrawd.co.th",
  "si-13": "pttplc.com",
  "si-14": "centralretail.com",
  "si-15": "minor.com",

  // self-insured groups - Carabao
  "si-grp-cb1": "carabaogroup.com",
  "si-grp-cb2": "carabaogroup.com",
  "si-grp-cb3": "carabaogroup.com",
  "si-grp-cb4": "carabaogroup.com",
  "si-grp-cb5": "carabaogroup.com",
  "si-grp-cb6": "carabaogroup.com",
  "si-grp-cb7": "carabaogroup.com",
  "si-grp-cb8": "carabaogroup.com",
  "si-grp-cb9": "carabaogroup.com",
  "si-grp-cb10": "carabaogroup.com",
  "si-grp-cb11": "carabaogroup.com",
  "si-grp-cb12": "carabaogroup.com",
  "si-grp-cb13": "carabaogroup.com",
  "si-grp-cb14": "carabaogroup.com",

  // self-insured groups - Blue Venture
  "si-grp-bv1": "blueventuregroup.com",
  "si-grp-bv2": "blueventuregroup.com",
  "si-grp-bv3": "blueventuregroup.com",
  "si-grp-bv4": "blueventuregroup.com",
  "si-grp-bv5": "blueventuregroup.com",

  // international-insurance.json
  "intl-1": "cigna.com",

  // deductible.json
  "ded-1": "prudential.co.th",
};

async function downloadLogo(companyId, domain) {
  const outPath = resolve(LOGOS_DIR, `${companyId}.png`);

  // Try Clearbit first
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;
  try {
    const res = await fetch(clearbitUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.startsWith("image/")) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 100) {
          await writeFile(outPath, buffer);
          return { companyId, source: "clearbit", success: true };
        }
      }
    }
  } catch {
    // fall through to Google
  }

  // Fallback: Google Favicons (128px)
  const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  try {
    const res = await fetch(googleUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 100) {
        await writeFile(outPath, buffer);
        return { companyId, source: "google", success: true };
      }
    }
  } catch {
    // fall through
  }

  return { companyId, source: null, success: false };
}

async function main() {
  if (!existsSync(LOGOS_DIR)) {
    await mkdir(LOGOS_DIR, { recursive: true });
  }

  // Deduplicate: for companies sharing a domain and same group prefix,
  // download once and copy for the rest
  const uniqueDownloads = new Map(); // domain -> first companyId
  const duplicates = []; // { companyId, copyFrom }

  for (const [companyId, domain] of Object.entries(COMPANY_DOMAINS)) {
    // For group children sharing same domain, download once per domain per group
    const groupPrefix = companyId.match(/^(si-grp-cb|si-grp-bv)/)?.[1];
    const key = groupPrefix ? `${groupPrefix}:${domain}` : `${companyId}:${domain}`;

    if (groupPrefix && uniqueDownloads.has(key)) {
      duplicates.push({ companyId, copyFrom: uniqueDownloads.get(key) });
    } else {
      uniqueDownloads.set(key, companyId);
    }
  }

  const toDownload = [...uniqueDownloads.values()];
  console.log(`Downloading logos for ${toDownload.length} unique companies...`);

  // Download in batches of 5 to avoid rate limiting
  const results = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < toDownload.length; i += BATCH_SIZE) {
    const batch = toDownload.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((id) => downloadLogo(id, COMPANY_DOMAINS[id]))
    );
    results.push(...batchResults);

    // Brief pause between batches
    if (i + BATCH_SIZE < toDownload.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Copy logos for duplicates (group children sharing same logo)
  for (const { companyId, copyFrom } of duplicates) {
    const srcPath = resolve(LOGOS_DIR, `${copyFrom}.png`);
    const dstPath = resolve(LOGOS_DIR, `${companyId}.png`);
    const srcResult = results.find((r) => r.companyId === copyFrom);
    if (srcResult?.success && existsSync(srcPath)) {
      const { readFile } = await import("fs/promises");
      const data = await readFile(srcPath);
      await writeFile(dstPath, data);
      results.push({ companyId, source: `copy:${copyFrom}`, success: true });
    } else {
      results.push({ companyId, source: null, success: false });
    }
  }

  // Report
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✓ Downloaded: ${succeeded.length}`);
  for (const r of succeeded) {
    console.log(`  ${r.companyId} (${r.source})`);
  }

  if (failed.length) {
    console.log(`\n✗ Failed: ${failed.length}`);
    for (const r of failed) {
      console.log(`  ${r.companyId}`);
    }
  }

  // Output JSON of successful IDs for easy reference
  const successIds = new Set(succeeded.map((r) => r.companyId));
  console.log(`\nSuccessful IDs: ${JSON.stringify([...successIds])}`);
}

main().catch(console.error);
