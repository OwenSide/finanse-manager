import React from 'react';
import { 
  
  Tag, HelpCircle, MoreHorizontal,
 
  Wallet, DollarSign, CreditCard, Briefcase, Landmark, PiggyBank, TrendingUp,
 
  ShoppingCart, ShoppingBag, Gift, Package, Shirt,
 
  Coffee, Utensils, Beer, Wine, 
  
  Home, Car, Bus, Plane, Fuel, Bike, CarFront,

  Zap, Wifi, Phone, Smartphone, Tv, Hammer, Wrench,

  Gamepad2, Music, Film, Heart, Smile, Book, GraduationCap,
  Youtube, Clapperboard, Ticket,

  Dumbbell, Stethoscope, Baby, Dog, Palette, Globe, Scissors
} from 'lucide-react';

const iconMap = {
  "tag": Tag,
  "wallet": Wallet,
  "dollar-sign": DollarSign,
  "credit-card": CreditCard,
  "briefcase": Briefcase,
  "bank": Landmark,
  "piggy": PiggyBank,
  "invest": TrendingUp,  

  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  "gift": Gift,
  "package": Package,
  "clothes": Shirt,       

  "coffee": Coffee,
  "utensils": Utensils,
  "beer": Beer,
  "wine": Wine,

  "home": Home,
  "car": Car,
  "taxi": CarFront,       
  "bus": Bus,
  "plane": Plane,
  "fuel": Fuel,
  "bike": Bike,

  "zap": Zap,
  "wifi": Wifi,
  "phone": Phone,
  "smartphone": Smartphone,
  "tv": Tv,
  "repair": Hammer,
  "service": Wrench,

  "youtube": Youtube,
  "netflix": Clapperboard,
  "cinema": Ticket,
  "gamepad": Gamepad2,
  "music": Music,
  "film": Film,
  
  "gym": Dumbbell,
  "health": Stethoscope,
  "beauty": Scissors,    
  "baby": Baby,
  "pet": Dog,
  "art": Palette,
  "travel": Globe,
  
  "heart": Heart,
  "smile": Smile,
  "book": Book,
  "graduation-cap": GraduationCap,
  "other": MoreHorizontal, 
  
  "help-circle": HelpCircle
};

export default function CategoryIcon({ iconName, size = 20, className = "" }) {
  const IconComponent = iconMap[iconName] || iconMap[iconName?.toLowerCase()] || Tag;
  return <IconComponent size={size} className={className} />;
}