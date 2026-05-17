import { openDB } from "idb";
import { v4 as uuidv4 } from "uuid";

const DB_NAME = "FinanceManagerDB";
const DB_VERSION = 6;
const STORE_CATEGORIES = "categories";
const STORE_TRANSACTIONS = "transactions";
const STORE_WALLETS = "wallets";
const STORE_EXCHANGE_RATES = "exchangeRates"; 

const DEFAULT_CATEGORIES = [
  { id: "default-food", name: "Food", type: "expense", icon: "shopping-cart", color: "orange" },
  { id: "default-home", name: "Home", type: "expense", icon: "home", color: "blue" },
  { id: "default-transport", name: "Transport", type: "expense", icon: "car", color: "red" },
  { id: "default-entertainment", name: "Entertainment", type: "expense", icon: "film", color: "purple" },
  { id: "default-health", name: "Health", type: "expense", icon: "heart", color: "green" },
  { id: "default-salary", name: "Salary", type: "income", icon: "briefcase", color: "emerald" },
  { id: "default-gifts", name: "Gifts", type: "income", icon: "gift", color: "pink" }
];

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      
      if (!db.objectStoreNames.contains(STORE_WALLETS)) {
        db.createObjectStore(STORE_WALLETS, { keyPath: "id" }); 
      }

      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        db.createObjectStore(STORE_TRANSACTIONS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE_EXCHANGE_RATES)) {
        db.createObjectStore(STORE_EXCHANGE_RATES, { keyPath: "currency" });
      }

      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        const store = db.createObjectStore(STORE_CATEGORIES, { keyPath: "id" });
        
        DEFAULT_CATEGORIES.forEach(cat => {
            store.put(cat); 
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

export const updateWallet = async (updatedWallet) => {
  const db = await getDB(); // 🔥 Исправили initDB на getDB
  return db.put(STORE_WALLETS, updatedWallet);
};

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

export const updateCategory = async (updatedCategory) => {
  const db = await getDB(); // 🔥 Исправили initDB на getDB
  return db.put(STORE_CATEGORIES, updatedCategory);
};

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

export async function clearAllData(restoreDefaults = true) {
  const db = await getDB();
  
  await db.clear(STORE_TRANSACTIONS); 
  await db.clear(STORE_WALLETS);      
  await db.clear(STORE_CATEGORIES);

  if (restoreDefaults) {
    const txCat = db.transaction(STORE_CATEGORIES, 'readwrite');
    
    await Promise.all(
      DEFAULT_CATEGORIES.map(cat => {
        return txCat.store.put(cat);
      })
    );
    
    await txCat.done;
  }

  return true;
}