export const emptyItem = {
  productId: 1,
  amount: 1,
  locked: false
};

export const emptyMeal = {
  items: [{ ...emptyItem }],
  priority: "protein"
};
