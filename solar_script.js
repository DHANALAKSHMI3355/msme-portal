// =====================
// APP INITIALIZATION
// =====================
const steps = [
  { id: 0, label: 'Home', color: 'var(--primary)', icon: 'fa-house' },
  { id: 1, label: 'Land area', color: 'var(--orange)', icon: 'fa-map' },
  { id: 2, label: 'Panel fit + cost', color: 'var(--cyan)', icon: 'fa-solar-panel' },
  { id: 3, label: 'Solar capacity', color: 'var(--yellow)', icon: 'fa-bolt' },
  { id: 4, label: 'Daily generation', color: 'var(--sky)', icon: 'fa-sun' },
  { id: 5, label: 'Monthly generation', color: 'var(--indigo)', icon: 'fa-calendar-week' },
  { id: 6, label: 'Annual generation', color: 'var(--navy)', icon: 'fa-chart-column' },
  { id: 7, label: 'Appliance load', color: 'var(--amber)', icon: 'fa-house-chimney' },
  { id: 8, label: 'Battery bank', color: 'var(--purple)', icon: 'fa-battery-full' },
  { id: 9, label: 'Inverter', color: 'var(--pink)', icon: 'fa-bolt' },
  { id: 10, label: 'Charge controller', color: 'var(--green)', icon: 'fa-sliders' },
  { id: 11, label: 'Project cost', color: 'var(--emerald)', icon: 'fa-wallet' },
  { id: 12, label: 'ROI analysis', color: 'var(--lime)', icon: 'fa-chart-line' },
];

let rowId = 0;
let cashflowChart = null;
let lastStep = 0;
const PANEL_RATE_PER_SQFT = 500;

const roadmapSteps = [
  { title: 'Home', icon: 'fa-house', desc: 'Begin the solar design journey and set up your project.' },
  { title: 'Land Area', icon: 'fa-map', desc: 'Define the usable plot and available array footprint.' },
  { title: 'Panel Estimation', icon: 'fa-solar-panel', desc: 'Estimate panels and layout based on available area.' },
  { title: 'Solar Capacity', icon: 'fa-bolt', desc: 'Size the array capacity using panel wattage.' },
  { title: 'Daily Generation', icon: 'fa-sun', desc: 'Forecast daily energy based on sun hours and losses.' },
  { title: 'Monthly Generation', icon: 'fa-calendar-week', desc: 'Convert daily output into monthly energy totals.' },
  { title: 'Annual Generation', icon: 'fa-chart-column', desc: 'Project year-round energy production and yield.' },
  { title: 'Appliance Load', icon: 'fa-house-chimney', desc: 'Match system output to the building load profile.' },
  { title: 'Battery Bank', icon: 'fa-battery-full', desc: 'Size the storage bank for backup and autonomy.' },
  { title: 'Inverter', icon: 'fa-bolt', desc: 'Choose inverter capacity and safety margin.' },
  { title: 'Charge Controller', icon: 'fa-sliders', desc: 'Select the controller for array current and voltage.' },
  { title: 'Project Cost', icon: 'fa-wallet', desc: 'Aggregate equipment and fixed project costs.' },
  { title: 'ROI & Profit Analysis', icon: 'fa-chart-line', desc: 'Estimate payback, annual ROI, and lifetime profit.' },
];

function initApp() {

    buildStepper();

    buildRoadmap();

    applyStoredTheme();

    bindEvents();

    addRow("LED lamp",5,12,6);

    addRow("Refrigerator",1,150,24);

    goTo(0);

    calcAll();

    showLoader();

}
  applyStoredTheme();
  addRow('LED lamp', 5, 12, 6);
  addRow('Refrigerator', 1, 150, 24);
  goTo(0);
  calcAll();
  function bindEvents() {

    document.addEventListener("click", createRipple);

    const themeSwitch = document.getElementById("themeSwitch");

    if (themeSwitch) {

        themeSwitch.removeEventListener("change", toggleTheme);

        themeSwitch.addEventListener("change", toggleTheme);

    }


}

