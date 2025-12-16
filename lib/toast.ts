import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
    message: string;
    description?: string;
    type?: ToastType;
    onUndo?: () => void;
}

export function showToast({
    message,
    description,
    type = "info",
    onUndo,
}: ToastOptions) {
    const toastAction = onUndo
        ? {
              label: "Undo",
              onClick: onUndo,
          }
        : undefined;

    switch (type) {
        case "success":
            toast.success(message, {
                description,
                action: toastAction,
            });
            break;
        case "error":
            toast.error(message, {
                description,
                action: toastAction,
            });
            break;
        case "warning":
            toast.warning(message, {
                description,
                action: toastAction,
            });
            break;
        default:
            toast.info(message, {
                description,
                action: toastAction,
            });
            break;
    }
}
