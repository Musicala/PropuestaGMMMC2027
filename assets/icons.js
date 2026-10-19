/* Shared, decorative SVG icons. Text labels remain the accessible names. */
(() => {
 'use strict';
 const shapes={
  spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  music:'<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>',
  dance:'<circle cx="13" cy="4" r="2"/><path d="m12 8-4 5 5 3 2 6M12 8l5 3 5-3M12 8 5 6 2 9m11 7-7 5"/>',
  palette:'<path d="M21 12a9 9 0 1 0-9 9h2a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 1-2.8h2a3 3 0 0 0 3-2.5Z"/><circle cx="7" cy="10" r=".7"/><circle cx="10" cy="6" r=".7"/><circle cx="15" cy="7" r=".7"/><circle cx="7" cy="15" r=".7"/>',
  trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0zM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4M12 14v6m-5 1h10"/>',
  book:'<path d="M12 6v15M3 3c4-1 7 0 9 3 2-3 5-4 9-3v15c-4-1-7 0-9 3-2-3-5-4-9-3z"/>',
  laptop:'<rect x="4" y="3" width="16" height="13" rx="2"/><path d="m4 16-2 5h20l-2-5M9 7h6m-6 4h4"/>',
  chart:'<path d="M4 3v17h17M8 15v-4m5 4V6m5 9v-6"/>',
  notebook:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4M3 12h4m-4 5h4m4-10h5m-5 5h5m-5 5h3"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  checklist:'<rect x="5" y="4" width="15" height="17" rx="2"/><path d="M9 4V2h7v2m-8 5 1 1 2-2m2 1h4m-9 5 1 1 2-2m2 1h4m-9 5h9"/>',
  users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>',
  heart:'<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 3 11 8 16 5-5 13-11 8-16Z"/>',
  route:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h5"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h1m6 0h1m-8 3h1"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
  wallet:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8V5l15-3v3m3 6h-6v5h6m-3-2h.1"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5"/>',
  presentation:'<rect x="3" y="3" width="18" height="13" rx="1"/><path d="M12 16v5m-5 1 5-3 5 3M8 7l7 3-7 3z"/>',
  print:'<path d="M6 8V3h12v5M6 17H3V9h18v8h-3M6 14h12v7H6zm11-3h1"/>',
  zoom:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>',
  home:'<path d="m3 10 9-7 9 7v11H3zM9 21v-8h6v8"/>',
  file:'<path d="M14 2H5v20h14V7zm0 0v6h5M8 12h8m-8 4h6"/>',
  check:'<path d="m5 12 4 4L20 5"/>',
  pin:'<path d="M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  flag:'<path d="M4 22V3c6-4 10 4 16 0v11c-6 4-10-4-16 0"/>',
  refresh:'<path d="M20 8a9 9 0 0 0-15-3L2 8m0-6v6h6m-4 8a9 9 0 0 0 15 3l3-3m0 6v-6h-6"/>',
  link:'<path d="m10 7 3-3a5 5 0 0 1 7 7l-3 3m-3 3-3 3a5 5 0 0 1-7-7l3-3m1 6 8-8"/>',
  school:'<path d="m3 9 9-6 9 6v12H3zm6 12v-6h6v6M7 11h1m8 0h1M12 3V1"/>',
  exit:'<path d="M10 3H3v18h7m-2-9h14m-4-4 4 4-4 4"/>'
 };
 const ns='http://www.w3.org/2000/svg';
 const sprite=document.createElementNS(ns,'svg');sprite.setAttribute('aria-hidden','true');sprite.setAttribute('class','ui-icon-sprite');
 sprite.innerHTML=Object.entries(shapes).map(([name,path])=>`<symbol id="ui-${name}" viewBox="0 0 24 24">${path}</symbol>`).join('');document.body.prepend(sprite);
 function icon(name){const svg=document.createElementNS(ns,'svg');svg.setAttribute('class','ui-icon');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const use=document.createElementNS(ns,'use');use.setAttribute('href','#ui-'+(shapes[name]?name:'spark'));svg.append(use);return svg;}
 function add(el,name){if(!el||[...el.children].some(x=>x.classList.contains('ui-icon')))return;el.prepend(icon(name));el.classList.add('with-ui-icon');}
 function choose(text){
  const s=text.toLocaleLowerCase('es');
  for(const [regex,name] of [[/danza|movimiento/,'dance'],[/porrismo|competencia|festival|escenario/,'trophy'],[/plástic|crear|creaci|obras/,'palette'],[/piano|música|musical|orquesta|ensamble|instrument/,'music'],[/objetiv|meta|evalu/,'target'],[/checklist|asistencia|registr/,'checklist'],[/material|físic|guía|práctica/,'book'],[/bitácora|document/,'notebook'],[/informe|indicador|avance|gestión/,'chart'],[/plataforma|digital|conectividad|docente/,'laptop'],[/familia|grupo|profesional|equipo|compartir/,'users'],[/continu|ruta|retomar|proceso/,'route'],[/calendario|fecha|ciclo|seman|alistamiento/,'calendar'],[/minuto|hora|sesión/,'clock'],[/tarifa|precio|inversión|cotiz|presupuesto/,'wallet'],[/apoyo|acompañar|cuid/,'heart']])if(regex.test(s))return name;
  return 'spark';
 }
 function decorate(root=document){
  root.querySelectorAll('h2,h3,h4').forEach(h=>add(h,choose(h.textContent)));
  root.querySelectorAll('.contents a,.offer-summary a,.hero-buttons a,.management-links a,.inline-link,.nav-ghost').forEach(a=>add(a,choose(a.textContent)));
  root.querySelectorAll('.pillar .p-icon').forEach((el,i)=>{if(el.querySelector('.ui-icon'))return;el.textContent='';el.append(icon(['book','route','heart','users'][i%4]));});
  root.querySelectorAll('.practice-steps summary,.event-editor>summary,.instrument-notes>summary').forEach(el=>add(el,choose(el.textContent)));
  root.querySelectorAll('.projection-tag').forEach(el=>add(el,choose(el.textContent)));
  root.querySelectorAll('.process-strip>div:not(.process-arrow),.connected-flow article').forEach(el=>{const n=el.querySelector('small,span');if(n)add(n,choose(el.textContent));});
  root.querySelectorAll('.sim-fields label,.event-fields label').forEach(label=>{if(label.querySelector('.field-label'))return;const text=[...label.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(!text)return;const span=document.createElement('span');span.className='field-label';label.insertBefore(span,text);span.append(icon(choose(text.textContent)),text);});
  root.querySelectorAll('.zoom').forEach(el=>add(el,'zoom'));
  for(const [id,name] of Object.entries({presentBtn:'presentation',printBtn:'print',simReset:'refresh',restoreDates:'refresh',exportSchedule:'download',exportBudget:'download',deckClose:'exit',deckFullscreen:'presentation',closeDialog:'exit'})) add(root.querySelector('#'+id),name);
  root.querySelectorAll('#eventForm button[type=submit]').forEach(el=>add(el,'calendar'));
 }
 window.MusicalaIcons={decorate,icon};decorate();
})();
