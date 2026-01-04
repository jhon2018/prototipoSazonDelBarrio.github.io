
import { MenuItem } from './types';

export const WHATSAPP_NUMBER = "994987745";
export const WHATSAPP_LINK = `https://wa.me/51${WHATSAPP_NUMBER}`;
export const APP_NAME = "SAZÓN DEL BARRIO";
export const APP_TAGLINE = "EL SABOR DE LOS ÁNGELES";
export const LOCATION_SUBTITLE = "DESDE LOS ÁNGELES CITY";

// Datos de Pago
export const YAPE_NAME = "Jonathan Vera Segura";
export const YAPE_PHONE = "994 987 745";
export const YAPE_QR_PATH = "/QRjonathan.jpeg";
export const CONTACT_EMAIL = "jhonvs93@hotmail.com";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Rollo Broster',
    description: 'Pollo broster crujiente enrollado con papas amarillas y cremas de la casa.',
    price: 13.00,
    category: 'Brosters',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: '2',
    name: 'Alita Broster',
    description: 'Alitas bañadas en harina especial y fritas al momento.',
    price: 9.00,
    category: 'Brosters',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Chaufa Broster',
    description: 'Arroz chaufa al wok con trozos de pollo broster y cebollita china.',
    price: 17.00,
    category: 'Chaufas',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: '4',
    name: 'Chaufa Alita',
    description: 'Nuestro chaufa clásico con alitas crujientes bien doradas.',
    price: 15.00,
    category: 'Chaufas',
    image: 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?auto=format&fit=crop&q=80'
  },
  {
    id: '5',
    name: 'Chaufa Especial',
    description: 'Fusión de carnes y huevo en un arroz chaufa premium.',
    price: 13.00,
    category: 'Chaufas',
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80'
  },
  {
    id: '6',
    name: 'Lomo Saltado',
    description: 'Carne jugosa salteada con tomate, cebolla roja y papas fritas.',
    price: 13.00,
    category: 'Platos Especiales',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: '7',
    name: 'Churrasco a la Parrilla',
    description: 'Corte de churrasco tierno con guarnición de papas y ensalada.',
    price: 13.00,
    category: 'Platos Especiales',
    image: 'data:image/jpeg;base64,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'
  },
  {
    id: '8',
    name: 'Chuleta Dorada',
    description: 'Chuleta de cerdo seleccionada, frita con el toque del barrio.',
    price: 13.00,
    category: 'Platos Especiales',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80'
  },
  {
    id: '9',
    name: 'Aeropuerto',
    description: 'La mezcla perfecta: Chaufa, tallarines saltados y frejol chino.',
    price: 13.00,
    category: 'Chaufas',
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80'
  },
  {
    id: '10',
    name: 'Pollo a la plancha',
    description: 'Especialidad de la casa con aderezo secreto y cocción lenta.',
    price: 13.00,
    category: 'Platos Especiales',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhqJrFejDh70id3JKvkWuf0yd9DA5RYt8nfQ&s'
  },
  {
    id: '11',
    name: 'Salchi Broster',
    description: 'Salchipapa clásica coronada con trozos generosos de broster.',
    price: 15.00,
    category: 'Salchipapas',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80'
  },
  {
    id: '12',
    name: 'Salchi Alta',
    description: 'Doble ración de salchicha y huevo montado sobre papas.',
    price: 12.00,
    category: 'Salchipapas',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&q=80'
  },
  {
    id: '13',
    name: 'Salchipapa Simple',
    description: 'Papas fritas crocantes con hot dog y todas las cremas.',
    price: 8.00,
    category: 'Salchipapas',
    image: 'https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?auto=format&fit=crop&q=80'
  },
  {
    id: '14',
    name: 'Hamburguesa',
    description: 'Hamburguesa de carne pura con el toque Jessin.',
    price: 6.50,
    category: 'Hamburguesas',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80'
  },
  // {
  //   id: '15',
  //   name: 'Especial Sábados',
  //   description: 'Caldo de gallina concentrado o plato del día (Solo Sábados).',
  //   price: 13.00,
  //   category: 'Especiales',
  //   image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80'
  // }
];
