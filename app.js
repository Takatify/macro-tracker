// --- 設定：目標（実際は外部JSON化予定） ---
const goal = {
  calorie: 2000,
  protein: 150,
  fat: 60,
  carb: 250
};

// --- 食品データの読み込み ---
let foods = {};

// foods.jsonを読み込む
async function loadFoodsData() {
  try {
    const response = await fetch('./data/foods.json');
    foods = await response.json();
  } catch (error) {
    console.error('食品データの読み込みに失敗しました:', error);
    // フォールバック用のデフォルトデータ
    foods = {
      "白米": { "calorie": 168, "protein": 2.5, "fat": 0.3, "carb": 37.1 },
      "鶏むね肉": { "calorie": 110, "protein": 23, "fat": 1.5, "carb": 0 }
    };
  }
}

// --- ローカル保存データの読み込み ---
const today = new Date().toISOString().split('T')[0];
const storageKey = `macro-log-${today}`;

let todayLog = JSON.parse(localStorage.getItem(storageKey) || '[]');

// --- PFC計算関数 ---
function calculatePFC(foodName, gram) {
  if (!foods[foodName]) {
    throw new Error(`食品「${foodName}」はデータベースに存在しません`);
  }

  const factor = gram / 100;
  const item = foods[foodName];
  
  return {
    calorie: +(item.calorie * factor).toFixed(1),
    protein: +(item.protein * factor).toFixed(1),
    fat: +(item.fat * factor).toFixed(1),
    carb: +(item.carb * factor).toFixed(1)
  };
}

// --- 累計PFC計算 ---
function getTotal(log) {
  return log.reduce((sum, item) => {
    sum.calorie += item.calorie;
    sum.protein += item.protein;
    sum.fat += item.fat;
    sum.carb += item.carb;
    return sum;
  }, { calorie: 0, protein: 0, fat: 0, carb: 0 });
}

// --- 画面更新 ---
function updateSummary() {
  const total = getTotal(todayLog);

  document.getElementById('summary').innerHTML = `
    <ul>
      <li>カロリー: ${total.calorie.toFixed(1)} / ${goal.calorie} kcal</li>
      <li>たんぱく質: ${total.protein.toFixed(1)} / ${goal.protein} g</li>
      <li>脂質: ${total.fat.toFixed(1)} / ${goal.fat} g</li>
      <li>炭水化物: ${total.carb.toFixed(1)} / ${goal.carb} g</li>
    </ul>
  `;
}

// --- 食品一覧の更新 ---
function updateFoodsList() {
  const foodsList = document.getElementById('foods-list');
  const foodNames = Object.keys(foods).sort();
  
  foodsList.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
      ${foodNames.map(foodName => `
        <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px; background: #f9f9f9;">
          <strong>${foodName}</strong><br>
          カロリー: ${foods[foodName].calorie}kcal<br>
          たんぱく質: ${foods[foodName].protein}g<br>
          脂質: ${foods[foodName].fat}g<br>
          炭水化物: ${foods[foodName].carb}g
        </div>
      `).join('')}
    </div>
  `;
}

// --- 新しい食品の追加 ---
async function addNewFood(foodName, nutritionData) {
  foods[foodName] = nutritionData;
  
  // ローカルストレージに保存（実際のアプリではサーバーに送信）
  localStorage.setItem('custom-foods', JSON.stringify(foods));
  
  updateFoodsList();
}

// --- イベントハンドラ ---
document.getElementById('input-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const foodName = document.getElementById('food').value.trim();
  const gram = parseFloat(document.getElementById('gram').value);

  if (!foodName || !gram) {
    alert('食品名とグラム数を入力してください');
    return;
  }

  try {
    const result = calculatePFC(foodName, gram);
    
    // 食品名も記録に含める
    const logEntry = {
      foodName: foodName,
      gram: gram,
      ...result
    };

    todayLog.push(logEntry);
    localStorage.setItem(storageKey, JSON.stringify(todayLog));
    updateSummary();

    document.getElementById('food').value = '';
    document.getElementById('gram').value = '';
  } catch (error) {
    alert(error.message);
  }
});

// --- 食品追加フォームのイベントハンドラ ---
document.getElementById('add-food-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const foodName = document.getElementById('new-food-name').value.trim();
  const calorie = parseFloat(document.getElementById('new-food-calorie').value);
  const protein = parseFloat(document.getElementById('new-food-protein').value);
  const fat = parseFloat(document.getElementById('new-food-fat').value);
  const carb = parseFloat(document.getElementById('new-food-carb').value);

  if (!foodName || isNaN(calorie) || isNaN(protein) || isNaN(fat) || isNaN(carb)) {
    alert('すべての項目を正しく入力してください');
    return;
  }

  if (foods[foodName]) {
    alert(`食品「${foodName}」は既にデータベースに存在します`);
    return;
  }

  const nutritionData = {
    calorie: calorie,
    protein: protein,
    fat: fat,
    carb: carb
  };

  addNewFood(foodName, nutritionData);

  // フォームをクリア
  document.getElementById('add-food-form').reset();
  alert(`食品「${foodName}」を追加しました！`);
});

// --- 初期化 ---
async function initialize() {
  await loadFoodsData();
  
  // カスタム食品データの読み込み
  const customFoods = localStorage.getItem('custom-foods');
  if (customFoods) {
    const customFoodsData = JSON.parse(customFoods);
    foods = { ...foods, ...customFoodsData };
  }
  
  updateSummary();
  updateFoodsList();
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', initialize);
  