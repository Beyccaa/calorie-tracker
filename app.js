let state = {
  theme: 'light',
  dailyCalorieTarget: 2000,
  macroGoals: {
    protein: 150,
    carbs: 225,
    fat: 67
  },
  waterGoal: 2000,
  waterIntakes: {},
  meals: [],
  exercises: []
};

const STORAGE_KEY = 'nutriflow_state';
const TODAY_STR = getLocalDateString(new Date());
let activeCategoryFilter = 'all';

function getLocalDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(targetDate);

    const mealsCount = 2 + Math.floor(Math.random() * 2);
    for (let m = 0; m < mealsCount; m++) {
      const template = mockMeals[Math.floor(Math.random() * mockMeals.length)];
      state.meals.push({
        id: `mock-meal-${dateStr}-${m}-${Math.random()}`,
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
        id: `mock-ex-${dateStr}-${Math.random()}`,
        name: template.name,
        duration: template.duration,
        caloriesBurned: template.caloriesBurned + Math.floor((Math.random() * 40) - 20),
        date: dateStr
      });
    }

    state.waterIntakes[dateStr] = 1000 + (Math.floor(Math.random() * 5) * 250);
  }

  state.meals.push(
    {
      id: `today-meal-1`,
      name: 'Avocado Toast & Poached Eggs',
      category: 'breakfast',
      calories: 420,
      protein: 18,
      carbs: 34,
      fat: 20,
      date: TODAY_STR
    },
    {
      id: `today-meal-2`,
      name: 'Teriyaki Chicken Bowls',
      category: 'lunch',
      calories: 580,
      protein: 40,
      carbs: 65,
      fat: 12,
      date: TODAY_STR
    }
  );
  state.exercises.push({
    id: `today-ex-1`,
    name: 'Power Walk',
    duration: 25,
    caloriesBurned: 150,
    date: TODAY_STR
  });
  state.waterIntakes[TODAY_STR] = 750;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      if (!state.theme) state.theme = 'light';
      if (!state.waterIntakes) state.waterIntakes = {};
      if (!state.meals) state.meals = [];
      if (!state.exercises) state.exercises = [];
    } catch (e) {
      console.error("Failed to parse state, resetting", e);
      initializeDefaultState();
    }
  } else {
    initializeDefaultState();
  }
}

function initializeDefaultState() {
  state.theme = 'light';
  state.dailyCalorieTarget = 2000;
  state.macroGoals = { protein: 150, carbs: 225, fat: 67 };
  state.waterGoal = 2000;
  state.waterIntakes = {};
  state.meals = [];
  state.exercises = [];
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
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const el = document.getElementById('greeting-text');
  if (el) el.textContent = greeting;
}

function renderApp() {
  updateThemeUI();

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
    remainingLbl.style.color = 'var(--text-secondary)';
    remainingDisplay.style.color = 'var(--primary)';
  } else {
    remainingDisplay.innerText = Math.abs(caloriesRemaining).toLocaleString();
    remainingLbl.innerText = 'kcal over';
    remainingLbl.style.color = 'var(--accent)';
    remainingDisplay.style.color = 'var(--accent)';
  }

  const circleFill = document.getElementById('calorie-progress-fill');
  const maxDash = 471;
  const progressRatio = Math.min(totalCaloriesIn / (state.dailyCalorieTarget + totalCaloriesBurned), 1.5);
  const strokeOffset = Math.max(0, maxDash - (Math.min(progressRatio, 1) * maxDash));
  circleFill.style.strokeDashoffset = strokeOffset;

  if (totalCaloriesIn > (state.dailyCalorieTarget + totalCaloriesBurned)) {
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
}

