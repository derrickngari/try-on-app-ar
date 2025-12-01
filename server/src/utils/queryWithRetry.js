function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function queryWithRetry(axiosCall, retries = 3, delayMs = 2000) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await axiosCall();
    } catch (err) {
      const status = err.response?.status;
      if (status === 429 || status === 403) {        
        const retryDelay = delayMs * Math.pow(2, attempt);
        console.warn(`M-Pesa ${status} (Incapsula/RateLim). Retrying in ${retryDelay}s... (${attempt + 1}/${retries})`);
        await delay(retryDelay);
        attempt++;
      } else {
        throw err;
      }
    }
  }

  throw new Error("MPESA rate limit exceeded. Try again later.");
}

module.exports = { queryWithRetry };
