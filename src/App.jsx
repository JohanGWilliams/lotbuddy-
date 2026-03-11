import { useMemo, useState } from "react";
import { Home, LineChart, Image as ImageIcon, Copy } from "lucide-react";

function Panel({ title, description, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-slate-800 bg-slate-900/70 ${className}`}>
      <div className="border-b border-slate-800 p-6">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({ label, help, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200">{label}</label>
      {help ? <div className="mb-1 text-xs text-slate-500">{help}</div> : null}
      {children}
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function RangeField({ value, min, max, step, onChange }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-violet-500"
    />
  );
}

export default function LotBuddyAI() {
  const [projectName, setProjectName] = useState("Courtyard Missing-Middle Study");
  const [siteArea, setSiteArea] = useState(12000);
  const [lotWidth, setLotWidth] = useState(100);
  const [lotDepth, setLotDepth] = useState(120);
  const [maxStories, setMaxStories] = useState(3);
  const [parkingType, setParkingType] = useState("surface");
  const [targetStrategy, setTargetStrategy] = useState("missing-middle");
  const [bedMix, setBedMix] = useState("balanced");
  const [marketStyle, setMarketStyle] = useState("attainable");
  const [parkingRatio, setParkingRatio] = useState(1.3);
  const [efficiency, setEfficiency] = useState(0.72);
  const [customUnitSize, setCustomUnitSize] = useState(0);
  const [showQuickSummary, setShowQuickSummary] = useState(true);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => {
    const safeSiteArea = Math.max(1000, Number(siteArea) || 0);
    const safeLotWidth = Math.max(20, Number(lotWidth) || 0);
    const safeLotDepth = Math.max(20, Number(lotDepth) || 0);
    const safeStories = Math.max(1, Math.min(6, Number(maxStories) || 1));
    const safeEfficiency = Math.max(0.45, Math.min(0.9, Number(efficiency) || 0.72));

    const lotArea = safeLotWidth * safeLotDepth;
    const effectiveSiteArea = Math.max(safeSiteArea, lotArea);

    const parkingFactor =
      parkingType === "surface" ? 0.38 :
      parkingType === "rear-loaded" ? 0.46 : 0.58;

    const buildableFootprint = Math.round(effectiveSiteArea * parkingFactor);
    const grossArea = Math.round(buildableFootprint * safeStories);

    let avgUnitSize = 850;
    if (bedMix === "studio-heavy") avgUnitSize = 625;
    if (bedMix === "family") avgUnitSize = 1025;
    if (bedMix === "one-bed-heavy") avgUnitSize = 760;
    if (customUnitSize > 250) avgUnitSize = customUnitSize;

    const netResidentialArea = Math.round(grossArea * safeEfficiency);
    const unitCount = Math.max(4, Math.floor(netResidentialArea / avgUnitSize));
    const parkingSpaces = Math.round(unitCount * parkingRatio);

    let concept = "courtyard";
    if (targetStrategy === "townhome") concept = "townhome row";
    else if (targetStrategy === "small-apartment") concept = safeLotWidth < 70 ? "bar" : "double-loaded apartment";
    else if (parkingType === "structured" && safeLotWidth > 85) concept = "podium-lite";
    else if (safeLotWidth < 70) concept = "bar";

    let bestSystem = "wood-frame walk-up with simple shared corridor";
    if (concept === "bar") bestSystem = "simple bar building with repeated units";
    if (concept === "courtyard") bestSystem = "courtyard building with repeated double-loaded units";
    if (concept === "podium-lite") bestSystem = "hybrid podium-style system only if land value or parking pressure justifies it";
    if (concept === "townhome row") bestSystem = "repeated townhome blocks with simple rear access";
    if (concept === "double-loaded apartment") bestSystem = "double-loaded wood-frame apartment with stacked units";

    const styleLanguage =
      marketStyle === "premium"
        ? "higher-end materials and stronger curb appeal"
        : marketStyle === "workforce"
          ? "durable low-cost materials and clean practical massing"
          : "clean attainable materials with balanced cost and appeal";

    const memo = `${projectName} is an early-stage multifamily concept generated from basic parcel constraints. Based on an effective site area of ${effectiveSiteArea.toLocaleString()} SF and ${safeStories} stories, the current concept suggests approximately ${unitCount} units using a ${concept} building form. The recommended system is ${bestSystem}. The visual direction should use ${styleLanguage}. The goal of this concept is not precision but speed—rapidly translating parcel data into development direction before formal design begins.`;

    const perfectImagePrompt = `A clean architectural concept rendering of a ${safeStories}-story ${concept} multifamily building on an urban infill parcel, designed as ${bestSystem}, using ${styleLanguage}, realistic parking layout, simple landscaping, highly legible massing, developer presentation style, clean daylight perspective.`;

    const yieldScenarios = [2, 3, 4, 5].map((stories) => {
      const scenarioGross = Math.round(buildableFootprint * stories);
      const scenarioNet = Math.round(scenarioGross * safeEfficiency);
      const scenarioUnits = Math.max(4, Math.floor(scenarioNet / avgUnitSize));
      return { stories, units: scenarioUnits };
    });

    const quickSummary = {
      buildThis: concept,
      bestSystem,
      goodBecause:
        concept === "courtyard"
          ? "it repeats well and makes the site feel organized"
          : concept === "bar"
            ? "it fits tighter lots and stays simple"
            : concept === "townhome row"
              ? "it is easy to repeat and easy to understand"
              : "it can fit more homes without getting too weird",
      watchOutFor:
        parkingType === "surface"
          ? "surface parking can eat your site"
          : parkingType === "structured"
            ? "structured parking can get expensive fast"
            : "rear-loaded access still needs clean circulation"
    };

    return {
      unitCount,
      parkingSpaces,
      concept,
      memo,
      bestSystem,
      perfectImagePrompt,
      yieldScenarios,
      quickSummary
    };
  }, [
    projectName,
    siteArea,
    lotWidth,
    lotDepth,
    maxStories,
    parkingType,
    targetStrategy,
    bedMix,
    marketStyle,
    parkingRatio,
    efficiency,
    customUnitSize
  ]);

  const copyText = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("copy failed");
      setTimeout(() => setCopied(""), 1800);
    }
  };

  const buildingHeight = 20 + maxStories * 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-100 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 text-sm text-violet-200">
            Concept Tool
          </div>
          <h1 className="text-4xl font-bold">LotBuddy AI — Multifamily Concept Engine</h1>
          <p className="max-w-3xl text-slate-300">
            An AI-assisted concept tool that turns basic parcel constraints into early-stage multifamily development strategies, yield estimates, and risk signals.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <Panel
            title="Project Inputs"
            description="Adjust parcel and development inputs to test different scenarios."
            className="xl:col-span-2"
          >
            <div className="space-y-4">
              <div className="text-xs leading-relaxed text-slate-400">
                Enter basic parcel assumptions. You typically get this information from a listing, GIS parcel data, or zoning lookup.
                The goal is not perfect accuracy — it is to quickly test development ideas.
              </div>

              <Field label="Project Name" help="Just a label for the scenario you are testing.">
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Example: Small Infill Courtyard"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Site Area (SF)" help="Total parcel square footage. Example: 10,000–20,000 SF for small infill.">
                  <input
                    type="number"
                    value={siteArea}
                    onChange={(e) => setSiteArea(Number(e.target.value))}
                    placeholder="12000"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                  />
                </Field>
                <Field label="Custom Avg Unit Size" help="Override the automatic unit size estimate.">
                  <input
                    type="number"
                    value={customUnitSize}
                    onChange={(e) => setCustomUnitSize(Number(e.target.value))}
                    placeholder="0 = auto"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Lot Width" help="Street frontage width in feet.">
                  <input
                    type="number"
                    value={lotWidth}
                    onChange={(e) => setLotWidth(Number(e.target.value))}
                    placeholder="100"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                  />
                </Field>
                <Field label="Lot Depth" help="Distance from street to back of parcel.">
                  <input
                    type="number"
                    value={lotDepth}
                    onChange={(e) => setLotDepth(Number(e.target.value))}
                    placeholder="120"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                  />
                </Field>
              </div>

              <Field label="Stories" help="Typical zoning allows 2–5 stories for small multifamily.">
                <RangeField value={maxStories} min={1} max={6} step={1} onChange={setMaxStories} />
                <div className="mt-1 text-sm text-slate-400">{maxStories} stories</div>
              </Field>

              <Field label="Parking Ratio" help="Spaces per unit required by zoning (often 1.0–1.5).">
                <RangeField value={parkingRatio} min={0.5} max={2} step={0.1} onChange={setParkingRatio} />
                <div className="mt-1 text-sm text-slate-400">{parkingRatio.toFixed(1)} spaces per unit</div>
              </Field>

              <Field label="Efficiency" help="Net rentable efficiency (typically 65–80%).">
                <RangeField value={efficiency} min={0.45} max={0.9} step={0.01} onChange={setEfficiency} />
                <div className="mt-1 text-sm text-slate-400">{Math.round(efficiency * 100)}% net efficiency</div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Parking Type" help="How parking is arranged on the site.">
                  <SelectField
                    value={parkingType}
                    onChange={setParkingType}
                    options={[
                      { value: "surface", label: "Surface" },
                      { value: "rear-loaded", label: "Rear Loaded" },
                      { value: "structured", label: "Structured" }
                    ]}
                  />
                </Field>
                <Field label="Target Strategy" help="What type of housing you want to test.">
                  <SelectField
                    value={targetStrategy}
                    onChange={setTargetStrategy}
                    options={[
                      { value: "missing-middle", label: "Missing Middle" },
                      { value: "small-apartment", label: "Small Apartment" },
                      { value: "townhome", label: "Townhome" }
                    ]}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Bedroom Mix" help="Approximate tenant type.">
                  <SelectField
                    value={bedMix}
                    onChange={setBedMix}
                    options={[
                      { value: "balanced", label: "Balanced" },
                      { value: "studio-heavy", label: "Studio Heavy" },
                      { value: "one-bed-heavy", label: "1BR Heavy" },
                      { value: "family", label: "Family" }
                    ]}
                  />
                </Field>
                <Field label="Market Style" help="General price positioning of the project.">
                  <SelectField
                    value={marketStyle}
                    onChange={setMarketStyle}
                    options={[
                      { value: "attainable", label: "Attainable" },
                      { value: "premium", label: "Premium" },
                      { value: "workforce", label: "Workforce" }
                    ]}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Quick Summary</div>
                  <div className="text-xs text-slate-400">Display simplified concept results</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickSummary(!showQuickSummary)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
                >
                  {showQuickSummary ? "On" : "Off"}
                </button>
              </div>
            </div>
          </Panel>

          <div className="space-y-6 xl:col-span-3">
            <Panel title="Concept Output" description="Summary of the generated concept based on the current inputs.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Concept", result.concept],
                  ["Units", result.unitCount],
                  ["Parking", result.parkingSpaces],
                  ["Best system", result.bestSystem]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-950 p-4">
                    <div className="text-sm text-slate-400">{label}</div>
                    <div className="text-base font-semibold capitalize">{value}</div>
                  </div>
                ))}
              </div>
            </Panel>

            {showQuickSummary && (
              <Panel title="Quick Summary" description="Simplified summary of the concept results.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Build this", result.quickSummary.buildThis],
                    ["Best system", result.quickSummary.bestSystem],
                    ["Good because", result.quickSummary.goodBecause],
                    ["Watch out for", result.quickSummary.watchOutFor]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-slate-950 p-4">
                      <div className="text-sm text-slate-400">{label}</div>
                      <div className="text-base font-semibold capitalize">{value}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            <Panel title="Live Site Diagram" description="Simple visual massing generated from parcel inputs.">
              <div className="space-y-4">
                <svg viewBox="0 0 300 200" className="h-60 w-full rounded-xl bg-slate-950">
                  <rect x="10" y="10" width="280" height="180" fill="none" stroke="#555" />

                  {result.concept === "courtyard" && (
                    <>
                      <rect x="45" y="45" width="70" height="45" fill="#8b5cf6" opacity="0.85" />
                      <rect x="185" y="45" width="70" height="45" fill="#8b5cf6" opacity="0.85" />
                      <rect x="45" y="110" width="70" height="45" fill="#8b5cf6" opacity="0.85" />
                      <rect x="185" y="110" width="70" height="45" fill="#8b5cf6" opacity="0.85" />
                      <text x="150" y="104" textAnchor="middle" fill="#94a3b8" fontSize="10">courtyard</text>
                    </>
                  )}

                  {result.concept === "bar" && (
                    <rect x="45" y={180 - buildingHeight} width="210" height={buildingHeight} fill="#8b5cf6" opacity="0.85" />
                  )}

                  {result.concept === "podium-lite" && (
                    <>
                      <rect x="40" y="125" width="220" height="40" fill="#334155" opacity="0.95" />
                      <rect x="60" y={125 - buildingHeight + 45} width="180" height={buildingHeight - 45} fill="#8b5cf6" opacity="0.85" />
                    </>
                  )}

                  {result.concept === "townhome row" && (
                    <>
                      {[0, 1, 2, 3].map((i) => (
                        <rect key={i} x={35 + i * 58} y="95" width="42" height="60" fill="#8b5cf6" opacity="0.85" />
                      ))}
                    </>
                  )}

                  {result.concept === "double-loaded apartment" && (
                    <rect x="55" y={180 - buildingHeight} width="190" height={buildingHeight} fill="#8b5cf6" opacity="0.85" />
                  )}

                  <text x="150" y="20" textAnchor="middle" fill="#aaa" fontSize="10">parcel</text>
                </svg>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400"><Home className="h-4 w-4" /> Best system</div>
                    <div className="text-sm text-slate-200">{result.bestSystem}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400"><LineChart className="h-4 w-4" /> Site yield</div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {result.yieldScenarios.map((s) => (
                        <div
                          key={s.stories}
                          className={`rounded-xl border p-3 ${s.stories === maxStories ? "border-violet-400 bg-violet-500/15 text-violet-200" : "border-slate-800 bg-slate-900 text-slate-300"}`}
                        >
                          <div>{s.stories}F</div>
                          <div className="mt-1 text-base font-semibold">{s.units}</div>
                          <div className="text-[10px] text-slate-400">units</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Generated Content" description="Generated outputs based on the current scenario inputs.">
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-950 p-4 text-sm">
                  <div className="mb-2 font-semibold">Developer memo</div>
                  {result.memo}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
                  <div className="mb-2 font-semibold">Perfect image prompt</div>
                  <div className="text-slate-400">{result.perfectImagePrompt}</div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => copyText("memo copied", result.memo)}
                    className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Memo
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText("image prompt copied", result.perfectImagePrompt)}
                    className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Copy Image Prompt
                  </button>
                  {copied ? <div className="self-center text-sm text-emerald-300">{copied}</div> : null}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
