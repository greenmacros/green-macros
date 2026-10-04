// Sample plans for the "Load preset" option. `meals` reference STARTER_PRODUCTS by their English name;
// amounts are in each product's own unit (g, ml, unit or scoop).
export const STARTER_PLANS = [
  {
    key: "workoutDay",
    color: "#3ddc97",
    target: { calories: 2000, protein: 125, carbs: 260, fat: 60 },
    meals: [
      {
        key: "breakfast",
        items: [["Oats (dry)", 70], ["Soy Milk (unsweetened)", 200], ["Banana", 1], ["Peanut Butter", 15], ["Blueberries", 50]]
      },
      {
        key: "lunch",
        items: [["Brown Rice (cooked)", 190], ["Tempeh", 100], ["Broccoli", 150], ["Olive Oil", 5]]
      },
      {
        key: "postWorkout",
        items: [["Protein Shake (powder)", 1], ["Banana", 1], ["Soy Milk (unsweetened)", 250]]
      },
      {
        key: "dinner",
        items: [["Whole Wheat Pasta (cooked)", 140], ["Tofu (firm)", 250], ["Lentils (cooked)", 100], ["Spinach", 100], ["Tomato", 150], ["Olive Oil", 5]]
      }
    ]
  },
  {
    key: "restDay",
    color: "#60a5fa",
    target: { calories: 1800, protein: 115, carbs: 200, fat: 70 },
    meals: [
      {
        key: "breakfast",
        items: [["Whole Wheat Bread", 2], ["Avocado", 50], ["Tofu (firm)", 200], ["Tomato", 100], ["Soy Milk (unsweetened)", 200]]
      },
      {
        key: "lunch",
        items: [["Quinoa (cooked)", 220], ["Edamame (shelled)", 150], ["Tofu (firm)", 100], ["Carrot", 100], ["Olive Oil", 10]]
      },
      {
        key: "dinner",
        items: [["Sweet Potato (baked)", 200], ["Tempeh", 150], ["Chickpeas (cooked)", 100], ["Mushrooms", 150]]
      }
    ]
  }
];

/** Which sample plan each weekday (Mon–Sun) uses. */
export const STARTER_WEEK = ["workoutDay", "workoutDay", "restDay", "workoutDay", "workoutDay", "restDay", "restDay"];
