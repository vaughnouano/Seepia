export const pricing = {
  "g7x-mark-iii": {
    "1-2day": 500,
    "3-4day": 470,
    custom: 400,
  },
  "osmo-pocket-4": {
    "1-2day": 500,
    "3-4day": 450,
    custom: 400,
  },
  "fz55-pixpro": {
    "1-2day": 350,
    "3-4day": 300,
    custom: 250,
  },
};

// server-side-safe calculation — reused wherever total_price needs recalculating
export function calculateTotalPrice(cameraId, durationType, numberOfDays) {
  const rate = pricing[cameraId]?.[durationType];
  if (!rate) return 0;
  return rate * numberOfDays;
}
