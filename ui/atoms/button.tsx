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

const baseStyles = clsx(
  "rounded-lg font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
);

const sizeStyles: Record<Size, string> = {
  sm: clsx("px-3 py-1.5 text-xs"),
  md: clsx("px-4 py-2 text-sm"),
  lg: clsx("px-6 py-3 text-base"),
};

const variantStyles: Record<Variant, string> = {
  primary: clsx(
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus:ring-blue-500 active:scale-95",
  ),
  secondary: clsx(
    "border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 hover:shadow focus:ring-zinc-400 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  ),
  success: clsx(
    "bg-gradient-to-br from-lime-500 to-lime-600 text-white shadow-lg shadow-lime-500/30 hover:scale-105 hover:from-lime-600 hover:to-lime-700 hover:shadow-xl hover:shadow-lime-500/40 focus:ring-lime-500 active:scale-95",
  ),
  danger: clsx(
    "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:scale-105 hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40 focus:ring-red-500 active:scale-95",
  ),
  warning: clsx(
    "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:scale-105 hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/40 focus:ring-amber-500 active:scale-95",
  ),
  ghost: clsx(
    "bg-transparent text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-400 active:scale-95 dark:text-zinc-300 dark:hover:bg-zinc-800",
  ),
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
