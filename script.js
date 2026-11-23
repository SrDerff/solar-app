const nav=document.querySelector('.site-nav');const menuToggle=document.querySelector('.menu-toggle');const toast=document.querySelector('.toast');const modal=document.querySelector('.video-modal');
menuToggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('.site-nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('.site-nav a').forEach(item=>item.classList.remove('active'));link.classList.add('active');nav.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false')}));
document.querySelector('[data-video]')?.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false')});
document.querySelector('[data-close]')?.addEventListener('click',closeModal);modal?.addEventListener('click',event=>{if(event.target===modal)closeModal()});
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.querySelector('.pill-button.small')?.addEventListener('click',()=>{toast.textContent='Pre-registro: pronto podrás dejar tus datos.';toast.classList.add('show');window.setTimeout(()=>toast.classList.remove('show'),2600)});

const demoContent = document.querySelector('#demoContent');
const demoViews = {
  monitoreo: '<div class="demo-stat-grid"><div class="demo-stat"><small>Estado térmico vigente</small><strong>Preventivo</strong><span>Hidrátate y busca sombra</span></div><div class="demo-stat"><small>Condiciones ambientales</small><strong>31 °C</strong><span>66% HR · UV 8 · Sensación 34 °C</span></div><div class="demo-stat"><small>Lecturas Solar Band</small><strong>88 lpm</strong><span>36.9 °C corporal · Señal verificada</span></div></div>',
  alertas: '<div class="demo-alert"><div><strong>Riesgo térmico elevado detectado</strong><span>Detén el esfuerzo físico, busca sombra fresca e hidrátate de inmediato.</span></div><b style="color:#ff9393">PRIORIDAD ALTA</b></div><div class="demo-alert" style="margin-top:12px;border-left-color:#6ee7a0;background:#0d1611"><div><strong>Recordatorio preventivo de hidratación</strong><span>Has acumulado más de 45 minutos de exposición solar activa.</span></div><b style="color:#6ee7a0">PENDIENTE</b></div>',
  historial: '<table class="demo-history"><thead><tr><th>Sesión</th><th>Duración</th><th>Pico</th><th>Estado</th></tr></thead><tbody><tr><td>Carrera continua en parque</td><td>01h 12m</td><td>32 °C · 142 lpm</td><td style="color:#ffc267">Preventivo</td></tr><tr><td>Trabajo de campo exterior</td><td>02h 45m</td><td>35 °C · 148 lpm</td><td style="color:#ff9393">Riesgo elevado</td></tr></tbody></table>'
};
function renderDemo(key='monitoreo'){ if(demoContent) demoContent.innerHTML=demoViews[key]; }
document.querySelectorAll('.demo-tab').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.demo-tab').forEach(item=>item.classList.remove('active'));button.classList.add('active');renderDemo(button.dataset.demo)}));
renderDemo();

document.querySelector('#contactForm')?.addEventListener('submit',(event)=>{event.preventDefault();const name=new FormData(event.currentTarget).get('name');const feedback=document.querySelector('#contactFeedback');feedback.textContent=`Gracias, ${name}. Registramos tu consulta y te contactaremos pronto.`;event.currentTarget.reset()});

const contactIntro = document.querySelector('.contact-section>div');
if(contactIntro && !contactIntro.querySelector('.contact-benefits')) contactIntro.insertAdjacentHTML('beforeend','<div class="contact-benefits"><article><span>◎</span><h3>Instituciones</h3><p>Colegios, universidades y empresas.</p></article><article><span>↗</span><h3>Equipos deportivos</h3><p>Monitoreo y prevención para entrenamientos.</p></article><article><span>＋</span><h3>Jornadas laborales</h3><p>Seguridad y bienestar en el trabajo.</p></article></div>');
