/* Pedagogical demonstrations: scoped to each copy in the same proposal. */
(() => {
 'use strict';
 function activateCrea(root,letter,focus=false){
  root.querySelectorAll('.crea-tab').forEach(tab=>{const selected=tab.dataset.crea===letter;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
  root.querySelectorAll('.crea-panel').forEach(panel=>panel.hidden=!panel.id.endsWith('crea-panel-'+letter));
 }
 document.addEventListener('click',e=>{const tab=e.target.closest('.crea-tab');if(tab)activateCrea(tab.closest('.crea-experience'),tab.dataset.crea);});
 document.addEventListener('keydown',e=>{
  const tab=e.target.closest('.crea-tab');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();e.stopPropagation();const root=tab.closest('.crea-experience'),tabs=[...root.querySelectorAll('.crea-tab')];let i=tabs.indexOf(tab);
  if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else i=(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  activateCrea(root,tabs[i].dataset.crea,true);
 });
 const steps=[
  ['Consultar la última bitácora.','El docente de apoyo revisa el objetivo trabajado, las actividades y el siguiente paso del grupo.',['Objetivo de ejemplo: coordinación y secuencias rítmicas.','Recurso de apoyo: guía de práctica.','Pendiente de ejemplo: consolidar la secuencia en equipo.']],
  ['Preparar un relevo con contexto.','La planeación, los materiales y las novedades permiten preparar la siguiente sesión sin reiniciar el proceso.',['Revisar el objetivo y el avance registrado.','Preparar la guía y una actividad adecuada al grupo.','Confirmar programación y novedades con el responsable acordado.']],
  ['Retomar, acompañar y registrar.','El docente continúa desde lo trabajado, observa cómo responde el grupo y documenta el nuevo avance.',['Retomar la secuencia y ajustar el nivel de dificultad.','Dar retroalimentación y reconocer avances.','Registrar lo realizado y el próximo paso en la bitácora.']]
 ];
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-relevo]');if(!b)return;const root=b.closest('.continuity-demo'),[title,copy,items]=steps[Number(b.dataset.relevo)];
  root.querySelectorAll('[data-relevo]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  root.querySelector('[data-relevo-title]').textContent=title;root.querySelector('[data-relevo-copy]').textContent=copy;
  const list=root.querySelector('[data-relevo-list]');list.replaceChildren(...items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 });
})();
