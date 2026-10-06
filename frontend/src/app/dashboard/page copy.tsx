"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Scheme = {
  name: string;
  source: string;
  url: string;
  note?: string;
  eligibility: string[];
  documents: string[];
};

type AnalysisResult = {
  message: string;
  category: string;
  situation: string;
  potential_assistance: string[];
  schemes: Scheme[];
  documents?: string[];
  eligibility?: string[];
  official_source: string;
  status: string;
};

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
  onerror:
    | ((event: { error: string }) => void)
    | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function DashboardPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  // LOGIN PROTECTION
  useEffect(() => {
    const token = localStorage.getItem("civora_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  // VOICE INPUT
  const startVoiceInput = () => {
    setError("");

    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      (
        window as typeof window & {
          SpeechRecognition?: new () => SpeechRecognitionLike;
          webkitSpeechRecognition?: new () => SpeechRecognitionLike;
        }
      ).SpeechRecognition ||
      (
        window as typeof window & {
          SpeechRecognition?: new () => SpeechRecognitionLike;
          webkitSpeechRecognition?: new () => SpeechRecognitionLike;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setSituation(transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access."
        );
      } else {
        setError(
          "Voice input could not be completed. Please try again."
        );
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      setError(
        "Unable to start voice input. Please try again."
      );
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setListening(false);
  };

  // ANALYZE SITUATION
  const analyzeSituation = async () => {
    if (!situation.trim()) {
      setError("Please describe your situation first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/assistance/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            situation: situation.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Something went wrong."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to CIVORA AI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    stopVoiceInput();
    localStorage.removeItem("civora_token");
    router.replace("/login");
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">
            CIVORA AI
          </div>

          <p className="mt-3 text-slate-400">
            Checking secure access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-[#020617]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold tracking-wide text-cyan-400">
              CIVORA AI
            </h1>

            <p className="text-sm text-slate-400">
              Citizen Assistance Intelligence
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-red-400 hover:text-red-400"
          >
            Logout
          </button>

        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* WELCOME */}
        <div className="mb-8">

          <h2 className="text-4xl font-bold">
            Welcome to{" "}
            <span className="text-cyan-400">
              CIVORA AI
            </span>
          </h2>

          <p className="mt-3 max-w-3xl text-lg text-slate-400">
            Tell us about your situation. CIVORA AI will
            help identify government assistance and services
            that may be relevant to you.
          </p>

        </div>

        {/* INPUT CARD */}
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl">

          <label className="mb-3 block text-lg font-semibold">
            Describe your situation in English.
          </label>

          <textarea
            value={situation}
            onChange={(e) =>
              setSituation(e.target.value)
            }
            placeholder="Example: I am a student from a low income family and I need financial assistance for education."
            className="min-h-[160px] w-full resize-none rounded-xl border border-slate-700 bg-[#020617] p-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />

          {/* BUTTONS */}
          <div className="mt-5 flex flex-wrap gap-3">

            <button
              onClick={analyzeSituation}
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Analyzing..."
                : "Find Government Assistance"}
            </button>

            <button
              type="button"
              onClick={
                listening
                  ? stopVoiceInput
                  : startVoiceInput
              }
              className={`rounded-xl border px-6 py-3 font-semibold transition ${
                listening
                  ? "border-red-400 text-red-400 hover:bg-red-400/10"
                  : "border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-400"
              }`}
            >
              {listening
                ? "🛑 Stop Listening"
                : "🎙️ Voice Input"}
            </button>

          </div>

          {/* VOICE STATUS */}
          {listening && (
            <div className="mt-5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-cyan-300">
              🎙️ Listening... Please speak in English.
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

        </div>

        {/* RESULT */}
        {result && (
          <div className="mt-8 space-y-6">

            {/* SUCCESS */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">

              <p className="font-semibold text-emerald-300">
                {result.message}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Analysis status: {result.status}
              </p>

            </div>

            {/* CATEGORY */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">

              <p className="text-sm uppercase tracking-wider text-slate-500">
                Assistance Category
              </p>

              <h3 className="mt-2 text-3xl font-bold text-cyan-400">
                {result.category}
              </h3>

              <p className="mt-4 text-slate-300">
                <span className="font-semibold text-white">
                  Your situation:
                </span>{" "}
                {result.situation}
              </p>

            </div>

            {/* POTENTIAL ASSISTANCE */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">

              <h3 className="text-2xl font-bold">
                Potential Government Assistance
              </h3>

              <div className="mt-5 grid gap-3 md:grid-cols-3">

                {result.potential_assistance.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-700 bg-[#020617] p-4 text-slate-200"
                    >
                      <span className="mr-2 text-cyan-400">
                        ✓
                      </span>

                      {item}
                    </div>
                  )
                )}

              </div>

            </div>

            {/* MATCHED SCHEMES */}
            {result.schemes &&
              result.schemes.length > 0 && (

                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">

                  <div className="flex items-center gap-4">

                    <div className="text-4xl">
                      🏛️
                    </div>

                    <div>

                      <h3 className="text-2xl font-bold">
                        Potentially Relevant Government
                        Schemes
                      </h3>

                      <p className="mt-1 text-slate-400">
                        These schemes may be relevant based
                        on your situation.
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 space-y-6">

                    {result.schemes.map(
                      (scheme, index) => (

                        <div
                          key={index}
                          className="rounded-2xl border border-slate-700 bg-[#020617] p-6"
                        >

                          {/* SCHEME NAME */}
                          <h4 className="text-2xl font-bold text-white">
                            {scheme.name}
                          </h4>

                          {/* SOURCE */}
                          <p className="mt-3 text-slate-400">
                            Source:{" "}
                            <span className="text-slate-200">
                              {scheme.source}
                            </span>
                          </p>

                          {/* DESCRIPTION */}
                          {scheme.note && (
                            <p className="mt-4 leading-7 text-slate-300">
                              {scheme.note}
                            </p>
                          )}

                          {/* ELIGIBILITY */}
                          {scheme.eligibility &&
                            scheme.eligibility.length > 0 && (

                              <div className="mt-6 rounded-xl border border-slate-700 bg-[#0f172a] p-5">

                                <h5 className="text-lg font-bold text-cyan-400">
                                  Eligibility
                                </h5>

                                <ul className="mt-4 space-y-3">

                                  {scheme.eligibility.map(
                                    (item, eligibilityIndex) => (

                                      <li
                                        key={eligibilityIndex}
                                        className="flex items-start gap-3 text-slate-300"
                                      >

                                        <span className="mt-1 text-emerald-400">
                                          ✓
                                        </span>

                                        <span>
                                          {item}
                                        </span>

                                      </li>

                                    )
                                  )}

                                </ul>

                              </div>

                            )}

                          {/* DOCUMENTS */}
                          {scheme.documents &&
                            scheme.documents.length > 0 && (

                              <div className="mt-5 rounded-xl border border-slate-700 bg-[#0f172a] p-5">

                                <h5 className="text-lg font-bold text-cyan-400">
                                  Documents You May Need
                                </h5>

                                <ul className="mt-4 space-y-3">

                                  {scheme.documents.map(
                                    (document, documentIndex) => (

                                      <li
                                        key={documentIndex}
                                        className="flex items-start gap-3 text-slate-300"
                                      >

                                        <span className="mt-1 text-cyan-400">
                                          •
                                        </span>

                                        <span>
                                          {document}
                                        </span>

                                      </li>

                                    )
                                  )}

                                </ul>

                              </div>

                            )}

                          {/* OFFICIAL LINK */}
                          <a
                            href={scheme.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-block rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
                          >
                            View Official Scheme →
                          </a>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* OFFICIAL SOURCE */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">

              <h3 className="text-2xl font-bold">
                Official Government Source
              </h3>

              <p className="mt-3 text-slate-400">
                Government information should be verified
                through the official portal.
              </p>

              <a
                href={result.official_source}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block break-all text-cyan-400 underline hover:text-cyan-300"
              >
                {result.official_source}
              </a>

            </div>

            {/* VERIFICATION WARNING */}
            <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/5 p-6">

              <p className="font-semibold text-yellow-300">
                Important: This is a potentially relevant
                assistance result.
              </p>

              <p className="mt-2 text-yellow-100/80">
                Final eligibility must be verified with the
                appropriate official government department
                or portal.
              </p>

            </div>

            {/* SCHEME DISCOVERY */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">

              <div className="text-4xl">
                🔎
              </div>

              <h3 className="mt-4 text-2xl font-bold">
                Scheme Discovery
              </h3>

              <p className="mt-2 text-slate-400">
                Find potentially relevant government schemes
                and services.
              </p>

            </div>

          </div>
        )}

      </section>

    </main>
  );
}