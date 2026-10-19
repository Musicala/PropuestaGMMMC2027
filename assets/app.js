document.getElementById('printBtn').addEventListener('click',()=>window.print());
const dialog=document.getElementById('imageDialog');
document.querySelectorAll('.zoom').forEach(b=>b.addEventListener('click',()=>{const src=b.closest('figure').querySelector('img');dialog.querySelector('img').src=src.src;dialog.querySelector('img').alt=src.alt;dialog.querySelector('p').textContent=src.alt;dialog.showModal();}));
document.getElementById('closeDialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
