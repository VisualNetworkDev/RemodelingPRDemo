(function () {
  "use strict";

  var DEFAULT_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbzQOOwzme8kzglwPPBMFhdm-Kiaw4UA5VxF0JZBsiH4Ne5HGcf3pWWxHJSegbIBn83wyw/exec";
  var MAX_PHOTOS = 5;
  var MAX_PHOTO_BYTES = 60 * 1024 * 1024;
  var OPTIMIZED_PHOTO_MAX_LENGTH = 850000;
  var submitting = false;
  var activeClientKey = "";
  var currentPortalProject = null;

  var form = document.getElementById("estimateForm");
  var photoInput = document.getElementById("photoInput");
  var photoPreview = document.getElementById("photoPreview");
  var formAlert = document.getElementById("formAlert");
  var submitBtn = document.getElementById("submitBtn");
  var galleryGrid = document.getElementById("galleryGrid");
  var projectPortalForm = document.getElementById("projectPortalForm");
  var projectPortalResult = document.getElementById("projectPortalResult");
  var projectPortalAlert = document.getElementById("projectPortalAlert");
  var projectPortalBtn = document.getElementById("projectPortalBtn");

  function appSections() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-app-section]"));
  }

  function appNavButtons() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-app-target]"));
  }

  function showAppSection(sectionId) {
    var targetId = sectionId || "inicio";
    var sections = appSections();
    var target = document.querySelector('[data-app-section="' + targetId + '"]');
    if (!target) return;
    sections.forEach(function (section) {
      section.classList.toggle("active", section === target);
    });
    appNavButtons().forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-app-target") === targetId);
    });
    closeMenu();
    if (history.replaceState) {
      history.replaceState(null, "", "#" + targetId);
    }
  }

  function endpointUrl() {
    return (DEFAULT_ENDPOINT_URL || "").trim();
  }

  function setAlert(type, message) {
    if (!formAlert) return;
    formAlert.className = "form-alert show " + (type || "");
    formAlert.textContent = message || "";
  }

  function setPortalAlert(type, message) {
    if (!projectPortalAlert) return;
    projectPortalAlert.className = "form-alert" + (message ? " show " + (type || "") : "");
    projectPortalAlert.textContent = message || "";
  }

  function clearAlert() {
    if (!formAlert) return;
    formAlert.className = "form-alert";
    formAlert.textContent = "";
  }

  function setBusy(isBusy) {
    submitting = isBusy;
    if (submitBtn) {
      submitBtn.disabled = isBusy;
      submitBtn.textContent = isBusy ? "Enviando..." : "Enviar para evaluacion";
    }
  }

  function setPortalBusy(isBusy) {
    if (!projectPortalBtn) return;
    projectPortalBtn.disabled = isBusy;
    projectPortalBtn.textContent = isBusy ? "Consultando..." : "Consultar estado";
  }

  function submitEvaluation(action, payload) {
    var url = endpointUrl();
    if (!url) {
      return Promise.resolve({
        ok: false,
        message: "No se pudo procesar la informacion en este momento."
      });
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
          return { ok: false, message: "No se pudo leer la respuesta. Intentalo nuevamente." };
        }
      });
    }).catch(function () {
      return {
        ok: false,
        message: "No se pudo completar el envio. Intentalo nuevamente en unos minutos."
      };
    });
  }

  function publicAction(action, payload) {
    return submitEvaluation(action, payload);
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
        reject(new Error("No se pudo leer la foto " + file.name + "."));
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
        var maxSide = Number(opts.maxSide || 1600);
        var targetMaxLength = Number(opts.targetMaxLength || OPTIMIZED_PHOTO_MAX_LENGTH);
        var quality = Number(opts.quality || 0.82);
        var minSide = Number(opts.minSide || 700);
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
          quality = Math.max(0.62, quality - 0.05);
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

  function readOptimizedPhoto(file) {
    return fileToDataUrl(file).then(function (source) {
      return optimizeImageDataUrl(source, {
        maxSide: 1600,
        quality: 0.82,
        targetMaxLength: OPTIMIZED_PHOTO_MAX_LENGTH,
        minSide: 720
      });
    }).then(function (dataUrl) {
      return {
        name: String(file.name || "foto.jpg").replace(/\.[^.]+$/, "") + ".jpg",
        originalName: file.name,
        size: file.size,
        optimizedSize: Math.round(dataUrl.length * 0.75),
        mimeType: "image/jpeg",
        dataUrl: dataUrl
      };
    });
  }

  function isImageFile(file) {
    var type = String(file.type || "").toLowerCase();
    var name = String(file.name || "");
    return type.indexOf("image/") === 0 || /\.(jpe?g|png|webp|heic|heif)$/i.test(name);
  }

  function validatePhotos(files) {
    var list = Array.prototype.slice.call(files || []);
    if (list.length > MAX_PHOTOS) {
      throw new Error("Puedes subir hasta " + MAX_PHOTOS + " fotos.");
    }
    list.forEach(function (file) {
      if (!isImageFile(file)) {
        throw new Error("La foto " + file.name + " debe ser una imagen.");
      }
      if (file.size > MAX_PHOTO_BYTES) {
        throw new Error("La foto " + file.name + " excede 60 MB. Puedes subir fotos normales de celular; la pagina las reduce automaticamente antes de enviarlas.");
      }
    });
    return list;
  }

  function renderPhotoPreview() {
    if (!photoPreview || !photoInput) return;
    photoPreview.innerHTML = "";
    try {
      var files = validatePhotos(photoInput.files);
      files.forEach(function (file) {
        var chip = document.createElement("div");
        chip.className = "photo-chip";
        chip.textContent = file.name + " - " + Math.round(file.size / 1024) + " KB";
        photoPreview.appendChild(chip);
      });
      clearAlert();
    } catch (error) {
      setAlert("error", error.message);
      photoInput.value = "";
    }
  }

  function makeClientKey() {
    if (activeClientKey) return activeClientKey;
    if (window.crypto && crypto.randomUUID) {
      activeClientKey = crypto.randomUUID();
    } else {
      activeClientKey = "client-" + Date.now() + "-" + Math.random().toString(16).slice(2);
    }
    return activeClientKey;
  }

  function resetClientKey() {
    activeClientKey = "";
  }

  function collectPayload() {
    var data = new FormData(form);
    return {
      fullName: String(data.get("fullName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      city: String(data.get("city") || "").trim(),
      serviceType: String(data.get("serviceType") || "").trim(),
      projectZone: String(data.get("projectZone") || "").trim(),
      preferredDate: String(data.get("preferredDate") || "").trim(),
      urgency: String(data.get("urgency") || "").trim(),
      description: String(data.get("description") || "").trim(),
      acceptTerms: data.get("acceptTerms") === "on",
      origin: window.location.href,
      language: "es",
      clientRequestKey: makeClientKey()
    };
  }

  function validatePayload(payload) {
    if (!form.reportValidity()) throw new Error("Completa los campos requeridos.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error("Escribe un email valido.");
    if (payload.phone.replace(/\D/g, "").length < 7) throw new Error("Escribe un telefono valido.");
    if (!payload.acceptTerms) throw new Error("Debes aceptar la evaluacion inicial.");
    validatePhotos(photoInput.files);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    clearAlert();

    var payload = collectPayload();
    var files;
    try {
      validatePayload(payload);
      files = validatePhotos(photoInput.files);
    } catch (error) {
      setAlert("error", error.message);
      return;
    }

    setBusy(true);
    Promise.all(files.map(readOptimizedPhoto))
      .then(function (photos) {
        payload.photos = photos;
        return submitEvaluation("submitRequest", payload);
      })
      .then(function (response) {
        if (!response || !response.ok) {
          throw new Error((response && response.message) || "No se pudo enviar la informacion.");
        }
        var id = response.data && response.data.requestId ? response.data.requestId : "recibido";
        setAlert("success", "Informacion recibida. Codigo de seguimiento: " + id + ".");
        form.reset();
        if (photoPreview) photoPreview.innerHTML = "";
        resetClientKey();
      })
      .catch(function (error) {
        setAlert("error", error.message || "No se pudo enviar la informacion.");
      })
      .finally(function () {
        setBusy(false);
      });
  }


  function money(value) {
    var number = Number(value || 0);
    return "$" + (Number.isFinite(number) ? number : 0).toFixed(2);
  }

  function statusTone(status) {
    if (status === "Completado" || status === "Aprobado") return "ok";
    if (status === "Cancelado") return "danger";
    if (status === "Pendiente" || status === "Cotizacion enviada") return "warn";
    return "";
  }

  function renderPortalPhotos(photos) {
    var list = Array.isArray(photos) ? photos : [];
    if (!list.length) return '<div class="mini-empty">No hay fotos publicadas para este codigo.</div>';
    return '<div class="portal-photo-grid">' + list.slice(0, 6).map(function (url, index) {
      return '<a href="' + escapeAttr(url) + '" target="_blank" rel="noopener"><img src="' + escapeAttr(url) + '" alt="Foto del proyecto ' + (index + 1) + '"></a>';
    }).join("") + '</div>';
  }

  function renderPortalQuote(project) {
    var quote = project.quote || {};
    var approval = project.approval || {};
    if (!quote.quoteId) {
      return '<article class="portal-panel"><span>Cotizacion</span><strong>En preparacion</strong><p>El equipo revisa el alcance para preparar una propuesta.</p></article>';
    }
    if (approval.approvalId) {
      return '<article class="portal-panel portal-quote-panel portal-approved-panel">' +
        '<span>Cotizacion aprobada</span>' +
        '<strong>' + escapeHtml(quote.quoteId) + ' - ' + money(quote.total) + '</strong>' +
        '<p>Seleccion registrada: ' + escapeHtml(approval.paymentMethod || "Metodo pendiente") + '.</p>' +
        '<div class="portal-kv"><b>Estado de pago</b><em>' + escapeHtml(approval.status || "Pendiente de confirmacion") + '</em></div>' +
        '<div class="portal-kv"><b>Registrado</b><em>' + escapeHtml(approval.timestamp || "Recibido") + '</em></div>' +
        (quote.pdfUrl ? '<a class="portal-pdf-link" href="' + escapeAttr(quote.pdfUrl) + '" target="_blank" rel="noopener">Ver PDF de cotizacion</a>' : '') +
      '</article>';
    }
    var methods = Array.isArray(quote.paymentOptions) && quote.paymentOptions.length ? quote.paymentOptions : ["ATH Movil", "Zelle", "Transferencia bancaria"];
    return '<article class="portal-panel portal-quote-panel">' +
      '<span>Cotizacion</span>' +
      '<strong>' + escapeHtml(quote.quoteId) + ' - ' + money(quote.total) + '</strong>' +
      '<p>' + escapeHtml(quote.workDescription || "Propuesta preparada para el proyecto.") + '</p>' +
      '<div class="portal-kv"><b>Tiempo estimado</b><em>' + escapeHtml(quote.estimatedTime || "A coordinar") + '</em></div>' +
      '<div class="portal-kv"><b>Validez</b><em>' + escapeHtml(quote.validUntil || "15 dias") + '</em></div>' +
      '<div class="portal-kv"><b>Deposito</b><em>' + escapeHtml(quote.depositRequired || "A coordinar") + '</em></div>' +
      (quote.pdfUrl ? '<a class="portal-pdf-link" href="' + escapeAttr(quote.pdfUrl) + '" target="_blank" rel="noopener">Ver PDF de cotizacion</a>' : '') +
      '<div class="portal-payment-list">' + methods.map(function (item) { return '<span>' + escapeHtml(item) + '</span>'; }).join("") + '</div>' +
      '<p>' + escapeHtml(quote.paymentNotes || "La forma de pago se confirma antes de comenzar.") + '</p>' +
      '<form id="quoteApprovalForm" class="portal-approval-form">' +
        '<h4>Aprobar propuesta</h4>' +
        '<input type="hidden" name="requestId" value="' + escapeAttr(project.requestId) + '">' +
        '<input type="hidden" name="quoteId" value="' + escapeAttr(quote.quoteId) + '">' +
        '<label>Forma de pago<select name="paymentMethod" required>' +
          methods.map(function (item) { return '<option value="' + escapeAttr(item) + '">' + escapeHtml(item) + '</option>'; }).join("") +
        '</select></label>' +
        '<label>Nombre<input name="name" autocomplete="name" required></label>' +
        '<label>Telefono<input name="phone" inputmode="tel" autocomplete="tel" required></label>' +
        '<label class="wide">Nota opcional<textarea name="message" rows="2" placeholder="Horario ideal, referencia o detalle para coordinar"></textarea></label>' +
        '<label class="portal-check wide"><input name="acceptTerms" type="checkbox" required><span>Confirmo que deseo aprobar esta cotizacion y coordinar el pago seleccionado con la duena.</span></label>' +
        '<button class="btn primary full" type="submit">Aprobar y coordinar pago</button>' +
      '</form>' +
    '</article>';
  }

  function renderProjectPortal(project) {
    if (!projectPortalResult || !project) return;
    currentPortalProject = project;
    projectPortalResult.innerHTML = '<div class="portal-result-head">' +
      '<div><span class="eyebrow">Proyecto</span><h3>' + escapeHtml(project.requestId) + '</h3><p>' + escapeHtml(project.service || "Servicio") + ' - ' + escapeHtml(project.city || "Puerto Rico") + '</p></div>' +
      '<span class="status-pill ' + statusTone(project.status) + '">' + escapeHtml(project.status || "Pendiente") + '</span>' +
    '</div>' +
    '<div class="portal-summary-grid">' +
      '<article><span>Fecha preferida</span><strong>' + escapeHtml(project.preferredDate || "Pendiente") + '</strong></article>' +
      '<article><span>Prioridad</span><strong>' + escapeHtml(project.urgency || "Normal") + '</strong></article>' +
      '<article><span>Total cotizado</span><strong>' + money(project.totalQuoted) + '</strong></article>' +
    '</div>' +
    '<div class="portal-timeline">' + (project.timeline || []).map(function (item) {
      return '<div class="' + (item.done ? "done" : "") + '"><i></i><span>' + escapeHtml(item.label) + '</span></div>';
    }).join("") + '</div>' +
    renderPortalQuote(project) +
    '<article class="portal-panel"><span>Fotos del proyecto</span>' + renderPortalPhotos(project.photos) + '</article>';
  }

  function handleQuoteApprovalSubmit(event) {
    event.preventDefault();
    var formNode = event.target;
    var button = formNode.querySelector("button[type='submit']");
    var data = new FormData(formNode);
    var payload = {
      requestId: String(data.get("requestId") || "").trim().toUpperCase(),
      quoteId: String(data.get("quoteId") || "").trim(),
      paymentMethod: String(data.get("paymentMethod") || "").trim(),
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      message: String(data.get("message") || "").trim(),
      acceptTerms: data.get("acceptTerms") === "on"
    };
    if (!payload.requestId || !payload.quoteId || !payload.paymentMethod || !payload.name || !payload.phone) {
      setPortalAlert("error", "Completa nombre, telefono y forma de pago.");
      return;
    }
    if (!payload.acceptTerms) {
      setPortalAlert("error", "Confirma que deseas aprobar la cotizacion.");
      return;
    }
    if (button) {
      button.disabled = true;
      button.textContent = "Registrando...";
    }
    setPortalAlert("", "");
    publicAction("approveQuote", payload).then(function (response) {
      if (!response || !response.ok) throw new Error((response && response.message) || "No se pudo aprobar la cotizacion.");
      renderProjectPortal(response.data.project || currentPortalProject);
      setPortalAlert("success", "Cotizacion aprobada. La forma de pago quedo registrada para coordinacion.");
    }).catch(function (error) {
      setPortalAlert("error", error.message || "No se pudo aprobar la cotizacion.");
    }).finally(function () {
      if (button) {
        button.disabled = false;
        button.textContent = "Aprobar y coordinar pago";
      }
    });
  }

  function handlePortalSubmit(event) {
    event.preventDefault();
    if (!projectPortalForm) return;
    var data = new FormData(projectPortalForm);
    var requestId = String(data.get("requestId") || "").trim().toUpperCase();
    if (!requestId) {
      setPortalAlert("error", "Escribe el codigo del proyecto.");
      return;
    }
    setPortalAlert("", "");
    setPortalBusy(true);
    publicAction("getPublicProject", { requestId: requestId }).then(function (response) {
      if (!response || !response.ok) throw new Error((response && response.message) || "No se encontro ese codigo.");
      renderProjectPortal(response.data.project);
      setPortalAlert("success", "Proyecto cargado.");
    }).catch(function (error) {
      setPortalAlert("error", error.message || "No se pudo consultar el proyecto.");
    }).finally(function () {
      setPortalBusy(false);
    });
  }


  function closeMenu() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    if (!header || !toggle) return;
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function bindAppNavigation() {
    appNavButtons().forEach(function (button) {
      button.addEventListener("click", function () {
        showAppSection(button.getAttribute("data-app-target"));
      });
    });
    var initial = (window.location.hash || "#inicio").replace("#", "");
    showAppSection(initial);
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
      link.addEventListener("click", closeMenu);
    });
  }

  function bindReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) { node.classList.add("in-view"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function bindServiceButtons() {
    document.querySelectorAll("[data-service]").forEach(function (button) {
      button.addEventListener("click", function () {
        var select = form && form.elements.serviceType;
        if (!select) return;
        select.value = button.getAttribute("data-service");
        showAppSection("consulta");
        window.setTimeout(function () {
          select.focus({ preventScroll: true });
        }, 450);
      });
    });
  }

  function bindServiceFilters() {
    var tabs = document.querySelectorAll("[data-filter]");
    var cards = document.querySelectorAll("[data-category]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var filter = tab.getAttribute("data-filter");
        tabs.forEach(function (item) { item.classList.toggle("active", item === tab); });
        cards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-category") === filter;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  function bindGalleryFilters() {
    var buttons = document.querySelectorAll("[data-gallery]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-gallery");
        buttons.forEach(function (item) { item.classList.toggle("active", item === button); });
        document.querySelectorAll("[data-gallery-item]").forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-gallery-item") === filter;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  function activeGalleryFilter() {
    var active = document.querySelector("[data-gallery].active");
    return active ? active.getAttribute("data-gallery") : "all";
  }

  function renderGallery(items) {
    if (!galleryGrid || !items || !items.length) return;
    galleryGrid.innerHTML = items.map(function (item) {
      var category = item.category || "interior";
      var title = item.title || "Proyecto completado";
      var description = item.description || item.type || "Trabajo realizado";
      var imageUrl = item.imageUrl || item.linkUrl || "";
      return '<article class="proof-card" data-gallery-item="' + escapeAttr(category) + '">' +
        '<img src="' + escapeAttr(imageUrl) + '" alt="' + escapeAttr(title) + '" loading="lazy">' +
        '<div><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(description) + '</span></div>' +
      '</article>';
    }).join("");
    var filter = activeGalleryFilter();
    document.querySelectorAll("[data-gallery-item]").forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-gallery-item") === filter;
      card.classList.toggle("is-hidden", !match);
    });
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function loadGallery() {
    if (!galleryGrid) return;
    publicAction("listGallery", { publicOnly: true }).then(function (response) {
      if (!response || !response.ok || !response.data || !Array.isArray(response.data.items)) return;
      renderGallery(response.data.items);
    }).catch(function () {});
  }

  function setMinimumDate() {
    var dateInput = form && form.elements.preferredDate;
    if (!dateInput) return;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    dateInput.min = today.toISOString().slice(0, 10);
  }

  if (photoInput) photoInput.addEventListener("change", renderPhotoPreview);
  if (form) form.addEventListener("submit", handleSubmit);
  if (projectPortalForm) projectPortalForm.addEventListener("submit", handlePortalSubmit);
  if (projectPortalResult) {
    projectPortalResult.addEventListener("submit", function (event) {
      if (event.target && event.target.id === "quoteApprovalForm") {
        handleQuoteApprovalSubmit(event);
      }
    });
  }
  bindMenu();
  bindAppNavigation();
  bindReveal();
  bindServiceButtons();
  bindServiceFilters();
  bindGalleryFilters();
  loadGallery();
  setMinimumDate();
})();


