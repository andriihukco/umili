"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SkillCategory {
  id: string;
  name: string;
  items: string[];
  icon?: string;
}

interface AppleSkillsSelectorProps {
  categories: SkillCategory[];
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  className?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
  title?: string;
  description?: string;
}

export function AppleSkillsSelector({
  categories,
  selectedItems,
  onSelectionChange,
  maxSelections,
  className,
  allowCustom = true,
  customPlaceholder = "Додати власну навичку",
}: AppleSkillsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customItem, setCustomItem] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

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
        return;
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
        return;
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

  // Group filtered items by category
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Пошук навичок..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 rounded-xl bg-gray-50/50 font-['Geologica']"
        />
      </div>

      {/* Skills Grid */}
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id}>
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                  <h4 className="text-lg font-semibold text-gray-900 font-['Geologica']">
                    {category.name}
                  </h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {category.items.length}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {category.items.map((item) => {
                      const isSelected = selectedItems.includes(item);
                      const isDisabled = Boolean(
                        maxSelections &&
                          !isSelected &&
                          selectedItems.length >= maxSelections
                      );

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleItemToggle(item)}
                          disabled={isDisabled}
                          className={cn(
                            "relative p-4 rounded-xl border-2 transition-all duration-200 text-left font-['Geologica']",
                            isSelected
                              ? "border-gray-400 bg-gray-100 text-gray-800 shadow-sm"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item}</span>
                            {isSelected && (
                              <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 font-['Geologica']">
              Обрані навички
            </h4>
            <span className="text-sm text-gray-500 font-['Geologica']">
              {selectedItems.length}
              {maxSelections && ` / ${maxSelections}`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-all duration-200 font-['Geologica']"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem(item)}
                  className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Item Input */}
      {allowCustom && (
        <div className="space-y-3">
          {!showCustomInput ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCustomInput(true)}
              disabled={Boolean(
                maxSelections && selectedItems.length >= maxSelections
              )}
              className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 hover:text-gray-700 font-['Geologica']"
            >
              <Plus className="h-4 w-4 mr-2" />
              {customPlaceholder}
            </Button>
          ) : (
            <div className="flex gap-3 items-center">
              <Input
                type="text"
                placeholder={customPlaceholder}
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                onKeyPress={handleCustomItemKeyPress}
                disabled={Boolean(
                  maxSelections && selectedItems.length >= maxSelections
                )}
                className="flex-1 h-10 border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 rounded-lg font-['Geologica']"
                autoFocus
              />
              <button
                type="button"
                onClick={addCustomItem}
                disabled={
                  !customItem.trim() ||
                  selectedItems.includes(customItem.trim()) ||
                  Boolean(
                    maxSelections && selectedItems.length >= maxSelections
                  )
                }
                className="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Check className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Max Selections Warning */}
      {maxSelections && selectedItems.length >= maxSelections && (
        <div className="text-sm text-gray-600 bg-amber-50 p-4 rounded-xl border border-amber-200 font-['Geologica']">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            Досягнуто максимальну кількість обраних навичок ({maxSelections})
          </div>
        </div>
      )}
    </div>
  );
}
