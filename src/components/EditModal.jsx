import React, { useEffect } from "react";
import { X, Save, Calendar, Tag, Wallet, FileText, DollarSign } from "lucide-react";

export default function EditModal({ isOpen, transaction, onSave, onClose, categories, wallets }) {
  const [form, setForm] = React.useState({
    amount: "",
    categoryId: "",
    date: "",
    comment: "",
    walletId: "",
  });

  // Aktualizujemy formularz, gdy zmienia się wybrana transakcja
  useEffect(() => {
    if (transaction) {
      setForm({
        ...transaction,
        // Upewniamy się, że kwota jest liczbą lub pustym ciągiem
        amount: transaction.amount || "",
      });
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const handleSave = () => {
    onSave({ 
        ...form, 
        amount: parseFloat(form.amount),
        // Zachowujemy typ transakcji z oryginalnej kategorii lub samej transakcji
        type: categories.find(c => c.id === form.categoryId)?.type || form.type
    });
    onClose();
  };

  return (
    // Tło (Backdrop)
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      
      {/* Kontener Modala */}
      <div className="bg-[#151A23] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Nagłówek */}
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#1E2330]/50">
          <h2 className="text-xl font-bold text-white">Edytuj transakcję</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={24} />
          </button>
        </div>

        {/* Treść formularza */}
        <div className="p-6 space-y-4">
          
          {/* Kwota */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Kwota</label>
            <div className="relative">
                <input
                    type="number"
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-indigo-500 font-mono text-lg transition-all"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <DollarSign size={18} />
                </div>
            </div>
          </div>

          {/* Kategoria */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Kategoria</label>
            <div className="relative">
                <select
                    className="w-full appearance-none bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                    <option value="">Wybierz kategorię</option>
                    {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Tag size={18} />
                </div>
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Data</label>
            <div className="relative">
                <input
                    type="date"
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Calendar size={18} />
                </div>
            </div>
          </div>

          {/* Portfel */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Portfel</label>
            <div className="relative">
                <select
                    className="w-full appearance-none bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                    value={form.walletId}
                    onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                >
                    <option value="">Wybierz portfel</option>
                    {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.currency})</option>
                    ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Wallet size={18} />
                </div>
            </div>
          </div>

          {/* Komentarz */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Komentarz</label>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Brak komentarza"
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <FileText size={18} />
                </div>
            </div>
          </div>

        </div>

        {/* Stopka z przyciskami */}
        <div className="p-5 border-t border-white/5 bg-[#1E2330]/30 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
          >
            Anuluj
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Save size={18} /> Zapisz
          </button>
        </div>

      </div>
    </div>
  );
}