import { openDB } from "idb";

const DB_NAME = "FinanceManagerDB";
const DB_VERSION = 5;
const STORE_CATEGORIES = "categories";
const STORE_TRANSACTIONS = "transactions";
const STORE_WALLETS = "wallets";
const STORE_EXCHANGE_RATES = "exchangeRates"; 

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        db.createObjectStore(STORE_CATEGORIES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        db.createObjectStore(STORE_TRANSACTIONS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_WALLETS)) {
        db.createObjectStore(STORE_WALLETS, { keyPath: "id" }); 
      }
      if (!db.objectStoreNames.contains(STORE_EXCHANGE_RATES)) {
        db.createObjectStore(STORE_EXCHANGE_RATES, { keyPath: "currency" });
      }
    },
  });
}


// --- Wallets ---

export async function getAllWallets() {
  const db = await getDB();
  return db.getAll("wallets");
}

export async function addWallet(wallet) {
  const db = await getDB();
  return db.put("wallets", wallet);
}

export async function deleteWallet(id) {
  const db = await getDB();
  return db.delete("wallets", id);
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
  return db.put(STORE_CATEGORIES, category); // put добавит или перезапишет
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
