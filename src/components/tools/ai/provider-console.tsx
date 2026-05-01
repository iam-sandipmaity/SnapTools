import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  AI_PROVIDERS,
  type AIProviderSettings,
  getProviderMeta,
} from "@/lib/ai/runtime";
import { ToolPanel } from "./tool-workbench";

export function AIProviderConsole({
  settings,
  onChange,
}: {
  settings: AIProviderSettings;
  onChange: (patch: Partial<AIProviderSettings>) => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const providerMeta = getProviderMeta(settings.provider);

  return (
    <ToolPanel
      title="API setup"
      description="Use your own provider key in the browser. Groq is the default, but you can switch anytime."
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={settings.provider}
              onValueChange={(value) => onChange({ provider: value as AIProviderSettings["provider"] })}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Choose a provider" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Input
              value={settings.model}
              onChange={(event) => onChange({ model: event.target.value })}
              placeholder={providerMeta.defaultModel}
              className="h-11 rounded-2xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Base URL</Label>
          <Input
            value={settings.baseUrl}
            onChange={(event) => onChange({ baseUrl: event.target.value })}
            placeholder={providerMeta.defaultBaseUrl}
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>{providerMeta.apiKeyLabel}</Label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(event) => onChange({ apiKey: event.target.value })}
              placeholder={providerMeta.requiresApiKey ? "Paste your API key" : "Optional"}
              className="h-11 rounded-2xl pr-12 font-mono text-xs"
              disabled={!providerMeta.requiresApiKey}
            />
            <button
              type="button"
              onClick={() => setShowKey((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-3xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Remember key on this device</div>
            <p className="text-xs text-muted-foreground">Turn this off to keep the key only until reload.</p>
          </div>
          <Switch
            checked={settings.rememberKey}
            onCheckedChange={(checked) => onChange({ rememberKey: checked })}
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs leading-6 text-muted-foreground">{providerMeta.notes}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onChange({
                provider: providerMeta.id,
                model: providerMeta.defaultModel,
                baseUrl: providerMeta.defaultBaseUrl,
              });
              toast.success("Provider defaults restored.");
            }}
          >
            Reset provider defaults
          </Button>
        </div>
      </div>
    </ToolPanel>
  );
}
