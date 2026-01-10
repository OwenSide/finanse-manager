import { fetchExchangeRates } from "../api/exchangeRates";
import { saveExchangeRate } from "../db";

export async function syncExchangeRates() {
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
    console.log("✅ Курсы обновлены через интернет");
    return true;

  } catch (error) {
    console.warn("⚠️ Нет интернета. Синхронизация пропущена.");
    return false;
  }
}