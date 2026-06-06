/**
 * NutriFlow Calorie & Macro Tracker
 * Vanilla Javascript Application Logic
 */

// ==========================================
// CORE STATE DEFINITION
// ==========================================
let state = {
  theme: 'light',
  dailyCalorieTarget: 2000,
  macroGoals: {
    protein: 150, // in grams
    carbs: 225,   // in grams
    fat: 67       // in grams
  },
  waterGoal: 2000, // in ml
  waterIntakes: {}, // { 'YYYY-MM-DD': amountInMl }
  meals: [],       // Array of { id, name, category, calories, protein, carbs, fat, date }
  exercises: []    // Array of { id, name, duration, caloriesBurned, date }
};

// State storage key
const STORAGE_KEY = 'nutriflow_state';

// Current view date (fixed to local today)
const TODAY_STR = getLocalDateString(new Date());
let activeCategoryFilter = 'all';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Returns YYYY-MM-DD representation of a Date object using local timezone
 */
function getLocalDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates realistic mock historical data for the last 6 days
 * to ensure the user gets a premium visual experience immediately.
 */
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

  // Populate last 6 days (excluding today)
  for (let i = 6; i >= 1; i--) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(targetDate);

    // Seed 2-3 random meals
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

    // Seed an exercise 70% of the time
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

    // Seed water intake
    state.waterIntakes[dateStr] = 1000 + (Math.floor(Math.random() * 5) * 250);
  }

  // Seed some starting today meals/exercises to avoid blank state
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

/**
 * Loads state from local storage or initializes mock data
 */
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      // Double check theme variable initialization
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

/**
 * Saves current state to local storage
 */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ==========================================
// RENDERING FUNCTIONS
// ==========================================

/**
 * Main render function which recalculates stats and updates all components
 */
function renderApp() {
  // Apply theme class
  document.documentElement.setAttribute('data-theme', state.theme);
  const themeIcon = document.querySelector('#theme-toggle-icon use');
  if (state.theme === 'dark') {
    themeIcon.setAttribute('href', '#icon-sun');
  } else {
    themeIcon.setAttribute('href', '#icon-moon');
  }

  // Calculate totals for TODAY
  const todaysMeals = state.meals.filter(m => m.date === TODAY_STR);
  const todaysExercises = state.exercises.filter(e => e.date === TODAY_STR);
  const todayWater = state.waterIntakes[TODAY_STR] || 0;

  const totalCaloriesIn = todaysMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalCaloriesBurned = todaysExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const netCalories = totalCaloriesIn - totalCaloriesBurned;
  
  const totalProtein = todaysMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = todaysMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = todaysMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  // 1. Update Metrics Summary Headers
  document.getElementById('stats-calories-in').innerText = totalCaloriesIn.toLocaleString();
  document.getElementById('stats-calories-burned').innerText = totalCaloriesBurned.toLocaleString();
  document.getElementById('stats-calories-net').innerText = netCalories.toLocaleString();

  // 2. Update Main Calorie Progress Ring
  const caloriesRemaining = state.dailyCalorieTarget + totalCaloriesBurned - totalCaloriesIn;
  const remainingDisplay = document.getElementById('calories-remaining-display');
  const remainingLbl = document.getElementById('calories-remaining-lbl');
  
  if (caloriesRemaining >= 0) {
    remainingDisplay.innerText = caloriesRemaining.toLocaleString();
    remainingLbl.innerText = 'kcal left';
    remainingLbl.style.color = 'var(--text-secondary)';
    remainingDisplay.style.color = 'var(--text-primary)';
  } else {
    remainingDisplay.innerText = Math.abs(caloriesRemaining).toLocaleString();
    remainingLbl.innerText = 'kcal over';
    remainingLbl.style.color = 'var(--danger)';
    remainingDisplay.style.color = 'var(--danger)';
  }

  // Update Circle Stroke Offset
  const circleFill = document.getElementById('calorie-progress-fill');
  const maxDash = 471; // 2 * pi * 75
  const progressRatio = Math.min(totalCaloriesIn / (state.dailyCalorieTarget + totalCaloriesBurned), 1.5);
  // Cap dash offset calculations to positive percentages
  const strokeOffset = Math.max(0, maxDash - (Math.min(progressRatio, 1) * maxDash));
  circleFill.style.strokeDashoffset = strokeOffset;
  
  if (totalCaloriesIn > (state.dailyCalorieTarget + totalCaloriesBurned)) {
    circleFill.classList.add('circle-fill-over');
  } else {
    circleFill.classList.remove('circle-fill-over');
  }

  // 3. Update Macro progress
  updateMacroProgressBar('protein', totalProtein, state.macroGoals.protein);
  updateMacroProgressBar('carbs', totalCarbs, state.macroGoals.carbs);
  updateMacroProgressBar('fat', totalFat, state.macroGoals.fat);

  // 4. Update Water tracker
  document.getElementById('water-current-display').innerText = `${todayWater} ml`;
  document.getElementById('water-goal-display').innerText = `of ${state.waterGoal} ml goal`;
  renderWaterCups(todayWater, state.waterGoal);

  // 5. Update Food Diary log list
  renderFoodDiary(todaysMeals);

  // 6. Update Exercise log list
  renderExercises(todaysExercises);

  // 7. Update Weekly trends chart
  renderWeeklyTrendsChart();
}

/**
 * Updates individual macronutrient indicators
 */
function updateMacroProgressBar(id, current, goal) {
  const textEl = document.getElementById(`macro-${id}-stats`);
  const fillEl = document.getElementById(`macro-${id}-fill`);
  
  textEl.innerText = `${Math.round(current)}g / ${goal}g`;
  const pct = Math.min((current / goal) * 100, 100);
  fillEl.style.width = `${pct}%`;
}

