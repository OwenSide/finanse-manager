import { v4 as uuidv4 } from "uuid";
import { getAllTransactions, addTransaction, updateTransaction } from "../db"; 

export async function processRecurringTransactions() {
  const transactions = await getAllTransactions();
  const today = new Date();
  
  // 1. Берем только активные подписки
  const activeSubscriptions = transactions.filter(t => t.isRecurring === true);

  let changesMade = false;

  for (const t of activeSubscriptions) {
    const lastDate = new Date(t.date); // Дата создания (например, 17-е число)
    let nextDate = new Date(lastDate); // Копия даты для расчетов

    // 2. Вычисляем дату СЛЕДУЮЩЕГО платежа строго от даты предыдущего
    // Это сохраняет число (17 янв -> 17 фев -> 17 мар)
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
        // Если частота не задана, по умолчанию считаем месяц
        nextDate.setMonth(lastDate.getMonth() + 1);
        break;
    }

    // 3. Проверяем: Наступил ли уже день платежа?
    // (nextDate <= today) означает, что дата платежа уже прошла или сегодня
    if (nextDate <= today) {
      console.log(`🔄 Обработка подписки: ${t.comment || "Без названия"} на ${nextDate.toLocaleDateString()}`);

      // А. Создаем новую транзакцию (Клон)
      const newTransaction = {
        ...t,
        id: uuidv4(),
        // 🔥 ВАЖНО: Ставим дату не "сегодня", а ту, которая ДОЛЖНА БЫТЬ (17-е число)
        date: nextDate.toISOString(), 
        isRecurring: true, // Новая транзакция становится активной подпиской
      };

      // Б. Старую транзакцию отправляем в архив (снимаем галочку)
      const archivedTransaction = {
        ...t,
        isRecurring: false, // Отключаем, чтобы не сработало повторно
        wasRecurring: true, // 🔥 ДОБАВЛЯЕМ: Метка, что это была подписка
      };

      // В. Сохраняем обе в базу
      await addTransaction(newTransaction);
      await updateTransaction(archivedTransaction);
      
      changesMade = true;
    }
  }

  return changesMade;
}