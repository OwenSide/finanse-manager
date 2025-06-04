import { fetchExchangeRates } from "../api/exchangeRates";
import { saveExchangeRate } from "../db";

export async function syncExchangeRates() {
  const rates = await fetchExchangeRates();

  for (const currency of Object.keys(rates)) {
    await saveExchangeRate({
      currency,
      rateToPLN: rates[currency],
      updatedAt: new Date().toISOString(),
    });
  }

  return rates;
}
