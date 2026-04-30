import { useState } from "react";
import CryptoJS from "crypto-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  ToolMetricGrid,
  ToolPanel,
  ToolTagList,
  ToolWorkbench,
} from "../ai/tool-workbench";

type TraitResult = {
  trait: string;
  value: string;
  frequency: number;
  score: number;
  tier: "common" | "uncommon" | "rare" | "epic" | "legendary";
};

const sampleTraits = `Background: Midnight Blue\nEyes: Laser Grid\nAccessory: Gold Chain\nJacket: Tuxedo\nMood: Calm\nCompanion: Hover Drone`;

const tierColor = {
  common: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  uncommon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  rare: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  epic: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  legendary: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

const computeTier = (frequency: number): TraitResult["tier"] => {
  if (frequency < 1) return "legendary";
  if (frequency < 3) return "epic";
  if (frequency < 8) return "rare";
  if (frequency < 18) return "uncommon";
  return "common";
};

const scoreTrait = (collection: string, trait: string, value: string): TraitResult => {
  const hash = CryptoJS.SHA256(`${collection}:${trait}:${value}`).toString();
  const numeric = parseInt(hash.slice(0, 8), 16);
  const frequency = Math.max(0.4, ((numeric % 2600) / 100) + 0.4);
  const roundedFrequency = Math.round(frequency * 10) / 10;
  const tier = computeTier(roundedFrequency);
  return {
    trait,
    value,
    frequency: roundedFrequency,
    score: Math.round((100 / roundedFrequency) * 100) / 100,
    tier,
  };
};

const NftRarityCalculator = () => {
  const [collectionName, setCollectionName] = useState("");
  const [traitsInput, setTraitsInput] = useState("");
  const [collectionSize, setCollectionSize] = useState(10000);
  const [results, setResults] = useState<TraitResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRarity = async () => {
    if (!traitsInput.trim()) {
      toast.error("Add at least one trait before calculating.");
      return;
    }

    setIsCalculating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const collection = collectionName.trim() || "Untitled Collection";
      const nextResults = traitsInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [trait, ...rest] = line.split(":");
          return scoreTrait(collection, trait?.trim() || `Trait ${index + 1}`, rest.join(":").trim() || "Unknown");
        });

      setResults(nextResults.sort((a, b) => b.score - a.score));
      toast.success("Rarity profile generated.");
    } finally {
      setIsCalculating(false);
    }
  };

  const overallScore =
    results.length > 0 ? Math.round((results.reduce((total, result) => total + result.score, 0) / results.length) * 100) / 100 : 0;
  const rarest = results[0];

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={BarChart3}
        eyebrow="NFT Rarity"
        title="Turn raw metadata into a cleaner rarity readout."
        description="Paste trait lines, calculate a deterministic rarity profile, and inspect which properties are carrying the strongest rarity weight."
        accent="amber"
        badges={["Deterministic scoring", "Trait-by-trait breakdown", "Collection-aware seed"]}
        metrics={[
          { label: "Traits", value: results.length },
          { label: "Avg score", value: overallScore || 0 },
          { label: "Rarest tier", value: rarest?.tier ?? "—" },
        ]}
        aside={
          <div className="space-y-4">
            <ToolPanel title="Tier map" description="Lower simulated frequency means higher rarity weight.">
              <ToolTagList tags={["Legendary <1%", "Epic <3%", "Rare <8%", "Uncommon <18%", "Common 18%+"]} />
            </ToolPanel>
            <ToolPanel title="Best use" description="Helpful for previewing a ranking UI before wiring real collection data.">
              <ToolTagList tags={["Metadata QA", "Rarity mockups", "Trait ranking", "Collection preview"]} />
            </ToolPanel>
          </div>
        }
      >
        <ToolPanel
          title="Collection input"
          description="Enter the collection context and list each trait as `trait: value` on its own line."
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCollectionName("SnapTools Genesis");
                setTraitsInput(sampleTraits);
                toast.success("Sample metadata loaded.");
              }}
            >
              Load sample
            </Button>
          }
        >
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
              <div className="space-y-2">
                <Label htmlFor="collection-name">Collection name</Label>
                <Input
                  id="collection-name"
                  value={collectionName}
                  onChange={(event) => setCollectionName(event.target.value)}
                  placeholder="e.g. SnapTools Genesis"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-size">Collection size</Label>
                <Input
                  id="collection-size"
                  type="number"
                  value={collectionSize}
                  onChange={(event) => setCollectionSize(Number(event.target.value) || 10000)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="traits">Traits</Label>
              <Textarea
                id="traits"
                value={traitsInput}
                onChange={(event) => setTraitsInput(event.target.value)}
                placeholder="Background: Blue&#10;Eyes: Laser&#10;Accessory: Gold Chain"
                className="min-h-[220px] rounded-3xl border-black/10 bg-white/80 font-mono text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                The current score is deterministic and collection-seeded, but it is still a demo substitute for live marketplace statistics.
              </p>
              <Button onClick={calculateRarity} disabled={isCalculating || !traitsInput.trim()} className="rounded-2xl px-6">
                {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Calculate rarity
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      {results.length > 0 ? (
        <ToolPanel
          title="Rarity breakdown"
          description={`Simulated against a collection size of ${collectionSize.toLocaleString()} items.`}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigator.clipboard
                  .writeText(results.map((result) => `${result.trait}: ${result.value} — ${result.frequency}% (${result.score})`).join("\n"))
                  .then(() => toast.success("Rarity profile copied."))
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          }
        >
          <div className="space-y-4">
            {results.map((result) => (
              <div key={`${result.trait}-${result.value}`} className="rounded-[2rem] border border-black/5 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold">{result.trait}</div>
                    <div className="text-sm text-muted-foreground">{result.value}</div>
                  </div>
                  <Badge className={tierColor[result.tier]}>{result.tier}</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-3 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, Math.max(6, result.score))}%` }}
                    />
                  </div>
                  <ToolMetricGrid
                    metrics={[
                      { label: "Frequency", value: `${result.frequency}%` },
                      { label: "Rarity score", value: result.score },
                      { label: "Est. holders", value: Math.round((collectionSize * result.frequency) / 100) },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </ToolPanel>
      ) : null}
    </div>
  );
};

export default NftRarityCalculator;
