'use client';

import { Loader } from 'lucide-react';

export const LoadingOverlay = ({ message }: { message: string }) => {
    return (
        <div className="fixed inset-0 bg-black/70 bg-opacity-0 z-50 flex flex-col items-center justify-center">
            <Loader className="animate-spin h-12 w-12 text-primary" />
            <p className="text-white text-lg mt-4">{message}</p>
        </div>
    );
};
