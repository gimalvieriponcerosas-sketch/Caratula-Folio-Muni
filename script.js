      /* BASE DE DATOS SUPABASE */
      const SUPABASE_URL = "https://qxsuiutnoagglmawgpcl.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c3VpdXRub2FnZ2xtYXdncGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzE0OTEsImV4cCI6MjA5Mzc0NzQ5MX0.2w6SZZ8M1YqqyrwiwvJG-gDr0mxs0QDozhpO_zFxVLc";
      const clienteDB = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      /* ELEMENTOS DOM RECURRENTES */
      const $ = (id) => document.getElementById(id);
      let usuarioAutenticado = null;
      let procesandoAuth = false;

      const estiloLogin = document.createElement("style");
      estiloLogin.textContent = `
        #pantallaLogin { position:fixed; inset:0; z-index:10000; display:none; align-items:center; justify-content:center; padding:4vw; background:rgba(241,245,249,.99); -webkit-text-size-adjust:100%; zoom:1 !important; transform:none !important; }
        #pantallaLogin.mostrar { display:flex; }
        .login-caja { width:min(900px, 94vw) !important; max-width:none !important; max-height:calc(100vh - 6vw); overflow-y:auto; margin:auto; padding:56px; background:#fff; border:1px solid #dbe3ee; border-radius:18px; box-shadow:0 12px 36px rgba(15,23,42,.14); font-size:28px; zoom:1 !important; transform:none !important; }
        .login-caja h1 { margin:0; color:#1e3a8a; font-size:50px; text-align:center; }
        .login-subtitulo { margin:16px 0 34px; color:#64748b; font-size:23px; text-align:center; }
        .login-vistas { display:flex; gap:14px; margin-bottom:32px; }
        .login-vistas button { flex:1; padding:20px 12px; border:0; border-bottom:3px solid #cbd5e1; background:transparent; color:#64748b; cursor:pointer; font-size:23px; font-weight:700; }
        .login-vistas button.activo { border-bottom-color:#1e3a8a; color:#1e3a8a; }
        .login-vista { display:none; }
        .login-vista.activa { display:block; }
        .login-campo { margin-bottom:28px; }
        .login-campo label { margin:0 0 12px; font-size:23px; }
        .login-campo input { width:100%; min-height:76px; padding:18px; border:2px solid #cbd5e1; border-radius:8px; font-size:inherit; }
        .login-campo input:-webkit-autofill,
        .login-campo input:-webkit-autofill:hover,
        .login-campo input:-webkit-autofill:focus {
          font-size:inherit !important;
          -webkit-text-fill-color:#0f172a;
          -webkit-box-shadow:0 0 0 1000px #fff inset;
          transition:background-color 9999s ease-out 0s;
        }
        .login-submit { width:100%; min-height:80px; border:0; border-radius:8px; background:#1e3a8a; color:#fff; cursor:pointer; font-size:inherit; font-weight:700; }
        .login-submit:disabled { opacity:.65; cursor:wait; }
        #mensajeLogin { display:none; margin-top:22px; padding:20px; border-radius:8px; font-size:23px; }
        #mensajeLogin.mostrar { display:block; }
        #mensajeLogin.error { border:1px solid #fecaca; background:#fef2f2; color:#991b1b; }
        #mensajeLogin.info { border:1px solid #bfdbfe; background:#eff6ff; color:#1e40af; }
        .sesion-barra { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:10px; margin-bottom:10px; }
        #usuarioSesion { min-width:0; max-width:100%; overflow-wrap:anywhere; color:#334155; font-size:22px; }
        #btnCerrarSesion { border:0; border-radius:6px; padding:9px 14px; background:#ef4444; color:#fff; cursor:pointer; font-size:20px; font-weight:700; }
        @media(max-width:600px) {
          .login-caja { width:94vw; max-height:calc(100vh - 24px); padding:26px; font-size:21px; }
          .login-caja h1 { font-size:34px; }
          .login-subtitulo { font-size:19px; margin-bottom:22px; }
          .login-vistas { gap:4px; }
          .login-vistas button { padding:15px 4px; font-size:18px; }
          .login-campo label { font-size:19px; }
          .login-campo input { min-height:64px; }
          .login-submit { min-height:68px; }
          #mensajeLogin { font-size:18px; }
        }
      `;
      document.head.appendChild(estiloLogin);
      document.body.insertAdjacentHTML("afterbegin", `
        <div id="pantallaLogin" role="dialog" aria-modal="true" aria-labelledby="tituloLogin">
          <div class="login-caja">
            <h1 id="tituloLogin">Carátulas de Folio</h1>
            <div class="login-subtitulo">Municipalidad Distrital de Chinchao</div>
            <div class="login-vistas" role="tablist">
              <button type="button" class="activo" data-login-vista="ingresar">Ingresar</button>
              <button type="button" data-login-vista="crear">Crear cuenta</button>
              <button type="button" data-login-vista="recuperar">Recuperar</button>
            </div>
            <form id="formLogin" class="login-vista activa">
              <div class="login-campo"><label for="loginEmail">Correo electrónico</label><input id="loginEmail" type="email" autocomplete="username" required></div>
              <div class="login-campo"><label for="loginPassword">Contraseña</label><input id="loginPassword" type="password" autocomplete="current-password" required></div>
              <button class="login-submit" id="btnLogin" type="submit">Ingresar</button>
            </form>
            <form id="formRegistro" class="login-vista">
              <div class="login-campo"><label for="registroEmail">Correo electrónico</label><input id="registroEmail" type="email" autocomplete="email" required></div>
              <div class="login-campo"><label for="registroPassword">Contraseña</label><input id="registroPassword" type="password" autocomplete="new-password" minlength="6" required></div>
              <div class="login-campo"><label for="registroPasswordConfirmacion">Repetir contraseña</label><input id="registroPasswordConfirmacion" type="password" autocomplete="new-password" minlength="6" required></div>
              <button class="login-submit" id="btnRegistro" type="submit">Crear cuenta</button>
            </form>
            <form id="formRecuperar" class="login-vista">
              <div class="login-campo"><label for="recuperarEmail">Correo electrónico</label><input id="recuperarEmail" type="email" autocomplete="email" required></div>
              <button class="login-submit" id="btnRecuperar" type="submit">Enviar enlace</button>
            </form>
            <div id="mensajeLogin" role="status" aria-live="polite"></div>
          </div>
        </div>
        <div class="sesion-barra" style="display:none"><span id="usuarioSesion"></span><button id="btnCerrarSesion" type="button">Cerrar sesión</button></div>
      `);

      function mostrarMensajeLogin(mensaje, tipo = "error") {
        const caja = $("mensajeLogin");
        caja.textContent = mensaje || "";
        caja.className = mensaje ? `mostrar ${tipo}` : "";
      }

      function mostrarPantallaLogin(mostrar) {
        $("pantallaLogin").classList.toggle("mostrar", mostrar);
        $("btnCerrarSesion").parentElement.style.display = mostrar ? "none" : "flex";
        document.body.style.overflow = mostrar ? "hidden" : "";
      }

      function cambiarVistaLogin(vista) {
        document.querySelectorAll("[data-login-vista]").forEach((boton) => {
          boton.classList.toggle("activo", boton.dataset.loginVista === vista);
        });
        const formularioActivo = vista === "ingresar" ? "formLogin" : vista === "crear" ? "formRegistro" : "formRecuperar";
        document.querySelectorAll(".login-vista").forEach((formulario) => {
          formulario.classList.toggle("activa", formulario.id === formularioActivo);
        });
        mostrarMensajeLogin("");
      }

      async function iniciarSesion(evento) {
        evento.preventDefault();
        if (procesandoAuth) return;
        procesandoAuth = true;
        const boton = $("btnLogin");
        boton.disabled = true;
        boton.textContent = "Ingresando...";
        try {
          const { data, error } = await clienteDB.auth.signInWithPassword({
            email: $("loginEmail").value.trim().toLowerCase(),
            password: $("loginPassword").value
          });
          if (error) return mostrarMensajeLogin("No se pudo iniciar sesión: " + error.message);
          $("usuarioSesion").textContent = data.user.email || "Sesión iniciada";
          location.reload();
        } catch (error) {
          mostrarMensajeLogin("No se pudo conectar para iniciar sesión.");
        } finally {
          procesandoAuth = false;
          boton.disabled = false;
          boton.textContent = "Ingresar";
        }
      }

      async function registrarCuenta(evento) {
        evento.preventDefault();
        if (procesandoAuth) return;
        const email = $("registroEmail").value.trim().toLowerCase();
        const password = $("registroPassword").value;
        if (password.length < 6) return mostrarMensajeLogin("La contraseña debe tener al menos 6 caracteres.");
        if (password !== $("registroPasswordConfirmacion").value) return mostrarMensajeLogin("Las contraseñas no coinciden.");
        procesandoAuth = true;
        const boton = $("btnRegistro");
        boton.disabled = true;
        boton.textContent = "Creando cuenta...";
        try {
          const { data, error } = await clienteDB.auth.signUp({
            email, password, options: { emailRedirectTo: location.origin + location.pathname }
          });
          if (error) return mostrarMensajeLogin("No se pudo crear la cuenta: " + error.message);
          if (data.session) return location.reload();
          cambiarVistaLogin("ingresar");
          $("loginEmail").value = email;
          mostrarMensajeLogin("Cuenta creada. Espera la aprobación del administrador para iniciar sesión.", "info");
        } catch (error) {
          mostrarMensajeLogin("No se pudo conectar para crear la cuenta.");
        } finally {
          procesandoAuth = false;
          boton.disabled = false;
          boton.textContent = "Crear cuenta";
        }
      }

      async function recuperarCuenta(evento) {
        evento.preventDefault();
        const email = $("recuperarEmail").value.trim().toLowerCase();
        try {
          const { error } = await clienteDB.auth.resetPasswordForEmail(email, {
            redirectTo: location.origin + location.pathname
          });
          mostrarMensajeLogin(error ? "No se pudo enviar el enlace: " + error.message : "Revisa tu correo para restablecer la contraseña.", error ? "error" : "info");
        } catch (error) {
          mostrarMensajeLogin("No se pudo conectar para enviar el enlace.");
        }
      }

      document.querySelectorAll("[data-login-vista]").forEach((boton) => {
        boton.addEventListener("click", () => cambiarVistaLogin(boton.dataset.loginVista));
      });
      $("formLogin").addEventListener("submit", iniciarSesion);
      $("formRegistro").addEventListener("submit", registrarCuenta);
      $("formRecuperar").addEventListener("submit", recuperarCuenta);
      $("btnCerrarSesion").addEventListener("click", async () => {
        const { error } = await clienteDB.auth.signOut();
        if (error) return alert("No se pudo cerrar sesión: " + error.message);
        location.reload();
      });

      const contNombres = $("contNombres");
      const previewNombres = $("previewNombres");
      const KEY_FOLIOS_IMPRESOS = "foliosImpresosGuardados";
      let foliosImpresos = [];
      const previewNumero = $("previewNumero");
      const previewPeriodo = $("previewPeriodo");
      const inpNumero = $("inpNumero");
      const inpBloque = $("inpBloque");
      const inpPeriodo = $("inpPeriodo");
      const inpObservaciones = $("inpObservaciones");
      const inpId = $("inpId");
      const modoEdicion = $("modoEdicion");
      const buscador = $("buscador");
      const buscadorImpresion = $("buscadorImpresion");
      const listaFolios = $("listaFolios");
      const historialContenido = $("historialContenido");
      const txtSubgerencia = $("txtSubgerencia");
      const txtCvLabel = $("txtCvLabel");

      const MARCADOR_SEPARADOR = "§SEP§";
      const MARCADOR_SEPARADOR_AREA = "§SEP_AREA§";
      const MARCADOR_SEPARADOR_CV = "§SEP_CV§";
      const PAGE_SIZE = 5;
      const PAGE_SIZE_IMPRESION = 6;
      const MAX_NOMBRES_VISIBLES = 10;
      function claveLocalPorUsuario(clave) {
        return `${clave}:${usuarioAutenticado?.id || "sin-sesion"}`;
      }

      const CONFIG_VISUAL_PREDETERMINADA = {
        tamanoTitulo: 22, espacioTitulo: 8,
        fuenteSubgerencia: "Arial", tamanoSubgerencia: 18, espacioGerencia: 0,
        posicionSubgerencia: "debajo-escudo",
        fuenteCv: "Algerian", tamanoCv: 28, espacioCurriculum: 0,
        textoSubgerencia: "",
        textoCvLabel: "Curriculum vitae",
        tamanoEscudo: 130, fuenteNombres: "Arial", tamanoNombres: 15, espacioNombres: 0,
        alineacionNombres: "izquierda",
        grosorBordePrincipal: 5, colorBordePrincipal: "#000000", lineasContorno: 0,
        grosorLineaContorno1: 2, colorLineaContorno1: "#dc2626",
        grosorLineaContorno2: 2, colorLineaContorno2: "#2563eb",
        // Configuración global de separadores
        fuenteSeparador: "Arial",
        tamanoSeparador: 18,
        espacioSeparador: 0,
        // Controles independientes de folio y año/periodo
        ordenFolioPeriodo: "folio-arriba",
        tamanoFolio: 28,
        posicionFolio: 0,
        tamanoPeriodo: 15,
        posicionPeriodo: 0
      };
      let configVisual = { ...CONFIG_VISUAL_PREDETERMINADA };
      let configuracionGlobal = { ...configVisual };
      let configuracionesPorFolio = {};
      let estadoConfigAntesModal = null;
      let configVisualModalInicio = null;
      let configVisualPendiente = {};
      let claveFolioConfigPendiente = null;
      let historialConfigDeshacer = [];
      let historialConfigRehacer = [];
      let estadoActualHistorialConfig = null;
      let paginaActual = 0, totalPaginas = 1, filtroActivo = "", totalRegistros = 0, cargoActual = "", bloqueActual = "01";
      let notasPagoVisibles = false, modoMostrarFilas = "ultimos", duplicadosGlobales = {};
      let ordenarListaPorBloque = false;
      const foliosAbiertos = new Set();
      let filaSeleccionada = null, filaArrastrada = null;
      let todosLosFoliosCache = [];
      let foliosCacheCargado = false;
      let promesaCargaFolios = null;
      let foliosMarcadosParaImprimir = [];
      let paginaImpresionActual = 0;
      let mostrarFoliosImpresos = true;
      let idsPendientesDeConfirmarImpresion = [];
      /* UTILIDADES GENERALES */
      function normalizarTexto(texto) {
        return String(texto ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();
      }

      function escapeRegExp(texto) {
        return String(texto).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }

      function coincideTextoExacto(texto, consulta) {
        const valor = normalizarTexto(texto);
        const query = normalizarTexto(consulta);

        if (!query) return true;

  const patron = new RegExp(`(^|[^a-z0-9])${escapeRegExp(query)}(?=[^a-z0-9]|$)`, "i");
        return patron.test(valor);
      }

      function resaltarCoincidenciasTexto(texto, consulta) {
        const valor = String(texto ?? "");
        const busqueda = String(consulta ?? "").trim();
        if (!busqueda) return escaparHtml(valor);

        const busquedaNormalizada = normalizarTexto(busqueda);
        if (!busquedaNormalizada) return escaparHtml(valor);

        let valorNormalizado = "";
        const posicionesOriginales = [];
        let posicionOriginal = 0;
        for (const caracter of valor) {
          const inicio = posicionOriginal;
          posicionOriginal += caracter.length;
          const fragmento = caracter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

          if (/\s/.test(fragmento)) {
            if (valorNormalizado.endsWith(" ")) {
              posicionesOriginales[posicionesOriginales.length - 1].fin = posicionOriginal;
            } else {
              valorNormalizado += " ";
              posicionesOriginales.push({ inicio, fin: posicionOriginal });
            }
            continue;
          }

          for (let i = 0; i < fragmento.length; i++) {
            valorNormalizado += fragmento[i];
            posicionesOriginales.push({ inicio, fin: posicionOriginal });
          }
        }

        const valorNormalizadoCompleto = valorNormalizado.trim();
        const coincideNombreCompleto = valorNormalizadoCompleto === busquedaNormalizada;
        const coincidePalabraCompleta = new RegExp(`(^|\\s)${escapeRegExp(busquedaNormalizada)}(?=\\s|$)`).test(valorNormalizadoCompleto);
        if (coincideNombreCompleto || coincidePalabraCompleta) {
          return `<mark class="marcado-busqueda">${escaparHtml(valor)}</mark>`;
        }

        const terminos = [...new Set(busquedaNormalizada.split(" "))];
        const rangos = [];
        for (const termino of terminos) {
          let buscarDesde = 0;
          let posicion = valorNormalizado.indexOf(termino, buscarDesde);
          while (posicion !== -1) {
            rangos.push({
              inicio: posicionesOriginales[posicion].inicio,
              fin: posicionesOriginales[posicion + termino.length - 1].fin
            });
            buscarDesde = posicion + termino.length;
            posicion = valorNormalizado.indexOf(termino, buscarDesde);
          }
        }

        if (!rangos.length) return escaparHtml(valor);
        rangos.sort((a, b) => a.inicio - b.inicio || a.fin - b.fin);

        const rangosUnidos = rangos.reduce((unidos, rango) => {
          const ultimo = unidos[unidos.length - 1];
          if (ultimo && rango.inicio <= ultimo.fin) {
            ultimo.fin = Math.max(ultimo.fin, rango.fin);
          } else {
            unidos.push({ ...rango });
          }
          return unidos;
        }, []);

        let html = "";
        let posicionOriginalMarcada = 0;
        for (const rango of rangosUnidos) {
          html += escaparHtml(valor.slice(posicionOriginalMarcada, rango.inicio));
          html += `<mark class="marcado-busqueda">${escaparHtml(valor.slice(rango.inicio, rango.fin))}</mark>`;
          posicionOriginalMarcada = rango.fin;
        }
        return html + escaparHtml(valor.slice(posicionOriginalMarcada));
      }

      function escaparHtml(valor = "") {
        return String(valor).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }

      function esSeparador(nombre) {
        return typeof nombre === "string" && (
          nombre.startsWith(MARCADOR_SEPARADOR) ||
          nombre.startsWith(MARCADOR_SEPARADOR_AREA) ||
          nombre.startsWith(MARCADOR_SEPARADOR_CV) ||
          nombre.startsWith("$SEPS$")
        );
      }

      function obtenerDatosSeparador(nombre) {
        if (typeof nombre !== "string") return { texto: "", estilo: "normal" };
        if (nombre.startsWith(MARCADOR_SEPARADOR_AREA)) {
          return { texto: nombre.slice(MARCADOR_SEPARADOR_AREA.length), estilo: "area" };
        }
        if (nombre.startsWith(MARCADOR_SEPARADOR_CV)) {
          return { texto: nombre.slice(MARCADOR_SEPARADOR_CV.length), estilo: "cv" };
        }
        if (nombre.startsWith(MARCADOR_SEPARADOR)) {
          return { texto: nombre.slice(MARCADOR_SEPARADOR.length), estilo: "normal" };
        }
        return { texto: nombre.startsWith("$SEPS$") ? nombre.slice(6) : nombre, estilo: "normal" };
      }

      function obtenerHtmlSeparador(texto, estilo = "normal", config = configVisual) {
        // El formato del separador es global y se configura únicamente desde Ajustes.
        const fuente = config.fuenteSeparador || "Arial";
        const tamano = Number(config.tamanoSeparador) || 18;
        const espacio = Number(config.espacioSeparador) || 0;
        const formato = ` style="font-family:'${escaparHtml(fuente)}', Arial, sans-serif; font-size:${tamano}px; margin-top:${espacio}px;"`;
        return `<div class="separador"${formato}>${escaparHtml(texto)}</div>`;
      }

      function numeroParaOrden(valor) {
        const texto = String(valor ?? "").trim();
        const match = texto.match(/\d+/);
        return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
      }

      function compararNumericoNatural(a, b) {
        const na = numeroParaOrden(a), nb = numeroParaOrden(b);
        if (na !== nb) return na - nb;
        return String(a ?? "").localeCompare(String(b ?? ""), "es", { numeric: true, sensitivity: "base" });
      }

      function limpiarNombreParaExportar(nombre) {
        return esSeparador(nombre) ? "" : (nombre ?? "");
      }

      function cerrarModal(idModal) {
        if (idModal === "modalConfig") restaurarConfigAntesModal();
        $(idModal).classList.remove("mostrar");
        if (idModal === "modalImpresion") {
          idsPendientesDeConfirmarImpresion = [];
          const wrap = $("confirmarImpresionWrap");
          if (wrap) wrap.style.display = "none";
        }
      }

      function cargarFoliosImpresos() {
        try {
          const guardado = localStorage.getItem(claveLocalPorUsuario(KEY_FOLIOS_IMPRESOS));
          const datos = guardado ? JSON.parse(guardado) : [];
          return Array.isArray(datos) ? datos.map(String) : [];
        } catch (e) {
          console.warn("Error al cargar folios impresos:", e);
          return [];
        }
      }

      function guardarFoliosImpresos() {
        const lista = [...new Set(foliosImpresos.map(String))];
        localStorage.setItem(claveLocalPorUsuario(KEY_FOLIOS_IMPRESOS), JSON.stringify(lista));
        // Sincroniza la lista en Supabase para que "Impresos" sea igual en cualquier navegador.
        clienteDB.from("config_visual_por_usuario").upsert({
          owner_id: usuarioAutenticado.id,
          impresos: lista
        })
          .then(({ error }) => { if (error) console.warn("No se pudo sincronizar los impresos:", error.message); });
      }

      function esFolioImpreso(id) {
        return foliosImpresos.includes(String(id));
      }

      function registrarFoliosImpresos(ids) {
        const idsNuevos = [...new Set((ids || []).map(String).filter(Boolean))];
        idsNuevos.forEach((id) => {
          if (!foliosImpresos.includes(id)) foliosImpresos.push(id);
        });
        foliosMarcadosParaImprimir = foliosMarcadosParaImprimir.filter((id) => !idsNuevos.includes(String(id)));
        guardarFoliosImpresos();

        const foliosDisponibles = obtenerFoliosParaImpresion();
        renderizarListaFoliosImpresos(foliosDisponibles);
        renderizarListaImpresion(foliosDisponibles);
      }

      function actualizarContadorImpresion(foliosDisponibles) {
        const contador = $("contadorImpresion");
        if (!contador) return;
        const { foliosFiltrados, foliosPagina } = obtenerPaginaFoliosImpresion(foliosDisponibles);
        const idsVisibles = foliosPagina.map((f) => String(f.id));
        const seleccionados = idsVisibles.filter((id) => foliosMarcadosParaImprimir.includes(id)).length;
        const inicio = foliosFiltrados.length ? paginaImpresionActual * PAGE_SIZE_IMPRESION + 1 : 0;
        const fin = Math.min((paginaImpresionActual + 1) * PAGE_SIZE_IMPRESION, foliosFiltrados.length);
        contador.textContent = `${inicio}–${fin} de ${foliosFiltrados.length} · ${seleccionados} marcados`;
      }

      function actualizarEstadoMarcarTodosVisibles(foliosDisponibles) {
        const chk = $("chkMarcarTodosVisibles");
        if (!chk) return;
        const { foliosPagina } = obtenerPaginaFoliosImpresion(foliosDisponibles);
        const idsVisibles = foliosPagina.map((f) => String(f.id));

        if (!idsVisibles.length) {
          chk.checked = false;
          chk.indeterminate = false;
          return;
        }

        const marcados = idsVisibles.filter((id) => foliosMarcadosParaImprimir.includes(id)).length;
        chk.checked = marcados === idsVisibles.length;
        chk.indeterminate = marcados > 0 && marcados < idsVisibles.length;
      }

      function obtenerPaginaFoliosImpresion(foliosDisponibles) {
        const textoBusqueda = (buscadorImpresion?.value || "").trim();
        const foliosFiltrados = obtenerFoliosFiltradosParaImpresion(foliosDisponibles, textoBusqueda);
        const totalPaginas = Math.max(1, Math.ceil(foliosFiltrados.length / PAGE_SIZE_IMPRESION));
        paginaImpresionActual = Math.min(paginaImpresionActual, totalPaginas - 1);
        const inicio = paginaImpresionActual * PAGE_SIZE_IMPRESION;
        return {
          foliosFiltrados,
          foliosPagina: foliosFiltrados.slice(inicio, inicio + PAGE_SIZE_IMPRESION),
          totalPaginas
        };
      }

      function actualizarPaginacionImpresion(totalPaginas) {
        const info = $("infoPaginaImpresion");
        const anterior = $("btnPaginaImpresionAnterior");
        const siguiente = $("btnPaginaImpresionSiguiente");
        info.textContent = `Página ${paginaImpresionActual + 1} de ${totalPaginas}`;
        anterior.disabled = paginaImpresionActual === 0;
        siguiente.disabled = paginaImpresionActual >= totalPaginas - 1;
      }

      /* CONFIGURACIÓN VISUAL */
      async function cargarConfigVisual() {
        // 1) Carga instantánea desde el caché del navegador (evita parpadeos).
        try {
          const guardado = localStorage.getItem(claveLocalPorUsuario("configVisualCaratula"));
          if (guardado) configVisual = { ...configVisual, ...JSON.parse(guardado) };
          const configuracionesGuardadas = localStorage.getItem(claveLocalPorUsuario("configuracionesPorFolioCaratula"));
          if (configuracionesGuardadas) configuracionesPorFolio = JSON.parse(configuracionesGuardadas) || {};
          foliosImpresos = cargarFoliosImpresos();
        } catch (e) {
          console.warn("Error al leer el caché local:", e);
        }

        // 2) Fuente de verdad: Supabase. Así el diseño es el mismo en cualquier equipo o navegador.
        try {
          const { data, error } = await clienteDB
            .from("config_visual_por_usuario")
            .select("config_global, config_por_folio, cargo, impresos, historial")
            .eq("owner_id", usuarioAutenticado.id)
            .maybeSingle();

          if (error) {
            console.warn("No se pudo cargar la configuración de esta cuenta:", error.message);
          } else if (data) {
            configVisual = { ...configVisual, ...(data.config_global || {}) };
            configuracionesPorFolio = data.config_por_folio || {};
            if (data.cargo) cargoActual = data.cargo;
            if (Array.isArray(data.impresos)) foliosImpresos = data.impresos.map(String);
            if (Array.isArray(data.historial) && data.historial.length) {
              localStorage.setItem(claveLocalPorUsuario("historialFolios"), JSON.stringify(data.historial));
            }
            localStorage.setItem(claveLocalPorUsuario("configVisualCaratula"), JSON.stringify(configVisual));
            localStorage.setItem(claveLocalPorUsuario("configuracionesPorFolioCaratula"), JSON.stringify(configuracionesPorFolio));
            localStorage.setItem(claveLocalPorUsuario(KEY_FOLIOS_IMPRESOS), JSON.stringify(foliosImpresos));
          }
        } catch (e) {
          console.warn("Sin conexión a Supabase: se usa el caché local.", e);
        }

        try {

          // Compatibilidad con configuraciones antiguas que no tenían estos campos.
          configVisual.ordenFolioPeriodo = configVisual.ordenFolioPeriodo === "periodo-arriba" ? "periodo-arriba" : "folio-arriba";
          configVisual.posicionSubgerencia = configVisual.posicionSubgerencia === "encima-escudo" ? "encima-escudo" : "debajo-escudo";
          configVisual.lineasContorno = Math.min(2, Math.max(0, Number.parseInt(configVisual.lineasContorno, 10) || 0));
          configVisual.colorLineaContorno1 = /^#[\da-f]{6}$/i.test(configVisual.colorLineaContorno1) ? configVisual.colorLineaContorno1 : CONFIG_VISUAL_PREDETERMINADA.colorLineaContorno1;
          configVisual.colorLineaContorno2 = /^#[\da-f]{6}$/i.test(configVisual.colorLineaContorno2) ? configVisual.colorLineaContorno2 : CONFIG_VISUAL_PREDETERMINADA.colorLineaContorno2;
          configVisual.tamanoFolio = Number.isFinite(Number(configVisual.tamanoFolio)) ? Number(configVisual.tamanoFolio) : 28;
          configVisual.posicionFolio = Number.isFinite(Number(configVisual.posicionFolio)) ? Number(configVisual.posicionFolio) : 0;
          configVisual.tamanoPeriodo = Number.isFinite(Number(configVisual.tamanoPeriodo)) ? Number(configVisual.tamanoPeriodo) : 15;
          configVisual.posicionPeriodo = Number.isFinite(Number(configVisual.posicionPeriodo)) ? Number(configVisual.posicionPeriodo) : 0;
          configVisual.fuenteSeparador = configVisual.fuenteSeparador || "Arial";
          configVisual.tamanoSeparador = Number.isFinite(Number(configVisual.tamanoSeparador)) ? Number(configVisual.tamanoSeparador) : 18;
          configVisual.espacioSeparador = Number.isFinite(Number(configVisual.espacioSeparador)) ? Number(configVisual.espacioSeparador) : 0;
        } catch (e) {
          console.warn("Error al cargar config visual:", e);
          configVisual.tamanoFolio = 28;
          configVisual.posicionFolio = 0;
          configVisual.tamanoPeriodo = 15;
          configVisual.posicionPeriodo = 0;
          configVisual.fuenteSeparador = "Arial";
          configVisual.tamanoSeparador = 18;
          configVisual.espacioSeparador = 0;
        }
        configuracionGlobal = { ...configVisual };
      }

      function obtenerClaveFolioActual() { return inpId.value ? String(inpId.value) : "actual_form"; }

      function obtenerConfiguracionParaFolio(id) {
        const clave = String(id || "actual_form");
        return { ...configuracionGlobal, ...(configuracionesPorFolio[clave] || {}) };
      }

      function actualizarBotonesHistorialConfig() {
        $("btnDeshacerConfig").disabled = historialConfigDeshacer.length === 0;
        $("btnRehacerConfig").disabled = historialConfigRehacer.length === 0;
      }

      function obtenerConfiguracionContorno(config) {
        const obtenerGrosor = (valor, predeterminado, maximo) => {
          const grosor = Number.parseInt(valor, 10);
          return Number.isFinite(grosor) ? Math.min(maximo, Math.max(1, grosor)) : predeterminado;
        };
        return {
          lineas: Math.min(2, Math.max(0, Number.parseInt(config.lineasContorno, 10) || 0)),
          grosorPrincipal: obtenerGrosor(config.grosorBordePrincipal, 5, 15),
          colorPrincipal: /^#[\da-f]{6}$/i.test(config.colorBordePrincipal) ? config.colorBordePrincipal : CONFIG_VISUAL_PREDETERMINADA.colorBordePrincipal,
          grosor1: obtenerGrosor(config.grosorLineaContorno1, 2, 10),
          grosor2: obtenerGrosor(config.grosorLineaContorno2, 2, 10),
          color1: /^#[\da-f]{6}$/i.test(config.colorLineaContorno1) ? config.colorLineaContorno1 : CONFIG_VISUAL_PREDETERMINADA.colorLineaContorno1,
          color2: /^#[\da-f]{6}$/i.test(config.colorLineaContorno2) ? config.colorLineaContorno2 : CONFIG_VISUAL_PREDETERMINADA.colorLineaContorno2
        };
      }

      function aplicarContorno(caratula, config) {
        const contorno = obtenerConfiguracionContorno(config);
        caratula.classList.toggle("contorno-linea-1", contorno.lineas >= 1);
        caratula.classList.toggle("contorno-linea-2", contorno.lineas >= 2);
        caratula.style.setProperty("--grosor-borde-principal", `${contorno.grosorPrincipal}px`);
        caratula.style.setProperty("--color-borde-principal", contorno.colorPrincipal);
        caratula.style.setProperty("--grosor-linea-contorno-1", `${contorno.grosor1}px`);
        caratula.style.setProperty("--grosor-linea-contorno-2", `${contorno.grosor2}px`);
        caratula.style.setProperty("--color-linea-contorno-1", contorno.color1);
        caratula.style.setProperty("--color-linea-contorno-2", contorno.color2);
        caratula.style.borderColor = contorno.colorPrincipal;
        caratula.style.borderWidth = `${contorno.grosorPrincipal}px`;
      }

      function capturarEstadoHistorialConfig() {
        return {
          configVisual: { ...configVisual },
          textoSubgerencia: $("cfgSubgerencia").value,
          textoCvLabel: $("cfgCvLabel").value
        };
      }

      function iniciarHistorialConfig() {
        historialConfigDeshacer = [];
        historialConfigRehacer = [];
        estadoActualHistorialConfig = capturarEstadoHistorialConfig();
        actualizarBotonesHistorialConfig();
      }

      function registrarCambioHistorialConfig() {
        const estadoNuevo = capturarEstadoHistorialConfig();
        if (JSON.stringify(estadoActualHistorialConfig) === JSON.stringify(estadoNuevo)) return;
        historialConfigDeshacer.push(estadoActualHistorialConfig);
        if (historialConfigDeshacer.length > 100) historialConfigDeshacer.shift();
        historialConfigRehacer = [];
        estadoActualHistorialConfig = estadoNuevo;
        actualizarBotonesHistorialConfig();
      }

      function restaurarEstadoHistorialConfig(estado) {
        configVisual = { ...estado.configVisual };
        $("cfgSubgerencia").value = estado.textoSubgerencia;
        $("cfgCvLabel").value = estado.textoCvLabel;
        $("cfgFuenteSubgerencia").value = configVisual.fuenteSubgerencia;
        $("cfgFuenteCv").value = configVisual.fuenteCv;
        estadoActualHistorialConfig = capturarEstadoHistorialConfig();
        aplicarConfigVisual(true);
        actualizarVistaPreviaConfiguracion();
        actualizarBotonesHistorialConfig();
      }

      function deshacerConfigVisual() {
        if (!historialConfigDeshacer.length) return;
        historialConfigRehacer.push(capturarEstadoHistorialConfig());
        restaurarEstadoHistorialConfig(historialConfigDeshacer.pop());
      }

      function rehacerConfigVisual() {
        if (!historialConfigRehacer.length) return;
        historialConfigDeshacer.push(capturarEstadoHistorialConfig());
        restaurarEstadoHistorialConfig(historialConfigRehacer.pop());
      }

      function reiniciarCambiosConfigVisual() {
        const estadoAnterior = capturarEstadoHistorialConfig();
        const estadoPredeterminado = {
          configVisual: {
            ...CONFIG_VISUAL_PREDETERMINADA,
            textoSubgerencia: $("cfgSubgerencia").value,
            textoCvLabel: $("cfgCvLabel").value
          },
          textoSubgerencia: $("cfgSubgerencia").value,
          textoCvLabel: $("cfgCvLabel").value
        };
        if (JSON.stringify(estadoAnterior) === JSON.stringify(estadoPredeterminado)) return;
        historialConfigDeshacer.push(estadoAnterior);
        if (historialConfigDeshacer.length > 100) historialConfigDeshacer.shift();
        historialConfigRehacer = [];
        restaurarEstadoHistorialConfig(estadoPredeterminado);
      }

      function cargarConfiguracionParaFolio(id, aplicar = true) {
        configVisual = obtenerConfiguracionParaFolio(id);
        if (aplicar) {
          const textoSubgerencia = configVisual.textoSubgerencia || "";
          txtSubgerencia.innerHTML = escaparHtml(textoSubgerencia).replace(/\n/g, "<br>");
          txtSubgerencia.hidden = !textoSubgerencia.trim();
          aplicarConfigVisual(false);
        }
      }

      async function guardarConfigVisual(grupo = "visual") {
        const campos = Object.keys(configVisual);
        if (!configVisualModalInicio) return;
        const claveActual = obtenerClaveFolioActual();
        const hayCambios = campos.some((campo) =>
          JSON.stringify(configVisual[campo]) !== JSON.stringify(configVisualModalInicio[campo])
        );
        if (hayCambios && claveFolioConfigPendiente && claveFolioConfigPendiente !== claveActual) {
          alert("Aplica o descarta los cambios pendientes antes de editar otro folio.");
          return;
        }
        campos.forEach((campo) => {
          if (JSON.stringify(configVisual[campo]) === JSON.stringify(configVisualModalInicio[campo])) {
            delete configVisualPendiente[campo];
          } else {
            configVisualPendiente[campo] = configVisual[campo];
          }
        });
        claveFolioConfigPendiente = Object.keys(configVisualPendiente).length ? claveActual : null;
      }

      async function aplicarConfiguracionVisualPendiente() {
        const campos = Object.keys(configVisualPendiente);
        if (!campos.length) return true;

        const alcance = $("alcanceConfigPendiente").value;
        let configuracionesExistentesConservadas = null;
        if (alcance === "todos-excepto-editados") {
          configuracionesExistentesConservadas = { ...configuracionesPorFolio };
          const tamanoPagina = 1000;
          let desde = 0;
          while (true) {
            const { data: foliosExistentes, error } = await clienteDB
              .from("folios_cv")
              .select("id")
              .eq("owner_id", usuarioAutenticado.id)
              .order("id", { ascending: true })
              .range(desde, desde + tamanoPagina - 1);
            if (error) {
              alert("No se pudo conservar la configuración de los folios existentes: " + error.message);
              return false;
            }

            (foliosExistentes || []).forEach(({ id }) => {
              const clave = String(id);
              const configuracionFolio = { ...(configuracionesExistentesConservadas[clave] || {}) };
              campos.forEach((campo) => {
                if (!Object.prototype.hasOwnProperty.call(configuracionFolio, campo)) {
                  configuracionFolio[campo] = configuracionGlobal[campo];
                }
              });
              configuracionesExistentesConservadas[clave] = configuracionFolio;
            });

            if (!foliosExistentes || foliosExistentes.length < tamanoPagina) break;
            desde += tamanoPagina;
          }
        }

        const cambiosCaratula = {};
        if (alcance !== "uno") {
          if (campos.includes("textoCvLabel")) cambiosCaratula.texto_cv_label = configVisualPendiente.textoCvLabel;
          if (campos.includes("textoSubgerencia")) cambiosCaratula.texto_subgerencia = configVisualPendiente.textoSubgerencia;
        }
        if (Object.keys(cambiosCaratula).length) {
          const { error } = await clienteDB.from("config_caratula_por_usuario").upsert({
            owner_id: usuarioAutenticado.id,
            ...cambiosCaratula,
            actualizado_en: new Date().toISOString()
          });
          if (error) { alert("No se pudo guardar la configuración de la carátula: " + error.message); return false; }
        }

        let idsDestino = [];
        if (alcance === "uno") {
          idsDestino = [claveFolioConfigPendiente];
        }

        if (alcance === "todos") {
          campos.forEach((campo) => { configuracionGlobal[campo] = configVisualPendiente[campo]; });
          Object.entries(configuracionesPorFolio).forEach(([clave, configFolio]) => {
            campos.forEach((campo) => { delete configFolio[campo]; });
            if (Object.keys(configFolio).length) configuracionesPorFolio[clave] = configFolio;
            else delete configuracionesPorFolio[clave];
          });
        } else if (alcance === "uno") {
          idsDestino.forEach((id) => {
            const configFolio = { ...(configuracionesPorFolio[id] || {}) };
            campos.forEach((campo) => { configFolio[campo] = configVisualPendiente[campo]; });
            configuracionesPorFolio[id] = configFolio;
          });
        } else {
          configuracionesPorFolio = configuracionesExistentesConservadas;
          campos.forEach((campo) => { configuracionGlobal[campo] = configVisualPendiente[campo]; });
        }

        if (campos.includes("textoSubgerencia")) {
          configuracionGlobal.textoSubgerencia = configVisualPendiente.textoSubgerencia;
        }

        localStorage.setItem(claveLocalPorUsuario("configVisualCaratula"), JSON.stringify(configuracionGlobal));
        if (Object.keys(configuracionesPorFolio).length) {
          localStorage.setItem(claveLocalPorUsuario("configuracionesPorFolioCaratula"), JSON.stringify(configuracionesPorFolio));
        } else {
          localStorage.removeItem(claveLocalPorUsuario("configuracionesPorFolioCaratula"));
        }
        const { error: errorConfigVisual } = await clienteDB.from("config_visual_por_usuario").upsert({
          owner_id: usuarioAutenticado.id,
          config_global: configuracionGlobal,
          config_por_folio: configuracionesPorFolio,
          cargo: cargoActual || null,
          actualizado_en: new Date().toISOString()
        });
        if (errorConfigVisual) {
          alert("No se pudo guardar el diseño para los folios: " + errorConfigVisual.message);
          return false;
        }

        const cantidad = alcance === "todos" ? "todos los folios" : alcance === "todos-excepto-editados" ? "todos los folios, excepto los editados" : "este folio";
        configVisualPendiente = {};
        claveFolioConfigPendiente = null;
        cargarConfiguracionParaFolio(obtenerClaveFolioActual());
        configVisualModalInicio = { ...configVisual };
        estadoConfigAntesModal = {
          configVisual: { ...configVisual },
          configuracionGlobal: { ...configuracionGlobal },
          configuracionesPorFolio: { ...configuracionesPorFolio },
          configVisualPendiente: {},
          claveFolioConfigPendiente: null
        };
        return true;
      }

      function restaurarConfigAntesModal() {
        if (!estadoConfigAntesModal) return;
        configVisual = { ...estadoConfigAntesModal.configVisual };
        configuracionGlobal = { ...estadoConfigAntesModal.configuracionGlobal };
        configuracionesPorFolio = { ...estadoConfigAntesModal.configuracionesPorFolio };
        configVisualPendiente = { ...estadoConfigAntesModal.configVisualPendiente };
        claveFolioConfigPendiente = estadoConfigAntesModal.claveFolioConfigPendiente;
        configVisualModalInicio = null;
        localStorage.setItem(claveLocalPorUsuario("configVisualCaratula"), JSON.stringify(configuracionGlobal));
        if (Object.keys(configuracionesPorFolio).length) {
          localStorage.setItem(claveLocalPorUsuario("configuracionesPorFolioCaratula"), JSON.stringify(configuracionesPorFolio));
        } else {
          localStorage.removeItem(claveLocalPorUsuario("configuracionesPorFolioCaratula"));
        }
        // Mantiene Supabase alineado con la configuración restaurada.
        clienteDB.from("config_visual_por_usuario").upsert({
          owner_id: usuarioAutenticado.id,
          config_global: configuracionGlobal,
          config_por_folio: configuracionesPorFolio,
          cargo: cargoActual || null,
          actualizado_en: new Date().toISOString()
        }).then(({ error }) => { if (error) console.warn("No se pudo restaurar en Supabase:", error.message); });
        aplicarConfigVisual(false);
        estadoConfigAntesModal = null;
      }

      function actualizarVistaPreviaConfiguracion() {
        const vista = $("configVistaCaratula");
        if (!vista) return;

        const subgerencia = $("configVistaSubgerencia");
        const cvLabel = $("configVistaCvLabel");
        const nombres = $("configVistaNombres");
        const numero = $("configVistaNumero");
        const periodo = $("configVistaPeriodo");

        const textoSubgerencia = $("cfgSubgerencia")?.value || "";
        configVisual.alineacionNombres = configVisual.alineacionNombres === "centrado" ? "centrado" : "izquierda";
        subgerencia.innerHTML = escaparHtml(textoSubgerencia).replace(/\n/g, "<br>");
        subgerencia.hidden = !textoSubgerencia.trim();
        cvLabel.textContent = $("cfgCvLabel")?.value ?? txtCvLabel.textContent;
        cvLabel.hidden = !cvLabel.textContent.trim();
        nombres.innerHTML = previewNombres.innerHTML || '<div class="sin-nombres" style="color:#94a3b8;">Agrega nombres para verlos aquí</div>';

        // En la vista de configuración usamos siempre los valores actuales del formulario.
        numero.textContent = inpNumero.value.trim() || "--";
        periodo.textContent = inpPeriodo.value.trim() || "----";

        vista.classList.remove("orden-periodo-arriba", "orden-folio-arriba");
        vista.classList.add(configVisual.ordenFolioPeriodo === "folio-arriba" ? "orden-folio-arriba" : "orden-periodo-arriba");
        vista.classList.toggle("area-sobre-escudo", configVisual.posicionSubgerencia === "encima-escudo");
        vista.classList.toggle("nombres-centrados", configVisual.alineacionNombres === "centrado");
        aplicarContorno(vista, configVisual);

        vista.style.setProperty("--tamano-titulo", `${configVisual.tamanoTitulo}px`);
        vista.style.setProperty("--espacio-titulo", `${configVisual.espacioTitulo}px`);
        vista.style.setProperty("--tamano-escudo", `${configVisual.tamanoEscudo}px`);
        vista.style.setProperty("--fuente-nombres", `"${configVisual.fuenteNombres || "Arial"}", Arial, sans-serif`);
        vista.style.setProperty("--tamano-nombres", `${configVisual.tamanoNombres}px`);
        vista.style.setProperty("--espacio-gerencia", `${configVisual.espacioGerencia}px`);
        vista.style.setProperty("--espacio-curriculum", `${configVisual.espacioCurriculum}px`);
        vista.style.setProperty("--espacio-nombres", `${configVisual.espacioNombres}px`);
        vista.style.setProperty("--tamano-folio", `${configVisual.tamanoFolio}px`);
        vista.style.setProperty("--posicion-folio", `${configVisual.posicionFolio}px`);
        vista.style.setProperty("--tamano-periodo", `${configVisual.tamanoPeriodo}px`);
        vista.style.setProperty("--posicion-periodo", `${configVisual.posicionPeriodo}px`);

        subgerencia.style.setProperty("font-family", `"${configVisual.fuenteSubgerencia}", Arial, sans-serif`, "important");
        subgerencia.style.setProperty("font-size", `${configVisual.tamanoSubgerencia}px`, "important");
        cvLabel.style.setProperty("font-family", `"${configVisual.fuenteCv}", Algerian, "Bookman Old Style", serif`, "important");
        cvLabel.style.setProperty("font-size", `${configVisual.tamanoCv}px`, "important");
      }

      function aplicarConfigVisual(guardar = true, grupo = "visual") {
        const caratula = $("caratula");
        configVisual.fuenteNombres = configVisual.fuenteNombres || "Arial";
        configVisual.tamanoNombres = Number.isFinite(Number(configVisual.tamanoNombres)) ? Number(configVisual.tamanoNombres) : 15;

        caratula.style.setProperty("--tamano-titulo", `${configVisual.tamanoTitulo}px`);
        caratula.style.setProperty("--espacio-titulo", `${configVisual.espacioTitulo}px`);
        caratula.style.setProperty("--tamano-escudo", `${configVisual.tamanoEscudo}px`);
        caratula.style.setProperty("--fuente-nombres", `"${configVisual.fuenteNombres || "Arial"}", Arial, sans-serif`);
        caratula.style.setProperty("--tamano-nombres", `${configVisual.tamanoNombres}px`);
        caratula.style.setProperty("--tamano-folio", `${configVisual.tamanoFolio}px`);
        caratula.style.setProperty("--posicion-folio", `${configVisual.posicionFolio}px`);
        caratula.style.setProperty("--tamano-periodo", `${configVisual.tamanoPeriodo}px`);
        caratula.style.setProperty("--posicion-periodo", `${configVisual.posicionPeriodo}px`);

        caratula.classList.remove("orden-periodo-arriba", "orden-folio-arriba");
        caratula.classList.add(configVisual.ordenFolioPeriodo === "folio-arriba" ? "orden-folio-arriba" : "orden-periodo-arriba");
        caratula.classList.toggle("area-sobre-escudo", configVisual.posicionSubgerencia === "encima-escudo");
        configVisual.alineacionNombres = configVisual.alineacionNombres === "centrado" ? "centrado" : "izquierda";
        caratula.classList.toggle("nombres-centrados", configVisual.alineacionNombres === "centrado");
        aplicarContorno(caratula, configVisual);

        txtSubgerencia.style.fontFamily = `"${configVisual.fuenteSubgerencia}", Arial, sans-serif`;
        txtSubgerencia.style.fontSize = `${configVisual.tamanoSubgerencia}px`;
        txtSubgerencia.style.marginTop = `${configVisual.espacioGerencia}px`;
        txtCvLabel.style.fontFamily = `"${configVisual.fuenteCv}", Algerian, "Bookman Old Style", serif`;
        txtCvLabel.style.fontSize = `${configVisual.tamanoCv}px`;
        txtCvLabel.style.marginTop = `${configVisual.espacioCurriculum}px`;
        txtCvLabel.textContent = configVisual.textoCvLabel ?? "Curriculum vitae";
        txtCvLabel.hidden = !txtCvLabel.textContent.trim();
        previewNombres.style.setProperty("font-family", `"${configVisual.fuenteNombres}", Arial, sans-serif`, "important");
        previewNombres.style.setProperty("font-size", `${configVisual.tamanoNombres}px`, "important");
        previewNombres.style.paddingTop = `${configVisual.espacioNombres}px`;
        const nombresVistaConfig = $("configVistaNombres");
        nombresVistaConfig.style.setProperty("font-family", `"${configVisual.fuenteNombres}", Arial, sans-serif`, "important");
        nombresVistaConfig.style.setProperty("font-size", `${configVisual.tamanoNombres}px`, "important");

        $("valorTamanoSubgerencia").value = configVisual.tamanoSubgerencia;
        $("valorTamanoCv").value = configVisual.tamanoCv;
        $("valorTamanoTitulo").value = configVisual.tamanoTitulo;
        $("valorEspacioTitulo").value = configVisual.espacioTitulo;
        $("valorEspacioGerencia").value = configVisual.espacioGerencia;
        $("cfgPosicionSubgerencia").value = configVisual.posicionSubgerencia;
        $("valorEspacioCurriculum").value = configVisual.espacioCurriculum;
        $("valorTamanoEscudo").value = configVisual.tamanoEscudo;
        const contorno = obtenerConfiguracionContorno(configVisual);
        configVisual.grosorBordePrincipal = contorno.grosorPrincipal;
        configVisual.colorBordePrincipal = contorno.colorPrincipal;
        configVisual.grosorLineaContorno1 = contorno.grosor1;
        configVisual.grosorLineaContorno2 = contorno.grosor2;
        configVisual.lineasContorno = contorno.lineas;
        configVisual.colorLineaContorno1 = contorno.color1;
        configVisual.colorLineaContorno2 = contorno.color2;
        $("cfgGrosorBordePrincipal").value = String(contorno.grosorPrincipal);
        $("cfgColorBordePrincipal").value = contorno.colorPrincipal;
        $("cfgGrosorLineaContorno1").value = String(contorno.grosor1);
        $("cfgGrosorLineaContorno2").value = String(contorno.grosor2);
        $("wrapLineaContorno1").hidden = contorno.lineas < 1;
        $("wrapLineaContorno2").hidden = contorno.lineas < 2;
        $("cfgLineasContorno").value = String(contorno.lineas);
        $("cfgColorLineaContorno1").value = contorno.color1;
        $("cfgColorLineaContorno2").value = contorno.color2;
        $("cfgFuenteNombres").value = configVisual.fuenteNombres;
        $("cfgAlineacionNombres").value = configVisual.alineacionNombres;
        $("valorTamanoNombres").value = configVisual.tamanoNombres;
        $("valorEspacioNombres").value = configVisual.espacioNombres;
        configVisual.fuenteSeparador = configVisual.fuenteSeparador || "Arial";
        if (!Number.isFinite(Number(configVisual.tamanoSeparador))) configVisual.tamanoSeparador = 18;
        if (!Number.isFinite(Number(configVisual.espacioSeparador))) configVisual.espacioSeparador = 0;
        $("cfgFuenteSeparador").value = configVisual.fuenteSeparador;
        $("valorTamanoSeparador").value = configVisual.tamanoSeparador;
        $("valorEspacioSeparador").value = configVisual.espacioSeparador;

        // Aseguramos valores numéricos antes de mostrarlos en configuración.
        if (!Number.isFinite(Number(configVisual.tamanoFolio))) configVisual.tamanoFolio = 28;
        if (!Number.isFinite(Number(configVisual.posicionFolio))) configVisual.posicionFolio = 0;
        if (!Number.isFinite(Number(configVisual.tamanoPeriodo))) configVisual.tamanoPeriodo = 15;
        if (!Number.isFinite(Number(configVisual.posicionPeriodo))) configVisual.posicionPeriodo = 0;
        $("valorTamanoFolio").value = configVisual.tamanoFolio;
        $("valorPosicionFolio").value = configVisual.posicionFolio;
        $("valorTamanoPeriodo").value = configVisual.tamanoPeriodo;
        $("valorPosicionPeriodo").value = configVisual.posicionPeriodo;
        $("cfgOrdenFolioPeriodo").value = configVisual.ordenFolioPeriodo;

        actualizarVistaPreviaConfiguracion();
        if (guardar) guardarConfigVisual(grupo);
        actualizarPreview();
      }

      /* LÓGICA DE BÚSQUEDA INTELIGENTE */
      function cumpleFiltroInteligente(f, texto) {
        if (!texto) return true;
        const query = normalizarTexto(texto);

        if (query.startsWith("bloque")) {
          const numBloqueBuscado = query.replace("bloque", "").trim();
          const bloqFolio = normalizarTexto(f.numero_bloque);
          
          if (!numBloqueBuscado) return bloqFolio.length > 0;
          
          const intBuscado = parseInt(numBloqueBuscado, 10);
          const intFolio = parseInt(bloqFolio, 10);
          
          if (!isNaN(intBuscado) && !isNaN(intFolio)) {
            return intBuscado === intFolio || bloqFolio.includes(numBloqueBuscado);
          }
          return bloqFolio.includes(numBloqueBuscado);
        }

        if (/^\d{1,2}$/.test(query)) {
          const numFolio = normalizarTexto(f.numero_folio);
          const intQuery = parseInt(query, 10);
          const intFolio = parseInt(numFolio, 10);
          return numFolio === query || (!isNaN(intFolio) && intFolio === intQuery);
        }

        if (/^\d{4}$/.test(query) || /^\d{4}\s*-\s*\d{4}$/.test(query)) {
          return normalizarTexto(f.periodo).includes(query);
        }

        const num = normalizarTexto(f.numero_folio);
        const bloq = normalizarTexto(f.numero_bloque);
        const per = normalizarTexto(f.periodo);
        const obs = normalizarTexto(f.observaciones);
        const terminos = query.split(" ");
        const nombres = Array.isArray(f.nombres) ? f.nombres : [f.nombres || ""];
        const cargos = Array.isArray(f.cargos) ? f.cargos : [f.cargos || ""];

        return num === query ||
               bloq === query ||
               per === query ||
               obs.includes(query) ||
               nombres.some((n) => {
                 const nombre = normalizarTexto(n);
                 return nombre.includes(query) || terminos.every((termino) => nombre.includes(termino));
               }) ||
               cargos.some((c) => normalizarTexto(c).includes(query));
      }

      async function cargarFoliosCache() {
        if (foliosCacheCargado) return { data: todosLosFoliosCache, error: null };
        if (promesaCargaFolios) return promesaCargaFolios;

        promesaCargaFolios = clienteDB.from("folios_cv").select("*")
          .eq("owner_id", usuarioAutenticado.id)
          .order("creado_en", { ascending: false })
          .then((resultado) => {
            if (!resultado.error) {
              todosLosFoliosCache = resultado.data || [];
              foliosCacheCargado = true;
              duplicadosGlobales = obtenerDuplicadosPorFolio(todosLosFoliosCache);
            }
            return resultado;
          })
          .finally(() => { promesaCargaFolios = null; });

        return promesaCargaFolios;
      }

      function actualizarFoliosCache(folio, eliminar = false) {
        const id = String(folio.id);
        const indice = todosLosFoliosCache.findIndex((item) => String(item.id) === id);
        if (eliminar) {
          if (indice !== -1) todosLosFoliosCache.splice(indice, 1);
        } else if (indice === -1) {
          todosLosFoliosCache.unshift(folio);
        } else {
          todosLosFoliosCache[indice] = { ...todosLosFoliosCache[indice], ...folio };
        }
        duplicadosGlobales = obtenerDuplicadosPorFolio(todosLosFoliosCache);
      }

      async function obtenerTotalRegistros(filtro = "") {
        const { data, error } = await cargarFoliosCache();
        if (error || !data) return 0;
        if (!filtro.trim()) return data.length;
        return data.filter((f) => cumpleFiltroInteligente(f, filtro)).length;
      }

      function obtenerDuplicadosPorFolio(folios) {
        const mapa = new Map();
        folios.forEach((f) => {
          const nombres = Array.isArray(f.nombres) ? f.nombres : [];
          const idFolio = String(f.id);
          nombres.forEach((nombre, index) => {
            if (!nombre || !nombre.trim() || esSeparador(nombre)) return;
            const clave = normalizarTexto(nombre);
            if (!mapa.has(clave)) mapa.set(clave, new Map());
            if (!mapa.get(clave).has(idFolio)) {
              mapa.get(clave).set(idFolio, { id: idFolio, numero_folio: f.numero_folio, numero_bloque: f.numero_bloque, periodo: f.periodo, posiciones: [] });
            }
            mapa.get(clave).get(idFolio).posiciones.push(index + 1);
          });
        });

        const duplicados = {};
        for (const [nombre, foliosMap] of mapa.entries()) {
          const lista = Array.from(foliosMap.values());
          const totalOcurrencias = lista.reduce((sum, f) => sum + f.posiciones.length, 0);
          if (lista.length > 1 || lista.some(f => f.posiciones.length > 1)) {
            duplicados[nombre] = { cantidadFolios: lista.length, totalOcurrencias, folios: lista };
          }
        }
        return duplicados;
      }

      /* ACTUALIZACIÓN DEL CONTROL DE PAGINACIÓN */
      function actualizarBarraPaginacion() {
        const select = $("selectPaginaDirecta");
        select.innerHTML = "";

        for (let i = 0; i < totalPaginas; i++) {
          const opt = document.createElement("option");
          opt.value = i;
          opt.textContent = i + 1;
          if (i === paginaActual) opt.selected = true;
          select.appendChild(opt);
        }

        $("txtTotalPaginas").textContent = `de ${totalPaginas}`;
        $("btnPagPrimera").disabled = paginaActual === 0;
        $("btnPagAnterior").disabled = paginaActual === 0;
        $("btnPagSiguiente").disabled = paginaActual >= totalPaginas - 1 || totalPaginas === 0;
        $("btnPagUltima").disabled = paginaActual >= totalPaginas - 1 || totalPaginas === 0;
      }

      async function cargarPagina(pagina) {
        if (pagina < 0 || (pagina >= totalPaginas && totalPaginas > 0)) return;
        const { data, error } = await cargarFoliosCache();
        if (error) { listaFolios.innerHTML = "Error: " + error.message; return; }

        let foliosFiltrados = [...(data || [])];
        if (filtroActivo) {
          foliosFiltrados = foliosFiltrados.filter(f => cumpleFiltroInteligente(f, filtroActivo));
        }

        if (ordenarListaPorBloque) {
          foliosFiltrados.sort((a, b) => {
            const porBloque = compararNumericoNatural(a.numero_bloque, b.numero_bloque);
            if (porBloque !== 0) return porBloque;
            return compararNumericoNatural(a.numero_folio, b.numero_folio);
          });
        }

        totalRegistros = foliosFiltrados.length;
        totalPaginas = Math.ceil(totalRegistros / PAGE_SIZE) || 1;
        if (pagina >= totalPaginas) pagina = 0;

        const foliosPagina = foliosFiltrados.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE);
        actualizarMarcadoDuplicadosFormulario();

        if (foliosPagina.length === 0) {
          listaFolios.innerHTML = '<p style="font-size:13px;color:#888;">No se encontraron folios.</p>';
        } else {
          renderizarLista(foliosPagina, duplicadosGlobales);
        }

        paginaActual = pagina;
        actualizarBarraPaginacion();
      }

      async function mostrarFoliosDuplicados(nombre, folioActualId = null) {
        const clave = normalizarTexto(nombre);
        if (!clave) return;

        // Buscamos TODAS las apariciones del nombre, indicando folio y posición.
        const ubicaciones = [];
        todosLosFoliosCache.forEach((folio) => {
          const nombres = Array.isArray(folio.nombres)
            ? folio.nombres
            : (folio.nombres ? [folio.nombres] : []);

          const posiciones = [];
          nombres.forEach((nombreGuardado, index) => {
            if (esSeparador(nombreGuardado)) return;
            if (normalizarTexto(nombreGuardado) === clave) {
              posiciones.push(index + 1);
            }
          });

          if (posiciones.length) {
            ubicaciones.push({
              id: String(folio.id ?? ""),
              numero_folio: folio.numero_folio,
              numero_bloque: folio.numero_bloque,
              periodo: folio.periodo,
              posiciones
            });
          }
        });

        // También mostramos las posiciones del formulario actual si el usuario
        // está escribiendo un nombre que aparece más de una vez allí.
        const posicionesFormulario = [];
        if (typeof contNombres !== "undefined") {
          Array.from(contNombres.querySelectorAll(".nombre-row")).forEach((fila, index) => {
            if (fila.dataset.tipo === "separador") return;
            const valor = fila.querySelector(".inpNombreItem")?.value || "";
            if (normalizarTexto(valor) === clave) posicionesFormulario.push(index + 1);
          });
        }

        const ubicacionesHtml = ubicaciones.map((folio) => {
          const esActual = folioActualId !== null && String(folio.id) === String(folioActualId);
          const bloqTexto = folio.numero_bloque
            ? ` <span style="color:#64748b;">[Bloque ${escaparHtml(folio.numero_bloque)}]</span>`
            : "";

          return `
            <li class="ubicacion-duplicado ${esActual ? "ubicacion-actual" : ""}" data-folio-id="${escaparHtml(folio.id)}" data-nombre="${escaparHtml(nombre)}" tabindex="0" role="button" aria-label="Ir al folio número ${escaparHtml(folio.numero_folio)}">
              <div>📁 <b>Folio N° ${escaparHtml(folio.numero_folio)}</b>${bloqTexto} - ${escaparHtml(folio.periodo || "----")}</div>
              <div class="posicion-duplicado">📍 Posición: ${folio.posiciones.join(", ")}</div>
            </li>`;
        }).join("");

        const formularioHtml = posicionesFormulario.length > 1
          ? `<div class="ubicacion-formulario">
               <div><b>📝 En el folio que estás editando</b></div>
               <div class="posicion-duplicado">📍 Posiciones: ${posicionesFormulario.join(", ")}</div>
             </div>`
          : "";

        const contenido = $("contenidoModalDuplicados");
        contenido.innerHTML = `
          <div>El nombre <b>“${escaparHtml(nombre)}”</b> tiene más de una aparición.</div>
          ${formularioHtml}
          ${ubicacionesHtml ? `
            <div class="titulo-ubicaciones">📌 Ubicación en folios guardados:</div>
            <ul class="lista-folios-duplicados">${ubicacionesHtml}</ul>
          ` : `
            <div class="sin-ubicaciones">No se encontraron ubicaciones guardadas para este nombre.</div>
          `}
        `;

        $("modalDuplicados").classList.add("mostrar");
      }

      async function navegarAUbicacionFolio(id, nombre) {
        const { data, error } = await cargarFoliosCache();
        if (error || !data) {
          alert("No se pudo abrir el folio seleccionado.");
          return;
        }

        const foliosOrdenados = [...data];
        if (ordenarListaPorBloque) {
          foliosOrdenados.sort((a, b) => {
            const porBloque = compararNumericoNatural(a.numero_bloque, b.numero_bloque);
            return porBloque || compararNumericoNatural(a.numero_folio, b.numero_folio);
          });
        }
        const indice = foliosOrdenados.findIndex((folio) => String(folio.id) === String(id));
        if (indice === -1) {
          alert("El folio ya no está disponible en la lista.");
          return;
        }

        buscador.value = "";
        filtroActivo = "";
        totalRegistros = foliosOrdenados.length;
        totalPaginas = Math.ceil(totalRegistros / PAGE_SIZE) || 1;
        foliosAbiertos.add(String(id));
        cerrarModal("modalDuplicados");
        await cargarPagina(Math.floor(indice / PAGE_SIZE));

        const detalles = Array.from(listaFolios.querySelectorAll("details[data-folio-id]"))
          .find((elemento) => String(elemento.dataset.folioId) === String(id));
        if (!detalles) return;
        detalles.open = true;
        const tarjeta = detalles.closest(".lista-item");
        tarjeta?.classList.remove("ubicacion-enfocada");
        const nombresCoincidentes = Array.from(detalles.querySelectorAll(".detalle-nombre"))
          .filter((elemento) => normalizarTexto(elemento.dataset.nombre) === normalizarTexto(nombre));
        nombresCoincidentes.forEach((elemento) => {
          elemento.classList.remove("nombre-ubicacion-enfocada");
          requestAnimationFrame(() => elemento.classList.add("nombre-ubicacion-enfocada"));
        });
        const destino = nombresCoincidentes[0] || tarjeta;
        destino?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (!nombresCoincidentes.length) requestAnimationFrame(() => tarjeta?.classList.add("ubicacion-enfocada"));
      }

      $("contenidoModalDuplicados").addEventListener("click", (event) => {
        const ubicacion = event.target.closest(".ubicacion-duplicado[data-folio-id]");
        if (ubicacion) navegarAUbicacionFolio(ubicacion.dataset.folioId, ubicacion.dataset.nombre || "");
      });

      $("contenidoModalDuplicados").addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const ubicacion = event.target.closest(".ubicacion-duplicado[data-folio-id]");
        if (!ubicacion) return;
        event.preventDefault();
        navegarAUbicacionFolio(ubicacion.dataset.folioId, ubicacion.dataset.nombre || "");
      });

      function renderizarLista(folios, duplicados = {}) {
        listaFolios.innerHTML = folios.map((f) => {
          const nombres = Array.isArray(f.nombres) ? f.nombres : [];
          const notas = Array.isArray(f.notas_pago) ? f.notas_pago : [];
          const cargos = Array.isArray(f.cargos) ? f.cargos : [];
          const isOpen = foliosAbiertos.has(String(f.id));
          const bloqueTieneDuplicados = nombres.some((nombre) => nombre && !esSeparador(nombre) && duplicados[normalizarTexto(nombre)]);

          const contenido = nombres.length ? nombres.map((nombre, index) => {
            if (esSeparador(nombre)) return "";
            const nota = notas[index] ?? "", cargo = cargos[index] ?? "";
            const cargoCoincide = !!filtroActivo.trim() && coincideTextoExacto(cargo, filtroActivo);
            const infoDuplicado = duplicados[normalizarTexto(nombre)];
            const esDuplicado = !!infoDuplicado;
            const posicionesActual = infoDuplicado ? (infoDuplicado.folios.find((folio) => String(folio.id) === String(f.id))?.posiciones || []) : [];
            const badgeTexto = posicionesActual.length > 1 ? `${posicionesActual.length} veces` : (infoDuplicado ? `${infoDuplicado.cantidadFolios} folios` : "");

            const badge = esDuplicado ? `<span class="duplicado-clicable" data-action="duplicados" data-folio-id="${escaparHtml(f.id)}" data-nombre="${escaparHtml(nombre)}" style="background:#facc15;color:#1e293b;border-radius:12px;padding:0 8px;font-size:10px;font-weight:bold;margin-left:4px;">${badgeTexto}</span>` : "";
              const nombreHtml = esDuplicado
              ? `<span class="duplicado-clicable" data-action="duplicados" data-folio-id="${escaparHtml(f.id)}" data-nombre="${escaparHtml(nombre)}" style="color:#dc2626;font-weight:bold;">${resaltarCoincidenciasTexto(nombre, filtroActivo)}</span>`
              : resaltarCoincidenciasTexto(nombre, filtroActivo);

            return `<div class="detalle-nombre" data-nombre="${escaparHtml(nombre)}">
              <div style="${esDuplicado ? 'text-decoration:underline;text-decoration-color:#ef4444;' : ''}">
                <b>${index + 1}.</b> ${nombreHtml}${badge} ${cargo ? `<span class="${cargoCoincide ? 'cargo-coincidente' : ''}" style="${cargoCoincide ? '' : 'color:#0ea5e9;font-weight:bold;'}">(${cargoCoincide ? escaparHtml(cargo) : resaltarCoincidenciasTexto(cargo, filtroActivo)})</span>` : ''}
              </div>
              ${nota ? `<div style="font-size:11px;color:#64748b;margin-left:14px;">📄 Nota: ${escaparHtml(nota)}</div>` : ''}
            </div>`;
          }).join("") : `<div class="detalle-vacio">No hay nombres registrados.</div>`;

          const nombresReales = nombres.filter((n) => !esSeparador(n));
          const bloqBadge = f.numero_bloque ? `<span style="background:#e2e8f0;color:#334155;padding:2px 6px;border-radius:4px;font-size:11px;margin-left:4px;">Bloque ${escaparHtml(f.numero_bloque)}</span>` : "";

          return `<div class="lista-item${bloqueTieneDuplicados ? ' bloque-duplicado' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div><b>N° ${escaparHtml(f.numero_folio)}</b>${bloqBadge} - ${escaparHtml(f.periodo)}${bloqueTieneDuplicados ? '<span class="marcador-bloque-duplicado">⚠️</span>' : ''}</div>
              <span style="color:#64748b;font-size:12px;">${nombresReales.length} nombre(s)</span>
            </div>
            <details style="margin-top:6px;" data-folio-id="${f.id}" ${isOpen ? 'open' : ''}>
              <summary style="cursor:pointer;color:#0ea5e9;">Ver contenido</summary>
              <div style="margin-top:6px;">${contenido}${f.observaciones ? `<div style="margin-top:6px;border-top:1px dashed #cbd5e1;padding-top:6px;font-size:12px;color:#475569;">📝 <b>Observaciones:</b> ${escaparHtml(f.observaciones)}</div>` : ''}</div>
            </details>
            <div class="acciones">
              <button class="btn-accion btn-editar" data-action="editar" data-folio-id="${escaparHtml(f.id)}">✏️ Editar</button>
              <button class="btn-accion btn-duplicar" data-action="duplicar" data-folio-id="${escaparHtml(f.id)}">📋 Duplicar</button>
              <button class="btn-accion btn-eliminar" data-action="eliminar" data-folio-id="${escaparHtml(f.id)}">🗑️ Eliminar</button>
            </div>
          </div>`;
        }).join("");
      }

      listaFolios.addEventListener("click", (event) => {
        const accion = event.target.closest("[data-action]");
        if (!accion || !listaFolios.contains(accion)) return;
        event.stopPropagation();

        const folioId = accion.dataset.folioId;
        if (accion.dataset.action === "duplicados") {
          mostrarFoliosDuplicados(accion.dataset.nombre || "", folioId);
          return;
        }

        const folio = todosLosFoliosCache.find((item) => String(item.id) === folioId);
        if (!folio) return;
        if (accion.dataset.action === "editar") editarFolio(folio);
        if (accion.dataset.action === "duplicar") duplicarFolio(folio);
        if (accion.dataset.action === "eliminar") eliminarFolio(folio.id, folio.numero_folio, folio.periodo);
      });

      async function recargarUltimaPagina() {
        totalRegistros = await obtenerTotalRegistros(filtroActivo);
        totalPaginas = Math.ceil(totalRegistros / PAGE_SIZE) || 1;
        if (paginaActual >= totalPaginas) paginaActual = Math.max(0, totalPaginas - 1);
        await cargarPagina(paginaActual);
      }

      /* HISTORIAL */
      function obtenerHistorial() {
        try { return JSON.parse(localStorage.getItem(claveLocalPorUsuario("historialFolios"))) || []; } catch { return []; }
      }
      function guardarHistorial(h) {
        localStorage.setItem(claveLocalPorUsuario("historialFolios"), JSON.stringify(h));
        // El historial también viaja: misma lista en cualquier navegador.
        clienteDB.from("config_visual_por_usuario").upsert({
          owner_id: usuarioAutenticado.id,
          historial: h
        })
          .then(({ error }) => { if (error) console.warn("No se pudo sincronizar el historial:", error.message); });
      }
      function agregarHistorial(accion, detalle) {
        const h = obtenerHistorial();
        h.unshift({ fecha: new Date().toLocaleString(), accion, detalle });
        if (h.length > 200) h.pop();
        guardarHistorial(h);
        renderizarHistorial();
      }
      function renderizarHistorial() {
        const h = obtenerHistorial();
        historialContenido.innerHTML = h.length ? h.map((i) => `<div class="historial-item"><span>${i.accion}: ${i.detalle}</span><span class="fecha">${i.fecha}</span></div>`).join("") : '<p style="color:#aaa;font-size:13px;">Sin acciones registradas.</p>';
      }

      /* RANGOS Y NOTAS DE PAGO */
      function validarRangoNotaPago(rango) {
        const texto = String(rango || "").trim();
        if (!texto) return { valido: true, total: null };
        const match = texto.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
        if (!match) return { valido: false, mensaje: "Usa el formato página inicial-página final." };
        const inicio = Number(match[1]), fin = Number(match[2]);
        if (inicio < 1 || fin < 1) return { valido: false, mensaje: "Las páginas deben ser mayores que 0." };
        if (inicio > fin) return { valido: false, mensaje: "La página inicial no puede ser mayor que la página final." };
        return { valido: true, total: fin - inicio + 1 };
      }

      function actualizarTotalNotaPago(row) {
        const input = row.querySelector(".inpNotaPago"), total = row.querySelector(".nota-pago-total");
        if (!input || !total) return;
        const res = validarRangoNotaPago(input.value);
        if (!input.value.trim()) { total.className = "nota-pago-total"; total.textContent = ""; return; }
        if (!res.valido) { total.className = "nota-pago-total nota-pago-error"; total.textContent = "⚠️ " + res.mensaje; return; }
        total.className = "nota-pago-total"; total.textContent = `✓ Total: ${res.total} página(s)`;
      }

      /* CONSTRUCCIÓN DE FILAS Y MANEJO DEL DOM */
      function crearFilaNombre(valor = "", notaPago = "", cargo = "") {
        const row = document.createElement("div");
        row.className = "nombre-row";
        const cargoFinal = cargo !== "" ? cargo : cargoActual;
        row.innerHTML = `
          <div class="nombre-row-top">
            <button type="button" class="btn-orden" onclick="moverFila(this, -1)">▲</button>
            <button type="button" class="btn-orden" onclick="moverFila(this, 1)">▼</button>
            <input type="text" class="inpNombreItem" value="${escaparHtml(valor)}">
            <span class="indicador-mover">↕ Mover</span>
            <input type="text" class="inpCargoItem" value="${escaparHtml(cargoFinal)}">
            <button type="button" onclick="this.closest('.nombre-row').remove(); actualizarPreview(); actualizarVisibilidadFilas();">✕</button>
          </div>
          <div class="nota-pago-wrap ${notasPagoVisibles ? "mostrar" : ""}">
            <label>📄 Nota de pagina(s)</label>
            <input type="text" class="inpNotaPago" value="${escaparHtml(notaPago)}" inputmode="numeric">
            <div class="nota-pago-total"></div>
          </div>`;
        contNombres.appendChild(row);
        actualizarTotalNotaPago(row);
        configurarFilaModoReordenar(row);
      }

      function crearFilaSeparador(valor = "") {
        const row = document.createElement("div");
        row.className = "nombre-row separador-row";
        row.dataset.tipo = "separador";
        row.innerHTML = `
          <div class="nombre-row-top">
            <button type="button" class="btn-orden" onclick="moverFila(this, -1)">▲</button>
            <button type="button" class="btn-orden" onclick="moverFila(this, 1)">▼</button>
            <input type="text" class="inpSeparador" value="${escaparHtml(valor)}" >
            <button type="button" onclick="this.closest('.nombre-row').remove(); actualizarPreview(); actualizarVisibilidadFilas();">✕</button>
          </div>`;
        contNombres.appendChild(row);
        configurarFilaModoReordenar(row);
      }

      function configurarFilaModoReordenar(fila) {
        if (!contNombres.classList.contains("modo-reordenar")) return;
        fila.draggable = true;
        fila.querySelectorAll("input, textarea").forEach((control) => {
          control.dataset.readonlyAntesOrden = String(control.readOnly);
          control.readOnly = true;
        });
        fila.querySelectorAll("select, button").forEach((control) => {
          control.dataset.disabledAntesOrden = String(control.disabled);
          control.disabled = true;
        });
      }

      function moverFila(btn, dir) {
        const row = btn.closest(".nombre-row");
        const target = dir === -1 ? row.previousElementSibling : row.nextElementSibling;
        if (target) {
          if (dir === -1) contNombres.insertBefore(row, target);
          else contNombres.insertBefore(target, row);
          actualizarPreview(); actualizarVisibilidadFilas();
        }
      }

      function actualizarVisibilidadFilas() {
        const filas = Array.from(contNombres.querySelectorAll(".nombre-row"));
        const contOpciones = $("contOpcionesFilas");
        const total = filas.length;

        if (total <= MAX_NOMBRES_VISIBLES) {
          filas.forEach((f) => f.classList.remove("fila-oculta"));
          contOpciones.style.display = "none";
          return;
        }

        contOpciones.style.display = "block";
        $("selectMostrarFilas").value = modoMostrarFilas;
        filas.forEach((fila, i) => {
          if (modoMostrarFilas === "primeros") fila.classList.toggle("fila-oculta", i >= MAX_NOMBRES_VISIBLES);
          else if (modoMostrarFilas === "ultimos") fila.classList.toggle("fila-oculta", i < total - MAX_NOMBRES_VISIBLES);
          else fila.classList.remove("fila-oculta");
        });
      }

      function mostrarUltimosNombres(autoScroll = true) {
        modoMostrarFilas = "ultimos";
        $("selectMostrarFilas").value = "ultimos";
        actualizarVisibilidadFilas();

        if (!autoScroll) return;

        const filasVisibles = Array.from(contNombres.querySelectorAll(".nombre-row:not(.fila-oculta)"));
        const ultimaFila = filasVisibles[filasVisibles.length - 1];
        if (ultimaFila) {
          ultimaFila.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          contNombres.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }

      function obtenerUsuarios() {
        return Array.from(document.querySelectorAll(".nombre-row")).map((row) => {
          if (row.dataset.tipo === "separador") {
            const texto = row.querySelector(".inpSeparador")?.value.trim() || "";
            // El estilo se toma siempre desde Ajustes, no desde la fila.
            return { nombre: texto ? MARCADOR_SEPARADOR + texto : "", nota: "", cargo: "", separador: true, textoSeparador: texto };
          }
          return {
            nombre: row.querySelector(".inpNombreItem")?.value.trim() || "",
            nota: row.querySelector(".inpNotaPago")?.value.trim() || "",
            cargo: row.querySelector(".inpCargoItem")?.value.trim() || "",
            separador: false
          };
        }).filter((u) => u.nombre.length > 0);
      }

      function actualizarMarcadoDuplicadosFormulario() {
        const inputs = Array.from(contNombres.querySelectorAll(".inpNombreItem"));
        const posiciones = new Map();

        // Duplicados dentro del formulario actual.
        inputs.forEach((input, i) => {
          const clave = normalizarTexto(input.value);
          if (!clave) return;
          if (!posiciones.has(clave)) posiciones.set(clave, []);
          posiciones.get(clave).push(i + 1);
        });

        // Comprobamos directamente TODOS los folios cargados.
        // Esto evita depender de que duplicadosGlobales se haya actualizado.
        const foliosGuardados = Array.isArray(todosLosFoliosCache) ? todosLosFoliosCache : [];

        function buscarCoincidenciasGuardadas(clave) {
          const encontrados = [];

          foliosGuardados.forEach((folio) => {
            const nombres = Array.isArray(folio.nombres)
              ? folio.nombres
              : (folio.nombres ? [folio.nombres] : []);

            const posiciones = [];
            nombres.forEach((nombre, index) => {
              if (esSeparador(nombre)) return;
              if (normalizarTexto(nombre) === clave) posiciones.push(index + 1);
            });

            if (posiciones.length > 0) {
              encontrados.push({
                id: String(folio.id ?? ""),
                numero_folio: folio.numero_folio,
                numero_bloque: folio.numero_bloque,
                periodo: folio.periodo,
                posiciones
              });
            }
          });

          return encontrados;
        }

        inputs.forEach((input) => {
          const clave = normalizarTexto(input.value);

          if (!clave) {
            input.classList.remove("nombre-duplicado-input");
            input.title = "";
            input.onclick = null;
            return;
          }

          const posicionesActuales = posiciones.get(clave) || [];
          const coincidencias = buscarCoincidenciasGuardadas(clave);

          // Al editar un folio, el propio folio no cuenta como "otro folio".
          // En un folio nuevo, cualquier coincidencia guardada sí es duplicado.
          const existeEnOtroFolio = coincidencias.some((folio) => {
            return !inpId.value || folio.id !== String(inpId.value);
          });

          const esDuplicado = posicionesActuales.length > 1 || existeEnOtroFolio;

          if (esDuplicado) {
            input.classList.add("nombre-duplicado-input");
            // El nombre solo se marca en rojo mientras se escribe.
            // La ubicación del duplicado se muestra al guardar.
            input.title = "⚠️ Nombre duplicado. Al guardar se mostrará dónde está.";
            input.onclick = null;
          } else {
            input.classList.remove("nombre-duplicado-input");
            input.title = "";
            input.onclick = null;
          }
        });
      }

      function actualizarDuplicadosEnTiempoReal() {
        actualizarMarcadoDuplicadosFormulario();
      }

      function showDuplicadosDialog(val) { if (val) mostrarFoliosDuplicados(val, inpId.value || null); }

      async function mostrarDuplicadosAlGuardar(nombres, folioActualId) {
        const claves = [...new Set((nombres || [])
          .filter((n) => n && !esSeparador(n))
          .map((n) => normalizarTexto(n))
          .filter(Boolean))];

        if (!claves.length) return;

        const foliosGuardados = todosLosFoliosCache;

        const bloques = [];

        claves.forEach((clave) => {
          const nombreOriginal = nombres.find((n) => !esSeparador(n) && normalizarTexto(n) === clave) || clave;
          const ubicaciones = [];

          foliosGuardados.forEach((folio) => {
            const lista = Array.isArray(folio.nombres)
              ? folio.nombres
              : (folio.nombres ? [folio.nombres] : []);
            const posiciones = [];

            lista.forEach((nombre, index) => {
              if (esSeparador(nombre)) return;
              if (normalizarTexto(nombre) === clave) posiciones.push(index + 1);
            });

            if (posiciones.length) {
              ubicaciones.push({
                id: String(folio.id ?? ""),
                numero_folio: folio.numero_folio,
                numero_bloque: folio.numero_bloque,
                periodo: folio.periodo,
                posiciones
              });
            }
          });

          const totalApariciones = ubicaciones.reduce((sum, f) => sum + f.posiciones.length, 0);
          if (totalApariciones < 2) return;

          const ubicacionesHtml = ubicaciones.map((folio) => {
            const esActual = String(folio.id) === String(folioActualId);
            const bloque = folio.numero_bloque
              ? ` <span style="color:#64748b;">[Bloque ${escaparHtml(folio.numero_bloque)}]</span>`
              : "";

            return `
              <li class="ubicacion-duplicado ${esActual ? "ubicacion-actual" : ""}" data-folio-id="${escaparHtml(folio.id)}" data-nombre="${escaparHtml(nombreOriginal)}" tabindex="0" role="button" aria-label="Ir al folio número ${escaparHtml(folio.numero_folio)}">
                <div>📁 <b>Folio N° ${escaparHtml(folio.numero_folio)}</b>${bloque} - ${escaparHtml(folio.periodo || "----")}</div>
                <div class="posicion-duplicado">📍 Posición: ${folio.posiciones.join(", ")}</div>
              </li>`;
          }).join("");

          bloques.push(`
            <div style="margin-bottom:14px;">
              <div style="margin-bottom:6px;">👤 <b>“${escaparHtml(nombreOriginal)}”</b></div>
              <div class="titulo-ubicaciones">📌 Se encontró duplicado en:</div>
              <ul class="lista-folios-duplicados">${ubicacionesHtml}</ul>
            </div>`);
        });

        if (!bloques.length) return;

        $("contenidoModalDuplicados").innerHTML = `
          <div style="margin-bottom:12px;">⚠️ Se encontraron <b>nombres duplicados</b> en los folios guardados.</div>
          ${bloques.join("")}
        `;
        $("modalDuplicados").classList.add("mostrar");
      }

      function actualizarPreview() {
        actualizarMarcadoDuplicadosFormulario();
        const usuarios = obtenerUsuarios();
        const visibles = usuarios.slice(0, MAX_NOMBRES_VISIBLES);

        previewNombres.innerHTML = visibles.length ? visibles.map((u) => u.separador
          ? obtenerHtmlSeparador(u.textoSeparador, "normal", configVisual)
          : `<div>${escaparHtml(u.nombre)}</div>`).join("") : '<div class="sin-nombres"></div>';
        previewNumero.textContent = inpNumero.value || "--";
        previewPeriodo.textContent = inpPeriodo.value || "----";

        // Si la configuración está abierta, la vista previa usa inmediatamente
        // el número de folio y el año/periodo actuales.
        if ($("modalConfig")?.classList.contains("mostrar")) {
          actualizarVistaPreviaConfiguracion();
        }
      }

      function limpiarFormulario() {
        inpId.value = ""; 
        cargarConfiguracionParaFolio("actual_form");
        inpNumero.value = ""; 
        inpBloque.value = bloqueActual; 
        inpPeriodo.value = ""; 
        contNombres.innerHTML = "";
        crearFilaNombre(); 
        inpObservaciones.value = "";
        modoEdicion.classList.remove("mostrar");
        notasPagoVisibles = false; 
        modoMostrarFilas = "ultimos";
        $("selectMostrarFilas").value = "ultimos";
        actualizarVisibilidadNotas(); 
        actualizarPreview(); 
        actualizarVisibilidadFilas();
      }

      function actualizarVisibilidadNotas() {
        document.querySelectorAll(".nota-pago-wrap").forEach((el) => el.classList.toggle("mostrar", notasPagoVisibles));
        const btn = $("btnMostrarNotas");
        btn.classList.toggle("activo", notasPagoVisibles);
        btn.textContent = notasPagoVisibles ? "⚙️ Ocultar notas" : "⚙️ Notas";
      }

      /* MODO REORDENAR Y DRAG & DROP */
      $("btnReordenar").addEventListener("click", function() {
        const activo = contNombres.classList.toggle("modo-reordenar");
        this.textContent = activo ? "✓ Finalizar" : "↕ Reordenar";
        filaSeleccionada = null;
        document.querySelectorAll(".nombre-row").forEach(f => {
          f.draggable = activo;
          f.classList.remove("seleccionado", "arrastrando");
          f.querySelector(".etiqueta-mover-separador")?.remove();
          f.querySelectorAll("input, textarea").forEach(control => {
            if (activo) {
              control.dataset.readonlyAntesOrden = String(control.readOnly);
              control.readOnly = true;
            } else {
              control.readOnly = control.dataset.readonlyAntesOrden === "true";
              delete control.dataset.readonlyAntesOrden;
            }
          });
          f.querySelectorAll("select, button").forEach(control => {
            if (activo) {
              control.dataset.disabledAntesOrden = String(control.disabled);
              control.disabled = true;
            } else {
              control.disabled = control.dataset.disabledAntesOrden === "true";
              delete control.dataset.disabledAntesOrden;
            }
          });
        });
        actualizarVisibilidadFilas();
        if (!activo) actualizarPreview();
      });

      contNombres.addEventListener("click", (e) => {
  if (!contNombres.classList.contains("modo-reordenar")) return;
  const fila = e.target.closest(".nombre-row");
  if (!fila || e.target.closest("button")) return;

  document.querySelectorAll(".nombre-row").forEach(f => {
    f.classList.remove("seleccionado");
    const etiqueta = f.querySelector(".etiqueta-mover-separador");
    if (etiqueta) etiqueta.remove();
  });

  filaSeleccionada = fila;
  fila.classList.add("seleccionado");

  if (fila.dataset.tipo === "separador") {
    const texto = fila.querySelector(".inpSeparador")?.value.trim() || "";
    const span = document.createElement("span");
    span.className = "etiqueta-mover-separador";
    span.innerHTML = texto
      ? `↕ Mover <span class="nombre-separador-texto">${escaparHtml(texto)}</span>`
      : "↕ Mover";
    fila.querySelector(".nombre-row-top").insertBefore(span, fila.querySelector("button[onclick*='remove']"));
  }
});
      contNombres.addEventListener("dragstart", (e) => {
        const fila = e.target.closest(".nombre-row");
        if (!contNombres.classList.contains("modo-reordenar") || !fila || fila !== filaSeleccionada) { e.preventDefault(); return; }
        filaArrastrada = fila; fila.classList.add("arrastrando");
      });

      contNombres.addEventListener("dragend", () => {
        if (filaArrastrada) { filaArrastrada.classList.remove("arrastrando"); actualizarPreview(); actualizarVisibilidadFilas(); }
        filaArrastrada = null;
      });

      contNombres.addEventListener("dragover", (e) => {
        if (!filaArrastrada) return;
        e.preventDefault();
        const fila = e.target.closest(".nombre-row");
        if (!fila || fila === filaArrastrada) return;
        const mitad = fila.getBoundingClientRect().top + fila.getBoundingClientRect().height / 2;
        if (e.clientY < mitad) contNombres.insertBefore(filaArrastrada, fila);
        else contNombres.insertBefore(filaArrastrada, fila.nextSibling);
      });

      /* EVENTOS DE BOTONES E INPUTS */
      $("btnMostrarNotas").onclick = () => { notasPagoVisibles = !notasPagoVisibles; actualizarVisibilidadNotas(); };
      $("btnAgregarNombre").onclick = () => {
        crearFilaNombre();
        mostrarUltimosNombres(true);
        actualizarPreview();
        actualizarVisibilidadNotas();
      };
      $("btnAgregarSeparador").onclick = () => {
        crearFilaSeparador();
        mostrarUltimosNombres(true);
        actualizarPreview();
      };
      $("selectMostrarFilas").addEventListener("change", function() { modoMostrarFilas = this.value; actualizarVisibilidadFilas(); });
      
      /* IMPRESIÓN PERSONALIZADA DE 2 CARÁTULAS EN 1 HOJA */
      $("btnImprimirPDF").onclick = () => {
        abrirModalImpresion();
      };

      function obtenerHtmlCaratula(folio) {
        const config = obtenerConfiguracionParaFolio(folio.id);
        const contorno = obtenerConfiguracionContorno(config);
        const nombres = Array.isArray(folio.nombres) ? folio.nombres.slice(0, 10) : [folio.nombres || ""];
        const nombresHtml = nombres.map((nombre) => {
          if (!esSeparador(nombre)) return `<div>${escaparHtml(nombre)}</div>`;
          const separador = obtenerDatosSeparador(nombre);
          return obtenerHtmlSeparador(separador.texto, "normal", config);
        }).join("");
        return `
          <div class="caratula ${config.ordenFolioPeriodo === "folio-arriba" ? "orden-folio-arriba" : "orden-periodo-arriba"} ${config.posicionSubgerencia === "encima-escudo" ? "area-sobre-escudo" : ""} ${config.alineacionNombres === "centrado" ? "nombres-centrados" : ""} ${contorno.lineas >= 1 ? "contorno-linea-1" : ""} ${contorno.lineas >= 2 ? "contorno-linea-2" : ""}" style="border-color:${contorno.colorPrincipal}; border-width:${contorno.grosorPrincipal}px; --grosor-borde-principal:${contorno.grosorPrincipal}px; --color-borde-principal:${contorno.colorPrincipal}; --grosor-linea-contorno-1:${contorno.grosor1}px; --grosor-linea-contorno-2:${contorno.grosor2}px; --color-linea-contorno-1:${contorno.color1}; --color-linea-contorno-2:${contorno.color2}; --tamano-titulo:${config.tamanoTitulo}px; --espacio-titulo:${config.espacioTitulo}px; --tamano-escudo:${config.tamanoEscudo}px; --fuente-nombres:'${escaparHtml(config.fuenteNombres || "Arial")}'; --tamano-nombres:${Number(config.tamanoNombres) || 15}px; --espacio-gerencia:${config.espacioGerencia}px; --espacio-curriculum:${config.espacioCurriculum}px; --espacio-nombres:${config.espacioNombres}px; --tamano-folio:${config.tamanoFolio}px; --posicion-folio:${config.posicionFolio}px; --tamano-periodo:${config.tamanoPeriodo}px; --posicion-periodo:${config.posicionPeriodo}px;">
            <div class="titulo">MUNICIPALIDAD DISTRITAL DE CHINCHAO</div>
            <img class="escudo" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiij9VKAtMBiHfcGy8Q-NeekFK54ihGvJrZXLHmxDx9CH1jUUrDz5Gfvc&s=10" alt="Escudo">
            ${config.textoSubgerencia?.trim() ? `<div class="subgerencia" style="font-family:'${config.fuenteSubgerencia}', Arial, sans-serif; font-size:${config.tamanoSubgerencia}px;">${escaparHtml(config.textoSubgerencia).replace(/\n/g, "<br>")}</div>` : ""}
            ${config.textoCvLabel?.trim() ? `<div class="cv-label" style="font-family:'${config.fuenteCv}', Algerian, 'Bookman Old Style', serif; font-size:${config.tamanoCv}px;">${escaparHtml(config.textoCvLabel)}</div>` : ""}
            <div class="nombres">${nombresHtml}</div>
            <div class="folio-circulo">${escaparHtml(folio.numero_folio || '--')}</div>
            <div class="periodo">${escaparHtml(folio.periodo || '----')}</div>
          </div>
        `;
      }

      function obtenerFoliosFiltradosParaImpresion(folios, texto) {
        const query = texto.trim();
        const base = query ? folios.filter((f) => cumpleFiltroInteligente(f, query)) : [...folios];
        return base.filter((f) => !esFolioImpreso(String(f.id)));
      }

      function renderizarListaFoliosImpresos(foliosDisponibles) {
        const contenedor = $("listaFoliosImpresos");
        const boton = $("btnToggleFoliosImpresos");
        if (!contenedor || !boton) return;

        const impresos = foliosDisponibles.filter((f) => esFolioImpreso(String(f.id)));
        boton.textContent = mostrarFoliosImpresos ? "Ocultar impresos" : "Ver todos los impresos";
        boton.setAttribute("aria-expanded", String(mostrarFoliosImpresos));
        contenedor.style.display = mostrarFoliosImpresos ? "block" : "none";

        const query = normalizarTexto(buscadorImpresion?.value || "");
        const impresosFiltrados = query
          ? impresos.filter((f) => normalizarTexto([
              f.numero_folio,
              f.numero_bloque ? `bloque ${f.numero_bloque}` : "",
              f.periodo
            ].join(" ")).includes(query))
          : impresos;

        if (!impresosFiltrados.length) {
          contenedor.innerHTML = `<div style="color:#64748b;font-size:12px;">${impresos.length ? "No hay impresos que coincidan con la búsqueda." : "No hay folios impresos."}</div>`;
          return;
        }

        contenedor.innerHTML = impresosFiltrados.map((f) => `
          <div class="folio-impreso-item">
            <div class="folio-impreso-datos">
              <span class="folio-impreso-numero">N° ${escaparHtml(f.numero_folio)}</span>
              ${f.numero_bloque ? `<span class="folio-impreso-bloque">Bloque ${escaparHtml(f.numero_bloque)}</span>` : ""}
              <span class="folio-impreso-periodo">Período: ${escaparHtml(f.periodo)}</span>
            </div>
            <button type="button" onclick="desmarcarFolioImpreso('${f.id}')" title="Quitar de impresos" class="btn-deshacer-impreso">Deshacer</button>
          </div>
        `).join("");
      }

      function desmarcarFolioImpreso(id) {
        const idStr = String(id);
        const foliosDisponibles = obtenerFoliosParaImpresion();
        const folio = foliosDisponibles.find((f) => String(f.id) === idStr);
        const etiqueta = folio ? `N° ${folio.numero_folio}${folio.numero_bloque ? ` [Bloque ${folio.numero_bloque}]` : ""} - ${folio.periodo}` : `ID ${idStr}`;

        if (!confirm(`¿Quitar "${etiqueta}" de Impresos?\n\nVolverá a la lista de selección para poder imprimirlo de nuevo.`)) return;

        foliosImpresos = foliosImpresos.filter((f) => f !== idStr);
        guardarFoliosImpresos();

        renderizarListaFoliosImpresos(foliosDisponibles);
        renderizarListaImpresion(foliosDisponibles);
        agregarHistorial("↩️ Deshecho", `Se quitó de Impresos: ${etiqueta}`);
      }

      function renderizarListaImpresion(foliosDisponibles) {
        const contenedorLista = $("listaSeleccionImprimir");
        const { foliosFiltrados, foliosPagina, totalPaginas } = obtenerPaginaFoliosImpresion(foliosDisponibles);
        actualizarPaginacionImpresion(totalPaginas);

        contenedorLista.innerHTML = "";

        if (!foliosFiltrados.length) {
          contenedorLista.innerHTML = '<div style="color:#64748b; font-size:13px;">No se encontraron folios con ese criterio.</div>';
          actualizarContadorImpresion(foliosDisponibles);
          actualizarEstadoMarcarTodosVisibles(foliosDisponibles);
          return;
        }

        foliosPagina.forEach((f) => {
          const idStr = String(f.id);
          const checked = foliosMarcadosParaImprimir.includes(idStr) ? "checked" : "";
          const item = document.createElement("label");
          item.style.cssText = "display:flex; align-items:center; gap:8px; padding:6px; border-bottom:1px solid #e2e8f0; cursor:pointer;";
          item.innerHTML = `
            <input type="checkbox" class="chkFolioImprimir" value="${f.id}" ${checked} style="width:auto;">
            <span style="font-size:13px; font-weight:bold;">N° ${escaparHtml(f.numero_folio)}</span>
            ${f.numero_bloque ? `<span style="font-size:11px; color:#334155; background:#e2e8f0; padding:2px 6px; border-radius:4px;">Bloque ${escaparHtml(f.numero_bloque)}</span>` : ""}
            <span style="font-size:11px; color:#64748b;">Periodo: ${escaparHtml(f.periodo)}</span>
          `;
          contenedorLista.appendChild(item);
        });

        contenedorLista.querySelectorAll(".chkFolioImprimir").forEach((chk) => {
          chk.addEventListener("change", (e) => {
            const idVal = String(e.target.value);
            if (e.target.checked) {
              if (!foliosMarcadosParaImprimir.includes(idVal)) foliosMarcadosParaImprimir.push(idVal);
            } else {
              foliosMarcadosParaImprimir = foliosMarcadosParaImprimir.filter((id) => id !== idVal);
            }
            actualizarContadorImpresion(foliosDisponibles);
            actualizarEstadoMarcarTodosVisibles(foliosDisponibles);
            renderizarVistaPreviaHojaImpresion(foliosDisponibles);
          });
        });

        actualizarContadorImpresion(foliosDisponibles);
        actualizarEstadoMarcarTodosVisibles(foliosDisponibles);
      }

      function abrirModalImpresion() {
        const foliosDisponibles = obtenerFoliosParaImpresion();

        foliosMarcadosParaImprimir = inpId.value ? [String(inpId.value)] : [];
        paginaImpresionActual = 0;
        if (buscadorImpresion) buscadorImpresion.value = "";

        if ($("chkMarcarTodosVisibles")) $("chkMarcarTodosVisibles").checked = false;
        renderizarListaFoliosImpresos(foliosDisponibles);
        renderizarListaImpresion(foliosDisponibles);
        renderizarVistaPreviaHojaImpresion(foliosDisponibles);
        $("modalImpresion").classList.add("mostrar");
      }

      if (buscadorImpresion) {
        buscadorImpresion.addEventListener("input", () => {
          paginaImpresionActual = 0;
          const foliosDisponibles = obtenerFoliosParaImpresion();
          renderizarListaFoliosImpresos(foliosDisponibles);
          renderizarListaImpresion(foliosDisponibles);
        });
      }

      const seccionFoliosImpresos = $("seccionFoliosImpresos");
      const btnToggleFoliosImpresos = $("btnToggleFoliosImpresos");
      if (seccionFoliosImpresos && btnToggleFoliosImpresos) {
        btnToggleFoliosImpresos.addEventListener("click", () => {
          mostrarFoliosImpresos = !mostrarFoliosImpresos;
          renderizarListaFoliosImpresos(obtenerFoliosParaImpresion());
        });
      }

      $("btnPaginaImpresionAnterior").addEventListener("click", () => {
        if (paginaImpresionActual === 0) return;
        paginaImpresionActual--;
        renderizarListaImpresion(obtenerFoliosParaImpresion());
      });

      $("btnPaginaImpresionSiguiente").addEventListener("click", () => {
        const totalPaginas = Math.ceil(
          obtenerFoliosFiltradosParaImpresion(
            obtenerFoliosParaImpresion(),
            (buscadorImpresion?.value || "").trim()
          ).length / PAGE_SIZE_IMPRESION
        );
        if (paginaImpresionActual >= totalPaginas - 1) return;
        paginaImpresionActual++;
        renderizarListaImpresion(obtenerFoliosParaImpresion());
      });

      const chkMarcarTodosVisibles = $("chkMarcarTodosVisibles");
      if (chkMarcarTodosVisibles) {
        chkMarcarTodosVisibles.addEventListener("change", () => {
          const foliosDisponibles = obtenerFoliosParaImpresion();
          const { foliosPagina } = obtenerPaginaFoliosImpresion(foliosDisponibles);
          const idsVisibles = foliosPagina.map((f) => String(f.id));

          if (chkMarcarTodosVisibles.checked) {
            idsVisibles.forEach((id) => {
              if (!foliosMarcadosParaImprimir.includes(id)) foliosMarcadosParaImprimir.push(id);
            });
          } else {
            foliosMarcadosParaImprimir = foliosMarcadosParaImprimir.filter((id) => !idsVisibles.includes(id));
          }

          renderizarListaFoliosImpresos(foliosDisponibles);
          renderizarListaImpresion(foliosDisponibles);
          renderizarVistaPreviaHojaImpresion(foliosDisponibles);
        });
      }

      function obtenerFolioActualFormulario() {
        return {
          id: inpId.value || 'actual_form',
          numero_folio: inpNumero.value.trim() || '--',
          numero_bloque: inpBloque.value.trim(),
          periodo: inpPeriodo.value.trim() || '----',
          nombres: obtenerUsuarios().map(u => u.nombre)
        };
      }

      function obtenerFoliosParaImpresion() {
        const folios = [...todosLosFoliosCache];
        if (!inpId.value && !inpNumero.value.trim()) return folios;

        const folioActual = obtenerFolioActualFormulario();
        const indiceActual = folios.findIndex((folio) => String(folio.id) === String(folioActual.id));
        if (indiceActual >= 0) folios[indiceActual] = folioActual;
        else folios.unshift(folioActual);
        return folios;
      }

      function renderizarVistaPreviaHojaImpresion(foliosDisponibles) {
        const hoja = $("hojaImpresionImprimible");
        hoja.innerHTML = "";

        const seleccionados = foliosDisponibles.filter(f => foliosMarcadosParaImprimir.includes(String(f.id)));

        const foliosParaVista = seleccionados.length ? seleccionados : [
          foliosDisponibles.find(f => String(f.id) === String(inpId.value || 'actual_form')) || obtenerFolioActualFormulario()
        ];

        for (let inicio = 0; inicio < foliosParaVista.length; inicio += 2) {
          const pagina = document.createElement("div");
          pagina.className = "hoja-impresion-pagina";
          foliosParaVista.slice(inicio, inicio + 2).forEach(f => {
            pagina.innerHTML += obtenerHtmlCaratula(f);
          });
          hoja.appendChild(pagina);
        }
      }

      function ejecutarImpresionDosFolios() {
        const idsSeleccionados = [...new Set(foliosMarcadosParaImprimir.map(String))];

        // Si no hay nada marcado en la lista, se imprime la carátula actual del
        // formulario (la que se ve en la vista previa), aunque esté vacía o sin guardar.
        // Solo se registra como "Impreso" lo que corresponde a un folio real guardado.
        idsPendientesDeConfirmarImpresion = idsSeleccionados;
        window.print();

        // Ya no usamos "afterprint" para preguntar automáticamente, porque ese evento
        // se dispara igual si el usuario imprime o si cancela el diálogo del sistema.
        // En su lugar, mostramos un bloque de confirmación manual que el propio
        // usuario decide cuándo cerrar.
        const wrap = $("confirmarImpresionWrap");
        if (wrap) wrap.style.display = "block";
      }

      function confirmarImpresionOk() {
        const ids = idsPendientesDeConfirmarImpresion;
        idsPendientesDeConfirmarImpresion = [];
        const wrap = $("confirmarImpresionWrap");
        if (wrap) wrap.style.display = "none";
        if (!ids.length) return; // No había folios guardados marcados (era solo la carátula actual)

        registrarFoliosImpresos(ids);
        agregarHistorial("🖨️ Impresión", `Folios registrados como impresos: ${ids.length}`);
      }

      function confirmarImpresionCancelar() {
        idsPendientesDeConfirmarImpresion = [];
        const wrap = $("confirmarImpresionWrap");
        if (wrap) wrap.style.display = "none";
      }

      $("btnLimpiar").onclick = () => { if (confirm("¿Limpiar todo el formulario?")) limpiarFormulario(); };

      contNombres.addEventListener("input", (e) => {
        if (e.target.classList.contains("inpNotaPago")) actualizarTotalNotaPago(e.target.closest(".nombre-row"));
        actualizarPreview();
        if (e.target.classList.contains("inpNombreItem")) {
          // Se ejecuta con cada tecla, por lo que el rojo aparece sin guardar.
          actualizarMarcadoDuplicadosFormulario();
          actualizarDuplicadosEnTiempoReal();
        }
      });
      inpNumero.addEventListener("input", actualizarPreview);
      inpPeriodo.addEventListener("input", actualizarPreview);

      /* OPERACIONES CRUD */
      $("btnGuardar").onclick = async () => {
        const usuarios = obtenerUsuarios();
        const payload = {
          owner_id: usuarioAutenticado.id,
          numero_folio: inpNumero.value.trim(),
          numero_bloque: inpBloque.value.trim() || null,
          periodo: inpPeriodo.value.trim(),
          nombres: usuarios.map(u => u.nombre),
          notas_pago: usuarios.map(u => u.nota || null),
          cargos: usuarios.map(u => u.cargo || null),
          observaciones: inpObservaciones.value.trim() || null,
          actualizado_en: new Date().toISOString(),
        };

        if (!payload.numero_folio || !payload.periodo || payload.nombres.length === 0) {
          alert("Completa número de folio, periodo y al menos un nombre."); return;
        }

        for (const u of usuarios) {
          const r = validarRangoNotaPago(u.nota);
          if (!r.valido) { alert(`Revisa la nota de página de "${u.nombre}": ${r.mensaje}`); notasPagoVisibles = true; actualizarVisibilidadNotas(); return; }
        }

        let error, data, accion = inpId.value ? "✏️ Edición" : "➕ Creación";
        const bloqueDetalle = payload.numero_bloque ? ` [Bloque ${payload.numero_bloque}]` : "";
        const detalle = `Folio N° ${payload.numero_folio}${bloqueDetalle} - ${payload.periodo}`;

        if (inpId.value) {
          ({ error } = await clienteDB.from("folios_cv").update(payload)
            .eq("id", inpId.value).eq("owner_id", usuarioAutenticado.id));
        } else {
          ({ data, error } = await clienteDB.from("folios_cv").insert(payload).select().single());
        }

        if (error) { alert("Error al guardar: " + error.message); return; }

        const idGuardado = inpId.value || data?.id || null;
  if (idGuardado) actualizarFoliosCache({ ...payload, ...(data || {}), id: idGuardado });

        // Guardar es normal: NO abrimos ninguna ventana de duplicados aquí.
        // Los nombres duplicados quedan marcados en rojo en "Folios guardados".
        // Al tocar el nombre rojo se muestran sus ubicaciones.
        alert(inpId.value ? "Folio actualizado correctamente." : "Folio guardado correctamente.");
        agregarHistorial(accion, detalle);

        if (!inpId.value && data) { inpId.value = data.id; modoEdicion.classList.add("mostrar"); }
        modoMostrarFilas = "ultimos";
        $("selectMostrarFilas").value = "ultimos";
        actualizarVisibilidadFilas();
        mostrarUltimosNombres(true);
        await recargarUltimaPagina();
      };

      function editarFolio(folio) {
        inpId.value = folio.id; 
        cargarConfiguracionParaFolio(folio.id);
        inpNumero.value = folio.numero_folio;
        inpBloque.value = folio.numero_bloque || "";
        inpPeriodo.value = folio.periodo;
        inpObservaciones.value = folio.observaciones || ""; 
        contNombres.innerHTML = "";

        const notas = folio.notas_pago || [], cargos = folio.cargos || [];
        (folio.nombres || [""]).forEach((n, i) => {
          if (esSeparador(n)) {
            const separador = obtenerDatosSeparador(n);
            crearFilaSeparador(separador.texto);
          }
          else crearFilaNombre(n, notas[i] || "", cargos[i] || "");
        });

        modoEdicion.classList.add("mostrar"); 
        notasPagoVisibles = false; 
        modoMostrarFilas = "primeros";
        $("selectMostrarFilas").value = "primeros";
        actualizarVisibilidadNotas(); 
        actualizarPreview(); 
        actualizarMarcadoDuplicadosFormulario(); 
        actualizarVisibilidadFilas();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      function duplicarFolio(folio) {
        inpId.value = ""; 
        cargarConfiguracionParaFolio("actual_form");
        inpNumero.value = folio.numero_folio + " (copia)";
        inpBloque.value = folio.numero_bloque || bloqueActual;
        inpPeriodo.value = folio.periodo;
        inpObservaciones.value = folio.observaciones || ""; 
        contNombres.innerHTML = "";

        const notas = folio.notas_pago || [], cargos = folio.cargos || [];
        (folio.nombres || [""]).forEach((n, i) => crearFilaNombre(n, notas[i] || "", cargos[i] || ""));

        modoEdicion.classList.remove("mostrar"); 
        notasPagoVisibles = false; 
        modoMostrarFilas = "ultimos";
        $("selectMostrarFilas").value = "ultimos";
        actualizarVisibilidadNotas(); 
        actualizarPreview(); 
        actualizarVisibilidadFilas();
        mostrarUltimosNombres(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        alert("Folio duplicado. Puedes modificarlo y guardarlo como nuevo.");
      }

      async function eliminarFolio(id, numero, periodo) {
        if (!confirm(`¿Eliminar el folio N° ${numero} - ${periodo}?`)) return;
        const { error } = await clienteDB.from("folios_cv").delete()
          .eq("id", id).eq("owner_id", usuarioAutenticado.id);
        if (error) { alert("Error al eliminar: " + error.message); return; }
        actualizarFoliosCache({ id }, true);
        agregarHistorial("🗑️ Eliminación", `Folio N° ${numero} - ${periodo}`);
        if (inpId.value === id) limpiarFormulario();
        await recargarUltimaPagina();
      }

      /* BUSCADOR Y PAGINACIÓN LISTENERS */
      function debounce(fn, delay = 300) {
        let timer;
        return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
      }

      buscador.addEventListener("input", debounce(async function () {
        filtroActivo = this.value.trim(); paginaActual = 0;
        totalRegistros = await obtenerTotalRegistros(filtroActivo);
        totalPaginas = Math.ceil(totalRegistros / PAGE_SIZE) || 1;
        await cargarPagina(0);
      }, 300));

      $("btnOrdenarBloque").addEventListener("click", async () => {
        ordenarListaPorBloque = !ordenarListaPorBloque;
        const btn = $("btnOrdenarBloque");
        btn.classList.toggle("activo", ordenarListaPorBloque);
        btn.textContent = ordenarListaPorBloque ? "↕ Ordenar por reciente" : "↕ Ordenar por bloque";
        paginaActual = 0;
        await cargarPagina(0);
      });

      $("btnPagPrimera").addEventListener("click", () => { if (paginaActual > 0) cargarPagina(0); });
      $("btnPagAnterior").addEventListener("click", () => { if (paginaActual > 0) cargarPagina(paginaActual - 1); });
      $("btnPagSiguiente").addEventListener("click", () => { if (paginaActual < totalPaginas - 1) cargarPagina(paginaActual + 1); });
      $("btnPagUltima").addEventListener("click", () => { if (paginaActual < totalPaginas - 1) cargarPagina(totalPaginas - 1); });
      
      $("selectPaginaDirecta").addEventListener("change", function () {
        const pag = parseInt(this.value, 10);
        if (!isNaN(pag)) cargarPagina(pag);
      });

      listaFolios.addEventListener('toggle', (e) => {
        if (e.target.tagName === 'DETAILS') {
          const id = String(e.target.dataset.folioId || "");
          if (id) { if (e.target.open) foliosAbiertos.add(id); else foliosAbiertos.delete(id); }
        }
      }, true);

      /* EXPORTACIÓN A EXCEL */
      $("btnExportarExcel").addEventListener("click", async () => {
        const { data: foliosCache, error } = await cargarFoliosCache();
        const data = foliosCache ? [...foliosCache] : null;
        if (error || !data || !data.length) { alert(error ? error.message : "No hay folios para exportar."); return; }

        data.sort((a, b) => {
          const porBloque = compararNumericoNatural(a.numero_bloque, b.numero_bloque);
          if (porBloque !== 0) return porBloque;
          return compararNumericoNatural(a.numero_folio, b.numero_folio);
        });

        $("listaCheckboxFolios").innerHTML = data.map((f) => {
          const bloqTexto = f.numero_bloque ? ` [Bloque ${escaparHtml(f.numero_bloque)}]` : "";
          return `<label style="display:flex;align-items:center;gap:6px;padding:4px 0;font-weight:normal;">
            <input type="checkbox" class="chkFolioExportar" value="${f.id}" style="width:auto;"> 📁 Folio N° ${escaparHtml(f.numero_folio)}${bloqTexto} - ${escaparHtml(f.periodo)}
          </label>`;
        }).join("");

        $("chkExportarTodos").checked = true;
        $("listaCheckboxFolios").style.display = "none";
        window.foliosDisponiblesParaExportar = data;
        $("modalExportarExcel").classList.add("mostrar");
      });

      $("chkExportarTodos").addEventListener("change", function () { $("listaCheckboxFolios").style.display = this.checked ? "none" : "block"; });

      $("btnConfirmarExportarExcel").addEventListener("click", async () => {
        const data = window.foliosDisponiblesParaExportar || [];
        const exportarTodos = $("chkExportarTodos").checked;
        const folios = exportarTodos ? data : data.filter((f) => Array.from(document.querySelectorAll(".chkFolioExportar:checked")).map(c => c.value).includes(String(f.id)));

        if (!folios.length) { alert("Selecciona al menos un folio para exportar."); return; }
        cerrarModal("modalExportarExcel");
        await exportarFoliosAExcel(folios, exportarTodos);
      });

      async function exportarFoliosAExcel(data, exportarTodos) {
        try {
          const { data: config } = await clienteDB.from("config_caratula_por_usuario")
            .select("texto_subgerencia, texto_cv_label")
            .eq("owner_id", usuarioAutenticado.id)
            .maybeSingle();
          const cargoSubgerencia = config ? (config.texto_subgerencia || "").replace(/\n/g, " ") : "";
          const tipoDocumento = config ? config.texto_cv_label : "";

          const workbook = new ExcelJS.Workbook();
          const hoja = workbook.addWorksheet("Folios");
          hoja.columns = [
            { width: 7 }, { width: 10 }, { width: 11 }, { width: 14 }, { width: 28 },
            { width: 20 }, { width: 26 }, { width: 27 }, { width: 20 }, { width: 16 }
          ];

          hoja.mergeCells("A1:J1");
          const f1 = hoja.getRow(1); f1.getCell(1).value = "MUNICIPALIDAD DISTRITAL DE CHINCHAO"; f1.height = 28;
          f1.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
          f1.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
          f1.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E7D32" } };

          hoja.mergeCells("A2:J2");
          const f2 = hoja.getRow(2); f2.getCell(1).value = cargoSubgerencia; f2.getCell(1).font = { bold: true, size: 11 };
          f2.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
          f2.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9EAD3" } };

          hoja.mergeCells("A3:J3");
          hoja.getRow(3).getCell(1).value = `Exportado: ${new Date().toLocaleString()}`;
          hoja.getRow(3).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } };
          hoja.getRow(3).getCell(1).alignment = { horizontal: "center" };

          const fHeader = hoja.getRow(5);
          ["N°", "N° Bloque", "N° Folio", "Periodo", "Ubicación del documento", "Tipo de documento", "Apellidos y Nombres", "Cargo", "Nota de pagina(s)", "Total páginas"].forEach((t, i) => {
            const c = fHeader.getCell(i + 1); c.value = t; c.font = { bold: true, size: 12 };
            c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4C542" } };
            c.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
          });
          fHeader.height = 34;

          let filaExcel = 6;
          let numeroCorrelativo = 1;
          data.forEach((f) => {
            (f.nombres || []).forEach((nombre, idx) => {
              if (esSeparador(nombre) || !nombre || !String(nombre).trim()) return;
              const row = hoja.getRow(filaExcel++);
              const nota = (f.notas_pago || [])[idx] ?? "", cargoItem = (f.cargos || [])[idx] ?? "";
              const resNota = validarRangoNotaPago(nota);
              const tipoDocumentoFolio = obtenerConfiguracionParaFolio(f.id).textoCvLabel ?? tipoDocumento;
              const valores = [numeroCorrelativo++, f.numero_bloque || "", f.numero_folio, f.periodo, cargoSubgerencia, tipoDocumentoFolio, limpiarNombreParaExportar(nombre), cargoItem, nota, resNota.total || ""];

              valores.forEach((v, i) => {
                const cel = row.getCell(i + 1); cel.value = v;
                cel.alignment = { vertical: "middle", horizontal: (i === 0 || i === 1 || i === 2 || i === 3 || i === 8 || i === 9) ? "center" : "left", wrapText: true };
                cel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: filaExcel % 2 === 0 ? "FFD9E7F5" : "FFFFFFFF" } };
                cel.border = { top: { style: "thin", color: { argb: "FFCCCCCC" } }, bottom: { style: "thin", color: { argb: "FFCCCCCC" } }, left: { style: "thin", color: { argb: "FFCCCCCC" } }, right: { style: "thin", color: { argb: "FFCCCCCC" } } };
              });
              const cargoLineas = Math.max(1, Math.ceil(String(cargoItem || "").length / 48));
              const nombreLineas = Math.max(1, Math.ceil(String(nombre || "").length / 52));
              row.height = Math.max(32, Math.min(52, 18 * Math.max(cargoLineas, nombreLineas)));
            });
          });

          hoja.pageSetup = {
            orientation: "landscape",
            paperSize: 9,
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            printTitlesRow: "1:5",
            horizontalCentered: true,
            margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }
          };

          const buffer = await workbook.xlsx.writeBuffer();
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([buffer], { type: "application/octet-stream" }));
          a.download = exportarTodos ? `Folios_Todos_${new Date().toISOString().slice(0, 10)}.xlsx` : `Folio_${data[0].numero_folio}.xlsx`;
          a.click();
        } catch (err) { alert("Error al exportar: " + err.message); }
      }

      /* CONFIGURACIÓN Y MODAL DE PLANTILLA */
      $("btnConfig").onclick = async () => {
        if (claveFolioConfigPendiente && claveFolioConfigPendiente !== obtenerClaveFolioActual()) {
          alert("Aplica o descarta los cambios pendientes antes de editar otro folio.");
          return;
        }
        estadoConfigAntesModal = {
          configVisual: { ...configVisual },
          configuracionGlobal: { ...configuracionGlobal },
          configuracionesPorFolio: { ...configuracionesPorFolio },
          configVisualPendiente: { ...configVisualPendiente },
          claveFolioConfigPendiente
        };
        cargarConfiguracionParaFolio(obtenerClaveFolioActual());
        configVisualModalInicio = { ...configVisual };
        if (claveFolioConfigPendiente === obtenerClaveFolioActual()) {
          configVisual = { ...configVisual, ...configVisualPendiente };
          aplicarConfigVisual(false);
        }
        const { data } = await clienteDB.from("config_caratula_por_usuario")
          .select("texto_subgerencia, texto_cv_label")
          .eq("owner_id", usuarioAutenticado.id)
          .maybeSingle();
        if (data) {
          $("cfgSubgerencia").value = configVisual.textoSubgerencia ?? data.texto_subgerencia ?? "";
          $("cfgCvLabel").value = configVisual.textoCvLabel ?? data.texto_cv_label ?? "Curriculum vitae";
        } else {
          $("cfgSubgerencia").value = configVisual.textoSubgerencia ?? "";
          $("cfgCvLabel").value = configVisual.textoCvLabel ?? "Curriculum vitae";
        }
        $("cfgRubroActual").value = cargoActual;
        $("cfgFuenteSubgerencia").value = configVisual.fuenteSubgerencia;
        $("cfgFuenteCv").value = configVisual.fuenteCv;
        $("valorTamanoTitulo").value = configVisual.tamanoTitulo;
        $("valorEspacioTitulo").value = configVisual.espacioTitulo;
        $("valorTamanoSubgerencia").value = configVisual.tamanoSubgerencia;
        $("valorTamanoCv").value = configVisual.tamanoCv;
        $("valorEspacioGerencia").value = configVisual.espacioGerencia;
        $("cfgPosicionSubgerencia").value = configVisual.posicionSubgerencia || "debajo-escudo";
        $("valorEspacioCurriculum").value = configVisual.espacioCurriculum;
        $("valorTamanoEscudo").value = configVisual.tamanoEscudo;
        $("cfgFuenteNombres").value = configVisual.fuenteNombres || "Arial";
        $("valorTamanoNombres").value = Number(configVisual.tamanoNombres) || 15;
        $("valorEspacioNombres").value = configVisual.espacioNombres;
        $("cfgFuenteSeparador").value = configVisual.fuenteSeparador || "Arial";
        $("valorTamanoSeparador").value = configVisual.tamanoSeparador || 18;
        $("valorEspacioSeparador").value = configVisual.espacioSeparador || 0;
        $("valorTamanoFolio").value = configVisual.tamanoFolio;
        $("valorPosicionFolio").value = configVisual.posicionFolio;
        $("valorTamanoPeriodo").value = configVisual.tamanoPeriodo;
        $("valorPosicionPeriodo").value = configVisual.posicionPeriodo;
        $("cfgOrdenFolioPeriodo").value = configVisual.ordenFolioPeriodo;
        iniciarHistorialConfig();
        actualizarVistaPreviaConfiguracion();
        $("modalConfig").classList.add("mostrar");
        ajustarEscalaInterfaz();
      };

      $("btnCerrarConfig").onclick = () => cerrarModal("modalConfig");
      $("btnDeshacerConfig").onclick = deshacerConfigVisual;
      $("btnRehacerConfig").onclick = rehacerConfigVisual;
      $("btnReiniciarCambiosConfig").onclick = reiniciarCambiosConfigVisual;

      $("modalConfig").addEventListener("click", (evento) => {
        const control = evento.target.closest("button, select, input, textarea");
        if (!control || ["btnDeshacerConfig", "btnRehacerConfig", "btnReiniciarCambiosConfig", "btnCerrarConfig", "btnGuardarConfig"].includes(control.id)) return;
        setTimeout(registrarCambioHistorialConfig, 0);
      }, true);

      $("modalConfig").addEventListener("change", (evento) => {
        const control = evento.target.closest("select, input, textarea");
        if (!control) return;
        setTimeout(registrarCambioHistorialConfig, 0);
      }, true);

      $("modalConfig").addEventListener("input", (evento) => {
        const campo = evento.target;
        if (campo.id !== "cfgSubgerencia" && campo.id !== "cfgCvLabel") return;
        setTimeout(registrarCambioHistorialConfig, 0);
      }, true);

      /* Acordeón: expandir / contraer todas las secciones de golpe */
      $("btnAlternarTodasConfig").onclick = () => {
        const secciones = [...document.querySelectorAll("#modalConfig details.config-acordeon")];
        const abrirTodas = secciones.some((s) => !s.open);
        secciones.forEach((s) => { s.open = abrirTodas; });
        document.querySelectorAll("#modalConfig details.opcion").forEach((o) => { o.open = false; });
      };
      const camposNumericosConfig = {
        valorTamanoTitulo: { campo: "tamanoTitulo", min: 12, max: 40 },
        valorEspacioTitulo: { campo: "espacioTitulo", min: 0, max: 60 },
        valorTamanoSubgerencia: { campo: "tamanoSubgerencia", min: 10, max: 50 },
        valorEspacioGerencia: { campo: "espacioGerencia", min: 0, max: 80 },
        valorTamanoCv: { campo: "tamanoCv", min: 10, max: 60 },
        valorEspacioCurriculum: { campo: "espacioCurriculum", min: 0, max: 80 },
        valorTamanoEscudo: { campo: "tamanoEscudo", min: 60, max: 220 },
        valorTamanoSeparador: { campo: "tamanoSeparador", min: 10, max: 60, grupo: "separador" },
        valorEspacioSeparador: { campo: "espacioSeparador", min: 0, max: 80, grupo: "separador" },
        valorTamanoNombres: { campo: "tamanoNombres", min: 8, max: 40 },
        valorEspacioNombres: { campo: "espacioNombres", min: 0, max: 80 },
        valorTamanoFolio: { campo: "tamanoFolio", min: 14, max: 70 },
        valorPosicionFolio: { campo: "posicionFolio", min: -80, max: 80 },
        valorTamanoPeriodo: { campo: "tamanoPeriodo", min: 8, max: 50 },
        valorPosicionPeriodo: { campo: "posicionPeriodo", min: -80, max: 80 }
      };
      Object.entries(camposNumericosConfig).forEach(([id, definicion]) => {
        $(id).addEventListener("change", (evento) => {
          if (!evento.target.value.trim()) {
            evento.target.value = configVisual[definicion.campo];
            return;
          }
          const valor = Number(evento.target.value);
          if (!Number.isFinite(valor)) {
            evento.target.value = configVisual[definicion.campo];
            return;
          }
          configVisual[definicion.campo] = Math.min(definicion.max, Math.max(definicion.min, Math.round(valor)));
          aplicarConfigVisual(true, definicion.grupo || "visual");
        });
      });
      $("btnMenosTitulo").onclick = () => { if (configVisual.tamanoTitulo > 12) { configVisual.tamanoTitulo--; aplicarConfigVisual(); } };
      $("btnMasTitulo").onclick = () => { if (configVisual.tamanoTitulo < 40) { configVisual.tamanoTitulo++; aplicarConfigVisual(); } };
      $("btnMenosEspacioTitulo").onclick = () => { if (configVisual.espacioTitulo > 0) { configVisual.espacioTitulo -= 2; aplicarConfigVisual(); } };
      $("btnMasEspacioTitulo").onclick = () => { if (configVisual.espacioTitulo < 60) { configVisual.espacioTitulo += 2; aplicarConfigVisual(); } };
      $("btnMenosSubgerencia").onclick = () => { if (configVisual.tamanoSubgerencia > 10) { configVisual.tamanoSubgerencia--; aplicarConfigVisual(); } };
      $("btnMasSubgerencia").onclick = () => { if (configVisual.tamanoSubgerencia < 50) { configVisual.tamanoSubgerencia++; aplicarConfigVisual(); } };
      $("btnMenosCv").onclick = () => { if (configVisual.tamanoCv > 10) { configVisual.tamanoCv--; aplicarConfigVisual(); } };
      $("btnMasCv").onclick = () => { if (configVisual.tamanoCv < 60) { configVisual.tamanoCv++; aplicarConfigVisual(); } };
      $("btnMenosEspacioGerencia").onclick = () => { if (configVisual.espacioGerencia > 0) { configVisual.espacioGerencia -= 2; aplicarConfigVisual(); } };
      $("btnMasEspacioGerencia").onclick = () => { if (configVisual.espacioGerencia < 80) { configVisual.espacioGerencia += 2; aplicarConfigVisual(); } };
      $("cfgPosicionSubgerencia").onchange = (e) => {
        configVisual.posicionSubgerencia = e.target.value === "encima-escudo" ? "encima-escudo" : "debajo-escudo";
        aplicarConfigVisual();
      };
      $("cfgLineasContorno").onchange = (e) => {
        configVisual.lineasContorno = Math.min(2, Math.max(0, Number.parseInt(e.target.value, 10) || 0));
        aplicarConfigVisual();
      };
      $("cfgGrosorBordePrincipal").onchange = (e) => {
        configVisual.grosorBordePrincipal = Number.parseInt(e.target.value, 10);
        aplicarConfigVisual();
      };
      $("cfgColorBordePrincipal").oninput = (e) => {
        configVisual.colorBordePrincipal = e.target.value;
        aplicarConfigVisual(false);
      };
      $("cfgColorBordePrincipal").onchange = () => aplicarConfigVisual();
      $("cfgGrosorLineaContorno1").onchange = (e) => {
        configVisual.grosorLineaContorno1 = Number.parseInt(e.target.value, 10);
        aplicarConfigVisual();
      };
      $("cfgGrosorLineaContorno2").onchange = (e) => {
        configVisual.grosorLineaContorno2 = Number.parseInt(e.target.value, 10);
        aplicarConfigVisual();
      };
      $("cfgColorLineaContorno1").oninput = (e) => {
        configVisual.colorLineaContorno1 = e.target.value;
        aplicarConfigVisual(false);
      };
      $("cfgColorLineaContorno1").onchange = () => aplicarConfigVisual();
      $("cfgColorLineaContorno2").oninput = (e) => {
        configVisual.colorLineaContorno2 = e.target.value;
        aplicarConfigVisual(false);
      };
      $("cfgColorLineaContorno2").onchange = () => aplicarConfigVisual();
      $("btnMenosEspacioCurriculum").onclick = () => { if (configVisual.espacioCurriculum > 0) { configVisual.espacioCurriculum -= 2; aplicarConfigVisual(); } };
      $("btnMasEspacioCurriculum").onclick = () => { if (configVisual.espacioCurriculum < 80) { configVisual.espacioCurriculum += 2; aplicarConfigVisual(); } };
      $("btnMenosEscudo").onclick = () => { if (configVisual.tamanoEscudo > 60) { configVisual.tamanoEscudo -= 5; aplicarConfigVisual(); } };
      $("btnMasEscudo").onclick = () => { if (configVisual.tamanoEscudo < 220) { configVisual.tamanoEscudo += 5; aplicarConfigVisual(); } };
      $("btnMenosEspacioNombres").onclick = () => { if (configVisual.espacioNombres > 0) { configVisual.espacioNombres -= 2; aplicarConfigVisual(); } };
      $("btnMasEspacioNombres").onclick = () => { if (configVisual.espacioNombres < 80) { configVisual.espacioNombres += 2; aplicarConfigVisual(); } };
      $("btnMenosTamanoNombres").onclick = () => { if (configVisual.tamanoNombres > 8) { configVisual.tamanoNombres--; aplicarConfigVisual(); } };
      $("btnMasTamanoNombres").onclick = () => { if (configVisual.tamanoNombres < 40) { configVisual.tamanoNombres++; aplicarConfigVisual(); } };

      // CONFIGURACIÓN GLOBAL DEL SEPARADOR
      $("cfgFuenteSeparador").onchange = (e) => {
        configVisual.fuenteSeparador = e.target.value;
        aplicarConfigVisual(true, "separador");
      };
      $("btnMenosSeparador").onclick = () => {
        if (configVisual.tamanoSeparador > 10) { configVisual.tamanoSeparador--; aplicarConfigVisual(true, "separador"); }
      };
      $("btnMasSeparador").onclick = () => {
        if (configVisual.tamanoSeparador < 60) { configVisual.tamanoSeparador++; aplicarConfigVisual(true, "separador"); }
      };
      $("btnMenosEspacioSeparador").onclick = () => {
        if (configVisual.espacioSeparador > 0) { configVisual.espacioSeparador -= 2; aplicarConfigVisual(true, "separador"); }
      };
      $("btnMasEspacioSeparador").onclick = () => {
        if (configVisual.espacioSeparador < 80) { configVisual.espacioSeparador += 2; aplicarConfigVisual(true, "separador"); }
      };

      // Controles independientes del folio y del año/periodo.
      $("btnMenosFolio").onclick = () => { if (configVisual.tamanoFolio > 14) { configVisual.tamanoFolio--; aplicarConfigVisual(); } };
      $("btnMasFolio").onclick = () => { if (configVisual.tamanoFolio < 70) { configVisual.tamanoFolio++; aplicarConfigVisual(); } };
      $("btnSubirFolio").onclick = () => { if (configVisual.posicionFolio > -80) { configVisual.posicionFolio -= 2; aplicarConfigVisual(); } };
      $("btnBajarFolio").onclick = () => { if (configVisual.posicionFolio < 80) { configVisual.posicionFolio += 2; aplicarConfigVisual(); } };

      $("btnMenosPeriodo").onclick = () => { if (configVisual.tamanoPeriodo > 8) { configVisual.tamanoPeriodo--; aplicarConfigVisual(); } };
      $("btnMasPeriodo").onclick = () => { if (configVisual.tamanoPeriodo < 50) { configVisual.tamanoPeriodo++; aplicarConfigVisual(); } };
      $("btnSubirPeriodo").onclick = () => { if (configVisual.posicionPeriodo > -80) { configVisual.posicionPeriodo -= 2; aplicarConfigVisual(); } };
      $("btnBajarPeriodo").onclick = () => { if (configVisual.posicionPeriodo < 80) { configVisual.posicionPeriodo += 2; aplicarConfigVisual(); } };

      $("cfgOrdenFolioPeriodo").onchange = (e) => {
        configVisual.ordenFolioPeriodo = e.target.value === "folio-arriba" ? "folio-arriba" : "periodo-arriba";
        aplicarConfigVisual();
      };

      $("cfgFuenteSubgerencia").onchange = (e) => { configVisual.fuenteSubgerencia = e.target.value; aplicarConfigVisual(); };
      $("cfgFuenteNombres").onchange = (e) => { configVisual.fuenteNombres = e.target.value; aplicarConfigVisual(); };
      $("cfgAlineacionNombres").onchange = (e) => {
        configVisual.alineacionNombres = e.target.value === "centrado" ? "centrado" : "izquierda";
        aplicarConfigVisual();
      };
      $("cfgFuenteCv").onchange = (e) => { configVisual.fuenteCv = e.target.value; aplicarConfigVisual(); };
      $("cfgSubgerencia").oninput = actualizarVistaPreviaConfiguracion;
      $("cfgCvLabel").oninput = actualizarVistaPreviaConfiguracion;

      $("btnGuardarConfig").onclick = async () => {
        const sub = $("cfgSubgerencia").value.trim(), cv = $("cfgCvLabel").value.trim();
        configVisual.textoSubgerencia = sub;
        configVisual.textoCvLabel = cv;
        
        cargoActual = $("cfgRubroActual").value.trim();
        // El cargo se guarda junto al resto de la configuración visual (en Supabase).
        clienteDB.from("config_visual_por_usuario").upsert({
          owner_id: usuarioAutenticado.id,
          cargo: cargoActual
        })
          .then(({ error }) => { if (error) console.warn("No se pudo guardar el cargo:", error.message); });

        await guardarConfigVisual();
        if (Object.keys(configVisualPendiente).length) {
          const aplicado = await aplicarConfiguracionVisualPendiente();
          if (!aplicado) return;
        }
        configVisualModalInicio = null;
        estadoConfigAntesModal = null;
        cerrarModal("modalConfig");
      };

      /* TECLAS ESCAPE PARA MODALES */
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") ["modalDuplicados", "modalExportarExcel", "modalConfig", "modalImpresion"].forEach(cerrarModal);
      });

      /* INICIALIZACIÓN GLOBAL */
      (async function init() {
        try {
          const { data: { session }, error } = await clienteDB.auth.getSession();
          if (error) throw error;
          if (!session) {
            mostrarPantallaLogin(true);
            return;
          }
          usuarioAutenticado = session.user;
          const { error: errorPropietario } = await clienteDB.from("folios_cv").select("owner_id").limit(1);
          if (errorPropietario) {
            mostrarPantallaLogin(true);
            mostrarMensajeLogin(errorPropietario.code === "42703"
              ? "Falta ejecutar la migración de Supabase para separar los folios por cuenta."
              : "No se pudo verificar el acceso a los folios. Revisa la configuración de Supabase.");
            return;
          }
          const [errorConfigVisual, errorConfigCaratula] = await Promise.all([
            clienteDB.from("config_visual_por_usuario").select("owner_id")
              .eq("owner_id", session.user.id).maybeSingle(),
            clienteDB.from("config_caratula_por_usuario").select("owner_id")
              .eq("owner_id", session.user.id).maybeSingle()
          ]);
          if (errorConfigVisual.error || errorConfigCaratula.error) {
            const errorConfig = errorConfigVisual.error || errorConfigCaratula.error;
            mostrarPantallaLogin(true);
            mostrarMensajeLogin(`Falta preparar la configuración privada por cuenta en Supabase. Ejecuta la migración supabase_configuracion_por_usuario.sql. Detalle: ${errorConfig.message}`);
            return;
          }
          $("usuarioSesion").textContent = session.user.email || "Sesión iniciada";
          mostrarPantallaLogin(false);
        } catch (error) {
          mostrarPantallaLogin(true);
          mostrarMensajeLogin("No se pudo verificar la sesión. Revisa tu conexión y recarga.");
          return;
        }

        inpBloque.value = bloqueActual;
        crearFilaNombre();
        await cargarConfigVisual();
        aplicarConfigVisual(false);
        actualizarPreview();

        const { data } = await clienteDB.from("config_caratula_por_usuario")
          .select("texto_subgerencia, texto_cv_label")
          .eq("owner_id", usuarioAutenticado.id)
          .maybeSingle();
        if (data) {
          configuracionGlobal.textoSubgerencia = data.texto_subgerencia || "";
          configuracionGlobal.textoCvLabel = data.texto_cv_label || "Curriculum vitae";
          configVisual = obtenerConfiguracionParaFolio(obtenerClaveFolioActual());
          const textoSubgerencia = configVisual.textoSubgerencia || "";
          txtSubgerencia.innerHTML = escaparHtml(textoSubgerencia).replace(/\n/g, "<br>");
          txtSubgerencia.hidden = !textoSubgerencia.trim();
          txtCvLabel.textContent = configVisual.textoCvLabel ?? configuracionGlobal.textoCvLabel;
          txtCvLabel.hidden = !txtCvLabel.textContent.trim();
        }

        // Configuración privada de esta cuenta: cargo, folios impresos e historial.
        try {
          const { data: cfg } = await clienteDB.from("config_visual_por_usuario")
            .select("cargo, impresos, historial").eq("owner_id", usuarioAutenticado.id).maybeSingle();
          if (cfg) {
            if (cfg.cargo) { cargoActual = cfg.cargo; $("cfgRubroActual").value = cfg.cargo; }
            if (Array.isArray(cfg.impresos)) {
              foliosImpresos = cfg.impresos.map(String);
              localStorage.setItem(claveLocalPorUsuario(KEY_FOLIOS_IMPRESOS), JSON.stringify(foliosImpresos));
            }
            if (Array.isArray(cfg.historial) && cfg.historial.length) {
              localStorage.setItem(claveLocalPorUsuario("historialFolios"), JSON.stringify(cfg.historial));
            }
          }
        } catch (e) {
          console.warn("Sin conexión para la configuración compartida:", e);
        }

        renderizarHistorial();
        const listaImpresosActual = cargarFoliosImpresos();
        foliosImpresos = [...new Set([...foliosImpresos, ...listaImpresosActual])];

        filtroActivo = buscador.value.trim().toLowerCase();
        totalRegistros = await obtenerTotalRegistros(filtroActivo);
        totalPaginas = Math.ceil(totalRegistros / PAGE_SIZE) || 1;
        await cargarPagina(0);
      })();

        function ajustarEscalaInterfaz() {
  const ANCHO_BASE = 1500;
  const ESCALA_MIN = 0.9;
  const ESCALA_MAX = 1.15;
  const loginVisible = document.getElementById("pantallaLogin")?.classList.contains("mostrar");
  const escala = loginVisible ? 1 : Math.min(Math.max(window.innerWidth / ANCHO_BASE, ESCALA_MIN), ESCALA_MAX);
  const modalConfig = document.querySelector("#modalConfig .modal-caja");
  document.querySelectorAll(".encabezado, .layout").forEach((el) => {
    el.style.zoom = escala;
  });
  if (modalConfig && document.getElementById("modalConfig").classList.contains("mostrar")) {
    modalConfig.style.zoom = 1;
    if (modalConfig.offsetWidth && modalConfig.offsetHeight) {
      const escalaPorAncho = (window.innerWidth - 32) / modalConfig.offsetWidth;
      const escalaPorAlto = (window.innerHeight - 32) / modalConfig.offsetHeight;
      modalConfig.style.zoom = Math.min(escala * 1.05, escalaPorAncho, escalaPorAlto);
    }
  } else if (modalConfig) {
    modalConfig.style.zoom = "";
  }

  // Modal de impresión: misma escala que la pantalla principal
  const cajaImpresion = document.querySelector("#modalImpresion .modal-impresion-caja");
  if (cajaImpresion) {
    cajaImpresion.style.zoom = escala;
    cajaImpresion.style.maxWidth = "none";
    cajaImpresion.style.width = (window.innerWidth * 0.95 / escala) + "px";
    cajaImpresion.style.height = (window.innerHeight * 0.92 / escala) + "px";
  }
  if (typeof ajustarZoomVistaPreviaImpresion === "function") ajustarZoomVistaPreviaImpresion();
}

        window.addEventListener("resize", ajustarEscalaInterfaz);
        window.addEventListener("orientationchange", ajustarEscalaInterfaz);
        ajustarEscalaInterfaz();
