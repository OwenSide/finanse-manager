import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
// 🔥 Добавил updateCategory в импорт
import { getAllCategories, addCategory, deleteCategory, updateCategory, getAllTransactions } from '../db.js';
// 🔥 Добавил Pencil (карандаш)
import { ArrowLeft, FolderOpen, Plus, Trash2, Loader2, X, Check, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import CategoryIcon from '../components/CategoryIcon';
import IconPicker from '../components/IconPicker';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Вкладка на главной странице (фильтр списка)
  const [activeTab, setActiveTab] = useState('expense'); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 🔥 Новое состояние: какую категорию мы сейчас редактируем (null = создаем новую)
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      const allCats = await getAllCategories();
      const sorted = (allCats || []).sort((a, b) => a.name.localeCompare(b.name));
      setCategories(sorted);
      setLoading(false);
    }
    loadCategories();
  }, []);

  // Открытие модалки для СОЗДАНИЯ
  const openCreateModal = () => {
    setEditingCategory(null); // Сбрасываем, это новая запись
    setIsModalOpen(true);
  };

  // Открытие модалки для РЕДАКТИРОВАНИЯ
  const openEditModal = (category) => {
    setEditingCategory(category); // Запоминаем, кого правим
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    if (editingCategory) {
        // --- ЛОГИКА ОБНОВЛЕНИЯ (UPDATE) ---
        const updatedCategory = { 
            ...editingCategory, // сохраняем старый ID
            ...categoryData,    // новые name, icon, type
            // color оставляем старый или меняем, если добавишь выбор цвета
        };
        
        await updateCategory(updatedCategory);
        
        // Обновляем список локально
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c).sort((a, b) => a.name.localeCompare(b.name)));
    } else {
        // --- ЛОГИКА СОЗДАНИЯ (CREATE) ---
        const newCategory = { 
            id: uuidv4(), 
            ...categoryData, 
            color: "gray" 
        };
        
        await addCategory(newCategory);
        setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        
        // Переключаем вкладку, если создали категорию другого типа
        if (newCategory.type !== activeTab) {
            setActiveTab(newCategory.type);
        }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    const allTxs = await getAllTransactions();
    const hasLinkedTxs = allTxs.some(t => t.categoryId === id);

    if (hasLinkedTxs) {
        alert("⚠️ Nie można usunąć tej kategorii!\n\nIstnieją transakcje powiązane z tą kategorią.");
        return;
    }

    if (window.confirm('Usunąć kategorię bezpowrotnie?')) {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  const filteredCategories = categories.filter(c => c.type === activeTab);

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-indigo-400">
        <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 min-[450px]:p-6">
        
      {/* --- ОБЩИЙ ПРИЛИПАЮЩИЙ БЛОК (ШАПКА + ТАБЫ) --- */}
    <div className="sticky top-0 z-20 bg-[#0B0E14]/85 backdrop-blur-xl -mx-4 px-4 pt-2 pb-4 min-[450px]:-mx-6 min-[450px]:px-6 min-[450px]:pt-6 mb-2">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/10">
                    <FolderOpen size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Kategorie</h2>
            </div>

            <button 
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
                <Plus size={24} />
            </button>
        </div>

        {/* TABS (Фильтр списка) */}
        {/* Обрати внимание: отсюда я убрал sticky и backdrop-blur, так как они теперь у родителя */}
        <div className="flex p-1 bg-[#151A23] rounded-2xl border border-white/5">
            <button 
                onClick={() => setActiveTab('expense')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "expense" 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                    : "text-gray-400 hover:text-white"
                }`}
            >
                Wydatki
            </button>
            <button 
                onClick={() => setActiveTab('income')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "income" 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-gray-400 hover:text-white"
                }`}
            >
                Przychody
            </button>
        </div>

    </div>

      {/* СПИСОК */}
      {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-600">
                  <FolderOpen size={32} />
              </div>
              <p className="text-sm font-medium">Brak kategorii tego typu</p>
              <button onClick={openCreateModal} className="text-indigo-400 text-xs font-bold mt-2 uppercase tracking-wider hover:text-indigo-300">
                  Dodaj pierwszą
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCategories.map((cat) => (
                  <CategoryCard 
                    key={cat.id} 
                    cat={cat} 
                    onDelete={handleDelete}
                    onEdit={openEditModal} // 🔥 Передаем функцию редактирования
                  />
              ))}
          </div>
      )}

      {/* МОДАЛКА */}
      <AddCategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveCategory}
        initialType={activeTab}
        initialData={editingCategory} // 🔥 Передаем данные для редактирования
      />
      
    </div>
  );
}

