import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAllCategories, addCategory, deleteCategory } from '../db.js';

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
    if (window.confirm('Usunąć kategorię?')) {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  if (loading) return <div>Ładowanie kategorii...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📂 Kategorie</h2>
      <div className="mb-4 flex gap-2 items-end">
        <input
          type="text"
          placeholder="Nazwa kategorii"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2"
        >
          <option value="expense">Wydatek</option>
          <option value="income">Przychód</option>
        </select>
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ➕ Dodaj
        </button>
      </div>
      <ul className="divide-y">
        {categories.map(({ id, name, type }) => (
          <li key={id} className="py-2 flex justify-between items-center">
            <div>
              <span className="font-semibold">{name}</span>{' '}
              <span className="text-sm text-gray-500">
                ({type === 'income' ? 'Przychód' : 'Wydatek'})
              </span>
            </div>
            <button
              onClick={() => handleDelete(id)}
              className="text-red-500 hover:text-red-700"
            >
              ❌ Usuń
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
