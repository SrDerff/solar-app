const dashboardState = () => SolarState.load();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let sessionTimer;

function riskResult(state = dashboardState()) { return SolarState.evaluateThermalRisk(state); }
function riskStyle(code) { return code === 'high' ? 'high' : code === 'normal' ? 'normal' : 'preventive'; }
function formatClock(seconds) { return formatDuration(seconds || 0); }

function syncShell() {
  const state = dashboardState();
  const name = (localStorage.getItem('solarUserName') || state.user.name).split(' ')[0];
  $('#topUserName').textContent = name; $('#welcomeName').textContent = name; $('#topUserAvatar').textContent = name[0];
  $('#sideConnection').textContent = state.wearable.connected ? '● En línea' : '● Sin señal';
  $('#sideConnection').style.color = state.wearable.connected ? '#7ee5aa' : '#ff8989';
  $('#sideDeviceMeta').textContent = `Batería ${state.wearable.battery}% · ${state.wearable.dataFresh ? 'Datos vigentes' : 'Datos antiguos'}`;
  const risk = riskResult(state); const hero = $('#statusHero');
  hero.className = `status-hero ${riskStyle(risk.code)}`; $('#riskTitle').textContent = risk.level; $('#riskAction').textContent = risk.action;
  $('#metricTemp').textContent = `${state.environment.tempC}°`; $('#metricEnv').textContent = `Sensación ${state.environment.feelsLikeC}° · Humedad ${state.environment.humidity}%`;
  $('#metricHr').innerHTML = `${state.physiology.heartRate} <em>lpm</em>`; $('#metricBody').textContent = `${state.physiology.bodyTempEst}°`;
  $('#metricExposure').textContent = `${Math.floor(state.physiology.exposureMinutesToday / 60)}h ${state.physiology.exposureMinutesToday % 60}m`;
  $('#quickSessionStatus').textContent = state.session.active ? (state.session.paused ? 'En pausa' : 'Sesión en curso') : 'En espera'; $('#quickSessionTimer').textContent = formatClock(state.session.elapsedSeconds);
  $('#quickSessionButton').textContent = state.session.active ? (state.session.paused ? '▶ Reanudar sesión' : 'Ⅱ Pausar sesión') : '▶ Iniciar sesión';
  $('#alertCount').textContent = state.alerts.filter(item => item.status === 'pending').length;
}

function switchView(view) {
  $$('.dashboard-nav').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  $$('.dashboard-view').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === view));
  history.replaceState(null, '', `#${view}`); syncShell();
  if (view === 'alertas') renderAlerts(); if (view === 'historial') renderHistory(); if (view === 'monitoreo') renderMonitor(); if (view === 'wearable') renderWearable(); if (view === 'perfil') renderProfile();
}

$$('.dashboard-nav').forEach(button => button.addEventListener('click', () => { switchView(button.dataset.view); $('#dashboardSidebar').classList.remove('open'); $('#dashboardMenu').setAttribute('aria-expanded','false'); }));
$('#dashboardMenu').addEventListener('click', () => $('#dashboardSidebar').classList.toggle('open'));
$('#syncButton').addEventListener('click', () => { const state = dashboardState(); state.wearable.dataFresh = true; state.wearable.lastSyncTimestamp = Date.now(); SolarState.save(state); $('#topSync').textContent = 'Sincronizado hace instantes'; syncShell(); });
$('#hydrateButton').addEventListener('click', () => { const state = dashboardState(); state.physiology.exposureMinutesToday = Math.max(0, state.physiology.exposureMinutesToday - 5); SolarState.save(state); $('#riskAction').textContent = 'Hidratación registrada. Continúa atento a tu ritmo y al entorno.'; syncShell(); });