// --- КАРТОЧКА КАТЕГОРИИ ---
function CategoryCard({ cat, onDelete, onEdit }) {
    return (
        <div className="glass-card p-4 rounded-2xl flex justify-between items-center group hover:bg-white/5 transition-colors border border-white/5 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center border text-xl shadow-lg
                    ${cat.type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10'}
                `}>
                    <CategoryIcon iconName={cat.icon} size={22} />
                </div>
                <div>
                    <p className="font-bold text-white text-base">{cat.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider opacity-60">
                        {cat.type === 'income' ? 'Przychód' : 'Wydatek'}
                    </p>
                </div>
            </div>

            {/* Блок кнопок */}
            <div className="flex gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                {/* 🔥 Кнопка РЕДАКТИРОВАТЬ */}
                <button
                    onClick={() => onEdit(cat)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                >
                    <Pencil size={18} />
                </button>

                {/* Кнопка УДАЛИТЬ */}
                <button
                    onClick={() => onDelete(cat.id)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

// --- МОДАЛЬНОЕ ОКНО ---
// --- 🔥 ПОЛНОЭКРАННОЕ ОКНО (SLIDE-IN) ---
function AddCategoryModal({ isOpen, onClose, onSave, initialType, initialData }) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Tag');
    const [type, setType] = useState(initialType);
    
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setIcon(initialData.icon);
                setType(initialData.type);
            } else {
                setName('');
                setIcon('Tag');
                setType(initialType);
            }
        }
    }, [isOpen, initialType, initialData]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({ name, icon, type });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    // 🔥 АНИМАЦИЯ: Выезжает СПРАВА (x: 100% -> x: 0)
                    initial={{ x: "100%" }} 
                    animate={{ x: 0 }} 
                    exit={{ x: "100%" }}
                    // Настройка плавности (Spring physics)
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    
                    // Позиционирование: фиксировано, на весь экран, поверх всего
                    className="fixed inset-0 z-[200] bg-[#0B0E14] flex flex-col"
                >
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 blur-[90px] opacity-20 pointer-events-none transition-colors duration-500 ${type === 'expense' ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                    {/* --- 1. ШАПКА (HEADER) --- */}
                    <div className="flex items-center justify-between px-4 pb-0 py-4 sticky top-0 z-20 bg-transparent">
                        <button 
                            onClick={onClose}
                            className="p-2 -ml-2 text-gray-400 hover:text-white active:scale-95 transition-transform flex items-center justify-center"
                        >
                            {/* Только стрелка */}
                            <ArrowLeft size={24} />
                        </button>

                        <h3 className="text-lg font-bold text-white absolute left-1/2 -translate-x-1/2">
                            {initialData ? "Edycja" : "Nowa kategoria"}
                        </h3>

                        {/* Пустой блок справа, чтобы флекс-контейнер работал корректно */}
                        <div className="w-10" /> 
                    </div>

                    {/* --- 2. КОНТЕНТ (SCROLLABLE) --- */}
                    <div className="flex-1 overflow-y-auto p-6 relative">
                        
                        {/* Фоновый свет (Glow) */}
                        

                        <div className="relative z-10 max-w-md mx-auto space-y-8 mt-4">
                            
                            {/* Переключатель типа */}
                            <div className="flex p-1 bg-[#151A23] rounded-2xl border border-white/10 shadow-lg">
                                <button 
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? "bg-rose-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    Wydatki
                                </button>
                                <button 
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'income' ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    Przychody
                                </button>
                            </div>

                            {/* Поле ввода */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">Nazwa kategorii</label>
                                <div className="relative group">
                                    <input
                                        autoFocus
                                        maxLength={13} 
                                        type="text"
                                        placeholder="np. Zakupy"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#151A23] border border-white/10 group-focus-within:border-indigo-500/50 rounded-2xl p-5 pr-16 text-white text-xl placeholder-gray-600 focus:outline-none transition-all font-bold shadow-lg"
                                    />
                                    <span className={`absolute right-5 top-1/2 -translate-x-0 -translate-y-1/2 text-xs font-mono transition-colors ${
                                        name.length === 13 ? "text-rose-500 font-bold" : "text-gray-500"
                                    }`}>
                                        {name.length}/13
                                    </span>
                                </div>
                            </div>

                            {/* Выбор иконки */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1 mb-3 block">Ikona</label>
                                <div className="bg-[#151A23] border border-white/10 rounded-2xl p-4 shadow-lg">
                                    <IconPicker 
                                        selectedIcon={icon} 
                                        onSelect={setIcon} 
                                        type={type} 
                                    />
                                </div>
                            </div>

                        </div>

                        {/* --- 3. ФУТЕР (КНОПКА) --- */}
                        <div className="p-4 bg-transparent pb-safe">
                            <button
                                onClick={handleSubmit}
                                disabled={!name.trim()}
                                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg max-w-md mx-auto ${
                                    !name.trim() 
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                    : type === 'expense' 
                                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20" 
                                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                                }`}
                            >
                                <Check size={22} strokeWidth={3} />
                                <span>
                                    {initialData ? "Zapisz zmiany" : "Utwórz kategorię"}
                                </span>
                            </button>
                        </div>
                    </div>


                </motion.div>
            )}
        </AnimatePresence>
    );
}