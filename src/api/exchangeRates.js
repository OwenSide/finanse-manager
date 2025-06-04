export async function fetchExchangeRates(base = "PLN") {
  const response = await fetch("https://api.nbp.pl/api/exchangerates/tables/A?format=json");
  const data = await response.json();

  const table = data[0].rates;
  const rates = {};

  for (const item of table) {
    rates[item.code] = item.mid; 
  }

  rates["PLN"] = 1;

  return rates; 
}
