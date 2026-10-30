/* Motor TXT Universal — panel de calidad de traduccion 3.0 */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const engine=window.MotorIdiomasTXT;
  if(!engine||!$('input')||!$('output')||!document.querySelector('.grid'))return;
  const css=document.createElement('style');
  css.textContent=`
    .quality-panel{margin-top:19px}
    .quality-panel p{line-height:1.5}
    .quality-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:18px}
    .quality-block{border:1px solid var(--line);border-radius:13px;padding:17px;background:#0b192c;min-width:0}
    .quality-block h3{margin:0 0 9px;font-size:1.03rem}
    .quality-block p{margin:0 0 10px;color:var(--muted);font-size:.82rem}
    .quality-meter{width:100%;height:14px;background:#253955;border-radius:20px;overflow:hidden;margin:8px 0}
    .quality-meter span{height:100%;display:block;width:0;background:linear-gradient(90deg,#4fa4e7,#58e5b6);transition:width .24s ease}
    .quality-score{font-size:2rem;font-weight:800;letter-spacing:-.04em;margin:4px 0}
    .quality-detail{font-size:.82rem;color:var(--muted);min-height:26px}
    .quality-unknown{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0;max-height:190px;overflow:auto}
    .quality-unknown button{border:1px solid #425c77;padding:6px 10px;min-width:0;font-size:.79rem;overflow-wrap:anywhere}
    .quality-form{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:11px}
    .quality-form label{font-size:.79rem;display:block;margin-bottom:6px}
    .quality-form input{display:block;width:100%;min-width:0;padding:10px;border:1px solid #496080;border-radius:9px;background:#091529;color:var(--txt);font:inherit}
    .quality-form input:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
    .quality-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}
    .quality-actions button{flex:1 1 155px}
    #qualityMessage{color:var(--muted);font-size:.8rem;white-space:pre-wrap;overflow-wrap:anywhere;min-height:22px}
    @media(max-width:760px){.quality-grid{grid-template-columns:1fr}}
  `;
  document.head.append(css);

  const panel=document.createElement('section');
  panel.className='panel quality-panel';
  panel.setAttribute('aria-label','Calidad y ampliación del idioma');
  panel.innerHTML=`
    <div class="topline"><h2>3. Calidad y mejora del idioma</h2><span class="step">ANÁLISIS EN TIEMPO REAL</span></div>
    <div class="quality-grid">
      <div class="quality-block">
        <h3>Cobertura de traducción</h3>
        <p>Porcentaje aproximado de los caracteres no vacíos cubiertos por tus equivalencias.</p>
        <div class="quality-score" id="qualityPercent">—</div>
        <div class="quality-meter" role="progressbar" aria-label="Cobertura de traducción" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="qualityMeter"><span id="qualityFill"></span></div>
        <div class="quality-detail" id="qualityDetail" role="status" aria-live="polite">Carga un idioma y escribe un mensaje.</div>
        <div class="quality-actions"><button type="button" id="qualityReport" disabled>Descargar diagnóstico TXT</button></div>
      </div>
      <div class="quality-block">
        <h3>Palabras que necesitan equivalencias</h3>
        <p>Toca una palabra para añadirla al diccionario de tu idioma.</p>
        <div class="quality-unknown" id="qualityUnknown"></div>
        <div class="quality-form">
          <div><label for="newWord">Texto original</label><input id="newWord" placeholder="Palabra o frase" autocomplete="off" maxlength="160"></div>
          <div><label for="newMeaning">Traducción</label><input id="newMeaning" placeholder="Equivalencia" autocomplete="off" maxlength="160"></div>
        </div>
        <div class="quality-actions"><button class="primary" type="button" id="addRule">Añadir equivalencia al idioma</button></div>
        <p id="qualityMessage" role="status"></p>
      </div>
    </div>
  `;
  document.querySelector('.grid').insertAdjacentElement('afterend',panel);

  function getProfile() {
    try { return typeof activeProfile!=='undefined'?activeProfile:null; }catch(_){return null;}
  }
  function profileAsTXT(p) {
    if(!p)return 'ORIGEN: Idioma de origen\nIDIOMA: Idioma personalizado\n\n[DICCIONARIO]\n';
    const lines=['ORIGEN: '+p.sourceLanguage,'IDIOMA: '+p.name,'','[ALFABETO]'];
    for(const v of p.alphabet)lines.push(v.from+' = '+v.to);
    lines.push('','[DICCIONARIO]');
    for(const v of p.words)lines.push(v.from+' = '+v.to);
    return lines.join('\n')+'\n';
  }
  let latest=null, timer=null;
  function draw() {
    const profile=getProfile(), text=$('input').value;
    const percent=$('qualityPercent'), detail=$('qualityDetail');
    const unknown=$('qualityUnknown'),report=$('qualityReport');
    unknown.replaceChildren();
    report.disabled=true;latest=null;
    if(!profile||!text.trim()){
      percent.textContent='—';detail.textContent=profile?'Escribe texto para conocer la cobertura.':'Carga un idioma y escribe un mensaje.';
      $('qualityFill').style.width='0%';$('qualityMeter').setAttribute('aria-valuenow','0');
      return;
    }
    try {
      const result=engine.translate(text,profile,$('direction').value);
      if(!result.direction) {
        percent.textContent='—';
        detail.textContent=result.warning;
        $('qualityFill').style.width='0%';$('qualityMeter').setAttribute('aria-valuenow','0');
        return;
      }
      latest={result,source:text,profile:profile.name};
      report.disabled=false;
      const stats=result.stats||{};
      const pct=stats.coverage??0;
      percent.textContent=pct+' %';
      $('qualityFill').style.width=pct+'%';
      $('qualityMeter').setAttribute('aria-valuenow',String(pct));
      detail.textContent=result.matches+' coincidencias · '+(stats.matchedCharacters??0)+' de '+(stats.totalCharacters??0)+' caracteres cubiertos.';
      for(const word of stats.untranslatedWords||[]){
        const button=document.createElement('button');
        button.type='button';
        button.title='Preparar equivalencia para '+word;
        button.textContent=word;
        button.addEventListener('click',()=>{
          $('newWord').value=word;$('newMeaning').focus();
        });
        unknown.append(button);
      }
      if(!unknown.children.length) {
        const msg=document.createElement('span');
        msg.textContent='No se detectaron palabras sin equivalencias.';
        msg.style.color='var(--muted)';msg.style.fontSize='.84rem';unknown.append(msg);
      }
    } catch(error) {
      percent.textContent='—';
      detail.textContent='No se pudo analizar: '+error.message;
    }
  }
  function schedule(){
    clearTimeout(timer);timer=setTimeout(draw,140);
  }
  $('input').addEventListener('input',schedule);
  $('direction').addEventListener('change',schedule);
  document.addEventListener('motor:profile-changed',draw);
  $('newWord').addEventListener('keydown',e=>{if(e.key==='Enter'){$('newMeaning').focus();}});
  $('newMeaning').addEventListener('keydown',e=>{if(e.key==='Enter')$('addRule').click();});
  $('addRule').addEventListener('click',()=>{
    const from=$('newWord').value.trim(),to=$('newMeaning').value.trim();
    const message=$('qualityMessage');
    if(!from||!to){message.textContent='Introduce la palabra y su traducción.';return;}
    if(/[\r\n=|]/u.test(from)||/[\r\n=|]/u.test(to)){
      message.textContent='No incluyas saltos de línea, = ni | en esta equivalencia.';return;
    }
    const editor=$('profileEditor');
    if(!editor){message.textContent='No se encontró el editor de idiomas.';return;}
    let base=editor.value.trim()?editor.value:profileAsTXT(getProfile());
    const proposed=base+'\n[DICCIONARIO]\n'+from+' = '+to+'\n';
    try {
      const current=engine.parseProfile(base,'editor.txt');
      const parsed=engine.parseProfile(proposed,'editor.txt');
      if(parsed.entries<=current.entries) {
        message.textContent='Esa palabra o traducción ya existe. Revisa las equivalencias del perfil.';return;
      }
      editor.value=proposed;
      installProfile(proposed,'editor.txt');
      $('newWord').value='';$('newMeaning').value='';
      message.textContent='Nueva equivalencia añadida. Exporta el perfil TXT o guárdalo en tu biblioteca para conservarlo.';
      document.dispatchEvent(new Event('motor:profile-changed'));
    }catch(error){
      // Se permite iniciar desde cero solo con una definición mínima creada en el editor.
      try {
        if(!getProfile()&&!editor.value.trim()) {
          const txt=profileAsTXT(null)+from+' = '+to+'\n';
          engine.parseProfile(txt,'editor.txt');
          editor.value=txt;installProfile(txt,'editor.txt');
          message.textContent='Idioma nuevo activado. Cambia su nombre en el editor y expórtalo para conservarlo.';
          document.dispatchEvent(new Event('motor:profile-changed'));return;
        }
      }catch(_){}
      message.textContent='No se añadió la equivalencia: '+error.message;
    }
  });
  $('qualityReport').addEventListener('click',()=>{
    if(!latest)return;
    const {result,profile,source}=latest, stats=result.stats;
    const txt=[
      'Diagnóstico de traducción — Motor TXT Universal 3.0',
      'Perfil: '+profile,
      'Dirección: '+(result.direction==='encode'?'Origen → Destino':'Destino → Origen'),
      'Coincidencias: '+result.matches,
      'Cobertura aproximada: '+stats.coverage+'%',
      'Caracteres cubiertos: '+stats.matchedCharacters+' / '+stats.totalCharacters,
      'Palabras pendientes: '+(stats.untranslatedWords.join(', ')||'ninguna'),
      '',
      'ENTRADA',source,'','SALIDA',result.output,''
    ].join('\n');
    const blob=new Blob(['\uFEFF'+txt],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='diagnostico_traduccion.txt';
    document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  draw();
})();