function renderMonitor() { const state = dashboardState(); $('#tempRange').value = state.environment.tempC; $('#humRange').value = state.environment.humidity; $('#hrRange').value = state.physiology.heartRate; $('#bodyRange').value = state.physiology.bodyTempEst; updateMonitor(); }
function updateMonitor() { const state = dashboardState(); const temp = Number($('#tempRange').value); const hum = Number($('#humRange').value); const hr = Number($('#hrRange').value); const body = Number($('#bodyRange').value); $('#tempValue').textContent = `${temp} °C`; $('#humValue').textContent = `${hum}%`; $('#hrValue').textContent = `${hr} lpm`; $('#bodyValue').textContent = `${body.toFixed(1)} °C`; state.environment.tempC = temp; state.environment.humidity = hum; state.physiology.heartRate = hr; state.physiology.bodyTempEst = body; state.environment.feelsLikeC = Math.round(temp + (hum - 50) * .08); SolarState.save(state); const risk = riskResult(state); $('#evaluationRisk').textContent = risk.level; $('#evaluationRisk').style.color = risk.color; $('#evaluationAction').textContent = risk.action; $('#evaluationReason').textContent = risk.reason; syncShell(); }
['tempRange','humRange','hrRange','bodyRange'].forEach(id => $(`#${id}`).addEventListener('input', updateMonitor));
$('#staleButton').addEventListener('click', () => { const state = dashboardState(); state.wearable.dataFresh = false; SolarState.save(state); renderMonitor(); });

function renderAlerts() { const list = $('#alertsList'); const state = dashboardState(); list.innerHTML = state.alerts.map(alert => `<article class="alert-row ${alert.priority === 'high' ? 'high' : ''} ${alert.status === 'acknowledged' ? 'ack' : ''}"><div><small>${alert.category} · ${alert.time}</small><strong>${alert.title}</strong><p>${alert.summary}</p></div><button class="${alert.status === 'pending' ? 'glow-button' : 'ghost-button'}" data-alert="${alert.id}" ${alert.status === 'acknowledged' ? 'disabled' : ''}>${alert.status === 'pending' ? 'Atender' : 'Atendida'}</button></article>`).join(''); $$('[data-alert]').forEach(button => button.addEventListener('click', () => { const st = dashboardState(); const item = st.alerts.find(alert => alert.id === button.dataset.alert); if (item) item.status = 'acknowledged'; SolarState.save(st); renderAlerts(); syncShell(); })); }
$('#readAllButton').addEventListener('click', () => { const state = dashboardState(); state.alerts.forEach(item => item.status = 'acknowledged'); SolarState.save(state); renderAlerts(); syncShell(); });
$('#newAlertButton').addEventListener('click', () => { const state = dashboardState(); state.alerts.unshift({ id: `ALT-${Date.now()}`, priority: 'high', category: 'Simulación', title: 'Aviso automático de exposición', summary: 'Se detectó un aumento sostenido de temperatura y frecuencia cardíaca.', recommendation: 'Busca sombra, hidrátate y confirma la acción.', time: 'Ahora', status: 'pending', autoGenerated: true }); SolarState.save(state); renderAlerts(); syncShell(); });

$$('[data-action]').forEach(button => button.addEventListener('click', () => { $('#actionLog').textContent = `${button.dataset.action} · ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`; }));
$$('[data-pattern]').forEach(button => button.addEventListener('click', () => { $('#patternMessage').textContent = button.dataset.pattern === 'high' ? 'Patrón de riesgo enviado a Solar Band: vibración larga + aviso urgente.' : 'Patrón preventivo enviado a Solar Band: doble vibración + luz ámbar.'; }));

