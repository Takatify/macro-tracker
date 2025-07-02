// --- 設定：食品データと目標（実際は外部JSON化予定） ---
const foods = {
    "鶏むね肉": { calorie: 110, protein: 23, fat: 1.5, carb: 0 },
    "ごはん": { calorie: 168, protein: 2.5, fat: 0.3, carb: 37.1 },
    "卵": { calorie: 151, protein: 12.3, fat: 10.3, carb: 0.3 }
  };
  
  const goal = {
    calorie: 2000,
    protein: 150,
    fat: 60,
    carb: 250
  };
  
  // --- ローカル保存データの読み込み ---
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `macro-log-${today}`;
  
  let todayLog = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
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
  
  // --- イベントハンドラ ---
  document.getElementById('input-form').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const foodName = document.getElementById('food').value.trim();
    const gram = parseFloat(document.getElementById('gram').value);
  
    if (!foods[foodName]) {
      alert(`食品「${foodName}」はデータベースに存在しません`);
      return;
    }
  
    const factor = gram / 100;
    const item = foods[foodName];
    const result = {
      calorie: +(item.calorie * factor).toFixed(1),
      protein: +(item.protein * factor).toFixed(1),
      fat: +(item.fat * factor).toFixed(1),
      carb: +(item.carb * factor).toFixed(1)
    };
  
    todayLog.push(result);
    localStorage.setItem(storageKey, JSON.stringify(todayLog));
    updateSummary();
  
    document.getElementById('food').value = '';
    document.getElementById('gram').value = '';
  });
  
  // --- 初期表示 ---
  updateSummary();
  