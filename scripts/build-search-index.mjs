import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LESSONS_PATH = path.join(ROOT, "src", "data", "lessons.json");
const lessons = fs.existsSync(LESSONS_PATH)
  ? JSON.parse(fs.readFileSync(LESSONS_PATH, "utf-8"))
  : {};
const DOCS_DIR = path.join(ROOT, "public", "docs");
// Members-only. Served by /api/search-index after a KF membership check.
// Never write this under public/ — that path is unauthenticated static hosting.
const OUTPUT = path.join(ROOT, "src", "data", "search-index.json");
if (OUTPUT.includes(`${path.sep}public${path.sep}`)) {
  throw new Error("Search index must not be written under public/");
}

const SECTION_MAP = {
  "toolbox/worksheets": "Toolbox / Worksheets",
  "toolbox/healing-integration": "Toolbox / Healing & Integration",
  "toolbox/mini-meetings": "Mini Meetings + CORE Meetings",
  "toolbox/archived/mindfulness-month": "Archived / Mindfulness Month",
  "toolbox/archived/neurotic-types": "Archived / Neurotic Types",
  "nhg/reading-guides": "NHG / Reading Guides",
  "nhg/introductions": "NHG / Introductions",
  "nhg/kf-intro": "NHG / KF Introductory Meeting",
  "nhg/facilitator": "NHG / Facilitator Resources",
  "other-studies/hpkp": "HPKP Study",
  "other-studies/romans": "Romans Study",
};

function getSectionLabel(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  for (const [prefix, label] of Object.entries(SECTION_MAP)) {
    if (normalized.startsWith(prefix)) return label;
  }
  if (normalized.startsWith("toolbox/")) return "Toolbox";
  if (normalized.startsWith("nhg/")) return "NHG";
  if (normalized.startsWith("other-studies/")) return "Other Studies";
  return "Documents";
}

function cleanFilenameToTitle(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const KEYWORD_MAP = {
  "TAT": ["TAT", "Tapas Acupressure Technique"],
  "RAIN": ["RAIN", "RAIN Process"],
  "FAITH": ["FAITH", "FAITH Process"],
  "UFO": ["UFO", "UFO Hold"],
  "CORE": ["CORE", "CORE Meeting"],
  "NHG": ["NHG", "New Humanity Group", "Book Study"],
  "HPKP": ["HPKP", "Honor Patronage Kinship Purity"],
  "MPG": ["MPG", "Meeting Prep Guide"],
  "Mini Mtg": ["Mini Meeting"],
  "Tapping": ["Tapping", "EFT", "Emotional Freedom Technique"],
  "Wkst": ["Worksheet"],
  "Wksht": ["Worksheet"],
  "Rdg": ["Reading"],
  "Gd": ["Guide"],
  "Fac": ["Facilitator"],
  "Mtg": ["Meeting"],
  "Intro": ["Introduction", "Introductory"],
  "Exp": ["Expanded"],
  "Cndsd": ["Condensed"],
};

function expandKeywords(title) {
  let extra = [];
  for (const [abbr, expansions] of Object.entries(KEYWORD_MAP)) {
    if (title.toLowerCase().includes(abbr.toLowerCase())) {
      extra.push(...expansions);
    }
  }
  return extra.join(" ");
}

function walkDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function main() {
  console.log("Building search index...\n");
  const index = [];

  const allFiles = walkDir(DOCS_DIR);
  console.log(`Found ${allFiles.length} files in public/docs/\n`);

  for (const filePath of allFiles) {
    const relToPublic = path.relative(path.join(ROOT, "public"), filePath).replace(/\\/g, "/");
    const relToDocs = path.relative(DOCS_DIR, filePath);
    const ext = path.extname(filePath).toLowerCase();
    const filename = path.basename(filePath);
    const title = cleanFilenameToTitle(filename);
    const section = getSectionLabel(relToDocs);
    const keywords = expandKeywords(title);

    index.push({
      title,
      path: "/" + relToPublic,
      section,
      content: keywords,
      type: ext.replace(".", ""),
    });
  }

  for (let i = 0; i <= 52; i++) {
    const lesson = lessons[String(i)];
    const text = lesson?.text ?? "";
    index.push({
      title: i === 0 ? "KF Introductory Meeting" : `KF${i} Meeting`,
      path: `/kf/meetings/kf${i}`,
      section: "KF Weekly Meetings",
      content: text,
      type: "page",
    });
  }
  console.log(`Indexed ${Object.keys(lessons).length} KF lessons with full text`);

  const sectionPages = [
    { title: "KF Weekly Meetings", path: "/kf", section: "Navigation" },
    { title: "NHG Book Study", path: "/nhg", section: "Navigation" },
    { title: "KF Toolbox", path: "/toolbox", section: "Navigation" },
    { title: "Other Studies", path: "/other-studies", section: "Navigation" },
    { title: "HPKP Study", path: "/other-studies/hpkp", section: "Navigation" },
    { title: "Romans Bible Study", path: "/other-studies/romans", section: "Navigation" },
    { title: "Mindfulness Month", path: "/other-studies/mindfulness", section: "Navigation" },
    { title: "KF Call Info", path: "/kf/call-info", section: "Navigation" },
    { title: "KF Facilitator Resources", path: "/kf/facilitator", section: "Navigation" },
    { title: "Give a Gift", path: "/give-a-gift", section: "Navigation" },
    { title: "Calendar", path: "/calendar", section: "Navigation" },
  ];
  index.push(...sectionPages.map((p) => ({ ...p, content: "", type: "page" })));

  fs.writeFileSync(OUTPUT, JSON.stringify(index));
  const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2);
  console.log(`Index built: ${index.length} entries, ${sizeMB} MB`);
  console.log(`Written to: ${OUTPUT}`);
}

main();
