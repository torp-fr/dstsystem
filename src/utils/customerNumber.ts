// Generate a random alphanumeric customer number
// Format: 8-10 character code (e.g., 7K2M9PX4BQ)
export const generateCustomerNumber = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = Math.floor(Math.random() * 3) + 8; // Random length between 8 and 10

  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};

// Format customer number as "N° XXXXX"
export const formatCustomerNumber = (number: string): string => {
  return `N°${number}`;
};
