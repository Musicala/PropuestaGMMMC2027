/* Musicala × FSA — all interactions remain in the proposal. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
  const iso = date => date.toISOString().slice(0,10);
  const parse = value => new Date(value+'T00:00:00Z');
  const addDay = (date,n=1) => new Date(date.getTime()+n*86400000);
  const longDate = value => parse(value).toLocaleDateString('es-CO',{timeZone:'UTC',weekday:'long',year:'numeric',month:'long',day:'numeric'});
  function scheduleDates(start,end,weekdays,excluded=new Set()) {
    const result=[];
    for(let d=parse(start);d<=parse(end);d=addDay(d)) if(weekdays.includes(d.getUTCDay())&&!excluded.has(iso(d))) result.push(iso(d));
    return result;
  }
  function calculate({count,minutes,groups,professionals,weekdays,events}) {
    const rate=60000*minutes/60;
    const training=count*rate*groups*professionals;
    const extras=events.reduce((sum,e)=>sum+e.hours*e.professionals*60000,0);
    return {rate,training,extras,total:training+extras,weekly:weekdays*rate*groups*professionals};
  }
  window.MusicalaSchedule={scheduleDates,calculate};
  const excluded=new Set();
  let events=[],viewMonth=1,valid=true,current={},budget={},dates=[],candidates=[];
  function values(){return {start:$('simStart').value,end:$('simEnd').value,minutes:Number($('simMinutes').value),groups:Number($('simGroups').value),professionals:Number($('simPros').value),weekdays:[...document.querySelectorAll('[name=weekday]:checked')].map(x=>Number(x.value)),discipline:$('simDiscipline').value};}
  function read(){
    current=values();
    let error='';
    if(!$('scheduleForm').checkValidity()) error='Completa los campos: fechas de 2027, grupos de 1 a 50 y profesionales de 1 a 20, en números enteros.';
    else if(current.end<current.start) error='La fecha de cierre debe ser igual o posterior a la fecha de inicio.';
    else if(!current.weekdays.length) error='Elige al menos un día de clase para calcular el calendario.';
    valid=!error;
    $('simError').textContent=error;$('simError').hidden=valid;
    $('exportSchedule').disabled=!valid;$('exportBudget').disabled=!valid;
    if(valid){
      candidates=scheduleDates(current.start,current.end,current.weekdays);
      dates=candidates.filter(x=>!excluded.has(x));
      budget=calculate({...current,count:dates.length,weekdays:current.weekdays.length,events});
      for(const [id,key] of [['simRate','rate'],['simWeekly','weekly'],['simTraining','training'],['simExtras','extras'],['simTotal','total']]) $(id).textContent=money(budget[key]);
      $('simCount').textContent=dates.length;
      $('simAllCount').textContent=dates.length*current.groups;
      $('simFormula').textContent=`${dates.length} sesiones × ${current.minutes} min × ${current.groups} grupo(s) × ${current.professionals} profesional(es) × $1.000/minuto.`;
      $('simStatus').textContent=`${current.discipline} · ${dates.length} sesiones por grupo · ${candidates.length-dates.length} fecha(s) excluida(s). Escenario editable, no contratado.`;
    }else{
      candidates=[];dates=[];
      ['simRate','simWeekly','simTraining','simExtras','simTotal','simCount','simAllCount'].forEach(id=>$(id).textContent='—');
      $('simFormula').textContent='Ajusta la configuración para obtener una estimación.';
      $('simStatus').textContent='Escenario pendiente de completar.';
    }
    renderCalendar();renderEvents();
  }
  function renderCalendar(){
    const first=new Date(Date.UTC(2027,viewMonth,1));
    $('calMonth').textContent=first.toLocaleDateString('es-CO',{timeZone:'UTC',month:'long',year:'numeric'});
    $('calPrev').disabled=viewMonth===0;$('calNext').disabled=viewMonth===11;
    const grid=$('calendarGrid');grid.replaceChildren();
    const offset=(first.getUTCDay()+6)%7;
    for(let i=0;i<offset;i++){const blank=document.createElement('span');blank.className='calendar-empty';grid.append(blank);}
    const last=new Date(Date.UTC(2027,viewMonth+1,0)).getUTCDate();
    for(let day=1;day<=last;day++){
      const date=iso(new Date(Date.UTC(2027,viewMonth,day)));
      const planned=candidates.includes(date),omit=planned&&excluded.has(date),extra=events.filter(e=>e.date===date);
      const button=document.createElement('button');button.type='button';button.className='calendar-day';
      button.textContent=day;button.dataset.date=date;
      button.classList.toggle('has-class',planned&&!omit);button.classList.toggle('is-excluded',omit);button.classList.toggle('has-event',extra.length>0);
      button.classList.toggle('out-period',date<current.start||date>current.end);
      button.disabled=!planned;button.setAttribute('aria-label',`${longDate(date)}${planned?(omit?', clase excluida. Pulsa para incluir':', clase programada. Pulsa para excluir'):''}${extra.length?', '+extra.map(e=>e.name).join(', '):''}`);
      if(planned)button.setAttribute('aria-pressed',String(!omit));
      if(extra.length){const dot=document.createElement('i');dot.className='day-event-dot';button.append(dot);button.title=extra.map(e=>e.name).join(' · ');}
      grid.append(button);
    }
    const count=dates.filter(d=>parse(d).getUTCMonth()===viewMonth).length;
    $('calSelection').textContent=valid?`${count} sesiones por grupo este mes · ${dates.length} en todo el periodo.`:'Completa la configuración para programar las clases.';
    $('restoreDates').disabled=!candidates.some(d=>excluded.has(d));
  }
  $('calendarGrid').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(!b||b.disabled)return;const date=b.dataset.date;excluded.has(date)?excluded.delete(date):excluded.add(date);read();$('calendarGrid').querySelector(`[data-date="${date}"]`)?.focus({preventScroll:true});});
  $('calPrev').addEventListener('click',()=>{if(viewMonth>0)viewMonth--;renderCalendar();});
  $('calNext').addEventListener('click',()=>{if(viewMonth<11)viewMonth++;renderCalendar();});
  $('restoreDates').addEventListener('click',()=>{excluded.clear();read();});
  $('scheduleForm').addEventListener('submit',e=>e.preventDefault());
  $('scheduleForm').addEventListener('input',e=>{if(e.target.id==='simStart'&&/^2027-\d{2}-\d{2}$/.test(e.target.value))viewMonth=parse(e.target.value).getUTCMonth();read();});
  function renderEvents(){
    const list=$('eventList');list.replaceChildren();
    if(!events.length){const li=document.createElement('li');li.className='empty-events';li.textContent='Aún no has añadido eventos. Los referentes de ciudad no se programan automáticamente.';list.append(li);}
    events.forEach((event,index)=>{
      const li=document.createElement('li'),copy=document.createElement('div'),title=document.createElement('strong'),info=document.createElement('span'),price=document.createElement('b'),remove=document.createElement('button');
      title.textContent=event.name;info.textContent=`${longDate(event.date)} · ${event.hours} h × ${event.professionals} profesionales${event.date<current.start||event.date>current.end?' · Fuera del periodo de formación':''}`;
      copy.append(title,info);price.textContent=money(event.hours*event.professionals*60000);remove.type='button';remove.textContent='Quitar ×';remove.setAttribute('aria-label','Quitar '+event.name);remove.addEventListener('click',()=>{events.splice(index,1);read();});li.append(copy,price,remove);list.append(li);
    });
  }
  $('eventForm').addEventListener('submit',e=>{
    e.preventDefault();if(!$('eventForm').reportValidity())return;
    const name=$('eventName').value.trim();if(!name){$('eventName').setCustomValidity('Escribe un nombre para el evento.');$('eventName').reportValidity();return;}
    events.push({name,date:$('eventDate').value,hours:Number($('eventHours').value),professionals:Number($('eventPros').value)});
    viewMonth=parse($('eventDate').value).getUTCMonth();read();$('simStatus').textContent='Evento añadido. El calendario y el presupuesto se actualizaron.';
  });
  $('eventName').addEventListener('input',()=>$('eventName').setCustomValidity(''));
  $('simReset').addEventListener('click',()=>{$('scheduleForm').reset();$('eventForm').reset();excluded.clear();events=[];viewMonth=1;read();});
  function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function csvCell(value){let s=String(value);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
  $('exportBudget').addEventListener('click',()=>{
    if(!valid)return;
    const rows=[['Musicala × FSA · GMMMC 2027','Estimación sujeta a alcance y calendario confirmados'],['Disciplina',current.discipline],['Inicio',current.start],['Cierre',current.end],['Grupos',current.groups],['Minutos por sesión',current.minutes],['Profesionales por grupo',current.professionals],['Sesiones por grupo',dates.length],['Tarifa por sesión y profesional COP',budget.rate],['Formación COP',budget.training],['Eventos COP',budget.extras],['Total formación + eventos COP',budget.total],['Gestión integral','Por cotizar; no incluida'],['Extras logísticos','Por cotizar; no incluidos'],[],['Tipo','Fecha','Detalle','Horas','Profesionales','Grupos','Importe COP']];
    dates.forEach(d=>rows.push(['Clase',d,current.discipline,current.minutes/60,current.professionals,current.groups,budget.rate*current.groups*current.professionals]));
    candidates.filter(d=>excluded.has(d)).forEach(d=>rows.push(['Excluida',d,current.discipline,0,0,current.groups,0]));
    events.forEach(e=>rows.push(['Evento',e.date,e.name,e.hours,e.professionals,1,e.hours*e.professionals*60000]));
    download('Musicala-GMMMC-2027-presupuesto.csv','\uFEFF'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n'),'text/csv;charset=utf-8');
  });
  const icsEscape=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  function fold(line){let result='',piece='';for(const char of line){if(new TextEncoder().encode(piece+char).length>73){result+=piece+'\r\n ';piece='';}piece+=char;}return result+piece;}
  $('exportSchedule').addEventListener('click',()=>{
    if(!valid)return;
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Musicala//Propuesta GMMMC 2027//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Musicala × FSA · GMMMC 2027 · Simulación'];
    const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const entries=dates.map(d=>({date:d,name:current.discipline+' · '+current.groups+' grupo(s)',desc:`Simulación: ${current.minutes} min por grupo; ${current.professionals} profesionales por grupo. Horario por acordar. No contratado.`})).concat(events.map(e=>({date:e.date,name:e.name,desc:`Evento simulado: ${e.hours} horas × ${e.professionals} profesionales. ${money(e.hours*e.professionals*60000)}. Horario y participación por acordar.`})));
    entries.forEach((e,i)=>lines.push('BEGIN:VEVENT',`UID:sim-${e.date}-${i}-${stamp}@musicala.local`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${e.date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${iso(addDay(parse(e.date))).replaceAll('-','')}`,'SUMMARY:'+icsEscape(e.name),'DESCRIPTION:'+icsEscape(e.desc),'STATUS:TENTATIVE','TRANSP:TRANSPARENT','END:VEVENT'));
    lines.push('END:VCALENDAR');download('Musicala-GMMMC-2027-calendario.ics',lines.map(fold).join('\r\n')+'\r\n','text/calendar;charset=utf-8');$('simStatus').textContent='Calendario descargado: fechas tentativas de día completo, con horario por acordar.';
  });
  read();

  // Delegation supports both the page and its presentation view.
  function selectInstrument(root,id){
    const d=window.MUSICALA_INSTRUMENTS.find(x=>x[0]===id);if(!d)return;
    root.querySelectorAll('[data-instrument]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.instrument===id)));
    root.querySelectorAll('[data-zone]').forEach(g=>g.classList.toggle('zone-active',d[2]==='todos'||g.dataset.zone===d[2]));
    root.querySelector('[data-instrument-name]').textContent=d[1];root.querySelector('[data-instrument-desc]').textContent=d[3];root.querySelector('[data-instrument-learn]').textContent=d[4];
    const img=root.querySelector('[data-instrument-image]');img.src='assets/instruments/'+d[0]+'.svg';img.alt='Ilustración de '+d[1];
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-instrument]');if(b)selectInstrument(b.closest('[data-orchestra]'),b.dataset.instrument);});
  document.querySelectorAll('[data-orchestra]').forEach(root=>selectInstrument(root,'violin'));

  const deck=$('presentation');let slide=0,slides=[],returnFocus=null;
  // Move the existing simulator into the deck instead of cloning its forms.
  // Its listeners, field values, excluded dates and events stay on the same node.
  const simulator=$('simulador');
  const simulatorHome=document.createComment('Ubicación del simulador en la propuesta');
  simulator.before(simulatorHome);
  function restoreSimulator(){if(deck.contains(simulator))simulatorHome.after(simulator);}
  let cloneSerial=0;
  function copy(node){
    const clone=node.cloneNode(true),prefix='deck-copy-'+(++cloneSerial)+'-',ids=new Map();
    [clone,...clone.querySelectorAll('[id]')].forEach(x=>{if(x.id){const old=x.id;x.id=prefix+old;ids.set(old,x.id);}});
    [clone,...clone.querySelectorAll('[aria-labelledby],[aria-controls]')].forEach(x=>{for(const attr of ['aria-labelledby','aria-controls'])if(x.hasAttribute(attr))x.setAttribute(attr,x.getAttribute(attr).split(' ').map(id=>ids.get(id)||id).join(' '));});
    clone.querySelectorAll('img').forEach(x=>x.loading='eager');return clone;
  }
  function addPlatformAccess(container){
    function add(target,key){
      if(!target||target.querySelector('[data-platform="'+key+'"]'))return;
      const original=document.querySelector('main [data-platform-callout="'+key+'"]');
      if(original)target.append(copy(original));
    }
    container.querySelectorAll('.routine>div').forEach(n=>add(n,'piano'));
    container.querySelectorAll('.crea-panel[id$="crea-panel-R"] .crea-proof>div').forEach(n=>add(n,'piano'));
    container.querySelectorAll('.management').forEach(row=>{
      const image=row.querySelector('img'),target=row.querySelector(':scope>div');
      add(target,image?.getAttribute('src').includes('informe_consolidado')?'lideres':'docentes');
    });
    const roles=container.querySelectorAll('.hub-roles>article');
    if(roles.length){add(roles[0],'docentes');add(roles[1],'lideres');add(roles[2],'estudiantes');}
  }
  function slideOf(title,...nodes){const container=document.createElement('section');container.className='deck-slide';if(title){const h=document.createElement('h2');h.textContent=title;container.append(h);}nodes.filter(Boolean).forEach(n=>container.append(copy(n)));addPlatformAccess(container);return container;}
  function makeSlides(){
    const builtSlides=[slideOf('',document.querySelector('.hero')),slideOf('Musicala y GMMMC: nuestra experiencia juntos',document.querySelector('.institutional-overview'))];
    builtSlides.push(slideOf('CREA: cuatro pilares para aprender',document.querySelector('.crea-experience')));
    builtSlides.push(slideOf('Cada grupo tiene un punto de partida',document.querySelector('.diagnosis-layout')));
    builtSlides.push(slideOf('Objetivos que orientan el proceso',document.querySelector('.objectives-block')));
    builtSlides.push(slideOf('Formación artística en el GMMMC',document.querySelector('.discipline-grid')));
    builtSlides.push(slideOf('Un ambiente para participar y crear',document.querySelector('.participation-grid'),document.querySelector('.session-experience')));
    builtSlides.push(slideOf('Reconocer lo que se aprende',document.querySelector('.formative-evaluation')));
    builtSlides.push(slideOf('Materiales para todas las áreas',document.querySelector('.materials-scope'),document.querySelector('.area-materials'),document.querySelector('.materials-examples-note')));
    document.querySelectorAll('#fisicos .material-story').forEach(n=>builtSlides.push(slideOf('Recursos institucionales: ejemplos reales',n)));
    builtSlides.push(slideOf('Un respaldo práctico para cada área',document.querySelector('.physical-kit')));
    document.querySelectorAll('#experiencia > .real-grid').forEach(n=>builtSlides.push(slideOf('La clase termina. El aprendizaje puede continuar.',n)));
    builtSlides.push(slideOf('Herramientas para acompañar el proceso',document.querySelector('.hub-roles')));
    document.querySelectorAll('#seguimiento .management').forEach(n=>builtSlides.push(slideOf('Gestión con evidencia real',n)));
    builtSlides.push(slideOf('El proceso no tiene que comenzar de cero',document.querySelector('.continuity-workflow')));
    builtSlides.push(slideOf('Asistencia, ejecución y aprendizaje: lecturas diferentes',document.querySelector('.indicator-grid'),document.querySelector('.indicator-scope')));
    builtSlides.push(slideOf('Música: posible ampliación para GMMMC',document.querySelector('.orchestra-photo'),document.querySelector('.orch-quote')));
    const explorer=copy(document.querySelector('[data-orchestra]'));explorer.querySelector('.explorer-intro').remove();builtSlides.push(slideOf('Cada voz encuentra su lugar',explorer));
    const projection=[...document.querySelectorAll('.projection-grid article')];
    for(let i=0;i<projection.length;i+=3){const grid=document.createElement('div');grid.className='projection-grid';projection.slice(i,i+3).forEach(n=>grid.append(copy(n)));builtSlides.push(slideOf(i===0?'Porrismo: posibles rutas de proyección':'Danza: posibles escenarios de circulación',grid,document.querySelector('.source-note')));}
    builtSlides.push(slideOf('Una experiencia que conecta',document.querySelector('.connected-flow')));
    builtSlides.push(slideOf('Equipo especializado y protocolos de apoyo',document.querySelector('.team-grid')));
    builtSlides.push(slideOf('Una propuesta base con ampliación de gestión',document.querySelector('.scalable-proposal')));
    builtSlides.push(slideOf('Modelo operativo GMMMC 2027 · por confirmar',document.querySelector('.operational-model'),document.querySelector('.roadmap')));
    const simulatorSlide=slideOf('Una inversión que puedes planear');simulatorSlide.classList.add('deck-simulator-slide');
    const simulatorSlot=document.createElement('div');simulatorSlot.dataset.liveSimulator='';simulatorSlide.append(simulatorSlot);builtSlides.push(simulatorSlide);
    builtSlides.push(slideOf('Aprender, crear, practicar y compartir.',document.querySelector('.closing')));
    return builtSlides;
  }
  window.MusicalaPdfSource={
    createSlides:()=>makeSlides(),
    snapshot:()=>({valid,current:{...current,weekdays:[...current.weekdays]},budget:{...budget},dates:[...dates],excluded:candidates.filter(d=>excluded.has(d)),events:events.map(e=>({...e}))})
  };
  function showSlide(){
    restoreSimulator();
    $('deckBody').replaceChildren(slides[slide]);window.MusicalaIcons?.decorate($('deckBody'));$('deckBody').scrollTop=0;
    const simulatorSlot=slides[slide].querySelector('[data-live-simulator]');
    if(simulatorSlot)simulatorSlot.append(simulator);
    deck.querySelector('.deck-hint').textContent=simulatorSlot?'Edita el simulador aquí · usa los botones inferiores para cambiar de diapositiva · Esc para salir':'← → para avanzar · espacio para seguir · Esc para salir';
    $('deckCount').textContent=`${slide+1} / ${slides.length}`;$('deckProgress').max=slides.length;$('deckProgress').value=slide+1;
    $('deckPrev').disabled=slide===0;$('deckNext').disabled=slide===slides.length-1;
  }
  function next(delta){slide=Math.max(0,Math.min(slides.length-1,slide+delta));showSlide();}
  function exitDeck(){if(document.fullscreenElement===deck)document.exitFullscreen().catch(()=>{});restoreSimulator();deck.close();document.body.classList.remove('is-presenting');returnFocus?.focus();}
  $('presentBtn').addEventListener('click',()=>{returnFocus=document.activeElement;slides=makeSlides();slide=0;showSlide();deck.showModal();document.body.classList.add('is-presenting');$('deckBody').focus();});
  $('deckPrev').addEventListener('click',()=>next(-1));$('deckNext').addEventListener('click',()=>next(1));$('deckClose').addEventListener('click',exitDeck);
  deck.addEventListener('cancel',e=>{e.preventDefault();exitDeck();});
  deck.addEventListener('close',()=>{restoreSimulator();document.body.classList.remove('is-presenting');});
  deck.addEventListener('keydown',e=>{if(e.target.closest('#simulador,.crea-experience')||e.target.matches('input,select,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowRight'||(e.code==='Space'&&!e.target.closest('button,summary,a'))){e.preventDefault();next(1);}else if(e.key==='ArrowLeft'){e.preventDefault();next(-1);}});
  $('deckFullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await deck.requestFullscreen();}catch{$('deckFullscreen').textContent='Vista ampliada activa';}});
  deck.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a){e.preventDefault();const target=document.querySelector(a.getAttribute('href'));exitDeck();target?.scrollIntoView({behavior:'smooth'});}});
})();
