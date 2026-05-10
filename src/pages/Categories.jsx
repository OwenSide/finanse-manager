import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAllCategories, addCategory, deleteCategory, updateCategory, getAllTransactions } from '../db.js';
import { ArrowLeft, FolderOpen, Plus, Trash2, Loader2, X, Check, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import CategoryIcon from '../components/CategoryIcon';
import IconPicker from '../components/IconPicker';

// 🔥 Подключаем переводы
import { useTranslation } from 'react-i18next';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // 🔥 Вытягиваем функцию t
  const { t } = useTranslation();

  useEffect(() => {
    async function loadCategories() {
      const allCats = await getAllCategories();
      const sorted = (allCats || []).sort((a, b) => a.name.localeCompare(b.name));
      setCategories(sorted);
      setLoading(false);
    }
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category); 
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    if (editingCategory) {
        const updatedCategory = { 
            ...editingCategory,
            ...categoryData,  
        };
        
        await updateCategory(updatedCategory);
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c).sort((a, b) => a.name.localeCompare(b.name)));
    } else {
        const newCategory = { 
            id: uuidv4(), 
            ...categoryData, 
            color: "gray" 
        };
        
        await addCategory(newCategory);
        setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        
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
        // 🔥 Перевод предупреждения
        alert(t('categories.deleteWarning'));
        return;
    }

    // 🔥 Перевод подтверждения
    if (window.confirm(t('categories.deleteConfirm'))) {
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
        
    <div className="sticky top-0 z-20 bg-[#0B0E14]/80 backdrop-blur-md -mx-4 px-4 pb-4 min-[450px]:-mx-6 min-[450px]:px-6 min-[450px]:pt-6 mb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/10">
                    <FolderOpen size={20} />
                </div>
                {/* 🔥 Заголовок */}
                <h2 className="text-2xl font-bold text-white">{t('categories.title')}</h2>
            </div>

            <button 
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
                <Plus size={24} />
            </button>
        </div>

        {/* TABS */}
        <div className="flex p-1 bg-[#151A23] rounded-2xl border border-white/5">
            <button 
                onClick={() => setActiveTab('expense')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "expense" 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                    : "text-gray-400 hover:text-white"
                }`}
            >
                {t('categories.expenses')}
            </button>
            <button 
                onClick={() => setActiveTab('income')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "income" 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-gray-400 hover:text-white"
                }`}
            >
                {t('categories.incomes')}
            </button>
        </div>

    </div>

      {/* СПИСОК */}
      {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-6">
              <div className={`
                  relative w-full max-w-sm p-8 rounded-[2rem] flex flex-col items-center text-center overflow-hidden
                  border-2 border-dashed
                  ${activeTab === 'expense' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}
              `}>
                  
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 blur-3xl rounded-full pointer-events-none opacity-50 ${activeTab === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`} />

                  <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center mb-5 relative z-10 shadow-lg border
                      ${activeTab === 'expense' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10'}
                  `}>
                      <FolderOpen size={32} />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 relative z-10">
                      {/* 🔥 Перевод пустых состояний */}
                      {activeTab === 'expense' ? t('categories.emptyExpense') : t('categories.emptyIncome')}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mb-6 relative z-10">
                      {t('categories.emptyDesc')}
                  </p>

                  <button 
                      onClick={openCreateModal} 
                      className={`
                          relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg
                          ${activeTab === 'expense' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}
                      `}
                  >
                      <Plus size={18} strokeWidth={3} />
                      {t('categories.addFirst')}
                  </button>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCategories.map((cat) => (
                  <CategoryCard 
                    key={cat.id} 
                    cat={cat} 
                    onDelete={handleDelete}
                    onEdit={openEditModal}
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
        initialData={editingCategory}
      />
      
    </div>
  );
}

// --- КАРТОЧКА КАТЕГОРИИ ---
function CategoryCard({ cat, onDelete, onEdit }) {
    // 🔥 Тоже подключаем t() для карточки
    const { t } = useTranslation();

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
                        {/* 🔥 Перевод: Выдаток/Приход */}
                        {cat.type === 'income' ? t('categories.incomeSingle') : t('categories.expenseSingle')}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(cat)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                >
                    <Pencil size={18} />
                </button>
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
function AddCategoryModal({ isOpen, onClose, onSave, initialType, initialData }) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Tag');
    const [type, setType] = useState(initialType);
    
    // 🔥 Подключаем t() для модалки
    const { t } = useTranslation();

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
                    initial={{ x: "100%" }} 
                    animate={{ x: 0 }} 
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[200] bg-[#0B0E14] flex flex-col pt-[max(1rem,env(safe-area-inset-top))]"
                >
                    <div className={`absolute top-0 left-0 w-full h-[400px] opacity-30 pointer-events-none transition-colors duration-500 ${
                        type === 'expense' 
                        ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-600/40 via-rose-600/0 to-transparent' 
                        : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/40 via-emerald-600/0 to-transparent'
                    }`} />
                    
                    {/* --- 1. ШАПКА --- */}
                    <div className="flex items-center justify-between px-4 pb-0 py-4 sticky top-0 z-20 bg-transparent">
                        <button 
                            onClick={onClose}
                            className="p-2 -ml-2 text-gray-400 hover:text-white active:scale-95 transition-transform flex items-center justify-center"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <h3 className="text-lg font-bold text-white absolute left-1/2 -translate-x-1/2">
                            {/* 🔥 Перевод: Редактировать / Создать новую */}
                            {initialData ? t('categories.modalEditTitle') : t('categories.modalNewTitle')}
                        </h3>

                        <div className="w-10" /> 
                    </div>

                    {/* --- 2. КОНТЕНТ --- */}
                    <div className="flex-1 overflow-y-auto p-6 relative">
                        <div className="relative z-10 max-w-md mx-auto space-y-8 mt-4">
                            
                            {/* Переключатель типа */}
                            <div className="flex p-1 bg-[#151A23] rounded-2xl border border-white/10 shadow-lg">
                                <button 
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? "bg-rose-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    {t('categories.expenses')}
                                </button>
                                <button 
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'income' ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    {t('categories.incomes')}
                                </button>
                            </div>

                            {/* Поле ввода */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">{t('categories.categoryName')}</label>
                                <div className="relative group">
                                    <input
                                        autoFocus
                                        maxLength={13} 
                                        type="text"
                                        placeholder={t('categories.namePlaceholder')} // 🔥 Плейсхолдер
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
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1 mb-3 block">{t('categories.icon')}</label>
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
                                    {/* 🔥 Кнопка: Сохранить или Создать */}
                                    {initialData ? t('categories.saveBtn') : t('categories.createBtn')}
                                </span>
                            </button>
                        </div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}