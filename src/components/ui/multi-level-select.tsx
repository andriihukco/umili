"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  name: string;
  items: string[];
}

interface MultiLevelSelectProps {
  categories: CategoryItem[];
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  className?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export function MultiLevelSelect({
  categories,
  selectedItems,
  onSelectionChange,
  maxSelections,
  className,
  allowCustom = false,
  customPlaceholder = "Додати власну навичку",
}: MultiLevelSelectProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [customItem, setCustomItem] = useState("");

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleItemToggle = (item: string) => {
    if (selectedItems.includes(item)) {
      onSelectionChange(selectedItems.filter((i) => i !== item));
    } else {
      if (maxSelections && selectedItems.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      onSelectionChange([...selectedItems, item]);
    }
  };

  const removeItem = (item: string) => {
    onSelectionChange(selectedItems.filter((i) => i !== item));
  };

  const addCustomItem = () => {
    if (customItem.trim() && !selectedItems.includes(customItem.trim())) {
      if (maxSelections && selectedItems.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      onSelectionChange([...selectedItems, customItem.trim()]);
      setCustomItem("");
    }
  };

  const handleCustomItemKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomItem();
    }
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Пошук навичок..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
        />
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Обрані навички ({selectedItems.length}
            {maxSelections && ` / ${maxSelections}`})
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium">{item}</span>
                <button
                  onClick={() => removeItem(item)}
                  className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-2">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="border border-gray-200 rounded-lg bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-3">
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
                <span className="font-semibold text-gray-900">
                  {category.name}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {category.items.length}
                </span>
              </div>
            </button>

            {expandedCategories.has(category.id) && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  {category.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-white transition-colors"
                    >
                      <Checkbox
                        id={`${category.id}-${item}`}
                        checked={selectedItems.includes(item)}
                        onCheckedChange={() => handleItemToggle(item)}
                        disabled={Boolean(
                          maxSelections &&
                            !selectedItems.includes(item) &&
                            selectedItems.length >= maxSelections
                        )}
                      />
                      <Label
                        htmlFor={`${category.id}-${item}`}
                        className="text-sm cursor-pointer flex-1 font-medium text-gray-700"
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Item Input */}
      {allowCustom && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Label className="text-sm font-semibold text-gray-800">
            Додати власну навичку
          </Label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={customPlaceholder}
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              onKeyPress={handleCustomItemKeyPress}
              disabled={Boolean(
                maxSelections && selectedItems.length >= maxSelections
              )}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            />
            <Button
              type="button"
              onClick={addCustomItem}
              disabled={
                !customItem.trim() ||
                selectedItems.includes(customItem.trim()) ||
                Boolean(maxSelections && selectedItems.length >= maxSelections)
              }
              size="sm"
              variant="outline"
              className="px-4"
            >
              Додати
            </Button>
          </div>
        </div>
      )}

      {/* Max Selections Warning */}
      {maxSelections && selectedItems.length >= maxSelections && (
        <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg border border-gray-200">
          Досягнуто максимальну кількість обраних навичок ({maxSelections})
        </div>
      )}
    </div>
  );
}
