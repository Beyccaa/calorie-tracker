let state = {
  theme: 'light',
  dailyCalorieTarget: 2000,
  macroGoals: { protein: 150, carbs: 225, fat: 67 },
  waterGoal: 2000,
  activityLevel: 1.375,
  bodyWeight: null,
  waterIntakes: {},
  meals: [],
  exercises: [],
  dailyNotes: {}
};

const STORAGE_KEY = 'caltrack_state';
const TODAY_STR = getLocalDateString(new Date());
let activeCategoryFilter = 'all';

function getLocalDateString(dateObj) {
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
}

function generateMockData() {
  const today = new Date();
  const mockMeals = [
    { name: 'Oatmeal with Blueberries', calories: 350, protein: 12, carbs: 55, fat: 6, category: 'breakfast' },
    { name: 'Grilled Chicken Breast', calories: 400, protein: 42, carbs: 2, fat: 8, category: 'lunch' },
    { name: 'Brown Rice & Broccoli', calories: 250, protein: 6, carbs: 48, fat: 2, category: 'lunch' },
    { name: 'Salmon & Asparagus', calories: 550, protein: 38, carbs: 8, fat: 24, category: 'dinner' },
    { name: 'Protein Shake', calories: 200, protein: 25, carbs: 10, fat: 3, category: 'snack' },
    { name: 'Mixed Almonds', calories: 180, protein: 6, carbs: 6, fat: 15, category: 'snack' },
    { name: 'Greek Yogurt with Honey', calories: 220, protein: 15, carbs: 20, fat: 4, category: 'breakfast' },
    { name: 'Turkey Wrap', calories: 450, protein: 28, carbs: 38, fat: 12, category: 'lunch' },
    { name: 'Beef Stir Fry', calories: 600, protein: 35, carbs: 45, fat: 20, category: 'dinner' },
    { name: 'Apple with Peanut Butter', calories: 240, protein: 7, carbs: 25, fat: 14, category: 'snack' }
  ];

  const mockExercises = [
    { name: 'Outdoor Run', duration: 30, caloriesBurned: 320 },
    { name: 'Strength Training', duration: 45, caloriesBurned: 240 },
    { name: 'Cycling', duration: 20, caloriesBurned: 180 },
    { name: 'Yoga', duration: 40, caloriesBurned: 120 }
  ];

  for (let i = 6; i >= 1; i--) {
    const d = new Date(); d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);

    const mealsCount = 2 + Math.floor(Math.random() * 2);
    for (let m = 0; m < mealsCount; m++) {
      const template = mockMeals[Math.floor(Math.random() * mockMeals.length)];
      state.meals.push({
        id: `mock-meal-${dateStr}-${m}`,
        name: template.name,
        category: template.category,
        calories: template.calories + Math.floor((Math.random() * 60) - 30),
        protein: template.protein,
        carbs: template.carbs,
        fat: template.fat,
        date: dateStr
      });
    }

    if (Math.random() > 0.3) {
      const template = mockExercises[Math.floor(Math.random() * mockExercises.length)];
      state.exercises.push({
        id: `mock-ex-${dateStr}`,
        name: template.name,
        duration: template.duration,
        caloriesBurned: template.caloriesBurned + Math.floor((Math.random() * 40) - 20),
        date: dateStr
      });
    }

    state.waterIntakes[dateStr] = 1000 + (Math.floor(Math.random() * 5) * 250);
  }

  state.meals.push(
    { id: 'today-meal-1', name: 'Avocado Toast & Poached Eggs', category: 'breakfast', calories: 420, protein: 18, carbs: 34, fat: 20, date: TODAY_STR },
    { id: 'today-meal-2', name: 'Teriyaki Chicken Bowls', category: 'lunch', calories: 580, protein: 40, carbs: 65, fat: 12, date: TODAY_STR }
  );
  state.exercises.push({ id: 'today-ex-1', name: 'Power Walk', duration: 25, caloriesBurned: 150, date: TODAY_STR });
  state.waterIntakes[TODAY_STR] = 750;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      if (!state.waterIntakes) state.waterIntakes = {};
      if (!state.meals) state.meals = [];
      if (!state.exercises) state.exercises = [];
      if (!state.dailyNotes) state.dailyNotes = {};
      if (!state.activityLevel) state.activityLevel = 1.375;
    } catch (_) {
      initializeDefaultState();
    }
  } else {
    initializeDefaultState();
  }
}