function renderHistory() { $('#historyTable').innerHTML = dashboardState().sessionsHistory.map(item => `<tr><td>${item.date}<br /><small>${item.activity}</small></td><td>${item.duration}</td><td>${item.peakTempEnv} · ${item.peakHR}</td><td>${item.maxRisk}</td></tr>`).join(''); }
function renderWearable() { const state = dashboardState(); $('#wearableConnection').textContent = state.wearable.connected ? `Conectado · ${state.wearable.model} · ${state.wearable.firmware}` : 'Sin conexión · sincronización pausada'; $('#batteryValue').textContent = `${state.wearable.battery}%`; $('#batteryBar').style.width = `${state.wearable.battery}%`; $('#lastSync').textContent = state.wearable.dataFresh ? 'Hace instantes' : 'Datos antiguos'; }
$('#reconnectButton').addEventListener('click', () => { const state = dashboardState(); state.wearable.connected = true; state.wearable.dataFresh = true; state.wearable.lastSyncTimestamp = Date.now(); SolarState.save(state); renderWearable(); syncShell(); });
$('#disconnectButton').addEventListener('click', () => { const state = dashboardState(); state.wearable.connected = false; state.wearable.dataFresh = false; SolarState.save(state); renderWearable(); syncShell(); });

function updateSessionButtons() { const state = dashboardState(); $('#pauseSession').disabled = !state.session.active; $('#stopSession').disabled = !state.session.active; $('#startSession').disabled = state.session.active; $('#activeTime').textContent = formatClock(state.session.elapsedSeconds); $('#pauseTime').textContent = formatClock(state.session.pauseSeconds); $('#noReadingTime').textContent = formatClock(state.session.noReadingSeconds); $('#quickSessionTimer').textContent = formatClock(state.session.elapsedSeconds); }
function startSession() { const state = dashboardState(); state.session.active = true; state.session.paused = false; state.session.startedAt = Date.now(); SolarState.save(state); updateSessionButtons(); syncShell(); }
function togglePause() { const state = dashboardState(); if (!state.session.active) return; state.session.paused = !state.session.paused; SolarState.save(state); updateSessionButtons(); syncShell(); }
function stopSession() { const state = dashboardState(); state.session.active = false; state.session.paused = false; state.sessionsHistory.unshift({ id: `SES-${Date.now()}`, date: 'Ahora', activity: $('#sessionContext').value, duration: formatClock(state.session.elapsedSeconds), avgTempEnv: `${state.environment.tempC} °C`, peakTempEnv: `${state.environment.tempC} °C`, peakBodyEst: `${state.physiology.bodyTempEst} °C`, peakHR: `${state.physiology.heartRate} lpm`, maxRisk: riskResult(state).level, interrupted: false }); SolarState.save(state); $('#sessionSummary').textContent = `Sesión finalizada: ${formatClock(state.session.elapsedSeconds)} · ${riskResult(state).level}.`; updateSessionButtons(); syncShell(); }
$('#startSession').addEventListener('click', startSession); $('#pauseSession').addEventListener('click', togglePause); $('#stopSession').addEventListener('click', stopSession); $('#quickSessionButton').addEventListener('click', () => dashboardState().session.active ? togglePause() : startSession());
sessionTimer = window.setInterval(() => { const state = dashboardState(); if (state.session.active && !state.session.paused) { state.session.elapsedSeconds = (state.session.elapsedSeconds || 0) + 1; SolarState.save(state); updateSessionButtons(); } }, 1000);

function renderProfile() { const user = dashboardState().user; $('#profileName').value = user.name; $('#profileEmail').value = user.email; $('#profileAge').value = user.age; $('#profileWeight').value = user.weight; $('#profileSegment').value = user.segment; $('#autoAlerts').checked = dashboardState().preferences.autoAlerts; }
$('#profileForm').addEventListener('submit', event => { event.preventDefault(); const state = dashboardState(); state.user.name = $('#profileName').value; state.user.email = $('#profileEmail').value; state.user.age = Number($('#profileAge').value); state.user.weight = Number($('#profileWeight').value); state.user.segment = $('#profileSegment').value; state.preferences.autoAlerts = $('#autoAlerts').checked; SolarState.save(state); $('#profileFeedback').textContent = 'Preferencias actualizadas correctamente.'; syncShell(); });

syncShell(); renderHistory(); updateSessionButtons();
const initialView = location.hash.replace('#',''); if (initialView && $(`[data-panel="${initialView}"]`)) switchView(initialView);
