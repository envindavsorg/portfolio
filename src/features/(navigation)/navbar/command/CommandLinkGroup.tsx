import { CommandGroup } from "@/components/Command";
import { memo } from "react";
import { CommandRow } from "./CommandRow";
import { CommandItemProps } from "./types";

interface CommandLinkGroupProps {
  heading: string;
  items: CommandItemProps[];
  onSelect: (url: string, newTab?: boolean) => void;
}

export const CommandLinkGroup = memo(
  ({ heading, items, onSelect }: CommandLinkGroupProps) => (
    <CommandGroup heading={heading}>
      {items.map((item, idx) => (
        <CommandRow
          index={idx}
          item={item}
          key={item.title}
          onSelect={onSelect}
        />
      ))}
    </CommandGroup>
  ),
);
