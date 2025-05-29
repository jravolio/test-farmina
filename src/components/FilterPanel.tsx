import React, { useEffect, useState, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterState } from "@/types/product";
import { Search as SearchIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface SpecialCareOption {
  id: string;
  name: string;
}

interface ApiSpecialCareItem {
  specialcare_id: string;
  specialcare_name: string;
}

const username = import.meta.env.VITE_USER
const password = import.meta.env.VITE_PASS  

const API_BASE_URL = 'https://gw-c.petgenius.info/wfservice/z1';
const AUTH_TOKEN = 'Basic ' + btoa(username + ":" + password);

async function fetchSpecialCareOptionsApi(
  petType: FilterState['petType']
): Promise<SpecialCareOption[]> {
  if (!petType) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/specialcares/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
      body: JSON.stringify({
        species: petType,
        country: "MA",
        languageId: "1",
        type: "dietetic",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const json = await response.json();
    const list = json?.result?.[0]?.specialcares?.[0]?.list;

    if (!Array.isArray(list)) {
      return [];
    }

    return list.map((item: ApiSpecialCareItem) => ({
      id: item.specialcare_id,
      name: item.specialcare_name,
    }));
  } catch (error) {
    console.error("Failed to fetch special care options:", error);
    throw error; // Re-throw to be caught by the component
  }
}

interface FilterPanelProps {
  filters: FilterState;
  onSubmit: (filters: FilterState) => void;
}

export default function FilterPanel({
  filters: externalFilters,
  onSubmit,
}: FilterPanelProps) {
  const [internalFilters, setInternalFilters] = useState<FilterState>(externalFilters);
  const [specialCareOptions, setSpecialCareOptions] = useState<SpecialCareOption[]>([]);
  const [isLoadingSpecialCare, setIsLoadingSpecialCare] = useState(false);
  const [errorSpecialCare, setErrorSpecialCare] = useState<string | null>(null);

  useEffect(() => {
    setInternalFilters(externalFilters);
  }, [externalFilters]);

  useEffect(() => {
    if (!internalFilters.petType) {
      setSpecialCareOptions([]);
      return;
    }

    const loadOptions = async () => {
      setIsLoadingSpecialCare(true);
      setErrorSpecialCare(null);
      try {
        const options = await fetchSpecialCareOptionsApi(internalFilters.petType);
        setSpecialCareOptions(options);
      } catch (err: any) {
        setErrorSpecialCare(err.message || 'Failed to load options');
      } finally {
        setIsLoadingSpecialCare(false);
      }
    };

    loadOptions();
  }, [internalFilters.petType]);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setInternalFilters(prev => {
        const newState = { ...prev, [key]: value };
        if (key === 'petType' && prev.petType !== value) {
          newState.specialCare = [];
        }

        return newState;
      });
    },
    []
  );

  const toggleSpecialCare = useCallback((careId: string) => {
    setInternalFilters(prev => ({
      ...prev,
      specialCare: prev.specialCare.includes(careId)
        ? prev.specialCare.filter(id => id !== careId)
        : [...prev.specialCare, careId],
    }));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(internalFilters);
  };

  const youngPetLifeStageValue =
    internalFilters.petType === 'dog' ? 'puppy' : 'kitten';
  const youngPetLifeStageLabel =
    internalFilters.petType === 'dog' ? 'Puppy' : 'Kitten';

  return (
    <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
      <div>
        <Label className="text-sm font-medium mb-3 block">Food Type</Label>
        <RadioGroup
          value={internalFilters.foodType}
          onValueChange={value => updateFilter('foodType', value as FilterState['foodType'])}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dry" id="foodType-dry" />
            <Label htmlFor="foodType-dry" className="font-normal">Dry Food</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wet" id="foodType-wet" />
            <Label htmlFor="foodType-wet" className="font-normal">Wet Food</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">
          Pet Type <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={internalFilters.petType}
          onValueChange={value => updateFilter('petType', value as FilterState['petType'])}
          required
          name="petType"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dog" id="petType-dog" />
            <Label htmlFor="petType-dog" className="font-normal">Dog</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cat" id="petType-cat" />
            <Label htmlFor="petType-cat" className="font-normal">Cat</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">
          Reproductive Status
        </Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pregnant"
              checked={internalFilters.isPregnant}
              onCheckedChange={checked => updateFilter('isPregnant', !!checked)}
            />
            <Label htmlFor="pregnant" className="font-normal">Pregnant</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lactating"
              checked={internalFilters.isLactating}
              onCheckedChange={checked => updateFilter('isLactating', !!checked)}
            />
            <Label htmlFor="lactating" className="font-normal">Lactating</Label>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Life Stage</Label>
        <Select
          value={internalFilters.lifeStage}
          onValueChange={value => updateFilter('lifeStage', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select life stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={youngPetLifeStageValue}>
              {youngPetLifeStageLabel}
            </SelectItem>
            <SelectItem value="adult">Adult</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">
          Special Care Needs
        </Label>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 min-h-[40px]">
          {isLoadingSpecialCare && (
            <div className="text-sm text-gray-500 p-1">Loading special needs...</div>
          )}
          {errorSpecialCare && (
            <div className="text-sm text-red-500 p-1">{errorSpecialCare}</div>
          )}
          {!isLoadingSpecialCare &&
            !errorSpecialCare &&
            specialCareOptions.length === 0 &&
            internalFilters.petType && (
              <div className="text-sm text-gray-500 p-1">
                No special care needs found.
              </div>
            )}
          {!isLoadingSpecialCare &&
            !errorSpecialCare &&
            specialCareOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`specialCare-${option.id}`}
                  checked={internalFilters.specialCare.includes(option.id)}
                  onCheckedChange={() => toggleSpecialCare(option.id)}
                />
                <Label
                  htmlFor={`specialCare-${option.id}`}
                  className="text-sm font-normal"
                >
                  {option.name}
                </Label>
              </div>
            ))}
        </div>
        {internalFilters.specialCare.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {internalFilters.specialCare.length} care need
            {internalFilters.specialCare.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      <div>
        <Separator className="my-4" />
        <Button type="submit" className="w-full">
          <SearchIcon className="mr-2 h-4 w-4" />
          Search Products
        </Button>
      </div>
    </form>
  );
}