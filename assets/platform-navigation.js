/* Keep the source view where the visitor left it when returning from an app. */
(() => {
 let pending=null;
 document.addEventListener('click',event=>{
  const link=event.target.closest('a.platform-button[target="_blank"]');
  if(!link||event.defaultPrevented||event.button!==0)return;
  const body=document.getElementById('deckBody');
  pending={x:scrollX,y:scrollY,deckTop:body.scrollTop,deckLeft:body.scrollLeft,inDeck:document.getElementById('presentation').open};
 });
 function restore(){
  if(!pending)return;
  const position=pending;pending=null;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   window.scrollTo({left:position.x,top:position.y,behavior:'instant'});
   if(position.inDeck){const body=document.getElementById('deckBody');body.scrollTo({left:position.deckLeft,top:position.deckTop,behavior:'instant'});}
  }));
 }
 window.addEventListener('focus',restore);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)restore();});
 window.addEventListener('pageshow',restore);
 // Explicit scrolling on the source page supersedes an abandoned popup snapshot.
 document.addEventListener('pointerdown',event=>{if(!event.target.closest('.platform-button'))pending=null;});
 document.addEventListener('keydown',event=>{if(['PageDown','PageUp','Home','End','Escape'].includes(event.key))pending=null;});
})();
