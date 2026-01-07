import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAllCategories, addCategory, deleteCategory } from '../db.js';
// Импортируем красивые иконки
import { FolderOpen, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      const allCats = await getAllCategories();
      setCategories(allCats);
      setLoading(false);
    }
    loadCategories();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const newCategory = { id: uuidv4(), name: name.trim(), type };
    await addCategory(newCategory);
    setCategories((prev) => [...prev, newCategory]);
    setName('');
  };

  const handleDelete = async (id) => {
    // Используем нативный confirm, но можно переделать на модалку
    if (window.confirm('Usunąć kategorię?')) {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  // Красивый лоадер
  if (loading) return (
    <div className="flex h-64 items-center justify-center text-indigo-400">
        <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 min-[450px]:p-6">
        
      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/10">
            <FolderOpen size={20} />
        </div>
        <h2 className="text-2xl font-bold text-white">Kategorie</h2>
      </div>

      {/* --- ФОРМА ДОБАВЛЕНИЯ (Стеклянная панель) --- */}
      <div className="glass-panel p-5 rounded-2xl mb-8 border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          
          {/* Поле ввода имени */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Nazwa</label>
            <input
              type="text"
              placeholder="np. Zakupy, Paliwo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Выбор типа */}
          <div className="w-full sm:w-40">
             <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Typ</label>
             <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="expense">Wydatek</option>
                  <option value="income">Przychód</option>
                </select>
                {/* Стрелочка для селекта */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
             </div>
          </div>

          {/* Кнопка Добавить */}
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Dodaj</span>
          </button>
        </div>
      </div>

      {/* --- СПИСОК КАТЕГОРИЙ --- */}
      <h3 className="text-lg font-bold text-gray-300 mb-4 px-1">Lista kategorii</h3>
      
      {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
              Brak kategorii. Dodaj pierwszą powyżej.
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map(({ id, name, type }) => (
              <div 
                key={id} 
                className="glass-card p-4 rounded-xl flex justify-between items-center group hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Иконка типа (Красная или Зеленая) */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border
                    ${type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}
                  `}>
                     {type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  
                  <div>
                    <p className="font-bold text-white">{name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {type === 'income' ? 'Przychód' : 'Wydatek'}
                    </p>
                  </div>
                </div>

                {/* Кнопка удалить */}
                <button
                  onClick={() => handleDelete(id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Usuń"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
      )}
    </div>
  );
}