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
      estado: "Pendiente",
      totalCotizado: 0,
      fotosUrls: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80"
      ]
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
    stats: {},
    detail: null,
    adminSettings: loadAdminSettings(),
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
  var detailModal = document.getElementById("detailModal");
  var detailBody = document.getElementById("detailBody");
  var detailTitle = document.getElementById("detailTitle");
  var closeDetailBtn = document.getElementById("closeDetailBtn");
  var quoteConsole = document.getElementById("quoteConsole");
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
      return direction * String(a.timestamp || "").localeCompare(String(b.timestamp || ""));
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
        '<td data-label="Fecha">' + esc(request.timestamp) + '</td>' +
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
        return '<article class="note-item"><strong>' + esc(note.Autor) + '</strong><small> ' + esc(note.Timestamp) + '</small><p>' + esc(note.Nota) + '</p></article>';
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
        return '<article class="timeline-item"><strong>' + esc(item.Accion) + '</strong><small> ' + esc(item.Timestamp) + ' - ' + esc(item.Usuario) + '</small><p>' + esc(item.Detalle) + '</p></article>';
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
      }).then(requireOk).then(refreshDetail).catch(function (error) {
        setAlert("error", error.message);
      });
    });

    document.querySelectorAll("[data-quick-status]").forEach(function (button) {
      button.addEventListener("click", function () {
        sendAction("updateStatus", {
          requestId: requestId,
          status: button.getAttribute("data-quick-status"),
          notifyCustomer: false
        }).then(requireOk).then(refreshDetail).catch(function (error) {
          setAlert("error", error.message);
        });
      });
    });

    noteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(noteForm);
      sendAction("addInternalNote", { requestId: requestId, note: data.get("note") })
        .then(requireOk).then(refreshDetail).catch(function (error) {
          setAlert("error", error.message);
        });
    });

    quoteForm.addEventListener("input", updateQuoteTotal);
    quoteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sendAction("createQuote", quotePayload()).then(requireOk).then(function () {
        setAlert("success", "Cotizacion guardada.");
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
        return refreshDetail();
      }).catch(function (error) {
        setAlert("error", error.message);
      });
    });

    resendBtn.addEventListener("click", function () {
      sendAction("resendCustomerConfirmation", { requestId: requestId }).then(requireOk).then(function () {
        setAlert("success", "Confirmacion reenviada.");
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
        } else if (event.target.closest("[data-toggle-payment]")) {
          method.status = method.status === "Activo" ? "Pausado" : "Activo";
          setAlert("success", "Metodo de pago actualizado.");
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
        setAlert("success", "Usuario guardado.");
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
        } else if (event.target.closest("[data-delete-user]")) {
          state.adminSettings.users = users.filter(function (entry) { return entry.id !== userId; });
          if (userForm && userForm.elements.userId.value === userId) clearUserForm();
          setAlert("success", "Usuario borrado.");
        } else {
          return;
        }
        saveAdminSettings();
        renderUsers();
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
    });
  }

  function bindAdminTools() {
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
    loadServices().then(loadDashboard);
  }

  boot();
})();
