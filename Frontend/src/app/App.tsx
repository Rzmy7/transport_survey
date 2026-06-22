import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  ChevronRight, ChevronLeft, CheckCircle, BarChart2, Download,
  Bus, ArrowRight, RotateCcw, Home, AlertCircle, LogOut, MapPin,
  Plus, X
} from "lucide-react";
import {
  adminLogin,
  adminLogout,
  deleteAllSurveyResponses,
  clearAdminToken,
  downloadAdminCsv,
  fetchAdminAnalytics,
  getAdminToken,
  setAdminToken,
  submitSurvey,
  type Analytics,
  type SurveyPayload,
} from "./api";

// ─── Types ───────────────────────────────────────────────────────────────────

type View = "home" | "survey" | "thankyou" | "admin-login" | "admin-dashboard";

type CurrentAnswers = {
  busType: string;
  route: string;
  demographic: string;
  seatType: string;
  hasPainPoints: boolean | null;
  painPoints: string[];
  sleepComfort: string;
};

type LegacySurveyResponse = SurveyPayload & {
  id: string;
  timestamp: string;
};

function loadResponses(): LegacySurveyResponse[] {
  return [];
}

// ─── Storage ─────────────────────────────────────────────────────────────────

// ─── SVG: High-Back Fixed Seat ───────────────────────────────────────────────

function SeatHighBack({ selected }: { selected: boolean }) {
  const M = selected ? "#1d4ed8" : "#9ca3af";
  const P = selected ? "#93c5fd" : "#e5e7eb";
  const D = selected ? "#1e3a8a" : "#6b7280";
  const L = selected ? "#bfdbfe" : "#f3f4f6";
  return (
    <svg viewBox="0 0 120 155" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Headrest */}
      <rect x="30" y="4" width="60" height="20" rx="6" fill={D} />
      <rect x="35" y="8" width="50" height="12" rx="4" fill={P} />
      {/* Neck connector */}
      <rect x="45" y="22" width="30" height="6" fill={M} />
      {/* Tall straight back */}
      <rect x="14" y="26" width="92" height="70" rx="5" fill={M} />
      <rect x="20" y="31" width="80" height="60" rx="4" fill={P} />
      {/* Minimal stitching – shows thin padding */}
      <line x1="25" y1="45" x2="95" y2="45" stroke={L} strokeWidth="1" strokeDasharray="6 5" />
      <line x1="25" y1="60" x2="95" y2="60" stroke={L} strokeWidth="1" strokeDasharray="6 5" />
      <line x1="25" y1="75" x2="95" y2="75" stroke={L} strokeWidth="1" strokeDasharray="6 5" />
      {/* Armrests */}
      <rect x="4" y="82" width="13" height="30" rx="5" fill={D} />
      <rect x="103" y="82" width="13" height="30" rx="5" fill={D} />
      {/* Seat base */}
      <rect x="9" y="93" width="102" height="22" rx="5" fill={M} />
      <rect x="14" y="96" width="92" height="16" rx="4" fill={P} />
      <line x1="19" y1="103" x2="101" y2="103" stroke={L} strokeWidth="1" strokeDasharray="6 5" />
      {/* Legs */}
      <rect x="17" y="115" width="11" height="32" rx="3" fill={D} />
      <rect x="92" y="115" width="11" height="32" rx="3" fill={D} />
      {/* Floor */}
      <line x1="4" y1="147" x2="116" y2="147" stroke={D} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── SVG: Padded Bench Seat ───────────────────────────────────────────────────

function SeatPaddedBench({ selected }: { selected: boolean }) {
  const M = selected ? "#1d4ed8" : "#9ca3af";
  const P = selected ? "#93c5fd" : "#e5e7eb";
  const D = selected ? "#1e3a8a" : "#6b7280";
  const L = selected ? "#bfdbfe" : "#f3f4f6";
  const H = selected ? "#dbeafe" : "#f9fafb";
  return (
    <svg viewBox="0 0 120 155" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Rounded padded back */}
      <rect x="9" y="18" width="102" height="68" rx="16" fill={M} />
      <rect x="15" y="23" width="90" height="58" rx="13" fill={P} />
      {/* Cushion puff highlight */}
      <ellipse cx="60" cy="38" rx="34" ry="11" fill={H} opacity="0.5" />
      {/* Dense tufting – shows thick padding */}
      <line x1="20" y1="35" x2="100" y2="35" stroke={L} strokeWidth="1.5" strokeDasharray="5 3" />
      <line x1="20" y1="47" x2="100" y2="47" stroke={L} strokeWidth="1.5" strokeDasharray="5 3" />
      <line x1="20" y1="59" x2="100" y2="59" stroke={L} strokeWidth="1.5" strokeDasharray="5 3" />
      <line x1="20" y1="71" x2="100" y2="71" stroke={L} strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Rounded armrests */}
      <rect x="2" y="76" width="15" height="36" rx="8" fill={D} />
      <rect x="103" y="76" width="15" height="36" rx="8" fill={D} />
      {/* Wide bench seat */}
      <rect x="7" y="84" width="106" height="32" rx="13" fill={M} />
      <rect x="12" y="88" width="96" height="24" rx="10" fill={P} />
      <ellipse cx="60" cy="95" rx="38" ry="8" fill={H} opacity="0.35" />
      <line x1="17" y1="96" x2="103" y2="96" stroke={L} strokeWidth="1.5" strokeDasharray="5 3" />
      <line x1="17" y1="107" x2="103" y2="107" stroke={L} strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Legs */}
      <rect x="15" y="116" width="12" height="31" rx="4" fill={D} />
      <rect x="93" y="116" width="12" height="31" rx="4" fill={D} />
      {/* Floor */}
      <line x1="4" y1="147" x2="116" y2="147" stroke={D} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Language Switcher ────────────────────────────────────────────────────────

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  
  return (
    <div className="flex items-center p-1 bg-blue-50 rounded-full border border-blue-100 shadow-inner">
      <button
        onClick={() => i18n.changeLanguage('si')}
        className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 ${
          !isEn
            ? "bg-white text-blue-900 shadow-sm border border-blue-200/50"
            : "text-blue-600 hover:text-blue-800 hover:bg-blue-100/50"
        }`}
      >
        සිංහල
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 ${
          isEn
            ? "bg-white text-blue-900 shadow-sm border border-blue-200/50"
            : "text-blue-600 hover:text-blue-800 hover:bg-blue-100/50"
        }`}
      >
        English
      </button>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const { t } = useTranslation();
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
          {t("survey.questionLabel")} {step + 1} {t("survey.of")} {total}
        </span>
        <span className="text-xs font-bold text-blue-800">{pct}% {t("survey.complete")}</span>
      </div>
      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex mt-3 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < step + 1 ? "bg-blue-600" : "bg-blue-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Question Renderers ───────────────────────────────────────────────────────

