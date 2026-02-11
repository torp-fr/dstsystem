// Generate a sequential customer number based on date and sequence
// Format: YYYYMM-NNNNN (e.g., 202602-00001)
export const generateCustomerNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const datePrefix = `${year}${month}`;

  // Generate a random sequence number for uniqueness within the same month
  const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, '0');

  return `${datePrefix}-${sequence}`;
};

// Format customer number as "N° XXXXX" or "N° YYYYMM-XXXXX"
export const formatCustomerNumber = (number: string): string => {
  return `N°${number}`;
};
