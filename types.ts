
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Brosters' | 'Chaufas' | 'Platos Especiales' | 'Salchipapas' | 'Hamburguesas' | 'Especiales';
  image: string;
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
