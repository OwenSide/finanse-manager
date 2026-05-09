import React from "react";
import Flag from "react-world-flags";
import { CreditCard } from "lucide-react";

// 1. Оставляем константу внутри (можно не экспортировать, если она нужна только тут)
const currencyToCountry = {
  USD: "US", EUR: "EU", PLN: "PL", UAH: "UA", GBP: "GB", 
  CHF: "CH", CZK: "CZ", JPY: "JP", CNY: "CN", AUD: "AU", 
  CAD: "CA", SEK: "SE", KRW: "KR", NOK: "NO", DKK: "DK", 
  ISK: "IS", HUF: "HU", RON: "RO", BGN: "BG", MDL: "MD", 
  RSD: "RS", TRY: "TR", THB: "TH", IDR: "ID", INR: "IN", 
  BRL: "BR", MXN: "MX", PHP: "PH", ZAR: "ZA", ILS: "IL", 
  CLP: "CL", MYR: "MY", NZD: "NZ", SGD: "SG", HKD: "HK"
};

// 2. Делаем основной экспорт компонента
const WalletFlag = ({ currency, className = "" }) => {
  const countryCode = currencyToCountry[currency];

  if (!countryCode) {
    return (
      <div className={`flex items-center justify-center bg-white/5 rounded-full ${className}`}>
        <CreditCard size={18} className="text-gray-600" />
      </div>
    );
  }

  return (
    <div className={`aspect-square overflow-hidden rounded-full border border-white/5 bg-[#1A1F2B] shadow-inner flex items-center justify-center ${className}`}>
      <Flag 
        code={countryCode} 
        className="w-full h-full object-contain p-1 saturate-[0.9] brightness-[0.95]" 
        fallback={<CreditCard className="w-full h-full p-2 opacity-40" />}
      />
    </div>
    // <div className={`aspect-square overflow-hidden rounded-full border border-white/10 ${className}`}>
    //   <Flag 
    //     code={countryCode} 
    //     className="w-full h-full object-cover scale-110 saturate-[0.9] brightness-[0.95]" // scale-110 убирает возможные белые края
    //     fallback={<CreditCard className="w-full h-full p-2 opacity-40" />}
    //   />
    // </div>
  );
};

export default WalletFlag; // Обязательно default export для Vite