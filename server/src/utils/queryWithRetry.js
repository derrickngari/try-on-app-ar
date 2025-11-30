function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function queryWithRetry(axiosCall, retries = 3) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await axiosCall();
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn(`Rate limit hit. Retrying in 3 seconds... (${attempt + 1}/${retries})`);
        await delay(3000);
        attempt++;
      } else {
        throw err;
      }
    }
  }

  throw new Error("MPESA rate limit exceeded. Try again later.");
}

module.exports = { queryWithRetry };
