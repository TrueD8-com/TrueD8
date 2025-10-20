"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  INTEREST_CATEGORIES,
  ALL_INTERESTS,
} from "@/lib/validations/profile";

interface InterestsSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  maxSelections?: number;
}

export function InterestsSelector({
  selectedInterests = [],
  onChange,
  maxSelections = 10,
}: InterestsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredInterests = searchQuery
    ? ALL_INTERESTS.filter((interest) =>
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeCategory
    ? INTEREST_CATEGORIES[activeCategory as keyof typeof INTEREST_CATEGORIES]
    : [];

  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onChange(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < maxSelections) {
      onChange([...selectedInterests, interest]);
    }
  };

  const handleRemoveInterest = (interest: string) => {
    onChange(selectedInterests.filter((i) => i !== interest));
  };

  const isSelected = (interest: string) => selectedInterests.includes(interest);
  const isMaxReached = selectedInterests.length >= maxSelections;

  return (
    <div className="space-y-4">
      {/* Selected Interests */}
      {selectedInterests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Selected ({selectedInterests.length}/{maxSelections})
            </p>
            {selectedInterests.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange([])}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search interests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Pills */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          {Object.keys(INTEREST_CATEGORIES).map((category) => (
            <Button
              key={category}
              type="button"
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setActiveCategory(activeCategory === category ? null : category)
              }
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Interests Grid */}
      {(searchQuery || activeCategory) && (
        <div className="rounded-lg border p-4">
          {filteredInterests.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filteredInterests.map((interest) => (
                <Button
                  key={interest}
                  type="button"
                  variant={isSelected(interest) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleInterest(interest)}
                  disabled={!isSelected(interest) && isMaxReached}
                  className="justify-start"
                >
                  {interest}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No interests found
            </p>
          )}
        </div>
      )}

      {/* Helper Text */}
      {!searchQuery && !activeCategory && (
        <p className="text-sm text-muted-foreground">
          Search or select a category to add interests
        </p>
      )}

      {isMaxReached && (
        <p className="text-sm text-amber-600">
          Maximum {maxSelections} interests selected
        </p>
      )}
    </div>
  );
}