function buildRoadmap() {
  const roadmapList = document.getElementById('roadmapList');
  if (!roadmapList) return;
  const markup = roadmapSteps.map((item, index) => {
    const side = index % 2 === 0 ? 'right' : 'left';
    return `
      <li class="roadmap-item ${side}" data-step="${index}">
        <div class="roadmap-card-inner">
          <div class="roadmap-label">Module ${index + 1}</div>
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
        <div class="roadmap-pin">
          <span class="roadmap-pin-icon"><i class="fa-solid ${item.icon}"></i></span>
          <span class="roadmap-pin-badge">${index === 0 ? '1' : index + 1}</span>
        </div>
      </li>
    `;
  }).join('');
  document.getElementById('roadmapList').innerHTML = markup;
  updateRoadmapProgress(0);
}

function updateRoadmapProgress(activeStep) {
  const items = document.querySelectorAll('.roadmap-item');
  const path = document.querySelector('.roadmap-path-complete');
  items.forEach((item) => {
    const step = parseInt(item.dataset.step, 10);
    item.classList.toggle('completed', step < activeStep);
    item.classList.toggle('current', step === activeStep);
    item.classList.toggle('upcoming', step > activeStep);
  });
  if (path) {
    const length = path.getTotalLength();
    const progress = activeStep / (roadmapSteps.length - 1);
    path.style.strokeDasharray = length;
    const targetOffset = Math.max(length * (1 - progress), 0);
    path.style.strokeDashoffset = length;
    path.style.stroke = activeStep > 0 ? '#22c55e' : 'url(#roadmapGradient)';
    requestAnimationFrame(() => {
      path.style.strokeDashoffset = targetOffset;
    });
  }
}

function bindEvents() {
  document.addEventListener('click', createRipple);
  document.getElementById('themeSwitch').addEventListener('change', toggleTheme);
}

function showLoader() {
  setTimeout(() => {
    document.getElementById('pageLoader').classList.add('hidden');
  }, 900);
}

// =====================
// THEME / UI HELPERS
// =====================
// =====================
// THEME
// =====================

function applyStoredTheme() {

    const themeSwitch = document.getElementById("themeSwitch");

    const savedTheme = localStorage.getItem("solar-theme") || "light";

    document.body.setAttribute("data-theme", savedTheme);

    if (themeSwitch) {
        themeSwitch.checked = savedTheme === "dark";
    }
}

function toggleTheme() {

    const themeSwitch = document.getElementById("themeSwitch");

    if (!themeSwitch) return;

    const theme = themeSwitch.checked ? "dark" : "light";

    document.body.setAttribute("data-theme", theme);

    localStorage.setItem("solar-theme", theme);

    console.log("Theme:", theme);
}
function createRipple(event) {
  const button = event.target.closest('.btn, .step-btn');
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const circle = document.createElement('span');
  circle.className = 'ripple-effect';
  circle.style.width = circle.style.height = `${Math.max(rect.width, rect.height)}px`;
  circle.style.left = `${event.clientX - rect.left}px`;
  circle.style.top = `${event.clientY - rect.top}px`;
  button.appendChild(circle);
  setTimeout(() => circle.remove(), 650);
}

function updateBreadcrumb(stepId) {
  const label = steps.find((s) => s.id === stepId)?.label || 'Overview';
  document.getElementById('breadcrumbCurrent').textContent = label;
}

function updateProgress(stepId) {
  const value = Math.round((stepId / 12) * 100);
  const progressText = document.getElementById('sidebarProgress');
  const progressFill = document.getElementById('sidebarFill');

  if (progressText) {
    animateNumber(progressText, value, (num) => `${Math.round(num)}%`, 550);
  }
  if (progressFill) {
    progressFill.style.width = `${value}%`;
  }
}

