import type { CSSProperties } from 'react';

export function HandCheckbox({
  checked,
  size = 22,
  onClick,
  label,
}: {
  checked: boolean;
  size?: number;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? (checked ? 'Uncheck' : 'Check')}
      aria-pressed={checked}
      className="inline-flex items-center justify-center active:scale-95 transition-transform"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="text-ink"
        aria-hidden
      >
        <path
          d="M3.5 4.2 Q3 12 4 20.1 Q12.5 20.6 20.5 19.9 Q21.1 11.6 20.2 3.6 Q11.9 3 3.5 4.2 Z"
          className="hand-check"
        />
        {checked && (
          <path
            d="M6 13 L10.5 17 L18.5 7"
            className="hand-check"
            strokeWidth={2.4}
          />
        )}
      </svg>
    </button>
  );
}

export function HandPlus({
  onClick,
  size = 44,
  label = 'Add',
}: {
  onClick?: () => void;
  size?: number;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center justify-center active:scale-95 transition-transform rounded-full bg-ink text-paper shadow-md"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} aria-hidden>
        <path
          d="M12 5 Q12.3 12 12 19"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M5 12 Q12 12.3 19 12"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </button>
  );
}

export function HandSquiggle({
  width = 40,
  height = 14,
  style,
}: {
  width?: number;
  height?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 40 14"
      width={width}
      height={height}
      style={style}
      aria-hidden
    >
      <path
        d="M1 7 Q5 2, 9 7 T17 7 T25 7 T33 7 T39 7"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