function RadioOption({
  value, label, selected, onChange,
}: { value: string; label: string; selected: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
        selected
          ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
        selected ? "border-blue-600 bg-blue-600" : "border-gray-300"
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <span className={`font-medium text-sm ${selected ? "text-blue-900" : "text-gray-700"}`}>{label}</span>
    </button>
  );
}

function Q1({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const options = [
    { value: "SLTB Bus", label: t("survey.q1.sltb") },
    { value: "Private Bus", label: t("survey.q1.private") },
  ];
  return (
    <div className="space-y-3">
      {options.map(o => (
        <RadioOption key={o.value} value={o.value} label={o.label} selected={value === o.value} onChange={() => onChange(o.value)} />
      ))}
    </div>
  );
}

function Q2({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-4 h-4" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={t("survey.q2.placeholder")}
          className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-400 transition-colors text-sm"
        />
      </div>
    </div>
  );
}

function Q3({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const options = [
    { value: "Male (30–90)", label: t("survey.q3.male") },
    { value: "Female (30–90)", label: t("survey.q3.female") },
    { value: "Teenager (13–29)", label: t("survey.q3.teenager") },
    { value: "Child (8–12)", label: t("survey.q3.child") },
  ];
  return (
    <div className="space-y-3">
      {options.map(o => (
        <RadioOption key={o.value} value={o.value} label={o.label} selected={value === o.value} onChange={() => onChange(o.value)} />
      ))}
    </div>
  );
}

function SeatCard({
  seatComp: SeatComp, label, sublabel, selected, onClick,
}: {
  seatComp: React.ComponentType<{ selected: boolean }>;
  label: string;
  sublabel: string;
  selected: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer w-full ${
        selected
          ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="w-32 h-40 flex items-end justify-center mb-3">
        <SeatComp selected={selected} />
      </div>
      <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${selected ? "text-blue-700" : "text-gray-500"}`}>
        {label}
      </div>
      <div className={`text-xs text-center leading-snug ${selected ? "text-blue-800" : "text-gray-600"}`}>
        {sublabel}
      </div>
      {selected && (
        <div className="mt-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          {t("common.selected")}
        </div>
      )}
    </button>
  );
}

function Q4({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4">
      <SeatCard
        seatComp={SeatHighBack}
        label={t("survey.q4.optionA")}
        sublabel={t("survey.q4.optionASub")}
        selected={value === "A"}
        onClick={() => onChange("A")}
      />
      <SeatCard
        seatComp={SeatPaddedBench}
        label={t("survey.q4.optionB")}
        sublabel={t("survey.q4.optionBSub")}
        selected={value === "B"}
        onClick={() => onChange("B")}
      />
    </div>
  );
}

function Q5({
  hasPainPoints,
  painPoints,
  onChange,
}: {
  hasPainPoints: boolean | null;
  painPoints: string[];
  onChange: (hasPain: boolean | null, pp: string[]) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <RadioOption
          value="no"
          label={t("survey.q5.noPain")}
          selected={hasPainPoints === false}
          onChange={() => onChange(false, [])}
        />
        <RadioOption
          value="yes"
          label={t("survey.q5.yesPain")}
          selected={hasPainPoints === true}
          onChange={() => onChange(true, painPoints.length ? painPoints : [""])}
        />
      </div>

      {hasPainPoints === true && (
        <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-bold text-gray-700">{t("survey.q5.prompt")}</label>
          {painPoints.map((v, i) => (
            <div key={i} className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">{i + 1}</span>
                </div>
                <input
                  type="text"
                  value={v}
                  maxLength={255}
                  onChange={e => {
                    const next = [...painPoints];
                    next[i] = e.target.value;
                    onChange(true, next);
                  }}
                  placeholder={t("survey.q5.placeholder")}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-400 transition-colors text-sm"
                />
              </div>
              <button
                onClick={() => {
                  const next = painPoints.filter((_, idx) => idx !== i);
                  onChange(true, next);
                }}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                aria-label="Remove pain point"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          {painPoints.length < 20 && (
            <button
              onClick={() => onChange(true, [...painPoints, ""])}
              className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors py-2 px-1"
            >
              <Plus className="w-4 h-4" />
              {t("survey.q5.addPainPoint")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Q6({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      {[
        { val: "A", SeatComp: SeatHighBack, label: t("survey.q6.optionA"), sublabel: t("survey.q6.optionASub") },
        { val: "B", SeatComp: SeatPaddedBench, label: t("survey.q6.optionB"), sublabel: t("survey.q6.optionBSub") },
      ].map(({ val, SeatComp, label, sublabel }) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`w-full flex items-center gap-5 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
            value === val
              ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
              : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
          }`}
        >
          <div className="w-24 h-28 flex-shrink-0">
            <SeatComp selected={value === val} />
          </div>
          <div className="flex-1">
            <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${value === val ? "text-blue-700" : "text-gray-500"}`}>
              {label}
            </div>
            <div className={`text-sm font-semibold ${value === val ? "text-blue-900" : "text-gray-700"}`}>
              {sublabel}
            </div>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            value === val ? "border-blue-600 bg-blue-600" : "border-gray-300"
          }`}>
            {value === val && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({
  onStart,
}: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background font-sans">
      <style>{`body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }`}</style>
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-primary leading-none">{t("header.title")}</div>
              <div className="text-[10px] text-muted-foreground leading-none">{t("header.subtitle")}</div>
            </div>
          </div>          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-56 sm:h-72 overflow-hidden bg-blue-900">
        <img
          src="https://images.unsplash.com/photo-1743007783965-47cea6c1ce1c?w=1200&h=500&fit=crop&auto=format"
          alt="A blue Galle Express bus on a Sri Lankan road"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-900/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
            {t("home.tag")}
          </div>
          <h1 className="text-white text-2xl sm:text-4xl font-extrabold leading-tight max-w-xl">
            {t("home.heroTitleLine1")}<br />{t("home.heroTitleLine2")}
          </h1>
          <p className="text-blue-200 text-sm mt-2 font-medium">{t("home.heroSubtitle")}</p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* About card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-3">{t("home.aboutTitle")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {t("home.aboutTextPart1")} <span className="font-semibold text-foreground">{t("home.aboutSltb")}</span> {t("home.aboutAnd")}{" "} <span className="font-semibold text-foreground">{t("home.aboutPrivate")}</span>{t("home.aboutTextPart2")}
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: "🕐", label: t("home.timeAmount"), sub: t("home.timeSub") },
              { icon: "🔒", label: t("home.anonymousLabel"), sub: t("home.anonymousSub") },
              { icon: "🪑", label: t("home.questionsLabel"), sub: t("home.questionsSub") },
            ].map(item => (
              <div key={item.label} className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-xs font-bold text-blue-900">{item.label}</div>
                <div className="text-[10px] text-blue-600">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98] text-base"
        >
          {t("home.startSurvey")}
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-muted-foreground">
          {t("home.footerNote")}
        </p>
      </main>
    </div>
  );
}

// ─── Survey Page ──────────────────────────────────────────────────────────────

const QUESTIONS = [
  { label: "Which type of bus did you travel on?", field: "busType" },
  { label: "What was your travel route?", field: "route" },
  { label: "Select your age and gender category", field: "demographic" },
  { label: "Which seat type did you use during the journey?", field: "seatType" },
  { label: "What pain points did you experience during the journey?", field: "painPoints" },
  { label: "Which seat type provides better sleep comfort during long-distance travel?", field: "sleepComfort" },
];

function SurveyPage({
  step, current, errors, submitting, submitError, onNext, onPrev, onChange,
}: {
  step: number;
  current: CurrentAnswers;
  errors: Record<string, string>;
  submitting: boolean;
  submitError: string;
  onNext: () => void;
  onPrev: () => void;
  onChange: (field: string, value: any) => void;
}) {
  const { t } = useTranslation();
  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <style>{`body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }`}</style>
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Bus className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <ProgressBar step={step} total={QUESTIONS.length} />
          </div>          <LanguageSwitcher />
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col">
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
              {t("survey.questionLabel")} {step + 1}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-6 leading-snug">{t(`survey.${q.field === "demographic" ? "q3" : q.field === "busType" ? "q1" : q.field === "route" ? "q2" : q.field === "seatType" ? "q4" : q.field === "painPoints" ? "q5" : "q6"}.title`)}</h2>

          {step === 0 && (
            <Q1 value={current.busType} onChange={v => onChange("busType", v)} />
          )}
          {step === 1 && (
            <Q2 value={current.route} onChange={v => onChange("route", v)} />
          )}
          {step === 2 && (
            <Q3 value={current.demographic} onChange={v => onChange("demographic", v)} />
          )}
          {step === 3 && (
            <Q4 value={current.seatType} onChange={v => onChange("seatType", v)} />
          )}
          {step === 4 && (
            <Q5
              hasPainPoints={current.hasPainPoints}
              painPoints={current.painPoints}
              onChange={(has, pp) => {
                onChange("hasPainPoints", has);
                onChange("painPoints", pp);
              }}
            />
          )}
          {step === 5 && (
            <Q6 value={current.sleepComfort} onChange={v => onChange("sleepComfort", v)} />
          )}

          {errors[q.field] && (
            <div className="mt-4 flex items-center gap-2 text-destructive text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors[q.field]}
            </div>
          )}
          {errors["painPoints"] && (
            <div className="mt-4 flex items-center gap-2 text-destructive text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors["painPoints"]}
            </div>
          )}
          {submitError && (
            <div className="mt-4 flex items-center gap-2 text-destructive text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={onPrev}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-bold hover:border-blue-300 hover:text-blue-700 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("common.previous")}
            </button>
          )}
          <button
            onClick={onNext}
            disabled={submitting}
            className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-[0.98] ${
              step > 0 ? "flex-1" : "w-full"
            } disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed ${
              isLast
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 hover:shadow-emerald-300"
                : "bg-primary hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300"
            }`}
          >
            {submitting ? (
              <>{t("common.submitting")}</>
            ) : isLast ? (
              <>{t("common.submit")} <CheckCircle className="w-4 h-4" /></>
            ) : (
              <>{t("common.next")} <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Thank You Page ───────────────────────────────────────────────────────────

function ThankYouPage({
  onStart,
}: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 font-sans">
      <style>{`body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }`}</style>
      <div className="max-w-md w-full bg-white rounded-3xl border border-border shadow-xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
          {t("thankyou.tag")}
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-3">
          {t("thankyou.title")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {t("thankyou.textPart1")} <span className="font-semibold text-foreground">{t("thankyou.textBold")}</span>{t("thankyou.textPart2")}
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">{t("thankyou.researchNoteTitle")}</div>
          <p className="text-xs text-blue-800 leading-relaxed">
            {t("thankyou.researchNoteTextPart1")} <em>{t("thankyou.researchNoteItalic")}</em> {t("thankyou.researchNoteTextPart2")}
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <RotateCcw className="w-4 h-4" />
            {t("thankyou.submitAnother")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const CHART_COLORS = ["#1d4ed8", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
      <div className="text-2xl font-extrabold text-primary mb-1">{value}</div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Dashboard({
  analytics, onBack, onExport, onDeleteAll, onLogout, loading, error,
}: {
  analytics: Analytics;
  onBack: () => void;
  onExport: () => void;
  onDeleteAll: () => void;
  onLogout: () => void;
  loading: boolean;
  error: string;
}) {
  const { t } = useTranslation();
  const sltb = analytics.busType.find(b => b.name === "SLTB Bus")?.value || 0;
  const priv = analytics.busType.find(b => b.name === "Private Bus")?.value || 0;

  return (
    <div className="min-h-screen bg-background font-sans">
      <style>{`body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }`}</style>
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Home className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <div className="text-sm font-bold text-foreground">{t("dashboard.title")}</div>
              <div className="text-xs text-muted-foreground">{t("dashboard.subtitle")}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">            <LanguageSwitcher />
            <button
              onClick={onExport}
              disabled={analytics.total === 0 || loading}
              className="flex items-center gap-2 bg-primary hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {t("common.exportCsv")}
            </button>
            <button
              onClick={onDeleteAll}
              disabled={analytics.total === 0 || loading}
              className="flex items-center gap-2 border border-red-200 text-red-700 text-xs font-bold px-4 py-2 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {t("common.deleteAll")}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t("common.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-foreground mb-2">{t("dashboard.loadingTitle")}</h2>
            <p className="text-muted-foreground text-sm">{t("dashboard.loadingSub")}</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-destructive mb-2">{t("dashboard.errorTitle")}</h2>
            <p className="text-muted-foreground text-sm mb-6">{error}</p>
            <button onClick={onBack} className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              {t("common.backToSurvey")}
            </button>
          </div>
        ) : analytics.total === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-foreground mb-2">{t("dashboard.emptyTitle")}</h2>
            <p className="text-muted-foreground text-sm mb-6">{t("dashboard.emptySub")}</p>
            <button onClick={onBack} className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              {t("common.goToSurvey")}
            </button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label={t("dashboard.stats.totalResponses")} value={analytics.total} sub={t("dashboard.stats.passengersSurveyed")} />
              <StatCard label={t("dashboard.stats.sltbRiders")} value={sltb} sub={`${analytics.total ? Math.round(sltb / analytics.total * 100) : 0}% ${t("dashboard.stats.ofTotal")}` } />
              <StatCard label={t("dashboard.stats.privateBus")} value={priv} sub={`${analytics.total ? Math.round(priv / analytics.total * 100) : 0}% ${t("dashboard.stats.ofTotal")}` } />
              <StatCard label={t("dashboard.stats.painPoints")} value={analytics.topPains.reduce((a, b) => a + b.value, 0)} sub={t("dashboard.stats.totalReported")} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Bus Type Pie */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-bold text-foreground mb-1 text-sm">{t("dashboard.charts.busTypeTitle")}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t("dashboard.charts.busTypeSub")}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={analytics.busType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {analytics.busType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Demographic Bar */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-bold text-foreground mb-1 text-sm">{t("dashboard.charts.demographicTitle")}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t("dashboard.charts.demographicSub")}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.demographic} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Seat Type Pie */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-bold text-foreground mb-1 text-sm">{t("dashboard.charts.seatTypeTitle")}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t("dashboard.charts.seatTypeSub")}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={analytics.seatType.map(d => ({ ...d, name: d.name === "A" ? "Option A (High-Back)" : "Option B (Padded Bench)" }))}
                      cx="50%" cy="50%" outerRadius={80} dataKey="value"
                      label={({ name, percent }) => `${name.split(" ")[0]} ${name.split(" ")[1]} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false} fontSize={11}
                    >
                      {analytics.seatType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend formatter={(v) => v} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* {t("dashboard.charts.sleepComfortTitle")} */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-bold text-foreground mb-1 text-sm">{t("dashboard.charts.sleepComfortTitle")}</h3>
                <p className="text-xs text-muted-foreground mb-4">Preferred seat for long-distance travel</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={analytics.sleepComfort.map(d => ({ ...d, name: d.name === "A" ? "High-Back (A)" : "Padded Bench (B)" }))}
                    margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pain Points */}
            {analytics.topPains.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-bold text-foreground mb-1 text-sm">Top Reported Pain Points</h3>
                <p className="text-xs text-muted-foreground mb-4">Most frequently mentioned comfort issues</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analytics.topPains} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} width={140} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground pb-4">
              Passenger Comfort Evaluation System (PCES) · Sri Lankan Public Transportation Research
            </p>
          </>
        )}
      </main>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

function AdminLoginPage({
  email, password, error, loading, onEmailChange, onPasswordChange, onSubmit, onBack,
}: {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 font-sans">
      <style>{`body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }`}</style>
      <div className="max-w-sm w-full bg-white rounded-3xl border border-border shadow-xl p-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-5">
          <BarChart2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Admin Analytics</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to view survey analytics and export responses.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:outline-none text-gray-800 text-sm"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => onPasswordChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") onSubmit();
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:outline-none text-gray-800 text-sm"
              placeholder="Password"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button
            onClick={onBack}
            className="w-full border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            {t("common.backToSurvey")}
          </button>
        </div>
      </div>
    </div>
  );
}

const INITIAL_ANSWERS: CurrentAnswers = {
  busType: "",
  route: "",
  demographic: "",
  seatType: "",
  hasPainPoints: null,
  painPoints: [],
  sleepComfort: "",
};

export default function App() {
  const initialView: View = window.location.pathname === "/admin/dashboard"
    ? "admin-dashboard"
    : window.location.pathname === "/admin/login"
      ? "admin-login"
      : "home";
  const [view, setView] = useState<View>(initialView);
  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState<CurrentAnswers>(INITIAL_ANSWERS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({
    total: 0,
    busType: [],
    demographic: [],
    seatType: [],
    sleepComfort: [],
    topPains: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  function navigate(nextView: View, path: string) {
    window.history.pushState({}, "", path);
    setView(nextView);
  }

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname === "/admin/dashboard") {
        setView("admin-dashboard");
      } else if (window.location.pathname === "/admin/login") {
        setView("admin-login");
      } else {
        setView("home");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (view !== "admin-dashboard") return;

    const token = getAdminToken();
    if (!token) {
      navigate("admin-login", "/admin/login");
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError("");
    fetchAdminAnalytics(token)
      .then(setAnalytics)
      .catch(error => {
        clearAdminToken();
        setAnalyticsError(error instanceof Error ? error.message : "Unable to load analytics.");
        navigate("admin-login", "/admin/login");
      })
      .finally(() => setAnalyticsLoading(false));
  }, [view]);

  const updateField = useCallback((field: string, value: any) => {
    setCurrent(prev => ({ ...prev, [field]: value }));
    setSubmitError("");
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      delete next["painPoints"];
      return next;
    });
  }, []);

  function validate(): boolean {
    const field = QUESTIONS[step].field;
    if (field === "painPoints") {
      if (current.hasPainPoints === null) {
        setErrors({ painPoints: t("validation.selectPainPoint") });
        return false;
      }
      if (current.hasPainPoints === true) {
        const hasValid = current.painPoints.some(p => p.trim() !== "");
        if (!hasValid) {
          setErrors({ painPoints: t("validation.enterAtLeastOne") });
          return false;
        }
      }
      return true;
    }
    const val = current[field as keyof CurrentAnswers];
    if (!val || (typeof val === "string" && !val.trim())) {
      setErrors({ [field]: t("validation.required") });
      return false;
    }
    return true;
  }

  async function handleNext() {
    if (submitting) return;
    if (!validate()) return;
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      setSubmitting(true);
      setSubmitError("");
      try {
        await submitSurvey(current as SurveyPayload);
        setView("thankyou");
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Unable to submit the survey.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  function handlePrev() {
    if (step > 0) setStep(s => s - 1);
  }

  function startSurvey() {
    setCurrent(INITIAL_ANSWERS);
    setStep(0);
    setErrors({});
    setSubmitError("");
    setView("survey");
  }

  function exportCSV() {
    const all = loadResponses();
    if (!all.length) return;
    const headers = ["ID", "Timestamp", "Bus Type", "Route", "Demographic", t("dashboard.charts.seatTypeTitle"), "Pain Points", "Sleep Comfort Seat Preference"];
    const rows = all.map(r => [
      r.id, r.timestamp, r.busType, r.route, r.demographic,
      r.seatType === "A" ? "Fixed High-Back (A)" : "Padded Bench (B)",
      r.painPoints.join(" | "),
      r.sleepComfort === "A" ? "Fixed High-Back (A)" : "Padded Bench (B)",
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv, ""], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PCES_Survey_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const legacyAnalytics = (() => {
    const all = loadResponses();

    function countField(field: keyof LegacySurveyResponse) {
      const map: Record<string, number> = {};
      all.forEach(r => {
        const v = r[field] as string;
        if (v) map[v] = (map[v] || 0) + 1;
      });
      return Object.entries(map).map(([name, value]) => ({ name, value }));
    }

    const painFreq: Record<string, number> = {};
    all.forEach(r => {
      r.painPoints.forEach(p => {
        const k = p.trim();
        if (k) painFreq[k.toLowerCase()] = (painFreq[k.toLowerCase()] || 0) + 1;
      });
    });
    const topPains = Object.entries(painFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    return {
      total: all.length,
      busType: countField("busType"),
      demographic: countField("demographic"),
      seatType: countField("seatType"),
      sleepComfort: countField("sleepComfort"),
      topPains,
    };
  })();

  async function handleAdminLogin() {
    setAdminLoading(true);
    setAdminError("");
    try {
      const result = await adminLogin(adminEmail, adminPassword);
      setAdminToken(result.token);
      setAdminPassword("");
      navigate("admin-dashboard", "/admin/dashboard");
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleAdminLogout() {
    const token = getAdminToken();
    if (token) {
      try {
        await adminLogout(token);
      } catch {
        // Local cleanup still happens below.
      }
    }
    clearAdminToken();
    navigate("admin-login", "/admin/login");
  }

  async function handleExportCSV() {
    const token = getAdminToken();
    if (!token) {
      navigate("admin-login", "/admin/login");
      return;
    }

    try {
      await downloadAdminCsv(token);
    } catch (error) {
      setAnalyticsError(error instanceof Error ? error.message : "Unable to export survey responses.");
    }
  }

  async function handleDeleteAllResponses() {
    const token = getAdminToken();
    if (!token) {
      navigate("admin-login", "/admin/login");
      return;
    }

    if (!window.confirm("Delete all survey responses? This cannot be undone.")) {
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError("");

    try {
      await deleteAllSurveyResponses(token);
      const refreshed = await fetchAdminAnalytics(token);
      setAnalytics(refreshed);
    } catch (error) {
      setAnalyticsError(error instanceof Error ? error.message : "Unable to delete survey responses.");
    } finally {
      setAnalyticsLoading(false);
    }
  }

  if (view === "home") {
    return <HomePage onStart={startSurvey} />;
  }
  if (view === "thankyou") {
    return <ThankYouPage onStart={startSurvey} />;
  }
  if (view === "admin-login") {
    return (
      <AdminLoginPage
        email={adminEmail}
        password={adminPassword}
        error={adminError}
        loading={adminLoading}
        onEmailChange={setAdminEmail}
        onPasswordChange={setAdminPassword}
        onSubmit={handleAdminLogin}
        onBack={() => navigate("home", "/")}
      />
    );
  }
  if (view === "admin-dashboard") {
    return (
      <Dashboard
        analytics={analytics}
        loading={analyticsLoading}
        error={analyticsError}
        onBack={() => navigate("home", "/")}
        onExport={handleExportCSV}
        onDeleteAll={handleDeleteAllResponses}
        onLogout={handleAdminLogout}
      />
    );
  }

  return (
    <SurveyPage
      step={step}
      current={current}
      errors={errors}
      submitting={submitting}
      submitError={submitError}
      onNext={handleNext}
      onPrev={handlePrev}
      onChange={updateField}
    />
  );
}
