import { useEffect, useState } from 'react';
import { TextField } from './ui';

/**
 * A decimal field that holds a number (or null when empty). Text is kept while typing so
 * "0." doesn't collapse, and the number is parsed on each change.
 */
export function NumberField({
  label,
  value,
  onChange,
  suffix,
  hint,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** Unit shown in the accessibility label and placeholder, e.g. "kWh" or "p/kWh". */
  suffix?: string;
  hint?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(value == null ? '' : String(value));
  // Follow outside changes (e.g. picking an appliance fills in its figures).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText((t) => (value == null ? (t.trim() === '' || Number(t) !== 0 ? '' : t) : Number(t) === value ? t : String(value)));
  }, [value]);
  return (
    <TextField
      label={suffix ? `${label} (${suffix})` : label}
      value={text}
      onChangeText={(t) => {
        setText(t);
        const n = Number(t.replace(',', '.'));
        onChange(t.trim() === '' || Number.isNaN(n) ? null : n);
      }}
      keyboardType="decimal-pad"
      inputMode="decimal"
      placeholder={placeholder ?? suffix}
      hint={hint}
      selectTextOnFocus
    />
  );
}
