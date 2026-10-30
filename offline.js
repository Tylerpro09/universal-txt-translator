/* Experiencia sin conexion y ayuda para instalar la aplicacion web.
   Se guardan solamente recursos publicos de la app, nunca archivos privados. */
(() => {
  'use strict';
  const ready = document.querySelector('.header');
  if (!ready) return;

  const style = document.createElement('style');
  style.textContent = `
    .offline-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
      gap:14px;margin:-22px 0 28px;padding:14px 17px;border-radius:14px;
      border:1px solid #294a61;background:linear-gradient(120deg,#102d3e,#16243b)}
    .offline-toolbar strong{display:block;font-size:.93rem;color:#edf7ff}
    .offline-toolbar p{font-size:.8rem;color:#b8c8dc;margin:3px 0 0;max-width:650px;line-height:1.5}
    .offline-toolbar .offline-actions{display:flex;gap:9px;flex-wrap:wrap}
    .offline-toolbar .offline-actions button{font-size:.81rem;padding:9px 13px}
    .offline-toolbar .offline-actions a{color:#9fe5ff;text-decoration:underline;align-self:center;font-size:.79rem}
    .offline-toolbar .offline-state[aria-busy="true"]{color:#ffdda2}
    @media(max-width:610px){.offline-toolbar{margin-top:-15px}.offline-toolbar .offline-actions{width:100%}
      .offline-toolbar .offline-actions button{flex:1 1 135px}}
  `;
  document.head.appendChild(style);

  const toolbar = document.createElement('section');
  toolbar.className = 'offline-toolbar';
  toolbar.setAttribute('aria-label', 'Disponible sin Wi-Fi');
  toolbar.innerHTML = `
    <div>
      <strong>Modo sin Wi-Fi</strong>
      <p id="offlineState" class="offline-state" role="status" aria-live="polite">Comprobando archivos de la aplicación…</p>
    </div>
    <div class="offline-actions">
      <button id="prepareOffline" type="button">Guardar para usar sin Wi-Fi</button>
      <button id="installOfflineApp" type="button" hidden>Instalar aplicación</button>
      <a href="./docs/index.html#sin-wifi">Cómo funciona</a>
    </div>`;
  ready.insertAdjacentElement('afterend', toolbar);
  const state = document.getElementById('offlineState');
  const prepareButton = document.getElementById('prepareOffline');
  const installButton = document.getElementById('installOfflineApp');
  let registration = null, installationPrompt = null;

  const report = (text, busy=false) => {
    state.textContent = text;
    state.setAttribute('aria-busy', String(busy));
  };
  if (location.protocol === 'file:') {
    report('Modo local: esta copia funciona sin Internet. Conserva juntos index.html, enhancements.js, offline.js y motor_idiomas.js.');
    prepareButton.hidden = true;
    return;
  }
  if (!('serviceWorker' in navigator) || !('caches' in window) ||\n      !(location.protocol === 'https:' || ['localhost','127.0.0.1'].includes(location.hostname))) {
    report('Tu navegador no admite el modo web sin conexión. Descarga el proyecto completo y abre index.html localmente.');
    prepareButton.hidden = true;
    return;
  }

  function requestWorker(type, timeout=12000) {
    return new Promise(async(resolve, reject) => {
      try {
        if (!registration) registration = await navigator.serviceWorker.ready;
        const worker = navigator.serviceWorker.controller || registration.active;
        if (!worker) throw new Error('Todavía no se ha activado el modo sin conexión.');
        const channel = new MessageChannel();
        const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Sin respuesta del servicio offline.')); },timeout);
        channel.port1.onmessage = e => {
          clearTimeout(timer); channel.port1.close();
          if (!e.data || !e.data.ok) reject(new Error(e.data?.error || 'Faltan recursos sin conexión.'));
          else resolve(e.data);
        };
        worker.postMessage({type}, [channel.port2]);
      } catch(error) { reject(error); }
    });
  }
  async function check() {
    try {
      const info = await requestWorker('GET_OFFLINE_STATUS');
      if (info.ready) {
        report(navigator.onLine === false
          ? 'Sin conexión a Internet: traductor disponible en este dispositivo.'
          : 'Listo para usar sin Wi-Fi. Los recursos del traductor están guardados en este dispositivo.');
        prepareButton.textContent = 'Volver a comprobar';
      } else {
        report('Aún faltan '+info.missing.length+' archivos. Conéctate a Internet y pulsa «Guardar para usar sin Wi-Fi».');
      }
    } catch (_) {
      report('No se ha confirmado la copia sin conexión. Pulsa «Guardar para usar sin Wi-Fi» cuando tengas Internet.');
    }
  }
  prepareButton.addEventListener('click', async () => {
    prepareButton.disabled = true;
    report('Guardando y verificando los archivos para usar la web sin Wi-Fi…',true);
    try {
      const info = await requestWorker('CACHE_FOR_OFFLINE',30000);
      if (!info.ready) throw new Error('No se guardaron todos los archivos.');
      report('Preparación completada: '+info.cached+'/'+info.total+' recursos guardados. Ya puedes desconectar el Wi-Fi.');
      prepareButton.textContent = 'Volver a comprobar';
    } catch(error) {
      report('No se pudo completar la descarga: '+error.message+' Comprueba la conexión e inténtalo otra vez.');
    } finally { prepareButton.disabled = false; }
  });

  window.addEventListener('online', check);
  window.addEventListener('offline', check);
  navigator.serviceWorker.addEventListener('controllerchange', check);
  navigator.serviceWorker.register('./sw.js', {scope:'./'}).then(reg => {
    registration = reg;
    return navigator.serviceWorker.ready;
  }).then(() => check()).catch(error => {
    report('No se pudo activar el modo sin conexión: '+error.message);
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installationPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!installationPrompt) return;
    const prompt = installationPrompt;
    installationPrompt = null;
    installButton.hidden = true;
    try { await prompt.prompt(); await prompt.userChoice; } catch (_) {}
  });
  window.addEventListener('appinstalled', () => {
    installButton.hidden = true;
    report('Aplicación instalada. Abre el icono desde el teléfono o PC, incluso sin Wi-Fi.');
  });
})();
