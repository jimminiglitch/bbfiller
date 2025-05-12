// public/js/gallery-momentum.js
let pos=0, vel=0;
const imgs = document.querySelectorAll('#gallery img');
// pointer down
imgContainer.addEventListener('pointerdown', e=>{
  startX = e.clientX;
  vel=0;
});
// pointer move
imgContainer.addEventListener('pointermove', e=>{
  vel = e.clientX - prevX;
  pos += vel;
  updateGallery(pos);
  prevX = e.clientX;
});
// pointer up
imgContainer.addEventListener('pointerup', ()=>{
  requestAnimationFrame(function decay(){
    vel *= 0.95;
    pos += vel;
    updateGallery(pos);
    if(Math.abs(vel)>0.5) requestAnimationFrame(decay);
  });
});