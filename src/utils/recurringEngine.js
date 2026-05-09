import { v4 as uuidv4 } from "uuid";
import { getAllTransactions, addTransaction, updateTransaction } from "../db"; 

export async function processRecurringTransactions() {
  const transactions = await getAllTransactions();
  const today = new Date();
  
  const activeSubscriptions = transactions.filter(t => t.isRecurring === true);

  let changesMade = false;

  for (const t of activeSubscriptions) {
    const lastDate = new Date(t.date); 
    let nextDate = new Date(lastDate); 

    switch (t.frequency) {
      case "weekly":
        nextDate.setDate(lastDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(lastDate.getMonth() + 1);
        break;
      case "yearly":
        nextDate.setFullYear(lastDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(lastDate.getMonth() + 1);
        break;
    }

    if (nextDate <= today) {

      const newTransaction = {
        ...t,
        id: uuidv4(),
        date: nextDate.toISOString(), 
        isRecurring: true, 
      };

      const archivedTransaction = {
        ...t,
        isRecurring: false, 
        wasRecurring: true, // 
      };

      await addTransaction(newTransaction);
      await updateTransaction(archivedTransaction);
      
      changesMade = true;
    }
  }

  return changesMade;
}