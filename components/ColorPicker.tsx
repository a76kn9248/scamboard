"use client";

const PRESET_COLORS = [
  "#ff1744",
  "#ff9100",
  "#ffd600",
  "#69f0ae",
  "#00e5ff",
  "#2979ff",
  "#aa00ff",
  "#ff4081",
  "#ff6e40",
  "#76ff03",
  "#18ffff",
  "#e040fb",
];

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export default function ColorPicker({
  selectedColor,
  onChange,
  disabled = false,
}: ColorPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full transition-all ${
            selectedColor === color
              ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--background)] scale-110"
              : "hover:scale-105"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}
