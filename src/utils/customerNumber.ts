// Generate a unique customer number (e.g., 235cr5)
export const generateCustomerNumber = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from({ length: 5 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');

  return randomPart;
};

// Format customer number as "N° XXXXX"
export const formatCustomerNumber = (number: string): string => {
  return `N°${number}`;
};