function initializeDefaultState() {
  state = {
    theme: 'light',
    dailyCalorieTarget: 2000,
    macroGoals: { protein: 150, carbs: 225, fat: 67 },
    waterGoal: 2000,
    activityLevel: 1.375,
    bodyWeight: null,
    waterIntakes: {},
    meals: [],
    exercises: [],
    dailyNotes: {}
  };
  generateMockData();
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateThemeUI() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const isDark = state.theme === 'dark';
  const pairs = [
    { icon: '#theme-toggle-icon', light: '#icon-moon', dark: '#icon-sun' },
    { icon: '#sidebar-theme-icon', light: '#icon-moon', dark: '#icon-sun' },
    { icon: '#mobile-theme-icon', light: '#icon-moon', dark: '#icon-sun' }
  ];
  pairs.forEach(p => {
    const el = document.querySelector(p.icon);
    if (el) el.setAttribute('href', isDark ? p.dark : p.light);
  });
  const sidebarLabel = document.getElementById('sidebar-theme-label');
  if (sidebarLabel) sidebarLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good evening', sub = 'Wind down and reflect on today';
  if (hour < 12) { greeting = 'Good morning'; sub = 'Start your day strong'; }
  else if (hour < 17) { greeting = 'Good afternoon'; sub = 'Keep the momentum going'; }
  const el = document.getElementById('greeting-text');
  const subEl = document.getElementById('greeting-sub');
  if (el) el.textContent = greeting;
  if (subEl) subEl.textContent = sub;
}

function calculateStreak() {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const hasMeals = state.meals.some(m => m.date === dateStr);
    if (hasMeals) streak++;
    else break;
  }
  return streak;
}

function renderApp() {
  updateThemeUI();

  const streak = calculateStreak();
  document.getElementById('streak-count').textContent = streak;

  const todaysMeals = state.meals.filter(m => m.date === TODAY_STR);
  const todaysExercises = state.exercises.filter(e => e.date === TODAY_STR);
  const todayWater = state.waterIntakes[TODAY_STR] || 0;

  const totalCaloriesIn = todaysMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalCaloriesBurned = todaysExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const netCalories = totalCaloriesIn - totalCaloriesBurned;

  const totalProtein = todaysMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = todaysMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = todaysMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  document.getElementById('stats-calories-in').innerText = totalCaloriesIn.toLocaleString();
  document.getElementById('stats-calories-burned').innerText = totalCaloriesBurned.toLocaleString();
  document.getElementById('stats-calories-net').innerText = netCalories.toLocaleString();

  const caloriesRemaining = state.dailyCalorieTarget + totalCaloriesBurned - totalCaloriesIn;
  const remainingDisplay = document.getElementById('calories-remaining-display');
  const remainingLbl = document.getElementById('calories-remaining-lbl');

  if (caloriesRemaining >= 0) {
    remainingDisplay.innerText = caloriesRemaining.toLocaleString();
    remainingLbl.innerText = 'kcal left';
    remainingLbl.style.color = '';
    remainingDisplay.style.color = '';
  } else {
    remainingDisplay.innerText = Math.abs(caloriesRemaining).toLocaleString();
    remainingLbl.innerText = 'kcal over';
    remainingLbl.style.color = 'var(--accent)';
    remainingDisplay.style.color = 'var(--accent)';
  }

  const circleFill = document.getElementById('calorie-progress-fill');
  const maxDash = 471;
  const totalAvailable = state.dailyCalorieTarget + totalCaloriesBurned;
  const progressRatio = Math.min(totalCaloriesIn / (totalAvailable || 1), 1.5);
  const strokeOffset = Math.max(0, maxDash - (Math.min(progressRatio, 1) * maxDash));
  circleFill.style.strokeDashoffset = strokeOffset;

  if (totalCaloriesIn > totalAvailable) {
    circleFill.classList.add('circle-fill-over');
  } else {
    circleFill.classList.remove('circle-fill-over');
  }

  updateMacroProgressBar('protein', totalProtein, state.macroGoals.protein);
  updateMacroProgressBar('carbs', totalCarbs, state.macroGoals.carbs);
  updateMacroProgressBar('fat', totalFat, state.macroGoals.fat);

  document.getElementById('water-current-display').innerText = `${todayWater} ml`;
  document.getElementById('water-goal-display').innerText = `of ${state.waterGoal} ml goal`;
  renderWaterCups(todayWater, state.waterGoal);

  renderFoodDiary(todaysMeals);
  renderExercises(todaysExercises);
  renderWeeklyTrendsChart();
  loadDailyNote();
}

