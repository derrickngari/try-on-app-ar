export type Category = "Armchair" | "Dining Chair" | "Sofa" | "Table" | "Lamp";

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface MaterialOption {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  images: string[];
  colors: ColorOption[];
  materials: MaterialOption[];
  badge?: string;
  rating: number;
  reviewCount: number;
}