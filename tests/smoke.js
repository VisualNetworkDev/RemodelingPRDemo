const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "admin.html",
  "styles.css",
  "app.js",
  "admin.js",
  "README.md",
  "backend/Code.gs",
  "backend/Sheets.gs",
  "backend/Messages.gs",
  "backend/appsscript.json",
  "backend/.clasp.json"
];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const backendDir = path.join(root, "backend");
const expectedGsFiles = ["Code.gs", "Messages.gs", "Sheets.gs"];
const gsFiles = fs.readdirSync(backendDir).filter((file) => file.endsWith(".gs")).sort();
if (JSON.stringify(gsFiles) !== JSON.stringify(expectedGsFiles)) {
  throw new Error(`Backend must stay organized in exactly 3 .gs files: ${expectedGsFiles.join(", ")}. Found: ${gsFiles.join(", ")}`);
}

const forbidden = /\b(TODO|placeholder logic|implementar despues)\b/i;
for (const file of requiredFiles) {
  if (!/\.(html|css|js|gs|md|json)$/.test(file)) continue;
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (forbidden.test(text)) {
    throw new Error(`Forbidden unfinished marker found in ${file}`);
  }
}

const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const adminHtml = fs.readFileSync(path.join(root, "admin.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");
const adminJs = fs.readFileSync(path.join(root, "admin.js"), "utf8");
const backend = expectedGsFiles
  .map((file) => fs.readFileSync(path.join(backendDir, file), "utf8"))
  .join("\n\n");

const hiddenCopyChecks = [
  ["Apps", "Script"].join(" "),
  ["Google", "Sheets"].join(" "),
  ["Web", "App", "URL"].join(" "),
  ["API", "URL"].join(" "),
  ["Acceso", "admin"].join(" "),
  ["PIN", "admin"].join(" ")
];

for (const visibleText of hiddenCopyChecks) {
  if (indexHtml.includes(visibleText) || adminHtml.includes(visibleText)) {
    throw new Error(`Technical or login text still visible: ${visibleText}`);
  }
}

for (const action of ["submitRequest"]) {
  if (!appJs.includes(action)) throw new Error(`Public app missing action ${action}`);
}

for (const action of ["listRequests", "getRequest", "updateStatus", "addInternalNote", "createQuote", "sendQuoteEmail", "resendCustomerConfirmation"]) {
  if (!adminJs.includes(action)) throw new Error(`Admin app missing action ${action}`);
}

for (const action of ["submitRequest", "listRequests", "updateStatus", "addInternalNote", "createQuote", "sendQuoteEmail", "resendCustomerConfirmation", "setupDemo"]) {
  if (!backend.includes(action)) throw new Error(`Backend missing ${action}`);
}

new Function(backend);

console.log("Smoke checks passed");
