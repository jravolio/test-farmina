import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product, SpecialCareItem } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

function getNormalizedBenefits(benefits: Product['benefits']): string[] {
  if (Array.isArray(benefits)) {
    return benefits.slice(0, 3);
  }
  if (typeof benefits === "string" && benefits.trim().length > 0) {
    return benefits
      .split(/[\n;,]+/)
      .map((b) => b.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return [];
}

function getImageSource(product: Product): string {
  return product.img || "";
}

function getLifeStageLabel(lifeStage: Product['lifeStage']): string {
  if (!lifeStage) return "-";
  switch (lifeStage.toLowerCase()) {
    case "puppy-kitten":
      return "Puppy/Kitten";
    case "adult":
      return "Adult";
    case "senior":
      return "Senior";
    default:
      return lifeStage.charAt(0).toUpperCase() + lifeStage.slice(1);
  }
}

function getProductTypeLabel(
  productType: Product['productType'],
  fallbackType: Product['type']
): string {
  const typeToProcess = productType || fallbackType;
  if (typeToProcess === "dry") return "Dry";
  if (typeToProcess === "wet") return "Wet";
  return "Other";
}

function getPetTypeLabel(
  petType: Product['petType'],
  fallbackType: Product['type']
): string {
  const typeToProcess = petType || fallbackType;
  if (typeToProcess === "dog") return "Dog";
  if (typeToProcess === "cat") return "Cat";
  return "-";
}

function getNormalizedSpecialCares(
  specialcares: Product['specialcares']
): SpecialCareItem[] {
  if (!specialcares) return [];
  if (Array.isArray(specialcares)) {
    return specialcares;
  }
  if (typeof specialcares === 'object' && specialcares !== null) {
    return Object.values(specialcares);
  }
  return [];
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    name,
    description,
    productType,
    type,
    petType,
    lifeStage,
    benefits: rawBenefits,
    specialcares: rawSpecialCares,
    forPregnant,
    forLactating,
  } = product;

  const imgSrc = getImageSource(product);
  const displayBenefits = getNormalizedBenefits(rawBenefits);
  const displayLifeStage = getLifeStageLabel(lifeStage);
  const displayProductType = getProductTypeLabel(productType, type);
  const displayPetType = getPetTypeLabel(petType, type);
  const displaySpecialCares = getNormalizedSpecialCares(rawSpecialCares);

  return (
    <Card className="flex h-full flex-col transition-all duration-200 hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-xs text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{name}</CardTitle>
          <div className="flex flex-shrink-0 gap-1">
            <Badge variant="outline" className="text-xs">
              {displayProductType}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {displayPetType}
            </Badge>
          </div>
        </div>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-grow pt-0">
        <div className="space-y-3">
          {displayLifeStage !== "-" && (
            <div>
              <span className="text-xs font-medium text-gray-600">
                Life Stage:{" "}
              </span>
              <Badge variant="outline" className="text-xs">
                {displayLifeStage}
              </Badge>
            </div>
          )}

          {(forPregnant || forLactating) && (
            <div>
              <span className="text-xs font-medium text-gray-600">
                Special For:{" "}
              </span>
              <div className="mt-1 flex gap-1">
                {forPregnant && (
                  <Badge className="bg-pink-100 text-xs text-pink-800 hover:bg-pink-100">
                    Pregnant
                  </Badge>
                )}
                {forLactating && (
                  <Badge className="bg-purple-100 text-xs text-purple-800 hover:bg-purple-100">
                    Lactating
                  </Badge>
                )}
              </div>
            </div>
          )}

          {displayBenefits.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600">
                Key Benefits:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {displayBenefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {displaySpecialCares.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600">
                Special Care:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {displaySpecialCares.map((care) => (
                  <Badge
                    key={care.id}
                    className="bg-green-100 text-xs text-green-800 hover:bg-green-100"
                  >
                    {care.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}