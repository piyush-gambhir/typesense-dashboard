import { useState } from 'react';

interface UseCopyToClipboardReturn {
    copyToClipboard: (text: string) => Promise<boolean>;
    isCopied: boolean;
    resetCopyState: () => void;
}

export const useCopyToClipboard = (): UseCopyToClipboardReturn => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async (text: string): Promise<boolean> => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                setIsCopied(true);
                return true;
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    setIsCopied(true);
                    return true;
                } else {
                    return false;
                }
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    };

    const resetCopyState = () => {
        setIsCopied(false);
    };

    return {
        copyToClipboard,
        isCopied,
        resetCopyState,
    };
};
