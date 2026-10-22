import { AlertCircle, Info } from "lucide-react";

export const NAVY = "#1d3461";
export const RELIEF = "#2d6a4f";
export const ACCENT = "#e8703a";
export const MUTED_BAR = "#c9d1dc";

export function Card({ children, className = "" }) {
  return (
    <section className={`bg-white rounded-2xl p-5 sm:p-6 ${className}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {children}
    </section>
  );
}

export function StepTitle({ n, children }) {
  return (
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
      {n != null && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy text-white text-sm font-body">{n}</span>}
      {children}
    </h2>
  );
}

export function NumberField({ label, value, onChange, step = "0.1", min = "0", suffix }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="mt-1 flex items-center border border-gray-300 rounded-lg focus-within:border-navy bg-white">
        <input
          type="number" inputMode="decimal" step={step} min={min} value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full min-w-0 px-3 py-2 rounded-lg outline-none tabular-nums bg-transparent"
        />
        {suffix && <span className="pr-3 text-gray-500 text-sm whitespace-nowrap">{suffix}</span>}
      </div>
    </label>
  );
}

export function Warning({ children }) {
  return (
    <div className="flex gap-3 text-warning">
      <AlertCircle className="shrink-0 mt-0.5" size={20} />
      <div>{children}</div>
    </div>
  );
}

export function Note({ children, className = "" }) {
  return (
    <p className={`text-sm text-gray-600 flex gap-2 ${className}`}>
      <Info size={16} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

export function Choice({ on, onClick, title, subtitle }) {
  return (
    <button
      type="button" role="radio" aria-checked={on} onClick={onClick}
      className={`text-left rounded-xl border-2 px-4 py-3 transition-colors ${on ? "border-navy bg-navy/5" : "border-gray-200 hover:border-gray-300"}`}
    >
      <div className="font-semibold text-navy">{title}</div>
      {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
    </button>
  );
}
