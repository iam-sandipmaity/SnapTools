import { useEffect, useState } from "react";
import {
  DEFAULT_PROVIDER_SETTINGS,
  type AIProviderSettings,
  getProviderMeta,
  loadProviderSettings,
  persistProviderSettings,
} from "@/lib/ai/runtime";

export function useAIProviderSettings() {
  const [settings, setSettings] = useState<AIProviderSettings>(DEFAULT_PROVIDER_SETTINGS);

  useEffect(() => {
    setSettings(loadProviderSettings());
  }, []);

  useEffect(() => {
    persistProviderSettings(settings);
  }, [settings]);

  const updateSettings = (patch: Partial<AIProviderSettings>) => {
    setSettings((current) => {
      const nextProvider = patch.provider ?? current.provider;
      const providerMeta = getProviderMeta(nextProvider);

      return {
        ...current,
        ...patch,
        model:
          patch.provider && (!patch.model || patch.model === current.model)
            ? providerMeta.defaultModel
            : patch.model ?? current.model,
        baseUrl:
          patch.provider && (!patch.baseUrl || patch.baseUrl === current.baseUrl)
            ? providerMeta.defaultBaseUrl
            : patch.baseUrl ?? current.baseUrl,
      };
    });
  };

  return {
    settings,
    setSettings: updateSettings,
  };
}
