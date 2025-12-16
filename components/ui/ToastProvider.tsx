"use client";

import * as React from "react";
import * as Toast from "@radix-ui/react-toast";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";

type ToastVariant = "success" | "error" | "info";

interface ToastMessage {
    id?: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextValue {
    showToast: (toast: ToastMessage) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = React.useState<(ToastMessage & { id: string })[]>([]);

    const showToast = React.useCallback((toast: ToastMessage) => {
        const id = toast.id || Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const dismissToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const variantStyles = {
        success: "border-green-500 bg-gray-50 dark:text-white dark:bg-green-600 border-l-4 border-green-600 dark:border-green-700",
        error: "border-red-500 bg-gray-50 dark:text-white dark:bg-red-600 border-l-4 border-red-600 dark:border-red-700",
        info: "border-blue-500 bg-gray-50 dark:text-white dark:bg-blue-600 border-l-4 border-blue-600 dark:border-blue-700",
    };

    const variantIcons = {
        success: <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />,
        error: <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />,
        info: <Info className="w-5 h-5 mr-3 flex-shrink-0" />,
    };

    return (
        <ToastContext.Provider value={{ showToast, dismissToast }}>
            <Toast.Provider swipeDirection="right" duration={4000}>
                {children}
                {toasts.map((toast) => {
                    const variant = toast.variant || "info";
                    const duration = toast.duration || 4000;

                    return (
                        <Toast.Root
                            key={toast.id}
                            open={true}
                            duration={duration}
                            onOpenChange={(open) => !open && removeToast(toast.id)}
                            className={clsx(
                                "flex items-start p-4 rounded-lg shadow-lg max-w-md w-full",
                                "animate-in slide-in-from-right-full duration-300",
                                variantStyles[variant]
                            )}
                        >
                            {variantIcons[variant]}
                            <div className="flex-1 min-w-0">
                                <Toast.Title className="font-semibold text-sm leading-tight">
                                    {toast.title}
                                </Toast.Title>
                                {toast.description && (
                                    <Toast.Description className="text-sm opacity-90 mt-1">
                                        {toast.description}
                                    </Toast.Description>
                                )}
                                {toast.action && (
                                    <Toast.Action asChild altText={toast.action.label}>
                                        <button
                                            onClick={toast.action.onClick}
                                            className="mt-2 px-3 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 rounded transition-colors"
                                        >
                                            {toast.action.label}
                                        </button>
                                    </Toast.Action>
                                )}
                            </div>
                            <Toast.Close
                                className="ml-4 flex-shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
                                aria-label="Close"
                                onClick={() => removeToast(toast.id)}
                            >
                                <X className="w-4 h-4" />
                            </Toast.Close>
                        </Toast.Root>
                    );
                })}
                <Toast.Viewport className="fixed bottom-0 right-0 p-6 space-y-3 z-[9999] flex flex-col items-end max-h-screen overflow-hidden" />
            </Toast.Provider>
        </ToastContext.Provider>
    );
};