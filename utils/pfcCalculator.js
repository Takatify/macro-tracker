/**
 * 食品名とグラム数からPFCを計算する関数
 * @param {string} foodName - 食品名
 * @param {number} gram - グラム数
 * @param {Object} foodsDB - 食品データベース
 * @returns {Object} 計算されたPFC値
 */
function calculatePFC(foodName, gram, foodsDB) {
  if (!foodsDB[foodName]) {
    throw new Error(`食品「${foodName}」はデータベースに存在しません`);
  }

  const factor = gram / 100;
  const item = foodsDB[foodName];

  return {
    foodName: foodName,
    gram: gram,
    calorie: +(item.calorie * factor).toFixed(1),
    protein: +(item.protein * factor).toFixed(1),
    fat: +(item.fat * factor).toFixed(1),
    carb: +(item.carb * factor).toFixed(1),
  };
}

/**
 * 食品データベースに新しい食品を追加する関数
 * @param {string} foodName - 食品名
 * @param {Object} nutritionData - 栄養データ（100gあたり）
 * @param {Object} foodsDB - 食品データベース
 * @returns {Object} 更新された食品データベース
 */
function addFoodToDatabase(foodName, nutritionData, foodsDB) {
  if (foodsDB[foodName]) {
    throw new Error(`食品「${foodName}」は既にデータベースに存在します`);
  }

  foodsDB[foodName] = nutritionData;
  return foodsDB;
}

/**
 * 食品データベースから食品を削除する関数
 * @param {string} foodName - 食品名
 * @param {Object} foodsDB - 食品データベース
 * @returns {Object} 更新された食品データベース
 */
function removeFoodFromDatabase(foodName, foodsDB) {
  if (!foodsDB[foodName]) {
    throw new Error(`食品「${foodName}」はデータベースに存在しません`);
  }

  delete foodsDB[foodName];
  return foodsDB;
}

module.exports = { 
  calculatePFC, 
  addFoodToDatabase, 
  removeFoodFromDatabase 
};
  