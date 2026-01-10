import { 
  ShoppingCart, Home, Car, Film, Heart, Briefcase, Gift, Tag, HelpCircle, 
  Coffee, Utensils, Smartphone, Wifi, Zap // Добавил еще парочку популярных
} from 'lucide-react';

// Карта иконок (строка из БД -> Компонент)
const iconMap = {
  "shopping-cart": ShoppingCart,
  "home": Home,
  "car": Car,
  "film": Film,
  "heart": Heart,
  "briefcase": Briefcase,
  "gift": Gift,
  "coffee": Coffee,
  "utensils": Utensils,
  "smartphone": Smartphone,
  "wifi": Wifi,
  "zap": Zap,
  "tag": Tag,
};

export default function CategoryIcon({ iconName, size = 20, className = "" }) {
  // Ищем иконку по имени. Если нет (или имя null), берем Tag
  const IconComponent = iconMap[iconName] || Tag;

  return <IconComponent size={size} className={className} />;
}