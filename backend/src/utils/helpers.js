const generateId = (prefix, lastNumber) => {
  const number = (lastNumber || 0) + 1;
  return `${prefix}${String(number).padStart(3, '0')}`;
};

const calculatePagination = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);
  return {
    skip: (p - 1) * l,
    limit: l,
    page: p,
  };
};

const generateRandomSegment = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateReceiptNumber = () => {
  return `RCP-${generateRandomSegment(4)}`;
};

module.exports = { generateId, calculatePagination, generateReceiptNumber };
