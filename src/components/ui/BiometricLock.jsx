import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, Loader2 } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';

export default function BiometricLock({ onUnlock }) {
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError(false);
      
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000,
        }
      });

      if (assertion) {
        onUnlock();
      }
    } catch (err) {
      console.error("Auth failed", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleUnlock();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0B0E14] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-2xl">
          <Lock size={40} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        {t('settings.lockTitle') || "Zablokowano"}
      </h2>
      <p className="text-gray-500 text-center mb-10 max-w-[240px] text-sm">
        {t('settings.lockDesc') || "Użyj Face ID / Touch ID"}
      </p>

      <button 
        onClick={handleUnlock}
        disabled={isLoading}
        className="relative overflow-hidden group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <Fingerprint size={24} />
        )}
        <span>
            {isLoading ? t('settings.authenticating') : t('settings.unlockButton')}
        </span>
      </button>

      {error && !isLoading && (
        <p className="mt-6 text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 text-center">
          {t('settings.authFailed')}
        </p>
      )}
    </div>
  );
}