function updateMacroProgressBar(id, current, goal) {
  document.getElementById(`macro-${id}-stats`).innerText = `${Math.round(current)}g / ${goal}g`;
  const pct = Math.min((current / goal) * 100, 100);
  document.getElementById(`macro-${id}-fill`).style.width = `${pct}%`;
}

function renderWaterCups(current, goal) {
  const grid = document.getElementById('water-cups-grid');
  grid.innerHTML = '';
  const increment = 250;
  const totalCups = Math.max(8, Math.ceil(goal / increment));
  const filledCups = Math.floor(current / increment);

  for (let i = 0; i < totalCups; i++) {
    const cup = document.createElement('button');
    cup.className = `water-cup ${i < filledCups ? 'filled' : ''}`;
    cup.setAttribute('aria-label', `Water cup ${i+1}`);
    cup.innerHTML = '<svg><use href="#icon-droplet"></use></svg>';

    cup.addEventListener('click', () => {
      let newAmount;
      if (i < filledCups) {
        newAmount = i === filledCups - 1 ? i * increment : (i + 1) * increment;
      } else {
        newAmount = (i + 1) * increment;
      }
      state.waterIntakes[TODAY_STR] = newAmount;
      saveState();
      renderApp();
    });

    grid.appendChild(cup);
  }
}

