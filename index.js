const fs = require('fs');
const readline = require('readline');
const { calculatePFC } = require('./utils/pfcCalculator');

// 食品データと目標を読み込む
const foods = JSON.parse(fs.readFileSync('./data/foods.json', 'utf-8'));
const goal = JSON.parse(fs.readFileSync('./data/goal.json', 'utf-8'));

// 日付とログファイルパス
const today = new Date().toISOString().split('T')[0];
const logFilePath = `./logs/${today}.json`;

// 今日の記録データがあれば読み込む
let todayLog = [];
if (fs.existsSync(logFilePath)) {
  todayLog = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
}

// 累計用の初期化
let total = { calorie: 0, protein: 0, fat: 0, carb: 0 };
todayLog.forEach(entry => {
  total.calorie += entry.calorie;
  total.protein += entry.protein;
  total.fat += entry.fat;
  total.carb += entry.carb;
});

// ユーザー入力の受付
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`\n🍽️ 食事記録を始めます！（例：ごはん 120）\n`);

rl.question('食品名とグラム数を半角スペースで入力してね：', (answer) => {
  const [foodName, gramStr] = answer.trim().split(' ');
  const gram = parseFloat(gramStr);

  if (!foods[foodName]) {
    console.log(`⚠️ ${foodName} は登録されていません`);
    rl.close();
    return;
  }

  const result = calculatePFC(foodName, gram, foods);

  total.calorie += result.calorie;
  total.protein += result.protein;
  total.fat += result.fat;
  total.carb += result.carb;

  console.log(`\n✅ ${gram}gの ${foodName} に含まれる栄養素：`);
  console.table(result);

  console.log(`\n📊 今日の合計摂取量（目標に対する進捗）：`);
  console.table({
    カロリー: `${total.calorie} / ${goal.calorie} kcal`,
    タンパク質: `${total.protein} / ${goal.protein} g`,
    脂質: `${total.fat} / ${goal.fat} g`,
    炭水化物: `${total.carb} / ${goal.carb} g`,
  });

  // ログに追加・保存
  todayLog.push(result);
  fs.writeFileSync(logFilePath, JSON.stringify(todayLog, null, 2), 'utf-8');

  console.log('\n💾 記録を保存しました！');
  rl.close();
});
