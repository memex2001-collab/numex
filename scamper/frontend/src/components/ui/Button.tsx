import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

/** Visuelle Variante des Buttons */
type Variante = 'primary' | 'secondary' | 'ghost';

/** Größe des Buttons */
type Groesse = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visuelle Variante (Standard: primary) */
  variante?: Variante;
  /** Größe (Standard: md) */
  groesse?: Groesse;
  /** Zeigt einen Lade-Spinner an und deaktiviert den Button */
  laedt?: boolean;
  /** Volle Breite des Elternelements */
  volleBreite?: boolean;
}

/** Basisklassen für alle Button-Varianten */
const BASIS_KLASSEN =
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl ' +
  'transition-all duration-150 cursor-pointer select-none ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

/** Klassen je Variante */
const VARIANTEN_KLASSEN: Record<Variante, string> = {
  primary:
    'bg-p1 text-white hover:bg-p1-d active:bg-p1-d ' +
    'focus-visible:ring-p1',
  secondary:
    'bg-surface border border-border text-text ' +
    'hover:bg-surface2 active:bg-border ' +
    'focus-visible:ring-p1',
  ghost:
    'bg-transparent text-p1 hover:bg-p1-l active:bg-p1-l ' +
    'focus-visible:ring-p1',
};

/** Klassen je Größe */
const GROESSEN_KLASSEN: Record<Groesse, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/** Lade-Spinner als SVG */
function LadeSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Universelle Button-Komponente für das Numex Design-System.
 *
 * @example
 * <Button variante="primary" groesse="md" onClick={handleClick}>
 *   Jetzt starten
 * </Button>
 *
 * <Button variante="ghost" laedt={isLoading}>
 *   Weiter
 * </Button>
 */
export function Button({
  variante = 'primary',
  groesse = 'md',
  laedt = false,
  volleBreite = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        BASIS_KLASSEN,
        VARIANTEN_KLASSEN[variante],
        GROESSEN_KLASSEN[groesse],
        volleBreite && 'w-full',
        laedt && 'cursor-wait',
        className,
      )}
      disabled={disabled ?? laedt}
      {...rest}
    >
      {laedt && <LadeSpinner />}
      {children}
    </button>
  );
}
