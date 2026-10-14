const PORT = process.env.PORT || 3001;
const API_BASE = `http://localhost:${PORT}/api`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url, options = {}) {
  await sleep(60);
  const headers = { ...options.headers };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body,
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  let raw = '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    raw = await res.text();
  }

  const headersObj = {};
  res.headers.forEach((val, key) => {
    headersObj[key.toLowerCase()] = val;
  });

  return {
    status: res.status,
    data,
    raw,
    headers: headersObj,
  };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🚀 Starting Full Test Suite for DietTrack...\n');

  // Test 1: Health Check
  console.log('--- 1. Health Check ---');
  const health = await request(`http://localhost:${PORT}/health`);
  assert(health.status === 200, 'Health endpoint responds with 200');
  assert(health.data.status === 'ok', 'Health status is ok');

  // Test 2: User Registration
  console.log('\n--- 2. Auth: Registration ---');
  const testEmail = `testuser_${Date.now()}@example.com`;
  const regPayload = JSON.stringify({
    name: 'Test Runner',
    email: testEmail,
    password: 'password123',
    age: 26,
    gender: 'MALE',
    height: 180,
    weight: 78,
    activityLevel: 'MODERATELY_ACTIVE',
    goal: 'WEIGHT_LOSS',
  });

  const regRes = await request(`${API_BASE}/auth/register`, { method: 'POST', body: regPayload });
  assert(regRes.status === 201, 'Registration returns 201 Created');
  assert(regRes.data.success === true, 'Registration response indicates success');
  assert(!!regRes.data.data.accessToken, 'Access token is returned');
  assert(!!regRes.data.data.refreshToken, 'Refresh token is returned');
  assert(regRes.data.data.user.email === testEmail, 'User email matches');
  assert(regRes.data.data.user.calorieTarget > 0, 'Calorie target is automatically calculated');

  let token = regRes.data.data.accessToken;
  let refreshToken = regRes.data.data.refreshToken;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Test 3: Duplicate Registration Error
  console.log('\n--- 3. Auth: Duplicate Email Error Check ---');
  const dupRes = await request(`${API_BASE}/auth/register`, { method: 'POST', body: regPayload });
  assert(dupRes.status === 409, 'Duplicate registration returns 409 Conflict');

  // Test 4: Login
  console.log('\n--- 4. Auth: Login ---');
  const loginRes = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'password123' }),
  });
  assert(loginRes.status === 200, 'Login returns 200 OK');
  assert(!!loginRes.data.data.accessToken, 'Login issues new access token');
  token = loginRes.data.data.accessToken;
  refreshToken = loginRes.data.data.refreshToken;

  // Test 5: Token Refresh
  console.log('\n--- 5. Auth: Token Refresh ---');
  const refreshRes = await request(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  assert(refreshRes.status === 200, 'Token refresh returns 200 OK');
  assert(!!refreshRes.data.data.accessToken, 'New access token received');
  token = refreshRes.data.data.accessToken;
  refreshToken = refreshRes.data.data.refreshToken;

  const currentAuth = { Authorization: `Bearer ${token}` };

  // Test 6: Profile & Target Recalculation
  console.log('\n--- 6. Profile Operations ---');
  const profRes = await request(`${API_BASE}/profile`, { headers: currentAuth });
  assert(profRes.status === 200, 'GET /api/profile returns 200 OK');
  assert(profRes.data.data.name === 'Test Runner', 'Profile name matches');

  const updateProfRes = await request(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: currentAuth,
    body: JSON.stringify({ weight: 75, goal: 'MUSCLE_GAIN' }),
  });
  assert(updateProfRes.status === 200, 'PUT /api/profile returns 200 OK');
  assert(updateProfRes.data.data.weight === 75, 'Profile weight updated');
  assert(updateProfRes.data.data.goal === 'MUSCLE_GAIN', 'Profile goal updated');

  // Test 7: Food Library
  console.log('\n--- 7. Food Library Operations ---');
  const foodsRes = await request(`${API_BASE}/foods`, { headers: currentAuth });
  assert(foodsRes.status === 200, 'GET /api/foods returns 200 OK');
  assert(foodsRes.data.data.length > 50, 'Default seeded foods exist (> 50 items)');

  const searchFoods = await request(`${API_BASE}/foods?search=chicken`, { headers: currentAuth });
  assert(searchFoods.data.data.length > 0, 'Searching for chicken returns results');
  const chickenFood = searchFoods.data.data[0];

  // Create custom food
  const customFoodRes = await request(`${API_BASE}/foods`, {
    method: 'POST',
    headers: currentAuth,
    body: JSON.stringify({
      name: 'Custom Protein Shake',
      servingSize: 300,
      calories: 250,
      protein: 35,
      carbs: 10,
      fat: 5,
    }),
  });
  assert(customFoodRes.status === 201, 'POST /api/foods creates custom food');
  const customFoodId = customFoodRes.data.data.id;

  // Update custom food
  const updateFoodRes = await request(`${API_BASE}/foods/${customFoodId}`, {
    method: 'PUT',
    headers: currentAuth,
    body: JSON.stringify({ calories: 260 }),
  });
  assert(updateFoodRes.status === 200, 'PUT /api/foods/:id updates food');
  assert(updateFoodRes.data.data.calories === 260, 'Updated food calories verified');

  // Test 8: Meal Logging
  console.log('\n--- 8. Meal Logging Operations ---');
  const todayStr = new Date().toISOString().split('T')[0];
  const mealRes = await request(`${API_BASE}/meals`, {
    method: 'POST',
    headers: currentAuth,
    body: JSON.stringify({
      mealType: 'BREAKFAST',
      date: todayStr,
      items: [
        { foodId: chickenFood.id, quantity: 1.5 },
        { foodId: customFoodId, quantity: 1 },
      ],
      notes: 'Post morning workout',
    }),
  });
  assert(mealRes.status === 201, 'POST /api/meals logs meal');
  const mealId = mealRes.data.data.id;
  assert(mealRes.data.data.items.length === 2, 'Meal contains 2 logged items');

  // Get daily meals and totals
  const dailyMealsRes = await request(`${API_BASE}/meals?date=${todayStr}`, { headers: currentAuth });
  assert(dailyMealsRes.status === 200, 'GET /api/meals?date returns 200 OK');
  assert(dailyMealsRes.data.data.meals.length >= 1, 'Daily meals list contains logged meal');
  assert(dailyMealsRes.data.data.totals.calories > 0, 'Totals calculated correctly');

  // Test 9: Food Deletion Protection
  console.log('\n--- 9. Food In-Use Deletion Protection ---');
  const delUsedFoodRes = await request(`${API_BASE}/foods/${customFoodId}`, {
    method: 'DELETE',
    headers: currentAuth,
  });
  assert(
    delUsedFoodRes.status === 400 || delUsedFoodRes.status === 409,
    'Deleting a food currently in use is safely rejected'
  );

  // Test 10: Water Tracking
  console.log('\n--- 10. Water Tracking Operations ---');
  const waterRes = await request(`${API_BASE}/water`, {
    method: 'POST',
    headers: currentAuth,
    body: JSON.stringify({ amount: 500, date: todayStr }),
  });
  assert(waterRes.status === 201, 'POST /api/water logs 500ml');
  const waterLogId = waterRes.data.data.id;

  const waterListRes = await request(`${API_BASE}/water?date=${todayStr}`, { headers: currentAuth });
  assert(waterListRes.status === 200, 'GET /api/water?date returns 200 OK');
  assert(waterListRes.data.data.total >= 500, 'Daily water total includes logged amount');

  // Test 11: Weight Tracking
  console.log('\n--- 11. Weight Tracking Operations ---');
  const weightRes = await request(`${API_BASE}/weights`, {
    method: 'POST',
    headers: currentAuth,
    body: JSON.stringify({ weight: 74.8, date: todayStr, notes: 'Morning weigh-in' }),
  });
  assert(weightRes.status === 201 || weightRes.status === 200, 'POST /api/weights logs weight');

  const weightList = await request(`${API_BASE}/weights?days=30`, { headers: currentAuth });
  assert(weightList.status === 200, 'GET /api/weights returns 200 OK');
  assert(weightList.data.data.length >= 1, 'Weight entry is in history');

  // Test 12: Dashboard Summary
  console.log('\n--- 12. Dashboard & Analytics ---');
  const dashRes = await request(`${API_BASE}/dashboard?date=${todayStr}`, { headers: currentAuth });
  assert(dashRes.status === 200, 'GET /api/dashboard returns 200 OK');
  assert(dashRes.data.data.nutrition.consumed.calories > 0, 'Dashboard reflects consumed calories');
  assert(dashRes.data.data.water.consumed >= 500, 'Dashboard reflects water intake');
  assert(dashRes.data.data.currentWeight === 74.8, 'Dashboard reflects current weight');

  const analyticsRes = await request(`${API_BASE}/analytics?period=7d`, { headers: currentAuth });
  assert(analyticsRes.status === 200, 'GET /api/analytics returns 200 OK');
  assert(analyticsRes.data.data.nutritionTrend.length >= 1, 'Analytics trend has daily data');

  // Test 13: Search & Activity
  console.log('\n--- 13. Global Search & Activity Timeline ---');
  const searchRes = await request(`${API_BASE}/search?q=chicken`, { headers: currentAuth });
  assert(searchRes.status === 200, 'GET /api/search returns 200 OK');
  assert(searchRes.data.data.foods.length > 0, 'Search returns matching foods');
  assert(searchRes.data.data.meals.length > 0, 'Search returns matching logged meals');

  const actRes = await request(`${API_BASE}/activity?limit=10`, { headers: currentAuth });
  assert(actRes.status === 200, 'GET /api/activity returns 200 OK');
  assert(actRes.data.data.length >= 3, 'Activity timeline includes meal, water, and weight logs');

  // Test 14: Data Exports
  console.log('\n--- 14. Data Exports ---');
  const exportMealsRes = await request(`${API_BASE}/export/meals`, { headers: currentAuth });
  assert(exportMealsRes.status === 200, 'GET /api/export/meals returns 200 OK');
  assert(exportMealsRes.headers['content-type'].includes('text/csv'), 'Meals export content-type is text/csv');

  const exportWeeklyRes = await request(`${API_BASE}/export-weekly`, { headers: currentAuth });
  assert(exportWeeklyRes.status === 200, 'GET /api/export-weekly returns 200 OK');
  assert(exportWeeklyRes.data.data.summary.daysLogged >= 1, 'Weekly report contains logged days');

  // Test 15: Clean Deletions
  console.log('\n--- 15. Clean Deletion of Test Records ---');
  const delMealRes = await request(`${API_BASE}/meals/${mealId}`, { method: 'DELETE', headers: currentAuth });
  assert(delMealRes.status === 200, 'DELETE /api/meals/:id deletes meal');

  const delFoodNowRes = await request(`${API_BASE}/foods/${customFoodId}`, { method: 'DELETE', headers: currentAuth });
  assert(delFoodNowRes.status === 200, 'DELETE /api/foods/:id succeeds after meal is deleted');

  // Test 16: Logout
  console.log('\n--- 16. Logout ---');
  const logoutRes = await request(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: currentAuth,
    body: JSON.stringify({ refreshToken }),
  });
  assert(logoutRes.status === 200, 'POST /api/auth/logout succeeds');

  // Summary
  console.log('\n=======================================');
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
