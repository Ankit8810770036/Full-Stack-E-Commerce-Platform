// Utility for formatting prices in Indian Rupees (INR)

export const formatINR = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const numericAmount = Math.round(Number(amount));
  return '₹' + numericAmount.toLocaleString('en-IN');
};

export const formatINRWithDecimals = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0.00';
  }
  const numericAmount = Number(amount);
  return '₹' + numericAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
