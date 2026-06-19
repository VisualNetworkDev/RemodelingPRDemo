(function () {
  "use strict";

  var DEFAULT_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbzQOOwzme8kzglwPPBMFhdm-Kiaw4UA5VxF0JZBsiH4Ne5HGcf3pWWxHJSegbIBn83wyw/exec";

  var STATUSES = [
    "Pendiente",
    "Contactado",
    "Evaluacion programada",
    "Cotizacion enviada",
    "Aprobado",
    "En progreso",
    "Completado",
    "Cancelado"
  ];

  var SERVICES = [
    "Sellado de techos",
    "Galvalume",
    "Remodelacion interior",
    "Pintura residencial y comercial",
    "Plomeria basica",
    "Reparaciones generales",
    "Mantenimiento de propiedades",
    "Mejoras para negocios/locales comerciales"
  ];

  var DEMO_REQUESTS = [
    {
      id: "ARPR-10003",
      timestamp: "2026-06-18 18:53:29",
      nombre: "Luz Santiago",
      telefono: "+1 939 555 0135",
      email: "luz@example.com",
      pueblo: "Carolina",
      servicio: "Remodelacion interior",
      fechaPreferida: "2026-07-02",
      estado: "Evaluacion programada",
      totalCotizado: 0,
      fotosUrls: [
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80"
      ]
    },
    {
      id: "ARPR-10002",
      timestamp: "2026-06-18 18:53:18",
      nombre: "Carlos Medina",
      telefono: "+1 787 555 0190",
      email: "carlos@example.com",
      pueblo: "Caguas",
      servicio: "Pintura residencial y comercial",
      fechaPreferida: "2026-06-27",
      estado: "Cotizacion enviada",
      totalCotizado: 1850,
      fotosUrls: [
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80"
      ]
    },
    {
      id: "ARPR-10001",
      timestamp: "2026-06-18 18:53:09",
      nombre: "Mariana Rivera",
      telefono: "+1 787 555 0141",
      email: "mariana@example.com",
      pueblo: "Bayamon",
      servicio: "Sellado de techos",
      fechaPreferida: "2026-06-24",
      estado: "Pendiente",
      totalCotizado: 0,
      fotosUrls: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80"
      ]
    }
  ];

  var DEMO_GALLERY_ITEMS = [
    {
      id: "GAL-10001",
      title: "Sellado de techo residencial",
      category: "roof",
      type: "Despues",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
      linkUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
      status: "Activo",
      order: 1,
      description: "Referencia visual para trabajos de techo y areas expuestas."
    },
    {
      id: "GAL-10002",
      title: "Estructura y cubierta exterior",
      category: "roof",
      type: "Proceso",
      imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
      linkUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
      status: "Activo",
      order: 2,
      description: "Trabajos exteriores con materiales y alcance visible."
    },
    {
      id: "GAL-10003",
      title: "Remodelacion interior limpia",
      category: "interior",
      type: "Despues",
      imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
      linkUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      status: "Activo",
      order: 3,
      description: "Referencia de interiores terminados y presentacion residencial."
    },
    {
      id: "GAL-10004",
      title: "Mejora para local comercial",
      category: "commercial",
      type: "Despues",
      imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      linkUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
      status: "Activo",
      order: 4,
      description: "Espacios comerciales preparados para operar con mejor imagen."
    }
  ];

  var ADMIN_VIEWS = {
    dashboard: {
      eyebrow: "Operacion",
      title: "Panel de gestion",
      subtitle: "Control de consultas, cotizaciones, pagos, correos, usuarios y ajustes del negocio."
    },
    requests: {
      eyebrow: "Bandeja",
      title: "Consultas recibidas",
      subtitle: "Filtra solicitudes, abre detalles, actualiza estados y prepara cotizaciones."
    },
    quotes: {
      eyebrow: "Propuestas",
      title: "Cotizaciones",
      subtitle: "Revisa proyectos con fotos, costos, deposito y envio de propuesta."
    },
    schedule: {
      eyebrow: "Agenda",
      title: "Agenda operativa",
      subtitle: "Organiza evaluaciones, seguimientos, responsables y proximos pasos por proyecto."
    },
    gallery: {
      eyebrow: "Galeria",
      title: "Galeria publica",
      subtitle: "Sube, ordena, pausa o borra las fotos que aparecen en el index."
    },
    reports: {
      eyebrow: "Reportes",
      title: "Reportes y logs",
      subtitle: "Revisa demanda, valor cotizado, pipeline y actividad reciente del panel."
    },
    payments: {
      eyebrow: "Pagos",
      title: "Configuracion de pagos",
      subtitle: "Metodos activos, deposito por defecto e instrucciones para propuestas."
    },
    emails: {
      eyebrow: "Correos",
      title: "Mensajes del sistema",
      subtitle: "Asuntos, firma y plantillas para confirmaciones y cotizaciones."
    },
    users: {
      eyebrow: "Equipo",
      title: "Usuarios y permisos",
      subtitle: "Roles preparados para separar permisos cuando se active el acceso por usuario."
    },
    settings: {
      eyebrow: "Ajustes",
      title: "Reglas operativas",
      subtitle: "Servicios, estados, zona de trabajo y reglas internas del panel."
    }
  };

  var ADMIN_SETTINGS_KEY = "atlas-remodeling-admin-settings-v1";
  var ADMIN_SCHEDULE_KEY = "atlas-remodeling-schedule-v1";
  var ADMIN_ACTIVITY_LOG_KEY = "atlas-remodeling-activity-log-v1";
  var MAX_GALLERY_PHOTO_BYTES = 4 * 1024 * 1024;
  var OPTIMIZED_GALLERY_PHOTO_MAX_LENGTH = 950000;
  var GALLERY_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

  var DEFAULT_ADMIN_SETTINGS = {
    payments: {
      defaultDeposit: "35% para separar fecha de comienzo",
      paymentName: "Atlas Remodeling PR",
      paymentInstructions: "La forma de pago se coordina antes de recibir deposito. El balance se confirma por etapa o al finalizar, segun el alcance.",
      confirmationNote: "La fecha se confirma cuando la duena valida el deposito o el acuerdo de pago.",
      methods: [
        { id: "PAY-ATH", name: "ATH Movil", status: "Activo", details: "Disponible para deposito y pagos rapidos." },
        { id: "PAY-ZELLE", name: "Zelle", status: "Activo", details: "Confirmar correo o telefono antes de enviar." },
        { id: "PAY-BANK", name: "Transferencia bancaria", status: "Activo", details: "Se comparte solo cuando la propuesta sea aprobada." },
        { id: "PAY-CASH", name: "Efectivo", status: "Activo", details: "Disponible para visitas y balances finales." }
      ]
    },
    emails: {
      replyEmail: "info@atlasremodelingpr.com",
      signatureName: "Atlas Remodeling PR",
      confirmationSubject: "Recibimos tu solicitud de evaluacion",
      quoteSubject: "Cotizacion de proyecto - Atlas Remodeling PR",
      emailSignature: "Gracias por considerar a Atlas Remodeling PR. Coordinamos cada detalle antes de comenzar el trabajo.",
      templates: [
        { id: "TPL-CONF", name: "Confirmacion de solicitud", status: "Activo", summary: "Mensaje automatico cuando entra una consulta nueva." },
        { id: "TPL-QUOTE", name: "Cotizacion enviada", status: "Activo", summary: "Propuesta con fotos, total, deposito y opciones de pago." },
        { id: "TPL-STATUS", name: "Cambio de estado", status: "Activo", summary: "Actualizacion breve cuando el proyecto cambia de fase." }
      ]
    },
    users: [
      { id: "USR-001", name: "Duena del negocio", email: "owner@atlasremodelingpr.com", role: "Duena", status: "Activo", permissions: ["Consultas", "Cotizaciones", "Pagos", "Correos", "Ajustes"] },
      { id: "USR-002", name: "Coordinador de proyectos", email: "coordinador@atlasremodelingpr.com", role: "Supervisor", status: "Activo", permissions: ["Consultas", "Cotizaciones", "Correos"] },
      { id: "USR-003", name: "Asistente administrativo", email: "asistente@atlasremodelingpr.com", role: "Asistente", status: "Pausado", permissions: ["Consultas"] }
    ],
    operations: {
      businessName: "Atlas Remodeling PR",
      businessPhone: "+1 787 555 0120",
      serviceArea: "Puerto Rico",
      quoteValidity: "15 dias",
      processNote: "Confirmar alcance, fotos, fecha disponible, deposito y balance antes de comenzar."
    }
  };

  var state = {
    requests: [],
    gallery: [],
    galleryPhoto: null,
    stats: {},
    detail: null,
    adminSettings: loadAdminSettings(),
    schedule: loadScheduleEvents(),
    activityLog: loadActivityLog(),
    adminView: "dashboard"
  };

  var adminViewEyebrow = document.getElementById("adminViewEyebrow");
  var adminViewTitle = document.getElementById("adminViewTitle");
  var adminViewSubtitle = document.getElementById("adminViewSubtitle");
  var adminAlert = document.getElementById("adminAlert");
  var statsGrid = document.getElementById("statsGrid");
  var pipelineBoard = document.getElementById("pipelineBoard");
  var pipelineCount = document.getElementById("pipelineCount");
  var nextActions = document.getElementById("nextActions");
  var serviceMix = document.getElementById("serviceMix");
  var requestsTable = document.getElementById("requestsTable");
  var searchInput = document.getElementById("searchInput");
  var statusFilter = document.getElementById("statusFilter");
  var serviceFilter = document.getElementById("serviceFilter");
  var sortOrder = document.getElementById("sortOrder");
  var refreshBtn = document.getElementById("refreshBtn");
  var scheduleForm = document.getElementById("scheduleForm");
  var scheduleFormTitle = document.getElementById("scheduleFormTitle");
  var scheduleRequest = document.getElementById("scheduleRequest");
  var scheduleAssignee = document.getElementById("scheduleAssignee");
  var clearScheduleFormBtn = document.getElementById("clearScheduleForm");
  var scheduleWeek = document.getElementById("scheduleWeek");
  var scheduleTable = document.getElementById("scheduleTable");
  var exportScheduleCsvBtn = document.getElementById("exportScheduleCsv");
  var reportMetrics = document.getElementById("reportMetrics");
  var reportServiceTable = document.getElementById("reportServiceTable");
  var reportStatusList = document.getElementById("reportStatusList");
  var activityLogList = document.getElementById("activityLogList");
  var exportReportCsvBtn = document.getElementById("exportReportCsv");
  var clearActivityLogBtn = document.getElementById("clearActivityLog");
  var detailModal = document.getElementById("detailModal");
  var detailBody = document.getElementById("detailBody");
  var detailTitle = document.getElementById("detailTitle");
  var closeDetailBtn = document.getElementById("closeDetailBtn");
  var quoteConsole = document.getElementById("quoteConsole");
  var galleryForm = document.getElementById("galleryForm");
  var galleryFormTitle = document.getElementById("galleryFormTitle");
  var galleryPhotoInput = document.getElementById("galleryPhotoInput");
  var galleryPhotoPreview = document.getElementById("galleryPhotoPreview");
  var clearGalleryFormBtn = document.getElementById("clearGalleryForm");
  var galleryAdminGrid = document.getElementById("galleryAdminGrid");
  var galleryTable = document.getElementById("galleryTable");
  var paymentSettingsForm = document.getElementById("paymentSettingsForm");
  var addPaymentMethodForm = document.getElementById("addPaymentMethodForm");
  var paymentMethodList = document.getElementById("paymentMethodList");
  var emailSettingsForm = document.getElementById("emailSettingsForm");
  var emailTemplateList = document.getElementById("emailTemplateList");
  var userForm = document.getElementById("userForm");
  var clearUserFormBtn = document.getElementById("clearUserForm");
  var usersTable = document.getElementById("usersTable");
  var userFormTitle = document.getElementById("userFormTitle");
  var operationsSettingsForm = document.getElementById("operationsSettingsForm");
  var serviceSettingsList = document.getElementById("serviceSettingsList");
  var statusSettingsList = document.getElementById("statusSettingsList");

  function endpointUrl() {
    return (DEFAULT_ENDPOINT_URL || "").trim();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeAdminSettings(saved) {
    var base = clone(DEFAULT_ADMIN_SETTINGS);
    if (!saved || typeof saved !== "object") return base;
    base.payments = Object.assign(base.payments, saved.payments || {});
    base.emails = Object.assign(base.emails, saved.emails || {});
    base.operations = Object.assign(base.operations, saved.operations || {});
    if (Array.isArray(saved.payments && saved.payments.methods)) base.payments.methods = saved.payments.methods;
    if (Array.isArray(saved.emails && saved.emails.templates)) base.emails.templates = saved.emails.templates;
    if (Array.isArray(saved.users)) base.users = saved.users;
    return base;
  }

  function loadAdminSettings() {
    try {
      return mergeAdminSettings(JSON.parse(localStorage.getItem(ADMIN_SETTINGS_KEY) || "null"));
    } catch (error) {
      return clone(DEFAULT_ADMIN_SETTINGS);
    }
  }

  function saveAdminSettings() {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(state.adminSettings));
  }

  function readStoredArray(key) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function loadScheduleEvents() {
    return readStoredArray(ADMIN_SCHEDULE_KEY);
  }

  function saveScheduleEvents() {
    localStorage.setItem(ADMIN_SCHEDULE_KEY, JSON.stringify(state.schedule || []));
  }

  function loadActivityLog() {
    return readStoredArray(ADMIN_ACTIVITY_LOG_KEY);
  }

  function saveActivityLog() {
    localStorage.setItem(ADMIN_ACTIVITY_LOG_KEY, JSON.stringify(state.activityLog || []));
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function todayIso() {
    var now = new Date();
    return now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate());
  }

  function localTimestamp() {
    var now = new Date();
    var suffix = now.getHours() >= 12 ? "PM" : "AM";
    var hour = now.getHours() % 12 || 12;
    return now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate()) + " " + hour + ":" + pad2(now.getMinutes()) + " " + suffix;
  }

  function formatTime12(value) {
    var text = String(value || "").trim();
    if (!text) return "";
    var match12 = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) return Number(match12[1]) + ":" + match12[2] + " " + match12[3].toUpperCase();
    var match24 = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match24) return text;
    var hour = Number(match24[1]);
    var suffix = hour >= 12 ? "PM" : "AM";
    return (hour % 12 || 12) + ":" + match24[2] + " " + suffix;
  }

  function parseIsoDate(value) {
    var text = String(value || "").trim();
    var match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  function dateLabel(value) {
    var date = parseIsoDate(value);
    if (!date) return String(value || "");
    var labels = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    return labels[date.getDay()] + " " + pad2(date.getDate()) + "/" + pad2(date.getMonth() + 1);
  }

  function csvEscape(value) {
    var text = String(value === undefined || value === null ? "" : value);
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function downloadCsv(filename, rows) {
    var csv = rows.map(function (row) {
      return row.map(csvEscape).join(",");
    }).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function logActivity(action, detail) {
    state.activityLog = [{
      id: "LOG-" + Date.now(),
      timestamp: localTimestamp(),
      action: action,
      detail: detail || ""
    }].concat(state.activityLog || []).slice(0, 120);
    saveActivityLog();
    renderActivityLog();
    renderReports();
  }

  function nextId(prefix, rows) {
    var number = (rows || []).reduce(function (top, item) {
      var match = String(item.id || "").match(/(\d+)$/);
      return Math.max(top, match ? Number(match[1]) : 0);
    }, 0) + 1;
    return prefix + "-" + String(number).padStart(3, "0");
  }

  function checkedValues(form, name) {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) {
      return input.value;
    });
  }

  function setCheckedValues(form, name, values) {
    var selected = values || [];
    Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]')).forEach(function (input) {
      input.checked = selected.indexOf(input.value) !== -1;
    });
  }

  function esc(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function money(value) {
    var number = Number(value || 0);
    return "$" + (Number.isFinite(number) ? number : 0).toFixed(2);
  }

  function formatTimestamp(value) {
    var text = String(value || "").trim();
    if (!text) return "";
    var match24 = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match24) {
      var hour = Number(match24[4]);
      var minute = match24[5];
      var suffix = hour >= 12 ? "PM" : "AM";
      var hour12 = hour % 12 || 12;
      return match24[1] + "-" + match24[2] + "-" + match24[3] + " " + hour12 + ":" + minute + " " + suffix;
    }
    var match12 = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
    if (match12) {
      return match12[1] + "-" + match12[2] + "-" + match12[3] + " " + Number(match12[4]) + ":" + match12[5] + " " + match12[6].toUpperCase();
    }
    return text;
  }

  function timestampSortValue(value) {
    var text = String(value || "").trim();
    var match24 = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match24) {
      return new Date(Number(match24[1]), Number(match24[2]) - 1, Number(match24[3]), Number(match24[4]), Number(match24[5]), Number(match24[6] || 0)).getTime();
    }
    var match12 = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
    if (match12) {
      var hour = Number(match12[4]) % 12;
      if (match12[6].toUpperCase() === "PM") hour += 12;
      return new Date(Number(match12[1]), Number(match12[2]) - 1, Number(match12[3]), hour, Number(match12[5]), 0).getTime();
    }
    return 0;
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        resolve("");
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = function () {
        reject(new Error("No se pudo leer la foto."));
      };
      reader.readAsDataURL(file);
    });
  }

  function optimizeImageDataUrl(source, options) {
    return new Promise(function (resolve, reject) {
      if (!source) {
        resolve("");
        return;
      }
      var opts = options || {};
      var img = new Image();
      img.onload = function () {
        var maxSide = Number(opts.maxSide || 1700);
        var targetMaxLength = Number(opts.targetMaxLength || OPTIMIZED_GALLERY_PHOTO_MAX_LENGTH);
        var quality = Number(opts.quality || 0.84);
        var minSide = Number(opts.minSide || 760);
        var ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#f7f4ed";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        var dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > targetMaxLength && canvas.width > minSide && canvas.height > minSide) {
          var next = document.createElement("canvas");
          next.width = Math.max(1, Math.round(canvas.width * 0.86));
          next.height = Math.max(1, Math.round(canvas.height * 0.86));
          next.getContext("2d").drawImage(canvas, 0, 0, next.width, next.height);
          canvas.width = next.width;
          canvas.height = next.height;
          canvas.getContext("2d").drawImage(next, 0, 0, canvas.width, canvas.height);
          quality = Math.max(0.64, quality - 0.05);
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (dataUrl.length > targetMaxLength * 1.15) {
          reject(new Error("La foto sigue demasiado pesada. Usa una imagen mas pequena."));
          return;
        }
        resolve(dataUrl);
      };
      img.onerror = function () {
        reject(new Error("No se pudo procesar la foto."));
      };
      img.src = source;
    });
  }

  function readGalleryPhoto(file) {
    if (!file) return Promise.resolve(null);
    if (GALLERY_PHOTO_TYPES.indexOf(file.type) === -1) {
      return Promise.reject(new Error("La foto debe ser JPG, PNG o WEBP."));
    }
    if (file.size > MAX_GALLERY_PHOTO_BYTES) {
      return Promise.reject(new Error("La foto excede 4 MB."));
    }
    return fileToDataUrl(file).then(function (source) {
      return optimizeImageDataUrl(source, {
        maxSide: 1700,
        quality: 0.84,
        targetMaxLength: OPTIMIZED_GALLERY_PHOTO_MAX_LENGTH,
        minSide: 780
      });
    }).then(function (dataUrl) {
      return {
        name: String(file.name || "galeria.jpg").replace(/\.[^.]+$/, "") + ".jpg",
        originalName: file.name,
        size: file.size,
        optimizedSize: Math.round(dataUrl.length * 0.75),
        mimeType: "image/jpeg",
        dataUrl: dataUrl
      };
    });
  }

  function setAlert(type, message) {
    if (!adminAlert) return;
    adminAlert.className = "admin-alert show " + (type || "");
    adminAlert.textContent = message || "";
  }

  function clearAlert() {
    if (!adminAlert) return;
    adminAlert.className = "admin-alert";
    adminAlert.textContent = "";
  }

  function sendAction(action, payload) {
    var url = endpointUrl();
    if (!url) {
      return Promise.resolve({ ok: false, message: "La conexion del panel no esta configurada." });
    }
    return fetch(url, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: action, payload: payload || {} })
    }).then(function (response) {
      return response.text().then(function (text) {
        try {
          return JSON.parse(text);
        } catch (error) {
          return { ok: false, message: "No se pudo leer la informacion recibida." };
        }
      });
    }).catch(function () {
      return {
        ok: false,
        message: "No se pudo cargar la informacion. Revisa que el proyecto publicado este autorizado."
      };
    });
  }

  function requireOk(response) {
    if (!response || !response.ok) {
      throw new Error((response && response.message) || "Operacion fallida.");
    }
    return response.data || {};
  }

  function populateSelect(select, items) {
    if (!select) return;
    var current = select.value;
    select.innerHTML = '<option value="">Todos</option>';
    items.forEach(function (item) {
      var label = typeof item === "string" ? item : item.name;
      var option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      select.appendChild(option);
    });
    select.value = current;
  }

  function initFilters() {
    populateSelect(statusFilter, STATUSES);
    populateSelect(serviceFilter, SERVICES);
  }

  function loadServices() {
    return sendAction("getServices", {}).then(requireOk).then(function (data) {
      if (Array.isArray(data.statuses)) STATUSES = data.statuses;
      if (Array.isArray(data.services)) {
        SERVICES = data.services.map(function (service) { return service.name || service; });
      }
      initFilters();
    }).catch(function () {
      initFilters();
    });
  }

  function loadDashboard() {
    clearAlert();
    renderPreviewDashboard();
    return Promise.all([
      sendAction("getDashboardStats", {}).then(requireOk),
      sendAction("listRequests", {}).then(requireOk)
    ]).then(function (results) {
      var liveRequests = results[1].requests || [];
      state.requests = liveRequests.length ? liveRequests : DEMO_REQUESTS.slice();
      state.stats = liveRequests.length ? (results[0].stats || {}) : calculateStats(state.requests);
      renderStats();
      renderOperations();
      renderRequests();
      renderAdminTools();
    }).catch(function (error) {
      setAlert("error", error.message + " Mostrando datos demo mientras se recupera la conexion.");
      renderStats();
      renderOperations();
      renderRequests();
      renderAdminTools();
    });
  }

  function loadingCards() {
    return [1, 2, 3, 4, 5, 6, 7].map(function () {
      return '<article class="stat-card"><span>Cargando</span><strong>...</strong></article>';
    }).join("");
  }

  function renderPreviewDashboard() {
    state.requests = DEMO_REQUESTS.slice();
    state.stats = calculateStats(state.requests);
    renderStats();
    renderOperations();
    renderRequests();
    renderAdminTools();
  }

  function calculateStats(rows) {
    var stats = { total: rows.length };
    STATUSES.forEach(function (status) { stats[status] = 0; });
    rows.forEach(function (request) {
      var status = request.estado || "Pendiente";
      stats[status] = (stats[status] || 0) + 1;
    });
    return stats;
  }

  function renderStats() {
    var labels = [
      ["Total", "total"],
      ["Pendientes", "Pendiente"],
      ["Contactadas", "Contactado"],
      ["Cotizaciones", "Cotizacion enviada"],
      ["Aprobadas", "Aprobado"],
      ["En progreso", "En progreso"],
      ["Completadas", "Completado"]
    ];
    statsGrid.innerHTML = labels.map(function (item) {
      return '<article class="stat-card"><span>' + esc(item[0]) + '</span><strong>' + esc(state.stats[item[1]] || 0) + '</strong></article>';
    }).join("");
  }

  function renderOperations() {
    renderPipeline();
    renderNextActions();
    renderServiceMix();
  }

  function renderAdminTools() {
    renderQuoteConsole();
    renderSchedule();
    renderGalleryManager();
    renderReports();
    renderPaymentSettings();
    renderEmailSettings();
    renderUsers();
    renderOperationsSettings();
  }

  function quoteStatusLabel(request) {
    if (request.estado === "Cotizacion enviada" || Number(request.totalCotizado || 0) > 0) return "Enviada";
    if (request.estado === "Evaluacion programada") return "Lista para preparar";
    if (request.estado === "Aprobado") return "Aprobada";
    return "Pendiente";
  }

  function renderQuoteConsole() {
    if (!quoteConsole) return;
    var rows = state.requests.length ? state.requests : DEMO_REQUESTS;
    quoteConsole.innerHTML = rows.map(function (request) {
      var photo = request.fotosUrls && request.fotosUrls[0] ? request.fotosUrls[0] : "";
      return '<article class="quote-console-card">' +
        '<div class="quote-console-media">' +
          (photo ? '<img src="' + esc(photo) + '" alt="Proyecto ' + esc(request.id) + '">' : '<span>Sin foto</span>') +
        '</div>' +
        '<div class="quote-console-copy">' +
          '<span class="status-pill ' + statusClass(request.estado) + '">' + esc(quoteStatusLabel(request)) + '</span>' +
          '<h3>' + esc(request.nombre) + '</h3>' +
          '<p>' + esc(request.servicio) + ' - ' + esc(request.pueblo) + '</p>' +
          '<strong>' + money(request.totalCotizado) + '</strong>' +
          '<div class="row-actions">' +
            '<button class="btn secondary small" type="button" data-open="' + esc(request.id) + '">Abrir ficha</button>' +
            '<button class="btn primary small" type="button" data-open="' + esc(request.id) + '">Editar cotizacion</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  function requestById(requestId) {
    return (state.requests || []).filter(function (request) { return request.id === requestId; })[0] || null;
  }

  function requestLabel(request) {
    if (!request) return "Sin consulta";
    return request.id + " - " + request.nombre + " - " + request.servicio;
  }

  function populateScheduleSelectors() {
    if (scheduleRequest) {
      var currentRequest = scheduleRequest.value;
      scheduleRequest.innerHTML = '<option value="">Sin consulta</option>' + (state.requests || []).map(function (request) {
        return '<option value="' + esc(request.id) + '">' + esc(requestLabel(request)) + '</option>';
      }).join("");
      scheduleRequest.value = currentRequest;
    }
    if (scheduleAssignee) {
      var currentAssignee = scheduleAssignee.value;
      var users = (state.adminSettings.users || []).filter(function (user) { return user.status !== "Pausado"; });
      scheduleAssignee.innerHTML = users.map(function (user) {
        return '<option value="' + esc(user.name) + '">' + esc(user.name + " - " + user.role) + '</option>';
      }).join("") || '<option>Equipo</option>';
      scheduleAssignee.value = currentAssignee || (users[0] && users[0].name) || "Equipo";
    }
  }

  function preferredDateForRequest(request) {
    var raw = request && (request.fechaPreferida || request.preferredDate || "");
    var parsed = parseIsoDate(raw);
    if (!parsed) return "";
    return parsed.getFullYear() + "-" + pad2(parsed.getMonth() + 1) + "-" + pad2(parsed.getDate());
  }

  function derivedRequestSchedule() {
    return (state.requests || []).filter(function (request) {
      return ["Completado", "Cancelado"].indexOf(request.estado) === -1 && preferredDateForRequest(request);
    }).map(function (request) {
      var type = request.estado === "Cotizacion enviada" ? "Seguimiento" : "Evaluacion";
      return {
        id: "REQ-" + request.id,
        requestId: request.id,
        type: type,
        date: preferredDateForRequest(request),
        time: "09:00",
        assignee: "Equipo",
        status: request.estado === "Evaluacion programada" ? "Confirmado" : "Programado",
        priority: request.urgencia || "Normal",
        notes: "Fecha preferida enviada desde la consulta publica.",
        derived: true
      };
    });
  }

  function allScheduleEvents() {
    return (state.schedule || []).concat(derivedRequestSchedule()).sort(function (a, b) {
      var left = String(a.date || "") + " " + String(a.time || "");
      var right = String(b.date || "") + " " + String(b.time || "");
      return left.localeCompare(right);
    });
  }

  function weekDates() {
    var start = parseIsoDate(todayIso()) || new Date();
    return [0, 1, 2, 3, 4, 5, 6].map(function (offset) {
      var date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
      return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
    });
  }

  function eventProjectLabel(event) {
    var request = requestById(event.requestId);
    if (request) return request.nombre + " - " + request.pueblo;
    return event.notes ? event.notes.slice(0, 42) : "Evento interno";
  }

  function eventStatusClass(status) {
    if (status === "Completado" || status === "Confirmado") return "ok";
    if (status === "Cancelado") return "danger";
    if (status === "En progreso") return "";
    return "warn";
  }

  function renderScheduleWeek(events) {
    if (!scheduleWeek) return;
    var dates = weekDates();
    scheduleWeek.innerHTML = dates.map(function (date) {
      var dayEvents = events.filter(function (event) { return event.date === date; });
      return '<article class="schedule-day">' +
        '<strong>' + esc(dateLabel(date)) + '</strong>' +
        (dayEvents.length ? dayEvents.slice(0, 3).map(function (event) {
          return '<button type="button" data-schedule-open="' + esc(event.id) + '" class="schedule-event ' + (event.derived ? "is-derived" : "") + '">' +
            '<span>' + esc(formatTime12(event.time)) + '</span>' +
            '<b>' + esc(event.type) + '</b>' +
            '<small>' + esc(eventProjectLabel(event)) + '</small>' +
          '</button>';
        }).join("") : '<em>Libre</em>') +
      '</article>';
    }).join("");
  }

  function renderScheduleTable(events) {
    if (!scheduleTable) return;
    if (!events.length) {
      scheduleTable.innerHTML = '<tr><td data-label="Agenda" colspan="6">' +
        renderEmptyState("Agenda libre", "Programa evaluaciones, seguimientos o inicio de trabajo desde el formulario.") +
        '</td></tr>';
      return;
    }
    scheduleTable.innerHTML = events.map(function (event) {
      var request = requestById(event.requestId);
      return '<tr data-schedule-id="' + esc(event.id) + '">' +
        '<td data-label="Fecha"><strong>' + esc(dateLabel(event.date)) + '</strong><br><small>' + esc(formatTime12(event.time)) + '</small></td>' +
        '<td data-label="Proyecto">' + esc(request ? request.nombre : "Interno") + '<br><small>' + esc(request ? request.servicio + " - " + request.pueblo : event.notes || "") + '</small></td>' +
        '<td data-label="Tipo">' + esc(event.type) + '<br><small>' + esc(event.priority || "Normal") + '</small></td>' +
        '<td data-label="Responsable">' + esc(event.assignee || "Equipo") + '</td>' +
        '<td data-label="Estado"><span class="status-pill ' + eventStatusClass(event.status) + '">' + esc(event.status || "Programado") + '</span></td>' +
        '<td data-label="Acciones"><div class="row-actions">' +
          (request ? '<button class="btn secondary small" type="button" data-open="' + esc(request.id) + '">Ficha</button>' : "") +
          (event.derived ? '<span class="status-pill warn">Consulta</span>' :
            '<button class="btn secondary small" type="button" data-edit-schedule>Editar</button>' +
            '<button class="btn secondary small" type="button" data-complete-schedule>Completar</button>' +
            '<button class="btn danger small" type="button" data-delete-schedule>Borrar</button>') +
        '</div></td>' +
      '</tr>';
    }).join("");
  }

  function renderSchedule() {
    populateScheduleSelectors();
    var events = allScheduleEvents();
    renderScheduleWeek(events);
    renderScheduleTable(events);
    if (scheduleForm && !scheduleForm.elements.date.value) {
      scheduleForm.elements.date.value = todayIso();
      scheduleForm.elements.time.value = "09:00";
    }
  }

  function clearScheduleForm() {
    if (!scheduleForm) return;
    scheduleForm.reset();
    scheduleForm.elements.eventId.value = "";
    scheduleForm.elements.date.value = todayIso();
    scheduleForm.elements.time.value = "09:00";
    if (scheduleFormTitle) scheduleFormTitle.textContent = "Programar evento";
    populateScheduleSelectors();
  }

  function fillScheduleForm(eventId) {
    if (!scheduleForm) return;
    var event = (state.schedule || []).filter(function (item) { return item.id === eventId; })[0];
    if (!event) return;
    scheduleForm.elements.eventId.value = event.id;
    scheduleForm.elements.type.value = event.type || "Evaluacion";
    scheduleForm.elements.requestId.value = event.requestId || "";
    scheduleForm.elements.date.value = event.date || todayIso();
    scheduleForm.elements.time.value = event.time || "09:00";
    scheduleForm.elements.assignee.value = event.assignee || "";
    scheduleForm.elements.status.value = event.status || "Programado";
    scheduleForm.elements.priority.value = event.priority || "Normal";
    scheduleForm.elements.notes.value = event.notes || "";
    if (scheduleFormTitle) scheduleFormTitle.textContent = "Editar evento";
  }

  function schedulePayload() {
    var data = new FormData(scheduleForm);
    return {
      id: String(data.get("eventId") || "").trim() || nextId("SCH", state.schedule),
      type: String(data.get("type") || "Evaluacion"),
      requestId: String(data.get("requestId") || "").trim(),
      date: String(data.get("date") || "").trim(),
      time: String(data.get("time") || "09:00").trim(),
      assignee: String(data.get("assignee") || "Equipo").trim(),
      status: String(data.get("status") || "Programado"),
      priority: String(data.get("priority") || "Normal"),
      notes: String(data.get("notes") || "").trim(),
      updatedAt: localTimestamp()
    };
  }

  function reportSummary() {
    var rows = state.requests || [];
    var quoted = rows.filter(function (request) { return Number(request.totalCotizado || 0) > 0; });
    var totalQuoted = quoted.reduce(function (sum, request) { return sum + Number(request.totalCotizado || 0); }, 0);
    var won = rows.filter(function (request) {
      return ["Aprobado", "En progreso", "Completado"].indexOf(request.estado) !== -1;
    }).length;
    return {
      total: rows.length,
      active: rows.filter(function (request) { return ["Completado", "Cancelado"].indexOf(request.estado) === -1; }).length,
      quotedCount: quoted.length,
      quotedTotal: totalQuoted,
      averageQuote: quoted.length ? totalQuoted / quoted.length : 0,
      conversion: rows.length ? Math.round((won / rows.length) * 100) : 0,
      scheduleCount: allScheduleEvents().length
    };
  }

  function renderReportMetrics(summary) {
    if (!reportMetrics) return;
    var cards = [
      ["Consultas", summary.total],
      ["Activas", summary.active],
      ["Cotizadas", summary.quotedCount],
      ["Valor cotizado", money(summary.quotedTotal)],
      ["Promedio", money(summary.averageQuote)],
      ["Conversion", summary.conversion + "%"],
      ["Agenda", summary.scheduleCount]
    ];
    reportMetrics.innerHTML = cards.map(function (card) {
      return '<article class="stat-card"><span>' + esc(card[0]) + '</span><strong>' + esc(card[1]) + '</strong></article>';
    }).join("");
  }

  function renderReportServices() {
    if (!reportServiceTable) return;
    var byService = {};
    (state.requests || []).forEach(function (request) {
      var key = request.servicio || "Sin servicio";
      if (!byService[key]) byService[key] = { count: 0, quoted: 0 };
      byService[key].count += 1;
      byService[key].quoted += Number(request.totalCotizado || 0);
    });
    var services = Object.keys(byService).sort(function (a, b) {
      return byService[b].count - byService[a].count;
    });
    if (!services.length) {
      reportServiceTable.innerHTML = '<tr><td data-label="Servicios" colspan="4">' + renderMiniEmpty("Sin datos de servicios.") + '</td></tr>';
      return;
    }
    reportServiceTable.innerHTML = services.map(function (service) {
      var row = byService[service];
      return '<tr>' +
        '<td data-label="Servicio"><strong>' + esc(service) + '</strong></td>' +
        '<td data-label="Consultas">' + esc(row.count) + '</td>' +
        '<td data-label="Cotizado">' + money(row.quoted) + '</td>' +
        '<td data-label="Promedio">' + money(row.count ? row.quoted / row.count : 0) + '</td>' +
      '</tr>';
    }).join("");
  }

  function renderReportStatuses() {
    if (!reportStatusList) return;
    var counts = {};
    (state.requests || []).forEach(function (request) {
      counts[request.estado || "Pendiente"] = (counts[request.estado || "Pendiente"] || 0) + 1;
    });
    var max = Object.keys(counts).reduce(function (top, status) { return Math.max(top, counts[status]); }, 1);
    reportStatusList.innerHTML = STATUSES.map(function (status) {
      var count = counts[status] || 0;
      var width = Math.max(8, Math.round((count / max) * 100));
      return '<div class="report-status-row">' +
        '<div><strong>' + esc(status) + '</strong><span>' + count + '</span></div>' +
        '<i style="width:' + width + '%"></i>' +
      '</div>';
    }).join("");
  }

  function renderActivityLog() {
    if (!activityLogList) return;
    var logs = state.activityLog || [];
    if (!logs.length) {
      activityLogList.innerHTML = renderEmptyState("Sin actividad registrada", "Los cambios de agenda, usuarios, pagos, correos, galeria y cotizaciones apareceran aqui.");
      return;
    }
    activityLogList.innerHTML = logs.slice(0, 40).map(function (log) {
      return '<article class="activity-log-item">' +
        '<span>' + esc(log.timestamp) + '</span>' +
        '<strong>' + esc(log.action) + '</strong>' +
        '<p>' + esc(log.detail || "") + '</p>' +
      '</article>';
    }).join("");
  }

  function renderReports() {
    var summary = reportSummary();
    renderReportMetrics(summary);
    renderReportServices();
    renderReportStatuses();
    renderActivityLog();
  }

  function exportScheduleCsv() {
    var rows = [["Fecha", "Hora", "Tipo", "Consulta", "Proyecto", "Responsable", "Estado", "Prioridad", "Notas"]];
    allScheduleEvents().forEach(function (event) {
      var request = requestById(event.requestId);
      rows.push([
        event.date,
        formatTime12(event.time),
        event.type,
        event.requestId,
        request ? request.nombre : "Interno",
        event.assignee,
        event.status,
        event.priority,
        event.notes
      ]);
    });
    downloadCsv("agenda-atlas-remodeling.csv", rows);
    logActivity("Agenda exportada", "Se exporto el calendario operativo en CSV.");
  }

  function exportReportCsv() {
    var summary = reportSummary();
    var rows = [
      ["Metrica", "Valor"],
      ["Consultas", summary.total],
      ["Activas", summary.active],
      ["Cotizadas", summary.quotedCount],
      ["Valor cotizado", summary.quotedTotal],
      ["Promedio cotizado", summary.averageQuote],
      ["Conversion", summary.conversion + "%"],
      [],
      ["ID", "Fecha", "Cliente", "Servicio", "Pueblo", "Estado", "Total cotizado"]
    ];
    (state.requests || []).forEach(function (request) {
      rows.push([request.id, request.timestamp, request.nombre, request.servicio, request.pueblo, request.estado, request.totalCotizado]);
    });
    downloadCsv("reporte-atlas-remodeling.csv", rows);
    logActivity("Reporte exportado", "Se exporto el reporte operativo en CSV.");
  }

  function categoryLabel(category) {
    if (category === "roof") return "Techos";
    if (category === "commercial") return "Comercial";
    return "Interiores";
  }

  function loadGallery() {
    return sendAction("listGallery", { includeInactive: true }).then(requireOk).then(function (data) {
      state.gallery = Array.isArray(data.items) && data.items.length ? data.items : DEMO_GALLERY_ITEMS.slice();
      renderGalleryManager();
    }).catch(function (error) {
      state.gallery = DEMO_GALLERY_ITEMS.slice();
      renderGalleryManager();
      setAlert("error", error.message + " Mostrando galeria demo mientras se recupera la conexion.");
    });
  }

  function renderGalleryManager() {
    var items = (state.gallery && state.gallery.length ? state.gallery : DEMO_GALLERY_ITEMS).slice().sort(function (a, b) {
      return Number(a.order || 99) - Number(b.order || 99);
    });

    if (galleryAdminGrid) {
      galleryAdminGrid.innerHTML = items.map(function (item) {
        return '<article class="gallery-admin-card" data-gallery-id="' + esc(item.id) + '">' +
          '<img src="' + esc(item.imageUrl || item.linkUrl) + '" alt="' + esc(item.title) + '">' +
          '<div><span>' + esc(categoryLabel(item.category)) + ' - ' + esc(item.type || "Despues") + '</span>' +
          '<strong>' + esc(item.title) + '</strong></div>' +
        '</article>';
      }).join("");
    }

    if (galleryTable) {
      galleryTable.innerHTML = items.map(function (item) {
        return '<tr data-gallery-id="' + esc(item.id) + '">' +
          '<td data-label="Foto"><img class="table-thumb" src="' + esc(item.imageUrl || item.linkUrl) + '" alt="' + esc(item.title) + '"></td>' +
          '<td data-label="Titulo"><strong>' + esc(item.title) + '</strong><br><small>' + esc(item.description || "") + '</small></td>' +
          '<td data-label="Categoria">' + esc(categoryLabel(item.category)) + '<br><small>' + esc(item.type || "") + '</small></td>' +
          '<td data-label="Estado"><span class="status-pill ' + (item.status === "Activo" ? "ok" : "warn") + '">' + esc(item.status || "Activo") + '</span></td>' +
          '<td data-label="Orden">' + esc(item.order || 99) + '</td>' +
          '<td data-label="Acciones"><div class="row-actions">' +
            '<button class="btn secondary small" type="button" data-edit-gallery>Editar</button>' +
            '<button class="btn secondary small" type="button" data-toggle-gallery>' + (item.status === "Activo" ? "Pausar" : "Activar") + '</button>' +
            '<button class="btn danger small" type="button" data-delete-gallery>Borrar</button>' +
          '</div></td>' +
        '</tr>';
      }).join("");
    }
  }

  function clearGalleryForm() {
    if (!galleryForm) return;
    galleryForm.reset();
    galleryForm.elements.id.value = "";
    galleryForm.elements.imageUrl.value = "";
    galleryForm.elements.linkUrl.value = "";
    galleryForm.elements.order.value = "99";
    state.galleryPhoto = null;
    if (galleryPhotoInput) galleryPhotoInput.value = "";
    if (galleryPhotoPreview) galleryPhotoPreview.innerHTML = "";
    if (galleryFormTitle) galleryFormTitle.textContent = "Agregar foto";
  }

  function fillGalleryForm(itemId) {
    if (!galleryForm) return;
    var item = state.gallery.filter(function (entry) { return entry.id === itemId; })[0];
    if (!item) return;
    galleryForm.elements.id.value = item.id || "";
    galleryForm.elements.imageUrl.value = item.imageUrl || "";
    galleryForm.elements.linkUrl.value = item.linkUrl || item.imageUrl || "";
    galleryForm.elements.title.value = item.title || "";
    galleryForm.elements.category.value = item.category || "interior";
    galleryForm.elements.type.value = item.type || "Despues";
    galleryForm.elements.order.value = item.order || 99;
    galleryForm.elements.status.value = item.status || "Activo";
    galleryForm.elements.description.value = item.description || "";
    state.galleryPhoto = null;
    if (galleryPhotoInput) galleryPhotoInput.value = "";
    if (galleryPhotoPreview) {
      galleryPhotoPreview.innerHTML = '<img src="' + esc(item.imageUrl || item.linkUrl) + '" alt="' + esc(item.title) + '"><span>Foto actual</span>';
    }
    if (galleryFormTitle) galleryFormTitle.textContent = "Editar foto";
  }

  function galleryPayload() {
    var data = new FormData(galleryForm);
    return {
      id: String(data.get("id") || "").trim(),
      title: String(data.get("title") || "").trim(),
      category: String(data.get("category") || "interior"),
      type: String(data.get("type") || "Despues"),
      status: String(data.get("status") || "Activo"),
      order: data.get("order"),
      description: String(data.get("description") || "").trim(),
      imageUrl: String(data.get("imageUrl") || "").trim(),
      linkUrl: String(data.get("linkUrl") || "").trim(),
      photo: state.galleryPhoto
    };
  }

  function fillForm(form, values) {
    if (!form || !values) return;
    Object.keys(values).forEach(function (key) {
      if (!form.elements[key] || Array.isArray(values[key])) return;
      form.elements[key].value = values[key] || "";
    });
  }

  function renderPaymentSettings() {
    var settings = state.adminSettings.payments;
    fillForm(paymentSettingsForm, settings);
    if (!paymentMethodList) return;
    paymentMethodList.innerHTML = (settings.methods || []).map(function (method) {
      return '<article class="settings-item" data-payment-id="' + esc(method.id) + '">' +
        '<div><strong>' + esc(method.name) + '</strong><span>' + esc(method.details || "") + '</span></div>' +
        '<div class="row-actions">' +
          '<button class="btn secondary small" type="button" data-toggle-payment>' + (method.status === "Activo" ? "Pausar" : "Activar") + '</button>' +
          '<button class="btn danger small" type="button" data-delete-payment>Borrar</button>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  function renderEmailSettings() {
    var settings = state.adminSettings.emails;
    fillForm(emailSettingsForm, settings);
    if (!emailTemplateList) return;
    emailTemplateList.innerHTML = (settings.templates || []).map(function (template) {
      return '<article class="settings-item" data-template-id="' + esc(template.id) + '">' +
        '<div><strong>' + esc(template.name) + '</strong><span>' + esc(template.summary) + '</span></div>' +
        '<span class="status-pill ' + (template.status === "Activo" ? "ok" : "warn") + '">' + esc(template.status) + '</span>' +
      '</article>';
    }).join("");
  }

  function clearUserForm() {
    if (!userForm) return;
    userForm.reset();
    userForm.elements.userId.value = "";
    if (userFormTitle) userFormTitle.textContent = "Agregar usuario";
  }

  function fillUserForm(userId) {
    if (!userForm) return;
    var user = state.adminSettings.users.filter(function (item) { return item.id === userId; })[0];
    if (!user) return;
    userForm.elements.userId.value = user.id;
    userForm.elements.name.value = user.name || "";
    userForm.elements.email.value = user.email || "";
    userForm.elements.role.value = user.role || "Asistente";
    userForm.elements.status.value = user.status || "Activo";
    setCheckedValues(userForm, "permissions", user.permissions || []);
    if (userFormTitle) userFormTitle.textContent = "Editar usuario";
  }

  function renderUsers() {
    if (!usersTable) return;
    var users = state.adminSettings.users || [];
    usersTable.innerHTML = users.map(function (user) {
      return '<tr data-user-id="' + esc(user.id) + '">' +
        '<td data-label="Usuario"><strong>' + esc(user.name) + '</strong><br><small>' + esc(user.email) + '</small></td>' +
        '<td data-label="Rol">' + esc(user.role) + '</td>' +
        '<td data-label="Permisos">' + esc((user.permissions || []).join(", ")) + '</td>' +
        '<td data-label="Estado"><span class="status-pill ' + (user.status === "Activo" ? "ok" : "warn") + '">' + esc(user.status) + '</span></td>' +
        '<td data-label="Acciones"><div class="row-actions">' +
          '<button class="btn secondary small" type="button" data-edit-user>Editar</button>' +
          '<button class="btn secondary small" type="button" data-toggle-user>' + (user.status === "Activo" ? "Pausar" : "Activar") + '</button>' +
          '<button class="btn danger small" type="button" data-delete-user>Borrar</button>' +
        '</div></td>' +
      '</tr>';
    }).join("");
  }

  function renderOperationsSettings() {
    fillForm(operationsSettingsForm, state.adminSettings.operations);
    if (serviceSettingsList) {
      serviceSettingsList.innerHTML = SERVICES.map(function (service) {
        return '<span>' + esc(service) + '</span>';
      }).join("");
    }
    if (statusSettingsList) {
      statusSettingsList.innerHTML = STATUSES.map(function (status) {
        return '<span>' + esc(status) + '</span>';
      }).join("");
    }
  }

  function renderPipeline() {
    if (!pipelineBoard) return;
    var activeRows = state.requests.filter(function (request) {
      return request.estado !== "Completado" && request.estado !== "Cancelado";
    });
    if (pipelineCount) {
      pipelineCount.textContent = activeRows.length + (activeRows.length === 1 ? " activa" : " activas");
    }

    var columns = [
      ["Pendiente", "Nuevas"],
      ["Evaluacion programada", "Evaluacion"],
      ["Cotizacion enviada", "Cotizadas"],
      ["En progreso", "Trabajo"]
    ];

    pipelineBoard.innerHTML = columns.map(function (column) {
      var status = column[0];
      var title = column[1];
      var rows = state.requests.filter(function (request) { return request.estado === status; });
      return '<section class="pipeline-column">' +
        '<div class="pipeline-title"><strong>' + esc(title) + '</strong><span>' + rows.length + '</span></div>' +
        (rows.length ? rows.slice(0, 3).map(renderPipelineItem).join("") : renderMiniEmpty("Sin proyectos en esta fase.")) +
      '</section>';
    }).join("");
  }

  function renderPipelineItem(request) {
    return '<button class="pipeline-item" type="button" data-open="' + esc(request.id) + '">' +
      '<strong>' + esc(request.nombre) + '</strong>' +
      '<span>' + esc(request.servicio) + '</span>' +
      '<small>' + esc(request.pueblo) + ' - ' + esc(request.id) + '</small>' +
    '</button>';
  }

  function renderNextActions() {
    if (!nextActions) return;
    var rows = state.requests.filter(function (request) {
      return ["Pendiente", "Evaluacion programada", "Cotizacion enviada", "Contactado"].indexOf(request.estado) !== -1;
    }).slice(0, 5);

    if (!rows.length) {
      nextActions.innerHTML = renderEmptyState(
        "Sin acciones pendientes",
        "Cuando entren consultas nuevas, aqui aparecera a quien contactar, cotizar o dar seguimiento."
      );
      return;
    }

    nextActions.innerHTML = rows.map(function (request) {
      var label = "Dar seguimiento";
      if (request.estado === "Pendiente") label = "Contactar cliente";
      if (request.estado === "Evaluacion programada") label = "Confirmar visita";
      if (request.estado === "Cotizacion enviada") label = "Verificar respuesta";
      return '<button class="action-item" type="button" data-open="' + esc(request.id) + '">' +
        '<span>' + esc(label) + '</span>' +
        '<strong>' + esc(request.nombre) + '</strong>' +
        '<small>' + esc(request.servicio) + ' - ' + esc(request.telefono) + '</small>' +
      '</button>';
    }).join("");
  }

  function renderServiceMix() {
    if (!serviceMix) return;
    if (!state.requests.length) {
      serviceMix.innerHTML = renderEmptyState(
        "Sin consultas todavia",
        "El resumen por servicio se llenara automaticamente con las solicitudes del formulario publico."
      );
      return;
    }

    var counts = {};
    state.requests.forEach(function (request) {
      counts[request.servicio] = (counts[request.servicio] || 0) + 1;
    });
    var max = Object.keys(counts).reduce(function (top, service) {
      return Math.max(top, counts[service]);
    }, 1);

    serviceMix.innerHTML = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a];
    }).map(function (service) {
      var count = counts[service];
      var width = Math.max(12, Math.round((count / max) * 100));
      return '<div class="service-bar">' +
        '<div><strong>' + esc(service) + '</strong><span>' + count + '</span></div>' +
        '<i style="width:' + width + '%"></i>' +
      '</div>';
    }).join("");
  }

  function renderMiniEmpty(message) {
    return '<p class="mini-empty">' + esc(message) + '</p>';
  }

  function renderEmptyState(title, message) {
    return '<div class="empty-state">' +
      '<strong>' + esc(title) + '</strong>' +
      '<p>' + esc(message) + '</p>' +
    '</div>';
  }

  function statusClass(status) {
    if (status === "Completado" || status === "Aprobado") return "ok";
    if (status === "Cancelado") return "danger";
    if (status === "Pendiente" || status === "Cotizacion enviada") return "warn";
    return "";
  }

  function filteredRequests() {
    var query = String(searchInput.value || "").trim().toLowerCase();
    var status = statusFilter.value;
    var service = serviceFilter.value;
    var rows = state.requests.filter(function (request) {
      var haystack = [
        request.id,
        request.nombre,
        request.telefono,
        request.pueblo,
        request.servicio,
        request.email
      ].join(" ").toLowerCase();
      return (!query || haystack.indexOf(query) !== -1) &&
        (!status || request.estado === status) &&
        (!service || request.servicio === service);
    });
    rows.sort(function (a, b) {
      var direction = sortOrder.value === "asc" ? 1 : -1;
      return direction * (timestampSortValue(a.timestamp) - timestampSortValue(b.timestamp));
    });
    return rows;
  }

  function renderRequests() {
    var rows = filteredRequests();
    if (!rows.length) {
      requestsTable.innerHTML = '<tr><td data-label="Consultas" colspan="9">' +
        renderEmptyState("No hay consultas para esos filtros.", "Cambia los filtros o espera a que entre una solicitud nueva desde la pagina publica.") +
        '</td></tr>';
      return;
    }
    requestsTable.innerHTML = rows.map(function (request) {
      return '<tr>' +
        '<td data-label="ID"><strong>' + esc(request.id) + '</strong></td>' +
        '<td data-label="Fecha">' + esc(formatTimestamp(request.timestamp)) + '</td>' +
        '<td data-label="Cliente">' + esc(request.nombre) + '<br><small>' + esc(request.email) + '</small></td>' +
        '<td data-label="Telefono">' + esc(request.telefono) + '</td>' +
        '<td data-label="Pueblo">' + esc(request.pueblo) + '</td>' +
        '<td data-label="Servicio">' + esc(request.servicio) + '</td>' +
        '<td data-label="Estado"><span class="status-pill ' + statusClass(request.estado) + '">' + esc(request.estado) + '</span></td>' +
        '<td data-label="Total">' + money(request.totalCotizado) + '</td>' +
        '<td data-label="Accion"><button class="btn secondary small" type="button" data-open="' + esc(request.id) + '">Ver</button></td>' +
        '</tr>';
    }).join("");
  }

  function demoDetailForRequest(requestId) {
    var summary = DEMO_REQUESTS.filter(function (request) {
      return request.id === requestId;
    })[0];
    if (!summary) return null;
    var descriptions = {
      "ARPR-10001": "Techo residencial con filtracion menor cerca del area de laundry. Requiere revision de puntos criticos, limpieza y sellador.",
      "ARPR-10002": "Pintura exterior y retoques de fachada para reapertura de local comercial.",
      "ARPR-10003": "Actualizar sala y pasillo con pintura, detalles de pared y reparaciones menores."
    };
    var zones = {
      "ARPR-10001": "Urbanizacion Santa Rosa",
      "ARPR-10002": "Local comercial en avenida principal",
      "ARPR-10003": "Apartamento cerca de Isla Verde"
    };
    var dates = {
      "ARPR-10001": "2026-06-24",
      "ARPR-10002": "2026-06-27",
      "ARPR-10003": "2026-07-02"
    };
    var quote = summary.id === "ARPR-10002" ? {
      QuoteId: "Q-ARPR-10001",
      DescripcionTrabajo: "Preparacion, correcciones menores y pintura exterior de fachada comercial.",
      Materiales: 420,
      ManoObra: 1300,
      OtrosCostos: 180,
      Descuento: 50,
      Tax: 0,
      Total: 1850,
      TiempoEstimado: "2 a 3 dias",
      Validez: "15 dias",
      Notas: "Incluye materiales estandar, proteccion de areas y limpieza basica.",
      OpcionesPago: "ATH Movil | Zelle | Transferencia bancaria",
      DepositoRequerido: "35% para separar fecha de comienzo",
      NotasPago: "La duena confirma el metodo disponible antes de recibir deposito. El balance se coordina por etapa o al finalizar, segun alcance."
    } : {};
    return {
      request: {
        id: summary.id,
        timestamp: summary.timestamp,
        nombre: summary.nombre,
        telefono: summary.telefono,
        email: summary.email,
        pueblo: summary.pueblo,
        servicio: summary.servicio,
        zonaProyecto: zones[summary.id] || summary.pueblo,
        fechaPreferida: dates[summary.id] || "",
        urgencia: summary.estado === "Pendiente" ? "Pronto" : "Normal",
        descripcion: descriptions[summary.id] || "",
        fotosUrls: summary.fotosUrls || [],
        estado: summary.estado,
        quoteId: quote.QuoteId || "",
        totalCotizado: summary.totalCotizado,
        updatedAt: summary.timestamp
      },
      notes: summary.id === "ARPR-10002" ? [
        { Autor: "Equipo", Timestamp: summary.timestamp, Nota: "Confirmar horario antes de visitar el local." }
      ] : [],
      history: [
        { Accion: "Consulta creada", Timestamp: summary.timestamp, Usuario: "Sistema", Detalle: "Registro demo inicial." }
      ],
      quote: quote
    };
  }

  function openDetail(requestId) {
    clearAlert();
    var fallback = demoDetailForRequest(requestId);
    if (fallback) {
      state.detail = fallback;
      renderDetail();
      detailModal.classList.add("open");
    }
    sendAction("getRequest", { requestId: requestId }).then(requireOk).then(function (data) {
      if (fallback && data.request) {
        if (!data.request.fotosUrls || !data.request.fotosUrls.length) {
          data.request.fotosUrls = fallback.request.fotosUrls;
        }
        if (!data.quote || !Object.keys(data.quote).length) {
          data.quote = fallback.quote;
        } else {
          data.quote.OpcionesPago = data.quote.OpcionesPago || fallback.quote.OpcionesPago;
          data.quote.DepositoRequerido = data.quote.DepositoRequerido || fallback.quote.DepositoRequerido;
          data.quote.NotasPago = data.quote.NotasPago || fallback.quote.NotasPago;
        }
      }
      state.detail = data;
      renderDetail();
      detailModal.classList.add("open");
    }).catch(function (error) {
      if (!fallback) {
        setAlert("error", error.message);
      } else {
        setAlert("error", error.message + " Mostrando ficha demo mientras se recupera la conexion.");
      }
    });
  }

  function closeDetail() {
    detailModal.classList.remove("open");
    detailBody.innerHTML = "";
  }

  function kv(label, value) {
    return '<div><span>' + esc(label) + '</span><strong>' + esc(value || "-") + '</strong></div>';
  }

  function renderDetail() {
    var request = state.detail.request;
    var quote = state.detail.quote || {};
    detailTitle.textContent = request.id + " - " + request.nombre;
    detailBody.innerHTML =
      '<div class="detail-grid">' +
        '<section class="detail-panel"><h3>Cliente</h3><div class="kv-list">' +
          kv("Nombre", request.nombre) +
          kv("Telefono", request.telefono) +
          kv("Email", request.email) +
          kv("Pueblo", request.pueblo) +
          kv("Zona", request.zonaProyecto) +
        '</div></section>' +
        '<section class="detail-panel"><h3>Proyecto</h3><div class="kv-list">' +
          kv("Servicio", request.servicio) +
          kv("Prioridad", request.urgencia) +
          kv("Fecha preferida", request.fechaPreferida) +
          kv("Estado", request.estado) +
          kv("Total cotizado", money(request.totalCotizado)) +
        '</div></section>' +
      '</div>' +
      '<section class="detail-panel"><h3>Descripcion</h3><p>' + esc(request.descripcion) + '</p><h3>Fotos del proyecto</h3>' + renderPhotos(request.fotosUrls) + '</section>' +
      renderStatusPanel(request) +
      renderNotesPanel(state.detail.notes || []) +
      renderQuotePanel(quote) +
      renderHistoryPanel(state.detail.history || []);

    bindDetailActions();
    updateQuoteTotal();
  }

  function renderPhotos(urls) {
    if (!urls || !urls.length) return '<p>No hay fotos adjuntas.</p>';
    return '<div class="photo-links quote-photo-grid">' + urls.map(function (url, index) {
      return '<a class="quote-photo-card" href="' + esc(url) + '" target="_blank" rel="noopener">' +
        '<img src="' + esc(url) + '" alt="Foto de proyecto ' + (index + 1) + '">' +
        '<span>Foto ' + (index + 1) + '</span>' +
      '</a>';
    }).join("") + '</div>';
  }

  function statusOptions(selected) {
    return STATUSES.map(function (status) {
      return '<option value="' + esc(status) + '"' + (status === selected ? " selected" : "") + '>' + esc(status) + '</option>';
    }).join("");
  }

  function renderStatusPanel(request) {
    return '<section class="detail-panel">' +
      '<h3>Estado del proyecto</h3>' +
      '<form id="statusForm" class="form-grid">' +
        '<label>Estado<select name="status">' + statusOptions(request.estado) + '</select></label>' +
        '<label class="check-row"><input name="notifyCustomer" type="checkbox"><span>Enviar actualizacion al cliente</span></label>' +
        '<label class="wide">Mensaje opcional<textarea name="message" rows="3"></textarea></label>' +
        '<div class="row-actions wide">' +
          '<button class="btn primary" type="submit">Guardar estado</button>' +
          '<button class="btn secondary" type="button" data-quick-status="Completado">Marcar completado</button>' +
          '<button class="btn danger" type="button" data-quick-status="Cancelado">Cancelar</button>' +
          '<button class="btn secondary" type="button" id="resendConfirmationBtn">Reenviar confirmacion</button>' +
        '</div>' +
      '</form>' +
      '</section>';
  }

  function renderNotesPanel(notes) {
    return '<section class="detail-panel">' +
      '<h3>Notas internas</h3>' +
      '<form id="noteForm" class="form-grid">' +
        '<label class="wide">Nueva nota<textarea name="note" rows="3" required></textarea></label>' +
        '<button class="btn primary wide" type="submit">Guardar nota</button>' +
      '</form>' +
      '<div class="notes-list">' + (notes.length ? notes.map(function (note) {
        return '<article class="note-item"><strong>' + esc(note.Autor) + '</strong><small> ' + esc(formatTimestamp(note.Timestamp)) + '</small><p>' + esc(note.Nota) + '</p></article>';
      }).join("") : '<p>No hay notas internas.</p>') + '</div>' +
      '</section>';
  }

  function quotePaymentOptions(quote) {
    var raw = quote.OpcionesPago || "";
    var options = String(raw).split("|").map(function (item) {
      return item.trim();
    }).filter(Boolean);
    return options.length ? options : ["ATH Movil", "Zelle", "Transferencia bancaria"];
  }

  function paymentChecked(quote, option) {
    return quotePaymentOptions(quote).indexOf(option) !== -1 ? " checked" : "";
  }

  function renderQuotePanel(quote) {
    var request = state.detail.request;
    return '<section class="detail-panel">' +
      '<h3>Cotizacion</h3>' +
      '<div class="quote-media-preview">' +
        '<strong>Fotos incluidas en la propuesta</strong>' +
        renderPhotos(request.fotosUrls) +
      '</div>' +
      '<form id="quoteForm">' +
        '<div class="form-grid">' +
          '<label class="wide">Descripcion del trabajo<textarea name="workDescription" rows="4" required>' + esc(quote.DescripcionTrabajo || "") + '</textarea></label>' +
          '<label>Materiales<input name="materials" type="number" min="0" step="0.01" value="' + esc(quote.Materiales || 0) + '"></label>' +
          '<label>Mano de obra<input name="labor" type="number" min="0" step="0.01" value="' + esc(quote.ManoObra || 0) + '"></label>' +
          '<label>Otros costos<input name="otherCosts" type="number" min="0" step="0.01" value="' + esc(quote.OtrosCostos || 0) + '"></label>' +
          '<label>Descuento<input name="discount" type="number" min="0" step="0.01" value="' + esc(quote.Descuento || 0) + '"></label>' +
          '<label>Tax opcional<input name="tax" type="number" min="0" step="0.01" value="' + esc(quote.Tax || 0) + '"></label>' +
          '<label>Tiempo estimado<input name="estimatedTime" value="' + esc(quote.TiempoEstimado || "") + '"></label>' +
          '<label>Validez<input name="validUntil" value="' + esc(quote.Validez || "15 dias") + '"></label>' +
          '<label class="wide">Notas de la cotizacion<textarea name="quoteNotes" rows="3">' + esc(quote.Notas || "") + '</textarea></label>' +
          '<div class="wide quote-option-block">' +
            '<span>Opciones de pago para enviar con la cotizacion</span>' +
            '<div class="payment-choice-grid">' +
              '<label><input name="paymentOptions" type="checkbox" value="ATH Movil"' + paymentChecked(quote, "ATH Movil") + '> ATH Movil</label>' +
              '<label><input name="paymentOptions" type="checkbox" value="Zelle"' + paymentChecked(quote, "Zelle") + '> Zelle</label>' +
              '<label><input name="paymentOptions" type="checkbox" value="Transferencia bancaria"' + paymentChecked(quote, "Transferencia bancaria") + '> Transferencia bancaria</label>' +
              '<label><input name="paymentOptions" type="checkbox" value="Cheque"' + paymentChecked(quote, "Cheque") + '> Cheque</label>' +
              '<label><input name="paymentOptions" type="checkbox" value="Efectivo"' + paymentChecked(quote, "Efectivo") + '> Efectivo</label>' +
            '</div>' +
          '</div>' +
          '<label>Deposito requerido<input name="depositRequired" value="' + esc(quote.DepositoRequerido || "A coordinar con la duena") + '"></label>' +
          '<label class="wide">Notas de pago<textarea name="paymentNotes" rows="3">' + esc(quote.NotasPago || "La duena confirma la forma de pago disponible, deposito y balance antes de comenzar.") + '</textarea></label>' +
        '</div>' +
        '<div class="quote-total"><span>Total automatico</span><strong id="quoteTotal">$0.00</strong></div>' +
        '<div class="row-actions">' +
          '<button class="btn primary" type="submit">Guardar cotizacion</button>' +
          '<button class="btn secondary" type="button" id="previewQuoteBtn">Vista previa</button>' +
          '<button class="btn secondary" type="button" id="sendQuoteBtn">Enviar cotizacion</button>' +
        '</div>' +
      '</form>' +
      '<iframe id="quotePreviewFrame" class="preview-frame hidden" title="Vista previa de cotizacion"></iframe>' +
      '</section>';
  }

  function renderHistoryPanel(history) {
    return '<section class="detail-panel">' +
      '<h3>Historial</h3>' +
      '<div class="timeline">' + (history.length ? history.map(function (item) {
        return '<article class="timeline-item"><strong>' + esc(item.Accion) + '</strong><small> ' + esc(formatTimestamp(item.Timestamp)) + ' - ' + esc(item.Usuario) + '</small><p>' + esc(item.Detalle) + '</p></article>';
      }).join("") : '<p>No hay historial.</p>') + '</div>' +
      '</section>';
  }

  function quotePayload() {
    var request = state.detail.request;
    var form = document.getElementById("quoteForm");
    var data = new FormData(form);
    return {
      requestId: request.id,
      workDescription: String(data.get("workDescription") || "").trim(),
      materials: data.get("materials"),
      labor: data.get("labor"),
      otherCosts: data.get("otherCosts"),
      discount: data.get("discount"),
      tax: data.get("tax"),
      estimatedTime: String(data.get("estimatedTime") || "").trim(),
      validUntil: String(data.get("validUntil") || "").trim(),
      quoteNotes: String(data.get("quoteNotes") || "").trim(),
      paymentOptions: data.getAll("paymentOptions"),
      depositRequired: String(data.get("depositRequired") || "").trim(),
      paymentNotes: String(data.get("paymentNotes") || "").trim()
    };
  }

  function updateQuoteTotal() {
    var form = document.getElementById("quoteForm");
    var totalNode = document.getElementById("quoteTotal");
    if (!form || !totalNode) return;
    var data = new FormData(form);
    var total = ["materials", "labor", "otherCosts", "tax"].reduce(function (sum, key) {
      return sum + Number(data.get(key) || 0);
    }, 0) - Number(data.get("discount") || 0);
    totalNode.textContent = money(Math.max(0, total));
  }

  function refreshDetail() {
    return sendAction("getRequest", { requestId: state.detail.request.id }).then(requireOk).then(function (data) {
      state.detail = data;
      renderDetail();
      return loadDashboard();
    });
  }

  function bindDetailActions() {
    var requestId = state.detail.request.id;
    var statusForm = document.getElementById("statusForm");
    var noteForm = document.getElementById("noteForm");
    var quoteForm = document.getElementById("quoteForm");
    var previewBtn = document.getElementById("previewQuoteBtn");
    var sendQuoteBtn = document.getElementById("sendQuoteBtn");
    var resendBtn = document.getElementById("resendConfirmationBtn");

    statusForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(statusForm);
      sendAction("updateStatus", {
        requestId: requestId,
        status: data.get("status"),
        notifyCustomer: data.get("notifyCustomer") === "on",
        message: data.get("message")
      }).then(requireOk).then(function () {
        logActivity("Estado actualizado", requestId + " cambio a " + data.get("status") + ".");
        return refreshDetail();
      }).catch(function (error) {
        setAlert("error", error.message);
      });
    });

    document.querySelectorAll("[data-quick-status]").forEach(function (button) {
      button.addEventListener("click", function () {
        sendAction("updateStatus", {
          requestId: requestId,
          status: button.getAttribute("data-quick-status"),
          notifyCustomer: false
        }).then(requireOk).then(function () {
          logActivity("Estado rapido", requestId + " cambio a " + button.getAttribute("data-quick-status") + ".");
          return refreshDetail();
        }).catch(function (error) {
          setAlert("error", error.message);
        });
      });
    });

    noteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(noteForm);
      sendAction("addInternalNote", { requestId: requestId, note: data.get("note") })
        .then(requireOk).then(function () {
          logActivity("Nota interna", "Se agrego nota en " + requestId + ".");
          return refreshDetail();
        }).catch(function (error) {
          setAlert("error", error.message);
        });
    });

    quoteForm.addEventListener("input", updateQuoteTotal);
    quoteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sendAction("createQuote", quotePayload()).then(requireOk).then(function () {
        setAlert("success", "Cotizacion guardada.");
        logActivity("Cotizacion guardada", "Se guardo cotizacion para " + requestId + ".");
        return refreshDetail();
      }).catch(function (error) {
        setAlert("error", error.message);
      });
    });

    previewBtn.addEventListener("click", function () {
      sendAction("previewQuoteEmail", quotePayload()).then(requireOk).then(function (data) {
        var frame = document.getElementById("quotePreviewFrame");
        frame.classList.remove("hidden");
        frame.srcdoc = data.html || "";
      }).catch(function (error) {
        setAlert("error", error.message);
      });
    });

    sendQuoteBtn.addEventListener("click", function () {
      sendAction("sendQuoteEmail", quotePayload()).then(requireOk).then(function () {
        setAlert("success", "Cotizacion enviada.");
        logActivity("Cotizacion enviada", "Se envio cotizacion para " + requestId + ".");
        return refreshDetail();
      }).catch(function (error) {
        setAlert("error", error.message);
      });
    });

    resendBtn.addEventListener("click", function () {
      sendAction("resendCustomerConfirmation", { requestId: requestId }).then(requireOk).then(function () {
        setAlert("success", "Confirmacion reenviada.");
        logActivity("Confirmacion reenviada", "Se reenvio confirmacion para " + requestId + ".");
        return refreshDetail();
      }).catch(function (error) {
        setAlert("error", error.message);
      });
    });
  }

  function bindMenu() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    if (!header || !toggle) return;
    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    document.querySelectorAll(".top-nav a, .top-nav button").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setAdminView(viewName) {
    var next = ADMIN_VIEWS[viewName] ? viewName : "dashboard";
    state.adminView = next;
    document.body.setAttribute("data-admin-view", next);
    document.querySelectorAll("[data-admin-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-admin-panel") !== next;
    });
    document.querySelectorAll("[data-admin-tab]").forEach(function (button) {
      var active = button.getAttribute("data-admin-tab") === next;
      button.classList.toggle("active", active);
      if (button.tagName === "BUTTON") button.setAttribute("aria-selected", String(active));
    });
    var copy = ADMIN_VIEWS[next];
    if (adminViewEyebrow) adminViewEyebrow.textContent = copy.eyebrow;
    if (adminViewTitle) adminViewTitle.textContent = copy.title;
    if (adminViewSubtitle) adminViewSubtitle.textContent = copy.subtitle;
    if (next === "schedule") renderSchedule();
    if (next === "reports") renderReports();
  }

  function bindAdminNavigation() {
    document.addEventListener("click", function (event) {
      var tab = event.target.closest("[data-admin-tab]");
      if (!tab) return;
      event.preventDefault();
      setAdminView(tab.getAttribute("data-admin-tab"));
    });
    setAdminView("dashboard");
  }

  function scheduleEventById(eventId) {
    return allScheduleEvents().filter(function (event) { return event.id === eventId; })[0] || null;
  }

  function bindScheduleTools() {
    if (clearScheduleFormBtn) clearScheduleFormBtn.addEventListener("click", clearScheduleForm);
    if (exportScheduleCsvBtn) exportScheduleCsvBtn.addEventListener("click", exportScheduleCsv);

    if (scheduleForm) {
      scheduleForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var payload = schedulePayload();
        if (!payload.date || !payload.time) {
          setAlert("error", "Fecha y hora son requeridas para la agenda.");
          return;
        }
        var existing = (state.schedule || []).filter(function (item) { return item.id === payload.id; })[0];
        if (existing) {
          Object.assign(existing, payload);
        } else {
          state.schedule.push(payload);
        }
        saveScheduleEvents();
        clearScheduleForm();
        renderSchedule();
        setAlert("success", "Evento de agenda guardado.");
        logActivity("Agenda actualizada", payload.type + " para " + (payload.requestId || "evento interno") + ".");
      });
    }

    [scheduleTable, scheduleWeek].forEach(function (area) {
      if (!area) return;
      area.addEventListener("click", function (event) {
        var openBtn = event.target.closest("[data-open]");
        if (openBtn) {
          openDetail(openBtn.getAttribute("data-open"));
          return;
        }

        var weekBtn = event.target.closest("[data-schedule-open]");
        if (weekBtn) {
          var weekEvent = scheduleEventById(weekBtn.getAttribute("data-schedule-open"));
          if (!weekEvent) return;
          if (weekEvent.derived && weekEvent.requestId) {
            openDetail(weekEvent.requestId);
          } else {
            fillScheduleForm(weekEvent.id);
          }
          return;
        }

        var row = event.target.closest("[data-schedule-id]");
        if (!row) return;
        var eventId = row.getAttribute("data-schedule-id");
        var scheduleEvent = (state.schedule || []).filter(function (item) { return item.id === eventId; })[0];
        if (!scheduleEvent) return;

        if (event.target.closest("[data-edit-schedule]")) {
          fillScheduleForm(eventId);
          return;
        }
        if (event.target.closest("[data-complete-schedule]")) {
          scheduleEvent.status = "Completado";
          scheduleEvent.updatedAt = localTimestamp();
          saveScheduleEvents();
          renderSchedule();
          setAlert("success", "Evento marcado como completado.");
          logActivity("Agenda completada", eventId + " marcado como completado.");
          return;
        }
        if (event.target.closest("[data-delete-schedule]")) {
          state.schedule = state.schedule.filter(function (item) { return item.id !== eventId; });
          saveScheduleEvents();
          renderSchedule();
          setAlert("success", "Evento borrado de la agenda.");
          logActivity("Agenda borrada", eventId + " fue eliminado.");
        }
      });
    });
  }

  function bindReportTools() {
    if (exportReportCsvBtn) exportReportCsvBtn.addEventListener("click", exportReportCsv);
    if (clearActivityLogBtn) {
      clearActivityLogBtn.addEventListener("click", function () {
        state.activityLog = [];
        saveActivityLog();
        renderReports();
        setAlert("success", "Logs del panel borrados.");
      });
    }
  }

  function bindGalleryTools() {
    if (clearGalleryFormBtn) clearGalleryFormBtn.addEventListener("click", clearGalleryForm);

    if (galleryPhotoInput) {
      galleryPhotoInput.addEventListener("change", function () {
        var file = galleryPhotoInput.files && galleryPhotoInput.files[0];
        readGalleryPhoto(file).then(function (photo) {
          state.galleryPhoto = photo;
          if (galleryPhotoPreview && photo) {
            galleryPhotoPreview.innerHTML = '<img src="' + esc(photo.dataUrl) + '" alt="Vista previa"><span>Foto lista para guardar</span>';
          }
          clearAlert();
        }).catch(function (error) {
          state.galleryPhoto = null;
          galleryPhotoInput.value = "";
          if (galleryPhotoPreview) galleryPhotoPreview.innerHTML = "";
          setAlert("error", error.message);
        });
      });
    }

    if (galleryForm) {
      galleryForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var payload = galleryPayload();
        if (!payload.title) {
          setAlert("error", "Titulo de foto requerido.");
          return;
        }
        if (!payload.photo && !payload.imageUrl) {
          setAlert("error", "Sube una foto antes de guardar.");
          return;
        }
        sendAction("upsertGalleryItem", payload).then(requireOk).then(function () {
          clearGalleryForm();
          setAlert("success", "Foto de galeria guardada.");
          logActivity("Galeria guardada", payload.title + " fue guardada.");
          return loadGallery();
        }).catch(function (error) {
          setAlert("error", error.message);
        });
      });
    }

    if (galleryTable) {
      galleryTable.addEventListener("click", function (event) {
        var row = event.target.closest("[data-gallery-id]");
        if (!row) return;
        var itemId = row.getAttribute("data-gallery-id");
        var item = state.gallery.filter(function (entry) { return entry.id === itemId; })[0];
        if (!item) return;

        if (event.target.closest("[data-edit-gallery]")) {
          fillGalleryForm(itemId);
          return;
        }

        if (event.target.closest("[data-toggle-gallery]")) {
          var payload = Object.assign({}, item, {
            status: item.status === "Activo" ? "Pausado" : "Activo",
            imageUrl: item.imageUrl || item.linkUrl
          });
          sendAction("upsertGalleryItem", payload).then(requireOk).then(function () {
            setAlert("success", "Estado de foto actualizado.");
            logActivity("Galeria actualizada", item.title + " cambio a " + payload.status + ".");
            return loadGallery();
          }).catch(function (error) {
            setAlert("error", error.message);
          });
          return;
        }

        if (event.target.closest("[data-delete-gallery]")) {
          sendAction("deleteGalleryItem", { id: itemId }).then(requireOk).then(function () {
            if (galleryForm && galleryForm.elements.id.value === itemId) clearGalleryForm();
            setAlert("success", "Foto borrada de la galeria.");
            logActivity("Galeria borrada", item.title + " fue eliminada.");
            return loadGallery();
          }).catch(function (error) {
            setAlert("error", error.message);
          });
        }
      });
    }
  }

  function bindPaymentSettings() {
    if (paymentSettingsForm) {
      paymentSettingsForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = new FormData(paymentSettingsForm);
        state.adminSettings.payments.defaultDeposit = String(data.get("defaultDeposit") || "").trim();
        state.adminSettings.payments.paymentName = String(data.get("paymentName") || "").trim();
        state.adminSettings.payments.paymentInstructions = String(data.get("paymentInstructions") || "").trim();
        state.adminSettings.payments.confirmationNote = String(data.get("confirmationNote") || "").trim();
        saveAdminSettings();
        renderPaymentSettings();
        setAlert("success", "Configuracion de pagos guardada.");
        logActivity("Pagos guardados", "Se actualizaron deposito, instrucciones y confirmacion.");
      });
    }

    if (addPaymentMethodForm) {
      addPaymentMethodForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = new FormData(addPaymentMethodForm);
        var name = String(data.get("methodName") || "").trim();
        if (!name) return;
        state.adminSettings.payments.methods.push({
          id: nextId("PAY", state.adminSettings.payments.methods),
          name: name,
          status: "Activo",
          details: "Metodo agregado para futuras cotizaciones."
        });
        addPaymentMethodForm.reset();
        saveAdminSettings();
        renderPaymentSettings();
        setAlert("success", "Metodo de pago agregado.");
        logActivity("Metodo de pago", name + " fue agregado.");
      });
    }

    if (paymentMethodList) {
      paymentMethodList.addEventListener("click", function (event) {
        var item = event.target.closest("[data-payment-id]");
        if (!item) return;
        var methodId = item.getAttribute("data-payment-id");
        var methods = state.adminSettings.payments.methods;
        var method = methods.filter(function (entry) { return entry.id === methodId; })[0];
        if (!method) return;
        if (event.target.closest("[data-delete-payment]")) {
          state.adminSettings.payments.methods = methods.filter(function (entry) { return entry.id !== methodId; });
          setAlert("success", "Metodo de pago borrado.");
          logActivity("Metodo de pago borrado", method.name + " fue eliminado.");
        } else if (event.target.closest("[data-toggle-payment]")) {
          method.status = method.status === "Activo" ? "Pausado" : "Activo";
          setAlert("success", "Metodo de pago actualizado.");
          logActivity("Metodo de pago actualizado", method.name + " cambio a " + method.status + ".");
        } else {
          return;
        }
        saveAdminSettings();
        renderPaymentSettings();
      });
    }
  }

  function bindEmailSettings() {
    if (!emailSettingsForm) return;
    emailSettingsForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(emailSettingsForm);
      state.adminSettings.emails.replyEmail = String(data.get("replyEmail") || "").trim();
      state.adminSettings.emails.signatureName = String(data.get("signatureName") || "").trim();
      state.adminSettings.emails.confirmationSubject = String(data.get("confirmationSubject") || "").trim();
      state.adminSettings.emails.quoteSubject = String(data.get("quoteSubject") || "").trim();
      state.adminSettings.emails.emailSignature = String(data.get("emailSignature") || "").trim();
      saveAdminSettings();
      renderEmailSettings();
      setAlert("success", "Configuracion de correos guardada.");
      logActivity("Correos guardados", "Se actualizaron asuntos, firma y correo de respuesta.");
    });
  }

  function bindUsers() {
    if (clearUserFormBtn) clearUserFormBtn.addEventListener("click", clearUserForm);

    if (userForm) {
      userForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = new FormData(userForm);
        var id = String(data.get("userId") || "").trim();
        var user = {
          id: id || nextId("USR", state.adminSettings.users),
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          role: String(data.get("role") || "Asistente"),
          status: String(data.get("status") || "Activo"),
          permissions: checkedValues(userForm, "permissions")
        };
        if (!user.permissions.length) user.permissions = ["Consultas"];
        var existing = state.adminSettings.users.filter(function (item) { return item.id === user.id; })[0];
        if (existing) {
          Object.assign(existing, user);
        } else {
          state.adminSettings.users.push(user);
        }
        saveAdminSettings();
        clearUserForm();
        renderUsers();
        renderSchedule();
        setAlert("success", "Usuario guardado.");
        logActivity("Usuario guardado", user.name + " fue guardado como " + user.role + ".");
      });
    }

    if (usersTable) {
      usersTable.addEventListener("click", function (event) {
        var row = event.target.closest("[data-user-id]");
        if (!row) return;
        var userId = row.getAttribute("data-user-id");
        var users = state.adminSettings.users;
        var user = users.filter(function (entry) { return entry.id === userId; })[0];
        if (!user) return;
        if (event.target.closest("[data-edit-user]")) {
          fillUserForm(userId);
          return;
        }
        if (event.target.closest("[data-toggle-user]")) {
          user.status = user.status === "Activo" ? "Pausado" : "Activo";
          setAlert("success", "Usuario actualizado.");
          logActivity("Usuario actualizado", user.name + " cambio a " + user.status + ".");
        } else if (event.target.closest("[data-delete-user]")) {
          state.adminSettings.users = users.filter(function (entry) { return entry.id !== userId; });
          if (userForm && userForm.elements.userId.value === userId) clearUserForm();
          setAlert("success", "Usuario borrado.");
          logActivity("Usuario borrado", user.name + " fue eliminado.");
        } else {
          return;
        }
        saveAdminSettings();
        renderUsers();
        renderSchedule();
      });
    }
  }

  function bindOperationsSettings() {
    if (!operationsSettingsForm) return;
    operationsSettingsForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(operationsSettingsForm);
      state.adminSettings.operations.businessName = String(data.get("businessName") || "").trim();
      state.adminSettings.operations.businessPhone = String(data.get("businessPhone") || "").trim();
      state.adminSettings.operations.serviceArea = String(data.get("serviceArea") || "").trim();
      state.adminSettings.operations.quoteValidity = String(data.get("quoteValidity") || "").trim();
      state.adminSettings.operations.processNote = String(data.get("processNote") || "").trim();
      saveAdminSettings();
      renderOperationsSettings();
      setAlert("success", "Ajustes operativos guardados.");
      logActivity("Ajustes guardados", "Se actualizo la informacion operativa del negocio.");
    });
  }

  function bindAdminTools() {
    bindScheduleTools();
    bindReportTools();
    bindGalleryTools();
    bindPaymentSettings();
    bindEmailSettings();
    bindUsers();
    bindOperationsSettings();
  }

  function bindEvents() {
    if (refreshBtn) refreshBtn.addEventListener("click", loadDashboard);
    closeDetailBtn.addEventListener("click", closeDetail);
    detailModal.addEventListener("click", function (event) {
      if (event.target === detailModal) closeDetail();
    });
    requestsTable.addEventListener("click", function (event) {
      var button = event.target.closest("[data-open]");
      if (button) openDetail(button.getAttribute("data-open"));
    });
    [pipelineBoard, nextActions].forEach(function (area) {
      if (!area) return;
      area.addEventListener("click", function (event) {
        var button = event.target.closest("[data-open]");
        if (button) openDetail(button.getAttribute("data-open"));
      });
    });
    if (quoteConsole) {
      quoteConsole.addEventListener("click", function (event) {
        var button = event.target.closest("[data-open]");
        if (button) openDetail(button.getAttribute("data-open"));
      });
    }
    [searchInput, statusFilter, serviceFilter, sortOrder].forEach(function (node) {
      node.addEventListener("input", renderRequests);
      node.addEventListener("change", renderRequests);
    });
  }

  function boot() {
    bindMenu();
    bindAdminNavigation();
    initFilters();
    bindEvents();
    bindAdminTools();
    renderPreviewDashboard();
    loadGallery();
    loadServices().then(loadDashboard);
  }

  boot();
})();