function renderFoodDiary(todaysMeals) {
  const container = document.getElementById('diary-meals-list');
  container.innerHTML = '';

  const filteredMeals = activeCategoryFilter === 'all'
    ? todaysMeals
    : todaysMeals.filter(m => m.category === activeCategoryFilter);

  if (filteredMeals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg><use href="#icon-coffee"></use></svg>
        <p>No meals logged yet.</p>
        <p style="font-size:0.78rem;">Use the quick-add buttons or tap 'Log Food' above.</p>
      </div>`;
    return;
  }

  const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
  categories.forEach(cat => {
    if (activeCategoryFilter !== 'all' && activeCategoryFilter !== cat) return;
    const mealsInCat = filteredMeals.filter(m => m.category === cat);
    if (!mealsInCat.length) return;

    const catCalories = mealsInCat.reduce((sum, m) => sum + m.calories, 0);
    const group = document.createElement('div');
    group.className = 'meal-group';

    const header = document.createElement('div');
    header.className = 'meal-group-header';
    header.innerHTML = `
      <span class="meal-group-title"><svg><use href="#${cat === 'breakfast' || cat === 'snack' ? 'icon-coffee' : 'icon-utensils'}"></use></svg> ${cat}</span>
      <span class="meal-group-calories">${catCalories} kcal</span>`;
    group.appendChild(header);

    const itemsList = document.createElement('div');
    itemsList.className = 'meal-items-list';

    mealsInCat.forEach(meal => {
      const item = document.createElement('div');
      item.className = 'meal-item';
      const macros = (meal.protein || meal.carbs || meal.fat)
        ? `<span class="meal-item-macros">${meal.protein ? `P:${meal.protein}g ` : ''}${meal.carbs ? `C:${meal.carbs}g ` : ''}${meal.fat ? `F:${meal.fat}g` : ''}</span>`
        : '';
      item.innerHTML = `
        <div class="meal-item-info">
          <span class="meal-item-name">${meal.name}</span>
          ${macros}
        </div>
        <div class="meal-item-cal-delete">
          <span class="meal-item-calories">${meal.calories} kcal</span>
          <button class="btn btn-icon" style="width:32px;height:32px;border:none;background:transparent;color:var(--text-muted)" data-id="${meal.id}" aria-label="Delete">
            <svg style="width:14px;height:14px;"><use href="#icon-trash"></use></svg>
          </button>
        </div>`;
      item.querySelector('button').addEventListener('click', () => deleteMealItem(meal.id, item));
      itemsList.appendChild(item);
    });

    group.appendChild(itemsList);
    container.appendChild(group);
  });
}

function deleteMealItem(id, element) {
  element.classList.add('item-exit');
  setTimeout(() => {
    state.meals = state.meals.filter(m => m.id !== id);
    saveState();
    renderApp();
  }, 200);
}

function renderExercises(todaysExercises) {
  const container = document.getElementById('exercise-log-list');
  container.innerHTML = '';

  if (!todaysExercises.length) {
    container.innerHTML = `<div class="empty-state"><svg><use href="#icon-activity"></use></svg><p>No workouts logged today.</p></div>`;
    return;
  }

  todaysExercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'exercise-item';
    card.innerHTML = `
      <div class="exercise-details">
        <span class="exercise-name">${ex.name}</span>
        <span class="exercise-duration">${ex.duration} mins</span>
      </div>
      <div class="exercise-right">
        <span class="exercise-burn">-${ex.caloriesBurned} kcal</span>
        <button class="btn btn-icon" style="width:32px;height:32px;border:none;background:transparent;color:var(--text-muted)" data-id="${ex.id}" aria-label="Delete">
          <svg style="width:14px;height:14px;"><use href="#icon-trash"></use></svg>
        </button>
      </div>`;
    card.querySelector('button').addEventListener('click', () => deleteExerciseItem(ex.id, card));
    container.appendChild(card);
  });
}

function deleteExerciseItem(id, element) {
  element.classList.add('item-exit');
  setTimeout(() => {
    state.exercises = state.exercises.filter(e => e.id !== id);
    saveState();
    renderApp();
  }, 200);
}

function renderWeeklyTrendsChart() {
  const chart = document.getElementById('weekly-trends-bar-chart');
  chart.innerHTML = '';
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(today.getDate() - i);
    last7Days.push({
      dateStr: getLocalDateString(d),
      dayLabel: daysOfWeek[d.getDay()],
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}`
    });
  }

  const dailyBalances = last7Days.map(day => {
    const calIn = state.meals.filter(m => m.date === day.dateStr).reduce((s, m) => s + m.calories, 0);
    const calOut = state.exercises.filter(e => e.date === day.dateStr).reduce((s, e) => s + e.caloriesBurned, 0);
    return { ...day, netCalories: Math.max(0, calIn - calOut) };
  });

  const maxNet = Math.max(state.dailyCalorieTarget, ...dailyBalances.map(d => d.netCalories), 1);

  dailyBalances.forEach(day => {
    const column = document.createElement('div');
    column.className = 'chart-column';
    const pct = (day.netCalories / maxNet) * 100;
    const exceeded = day.netCalories > state.dailyCalorieTarget;
    column.innerHTML = `
      <div class="chart-bar-wrapper">
        <div class="chart-bar-tooltip">${day.netCalories} kcal</div>
        <div class="chart-bar ${exceeded ? 'limit-exceeded' : ''}" style="height: ${Math.max(3, pct)}%"></div>
      </div>
      <span class="chart-label">${day.dayLabel}<br><span style="font-size:0.6rem;opacity:0.6">${day.dateLabel}</span></span>`;
    chart.appendChild(column);
  });
}

function loadDailyNote() {
  const textarea = document.getElementById('daily-notes');
  const count = document.getElementById('notes-count');
  if (state.dailyNotes[TODAY_STR]) textarea.value = state.dailyNotes[TODAY_STR];
  else textarea.value = '';
  count.textContent = `${textarea.value.length} / 500`;
}

// BMI
function calculateBMI(height, weight) {
  if (!height || !weight || height <= 0 || weight <= 0) return null;
  const h = height / 100;
  return weight / (h * h);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// TDEE estimate (Mifflin-St Jeor, assuming male for simplicity, or could use avg)
function estimateTDEE(weight, activity) {
  if (!weight || weight <= 0) return null;
  const bmr = 10 * weight + 625; // rough average of male/female
  return Math.round(bmr * activity);
}

// NAVIGATION
let activeSection = 'dashboard';

function scrollToSection(sectionId) {
  const card = document.querySelector(`[data-section="${sectionId}"]`);
  if (!card) return;
  const offset = card.getBoundingClientRect().top + window.scrollY - 90;
  window.scrollTo({ top: offset, behavior: 'smooth' });
  setActiveNav(sectionId);
}

function setActiveNav(sectionId) {
  activeSection = sectionId;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });
}

