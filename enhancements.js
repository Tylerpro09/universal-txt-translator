/* Extensiones de interfaz para Motor TXT Universal.
   Sin telemetría ni dependencias. El guardado local es siempre voluntario. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const engine = window.MotorIdiomasTXT;
  if (!engine || !$('drop') || !document.querySelector('.grid')) return;

  const style = document.createElement('style');
  style.textContent = `
  .extra-tools{margin-top:22px}
  .extra-layout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .extra-box{border:1px solid var(--line);background:#0c192c;border-radius:14px;padding:17px;min-width:0}
  .extra-box h3{font-size:1rem;margin:0 0 8px}
  .extra-box p{font-size:.82rem;color:var(--muted);line-height:1.55;margin:6px 0 12px}
  .extra-tools .control-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
  .extra-tools .control-row>*{flex:1 1 150px;min-width:0}
  .extra-tools input[type=search],.extra-tools select,.extra-tools textarea{background:#0b1527;border:1px solid #3b4d6c;border-radius:9px;padding:11px;color:var(--txt);width:100%;font:inherit}
  .extra-tools textarea{font-family:ui-monospace,Consolas,monospace;min-height:190px;line-height:1.5}
  .extra-tools label{font-size:.83rem;font-weight:700}
  .extra-tools input[type=file]{max-width:100%;font-size:.8rem}
  .extra-tools .message{font-size:.8rem;color:var(--muted);line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;min-height:20px}
  .extra-tools .message.err{color:#ffb29e}
  .extra-tools .message.good{color:var(--ok)}
  .extra-docs{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px;font-size:.84rem}
  .extra-docs a{color:#9edfff}
  #mappingSearch{display:block;width:100%;background:#0b1527;border:1px solid #3b4d6c;color:var(--txt);border-radius:9px;padding:9px 10px;margin-top:10px;font:inherit}
  @media(max-width:760px){.extra-layout{grid-template-columns:1fr}.extra-tools .control-row>*{flex:1 1 100%}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement('section');
  panel.className = 'panel extra-tools';
  panel.setAttribute('aria-label', 'Herramientas adicionales');
  panel.innerHTML = `
    <div class="topline"><h2>3. Administrar y preparar idiomas</h2><span class="step">HERRAMIENTAS</span></div>
    <div class="extra-layout">
      <div class="extra-box">
        <h3>Editor TXT integrado</h3>
        <p>Pega un alfabeto o diccionario, comprueba errores y úsalo directamente. No necesitas crear un archivo antes.</p>
        <label for="profileEditor">Definición del idioma</label>
        <textarea id="profileEditor" spellcheck="false" placeholder="ORIGEN: Idioma origen&#10;IDIOMA: Destino&#10;&#10;[DICCIONARIO]&#10;palabra = equivalencia"></textarea>
        <div class="control-row">
          <button id="validateProfile">Validar TXT</button>
          <button class="primary" id="applyProfile">Activar idioma</button>
          <button id="editProfile">Editar perfil actual</button>
        </div>
        <p id="editorStatus" class="message" role="status"></p>
      </div>
      <div class="extra-box">
        <h3>Biblioteca de idiomas (opcional)</h3>
        <p>Guarda los perfiles en <b>este navegador</b> solo cuando pulses Guardar. Puedes restaurarlos o eliminarlos.</p>
        <div class="control-row">
          <button id="saveProfileLocal">Guardar perfil actual</button>
          <button id="exportProfile">Exportar perfil .txt</button>
        </div>
        <label for="savedProfiles">Perfiles guardados</label>
        <select id="savedProfiles"><option value="">Sin perfiles guardados</option></select>
        <div class="control-row">
          <button id="loadSavedProfile">Restaurar</button>
          <button id="removeSavedProfile">Eliminar</button>
        </div>
        <p id="storageStatus" class="message" role="status">No se almacena ningún texto de conversación.</p>
        <hr style="border:0;border-top:1px solid var(--line);margin:19px 0">
        <h3>Traducir archivo completo</h3>
        <p>Elige un TXT de texto y descarga la traducción. Usa el idioma activo y la dirección del traductor superior.</p>
        <input type="file" id="batchFile" accept=".txt,text/plain" aria-label="TXT para traducir">
        <div class="control-row"><button class="primary" id="translateBatch">Traducir y descargar TXT</button></div>
        <p id="batchStatus" class="message" role="status"></p>
      </div>
    </div>
    <nav class="extra-docs" aria-label="Documentación">
      <a href="https://github.com/Tylerpro09/universal-txt-translator/blob/main/docs/GUIA_USUARIO.md" target="_blank" rel="noopener">Guía de uso</a>
      <a href="https://github.com/Tylerpro09/universal-txt-translator/blob/main/docs/FORMATO_TXT.md" target="_blank" rel="noopener">Especificación TXT</a>
      <a href="https://github.com/Tylerpro09/universal-txt-translator/blob/main/docs/API_JAVASCRIPT.md" target="_blank" rel="noopener">API JavaScript</a>
      <a href="https://github.com/Tylerpro09/universal-txt-translator/blob/main/docs/PREGUNTAS_FRECUENTES.md" target="_blank" rel="noopener">Preguntas frecuentes</a>
      <a href="https://github.com/Tylerpro09/universal-txt-translator" target="_blank" rel="noopener">Repositorio</a>
    </nav>
  `;
  document.querySelector('.grid').insertAdjacentElement('afterend', panel);

  const STORAGE_KEY = 'motor-txt-perfiles-v1';
  const maxFileBytes = 2_000_000;
  const msg = (id, value, kind = '') => {
    const el = $(id);
    el.textContent = value;
    el.className = 'message' + (kind ? ' ' + kind : '');
  };
  const serialize = profile => {
    if (!profile) throw new Error('Carga primero un perfil.');
    const lines = ['# Generado por Motor TXT Universal', 'ORIGEN: ' + profile.sourceLanguage,
      'IDIOMA: ' + profile.name, '', '[ALFABETO]'];
    for (const p of profile.alphabet) lines.push(p.from + ' = ' + p.to);
    lines.push('', '[DICCIONARIO]');
    for (const p of profile.words) lines.push(p.from + ' = ' + p.to);
    return lines.join('\n') + '\n';
  };
  function download(filename, value) {
    const blob = new Blob(['\ufeff', value], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function getSaved() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data.filter(x => x && typeof x.txt === 'string' && typeof x.id === 'string').slice(0, 12) : [];
    } catch (_) { return []; }
  }
  function setSaved(values) { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); }
  function refreshSaved() {
    const select = $('savedProfiles'), existing = select.value;
    select.replaceChildren(new Option('Selecciona un perfil guardado', ''));
    for (const p of getSaved()) select.add(new Option(p.name + ' · ' + p.source, p.id));
    if (getSaved().some(p => p.id === existing)) select.value = existing;
  }
  refreshSaved();

  $('validateProfile').addEventListener('click', () => {
    try {
      const profile = engine.parseProfile($('profileEditor').value, 'editor.txt');
      msg('editorStatus', 'Correcto: ' + profile.entries + ' equivalencias (' +
        profile.alphabet.length + ' letras, ' + profile.words.length + ' expresiones).' +
        (profile.warnings.length ? '\nAvisos:\n' + profile.warnings.join('\n') : ''), 'good');
    } catch (error) { msg('editorStatus', error.message, 'err'); }
  });
  $('applyProfile').addEventListener('click', () => {
    try {
      const content = $('profileEditor').value;
      const profile = engine.parseProfile(content, 'editor.txt');
      installProfile(content, 'editor.txt');
      msg('editorStatus', 'Perfil «' + profile.name + '» activado. ' +
        profile.entries + ' equivalencias reconocidas.' +
        (profile.warnings.length ? '\n' + profile.warnings.join('\n') : ''), 'good');
    } catch (error) { msg('editorStatus', error.message, 'err'); }
  });
  $('editProfile').addEventListener('click', () => {
    if (!activeProfile) { msg('editorStatus', 'Carga un idioma antes de editarlo.', 'err'); return; }
    $('profileEditor').value = serialize(activeProfile);
    $('profileEditor').focus();
    msg('editorStatus', 'Edición cargada. Pulsa «Activar idioma» para aplicar los cambios.');
  });
  $('exportProfile').addEventListener('click', () => {
    try {
      const value = serialize(activeProfile);
      download('idioma_' + activeProfile.name.replace(/[^a-z0-9_-]/giu, '_') + '.txt', value);
      msg('storageStatus', 'Perfil exportado en TXT.', 'good');
    } catch(error) { msg('storageStatus', error.message, 'err'); }
  });
  $('saveProfileLocal').addEventListener('click', () => {
    try {
      if (!activeProfile) throw new Error('Carga un idioma antes de guardarlo.');
      const values = getSaved();
      const txt = serialize(activeProfile);
      const id = String(Date.now()) + '-' + Math.random().toString(36).slice(2,8);
      values.unshift({ id, name:activeProfile.name, source:activeProfile.sourceLanguage, txt, filename:activeProfile.filename });
      if (values.length > 12) values.length = 12;
      setSaved(values);
      refreshSaved();
      $('savedProfiles').value = id;
      msg('storageStatus', 'Guardado en este navegador. Máximo: 12 perfiles.', 'good');
    } catch(error) { msg('storageStatus', 'No se pudo guardar: ' + error.message, 'err'); }
  });
  $('loadSavedProfile').addEventListener('click', () => {
    try {
      const p = getSaved().find(v => v.id === $('savedProfiles').value);
      if (!p) throw new Error('Selecciona un perfil.');
      engine.parseProfile(p.txt, p.filename || 'guardado.txt');
      installProfile(p.txt, p.filename || 'guardado.txt');
      msg('storageStatus', 'Perfil restaurado: ' + p.name, 'good');
    } catch(error) { msg('storageStatus', error.message, 'err'); }
  });
  $('removeSavedProfile').addEventListener('click', () => {
    const id = $('savedProfiles').value;
    if (!id) { msg('storageStatus', 'Selecciona el perfil que deseas eliminar.', 'err'); return; }
    try {
      setSaved(getSaved().filter(p => p.id !== id));
      refreshSaved();
      msg('storageStatus', 'Perfil eliminado del almacenamiento del navegador.', 'good');
    } catch(error) { msg('storageStatus', error.message, 'err'); }
  });
  $('translateBatch').addEventListener('click', async () => {
    const file = $('batchFile').files[0];
    if (!activeProfile) { msg('batchStatus', 'Primero carga o crea un idioma.', 'err'); return; }
    if (!file || !/\.txt$/iu.test(file.name)) { msg('batchStatus', 'Selecciona un archivo .txt.', 'err'); return; }
    if (file.size > maxFileBytes) { msg('batchStatus', 'Máximo 2 MB por archivo.', 'err'); return; }
    try {
      const bytes = await file.arrayBuffer();
      let content = new TextDecoder('utf-8', {fatal:true}).decode(bytes);
      if (!content) throw new Error('El archivo está vacío.');
      const result = engine.translate(content, activeProfile, $('direction').value);
      if (!result.direction) throw new Error(result.warning);
      if (!result.matches) throw new Error('No se reconocieron equivalencias; no se descargó una copia sin traducir.');
      download('traducido_' + file.name, result.output);
      msg('batchStatus', 'Archivo traducido localmente: ' + result.matches + ' coincidencias · ' + result.direction + '.', 'good');
    } catch(error) { msg('batchStatus', 'No se pudo traducir: ' + error.message, 'err'); }
  });
  const mapContainer = $('mappingRows')?.closest('details');
  if (mapContainer) {
    const search = document.createElement('input');
    search.type = 'search'; search.id = 'mappingSearch';
    search.placeholder = 'Buscar letra, palabra o traducción...';
    search.setAttribute('aria-label','Filtrar equivalencias');
    mapContainer.querySelector('.table-wrap')?.insertAdjacentElement('beforebegin', search);
    search.addEventListener('input', () => {
      const term = search.value.trim().toLocaleLowerCase();
      for (const row of $('mappingRows').querySelectorAll('tr')) {
        row.hidden = Boolean(term && !row.textContent.toLocaleLowerCase().includes(term));
      }
    });
  }
  $('input').addEventListener('keydown', ev => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); doTranslate(); }
  });
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js', {scope:'./'}).catch(() => {});
  }
})();