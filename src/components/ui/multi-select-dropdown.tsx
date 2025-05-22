
// src/components/ui/multi-select-dropdown.tsx
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Selecione...',
  className,
  disabled = false,
}: MultiSelectDropdownProps) {
  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((item) => item !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  const displayValue =
    selectedValues.length > 0
      ? options
          .filter((option) => selectedValues.includes(option.value))
          .map((option) => option.label)
          .join(', ')
      : placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            'w-full justify-between font-normal',
            selectedValues.length === 0 && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60">
        <ScrollArea>
          {options.length === 0 && (
            <DropdownMenuLabel className="text-center text-muted-foreground py-2">
              Nenhuma opção disponível
            </DropdownMenuLabel>
          )}
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => handleSelect(option.value)}
              onSelect={(e) => e.preventDefault()} // Prevent closing on item select
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
