const emptyRow = () => ({
  productId: null,
  amount: ""
});

const mealWithRows = count =>
  Array.from({ length: count }, emptyRow);

export function createStarterPreset() {
  return {
    plans: [
      {
        id: "workout",
        name: "Workout Day",
        meals: [
          { name: "Breakfast", items: mealWithRows(3) },
          { name: "Lunch", items: mealWithRows(3) },
          { name: "Post-workout", items: mealWithRows(1) },
          { name: "Dinner", items: mealWithRows(3) }
        ]
      },
      {
        id: "rest",
        name: "Rest Day",
        meals: [
          { name: "Breakfast", items: mealWithRows(3) },
          { name: "Lunch", items: mealWithRows(3) },
          { name: "Dinner", items: mealWithRows(3) }
        ]
      }
    ],
    activePlanId: "workout"
  };
}