function animateNumber(element, endValue, formatFn, duration = 650) {
  const start = parseFloat(element.dataset.value || 0);
  const startTime = performance.now();
  const from = Number.isFinite(start) ? start : 0;
  const to = Number(endValue) || 0;

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = from + (to - from) * eased;
    element.textContent = formatFn(current);
    element.dataset.value = current;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// =====================
// STEPPER
// =====================
function buildStepper() {
  const ul = document.getElementById('stepper');
  ul.innerHTML = steps.map((s) => `
    <li class="step-item" data-step="${s.id}" data-icon="${s.icon}" style="--dot-color:${s.color};">
      <button class="step-btn" onclick="goTo(${s.id})">
        <span class="step-circle"><i class="fa-solid ${s.icon}"></i></span>
        <span>${s.label}</span>
      </button>
    </li>
  `).join('');
}

function goTo(n) {
  const previousStep = Number(document.querySelector('.step-item.active')?.dataset.step || lastStep);

  document.querySelectorAll('.step-panel').forEach((p) => p.classList.toggle('active', parseInt(p.dataset.step, 10) === n));
  document.querySelectorAll('.step-item').forEach((li) => {
    const s = parseInt(li.dataset.step, 10);
    li.classList.toggle('active', s === n);
    li.classList.toggle('done', s < n);
    li.classList.toggle('upcoming', s > n);
    li.classList.remove('just-completed');
    const icon = li.querySelector('.step-circle i');
    if (icon) {
      const original = li.dataset.icon;
      icon.className = `fa-solid ${s < n ? 'fa-check' : original}`;
    }
  });

  if (n > previousStep && previousStep >= 0) {
    const completedItem = document.querySelector(`.step-item[data-step="${previousStep}"]`);
    if (completedItem) {
      completedItem.classList.add('just-completed');
      setTimeout(() => completedItem.classList.remove('just-completed'), 650);
    }
  }

  lastStep = n;
  document.getElementById('ticker').classList.toggle('hidden', n === 0);
  updateBreadcrumb(n);
  updateProgress(n);
  updateRoadmapProgress(n);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function fmt(n, digits = 1) {
  if (!isFinite(n)) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

function toggleLandMode() {
  const mode = document.querySelector('input[name="landMode"]:checked').value;
  document.getElementById('landDimsFields').classList.toggle('hidden', mode !== 'dims');
  document.getElementById('landAreaFields').classList.toggle('hidden', mode !== 'area');
}

// =====================
// APPLIANCE TABLE
// =====================
function makeRow(name, qty, watts, hours) {
  rowId += 1;
  const tr = document.createElement('tr');
  tr.dataset.id = rowId;
  tr.innerHTML = `
    <td><input type="text" value="${name}" oninput="calcAll()"></td>
    <td><input type="number" value="${qty}" min="0" style="width:60px" oninput="calcAll()"></td>
    <td><input type="number" value="${watts}" min="0" style="width:70px" oninput="calcAll()"></td>
    <td><input type="number" value="${hours}" min="0" step="0.5" style="width:70px" oninput="calcAll()"></td>
    <td class="wh-cell">0</td>
    <td><button class="row-remove" onclick="removeRow(${rowId})" aria-label="Remove appliance">×</button></td>
  `;
  return tr;
}

function addRow(name = 'New appliance', qty = 1, watts = 0, hours = 0) {
  document.getElementById('applianceBody').appendChild(makeRow(name, qty, watts, hours));
  calcAll();
}

function removeRow(id) {
  const el = document.querySelector(`#applianceBody tr[data-id="${id}"]`);
  if (el) el.remove();
  calcAll();
}

function loadExample() {
  document.getElementById('landLength').value = 100;
  document.getElementById('landWidth').value = 50;
  document.getElementById('usablePct').value = 70;
  document.getElementById('panelFootprint').value = 25;
  document.getElementById('panelWatt').value = 550;
  document.getElementById('panelVoc').value = 41.5;
  document.getElementById('panelIsc').value = 14;
  document.getElementById('sunHours').value = 5.5;
  document.getElementById('perfRatio').value = 80;
  document.getElementById('daysPerMonth').value = 30;
  document.getElementById('applianceBody').innerHTML = '';
  addRow('Air conditioner', 1, 2500, 8);
  addRow('Lamps', 5, 60, 12);
  addRow('Refrigerator', 1, 200, 24);
  addRow('Television', 1, 200, 2);
  document.getElementById('lossFactor').value = 1.20;
  document.getElementById('battVoltage').value = '48';
  document.getElementById('battLoss').value = 85;
  document.getElementById('dod').value = 60;
  document.getElementById('autonomy').value = 1;
  document.getElementById('battAh').value = 200;
  document.getElementById('battUnit').value = 'Ah';
  document.getElementById('costPerBatt').value = 15000;
  document.getElementById('inverterPhase').value = 'single';
  updateInverterVoltageOptions();
  document.getElementById('inverterVoltage').value = '400';
  document.getElementById('motorToggle').checked = false;
  document.getElementById('motorWatts').value = 750;
  document.getElementById('ctrlMargin').value = 29;
  document.getElementById('fixedCost').value = 20000;
  document.getElementById('rate').value = 7;
  document.getElementById('lifetime').value = 25;
  goTo(1);
  calcAll();
}

// =====================
// CHART
// =====================
function drawChart(costOfProject, annualSavings, lifetime) {
  const canvas = document.getElementById('cashflowChart');
  if (!canvas) return;

  canvas.innerHTML = '';
  const ctx = canvas.getContext('2d');
  if (cashflowChart) cashflowChart.destroy();

  const labels = [];
  const values = [];
  for (let year = 0; year <= lifetime; year += 1) {
    labels.push(`${year}`);
    values.push(annualSavings * year - costOfProject);
  }

  cashflowChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cumulative cash flow',
        data: values,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        tension: 0.35,
        fill: true,
        pointRadius: 0,
        borderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: 'var(--muted)' } },
        y: { grid: { color: 'rgba(148,163,184,0.2)' }, ticks: { color: 'var(--muted)' } },
      },
    },
  });
}

