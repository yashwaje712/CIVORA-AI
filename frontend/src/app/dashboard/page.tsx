/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Profile = {
  age?: number | null;
  state?: string | null;
  occupation?: string | null;
  annual_income?: number | null;
  category?: string | null;
  gender?: string | null;
  citizen_status?: string | null;
};

type ProfileIndicator = {
  label: string;
  status: string;
};

type Scheme = {
  name: string;
  source?: string;
  url?: string;
  note?: string;
  eligibility?: string[];
  documents?: string[];
  match_score?: number;
  match_strength?: {
    level: string;
    description: string;
  };
  matched_needs?: string[];
  matched_keywords?: string[];
  why_relevant?: string;
};

type AnalysisResult = {
  message?: string;
  category?: string;
  situation?: string;
  detected_needs?: string[];
  detected_categories?: string[];
  situation_reasons?: {
    need: string;
    category: string;
    reason: string;
  }[];
  potential_assistance?: string[];
  schemes?: Scheme[];
  documents?: string[];
  eligibility?: string[];
  profile_used?: Profile | null;
  profile_indicators?: ProfileIndicator[];
  official_source?: string;
  next_best_action?: {
    status?: string;
    active?: boolean;
    title?: string;
    description?: string;
    steps?: string[];
    action?: string;
    action_type?: string;
    target?: string;
    scheme?: {
      name?: string;
      url?: string;
      matched_needs?: string[];
    } | null;
  };
  status?: string;
};

const API_BASE_URL = "http://127.0.0.1:8000";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 12% -5%, rgba(37,99,235,.26), transparent 26%), radial-gradient(circle at 92% 8%, rgba(34,211,238,.17), transparent 24%), radial-gradient(circle at 50% 105%, rgba(124,58,237,.12), transparent 30%), #030914",
  color: "#f8fafc",
  padding: "22px 18px 70px",
  position: "relative",
  overflow: "hidden",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1240px",
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

const panelStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(10,24,44,.92), rgba(5,15,29,.94))",
  border: "1px solid rgba(148,163,184,.13)",
  borderRadius: "24px",
  padding: "26px",
  boxShadow: "0 24px 70px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.025)",
  backdropFilter: "blur(18px)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 15px",
  borderRadius: "14px",
  border: "1px solid rgba(148,163,184,.16)",
  background: "rgba(4,13,26,.88)",
  color: "#f8fafc",
  fontSize: "14px",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.025)",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(103,232,249,.34)",
  borderRadius: "14px",
  padding: "13px 19px",
  background: "linear-gradient(135deg,#2563eb 0%,#0891b2 52%,#06b6d4 100%)",
  color: "#fff",
  fontWeight: 850,
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(8,145,178,.22)",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,.17)",
  borderRadius: "14px",
  padding: "13px 17px",
  background: "rgba(9,23,41,.82)",
  color: "#e2e8f0",
  fontWeight: 750,
  cursor: "pointer",
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>({
    age: null,
    state: "",
    occupation: "",
    annual_income: null,
    category: "",
    gender: "",
    citizen_status: "",
  });

  const [situation, setSituation] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiPulse, setAiPulse] = useState(false);
  const [liveActivityIndex, setLiveActivityIndex] = useState(0);
  const [voiceLanguage, setVoiceLanguage] = useState("en-IN");
  const recognitionRef = useRef<any>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [readinessResult, setReadinessResult] = useState<{
    ready: string[];
    missing: string[];
    total: number;
  } | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  };

  const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAiPulse((current) => !current);
    }, 1400);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveActivityIndex((current) => (current + 1) % 8);
    }, 2300);

    return () => window.clearInterval(timer);
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        setLoadingProfile(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to load citizen profile.");
      }

      const data = await response.json();

      if (data.profile) {
        setProfile({
          age: data.profile.age ?? null,
          state: data.profile.state ?? "",
          occupation: data.profile.occupation ?? "",
          annual_income: data.profile.annual_income ?? null,
          category: data.profile.category ?? "",
          gender: data.profile.gender ?? "",
          citizen_status: data.profile.citizen_status ?? "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = getToken();

      if (!token) {
        setError("Please login before saving your profile.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          age:
            profile.age === null ||
            profile.age === undefined
              ? null
              : Number(profile.age),
          state: profile.state || null,
          occupation: profile.occupation || null,
          annual_income:
            profile.annual_income === null ||
            profile.annual_income === undefined
              ? null
              : Number(profile.annual_income),
          category: profile.category || null,
          gender: profile.gender || null,
          citizen_status: profile.citizen_status || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Unable to save profile.");
      }

      setSuccessMessage("Citizen profile saved successfully.");
    } catch (err: any) {
      setError(err?.message || "Something went wrong while saving your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = voiceLanguage;

    recognition.onstart = () => {
      setError("");
      setSuccessMessage("Listening... Speak your situation now.");
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }

      if (transcript.trim()) {
        setSituation(transcript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setListening(false);

      if (event?.error === "not-allowed" || event?.error === "permission-denied") {
        setError("Microphone permission was blocked. Allow microphone access in your browser and try again.");
      } else if (event?.error === "no-speech") {
        setError("No speech was detected. Please click Voice Input and speak again.");
      } else {
        setError("Voice input could not start. Please try again.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      setSuccessMessage("");
    };

    recognition.start();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const analyzeSituation = async () => {
    setAnalyzing(true);
    setError("");
    setSuccessMessage("");
    setAnalysisResult(null);
    setSelectedDocuments([]);
    setReadinessResult(null);

    try {
      const token = getToken();

      if (!token) {
        setError("Please login before using CIVORA AI.");
        return;
      }

      if (!situation.trim()) {
        setError("Please describe your situation first.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/assistance/analyze`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          situation: situation.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Unable to analyze your situation."
        );
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err?.message || "Something went wrong during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const checkDocumentReadiness = () => {
    const documents = analysisResult?.documents || [];

    if (!documents.length) {
      setError("No document checklist is available for this assistance result.");
      return;
    }

    const ready = documents.filter((document) =>
      selectedDocuments.includes(document)
    );
    const missing = documents.filter(
      (document) => !selectedDocuments.includes(document)
    );

    setError("");
    setReadinessResult({
      ready,
      missing,
      total: documents.length,
    });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("civora_token");
    window.location.href = "/";
  };

  const profileFields = [
    profile.age,
    profile.state,
    profile.occupation,
    profile.annual_income,
    profile.category,
    profile.gender,
    profile.citizen_status,
  ];

  const completedProfileFields = profileFields.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  ).length;

  const profileCompletion = Math.round(
    (completedProfileFields / profileFields.length) * 100
  );

  const documents = analysisResult?.documents || [];

  const jumpTo = (id: string) => {
    if (typeof document === "undefined") return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const readinessPercentage = useMemo(() => {
    if (!readinessResult || readinessResult.total === 0) return 0;
    return Math.round(
      (readinessResult.ready.length / readinessResult.total) * 100
    );
  }, [readinessResult]);

  const proactiveItems = useMemo(() => {
    const items: {
      icon: string;
      label: string;
      title: string;
      description: string;
      action: string;
      target: string;
      tone: string;
    }[] = [];

    const occupation = (profile.occupation || "").toLowerCase();
    const state = profile.state || "your state";
    const needs = analysisResult?.detected_needs || [];

    if (occupation.includes("student") || needs.includes("education")) {
      items.push({
        icon: "🎓",
        label: "EDUCATION SIGNAL",
        title: "Education assistance may be relevant",
        description: `Your profile indicates student/education needs. CIVORA can check matching assistance and scholarship pathways for ${state}.`,
        action: "Explore assistance",
        target: "assistance-finder",
        tone: "rgba(59,130,246,.14)",
      });
    }

    if (needs.includes("financial difficulty") || needs.includes("financial_difficulty") || (profile.annual_income ?? 0) > 0) {
      items.push({
        icon: "💠",
        label: "SUPPORT SIGNAL",
        title: "Financial support pathways can be checked",
        description: "Income and situation information can help CIVORA surface assistance categories that may need scheme-specific verification.",
        action: "Check support",
        target: "assistance-finder",
        tone: "rgba(6,182,212,.12)",
      });
    }

    if (documents.length > 0) {
      items.push({
        icon: "📄",
        label: "DOCUMENT SIGNAL",
        title: `${documents.length} document checks are available`,
        description: "Review the document checklist before moving toward an application or official portal.",
        action: "Review documents",
        target: "document-readiness",
        tone: "rgba(139,92,246,.13)",
      });
    } else {
      items.push({
        icon: "🧭",
        label: "NEXT BEST ACTION",
        title: "Describe your situation to activate intelligence",
        description: "A natural-language situation helps CIVORA identify needs, assistance categories and relevant official sources.",
        action: "Start with CIVORA",
        target: "assistance-finder",
        tone: "rgba(16,185,129,.12)",
      });
    }

    return items.slice(0, 3);
  }, [analysisResult, documents, profile]);

  const nextBestAction = useMemo(() => {
    const backendAction = analysisResult?.next_best_action;

    if (backendAction) {
      return {
        active: backendAction.active ?? backendAction.status === "ready",
        title: backendAction.title || "Next Best Action",
        description:
          backendAction.description ||
          "Review the next useful action identified by CIVORA.",
        steps:
          backendAction.steps?.length
            ? backendAction.steps
            : [
                "Review the matched assistance",
                "Prepare the required documents",
                "Verify the latest requirements on the official government portal",
              ],
        action: backendAction.action || "Open Official Portal",
        action_type: backendAction.action_type || "external_url",
        target: backendAction.target || "https://www.myscheme.gov.in/",
      };
    }

    return {
      active: false,
      title: "Start with your situation",
      description:
        "Describe what is happening in your life so CIVORA can identify your needs and relevant government assistance.",
      steps: [
        "Describe your situation",
        "Let CIVORA detect your needs",
        "Review relevant government assistance",
      ],
      action: "Start Intelligence",
      action_type: "analyze",
      target: "assistance-finder",
    };
  }, [analysisResult]);

  const liveActivities = [
    {
      icon: "◉",
      label: "PROFILE SCAN",
      text: `${completedProfileFields}/7 citizen signals currently available`,
    },
    {
      icon: "✦",
      label: "INTELLIGENCE",
      text: analysisResult
        ? `${analysisResult.detected_needs?.length || 0} citizen needs detected`
        : "Waiting for a situation to activate needs detection",
    },
    {
      icon: "⌁",
      label: "SCHEME MATCH",
      text: analysisResult
        ? `${analysisResult.schemes?.length || 0} potential government matches found`
        : "AI matching engine is ready",
    },
    {
      icon: "◇",
      label: "DOCUMENT CHECK",
      text: documents.length
        ? `${documents.length} document signals available for readiness`
        : "Document readiness will activate after analysis",
    },
    {
      icon: "✓",
      label: "VERIFICATION",
      text: "Official-source verification workflow is standing by",
    },
    {
      icon: "↗",
      label: "NEXT ACTION",
      text: proactiveItems.length
        ? `${proactiveItems.length} action signals prepared for you`
        : "Preparing the next useful action",
    },
    {
      icon: "◌",
      label: "CIVORA CORE",
      text: "Continuously organizing your citizen assistance journey",
    },
    {
      icon: "⚡",
      label: "LIVE STATUS",
      text: "CIVORA intelligence is active on this dashboard",
    },
  ];

  const activeLiveActivity = liveActivities[liveActivityIndex];

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "18px",
            marginBottom: "20px",
            padding: "10px 4px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(145deg,#2563eb,#06b6d4)",
                boxShadow: "0 10px 35px rgba(6,182,212,.22)",
                fontWeight: 950,
                fontSize: "21px",
                border: "1px solid rgba(165,243,252,.30)",
              }}
            >
              C
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "27px", letterSpacing: "-.8px", fontWeight: 950 }}>
                  CIVORA AI
                </h1>
                <span style={{ padding: "5px 8px", borderRadius: "999px", background: "rgba(34,211,238,.09)", border: "1px solid rgba(34,211,238,.20)", color: "#67e8f9", fontSize: "9px", fontWeight: 900, letterSpacing: "1px" }}>
                  CIVIC INTELLIGENCE
                </span>
              </div>
              <p style={{ margin: "5px 0 0", color: "#7f8ea3", fontSize: "12px", letterSpacing: ".2px" }}>
                Government Help Before the Citizen Asks
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 11px", borderRadius: "12px", background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.14)", color: "#86efac", fontSize: "11px", fontWeight: 800 }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 14px #4ade80" }} />
              SYSTEM ONLINE
            </div>
            <button type="button" onClick={logout} style={secondaryButtonStyle}>
              Sign out ↗
            </button>
          </div>
        </header>

        <section
          style={{
            ...panelStyle,
            padding: "34px",
            marginBottom: "20px",
            background: "radial-gradient(circle at 82% 20%, rgba(34,211,238,.12), transparent 25%), radial-gradient(circle at 68% 90%, rgba(99,102,241,.13), transparent 28%), linear-gradient(135deg,rgba(11,34,68,.98),rgba(5,18,35,.98))",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", right: "-90px", top: "-90px", width: "300px", height: "300px", borderRadius: "50%", border: "1px solid rgba(103,232,249,.10)", boxShadow: "0 0 0 28px rgba(103,232,249,.025), 0 0 0 56px rgba(103,232,249,.018)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "26px", alignItems: "stretch", position: "relative" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "999px", background: "rgba(34,211,238,.08)", border: "1px solid rgba(34,211,238,.18)", color: "#67e8f9", fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px", textTransform: "uppercase" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22d3ee", boxShadow: "0 0 12px #22d3ee" }} />
                Citizen Intelligence Dashboard
              </div>
              <h2 style={{ fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.03, margin: "18px 0 12px", letterSpacing: "-1.8px", maxWidth: "760px" }}>
                Government help,
                <span style={{ display: "block", background: "linear-gradient(90deg,#fff,#67e8f9,#93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>before you ask.</span>
              </h2>
              <p style={{ margin: 0, color: "#b7c4d6", lineHeight: 1.75, fontSize: "14px", maxWidth: "700px" }}>
                CIVORA turns a citizen's real-life situation into structured assistance intelligence — needs, potential schemes, eligibility signals, documents and official verification — in one focused workspace.
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "22px" }}>
                <span style={{ padding: "8px 11px", borderRadius: "10px", background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", color: "#cbd5e1", fontSize: "11px", fontWeight: 750 }}>01 · Understand</span>
                <span style={{ padding: "8px 11px", borderRadius: "10px", background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", color: "#cbd5e1", fontSize: "11px", fontWeight: 750 }}>02 · Match</span>
                <span style={{ padding: "8px 11px", borderRadius: "10px", background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", color: "#cbd5e1", fontSize: "11px", fontWeight: 750 }}>03 · Verify</span>
              </div>
            </div>

            <div style={{ borderRadius: "20px", padding: "20px", background: "rgba(2,10,21,.48)", border: "1px solid rgba(148,163,184,.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.025)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ color: "#94a3b8", fontSize: "10px", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>Citizen Readiness</div>
                <div style={{ color: "#67e8f9", fontSize: "10px", fontWeight: 900 }}>LIVE</div>
              </div>
              <div style={{ width: "150px", height: "150px", margin: "6px auto 16px", borderRadius: "50%", display: "grid", placeItems: "center", background: `conic-gradient(#22d3ee ${profileCompletion * 3.6}deg, rgba(148,163,184,.10) 0deg)`, boxShadow: "0 0 45px rgba(34,211,238,.08)" }}>
                <div style={{ width: "116px", height: "116px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#06111f", border: "1px solid rgba(103,232,249,.12)" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "30px", fontWeight: 950, letterSpacing: "-1px" }}>{profileCompletion}%</div>
                    <div style={{ color: "#718096", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".9px" }}>personalized</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
                <div style={{ padding: "11px", borderRadius: "12px", background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.06)" }}><div style={{ color: "#64748b", fontSize: "9px", textTransform: "uppercase", letterSpacing: ".8px" }}>Signals</div><div style={{ marginTop: "4px", fontSize: "16px", fontWeight: 900 }}>{completedProfileFields}/7</div></div>
                <div style={{ padding: "11px", borderRadius: "12px", background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.06)" }}><div style={{ color: "#64748b", fontSize: "9px", textTransform: "uppercase", letterSpacing: ".8px" }}>Mode</div><div style={{ marginTop: "4px", fontSize: "16px", fontWeight: 900 }}>AI</div></div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="CIVORA live intelligence"
          style={{
            ...panelStyle,
            marginBottom: "20px",
            padding: "0",
            overflow: "hidden",
            position: "relative",
            background:
              "linear-gradient(100deg,rgba(4,20,37,.98),rgba(5,28,48,.96),rgba(4,17,31,.98))",
            borderColor: "rgba(34,211,238,.15)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "-90px",
              top: "-110px",
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(34,211,238,.12),transparent 68%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: "15px",
              alignItems: "center",
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "13px",
                display: "grid",
                placeItems: "center",
                background: "rgba(34,211,238,.08)",
                border: "1px solid rgba(34,211,238,.20)",
                color: "#67e8f9",
                fontSize: "18px",
                boxShadow: aiPulse
                  ? "0 0 0 6px rgba(34,211,238,.035),0 0 24px rgba(34,211,238,.22)"
                  : "0 0 0 2px rgba(34,211,238,.05)",
                transition: "box-shadow .7s ease",
              }}
            >
              {activeLiveActivity.icon}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "#67e8f9",
                    fontSize: "9px",
                    fontWeight: 950,
                    letterSpacing: "1.2px",
                  }}
                >
                  CIVORA LIVE · {activeLiveActivity.label}
                </span>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#4ade80",
                    boxShadow: "0 0 12px #4ade80",
                  }}
                />
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "9px",
                    fontWeight: 800,
                  }}
                >
                  RUNNING
                </span>
              </div>

              <div
                key={liveActivityIndex}
                style={{
                  marginTop: "5px",
                  color: "#dbeafe",
                  fontSize: "12px",
                  fontWeight: 700,
                  lineHeight: 1.5,
                  opacity: aiPulse ? 1 : 0.72,
                  transform: aiPulse ? "translateX(0)" : "translateX(2px)",
                  transition: "opacity .5s ease, transform .5s ease",
                }}
              >
                {activeLiveActivity.text}
              </div>
            </div>

            <div
              style={{
                minWidth: "92px",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "8px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Intelligence
              </div>
              <div
                style={{
                  marginTop: "4px",
                  color: "#86efac",
                  fontSize: "11px",
                  fontWeight: 900,
                }}
              >
                ACTIVE
              </div>
            </div>
          </div>

          <div
            style={{
              height: "2px",
              background: "rgba(148,163,184,.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                transformOrigin: "left",
                background:
                  "linear-gradient(90deg,transparent,#2563eb,#22d3ee,transparent)",
                opacity: aiPulse ? 1 : 0.45,
                transform: aiPulse ? "scaleX(1)" : "scaleX(.65)",
                transition: "opacity .7s ease, transform .7s ease",
              }}
            />
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              icon: "✦",
              label: "START INTELLIGENCE",
              title: "Describe your situation",
              text: "Tell CIVORA what is happening in your life.",
              action: () => jumpTo("assistance-finder"),
            },
            {
              icon: "◈",
              label: "PERSONALIZE",
              title: "Complete your profile",
              text: `${completedProfileFields}/7 citizen signals available`,
              action: () => jumpTo("citizen-profile"),
            },
            {
              icon: "✓",
              label: "READINESS",
              title: "Prepare documents",
              text: analysisResult ? `${documents.length} document signals detected` : "Run an analysis first",
              action: () => jumpTo("analysis-results"),
            },
            {
              icon: "⌁",
              label: "VERIFICATION",
              title: "Verify official source",
              text: "Use official government portals for final confirmation.",
              action: () => jumpTo("verification"),
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              style={{
                textAlign: "left",
                padding: "17px",
                borderRadius: "18px",
                border: "1px solid rgba(103,232,249,.10)",
                background: "linear-gradient(145deg,rgba(9,27,48,.92),rgba(4,15,29,.94))",
                color: "#f8fafc",
                cursor: "pointer",
                boxShadow: "0 12px 30px rgba(0,0,0,.14)",
                transition: "transform .2s ease, border-color .2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "34px", height: "34px", borderRadius: "11px", display: "grid", placeItems: "center", background: "rgba(34,211,238,.09)", border: "1px solid rgba(34,211,238,.15)", color: "#67e8f9", fontWeight: 950 }}>{item.icon}</span>
                <span style={{ color: "#475569", fontSize: "9px", fontWeight: 900, letterSpacing: "1px" }}>OPEN →</span>
              </div>
              <div style={{ marginTop: "13px", color: "#67e8f9", fontSize: "9px", fontWeight: 900, letterSpacing: "1px" }}>{item.label}</div>
              <div style={{ marginTop: "5px", fontSize: "14px", fontWeight: 900 }}>{item.title}</div>
              <div style={{ marginTop: "6px", color: "#718096", fontSize: "11px", lineHeight: 1.5 }}>{item.text}</div>
            </button>
          ))}
        </section>

        <section
          style={{
            ...panelStyle,
            marginBottom: "20px",
            padding: "16px 18px",
            background: "linear-gradient(90deg,rgba(6,22,40,.96),rgba(7,28,48,.96))",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "10px" }}>
            {[
              ["UNDERSTAND", situation ? "Situation captured" : "Waiting for citizen input"],
              ["PERSONALIZE", `${profileCompletion}% profile coverage`],
              ["MATCH", analysisResult ? `${analysisResult.schemes?.length || 0} potential matches` : "AI matching ready"],
              ["PREPARE", readinessResult ? `${readinessPercentage}% document readiness` : "Checklist after analysis"],
              ["VERIFY", "Official-source workflow"],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.055)" }}>
                <div style={{ color: "#475569", fontSize: "8px", fontWeight: 900, letterSpacing: "1px" }}>{label}</div>
                <div style={{ marginTop: "5px", color: "#cbd5e1", fontSize: "11px", fontWeight: 750 }}>{value}</div>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div
            style={{
              ...panelStyle,
              marginBottom: "18px",
              padding: "14px 16px",
              borderColor: "rgba(248,113,113,.35)",
              background: "rgba(127,29,29,.22)",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              ...panelStyle,
              marginBottom: "18px",
              padding: "14px 16px",
              borderColor: "rgba(74,222,128,.3)",
              background: "rgba(20,83,45,.22)",
              color: "#bbf7d0",
            }}
          >
            {successMessage}
          </div>
        )}

        <section id="citizen-profile" style={{ ...panelStyle, marginBottom: "20px", scrollMarginTop: "24px" }}>
          <SectionTitle
            eyebrow="01 • Citizen Profile"
            title="My Citizen Profile"
            description="Keep your basic information updated so future assistance analysis can be personalized."
          />

          {loadingProfile ? (
            <div style={{ color: "#94a3b8", padding: "20px 0" }}>
              Loading your profile...
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
                  gap: "16px",
                }}
              >
                <ProfileInput
                  label="Age"
                  type="number"
                  value={profile.age ?? ""}
                  onChange={(value) =>
                    setProfile({
                      ...profile,
                      age: value === "" ? null : Number(value),
                    })
                  }
                />

                <ProfileInput
                  label="State"
                  value={profile.state ?? ""}
                  onChange={(value) =>
                    setProfile({ ...profile, state: value })
                  }
                />

                <ProfileInput
                  label="Occupation"
                  value={profile.occupation ?? ""}
                  onChange={(value) =>
                    setProfile({ ...profile, occupation: value })
                  }
                />

                <ProfileInput
                  label="Annual Income (₹)"
                  type="number"
                  value={profile.annual_income ?? ""}
                  onChange={(value) =>
                    setProfile({
                      ...profile,
                      annual_income: value === "" ? null : Number(value),
                    })
                  }
                />

                <SelectField
                  label="Category"
                  value={profile.category ?? ""}
                  options={[
                    "SC",
                    "ST",
                    "OBC",
                    "EWS",
                    "DNT",
                    "General",
                    "Other",
                  ]}
                  onChange={(value) =>
                    setProfile({ ...profile, category: value })
                  }
                />

                <SelectField
                  label="Gender"
                  value={profile.gender ?? ""}
                  options={[
                    "Male",
                    "Female",
                    "Other",
                    "Prefer not to say",
                  ]}
                  onChange={(value) =>
                    setProfile({ ...profile, gender: value })
                  }
                />

                <ProfileInput
                  label="Citizen / Special Status"
                  value={profile.citizen_status ?? ""}
                  onChange={(value) =>
                    setProfile({
                      ...profile,
                      citizen_status: value,
                    })
                  }
                />
              </div>

              <div style={{ marginTop: "18px" }}>
                <button
                  type="button"
                  onClick={() => void saveProfile()}
                  disabled={savingProfile}
                  style={{
                    ...primaryButtonStyle,
                    opacity: savingProfile ? 0.65 : 1,
                  }}
                >
                  {savingProfile ? "Saving..." : "Save Citizen Profile"}
                </button>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  padding: "15px",
                  borderRadius: "13px",
                  background: "rgba(37,99,235,.08)",
                  border: "1px solid rgba(59,130,246,.16)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "9px",
                  }}
                >
                  <span style={{ fontWeight: 800 }}>Personalization coverage</span>
                  <span style={{ color: "#67e8f9", fontWeight: 900 }}>
                    {profileCompletion}%
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    borderRadius: "999px",
                    background: "rgba(148,163,184,.13)",
                  }}
                >
                  <div
                    style={{
                      width: `${profileCompletion}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg,#2563eb,#22d3ee)",
                    }}
                  />
                </div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    lineHeight: 1.5,
                    marginBottom: 0,
                  }}
                >
                  This is an information-completeness indicator, not an official
                  eligibility score.
                </p>
              </div>
            </>
          )}
        </section>


        <section id="proactive-intelligence" style={{ ...panelStyle, marginBottom: "20px", scrollMarginTop: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: "360px", height: "360px", borderRadius: "50%", right: "-180px", top: "-180px", background: "radial-gradient(circle,rgba(34,211,238,.13),transparent 68%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <SectionTitle
              eyebrow="01 • Proactive Intelligence"
              title="Today, CIVORA is already thinking about you."
              description="You do not need to know the scheme name. CIVORA starts from your profile and situation, then suggests the next useful action."
            />

            <div
              style={{
                marginBottom: "14px",
                padding: "11px 14px",
                borderRadius: "15px",
                background: "linear-gradient(90deg,rgba(6,182,212,.09),rgba(37,99,235,.07),rgba(16,185,129,.06))",
                border: "1px solid rgba(103,232,249,.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "999px",
                    background: "#22d3ee",
                    boxShadow: aiPulse ? "0 0 0 7px rgba(34,211,238,.04),0 0 22px rgba(34,211,238,.9)" : "0 0 0 3px rgba(34,211,238,.08),0 0 10px rgba(34,211,238,.45)",
                    transition: "box-shadow .6s ease",
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "#d7f9ff", fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px" }}>CIVORA INTELLIGENCE ACTIVE</span>
              </div>
              <div style={{ color: "#7f8ea3", fontSize: "10px", fontWeight: 700 }}>
                {analysisResult
                  ? `${analysisResult.profile_indicators?.length || completedProfileFields} profile signals analyzed · ${analysisResult.detected_needs?.length || 0} needs detected · ${proactiveItems.length} action signals`
                  : `${completedProfileFields} profile signals available · Awaiting situation analysis · ${proactiveItems.length} action signals`}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                gap: "12px",
              }}
            >
              {proactiveItems.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  style={{
                    position: "relative",
                    padding: "20px",
                    borderRadius: "20px",
                    background: `linear-gradient(145deg,${item.tone},rgba(7,18,33,.92))`,
                    border: index === 2 ? "1px solid rgba(34,211,238,.26)" : "1px solid rgba(148,163,184,.12)",
                    minHeight: "255px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    boxShadow: index === 2 && aiPulse ? "0 0 0 1px rgba(34,211,238,.05),0 18px 50px rgba(6,182,212,.13)" : "0 14px 35px rgba(0,0,0,.12)",
                    transform: index === 2 && aiPulse ? "translateY(-2px)" : "translateY(0)",
                    transition: "transform .6s ease, box-shadow .6s ease",
                  }}
                >
                  {index === 2 && (
                    <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", right: "-85px", top: "-85px", background: "radial-gradient(circle,rgba(34,211,238,.18),transparent 68%)", pointerEvents: "none" }} />
                  )}
                  <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "46px", height: "46px", display: "grid", placeItems: "center", borderRadius: "14px", background: "rgba(2,10,21,.5)", border: "1px solid rgba(255,255,255,.09)", fontSize: "21px" }}>{item.icon}</div>
                      <span style={{ color: "#67e8f9", fontSize: "9px", fontWeight: 900, letterSpacing: "1px" }}>{item.label}</span>
                    </div>
                    <h3 style={{ margin: "20px 0 9px", fontSize: "17px", lineHeight: 1.3 }}>{item.title}</h3>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", lineHeight: 1.7 }}>{item.description}</p>
                    {index === 2 && (
                      <div style={{ marginTop: "13px", color: "#67e8f9", fontSize: "10px", fontWeight: 900, letterSpacing: ".7px" }}>AI PRIORITY · NEXT ACTION</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => jumpTo(item.target)}
                    style={{ ...secondaryButtonStyle, marginTop: "17px", padding: "10px 13px", fontSize: "11px", alignSelf: "flex-start", position: "relative" }}
                  >
                    {item.action} →
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "20px",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg,rgba(37,99,235,.14),rgba(6,182,212,.08))",
                border: "1px solid rgba(34,211,238,.20)",
                boxShadow: "0 14px 40px rgba(0,0,0,.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#67e8f9",
                      fontSize: "10px",
                      fontWeight: 900,
                      letterSpacing: "1.4px",
                      marginBottom: "6px",
                    }}
                  >
                    AI PRIORITY · NEXT BEST ACTION
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: 950,
                      color: "#f8fafc",
                    }}
                  >
                    {nextBestAction.title}
                  </h3>
                </div>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: nextBestAction.active
                      ? "rgba(16,185,129,.12)"
                      : "rgba(148,163,184,.10)",
                    border: nextBestAction.active
                      ? "1px solid rgba(16,185,129,.24)"
                      : "1px solid rgba(148,163,184,.16)",
                    color: nextBestAction.active ? "#6ee7b7" : "#94a3b8",
                    fontSize: "9px",
                    fontWeight: 900,
                    letterSpacing: "1px",
                  }}
                >
                  {nextBestAction.active ? "ACTION READY" : "WAITING FOR INPUT"}
                </div>
              </div>

              <p
                style={{
                  margin: "0 0 16px",
                  color: "#aab7c8",
                  fontSize: "13px",
                  lineHeight: 1.65,
                  maxWidth: "820px",
                }}
              >
                {nextBestAction.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {nextBestAction.steps.map((step, index) => (
                  <div
                    key={step}
                    style={{
                      padding: "13px",
                      borderRadius: "13px",
                      background: "rgba(15,23,42,.42)",
                      border: "1px solid rgba(148,163,184,.10)",
                    }}
                  >
                    <div
                      style={{
                        color: "#67e8f9",
                        fontSize: "10px",
                        fontWeight: 900,
                        letterSpacing: "1px",
                        marginBottom: "6px",
                      }}
                    >
                      STEP {index + 1}
                    </div>
                    <div
                      style={{
                        color: "#e2e8f0",
                        fontSize: "12px",
                        lineHeight: 1.5,
                        fontWeight: 750,
                      }}
                    >
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (nextBestAction.active && nextBestAction.target.startsWith("http")) {
                    window.open(nextBestAction.target, "_blank", "noopener,noreferrer");
                    return;
                  }

                  jumpTo(nextBestAction.target);
                }}
                style={{
                  ...primaryButtonStyle,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {nextBestAction.action} ↗
              </button>
            </div>

            <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "13px", background: "rgba(2,10,21,.38)", border: "1px solid rgba(103,232,249,.09)", color: "#7f8ea3", fontSize: "11px", lineHeight: 1.6 }}>
              <strong style={{ color: "#cbd5e1" }}>CIVORA principle:</strong> these are assistance signals, not official eligibility decisions. Always verify scheme-specific eligibility on the official government source before applying.
            </div>
          </div>
        </section>

        <section id="assistance-finder" style={{ ...panelStyle, marginBottom: "20px", scrollMarginTop: "24px" }}>
          <SectionTitle
            eyebrow="02 • AI Assistance Finder"
            title="What do you need help with?"
            description="Explain your situation naturally. CIVORA AI will convert it into structured assistance intelligence."
          />

          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Example: I am a student from Maharashtra and I need financial support for my education."
            rows={7}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: 1.7,
              minHeight: "150px",
              borderColor: "rgba(34,211,238,.16)",
              background: "linear-gradient(145deg,rgba(3,13,27,.92),rgba(5,20,37,.86))",
            }}
          />

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "14px" }}>
            <label style={{ color: "#7f8ea3", fontSize: "11px", fontWeight: 800, letterSpacing: ".3px" }}>Voice language</label>
            <select value={voiceLanguage} onChange={(e) => setVoiceLanguage(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "160px", padding: "9px 11px", fontSize: "12px" }}>
              <option value="en-IN">English / Hinglish</option>
              <option value="mr-IN">मराठी</option>
              <option value="hi-IN">हिन्दी</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => void analyzeSituation()}
              disabled={analyzing}
              style={{
                ...primaryButtonStyle,
                opacity: analyzing ? 0.65 : 1,
              }}
            >
              {analyzing ? "Analyzing..." : "Find Government Assistance"}
            </button>

            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={analyzing}
              style={{
                ...secondaryButtonStyle,
                borderColor: listening
                  ? "rgba(248,113,113,.45)"
                  : "rgba(148,163,184,.22)",
                background: listening ? "rgba(127,29,29,.25)" : "#0b1b2f",
              }}
            >
              {listening ? "🛑 Stop Listening" : "🎙️ Voice Input"}
            </button>
          </div>

          {listening && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.18)",
                color: "#fecaca",
                fontSize: "12px",
              }}
            >
              🎙️ Listening... Speak clearly. Your words will appear in the text box.
            </div>
          )}

          <p style={{ color: "#64748b", fontSize: "12px", marginBottom: 0 }}>
            Final eligibility and document requirements must always be verified
            through the official government source.
          </p>
        </section>

        {analysisResult && (
          <>
            <section style={{ ...panelStyle, marginBottom: "20px" }}>
              <SectionTitle
                eyebrow="03 • Analysis"
                title="Assistance Intelligence"
                description="A structured view of what CIVORA AI detected from your situation."
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                  gap: "12px",
                }}
              >
                <StatCard label="Status" value={analysisResult.status || "Completed"} />
                <StatCard
                  label="Category"
                  value={analysisResult.category || "Not specified"}
                />
                <StatCard
                  label="Needs"
                  value={String(analysisResult.detected_needs?.length || 0)}
                />
                <StatCard
                  label="Potential Assistance"
                  value={String(analysisResult.potential_assistance?.length || 0)}
                />
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "13px",
                  background: "#08192c",
                  border: "1px solid rgba(148,163,184,.13)",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                  Your situation
                </div>
                <div style={{ marginTop: "7px", lineHeight: 1.65 }}>
                  {analysisResult.situation || situation}
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <h3 style={{ marginBottom: "10px" }}>Needs Detected</h3>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(analysisResult.detected_needs || []).map((need) => (
                    <Tag key={need}>
                      {need.replaceAll("_", " ")}
                    </Tag>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <h3 style={{ marginBottom: "10px" }}>
                  Potential Government Assistance
                </h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  {(analysisResult.potential_assistance || []).map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "11px 13px",
                        borderRadius: "10px",
                        background: "rgba(34,197,94,.07)",
                        border: "1px solid rgba(34,197,94,.13)",
                        color: "#bbf7d0",
                      }}
                    >
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section style={{ ...panelStyle, marginBottom: "20px" }}>
              <SectionTitle
                eyebrow="04 • Profile Intelligence"
                title="Profile-Based Eligibility Intelligence"
                description="These indicators show which profile signals are available to the assistance analysis."
              />

              {(analysisResult.profile_indicators || []).length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                    gap: "10px",
                  }}
                >
                  {(analysisResult.profile_indicators || []).map(
                    (indicator, index) => (
                      <div
                        key={`${indicator.label}-${index}`}
                        style={{
                          padding: "13px 14px",
                          borderRadius: "11px",
                          background: "rgba(34,197,94,.06)",
                          border: "1px solid rgba(34,197,94,.13)",
                          color: "#bbf7d0",
                        }}
                      >
                        <strong>✓ {indicator.label}</strong>
                        {indicator.status && (
                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            {indicator.status}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div style={{ color: "#94a3b8" }}>
                  No citizen profile indicators are currently available.
                </div>
              )}

              <div
                style={{
                  marginTop: "16px",
                  padding: "13px 15px",
                  borderRadius: "11px",
                  background: "rgba(245,158,11,.07)",
                  border: "1px solid rgba(245,158,11,.16)",
                  color: "#fde68a",
                  fontSize: "13px",
                  lineHeight: 1.55,
                }}
              >
                <strong>Important:</strong> These indicators do not mean that
                you are officially eligible. Final eligibility must be verified
                using the official scheme rules.
              </div>
            </section>

            <section style={{ ...panelStyle, marginBottom: "20px" }}>
              <SectionTitle
                eyebrow="05 • Scheme Discovery"
                title="Potentially Relevant Government Schemes"
                description="These are potential matches based on the situation analysis. They are not official eligibility decisions."
              />

              {(analysisResult.schemes || []).length === 0 ? (
                <div style={{ color: "#94a3b8" }}>
                  No potentially relevant schemes were found for this situation.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {(analysisResult.schemes || []).map((scheme, index) => (
                    <SchemeCard
                      key={`${scheme.name}-${index}`}
                      scheme={scheme}
                    />
                  ))}
                </div>
              )}
            </section>

            <section id="document-readiness" style={{ ...panelStyle, marginBottom: "20px", scrollMarginTop: "24px" }}>
              <SectionTitle
                eyebrow="06 • Document Readiness"
                title="Are you ready to apply?"
                description="Select the documents you already have. CIVORA AI will show the checklist status."
              />

              {documents.length === 0 ? (
                <div style={{ color: "#94a3b8" }}>
                  No document checklist is available for this result.
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gap: "9px" }}>
                    {documents.map((document) => {
                      const checked = selectedDocuments.includes(document);

                      return (
                        <label
                          key={document}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "11px",
                            padding: "13px",
                            borderRadius: "11px",
                            background: checked
                              ? "rgba(34,197,94,.07)"
                              : "#08192c",
                            border: checked
                              ? "1px solid rgba(34,197,94,.2)"
                              : "1px solid rgba(148,163,184,.13)",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedDocuments((current) =>
                                e.target.checked
                                  ? [...current, document]
                                  : current.filter((item) => item !== document)
                              );
                              setReadinessResult(null);
                            }}
                          />
                          <span>{document}</span>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={checkDocumentReadiness}
                    style={{
                      ...secondaryButtonStyle,
                      marginTop: "16px",
                    }}
                  >
                    Check My Readiness
                  </button>

                  {readinessResult && (
                    <div
                      style={{
                        marginTop: "18px",
                        padding: "17px",
                        borderRadius: "13px",
                        background: "#08192c",
                        border: "1px solid rgba(148,163,184,.15)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong>Document Readiness Result</strong>
                        <span
                          style={{
                            color:
                              readinessPercentage === 100
                                ? "#4ade80"
                                : "#67e8f9",
                            fontWeight: 900,
                          }}
                        >
                          Ready: {readinessResult.ready.length} /{" "}
                          {readinessResult.total}
                        </span>
                      </div>

                      <div
                        style={{
                          height: "8px",
                          marginTop: "10px",
                          background: "rgba(148,163,184,.12)",
                          borderRadius: "999px",
                        }}
                      >
                        <div
                          style={{
                            width: `${readinessPercentage}%`,
                            height: "100%",
                            borderRadius: "999px",
                            background:
                              readinessPercentage === 100
                                ? "#22c55e"
                                : "linear-gradient(90deg,#2563eb,#22d3ee)",
                          }}
                        />
                      </div>

                      {readinessResult.ready.length > 0 && (
                        <div style={{ marginTop: "14px" }}>
                          <div style={{ color: "#86efac", fontWeight: 800 }}>
                            Ready
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gap: "6px",
                              marginTop: "7px",
                            }}
                          >
                            {readinessResult.ready.map((item) => (
                              <div key={item} style={{ color: "#bbf7d0" }}>
                                ✓ {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {readinessResult.missing.length > 0 ? (
                        <div style={{ marginTop: "14px" }}>
                          <div style={{ color: "#fbbf24", fontWeight: 800 }}>
                            Missing / Not marked
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gap: "6px",
                              marginTop: "7px",
                            }}
                          >
                            {readinessResult.missing.map((item) => (
                              <div key={item} style={{ color: "#fde68a" }}>
                                • {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: "14px",
                            color: "#86efac",
                            fontWeight: 800,
                          }}
                        >
                          All listed documents are marked as ready.
                        </div>
                      )}
                    </div>
                  )}

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginBottom: 0,
                      marginTop: "12px",
                    }}
                  >
                    This is only a preparation checklist. Verify the final
                    document requirements on the official scheme portal.
                  </p>
                </>
              )}
            </section>

            <section style={{ ...panelStyle, marginBottom: "20px" }}>
              <SectionTitle
                eyebrow="07 • Official Verification"
                title="Official Government Source"
                description="Use the official government source to verify eligibility, documents, deadlines and application steps."
              />

              <a
                href={
                  analysisResult.official_source ||
                  "https://www.myscheme.gov.in/"
                }
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#67e8f9",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Open Official Government Source →
              </a>

              <div
                style={{
                  marginTop: "9px",
                  color: "#64748b",
                  fontSize: "12px",
                  wordBreak: "break-all",
                }}
              >
                {analysisResult.official_source ||
                  "https://www.myscheme.gov.in/"}
              </div>
            </section>
          </>
        )}

        <footer
          style={{
            marginTop: "24px",
            padding: "18px",
            borderRadius: "14px",
            border: "1px solid rgba(148,163,184,.12)",
            color: "#64748b",
            fontSize: "12px",
            lineHeight: 1.6,
          }}
        >
          CIVORA AI provides assistance discovery and preparation support.
          It does not make official eligibility decisions. Always verify final
          eligibility, benefits and document requirements with the relevant
          government department or official scheme portal.
        </footer>
        <div style={{ marginTop: "26px", padding: "16px 4px 0", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", color: "#526174", fontSize: "10px", letterSpacing: ".3px" }}>
          <span>CIVORA AI · Citizen Assistance Intelligence</span>
          <span>Verify final eligibility on the official government source.</span>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          color: "#67e8f9",
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <h2 style={{ margin: "6px 0 6px", fontSize: "21px" }}>{title}</h2>
      <p
        style={{
          color: "#94a3b8",
          margin: 0,
          fontSize: "13px",
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "15px",
        borderRadius: "12px",
        background: "#08192c",
        border: "1px solid rgba(148,163,184,.13)",
      }}
    >
      <div style={{ color: "#64748b", fontSize: "11px" }}>{label}</div>
      <div style={{ marginTop: "5px", fontWeight: 900, fontSize: "16px" }}>
        {value}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "7px 10px",
        borderRadius: "999px",
        background: "rgba(37,99,235,.12)",
        border: "1px solid rgba(59,130,246,.18)",
        color: "#93c5fd",
        fontSize: "12px",
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {children}
    </span>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "7px",
          color: "#cbd5e1",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "7px",
          color: "#cbd5e1",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function SchemeCard({ scheme }: { scheme: Scheme }) {
  return (
    <article
      style={{
        padding: "20px",
        borderRadius: "15px",
        background: "#08192c",
        border: "1px solid rgba(148,163,184,.14)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "19px", fontWeight: 900 }}>
            {scheme.name}
          </div>
          <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
            Source: {scheme.source || "Government source"}
          </div>
        </div>

        {scheme.match_strength && (
          <div
            style={{
              padding: "7px 10px",
              borderRadius: "999px",
              background: "rgba(34,211,238,.08)",
              border: "1px solid rgba(34,211,238,.17)",
              color: "#67e8f9",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            {scheme.match_strength.level}
          </div>
        )}
      </div>

      <div style={{ marginTop: "16px" }}>
        <div style={{ color: "#94a3b8", fontSize: "11px" }}>Why relevant</div>
        <p style={{ color: "#cbd5e1", lineHeight: 1.6, marginBottom: 0 }}>
          {scheme.why_relevant ||
            scheme.note ||
            "This scheme may be relevant based on your situation."}
        </p>
      </div>

      {scheme.match_strength?.description && (
        <div
          style={{
            marginTop: "14px",
            color: "#94a3b8",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {scheme.match_strength.description}
        </div>
      )}

      {scheme.matched_needs && scheme.matched_needs.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ fontWeight: 800, fontSize: "13px" }}>Matched Needs</div>
          <div
            style={{
              display: "flex",
              gap: "7px",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            {scheme.matched_needs.map((need) => (
              <Tag key={need}>{need.replaceAll("_", " ")}</Tag>
            ))}
          </div>
        </div>
      )}

      {scheme.eligibility && scheme.eligibility.length > 0 && (
        <div style={{ marginTop: "18px" }}>
          <div style={{ fontWeight: 800, fontSize: "13px", marginBottom: "8px" }}>
            Eligibility Information
          </div>
          <div style={{ display: "grid", gap: "6px" }}>
            {scheme.eligibility.map((item, index) => (
              <div
                key={`${item}-${index}`}
                style={{ color: "#cbd5e1", fontSize: "13px" }}
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {scheme.documents && scheme.documents.length > 0 && (
        <div style={{ marginTop: "18px" }}>
          <div style={{ fontWeight: 800, fontSize: "13px", marginBottom: "8px" }}>
            Documents You May Need
          </div>
          <div style={{ display: "grid", gap: "6px" }}>
            {scheme.documents.map((item, index) => (
              <div
                key={`${item}-${index}`}
                style={{ color: "#cbd5e1", fontSize: "13px" }}
              >
                • {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {scheme.url && (
        <div
          style={{
            marginTop: "18px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(148,163,184,.12)",
          }}
        >
          <div style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "6px" }}>
            Official Government Portal
          </div>
          <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.5 }}>
            Verify eligibility, documents and application details on the official
            portal.
          </p>
          <a
            href={scheme.url}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#67e8f9",
              fontWeight: 800,
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Visit Official Portal →
          </a>
        </div>
      )}
    </article>
  );
}
