import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  ShieldAlert,
  Network,
  FileSearch,
  Brain,
  Save,
  RotateCcw,
} from "lucide-react";

type SettingsState = {
  threatThreshold: number;
  confidenceThreshold: number;
  autoAnalysis: boolean;
  campaignDetection: boolean;
  similarityThreshold: number;
  coordinationThreshold: number;
  evidenceRetention: number;
  chainOfCustody: boolean;
  automaticHashing: boolean;
};

const defaultSettings: SettingsState = {
  threatThreshold: 50,
  confidenceThreshold: 70,
  autoAnalysis: true,
  campaignDetection: true,
  similarityThreshold: 60,
  coordinationThreshold: 70,
  evidenceRetention: 365,
  chainOfCustody: true,
  automaticHashing: true,
};

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-purple-600" : "bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[#2a2a2e] py-5 last:border-b-0">
      <div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="mt-1 max-w-xl text-xs text-zinc-500">
          {description}
        </p>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#2a2a2e] bg-[#111114]">
      <div className="flex items-center gap-3 border-b border-[#2a2a2e] px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/10 text-purple-400">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>

      <div className="px-6">{children}</div>
    </section>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem("deceptrix-settings");

      if (saved) {
        return {
          ...defaultSettings,
          ...JSON.parse(saved),
        };
      }
    } catch {
      // Ignore invalid local storage data
    }

    return defaultSettings;
  });

  const [saved, setSaved] = useState(false);

  const update = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "deceptrix-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem(
      "deceptrix-settings",
      JSON.stringify(defaultSettings)
    );
    setSaved(false);
  };

  useEffect(() => {
    document.title = "Settings | DECEPTRIX";
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d10] p-6 text-white">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <SettingsIcon className="text-purple-400" size={26} />

            <h1 className="text-2xl font-bold">
              System Settings
            </h1>
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Configure detection thresholds, campaign correlation,
            AI analysis, and forensic evidence controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 rounded-lg border border-[#2a2a2e] px-4 py-2 text-sm text-zinc-400 transition hover:bg-[#16161a] hover:text-white"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            onClick={saveSettings}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500"
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✓ Settings saved successfully.
        </div>
      )}

      <div className="space-y-6">
        {/* Detection */}
        <Section
          icon={ShieldAlert}
          title="Detection Settings"
          description="Control how DECEPTRIX evaluates suspicious content."
        >
          <SettingRow
            title="Threat Score Threshold"
            description="Minimum threat score required for a high-risk detection."
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.threatThreshold}
                onChange={(e) =>
                  update(
                    "threatThreshold",
                    Number(e.target.value)
                  )
                }
                className="w-32 accent-purple-600"
              />

              <span className="w-10 text-right text-sm font-medium text-purple-400">
                {settings.threatThreshold}
              </span>
            </div>
          </SettingRow>

          <SettingRow
            title="Confidence Threshold"
            description="Minimum analyzer confidence required to report a manipulation indicator."
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.confidenceThreshold}
                onChange={(e) =>
                  update(
                    "confidenceThreshold",
                    Number(e.target.value)
                  )
                }
                className="w-32 accent-purple-600"
              />

              <span className="w-10 text-right text-sm font-medium text-purple-400">
                {settings.confidenceThreshold}%
              </span>
            </div>
          </SettingRow>

          <SettingRow
            title="Automatic Analysis"
            description="Automatically analyze newly submitted suspicious content."
          >
            <Toggle
              enabled={settings.autoAnalysis}
              onChange={(value) =>
                update("autoAnalysis", value)
              }
            />
          </SettingRow>
        </Section>

        {/* Campaign */}
        <Section
          icon={Network}
          title="Campaign Correlation"
          description="Configure coordinated deception campaign detection."
        >
          <SettingRow
            title="Campaign Detection"
            description="Identify shared manipulation techniques across investigations."
          >
            <Toggle
              enabled={settings.campaignDetection}
              onChange={(value) =>
                update("campaignDetection", value)
              }
            />
          </SettingRow>

          <SettingRow
            title="Narrative Similarity"
            description="Minimum similarity required to correlate two narratives."
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.similarityThreshold}
                onChange={(e) =>
                  update(
                    "similarityThreshold",
                    Number(e.target.value)
                  )
                }
                className="w-32 accent-purple-600"
              />

              <span className="w-10 text-right text-sm font-medium text-purple-400">
                {settings.similarityThreshold}%
              </span>
            </div>
          </SettingRow>

          <SettingRow
            title="Coordination Threshold"
            description="Minimum coordination score required to classify activity as a campaign."
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.coordinationThreshold}
                onChange={(e) =>
                  update(
                    "coordinationThreshold",
                    Number(e.target.value)
                  )
                }
                className="w-32 accent-purple-600"
              />

              <span className="w-10 text-right text-sm font-medium text-purple-400">
                {settings.coordinationThreshold}%
              </span>
            </div>
          </SettingRow>
        </Section>

        {/* Forensics */}
        <Section
          icon={FileSearch}
          title="Evidence & Forensics"
          description="Configure digital evidence preservation and integrity."
        >
          <SettingRow
            title="Evidence Retention"
            description="Number of days forensic evidence should be retained."
          >
            <select
              value={settings.evidenceRetention}
              onChange={(e) =>
                update(
                  "evidenceRetention",
                  Number(e.target.value)
                )
              }
              className="rounded-lg border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
              <option value={730}>2 years</option>
            </select>
          </SettingRow>

          <SettingRow
            title="Chain of Custody"
            description="Maintain a traceable record for forensic evidence."
          >
            <Toggle
              enabled={settings.chainOfCustody}
              onChange={(value) =>
                update("chainOfCustody", value)
              }
            />
          </SettingRow>

          <SettingRow
            title="Automatic Evidence Hashing"
            description="Generate integrity hashes for collected evidence."
          >
            <Toggle
              enabled={settings.automaticHashing}
              onChange={(value) =>
                update("automaticHashing", value)
              }
            />
          </SettingRow>
        </Section>

        {/* AI */}
        <Section
          icon={Brain}
          title="AI Analysis Engine"
          description="Current DECEPTRIX intelligence engine configuration."
        >
          <SettingRow
            title="Analyzer"
            description="Model currently responsible for manipulation analysis."
          >
            <span className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400">
              DECEPTRIX-Local-Analyzer
            </span>
          </SettingRow>

          <SettingRow
            title="Engine Status"
            description="Current availability of the deception analysis engine."
          >
            <div className="flex items-center gap-2 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Online
            </div>
          </SettingRow>
        </Section>
      </div>
    </div>
  );
}
