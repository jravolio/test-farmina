import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw } from "lucide-react";
import FilterPanel from "@/components/FilterPanel";
import ProductCard from "@/components/ProductCard";
import type { Product, FilterState, SpecialCareItem } from "@/types/product";

const initialFilters: FilterState = {
  foodType: "dry",
  petType: "dog",
  isPregnant: false,
  isLactating: false,
  lifeStage: "",
  specialCare: [],
  searchTerm: "",
};

export default function Index() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const username = import.meta.env.VITE_USER
  const password = import.meta.env.VITE_PASS  

  useEffect(() => {
    const fetchProducts = async () => {
      if (!filters.foodType) {
        setProducts([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://gw-c.petgenius.info/wfservice/z1/nutritionalplans/products/list",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa(username + ":" + password),
            },
            body: JSON.stringify({
              country: "MA",
              languageId: "20",
              productId: "0",
              productType: filters.foodType,
              type: "",
              appsAndEshop: true,
            }),
          }
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        const productsObj = data?.result?.products || {};
        const productsArr: Product[] = Object.values(productsObj).map((prod: any) => ({
          ...prod,
          id: String(prod.id ?? ""),
          name: prod.name || "Unknown Product",
          productType: filters.foodType as "dry" | "wet",
          petType: prod.type || "",
          lifeStage: prod.lifeStages ? Object.values(prod.lifeStages)[0] ?? "" : "",
          specialcares: prod.specialcares,
        }));
        setProducts(productsArr);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    };
    fetchProducts();
  }, [filters.foodType]);

  useEffect(() => {
    const results = products.filter((product) => {
      if (filters.searchTerm && !product.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.petType && product.petType !== filters.petType) return false;
      if (filters.lifeStage && product.lifeStage !== filters.lifeStage) return false;
      if (filters.isPregnant && !product.forPregnant) return false;
      if (filters.isLactating && !product.forLactating) return false;
      if (filters.specialCare.length > 0) {
        let productCareIds: string[] = [];
        if (Array.isArray(product.specialcares)) {
          productCareIds = (product.specialcares as SpecialCareItem[]).map(sc => sc.id);
        } else if (typeof product.specialcares === 'object' && product.specialcares !== null) {
          productCareIds = Object.values(product.specialcares as Record<string, SpecialCareItem>).map(sc => sc.id);
        }
        if (!filters.specialCare.some((filterCareId) => productCareIds.includes(filterCareId))) return false;
      }
      return true;
    });
    setSearchResults(results);
  }, [products, filters]);

  const handleFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setHasSearched(
      !!(
        newFilters.foodType ||
        newFilters.searchTerm ||
        newFilters.petType ||
        newFilters.lifeStage ||
        newFilters.isPregnant ||
        newFilters.isLactating ||
        newFilters.specialCare.length > 0
      )
    );
  };

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const onSearch = () => setHasSearched(true);

  const resetFilters = () => {
    setFilters(initialFilters);
    setHasSearched(false);
    if (!initialFilters.foodType) {
      setProducts([]);
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Pet Product Recommendation Tool</h1>
          <p className="mt-2 text-gray-600">Help customers find the perfect products for their pets</p>
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products by name..."
                value={filters.searchTerm}
                onChange={onSearchInputChange}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Product Filters
                  <Button variant="outline" size="sm" onClick={resetFilters} className="h-8 px-2">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </CardTitle>
                <CardDescription>
                  Configure pet characteristics to find suitable products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FilterPanel filters={filters} onSubmit={handleFilters} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            {isLoading && (
              <Card className="p-8 text-center">
                <CardContent>
                  <div className="text-gray-500">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                    <h3 className="text-lg font-medium">Loading products...</h3>
                  </div>
                </CardContent>
              </Card>
            )}
            {!isLoading && !hasSearched && (
                <Card className="p-12 text-center">
                  <CardContent>
                    <div className="text-gray-500">
                      <Search className="h-16 w-16 mx-auto mb-6 opacity-30" />
                      <h3 className="text-xl font-medium mb-4">
                        Ready to find the perfect products?
                      </h3>
                      <p className="text-lg mb-6">
                        Use the filters on the left. Products for '{filters.foodType}' food type will load automatically.
                      </p>
                    </div>
                  </CardContent>
                </Card>
            )}
            {!isLoading && hasSearched && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Recommended Products</h2>
                  <Badge variant="secondary" className="text-sm">
                    {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
                  </Badge>
                </div>
                {searchResults.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CardContent>
                      <div className="text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">
                          No products found
                        </h3>
                        <p>
                          Try adjusting your filters or search term.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchResults.map((product) => (
                      <ProductCard key={product.id || Math.random()} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}