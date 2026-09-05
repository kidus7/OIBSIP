export const formatPrice = (price) => {
  const numericPrice = Number(price) || 0;
  return `₹${numericPrice.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
