import { AlertCircle, Info } from "lucide-react";

// A card. Give it `label` (or `labelledBy`) when it's a meaningful part of
// the page, so screen readers list it as a region they can jump to.
export function Card({ children, className = "", label, labelledBy }) {
  return (
    <section
      aria-label={label} aria-labelledby={labelledBy}
      className={`bg-white rounded-2xl p-5 sm:p-6 ${className}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      {children}
    </section>
  );
}

export function StepTitle({ n, children, id }) {
  return (
    <h2 id={id} className="text-xl font-semibold mb-4 flex items-center gap-3">
      {n != null && (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand text-onbrand text-sm font-body" aria-hidden="true">{n}</span>
      )}
      {n != null && <span className="sr-only">Step {n}: </span>}
      {children}
    </h2>
  );
}

export function NumberField({ label, value, onChange, step = "0.1", min = "0", suffix }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="mt-1 flex items-center border border-gray-300 rounded-lg focus-within:border-navy bg-white">
        <input
          type="number" inputMode="decimal" step={step} min={min} value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full min-w-0 px-3 py-2 rounded-lg tabular-nums bg-transparent"
        />
        {suffix && <span className="pr-3 text-gray-500 text-sm whitespace-nowrap" aria-hidden="true">{suffix}</span>}
      </span>
      {suffix && <span className="sr-only">in {suffix.replace("p/kWh", "pence per kilowatt hour").replace("kWh", "kilowatt hours").replace("kW", "kilowatts")}</span>}
    </label>
  );
}

export function Warning({ children }) {
  return (
    <div className="flex gap-3 text-warning" role="alert">
      <AlertCircle className="shrink-0 mt-0.5" size={20} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Note({ children, className = "" }) {
  return (
    <p className={`text-sm text-gray-600 flex gap-2 ${className}`}>
      <Info size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

// A selectable tile backed by a real radio button (or checkbox), so it works
// with the keyboard and screen readers like any other form control.
export function Choice({ name, type = "radio", on, onChange, title, subtitle, className = "", children }) {
  return (
    <label className={`choice block cursor-pointer rounded-xl border-2 px-4 py-3 transition-colors ${on ? "border-navy bg-navy/10" : "border-gray-200 hover:border-gray-400"} ${className}`}>
      <input type={type} name={name} checked={on} onChange={onChange} className="sr-only" />
      {children ?? (
        <>
          <span className="block font-semibold text-navy">{title}</span>
          {subtitle && <span className="block text-sm text-gray-600">{subtitle}</span>}
        </>
      )}
    </label>
  );
}

// Text read out by screen readers when it changes. Keep it mounted and
// change its contents, rather than mounting it with the message.
export function LiveSummary({ text }) {
  return <p className="sr-only" aria-live="polite" aria-atomic="true">{text}</p>;
}
