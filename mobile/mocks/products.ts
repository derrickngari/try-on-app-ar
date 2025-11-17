export type Category = 'Armchair' | 'Dining Chair' | 'Sofa' | 'Table' | 'Lamp';

export type ColorOption = {
  id: string;
  name: string;
  hex: string;
};

export type MaterialOption = {
  id: string;
  name: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;          // now in **KES**
  category: Category;
  description: string;
  image: string;
  images: string[];
  colors: ColorOption[];
  materials: MaterialOption[];
  badge?: string;
  rating: number;
  reviewCount: number;
};

export const colors: ColorOption[] = [
  { id: 'maroon', name: 'Maroon', hex: '#800020' },
  { id: 'green', name: 'Forest Green', hex: '#228B22' },
  { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
  { id: 'navy', name: 'Navy Blue', hex: '#000080' },
  { id: 'charcoal', name: 'Charcoal', hex: '#36454F' },
  { id: 'cream', name: 'Cream', hex: '#FFFDD0' },
];

export const materials: MaterialOption[] = [
  { id: 'copper', name: 'Copper', description: 'Warm metallic finish' },
  { id: 'silver', name: 'Silver', description: 'Polished chrome finish' },
  { id: 'gold', name: 'Gold', description: 'Luxurious gold plating' },
  { id: 'black-stained', name: 'Black Stained', description: 'Dark wood finish' },
  { id: 'oak', name: 'Oak Wood', description: 'Natural oak grain' },
  { id: 'brass', name: 'Brushed Brass', description: 'Matte brass finish' },
  { id: 'walnut', name: 'Walnut', description: 'Rich walnut wood' },
];

const EURO_TO_KES = 15;

export const products: Product[] = [
  {
    id: '1',
    name: 'Haines Armchair',
    price: Math.round(839.99 * EURO_TO_KES),
    category: 'Armchair',
    description:
      'Elegant and simple armchair crafted with quality materials for comfort and style. Features premium upholstery and solid wood frame construction. Perfect for living rooms, bedrooms, or reading nooks.',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
      'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80',
    ],
    colors: [colors[0], colors[1], colors[2]],
    materials: [materials[0], materials[4], materials[5]],
    badge: 'Top Pick',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    name: 'Blake Dining Chair',
    price: Math.round(1000.0 * EURO_TO_KES),
    category: 'Dining Chair',
    description:
      'Contemporary dining chair with sleek lines and exceptional comfort. Upholstered seat and backrest with sturdy metal legs. Ideal for modern dining spaces.',
    image:
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80',
    ],
    colors: [colors[0], colors[3], colors[4]],
    materials: [materials[0], materials[1], materials[6]],
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: '3',
    name: 'Dorothy Table',
    price: Math.round(178.99 * EURO_TO_KES),
    category: 'Table',
    description:
      'Minimalist side table with clean geometric design. Solid wood construction with metal accents. Perfect as a bedside table or accent piece.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80',
    ],
    colors: [colors[4], colors[2], colors[5]],
    materials: [materials[3], materials[4], materials[6]],
    badge: 'Best Value',
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: '4',
    name: 'Luxe Velvet Sofa',
    price: Math.round(2499.99 * EURO_TO_KES),
    category: 'Sofa',
    description:
      'Statement three-seater sofa with plush velvet upholstery. Deep seating with premium cushioning and elegant curved arms. Transforms any living space.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    ],
    colors: [colors[0], colors[1], colors[3]],
    materials: [materials[0], materials[1], materials[2]],
    badge: 'Premium',
    rating: 4.9,
    reviewCount: 203,
  },
  {
    id: '5',
    name: 'Arc Floor Lamp',
    price: Math.round(349.99 * EURO_TO_KES),
    category: 'Lamp',
    description:
      'Modern arc floor lamp with adjustable height. Marble base for stability with brushed metal finish. Provides ambient lighting for reading areas.',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
    ],
    colors: [colors[1], colors[4], colors[5]],
    materials: [materials[1], materials[2], materials[5]],
    rating: 4.5,
    reviewCount: 78,
  },
  {
    id: '6',
    name: 'Windsor Dining Chair',
    price: Math.round(425.0 * EURO_TO_KES),
    category: 'Dining Chair',
    description:
      'Classic spindle-back dining chair reimagined for modern homes. Solid wood construction with comfortable contoured seat. Timeless design meets durability.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1506439773649-6e0c8cfb237?w=800&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80',
    ],
    colors: [colors[3], colors[4], colors[6]],
    materials: [materials[3], materials[4], materials[6]],
    rating: 4.4,
    reviewCount: 92,
  },
  {
    id: '7',
    name: 'Nordic Armchair',
    price: Math.round(699.99 * EURO_TO_KES),
    category: 'Armchair',
    description:
      'Scandinavian-inspired armchair with clean lines and natural materials. Ergonomic design with soft cushioning. Brings warmth and simplicity to any room.',
    image:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    ],
    colors: [colors[2], colors[4], colors[5]],
    materials: [materials[4], materials[6]],
    badge: 'New Arrival',
    rating: 4.7,
    reviewCount: 67,
  },
  {
    id: '8',
    name: 'Grand Oak Table',
    price: Math.round(1899.0 * EURO_TO_KES),
    category: 'Table',
    description:
      'Expansive dining table in solid oak with live edge detail. Seats 8-10 people comfortably. Natural wood grain variations make each piece unique.',
    image:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
      'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80',
    ],
    colors: [colors[4], colors[6]],
    materials: [materials[4], materials[6]],
    badge: 'Top Pick',
    rating: 4.9,
    reviewCount: 134,
  },
  {
    id: '9',
    name: 'Minimalist Table Lamp',
    price: Math.round(129.99 * EURO_TO_KES),
    category: 'Lamp',
    description:
      'Sleek table lamp with touch-sensitive dimmer. Cylindrical design with ceramic base. Perfect for desks, nightstands, or side tables.',
    image:
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1543198126-a8ad8e47a917?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
    ],
    colors: [colors[2], colors[4], colors[5]],
    materials: [materials[1], materials[5]],
    rating: 4.3,
    reviewCount: 45,
  },
  {
    id: '10',
    name: 'Chesterfield Sofa',
    price: Math.round(3299.0 * EURO_TO_KES),
    category: 'Sofa',
    description:
      'Iconic button-tufted sofa with rolled arms and luxe leather upholstery. Hand-crafted with traditional techniques. A statement piece that ages beautifully.',
    image:
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    ],
    colors: [colors[0], colors[4]],
    materials: [materials[0], materials[3], materials[6]],
    badge: 'Premium',
    rating: 5.0,
    reviewCount: 89,
  },
];

export const categories: Category[] = [
  'Armchair',
  'Dining Chair',
  'Sofa',
  'Table',
  'Lamp',
];