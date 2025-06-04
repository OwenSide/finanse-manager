export async function fetchExchangeRates(base = "PLN") {
  const response = await fetch("https://api.nbp.pl/api/exchangerates/tables/A?format=json");
  const data = await response.json();

  const table = data[0].rates;
  const rates = {};

  for (const item of table) {
    rates[item.code] = item.mid; // например: USD -> 4.2
  }

  // Добавим PLN как 1:1
  rates["PLN"] = 1;

  return rates; // { USD: 4.2, EUR: 4.6, GBP: 5.3, PLN: 1 }
}
