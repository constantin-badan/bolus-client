import { ReactElement } from "react";
import {
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from "react-aria-components";

type Variant = "primary" | "secondary";

interface ButtonProps extends RACButtonProps {
  /** @default 'primary' */
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-600",
  secondary:
    "bg-white text-primary-500 hover:bg-primary-100 focus:ring-primary-600",
};

export function Button({
  variant = "primary",
  children,
  ...props
}: ButtonProps): ReactElement {
  return (
    <RACButton {...props} className={styles[variant]}>
      {children}
    </RACButton>
  );
}
