import { openDB } from "idb";
import { v4 as uuidv4 } from "uuid";

const DB_NAME = "FinanceManagerDB";
const DB_VERSION = 6; // Версия базы
const STORE_CATEGORIES = "categories";
const STORE_TRANSACTIONS = "transactions";
const STORE_WALLETS = "wallets";
const STORE_EXCHANGE_RATES = "exchangeRates"; 

// Твои стандартные категории
const DEFAULT_CATEGORIES = [
  { name: "Jedzenie", type: "expense", icon: "shopping-cart", color: "orange" },
  { name: "Dom", type: "expense", icon: "home", color: "blue" },
  { name: "Transport", type: "expense", icon: "car", color: "red" },
  { name: "Rozrywka", type: "expense", icon: "film", color: "purple" },
  { name: "Zdrowie", type: "expense", icon: "heart", color: "green" },
  { name: "Wynagrodzenie", type: "income", icon: "briefcase", color: "emerald" },
  { name: "Prezenty", type: "income", icon: "gift", color: "pink" }
];

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      
      // 1. Создаем таблицу Кошельков
      if (!db.objectStoreNames.contains(STORE_WALLETS)) {
        db.createObjectStore(STORE_WALLETS, { keyPath: "id" }); 
      }

      // 2. Создаем таблицу Транзакций
      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        db.createObjectStore(STORE_TRANSACTIONS, { keyPath: "id" });
      }

      // 3. Создаем таблицу Курсов
      if (!db.objectStoreNames.contains(STORE_EXCHANGE_RATES)) {
        db.createObjectStore(STORE_EXCHANGE_RATES, { keyPath: "currency" });
      }

      // 4. Создаем таблицу Категорий и НАПОЛНЯЕМ ЕЁ
      // Этот код сработает только один раз при создании таблицы
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        const store = db.createObjectStore(STORE_CATEGORIES, { keyPath: "id" });
        
        // 🔥 Цикл добавления дефолтных категорий
        DEFAULT_CATEGORIES.forEach(cat => {
            store.add({ id: uuidv4(), ...cat });
        });
      }
    },
  });
}


// --- Wallets ---

export async function getAllWallets() {
  const db = await getDB();
  return db.getAll(STORE_WALLETS);
}

export async function addWallet(wallet) {
  const db = await getDB();
  return db.put(STORE_WALLETS, wallet);
}

export async function deleteWallet(id) {
  const db = await getDB();
  return db.delete(STORE_WALLETS, id);
}

// --- Exchange Rates ---
export async function saveExchangeRate(rate) {
  const db = await getDB();
  return db.put(STORE_EXCHANGE_RATES, rate); 
}

export async function getExchangeRate(currency) {
  const db = await getDB();
  return db.get(STORE_EXCHANGE_RATES, currency);
}

export async function getAllExchangeRates() {
  const db = await getDB();
  return db.getAll(STORE_EXCHANGE_RATES);
}

// --- Categories ---

export async function getAllCategories() {
  const db = await getDB();
  return db.getAll(STORE_CATEGORIES);
}

export async function addCategory(category) {
  const db = await getDB();
  return db.put(STORE_CATEGORIES, category);
}

export async function deleteCategory(id) {
  const db = await getDB();
  return db.delete(STORE_CATEGORIES, id);
}

// --- Transactions ---

export async function getAllTransactions() {
  const db = await getDB();
  return db.getAll(STORE_TRANSACTIONS);
}

export async function addTransaction(transaction) {
  const db = await getDB();
  return db.put(STORE_TRANSACTIONS, transaction);
}

export async function updateTransaction(transaction) {
  const db = await getDB();
  return db.put(STORE_TRANSACTIONS, transaction);
}

export async function deleteTransaction(id) {
  const db = await getDB();
  return db.delete(STORE_TRANSACTIONS, id);
}