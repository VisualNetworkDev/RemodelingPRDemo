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

  var state = {
    requests: [],
    stats: {},
    detail: null
  };

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

  function endpointUrl() {
    return (DEFAULT_ENDPOINT_URL || "").trim();
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
    }).catch(function (error) {
      setAlert("error", error.message + " Mostrando datos demo mientras se recupera la conexion.");
      renderStats();
      renderOperations();
      renderRequests();
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
      '<small>' + esc(request.pueblo) + ' · ' + esc(request.id) + '</small>' +
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
        '<small>' + esc(request.servicio) + ' · ' + esc(request.telefono) + '</small>' +
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
    document.querySelectorAll(".top-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
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
    [searchInput, statusFilter, serviceFilter, sortOrder].forEach(function (node) {
      node.addEventListener("input", renderRequests);
      node.addEventListener("change", renderRequests);
    });
    document.querySelectorAll("[data-panel-jump]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.querySelector(button.getAttribute("data-panel-jump"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function boot() {
    bindMenu();
    initFilters();
    bindEvents();
    renderPreviewDashboard();
    loadServices().then(loadDashboard);
  }

  boot();
})();
