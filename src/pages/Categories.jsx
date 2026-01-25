import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAllCategories, addCategory, deleteCategory, getAllTransactions } from '../db.js';
import { FolderOpen, Plus, Trash2, Loader2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import CategoryIcon from '../components/CategoryIcon';
import IconPicker from '../components/IconPicker';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Вкладка на главной странице (фильтр списка)
  const [activeTab, setActiveTab] = useState('expense'); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const allCats = await getAllCategories();
      const sorted = (allCats || []).sort((a, b) => a.name.localeCompare(b.name));
      setCategories(sorted);
      setLoading(false);
    }
    loadCategories();
  }, []);

  const handleSaveCategory = async (newCategoryData) => {
    const newCategory = { 
        id: uuidv4(), 
        ...newCategoryData, // name, icon, type
        color: "gray" 
    };
    
    await addCategory(newCategory);
    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
    setIsModalOpen(false);
    
    // Если пользователь создал категорию другого типа, переключаем вкладку, чтобы он её увидел
    if (newCategory.type !== activeTab) {
        setActiveTab(newCategory.type);
    }
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
        
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/10">
                <FolderOpen size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">Kategorie</h2>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* TABS (Фильтр списка) */}
      <div className="flex p-1 bg-[#151A23] rounded-2xl border border-white/5 mb-6 sticky top-0 z-10 backdrop-blur-xl bg-opacity-80">
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

      {/* СПИСОК */}
      {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-600">
                  <FolderOpen size={32} />
              </div>
              <p className="text-sm font-medium">Brak kategorii tego typu</p>
              <button onClick={() => setIsModalOpen(true)} className="text-indigo-400 text-xs font-bold mt-2 uppercase tracking-wider hover:text-indigo-300">
                  Dodaj pierwszą
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCategories.map((cat) => (
                  <CategoryCard key={cat.id} cat={cat} onDelete={handleDelete} />
              ))}
          </div>
      )}

      {/* МОДАЛКА */}
      <AddCategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveCategory}
        initialType={activeTab} // Начинаем с того типа, который открыт в списке
      />
      
    </div>
  );
}

// --- КАРТОЧКА КАТЕГОРИИ ---
function CategoryCard({ cat, onDelete }) {
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
            <button
                onClick={() => onDelete(cat.id)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all opacity-50 group-hover:opacity-100"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}

// --- МОДАЛЬНОЕ ОКНО С ВЫБОРОМ ТИПА ---
function AddCategoryModal({ isOpen, onClose, onSave, initialType }) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Tag');
    const [type, setType] = useState(initialType);
    
    useEffect(() => {
        if (isOpen) {
            setName('');
            setIcon('Tag');
            setType(initialType);
        }
    }, [isOpen, initialType]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({ name, icon, type });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#151A23] border border-white/10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl pointer-events-auto relative overflow-hidden flex flex-col max-h-[85vh]">
                            
                            {/* Фоновый свет */}
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 blur-[80px] opacity-20 pointer-events-none transition-colors duration-500 ${type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`} />

                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
                                <h3 className="text-xl font-bold text-white">Nowa kategoria</h3>
                                <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Переключатель типа */}
                            <div className="flex p-1 bg-[#0B0E14] rounded-xl border border-white/10 mb-6 relative z-10 shrink-0">
                                <button 
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${type === 'expense' ? "bg-rose-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    Wydatki
                                </button>
                                <button 
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${type === 'income' ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    Przychody
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto -mx-2 px-2 pb-2 mb-4 scrollbar-hide">
                                
                                {/* Input Name */}
                                <div className="mb-6 relative z-10">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">Nazwa</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="np. Zakupy"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                {/* 🔥 ВОТ ТВОЙ КОМПОНЕНТ 🔥 */}
                                <div className="mb-2 relative z-10">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 mb-3 block">Wybierz ikonę</label>
                                    
                                    <IconPicker 
                                        selectedIcon={icon} 
                                        onSelect={setIcon} 
                                        type={type} // Передаем тип, чтобы цвета совпадали
                                    />
                                </div>
                            </div>

                            {/* Footer Button */}
                            <div className="pt-2 mt-auto relative z-10 shrink-0 border-t border-white/5">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!name.trim()}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg mt-2 ${
                                        !name.trim() 
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                        : type === 'expense' 
                                            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20" 
                                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                                    }`}
                                >
                                    <Check size={20} strokeWidth={3} />
                                    <span>Utwórz kategorię</span>
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}