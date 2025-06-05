import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAllWallets, addWallet, deleteWallet } from "../db.js";
import { getAllExchangeRates } from "../db";
import { syncExchangeRates } from "../utils/syncExchangeRates";
import { calculateWalletsInPLN } from "../utils/calculateWalletsInPLN";
import { getAllTransactions } from "../db";

const currencyList = ["PLN", "USD", "EUR", "GBP"];

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("PLN");

  useEffect(() => {
    getAllWallets().then(setWallets);
  }, []);

  useEffect(() => {
    async function loadAll() {
      const walletList = await getAllWallets();
      setWallets(walletList);

      await syncExchangeRates();
      const rates = await getAllExchangeRates();
      const txs = await getAllTransactions();

      const walletsWithBalance = calculateWalletsInPLN(walletList, txs, rates);
      setWallets(walletsWithBalance);
    }

    loadAll();
  }, []);


  const handleAdd = async () => {
    if (!name.trim()) return;
    const newWallet = { id: uuidv4(), name: name.trim(), currency };
    await addWallet(newWallet);
    setWallets((prev) => [...prev, newWallet]);
    setName("");
    setCurrency("PLN");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Usunąć portfel?")) {
      await deleteWallet(id);
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">💼 Portfele</h2>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <input
          type="text"
          placeholder="Nazwa portfela"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border p-2 w-full"
        >
          {currencyList.map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          ➕ Dodaj
        </button>
      </div>

      <ul className="divide-y">
        {wallets.map((w) => (
          <li key={w.id} className="py-2 flex justify-between items-center">
            <div>
              <span className="font-semibold">{w.name}</span>{" "}
              <span className="text-sm text-gray-500">({w.currency})</span>
            </div>
            <button
              onClick={() => handleDelete(w.id)}
              className="text-red-500 hover:text-red-700"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
