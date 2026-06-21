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

const backendDir = path.join(root, "backend");
if (fs.existsSync(backendDir)) {
  throw new Error("Backend must not be included in the GitHub Pages publication folder.");
}

const forbidden = /\b(TODO|placeholder logic|implementar despues)\b/i;
for (const file of requiredFiles) {
  if (!/\.(html|css|js|gs|md|json)$/.test(file)) continue;
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (forbidden.test(text)) {
    throw new Error(`Forbidden unfinished marker found in ${file}`);
  }
  if (text.includes("`r`n")) {
    throw new Error(`Literal newline token found in ${file}`);
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

for (const marker of ["app-console", "data-app-section", "feature-device", "service-app-card", "payment-screen", "projectPortalForm", "projectPortalResult"]) {
  if (!indexHtml.includes(marker)) throw new Error(`Public index missing redesign marker ${marker}`);
}

if (!indexHtml.includes("galleryGrid") || !appJs.includes("listGallery")) {
  throw new Error("Public index must load gallery from the managed backend gallery.");
}

if (indexHtml.includes("4 MB") || adminHtml.includes("4 MB") || appJs.includes("excede 4 MB") || adminJs.includes("excede 4 MB") ||
    indexHtml.includes("20 MB") || adminHtml.includes("20 MB") || appJs.includes("excede 20 MB") || adminJs.includes("excede 20 MB")) {
  throw new Error("Photo upload UI must not force users to reduce normal phone photos to 4 MB or 20 MB.");
}

for (const marker of ["60 MB", "reduce automaticamente", "MAX_PHOTO_BYTES = 60 * 1024 * 1024", "MAX_GALLERY_PHOTO_BYTES = 60 * 1024 * 1024", 'accept="image/*"', "isImageFile"]) {
  if (!(indexHtml + adminHtml + appJs + adminJs).includes(marker)) {
    throw new Error(`Large phone photo support marker missing: ${marker}`);
  }
}

for (const marker of ["optimizeImageDataUrl", "readOptimizedPhoto", "OPTIMIZED_PHOTO_MAX_LENGTH", "mimeType: \"image/jpeg\""]) {
  if (!appJs.includes(marker)) throw new Error(`Public photo uploads must stay optimized before backend submit: ${marker}`);
}

if ((indexHtml.match(/data-app-section=/g) || []).length < 7) {
  throw new Error("Public index must use app sections instead of one long scrolling page.");
}

for (const action of ["submitRequest", "getPublicProject", "approveQuote", "renderProjectPortal", "handlePortalSubmit", "handleQuoteApprovalSubmit", "quoteApprovalForm", "portal-pdf-link"]) {
  if (!appJs.includes(action)) throw new Error(`Public app missing action ${action}`);
}

for (const action of ["listRequests", "getRequest", "updateStatus", "addInternalNote", "createQuote", "sendQuoteEmail", "resendCustomerConfirmation"]) {
  if (!adminJs.includes(action)) throw new Error(`Admin app missing action ${action}`);
}

for (const marker of ["data-quote-from-schedule", "data-quote-open", "visitAdjustmentMode", "visitAdjustmentAmount", "visitAdjustmentNotes", "quoteEditPanel", "focusQuotePanel"]) {
  if (!adminJs.includes(marker)) throw new Error(`Admin quote visit adjustment marker missing ${marker}`);
}

for (const marker of ["renderVisitAdjustment", "visitAdjustmentAmount", "visitAdjustmentNotes"]) {
  if (!appJs.includes(marker)) throw new Error(`Public portal quote adjustment marker missing ${marker}`);
}

for (const marker of ["data-admin-panel", "data-admin-tab", "admin-mobile-dock", "scheduleForm", "scheduleWeek", "scheduleTable", "reportMetrics", "activityLogList", "galleryForm", "galleryPhotoInput", "galleryTable", "galleryAdminGrid", "paymentSettingsForm", "emailSettingsForm", "userForm", "usersTable", "operationsSettingsForm", "quoteConsole"]) {
  if (!adminHtml.includes(marker)) throw new Error(`Admin app missing operations marker ${marker}`);
}

if ((adminHtml.match(/data-admin-panel=/g) || []).length < 10) {
  throw new Error("Admin must use separated app sections for dashboard, requests, quotes, schedule, gallery, reports, payments, emails, users, and settings.");
}

for (const marker of ["bindAdminNavigation", "renderSchedule", "bindScheduleTools", "renderReports", "bindReportTools", "exportReportCsv", "exportScheduleCsv", "logActivity", "renderGalleryManager", "bindGalleryTools", "renderPaymentSettings", "renderEmailSettings", "renderUsers", "renderApprovalPanel", "renderProjectPhotoPanel", "projectPhotoForm", "projectPhotoInput", "generateQuotePdfBtn", "quote-pdf-link", "listSchedule", "upsertSchedule", "deleteSchedule", "approval-panel", "data-delete-gallery", "data-delete-user", "data-delete-payment"]) {
  if (!adminJs.includes(marker)) throw new Error(`Admin logic missing management marker ${marker}`);
}

for (const marker of ["optimizeImageDataUrl", "readGalleryPhoto", "OPTIMIZED_GALLERY_PHOTO_MAX_LENGTH", "mimeType: \"image/jpeg\""]) {
  if (!adminJs.includes(marker)) throw new Error(`Admin gallery uploads must stay optimized before backend submit: ${marker}`);
}

console.log("Smoke checks passed");

