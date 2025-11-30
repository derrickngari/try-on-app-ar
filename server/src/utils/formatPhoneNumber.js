const formatPhoneNumber = (phone, countryCode) => {
  let normalized = phone.replace(/[^\d]/g, '');
  if (normalized.startsWith('0')) normalized = countryCode + normalized.slice(1);
  if (normalized.startsWith('7') || normalized.startsWith('1')) normalized = countryCode + normalized;
  if (normalized.length === 12 && normalized.startsWith(countryCode)) return + normalized;

  return normalized;
};

module.exports = { formatPhoneNumber };