import { fetchExchangeRates } from "../api/exchangeRates";
import { saveExchangeRate } from "../db";

const LAST_SYNC_KEY = "lastRatesSyncTime";
const SYNC_INTERVAL = 12 * 60 * 60 * 1000; 

export async function syncExchangeRates() {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  const now = Date.now();

  if (lastSync && (now - parseInt(lastSync, 10) < SYNC_INTERVAL)) {
    console.log("⚡ Rates are fresh. Using local DB cache.");
    return true; 
  }

  try {
    const ratesMap = await fetchExchangeRates();

    const promises = Object.entries(ratesMap).map(([currency, rate]) => {
      return saveExchangeRate({
        currency: currency,
        rate: rate,
        date: new Date().toISOString()
      });
    });

    await Promise.all(promises);
    
    localStorage.setItem(LAST_SYNC_KEY, now.toString());
    console.log("✅ Exchange rates updated online");
    
    return true;

  } catch (error) {
    console.warn("⚠️ No internet connection. Synchronization skipped.");
    return false;
  }
}