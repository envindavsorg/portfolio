"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useId, useState } from "react";

import { Button } from "@/components/primitives/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/primitives/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/primitives/Popover";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  data: {
    value: string;
    label: string;
  }[];
  onSelect(value: string): void;
  value?: string;
  disabled?: boolean;
  search: boolean;
  className?: string;
}

export const Combobox = (props: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const listboxId = `combobox-listbox-${useId()}`;
  const selectedItem = props.data.find(
    (item) => item.value === props.value
  );

  const setNewValue = (value: string) => {
    setOpen(false);
    props.onSelect(value);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="h-10 rounded-none"
          disabled={props.disabled}
          role="combobox"
          variant="outline"
        >
          {selectedItem ? selectedItem.label : "Choisir ..."}
          <CaretSortIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("h-auto p-0", props.className)}>
        <Command>
          {props.search && (
            <CommandInput placeholder="tapez une commande ou recherchez ..." />
          )}
          <CommandList className="h-auto" id={listboxId}>
            <CommandEmpty>Aucun résultat ...</CommandEmpty>
            <CommandGroup>
              {props.data.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={() => setNewValue(item.value)}
                  value={item.label}
                >
                  {item.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4",
                      props.value === item.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
