import clsx from "clsx";
import { ReactElement } from "react";
import {
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from "react-aria-components";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<RACButtonProps, "className"> {
  /** @default 'primary' */
  variant?: Variant;
  /** @default 'md' */
  size?: Size;
}

const baseStyles =
  "rounded-lg font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-95 focus:ring-blue-500",
  secondary:
    "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 shadow-sm hover:shadow active:scale-95 focus:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700",
  success:
    "bg-gradient-to-br from-lime-500 to-lime-600 text-white hover:from-lime-600 hover:to-lime-700 shadow-lg shadow-lime-500/30 hover:shadow-xl hover:shadow-lime-500/40 hover:scale-105 active:scale-95 focus:ring-lime-500",
  danger:
    "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 focus:ring-red-500",
  warning:
    "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105 active:scale-95 focus:ring-amber-500",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 active:scale-95 focus:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps): ReactElement {
  return (
    <RACButton
      {...props}
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant])}
    >
      {children}
    </RACButton>
  );
}
