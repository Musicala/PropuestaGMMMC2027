/* Download a visual PDF locally, including the current simulator state. */
(() => {
 'use strict';
 const status=document.getElementById('pdfStatus');let exporting=false,dependencies;
 const buttons=()=>[...document.querySelectorAll('[data-download-pdf]')];
 function announce(text){const host=document.querySelector('dialog[open]')||document.body;if(status.parentNode!==host)host.append(status);status.textContent=text;status.hidden=false;buttons().forEach(b=>{b.setAttribute('aria-label',text);if(exporting)b.textContent=text.startsWith('Preparando PDF')?'PDF '+text.split('página ')[1]:'Preparando PDF…';});}
 function load(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(src,document.baseURI).href;script.onload=resolve;script.onerror=()=>reject(new Error('No se pudo cargar '+src));document.head.append(script);});}
 function dependenciesReady(){return dependencies??=(async()=>{await Promise.all([load('assets/vendor/jspdf.umd.min.js'),load('assets/vendor/html2canvas.min.js'),load('assets/pdf-assets.js')]);})();}
 const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
 const dateText=d=>new Date(d+'T00:00:00Z').toLocaleDateString('es-CO',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'});
 function heading(text){const h=document.createElement('h2');h.textContent=text;return h;}
 function pageOf(title){const section=document.createElement('section');section.className='deck-slide pdf-extra-page';section.append(heading(title));return section;}
 function paragraph(text){const p=document.createElement('p');p.textContent=text;return p;}
 function preparePages(snapshot){
  const pages=[];
  for(const source of window.MusicalaPdfSource.createSlides()){
   if(source.querySelector('.crea-experience')){
    for(const letter of ['C','R','E','A']){
     const copy=source.cloneNode(true);
     copy.querySelectorAll('.crea-tab').forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.crea===letter)));
     copy.querySelectorAll('.crea-panel').forEach(panel=>panel.hidden=!panel.id.endsWith('crea-panel-'+letter));
     pages.push(copy);
    }
   }else if(source.querySelector('.discipline-grid')){
    source.querySelectorAll('.discipline-card').forEach(card=>{const page=pageOf('Formación artística GMMMC · '+card.querySelector('h3').textContent);page.classList.add('pdf-program-page');page.append(card.cloneNode(true));pages.push(page);});
   }else{
    const slot=source.querySelector('[data-live-simulator]');
    if(slot){
     const live=document.getElementById('simulador'),simulator=live.cloneNode(true);
     simulator.querySelectorAll('input,select,textarea').forEach(field=>{
      const original=field.id?live.querySelector('#'+field.id):[...live.querySelectorAll('input[name=weekday]')].find(x=>x.value===field.value);
      if(original){field.value=original.value;if(field.type==='checkbox')field.checked=original.checked;}
      if(field.type==='checkbox')return;
      const value=document.createElement('span');value.className='pdf-field-value';value.id=field.id;
      value.textContent=field.tagName==='SELECT'?field.selectedOptions[0]?.textContent||field.value:field.type==='date'&&field.value?new Date(field.value+'T00:00:00Z').toLocaleDateString('es-CO',{timeZone:'UTC'}):field.value;
      field.replaceWith(value);
     });
     simulator.querySelector('.event-editor')?.remove();simulator.querySelector('.sim-footer')?.remove();simulator.querySelector('#simReset')?.remove();slot.append(simulator);
    }
    pages.push(source);
   }
  }
  // Every extra event is exported, even if it is outside the training period.
  for(let start=0;start<snapshot.events.length;start+=9){
   const page=pageOf('Acompañamientos extraordinarios');
   page.append(paragraph('Horas adicionales por profesionales. Se calculan una vez, sin multiplicar por los grupos. Fechas tentativas, sujetas a confirmación.'));
   const list=document.createElement('div');list.className='pdf-events';
   snapshot.events.slice(start,start+9).forEach(event=>{const row=document.createElement('article'),name=document.createElement('strong'),details=document.createElement('p'),price=document.createElement('b');name.textContent=event.name;details.textContent=`${dateText(event.date)} · ${event.hours} horas · ${event.professionals} profesionales`;price.textContent=money(event.hours*event.professionals*60000);row.append(name,details,price);list.append(row);});
   page.append(list);pages.splice(pages.length-1,0,page);
  }
  const dates=snapshot.dates.map(date=>({date,excluded:false})).concat(snapshot.excluded.map(date=>({date,excluded:true}))).sort((a,b)=>a.date.localeCompare(b.date));
  for(let start=0;start<dates.length;start+=72){
   const page=pageOf('Fechas del escenario · formación GMMMC');
   page.append(paragraph(`${dateText(snapshot.current.start)} al ${dateText(snapshot.current.end)} · ${snapshot.dates.length} sesiones por grupo · ${snapshot.current.groups} grupo(s) · ${snapshot.current.minutes} minutos por sesión · ${snapshot.current.professionals} profesional(es) por grupo.`));
   page.append(paragraph('Las fechas excluidas no se cobran. Festivos y recesos se ajustan manualmente. Este calendario es una simulación, no una programación contratada.'));
   const grid=document.createElement('div');grid.className='pdf-dates';
   dates.slice(start,start+72).forEach(({date,excluded})=>{const item=document.createElement('span');item.textContent=dateText(date)+(excluded?' · Excluida':'');if(excluded)item.className='pdf-date-excluded';grid.append(item);});page.append(grid);pages.splice(pages.length-1,0,page);
  }
  return pages;
 }
 function embedAssets(root){
  root.querySelectorAll('img').forEach(img=>{
   const key=decodeURIComponent((img.getAttribute('src')||'').replace(/^\.\//,''));
   const data=window.MusicalaPdfAssets[key];if(!data)throw new Error('Recurso PDF no disponible: '+key);
   img.src=data;img.removeAttribute('srcset');img.loading='eager';
  });
  root.querySelectorAll('svg use').forEach(use=>{const ref=use.getAttribute('href');if(!ref?.startsWith('#'))return;const symbol=document.querySelector(ref);if(symbol)use.replaceWith(...[...symbol.children].map(n=>n.cloneNode(true)));});
  root.querySelectorAll('.zoom,.instrument-notes,.deck-hint,.soft-button,button[data-download-pdf]').forEach(el=>el.remove());
  root.querySelectorAll('details').forEach(el=>el.open=true);
 }
 async function makeFrame(){
  const frame=document.createElement('iframe');frame.className='pdf-render-frame';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
  const ready=new Promise(resolve=>frame.onload=resolve);frame.srcdoc='<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body class="pdf-export"><main id="pdfStage"></main></body></html>';document.body.append(frame);await ready;
  const doc=frame.contentDocument;const base=doc.createElement('base');base.href=document.baseURI;doc.head.append(base);
  await Promise.all([...document.querySelectorAll('link[rel=stylesheet]')].map(source=>new Promise(resolve=>{const link=doc.createElement('link');link.rel='stylesheet';link.href=source.href;link.onload=resolve;link.onerror=resolve;doc.head.append(link);}))) ;
  await Promise.race([doc.fonts.ready,new Promise(resolve=>setTimeout(resolve,2500))]);return frame;
 }
 function inlineSvgStyles(root,win){
  root.querySelectorAll('svg').forEach(svg=>{
   svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
   [svg,...svg.querySelectorAll('*')].forEach(el=>{const cs=win.getComputedStyle(el);for(const key of ['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','color','opacity','font-family','font-size','font-weight','text-anchor'])el.style.setProperty(key,cs.getPropertyValue(key));});
  });
 }
 async function downloadPdf(){
  if(exporting)return;
  const snapshot=window.MusicalaPdfSource.snapshot();
  if(!snapshot.valid){announce('Completa los campos del simulador antes de descargar el PDF.');return;}
  exporting=true;const labels=new Map(buttons().map(b=>[b,b.innerHTML]));let frame;
  buttons().forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');});
  try{
   announce('Preparando propuesta en PDF…');await dependenciesReady();
   const pages=preparePages(snapshot);pages.forEach(embedAssets);frame=await makeFrame();
   const doc=frame.contentDocument,stage=doc.getElementById('pdfStage');
   const pdf=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
   pdf.setProperties({title:'Musicala × Fundación San Antonio · GMMMC 2027',author:'Musicala',subject:`Propuesta institucional GMMMC. Escenario actual: ${snapshot.dates.length} sesiones por grupo; total formación y eventos COP ${snapshot.budget.total}. Gestión integral por cotizar.`,keywords:'GMMMC, Musicala, FSA, CREA, formación artística, 2027'});
   for(let i=0;i<pages.length;i++){
    announce(`Preparando PDF · página ${i+1} de ${pages.length}`);
    stage.replaceChildren(doc.adoptNode(pages[i]));
    await Promise.all([...stage.querySelectorAll('img')].map(img=>img.decode()));
    inlineSvgStyles(stage,frame.contentWindow);
    await new Promise(resolve=>frame.contentWindow.requestAnimationFrame(()=>resolve()));
    const canvas=await window.html2canvas(stage,{backgroundColor:'#fcfbf8',scale:1.6,useCORS:false,allowTaint:false,logging:false,width:1180,height:Math.ceil(stage.scrollHeight),windowWidth:1280,windowHeight:900,scrollX:0,scrollY:0});
    if(!canvas.width||!canvas.height)throw new Error('No se pudo renderizar una página del PDF.');
    if(i)pdf.addPage();
    const factor=Math.min(277/canvas.width,185/canvas.height),width=canvas.width*factor,height=canvas.height*factor;
    pdf.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',(297-width)/2,9+(185-height)/2,width,height,undefined,'FAST');
    const bounds=stage.getBoundingClientRect(),mmPerPx=width/bounds.width;
    stage.querySelectorAll('a[href]').forEach(a=>{if(!/^https?:\/\//.test(a.href))return;const r=a.getBoundingClientRect();if(r.width&&r.height)pdf.link((297-width)/2+(r.left-bounds.left)*mmPerPx,9+(185-height)/2+(r.top-bounds.top)*mmPerPx,r.width*mmPerPx,r.height*mmPerPx,{url:a.href});});
    pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(115,99,132);pdf.text('Musicala x FSA | GMMMC 2027 | Propuesta para revision',10,203);pdf.text(`${i+1} / ${pages.length}`,287,203,{align:'right'});
    canvas.width=canvas.height=1;
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   pdf.save('Musicala-GMMMC-2027-Propuesta.pdf');announce('PDF descargado con la propuesta completa y el escenario actual del simulador.');
   setTimeout(()=>{status.hidden=true;},7000);
  }catch(error){console.error('Exportación PDF:',error);dependencies=undefined;announce('No se pudo generar el PDF. Intenta nuevamente o usa Imprimir propuesta y Guardar como PDF.');}
  finally{frame?.remove();buttons().forEach(b=>{b.disabled=false;b.removeAttribute('aria-busy');b.removeAttribute('aria-label');if(labels.has(b))b.innerHTML=labels.get(b);});exporting=false;}
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-download-pdf]'))downloadPdf();});
 if(window.MusicalaIcons){document.querySelectorAll('[data-download-pdf]').forEach(b=>b.prepend(window.MusicalaIcons.icon('download')));}
})();