// =====================
// CALCULATIONS
// =====================
function updateInverterVoltageOptions() {
  const phase = document.getElementById('inverterPhase').value;
  const select = document.getElementById('inverterVoltage');
  const current = String(select.value);
  const options = phase === 'three'
    ? [750, 690, 800]
    : [400, 380, 360];
  const defaultValue = phase === 'three' ? 750 : 400;

  select.innerHTML = options.map((value) => `<option value="${value}">${value} V</option>`).join('');
  select.value = options.some((value) => String(value) === current) ? current : String(defaultValue);
}

function calcAll() {
  toggleLandMode();
  updateInverterVoltageOptions();
  const motorOn = document.getElementById('motorToggle').checked;
  document.getElementById('motorFields').classList.toggle('hidden', !motorOn);

  // STEP 1 — land
  const mode = document.querySelector('input[name="landMode"]:checked').value;
  let totalSqft = 0;
  if (mode === 'dims') {
    const L = parseFloat(document.getElementById('landLength').value) || 0;
    const W = parseFloat(document.getElementById('landWidth').value) || 0;
    totalSqft = L * W;
  } else {
    const val = parseFloat(document.getElementById('landAreaDirect').value) || 0;
    const unit = document.getElementById('landAreaUnit').value;
    if (unit === 'sqft') totalSqft = val;
    else if (unit === 'sqm') totalSqft = val * 10.7639;
    else if (unit === 'acre') totalSqft = val * 43560;
  }
  const usablePct = (parseFloat(document.getElementById('usablePct').value) || 0) / 100;
  const usableArea = totalSqft * usablePct;
  document.getElementById('r_usableArea').textContent = fmt(usableArea, 0);
  document.getElementById('r_totalAreaSub').textContent = fmt(totalSqft, 0) + ' sq ft total plot, ' + Math.round(usablePct * 100) + '% usable';

  // STEP 2 — panel fit + cost
  const currency = document.getElementById('currency').value;
  const panelFootprint = parseFloat(document.getElementById('panelFootprint').value) || 25;
  const numPanels = panelFootprint > 0 ? Math.floor(usableArea / panelFootprint) : 0;
  const costPerPanel = panelFootprint * PANEL_RATE_PER_SQFT;
  const panelCostTotal = numPanels * costPerPanel;
  document.getElementById('r_numPanels').textContent = fmt(numPanels, 0);
  document.getElementById('r_panelSub').textContent = 'using ' + fmt(usableArea, 0) + ' sq ft usable area at ' + panelFootprint + ' sq ft/panel';
  document.getElementById('costPerPanelAuto').value = currency + fmt(costPerPanel, 0);
  document.getElementById('r_panelUnitCost').textContent = currency + fmt(costPerPanel, 0);
  document.getElementById('r_panelCostTotal').textContent = currency + fmt(panelCostTotal, 0);

  // STEP 3 — capacity
  const panelWatt = parseFloat(document.getElementById('panelWatt').value) || 0;
  const panelVoc = parseFloat(document.getElementById('panelVoc').value) || 0;
  const panelIsc = parseFloat(document.getElementById('panelIsc').value) || 0;
  const panelPowerW = panelVoc * panelIsc;
  const panelPowerVA = panelVoc * panelIsc;
  const effectivePanelW = panelWatt > 0 ? panelWatt : panelPowerW;
  const capacityKW = (numPanels * effectivePanelW) / 1000;
  document.getElementById('r_capacity').textContent = fmt(capacityKW, 2);
  document.getElementById('r_capacitySub').textContent = fmt(numPanels, 0) + ' panels × ' + fmt(effectivePanelW, 0) + ' W';
  document.getElementById('r_powerDetails').textContent = 'P = ' + fmt(panelPowerW, 2) + ' W and S = ' + fmt(panelPowerVA, 2) + ' VA per panel';

  // STEP 4 — daily
  const sunHours = parseFloat(document.getElementById('sunHours').value) || 0;
  const perfRatio = (parseFloat(document.getElementById('perfRatio').value) || 0) / 100;
  const dailyKWh = capacityKW * sunHours * perfRatio;
  document.getElementById('r_daily').textContent = fmt(dailyKWh, 1);
  document.getElementById('r_dailySub').textContent = fmt(capacityKW, 2) + ' kW × ' + sunHours + ' sun hrs × ' + Math.round(perfRatio * 100) + '% PR';

  // STEP 5 — monthly
  const daysPerMonth = parseFloat(document.getElementById('daysPerMonth').value) || 30;
  const monthlyKWh = dailyKWh * daysPerMonth;
  document.getElementById('r_monthly').textContent = fmt(monthlyKWh, 0);
  document.getElementById('r_monthlySub').textContent = fmt(dailyKWh, 1) + ' kWh/day × ' + daysPerMonth + ' days';

  // STEP 6 — annual
  const annualKWh = monthlyKWh * 12;
  document.getElementById('r_annual').textContent = fmt(annualKWh, 0);
  document.getElementById('r_annualSub').textContent = fmt(monthlyKWh, 0) + ' kWh/month × 12';

  // STEP 7 — appliance load
  let totalW = 0;
  let totalWh = 0;
  document.querySelectorAll('#applianceBody tr').forEach((tr) => {
    const inputs = tr.querySelectorAll('input');
    const qty = parseFloat(inputs[1].value) || 0;
    const watts = parseFloat(inputs[2].value) || 0;
    const hours = parseFloat(inputs[3].value) || 0;
    const wh = qty * watts * hours;
    totalW += qty * watts;
    totalWh += wh;
    tr.querySelector('.wh-cell').textContent = fmt(wh, 0);
  });
  const lossFactor = parseFloat(document.getElementById('lossFactor').value) || 1;
  const targetWh = totalWh * lossFactor;
  const monthlyLoadWh = targetWh * daysPerMonth;
  const yearlyLoadWh = monthlyLoadWh * 12;
  document.getElementById('r_totalW').textContent = fmt(totalW, 0);
  document.getElementById('r_totalWh').textContent = fmt(totalWh, 0) + ' Wh';
  document.getElementById('r_targetWh').textContent = fmt(targetWh, 0) + ' Wh';
  document.getElementById('r_monthlyLoadWh').textContent = fmt(monthlyLoadWh, 0) + ' Wh';
  document.getElementById('r_yearlyLoadWh').textContent = fmt(yearlyLoadWh, 0) + ' Wh';

  // STEP 8 — battery bank
  const battV = parseFloat(document.getElementById('battVoltage').value) || 12;
  const battLoss = (parseFloat(document.getElementById('battLoss').value) || 85) / 100;
  const dod = (parseFloat(document.getElementById('dod').value) || 60) / 100;
  const autonomy = parseFloat(document.getElementById('autonomy').value) || 1;
  const singleBattAhInput = parseFloat(document.getElementById('battAh').value) || 200;
  const battUnit = document.getElementById('battUnit').value;
  const singleBattAh = battUnit === 'mAh' ? singleBattAhInput / 1000 : singleBattAhInput;
  const denom = battLoss * dod * battV;
  const loadBackupAh = denom > 0 ? (targetWh * autonomy) / denom : 0;
  const dailyGenerationWh = dailyKWh * 1000;
  const excessSolarWh = Math.max(0, dailyGenerationWh - targetWh);
  const excessStorageAh = denom > 0 ? (excessSolarWh * autonomy) / denom : 0;
  const requiredAh = Math.max(loadBackupAh, excessStorageAh);
  const requiredCapacityDisplay = battUnit === 'mAh' ? requiredAh * 1000 : requiredAh;
  const loadBackupDisplay = battUnit === 'mAh' ? loadBackupAh * 1000 : loadBackupAh;
  const excessStorageDisplay = battUnit === 'mAh' ? excessStorageAh * 1000 : excessStorageAh;
  const capacityUnitLabel = battUnit === 'mAh' ? 'mAh' : 'Ah';
  const seriesBatt = battV > 0 ? Math.ceil(battV / 12) : 0;
  const parallelStrings = singleBattAh > 0 ? Math.ceil(requiredAh / singleBattAh) : 0;
  const totalBatt = seriesBatt * parallelStrings;
  const battCostTotal = 60000;
  document.getElementById('r_battAh').textContent = fmt(requiredCapacityDisplay, 0);
  document.getElementById('r_battCapacityUnit').textContent = capacityUnitLabel + ' bank capacity';
  document.getElementById('r_series').textContent = seriesBatt;
  document.getElementById('r_parallel').textContent = parallelStrings;
  document.getElementById('r_totalBatt').textContent = totalBatt;
  document.getElementById('r_battCost').textContent = currency + fmt(battCostTotal, 0);
  document.getElementById('r_excessEnergy').textContent = fmt(excessSolarWh, 0) + ' Wh';
  document.getElementById('r_storageTarget').textContent = fmt(requiredCapacityDisplay, 0) + ' ' + capacityUnitLabel;
  document.getElementById('r_battNote').textContent = 'Load backup: ' + fmt(loadBackupDisplay, 0) + ' ' + capacityUnitLabel + ' · Surplus storage: ' + fmt(excessStorageDisplay, 0) + ' ' + capacityUnitLabel;

  // STEP 9 — inverter (intelligent estimation from appliance load + battery bank data)
  const phase = document.getElementById('inverterPhase').value;
  const isThreePhase = phase === 'three';
  // Estimated sizing margin / efficiency / cost per kW are derived automatically from phase type
  const marginPct = isThreePhase ? 25 : 20;
  const effPct = isThreePhase ? 98 : 97;
  const costPerKW = isThreePhase ? 14000 : 17000;
  const margin = 1 + marginPct / 100;
  const eff = effPct / 100;

  const motorWatts = motorOn ? (parseFloat(document.getElementById('motorWatts').value) || 0) : 0;
  // Inverter rating is based on the Required Load Demand (connected load, safety-margin aware)
  const connectedLoadW = Math.max(totalW, targetWh / 24, 1000);
  // Motor/compressor inrush: standard practice is ~3x running watts, applied only while the box is checked
  const motorBonusW = motorOn ? (motorWatts > 0 ? motorWatts * 3 : 750) : 0;
  const inverterW = (connectedLoadW * margin) + motorBonusW;
  const inverterKW = inverterW / 1000;

  const selectedVoltage = parseFloat(document.getElementById('inverterVoltage').value) || (isThreePhase ? 750 : 400);
  const inputEnergyWh = eff > 0 ? targetWh / eff : 0;

  // Calculated current rating (A)
  const currentRatingA = isThreePhase
    ? inverterW / (Math.sqrt(3) * 415 * 0.95 * 0.98)
    : inverterW / (230 * 0.95 * 0.97);

  // Total estimated inverter cost, auto-populated from inverter rating
  const totalInverterCost = inverterKW * costPerKW;
  const totalInverterCostRounded = Math.round(totalInverterCost);

  document.getElementById('r_inverter').textContent = fmt(inverterKW, 2);
  document.getElementById('r_invCurrent').textContent = fmt(currentRatingA, 1) + ' A';
  document.getElementById('r_invMarginDisplay').textContent = marginPct + '%';
  document.getElementById('r_invEffDisplay').textContent = effPct + '%';
  document.getElementById('r_invCostTotal').textContent = currency + fmt(totalInverterCostRounded, 0);
  document.getElementById('r_inputEnergy').textContent = fmt(inputEnergyWh / 1000, 2) + ' kWh input energy required per day';
  document.getElementById('r_inverterVoltageLabel').textContent = 'Selected inverter input voltage: ' + fmt(selectedVoltage, 0) + ' V (' + (isThreePhase ? '3-phase' : 'single-phase') + ')';

  // STEP 10 — charge controller
  const ctrlMargin = (parseFloat(document.getElementById('ctrlMargin').value) || 29) / 100;
  const panelSeries = panelVoc > 0 ? Math.max(1, Math.round(battV / panelVoc)) : 1;
  const panelParallel = panelSeries > 0 ? Math.ceil(numPanels / panelSeries) : 0;
  const arrayV = panelSeries * panelVoc;
  const arrayA = panelParallel * panelIsc;
  const ctrlRating = arrayA * (1 + ctrlMargin);
  // Charge controller cost: auto-computed from array capacity (up to & incl. 6 kW = 18,000; above 6 kW = 30,000)
  const controllerCost = capacityKW <= 6 ? 18000 : 30000;
  document.getElementById('r_ctrl').textContent = fmt(ctrlRating, 1);
  document.getElementById('r_arrayV').textContent = fmt(arrayV, 0) + ' V';
  document.getElementById('r_arrayA').textContent = fmt(arrayA, 1) + ' A';
  document.getElementById('r_seriesParallel').textContent = panelSeries + ' / ' + panelParallel;
  document.getElementById('r_ctrlCost').textContent = currency + fmt(controllerCost, 0);

  // STEP 11 — project cost
  const fixedCost = parseFloat(document.getElementById('fixedCost').value) || 0;
  const panelCostForProject = Math.round(panelCostTotal);
  const batteryCostForProject = Math.round(battCostTotal);
  const inverterCostForProject = totalInverterCostRounded;
  const controllerCostForProject = Math.round(controllerCost);
  const fixedCostForProject = Math.round(fixedCost);
  const backupEnergyCost = batteryCostForProject + inverterCostForProject;
  const projectCost = panelCostForProject + backupEnergyCost + controllerCostForProject + fixedCostForProject;
  document.getElementById('r_costCurrency').textContent = currency;
  document.getElementById('r_cost').textContent = fmt(projectCost, 0);
  document.getElementById('r_costPanels').textContent = currency + fmt(panelCostForProject, 0);
  document.getElementById('r_costBackup').textContent = currency + fmt(backupEnergyCost, 0);
  document.getElementById('r_costCtrl').textContent = currency + fmt(controllerCostForProject, 0);
  document.getElementById('r_costFixed').textContent = currency + fmt(fixedCostForProject, 0);

  // STEP 12 — ROI
  const rate = parseFloat(document.getElementById('rate').value) || 0;
  const lifetime = parseFloat(document.getElementById('lifetime').value) || 25;
  const annualSavings = annualKWh * rate;
  const paybackYears = annualSavings > 0 ? projectCost / annualSavings : Infinity;
  const roiPct = projectCost > 0 ? (annualSavings / projectCost) * 100 : 0;
  const lifetimeProfit = annualSavings * lifetime - projectCost;
  document.getElementById('r_payback').textContent = isFinite(paybackYears) ? fmt(paybackYears, 1) : '—';
  document.getElementById('r_annualSavings').textContent = currency + fmt(annualSavings, 0);
  document.getElementById('r_roiPct').textContent = fmt(roiPct, 1) + '%';
  document.getElementById('r_lifetimeProfit').textContent = currency + fmt(lifetimeProfit, 0);

  drawChart(projectCost, annualSavings, lifetime);

  // TICKER
  document.getElementById('tk_panels').textContent = fmt(numPanels, 0);
  document.getElementById('tk_capacity').textContent = fmt(capacityKW, 1) + ' kW';
  document.getElementById('tk_annual').textContent = fmt(annualKWh, 0) + ' kWh';
  document.getElementById('tk_batt').textContent = fmt(requiredCapacityDisplay, 0) + ' ' + capacityUnitLabel;
  document.getElementById('tk_inv').textContent = fmt(inverterW / 1000, 2) + ' kW';
  document.getElementById('tk_cost').textContent = currency + fmt(projectCost, 0);
  document.getElementById('tk_payback').textContent = isFinite(paybackYears) ? fmt(paybackYears, 1) + 'y' : '—';

  // Removed summary cards from the Home page; skip animation on deleted nodes.
}

initApp();
window.addEventListener("DOMContentLoaded",()=>{

    applyStoredTheme();

});