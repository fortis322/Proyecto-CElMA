/* Sonidos sintetizados: breves, de bajo volumen y bajo control del visitante. */
(() => {
 'use strict';
 const KEY='celma-interaction-sound-v1';let enabled=true,context=null,lastTone=0;
 try{enabled=localStorage.getItem(KEY)!=='off';}catch{}
 const toggle=document.createElement('button');toggle.type='button';toggle.id='celma-sound-toggle';toggle.className='sound-toggle';toggle.setAttribute('aria-label','Activar o silenciar sonidos de interacción');
 const nav=document.querySelector('.lab-header .glass-nav');nav?.before(toggle);
 function render(){toggle.textContent=enabled?'♪ Sonidos activos':'♪ Sonidos apagados';toggle.setAttribute('aria-pressed',String(enabled));toggle.title=enabled?'Silenciar sonidos de interacción':'Activar sonidos de interacción';}
 function tone(kind='tap'){
  if(!enabled||document.hidden)return;const now=performance.now();if(now-lastTone<65)return;lastTone=now;
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   context=context||new Audio();if(context.state==='suspended')context.resume().catch(()=>{});if(context.state==='closed')return;
   const time=context.currentTime,notes=kind==='navigate'?[510,740]:kind==='success'?[620,830,1040]:kind==='dial'?[410,560]:[640];
   for(const [i,f]of notes.entries()){
    const osc=context.createOscillator(),gain=context.createGain(),at=time+i*.035;osc.type='sine';osc.frequency.setValueAtTime(f,at);osc.frequency.exponentialRampToValueAtTime(f*.84,at+.065);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.027,at+.007);gain.gain.exponentialRampToValueAtTime(.0001,at+.08);osc.connect(gain);gain.connect(context.destination);osc.start(at);osc.stop(at+.09);
   }
  }catch{/* La navegación sigue disponible si el audio está restringido. */}
 }
 toggle.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem(KEY,enabled?'on':'off');}catch{}render();if(enabled)tone('navigate');});
 document.addEventListener('click',event=>{const control=event.target.closest('button,a,input[type=checkbox]');if(!control||control===toggle||control.disabled||control.closest('[hidden]'))return;const dial=control.closest('.relation-dial,.relation-carousel,.relation-families');tone(dial?'dial':control.closest('#cell-nav')?'navigate':control.id==='sandbox-combine'?'success':'tap');});
 document.addEventListener('change',event=>{if(event.target.matches('input[type=range],select'))tone('tap');});
 document.addEventListener('celma:cell-selection',()=>{if(context)tone('tap');});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)context?.suspend().catch(()=>{});});
 window.CelmaAudio={play:tone,isEnabled:()=>enabled};render();
})();
