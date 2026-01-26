import clsx from "clsx";
import { ReactElement, ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  Heading,
  Modal as RACModal,
  ModalOverlay as RACModalOverlay,
  ModalOverlayProps,
  DialogProps,
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from "react-aria-components";

// Modal Trigger (wrapper for DialogTrigger)
export function ModalTrigger({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <DialogTrigger>{children}</DialogTrigger>;
}

// Modal Overlay
type OverlayVariant = "default" | "blur";

interface ModalOverlayExtendedProps extends ModalOverlayProps {
  variant?: OverlayVariant;
}

const overlayVariants: Record<OverlayVariant, string> = {
  default: "bg-black/60",
  blur: "bg-black/60 backdrop-blur-sm",
};

export function ModalOverlay({
  variant = "blur",
  isDismissable = true,
  children,
  ...props
}: ModalOverlayExtendedProps): ReactElement {
  return (
    <RACModalOverlay
      isDismissable={isDismissable}
      {...props}
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center",
        overlayVariants[variant],
      )}
    >
      {children}
    </RACModalOverlay>
  );
}

// Modal Content
type ContentSize = "sm" | "md" | "lg";

interface ModalContentProps {
  size?: ContentSize;
  children: ReactNode;
}

const contentSizes: Record<ContentSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function ModalContent({
  size = "md",
  children,
}: ModalContentProps): ReactElement {
  return (
    <RACModal
      className={clsx(
        "max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900",
        contentSizes[size],
      )}
    >
      {children}
    </RACModal>
  );
}

// Modal Dialog
interface ModalDialogProps extends Omit<DialogProps, "children"> {
  children: ReactNode | ((opts: { close: () => void }) => ReactNode);
}

export function ModalDialog({
  children,
  ...props
}: ModalDialogProps): ReactElement {
  return (
    <Dialog {...props} className="outline-none">
      {children}
    </Dialog>
  );
}

// Modal Header
export function ModalHeader({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className="mb-4 flex items-center justify-between">{children}</div>
  );
}

// Modal Title
export function ModalTitle({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <Heading
      slot="title"
      className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
    >
      {children}
    </Heading>
  );
}

// Modal Close Button
type CloseVariant = "icon" | "text";

interface ModalCloseProps extends Omit<RACButtonProps, "className"> {
  variant?: CloseVariant;
  children?: ReactNode;
}

const closeVariants: Record<CloseVariant, string> = {
  icon: clsx(
    "ml-auto rounded-lg px-4 py-1.5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
  ),
  text: clsx(
    "ml-auto rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
  ),
};

export function ModalClose({
  variant = "icon",
  children = "✕",
  ...props
}: ModalCloseProps): ReactElement {
  return (
    <RACButton {...props} className={clsx(closeVariants[variant])}>
      {children}
    </RACButton>
  );
}

// Modal Body
export function ModalBody({ children }: { children: ReactNode }): ReactElement {
  return <div className="space-y-4">{children}</div>;
}
