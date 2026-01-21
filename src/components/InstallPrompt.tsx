"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        function handler(e: Event) {
            e.preventDefault();
            console.log("✅ PWA Install prompt event fired!");
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        }

        window.addEventListener("beforeinstallprompt", handler as EventListener);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log("ℹ️ App is already installed");
            setShowPrompt(false);
        } else {
            console.log("ℹ️ Waiting for install prompt event...");
        }

        // Debug: Check if service worker is registered
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                console.log("📋 Service Workers registered:", registrations.length);
            });
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler as EventListener);
        };
    }, []);

    if (!deferredPrompt || !showPrompt) return null;

    const handleInstall = async () => {
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        } catch (error) {
            console.error("Installation error:", error);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    return (
        <div className="fixed bottom-24 right-4 md:bottom-5 md:right-5 z-50 bg-card border rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-5">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col gap-3">
                <div className="pr-6">
                    <h3 className="font-semibold text-sm">Install Expense Tracker</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Install our app for quick access and offline functionality
                    </p>
                </div>
                <Button
                    onClick={handleInstall}
                    size="sm"
                    className="w-full"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                </Button>
            </div>
        </div>
    );
}
