export function ColorSwatch({ r, g, b, className = "" }: { r: number; g: number; b: number; className?: string }) {
  return (
    <div
      className={`w-6 h-6 rounded border border-gray-300 shadow-sm inline-block shrink-0 ${className}`}
      style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
      aria-label={`Color swatch rgb(${r}, ${g}, ${b})`}
    />
  );
}
