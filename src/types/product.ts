
export interface SpecialCareItem {
  id: string;
  name: string;
};

export interface Product {
  id?: string | number;
  name: string;
  description?: string;
  image?: string;
  img?: string;
  img_thumbnail?: string;
  productType?: "dry" | "wet";
  type?: string;
  petType?: "dog" | "cat";
  forPregnant?: boolean;
  forLactating?: boolean;
  lifeStage?: string;
  benefits?: string | string[];
  specialcares?: SpecialCareItem[] | Record<string, SpecialCareItem>;
}

export interface FilterState {
  foodType: string;
  petType: string;
  isPregnant: boolean;
  isLactating: boolean;
  lifeStage: string;
  specialCare: string[];
  searchTerm: string;
}