function updateMacroProgressBar(id, current, goal) {
  const textEl = document.getElementById(`macro-${id}-stats`);
  const fillEl = document.getElementById(`macro-${id}-fill`);

  textEl.innerText = `${Math.round(current)}g / ${goal}g`;
  const pct = Math.min((current / goal) * 100, 100);
  fillEl.style.width = `${pct}%`;
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
    cup.setAttribute('aria-label', `Water cup ${i+1}, ${i < filledCups ? 'Filled' : 'Empty'}`);
    cup.innerHTML = `<svg><use href="#icon-droplet"></use></svg>`;

    cup.addEventListener('click', () => {
      let newAmount = 0;
      if (i < filledCups) {
        if (i === filledCups - 1) {
          newAmount = i * increment;
        } else {
          newAmount = (i + 1) * increment;
        }
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
        <p>No food logged ${activeCategoryFilter === 'all' ? 'for today' : `in ${activeCategoryFilter}`}.</p>
        <p style="font-size: 0.8rem;">Tap 'Log Food' to begin tracking.</p>
      </div>
    `;
    return;
  }

  const categories = ['breakfast', 'lunch', 'dinner', 'snack'];

  categories.forEach(cat => {
    if (activeCategoryFilter !== 'all' && activeCategoryFilter !== cat) return;

    const mealsInCat = filteredMeals.filter(m => m.category === cat);
    if (mealsInCat.length === 0) return;

    const catCalories = mealsInCat.reduce((sum, m) => sum + m.calories, 0);

    const group = document.createElement('div');
    group.className = 'meal-group';

    const header = document.createElement('div');
    header.className = 'meal-group-header';

    let iconName = 'icon-coffee';
    if (cat === 'lunch' || cat === 'dinner') iconName = 'icon-utensils';

    header.innerHTML = `
      <span class="meal-group-title">
        <svg><use href="#${iconName}"></use></svg>
        ${cat}
      </span>
      <span class="meal-group-calories">${catCalories} kcal</span>
    `;
    group.appendChild(header);

    const itemsList = document.createElement('div');
    itemsList.className = 'meal-items-list';

    mealsInCat.forEach(meal => {
      const item = document.createElement('div');
      item.className = 'meal-item';
      item.id = `meal-${meal.id}`;

      let macrosText = '';
      if (meal.protein || meal.carbs || meal.fat) {
        macrosText = `
          <span class="meal-item-macros">
            ${meal.protein ? `P: ${meal.protein}g` : ''}
            ${meal.carbs ? `C: ${meal.carbs}g` : ''}
            ${meal.fat ? `F: ${meal.fat}g` : ''}
          </span>
        `;
      }

      item.innerHTML = `
        <div class="meal-item-info">
          <span class="meal-item-name">${meal.name}</span>
          ${macrosText}
        </div>
        <div class="meal-item-cal-delete">
          <span class="meal-item-calories">${meal.calories} kcal</span>
          <button class="btn btn-secondary btn-danger-light btn-delete-meal" data-id="${meal.id}" aria-label="Delete ${meal.name}">
            <svg style="width:16px; height:16px;"><use href="#icon-trash"></use></svg>
          </button>
        </div>
      `;

      item.querySelector('.btn-delete-meal').addEventListener('click', () => {
        deleteMealItem(meal.id, item);
      });

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
  }, 250);
}

function renderExercises(todaysExercises) {
  const container = document.getElementById('exercise-log-list');
  container.innerHTML = '';

  if (todaysExercises.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 1.25rem;">
        <svg><use href="#icon-activity"></use></svg>
        <p>No workouts logged today.</p>
      </div>
    `;
    return;
  }

  todaysExercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'exercise-item';
    card.id = `ex-${ex.id}`;

    card.innerHTML = `
      <div class="exercise-details">
        <span class="exercise-name">${ex.name}</span>
        <span class="exercise-duration">${ex.duration} mins</span>
      </div>
      <div class="exercise-right">
        <span class="exercise-burn">-${ex.caloriesBurned} kcal</span>
        <button class="btn btn-secondary btn-danger-light btn-delete-ex" data-id="${ex.id}" aria-label="Delete ${ex.name}">
          <svg style="width:16px; height:16px;"><use href="#icon-trash"></use></svg>
        </button>
      </div>
    `;

    card.querySelector('.btn-delete-ex').addEventListener('click', () => {
      deleteExerciseItem(ex.id, card);
    });

    container.appendChild(card);
  });
}

