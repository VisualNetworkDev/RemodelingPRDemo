const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "admin.html",
  "styles.css",
  "app.js",
  "admin.js",
  "README.md"
];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${file}`);
  }
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

const publicCopyForbidden = [
  /\bcliente\b/i,
  /sistema visual/i,
  /\bvender\b/i,
  /abre el formulario/i,
  /la pagina guia/i,
  /fotos limpias para explicar/i,
  /menos confusion/i,
  /panel interno/i,
  /seguimiento por panel/i
];

for (const pattern of publicCopyForbidden) {
  if (pattern.test(indexHtml)) {
    throw new Error(`Public index still has unprofessional copy: ${pattern}`);
  }
}

for (const marker of ["app-console", "data-app-section", "feature-device", "service-app-card", "payment-screen"]) {
  if (!indexHtml.includes(marker)) throw new Error(`Public index missing redesign marker ${marker}`);
}

if ((indexHtml.match(/data-app-section=/g) || []).length < 6) {
  throw new Error("Public index must use app sections instead of one long scrolling page.");
}

for (const action of ["submitRequest"]) {
  if (!appJs.includes(action)) throw new Error(`Public app missing action ${action}`);
}

for (const action of ["listRequests", "getRequest", "updateStatus", "addInternalNote", "createQuote", "sendQuoteEmail", "resendCustomerConfirmation"]) {
  if (!adminJs.includes(action)) throw new Error(`Admin app missing action ${action}`);
}

for (const marker of ["data-admin-panel", "data-admin-tab", "admin-mobile-dock", "paymentSettingsForm", "emailSettingsForm", "userForm", "usersTable", "operationsSettingsForm", "quoteConsole"]) {
  if (!adminHtml.includes(marker)) throw new Error(`Admin app missing operations marker ${marker}`);
}

if ((adminHtml.match(/data-admin-panel=/g) || []).length < 7) {
  throw new Error("Admin must use separated app sections for dashboard, requests, quotes, payments, emails, users, and settings.");
}

for (const marker of ["bindAdminNavigation", "renderPaymentSettings", "renderEmailSettings", "renderUsers", "data-delete-user", "data-delete-payment", "formatTimestamp"]) {
  if (!adminJs.includes(marker)) throw new Error(`Admin logic missing management marker ${marker}`);
}

console.log("Smoke checks passed");
