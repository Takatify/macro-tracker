function calculatePFC(foodItem, gram, foodsDB) {
    const item = foodsDB[foodItem];
    if (!item) {
      throw new Error(`${foodItem} がデータベースに存在しません`);
    }
  
    const factor = gram / 100;
  
    return {
      calorie: +(item.calorie * factor).toFixed(1),
      protein: +(item.protein * factor).toFixed(1),
      fat: +(item.fat * factor).toFixed(1),
      carb: +(item.carb * factor).toFixed(1),
    };
  }
  
  module.exports = { calculatePFC };
  