function deleteExerciseItem(id, element) {
  element.classList.add('item-exit');
  setTimeout(() => {
    state.exercises = state.exercises.filter(e => e.id !== id);
    saveState();
    renderApp();
  }, 250);
}

function renderWeeklyTrendsChart() {
  const chart = document.getElementById('weekly-trends-bar-chart');
  chart.innerHTML = '';

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    last7Days.push({
      dateStr: getLocalDateString(d),
      dayLabel: daysOfWeek[d.getDay()],
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}`
    });
  }

  const dailyBalances = last7Days.map(day => {
    const dayMeals = state.meals.filter(m => m.date === day.dateStr);
    const dayExercises = state.exercises.filter(e => e.date === day.dateStr);

    const calIn = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    const calOut = dayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
    const net = calIn - calOut;

    return {
      ...day,
      netCalories: Math.max(0, net)
    };
  });

  const maxNet = Math.max(
    state.dailyCalorieTarget,
    ...dailyBalances.map(d => d.netCalories),
    1
  );

  dailyBalances.forEach(day => {
    const column = document.createElement('div');
    column.className = 'chart-column';

    const barHeightPercent = (day.netCalories / maxNet) * 100;
    const isExceeded = day.netCalories > state.dailyCalorieTarget;

    column.innerHTML = `
      <div class="chart-bar-wrapper">
        <div class="chart-bar-tooltip">${day.netCalories} kcal</div>
        <div class="chart-bar ${isExceeded ? 'limit-exceeded' : ''}" style="height: ${Math.max(5, barHeightPercent)}%"></div>
      </div>
      <span class="chart-label">${day.dayLabel}<br><span style="font-size:0.65rem; opacity:0.6;">${day.dateLabel}</span></span>
    `;

    chart.appendChild(column);
  });
}

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

let activeSection = 'dashboard';

function scrollToSection(sectionId) {
  const card = document.querySelector(`[data-section="${sectionId}"]`);
  if (!card) return;

  const headerOffset = 100;
  const elementPosition = card.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;

  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

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

// ==========================================
// MODAL CONTROLLERS
// ==========================================

const modals = {
  food: document.getElementById('modal-add-food'),
  exercise: document.getElementById('modal-add-exercise'),
  targets: document.getElementById('modal-edit-targets')
};

function openModal(modalEl) {
  modalEl.classList.add('active');
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
}

// ==========================================
// SETUP EVENTS
// ==========================================

function setupEvents() {
  // Theme Toggle (header)
  document.getElementById('theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveState();
    renderApp();
  });

  // Theme Toggle (mobile)
  document.getElementById('mobile-theme-btn').addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveState();
    renderApp();
  });

  // Theme Toggle (sidebar)
  document.getElementById('nav-theme-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveState();
    renderApp();
  });

  // Sidebar Navigation
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      scrollToSection(section);

      // Close sidebar on mobile
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });
  });

  // Settings nav item
  document.getElementById('nav-settings').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('target-calories').value = state.dailyCalorieTarget;
    document.getElementById('target-protein').value = state.macroGoals.protein;
    document.getElementById('target-carbs').value = state.macroGoals.carbs;
    document.getElementById('target-fat').value = state.macroGoals.fat;
    document.getElementById('target-water').value = state.waterGoal;
    openModal(modals.targets);

    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  });

  // Mobile sidebar
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('active');
  });

  document.getElementById('sidebar-close-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  });

  document.getElementById('sidebar-overlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  });

  // Open Modals
  document.getElementById('log-meal-header-btn').addEventListener('click', () => {
    const categorySelector = document.getElementById('food-category');
    if (activeCategoryFilter !== 'all') {
      categorySelector.value = activeCategoryFilter;
    }
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
    document.getElementById('target-calories').value = state.dailyCalorieTarget;
    document.getElementById('target-protein').value = state.macroGoals.protein;
    document.getElementById('target-carbs').value = state.macroGoals.carbs;
    document.getElementById('target-fat').value = state.macroGoals.fat;
    document.getElementById('target-water').value = state.waterGoal;
    openModal(modals.targets);
  });

  // Close Modals
  const closeBorders = [
    { btn: 'btn-close-food-modal', cancel: 'btn-cancel-food-modal', modal: modals.food },
    { btn: 'btn-close-exercise-modal', cancel: 'btn-cancel-exercise-modal', modal: modals.exercise },
    { btn: 'btn-close-targets-modal', cancel: 'btn-cancel-targets-modal', modal: modals.targets }
  ];

  closeBorders.forEach(c => {
    document.getElementById(c.btn).addEventListener('click', () => closeModal(c.modal));
    document.getElementById(c.cancel).addEventListener('click', () => closeModal(c.modal));
    c.modal.addEventListener('click', (e) => {
      if (e.target === c.modal) closeModal(c.modal);
    });
  });

  // Segmented Control
  document.getElementById('diary-category-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;

    document.querySelectorAll('#diary-category-filter .segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeCategoryFilter = btn.dataset.filter;
    const todaysMeals = state.meals.filter(m => m.date === TODAY_STR);
    renderFoodDiary(todaysMeals);
  });

  // Water Controls
  document.getElementById('btn-water-add-250').addEventListener('click', () => {
    const current = state.waterIntakes[TODAY_STR] || 0;
    state.waterIntakes[TODAY_STR] = current + 250;
    saveState();
    renderApp();
  });

  document.getElementById('btn-water-reset').addEventListener('click', () => {
    state.waterIntakes[TODAY_STR] = 0;
    saveState();
    renderApp();
  });

  // Food Form
  document.getElementById('form-add-food').addEventListener('submit', (e) => {
    e.preventDefault();

    const category = document.getElementById('food-category').value;
    const name = document.getElementById('food-name').value.trim();
    const calories = parseInt(document.getElementById('food-calories').value);
    const protein = parseInt(document.getElementById('food-protein').value) || 0;
    const carbs = parseInt(document.getElementById('food-carbs').value) || 0;
    const fat = parseInt(document.getElementById('food-fat').value) || 0;

    const newMeal = {
      id: `meal-${Date.now()}`,
      name,
      category,
      calories,
      protein,
      carbs,
      fat,
      date: TODAY_STR
    };

    state.meals.push(newMeal);
    saveState();
    closeModal(modals.food);
    renderApp();
  });

  // Exercise Form
  document.getElementById('form-add-exercise').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('exercise-name').value.trim();
    const duration = parseInt(document.getElementById('exercise-duration').value);
    const caloriesBurned = parseInt(document.getElementById('exercise-calories').value);

    const newExercise = {
      id: `ex-${Date.now()}`,
      name,
      duration,
      caloriesBurned,
      date: TODAY_STR
    };

    state.exercises.push(newExercise);
    saveState();
    closeModal(modals.exercise);
    renderApp();
  });

  // Targets Form
  document.getElementById('form-edit-targets').addEventListener('submit', (e) => {
    e.preventDefault();

    state.dailyCalorieTarget = parseInt(document.getElementById('target-calories').value);
    state.macroGoals.protein = parseInt(document.getElementById('target-protein').value);
    state.macroGoals.carbs = parseInt(document.getElementById('target-carbs').value);
    state.macroGoals.fat = parseInt(document.getElementById('target-fat').value);
    state.waterGoal = parseInt(document.getElementById('target-water').value);

    saveState();
    closeModal(modals.targets);
    renderApp();
  });
}

// ==========================================
// APP INIT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setGreeting();
  setupEvents();
  renderApp();
  setupScrollSpy();
});