/**
 * Renders the water tracking interactive cup grid
 */
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
      // Toggle logic: If clicking the top filled cup, empty it.
      // Otherwise, set filled state up to this cup.
      let newAmount = 0;
      if (i < filledCups) {
        if (i === filledCups - 1) {
          // Clicked the last filled cup, decrement by one cup
          newAmount = i * increment;
        } else {
          // Set to this cup's index
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

/**
 * Renders the food diary entries categorized and filtered
 */
function renderFoodDiary(todaysMeals) {
  const container = document.getElementById('diary-meals-list');
  container.innerHTML = '';

  // Apply filters
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

  // Group meals by category for visual sections
  const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  categories.forEach(cat => {
    // If filtering by specific category, skip others
    if (activeCategoryFilter !== 'all' && activeCategoryFilter !== cat) return;

    const mealsInCat = filteredMeals.filter(m => m.category === cat);
    if (mealsInCat.length === 0) return;

    const catCalories = mealsInCat.reduce((sum, m) => sum + m.calories, 0);

    // Create Category Group container
    const group = document.createElement('div');
    group.className = 'meal-group';

    // Header
    const header = document.createElement('div');
    header.className = 'meal-group-header';
    
    // Choose icon
    let iconName = 'icon-coffee';
    if (cat === 'breakfast') iconName = 'icon-coffee';
    if (cat === 'lunch' || cat === 'dinner') iconName = 'icon-utensils';
    
    header.innerHTML = `
      <span class="meal-group-title" style="text-transform: capitalize;">
        <svg><use href="#${iconName}"></use></svg>
        ${cat}
      </span>
      <span class="meal-group-calories">${catCalories} kcal</span>
    `;
    group.appendChild(header);

    // Items list
    const itemsList = document.createElement('div');
    itemsList.className = 'meal-items-list';

    mealsInCat.forEach(meal => {
      const item = document.createElement('div');
      item.className = 'meal-item';
      item.id = `meal-${meal.id}`;

      // Build macro sub-text
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

      // Deletion Handler
      item.querySelector('.btn-delete-meal').addEventListener('click', () => {
        deleteMealItem(meal.id, item);
      });

      itemsList.appendChild(item);
    });

    group.appendChild(itemsList);
    container.appendChild(group);
  });
}

/**
 * Animates and deletes a meal entry
 */
function deleteMealItem(id, element) {
  element.classList.add('item-exit');
  
  // Wait for transition before actual data removal
  setTimeout(() => {
    state.meals = state.meals.filter(m => m.id !== id);
    saveState();
    renderApp();
  }, 250);
}

/**
 * Renders exercise lists
 */
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

/**
 * Animates and deletes an exercise entry
 */
function deleteExerciseItem(id, element) {
  element.classList.add('item-exit');
  setTimeout(() => {
    state.exercises = state.exercises.filter(e => e.id !== id);
    saveState();
    renderApp();
  }, 250);
}

/**
 * Renders the 7-day calorie trends bar chart
 */
function renderWeeklyTrendsChart() {
  const chart = document.getElementById('weekly-trends-bar-chart');
  chart.innerHTML = '';

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  // Generate list of past 7 days
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

  // Calculate Net Calories for each day
  const dailyBalances = last7Days.map(day => {
    const dayMeals = state.meals.filter(m => m.date === day.dateStr);
    const dayExercises = state.exercises.filter(e => e.date === day.dateStr);
    
    const calIn = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    const calOut = dayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
    const net = calIn - calOut;

    return {
      ...day,
      netCalories: Math.max(0, net) // Clamp negative balances to 0 for chart visibility
    };
  });

  // Calculate chart scale (find highest net value, minimum boundary is the calorie target)
  const maxNet = Math.max(
    state.dailyCalorieTarget,
    ...dailyBalances.map(d => d.netCalories),
    1 // Prevents division by 0
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
// FORM AND MODAL CONTROLLERS
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

// Setup Event Listeners
function setupEvents() {
  // Theme Toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveState();
    renderApp();
  });

  // Open Modals
  document.getElementById('log-meal-header-btn').addEventListener('click', () => {
    // Preset category to current filter if applicable
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
    // Fill current targets in settings inputs
    document.getElementById('target-calories').value = state.dailyCalorieTarget;
    document.getElementById('target-protein').value = state.macroGoals.protein;
    document.getElementById('target-carbs').value = state.macroGoals.carbs;
    document.getElementById('target-fat').value = state.macroGoals.fat;
    document.getElementById('target-water').value = state.waterGoal;
    openModal(modals.targets);
  });

  // Close Modals (X click / Cancel click / Overlay click)
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

  // Segmented Control Filters
  document.getElementById('diary-category-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;

    // Toggle active segment styling
    document.querySelectorAll('#diary-category-filter .segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeCategoryFilter = btn.dataset.filter;
    const todaysMeals = state.meals.filter(m => m.date === TODAY_STR);
    renderFoodDiary(todaysMeals);
  });

  // Water Tracker Quick Controls
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

  // ==========================================
  // FORM SUBMISSION HANDLERS
  // ==========================================

  // Form: Add Food Entry
  document.getElementById('form-add-food').addEventListener('submit', (e) => {
    e.preventDefault();

    const category = document.getElementById('food-category').value;
    const name = document.getElementById('food-name').value.trim();
    const calories = parseInt(document.getElementById('food-calories').value);
    
    // Optional Macro inputs
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

  // Form: Log Exercise
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

  // Form: Edit Targets
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
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupEvents();
  renderApp();
});