function setupScrollSpy() {
  const sections = document.querySelectorAll('[data-section]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target.dataset.section;
        if (section) setActiveNav(section);
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });
  sections.forEach(s => observer.observe(s));
}

// MODALS
const modals = {
  food: document.getElementById('modal-add-food'),
  exercise: document.getElementById('modal-add-exercise'),
  targets: document.getElementById('modal-edit-targets')
};

function openModal(modalEl) { modalEl.classList.add('active'); }
function closeModal(modalEl) { modalEl.classList.remove('active'); }

// EVENTS
function setupEvents() {
  // Theme toggles
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('mobile-theme-btn').addEventListener('click', toggleTheme);
  document.getElementById('nav-theme-toggle').addEventListener('click', (e) => { e.preventDefault(); toggleTheme(); });

  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveState();
    renderApp();
  }

  // Sidebar nav
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection(item.dataset.section);
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });
  });

  // Settings nav
  document.getElementById('nav-settings').addEventListener('click', (e) => {
    e.preventDefault();
    populateTargetsForm();
    openModal(modals.targets);
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  });

  // Mobile sidebar
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('active');
  });
  document.getElementById('sidebar-close-btn').addEventListener('click', closeSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  }

  // Open modals
  document.getElementById('log-meal-header-btn').addEventListener('click', () => {
    if (activeCategoryFilter !== 'all') document.getElementById('food-category').value = activeCategoryFilter;
    document.getElementById('form-add-food').reset();
    openModal(modals.food);
  });
  document.getElementById('mobile-floating-action-btn').addEventListener('click', () => {
    document.getElementById('form-add-food').reset();
    openModal(modals.food);
  });
  document.getElementById('btn-log-exercise').addEventListener('click', () => {
    document.getElementById('form-add-exercise').reset();
    openModal(modals.exercise);
  });
  document.getElementById('edit-targets-btn').addEventListener('click', () => {
    populateTargetsForm();
    openModal(modals.targets);
  });

  function populateTargetsForm() {
    document.getElementById('target-calories').value = state.dailyCalorieTarget;
    document.getElementById('target-protein').value = state.macroGoals.protein;
    document.getElementById('target-carbs').value = state.macroGoals.carbs;
    document.getElementById('target-fat').value = state.macroGoals.fat;
    document.getElementById('target-water').value = state.waterGoal;
    document.getElementById('target-activity').value = state.activityLevel;
    document.getElementById('target-bodyweight').value = state.bodyWeight || '';
  }

  // Close modals
  const closePairs = [
    { btn: 'btn-close-food-modal', cancel: 'btn-cancel-food-modal', modal: modals.food },
    { btn: 'btn-close-exercise-modal', cancel: 'btn-cancel-exercise-modal', modal: modals.exercise },
    { btn: 'btn-close-targets-modal', cancel: 'btn-cancel-targets-modal', modal: modals.targets }
  ];
  closePairs.forEach(c => {
    document.getElementById(c.btn).addEventListener('click', () => closeModal(c.modal));
    document.getElementById(c.cancel).addEventListener('click', () => closeModal(c.modal));
    c.modal.addEventListener('click', (e) => { if (e.target === c.modal) closeModal(c.modal); });
  });

  // Segmented control
  document.getElementById('diary-category-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;
    document.querySelectorAll('#diary-category-filter .segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategoryFilter = btn.dataset.filter;
    renderFoodDiary(state.meals.filter(m => m.date === TODAY_STR));
  });

  // Quick-add presets
  document.querySelectorAll('.preset-btn[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = JSON.parse(btn.dataset.preset);
      const meal = {
        id: `meal-${Date.now()}-${Math.random()}`,
        name: data.name,
        category: data.category,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        date: TODAY_STR
      };
      state.meals.push(meal);
      saveState();
      renderApp();
    });
  });

  document.getElementById('preset-more').addEventListener('click', () => {
    document.getElementById('form-add-food').reset();
    openModal(modals.food);
  });

  // Water controls
  document.getElementById('btn-water-add-250').addEventListener('click', () => {
    state.waterIntakes[TODAY_STR] = (state.waterIntakes[TODAY_STR] || 0) + 250;
    saveState();
    renderApp();
  });
  document.getElementById('btn-water-reset').addEventListener('click', () => {
    state.waterIntakes[TODAY_STR] = 0;
    saveState();
    renderApp();
  });

  // Daily notes
  document.getElementById('daily-notes').addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length > 500) { e.target.value = val.slice(0, 500); }
    state.dailyNotes[TODAY_STR] = e.target.value;
    document.getElementById('notes-count').textContent = `${e.target.value.length} / 500`;
    saveState();
  });

  // BMI calculator
  document.getElementById('btn-calc-bmi').addEventListener('click', () => {
    const height = parseFloat(document.getElementById('bmi-height').value);
    const weight = parseFloat(document.getElementById('bmi-weight').value);
    const bmi = calculateBMI(height, weight);
    if (bmi === null) {
      document.getElementById('bmi-value').textContent = '--';
      document.getElementById('bmi-category').textContent = 'Enter valid height & weight';
      return;
    }
    document.getElementById('bmi-value').textContent = bmi.toFixed(1);
    document.getElementById('bmi-category').textContent = getBMICategory(bmi);
  });

  // Auto-calc BMI on enter
  document.getElementById('bmi-height').addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('btn-calc-bmi').click(); });
  document.getElementById('bmi-weight').addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('btn-calc-bmi').click(); });

  // Food form
  document.getElementById('form-add-food').addEventListener('submit', (e) => {
    e.preventDefault();
    const meal = {
      id: `meal-${Date.now()}`,
      name: document.getElementById('food-name').value.trim(),
      category: document.getElementById('food-category').value,
      calories: parseInt(document.getElementById('food-calories').value),
      protein: parseInt(document.getElementById('food-protein').value) || 0,
      carbs: parseInt(document.getElementById('food-carbs').value) || 0,
      fat: parseInt(document.getElementById('food-fat').value) || 0,
      date: TODAY_STR
    };
    state.meals.push(meal);
    saveState();
    closeModal(modals.food);
    renderApp();
  });

  // Exercise form
  document.getElementById('form-add-exercise').addEventListener('submit', (e) => {
    e.preventDefault();
    const ex = {
      id: `ex-${Date.now()}`,
      name: document.getElementById('exercise-name').value.trim(),
      duration: parseInt(document.getElementById('exercise-duration').value),
      caloriesBurned: parseInt(document.getElementById('exercise-calories').value),
      date: TODAY_STR
    };
    state.exercises.push(ex);
    saveState();
    closeModal(modals.exercise);
    renderApp();
  });

  // Targets form
  document.getElementById('form-edit-targets').addEventListener('submit', (e) => {
    e.preventDefault();
    state.dailyCalorieTarget = parseInt(document.getElementById('target-calories').value);
    state.macroGoals.protein = parseInt(document.getElementById('target-protein').value);
    state.macroGoals.carbs = parseInt(document.getElementById('target-carbs').value);
    state.macroGoals.fat = parseInt(document.getElementById('target-fat').value);
    state.waterGoal = parseInt(document.getElementById('target-water').value);
    state.activityLevel = parseFloat(document.getElementById('target-activity').value);
    state.bodyWeight = parseFloat(document.getElementById('target-bodyweight').value) || null;

    // TDEE suggestion
    const tdee = estimateTDEE(state.bodyWeight, state.activityLevel);
    if (tdee && state.bodyWeight) {
      if (confirm(`Based on your weight and activity level, your estimated TDEE is ${tdee} kcal/day.\n\nWould you like to set this as your calorie target?`)) {
        state.dailyCalorieTarget = tdee;
      }
    }

    saveState();
    closeModal(modals.targets);
    renderApp();
  });
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setGreeting();
  setupEvents();
  renderApp();
  setupScrollSpy();
});
