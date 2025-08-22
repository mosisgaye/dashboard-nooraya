import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "../../utils/cn";
import { Button } from "./Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./Popover";

export type DatePickerProps = {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date",
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-gray-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd MMMM yyyy", { locale: fr }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800" align="start">
        <style>{`
          .rdp {
            --rdp-cell-size: 40px;
            --rdp-background-color: transparent;
            --rdp-accent-color: #3b82f6;
            --rdp-accent-color-dark: #2563eb;
            margin: 0;
          }
          .dark .rdp {
            --rdp-color: #f3f4f6;
            --rdp-background-color: #1f2937;
          }
          .rdp-day_selected {
            background-color: var(--rdp-accent-color);
            color: white;
          }
          .rdp-day_selected:hover {
            background-color: var(--rdp-accent-color-dark);
          }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: #f3f4f6;
          }
          .dark .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: #374151;
          }
          .rdp-head_cell {
            color: #6b7280;
            font-weight: 500;
          }
          .dark .rdp-head_cell {
            color: #9ca3af;
          }
          .rdp-caption_label {
            color: #111827;
            font-weight: 600;
          }
          .dark .rdp-caption_label {
            color: #f3f4f6;
          }
          .rdp-nav_button {
            color: #6b7280;
          }
          .dark .rdp-nav_button {
            color: #9ca3af;
          }
          .rdp-day {
            color: #111827;
          }
          .dark .rdp-day {
            color: #f3f4f6;
          }
        `}</style>
        <DayPicker
          mode="single"
          selected={date}
          onSelect={onDateChange}
          locale={fr}
          showOutsideDays={false}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}