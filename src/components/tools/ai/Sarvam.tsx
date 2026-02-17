import { useState, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "chat" | "stt" | "tts" | "translate" | "vision" | "doc";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
    thinking?: string;
}

interface STTResult {
    transcript: string;
    language_code: string;
    language_probability?: number;
}

interface TTSResult {
    audios: string[];
}

interface TranslateResult {
    translated_text: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LANGUAGES = [
    { code: "auto", label: "Auto Detect" },
    { code: "hi-IN", label: "Hindi" },
    { code: "bn-IN", label: "Bengali" },
    { code: "ta-IN", label: "Tamil" },
    { code: "te-IN", label: "Telugu" },
    { code: "gu-IN", label: "Gujarati" },
    { code: "kn-IN", label: "Kannada" },
    { code: "ml-IN", label: "Malayalam" },
    { code: "mr-IN", label: "Marathi" },
    { code: "pa-IN", label: "Punjabi" },
    { code: "od-IN", label: "Odia" },
    { code: "en-IN", label: "English" },
    { code: "as-IN", label: "Assamese" },
    { code: "ur-IN", label: "Urdu" },
    { code: "ne-IN", label: "Nepali" },
    { code: "kok-IN", label: "Konkani" },
    { code: "ks-IN", label: "Kashmiri" },
    { code: "sd-IN", label: "Sindhi" },
    { code: "sa-IN", label: "Sanskrit" },
    { code: "sat-IN", label: "Santali" },
    { code: "mni-IN", label: "Manipuri" },
    { code: "brx-IN", label: "Bodo" },
    { code: "mai-IN", label: "Maithili" },
    { code: "doi-IN", label: "Dogri" },
];

const TTS_SPEAKERS = [
    "Shubh", "Aditya", "Ritu", "Priya", "Neha", "Rahul", "Pooja", "Rohan",
    "Simran", "Kavya", "Amit", "Dev", "Ishita", "Shreya", "Ratan", "Varun",
    "Manan", "Sumit", "Roopa", "Kabir", "Aayan", "Ashutosh", "Advait",
    "Amelia", "Sophia", "Anand", "Tanya", "Tarun", "Sunny", "Mani",
    "Gokul", "Vijay", "Shruti", "Suhani", "Mohit", "Kavitha", "Rehan",
    "Soham", "Rupali",
];

const STT_MODES = [
    { value: "transcribe", label: "Transcribe", desc: "Original language with formatting" },
    { value: "translate", label: "Translate", desc: "Convert to English" },
    { value: "verbatim", label: "Verbatim", desc: "Word-for-word, no normalization" },
    { value: "translit", label: "Translit", desc: "Romanized Latin script" },
    { value: "codemix", label: "Codemix", desc: "Mixed English & native script" },
];

const TRANSLATE_MODES = [
    { value: "formal", label: "Formal" },
    { value: "modern-colloquial", label: "Modern Colloquial" },
    { value: "classic-colloquial", label: "Classic Colloquial" },
    { value: "code-mixed", label: "Code Mixed" },
];

// ─── Stable option arrays (computed once at module level, never inline in render) ─
const MAYURA_LANG_CODES = new Set([
    "hi-IN", "bn-IN", "ta-IN", "te-IN", "gu-IN", "kn-IN", "ml-IN", "mr-IN", "pa-IN", "od-IN", "en-IN"
]);
const TTS_LANG_CODES = new Set(["hi-IN", "bn-IN", "ta-IN", "te-IN", "gu-IN", "kn-IN", "ml-IN", "mr-IN", "pa-IN", "od-IN", "en-IN"]);

const LANG_OPTIONS_WITH_AUTO = LANGUAGES.map(l => ({ value: l.code, label: l.label }));
const LANG_OPTIONS_NO_AUTO = LANGUAGES.filter(l => l.code !== "auto").map(l => ({ value: l.code, label: l.label }));
const MAYURA_SRC_OPTIONS = [
    { value: "auto", label: "Auto Detect" },
    ...LANGUAGES.filter(l => l.code !== "auto" && MAYURA_LANG_CODES.has(l.code)).map(l => ({ value: l.code, label: l.label })),
];
const MAYURA_TGT_OPTIONS = LANGUAGES.filter(l => l.code !== "auto" && MAYURA_LANG_CODES.has(l.code)).map(l => ({ value: l.code, label: l.label }));
const TTS_LANG_OPTIONS = LANGUAGES.filter(l => l.code !== "auto" && TTS_LANG_CODES.has(l.code)).map(l => ({ value: l.code, label: l.label }));
const TTS_SPEAKER_OPTIONS = TTS_SPEAKERS.map(s => ({ value: s, label: s }));
const STT_MODE_OPTIONS = STT_MODES.map(m => ({ value: m.value, label: m.label }));

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
    Key: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
    ),
    Chat: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    Mic: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    ),
    Speaker: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    Translate: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
    ),
    Vision: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Send: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    ),
    Eye: () => (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ),
    EyeOff: () => (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    ),
    Upload: () => (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    ),
    Copy: () => (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    Loader: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
        </svg>
    ),
    Brain: () => (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
};

// ─── API Helpers ──────────────────────────────────────────────────────────────
async function callChat(apiKey: string, messages: Message[], wikiGrounding = false, reasoningEffort = "", model = "sarvam-m") {
    const body: Record<string, unknown> = {
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: reasoningEffort ? 0.5 : 0.2,
        max_tokens: 2048,
    };
    if (wikiGrounding) body.wiki_grounding = true;
    if (reasoningEffort) body.reasoning_effort = reasoningEffort;

    const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
    return res.json();
}

async function callSTT(apiKey: string, file: File, mode: string, langCode: string, model = "saaras:v3") {
    const form = new FormData();
    form.append("file", file);
    form.append("model", model);
    // saarika:v2.5 doesn't support mode param, only saaras:v3 does
    if (model === "saaras:v3") form.append("mode", mode);
    if (langCode && langCode !== "auto") form.append("language_code", langCode);

    const res = await fetch("https://api.sarvam.ai/speech-to-text", {
        method: "POST",
        headers: { "api-subscription-key": apiKey },
        body: form,
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<STTResult>;
}

async function callTTS(apiKey: string, text: string, langCode: string, speaker: string, model = "bulbul:v3", sampleRate = 22050) {
    const res = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
            "api-subscription-key": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text,
            target_language_code: langCode,
            model,
            speaker: speaker.toLowerCase(),
            speech_sample_rate: sampleRate,
        }),
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<TTSResult>;
}

async function callTranslate(apiKey: string, input: string, src: string, tgt: string, mode: string, model: string) {
    const body: Record<string, unknown> = {
        input,
        source_language_code: src,
        target_language_code: tgt,
        model,
    };
    if (model !== "sarvam-translate:v1") body.mode = mode;

    const res = await fetch("https://api.sarvam.ai/translate", {
        method: "POST",
        headers: {
            "api-subscription-key": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<TranslateResult>;
}

// ─── Shared Sub-components ────────────────────────────────────────────────────
function Select({ value, onChange, options, label, disabled }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    label?: string;
    disabled?: boolean;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                style={{
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    padding: "8px 12px",
                    fontSize: 13,
                    cursor: "pointer",
                    outline: "none",
                    width: "100%",
                }}
            >
                {options.map((o, i) => <option key={`${o.value}-${i}`} value={o.value} style={{ background: "#1e1b4b" }}>{o.label}</option>)}
            </select>
        </div>
    );
}

function ErrorBanner({ msg }: { msg: string }) {
    return (
        <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            color: "#fca5a5",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
        }}>
            <span style={{ fontSize: 16 }}>⚠</span> {msg}
        </div>
    );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────
function ChatTab({ apiKey }: { apiKey: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [chatModel, setChatModel] = useState("sarvam-m");
    const [wikiGrounding, setWikiGrounding] = useState(false);
    const [reasoningEffort, setReasoningEffort] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [showSystem, setShowSystem] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const send = async () => {
        if (!input.trim() || loading) return;
        setError("");
        const userMsg: Message = { role: "user", content: input.trim() };
        const allMsgs: Message[] = [];
        if (systemPrompt.trim()) allMsgs.push({ role: "system", content: systemPrompt.trim() });
        allMsgs.push(...messages, userMsg);
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        try {
            const data = await callChat(apiKey, allMsgs, wikiGrounding, reasoningEffort, chatModel);
            const content = data.choices?.[0]?.message?.content || "No response";
            setMessages(prev => [...prev, { role: "assistant", content }]);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
            {/* Model selector row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Select
                    label="Model"
                    value={chatModel}
                    onChange={v => { setChatModel(v); setMessages([]); }}
                    options={[
                        { value: "sarvam-m", label: "Sarvam-M (24B)" },
                        { value: "sarvam-m:thinking", label: "Sarvam-M Thinking" },
                    ]}
                />
                <Select
                    label="Reasoning"
                    value={reasoningEffort}
                    onChange={setReasoningEffort}
                    options={[
                        { value: "", label: "No Reasoning" },
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                    ]}
                />
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#c4b5fd" }}>
                    <input type="checkbox" checked={wikiGrounding} onChange={e => setWikiGrounding(e.target.checked)}
                        style={{ accentColor: "#8b5cf6" }} />
                    Wiki Grounding
                </label>
                <button
                    onClick={() => setShowSystem(s => !s)}
                    style={{
                        background: showSystem ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.1)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: 8,
                        color: "#c4b5fd",
                        padding: "7px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                    }}
                >
                    {showSystem ? "Hide" : "System"} Prompt
                </button>
                {messages.length > 0 && (
                    <button
                        onClick={() => setMessages([])}
                        style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: 8,
                            color: "#fca5a5",
                            padding: "7px 12px",
                            fontSize: 12,
                            cursor: "pointer",
                        }}
                    >
                        Clear
                    </button>
                )}
                {/* Model badge */}
                <span style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: "#8b5cf6",
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: 20,
                    padding: "3px 9px",
                }}>
                    {chatModel}
                </span>
            </div>

            {showSystem && (
                <textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    placeholder="Enter system prompt..."
                    rows={2}
                    style={{
                        background: "rgba(139,92,246,0.06)",
                        border: "1px solid rgba(139,92,246,0.25)",
                        borderRadius: 10,
                        color: "#e2e8f0",
                        padding: "10px 14px",
                        fontSize: 13,
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                    }}
                />
            )}

            {error && <ErrorBanner msg={error} />}

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                padding: "4px 2px",
                minHeight: 200,
                maxHeight: 380,
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#6d7a8f", marginTop: 60 }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🇮🇳</div>
                        <div style={{ fontSize: 14 }}>Start a conversation in any Indian language</div>
                        <div style={{ fontSize: 12, marginTop: 6, color: "#4a5568" }}>Supports Hindi, Tamil, Telugu, Bengali and 19 more</div>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} style={{
                        display: "flex",
                        justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    }}>
                        <div style={{
                            maxWidth: "80%",
                            padding: "12px 16px",
                            borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: m.role === "user"
                                ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                                : "rgba(30, 27, 75, 0.8)",
                            border: m.role === "user" ? "none" : "1px solid rgba(139,92,246,0.2)",
                            color: "#e9e5ff",
                            fontSize: 14,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                            boxShadow: m.role === "user" ? "0 4px 16px rgba(124,58,237,0.35)" : "none",
                        }}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8b5cf6", fontSize: 13 }}>
                        <Icons.Loader />
                        Sarvam-M is thinking...
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 8 }}>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Type in any language... (Enter to send)"
                    rows={2}
                    style={{
                        flex: 1,
                        background: "rgba(139,92,246,0.06)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: 12,
                        color: "#e2e8f0",
                        padding: "12px 16px",
                        fontSize: 14,
                        resize: "none",
                        outline: "none",
                        fontFamily: "inherit",
                    }}
                />
                <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    style={{
                        background: loading || !input.trim() ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                        border: "none",
                        borderRadius: 12,
                        color: loading || !input.trim() ? "#6d7a8f" : "white",
                        padding: "0 18px",
                        cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        boxShadow: loading || !input.trim() ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
                    }}
                >
                    {loading ? <Icons.Loader /> : <Icons.Send />}
                </button>
            </div>
        </div>
    );
}

// ─── STT Tab ──────────────────────────────────────────────────────────────────
function STTTab({ apiKey }: { apiKey: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [sttModel, setSttModel] = useState("saaras:v3");
    const [mode, setMode] = useState("transcribe");
    const [langCode, setLangCode] = useState("auto");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<STTResult | null>(null);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // saarika:v2.5 only supports transcribe mode
    const isSaarika = sttModel === "saarika:v2.5";

    const transcribe = async () => {
        if (!file) return;
        setLoading(true); setError(""); setResult(null);
        try {
            const data = await callSTT(apiKey, file, mode, langCode, sttModel);
            setResult(data);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const BTN_LABELS: Record<string, string> = {
        transcribe: "Transcribe Audio",
        translate: "Translate to English",
        verbatim: "Verbatim Transcribe",
        translit: "Transliterate Audio",
        codemix: "Codemix Transcribe",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Model selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select
                    label="Model"
                    value={sttModel}
                    onChange={v => { setSttModel(v); if (v === "saarika:v2.5") setMode("transcribe"); setResult(null); }}
                    options={[
                        { value: "saaras:v3", label: "Saaras v3 (Latest)" },
                        { value: "saarika:v2.5", label: "Saarika v2.5 (Legacy)" },
                    ]}
                />
                <Select
                    label="Language"
                    value={langCode}
                    onChange={setLangCode}
                    options={LANG_OPTIONS_WITH_AUTO}
                />
            </div>

            {/* Output Mode — disabled for saarika */}
            <Select
                label={isSaarika ? "Output Mode (Saaras v3 only)" : "Output Mode"}
                value={mode}
                onChange={setMode}
                disabled={isSaarika}
                options={STT_MODE_OPTIONS}
            />

            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                style={{
                    border: `2px dashed ${file ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.25)"}`,
                    borderRadius: 14,
                    padding: "32px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: file ? "rgba(139,92,246,0.08)" : "transparent",
                }}
            >
                <input ref={inputRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                <div style={{ color: file ? "#c4b5fd" : "#6d7a8f" }}>
                    <Icons.Upload />
                    <div style={{ marginTop: 10, fontSize: 14 }}>{file ? file.name : "Drop audio file here or click to upload"}</div>
                    <div style={{ fontSize: 12, color: "#4a5568", marginTop: 4 }}>WAV, MP3, OGG, FLAC supported</div>
                </div>
            </div>

            <div style={{ background: "rgba(139,92,246,0.06)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {isSaarika ? "Saarika v2.5 — Legacy" : "Mode Info"}
                    </span>
                    <span style={{ fontSize: 11, color: "#4a5568" }}>
                        {isSaarika ? "11 langs" : "23 langs"}
                    </span>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    {isSaarika
                        ? "Transcribes in the same language spoken. Good for telephony & code-mixed speech."
                        : STT_MODES.find(m => m.value === mode)?.desc}
                </div>
            </div>

            {error && <ErrorBanner msg={error} />}

            <button
                onClick={transcribe}
                disabled={!file || loading}
                style={{
                    background: !file || loading ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                    border: "none",
                    borderRadius: 12,
                    color: !file || loading ? "#6d7a8f" : "white",
                    padding: "13px",
                    cursor: !file || loading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: !file || loading ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
                }}
            >
                {loading ? (
                    <><Icons.Loader /> Processing...</>
                ) : (
                    <>
                        <Icons.Mic />
                        {isSaarika ? "Transcribe Audio" : (BTN_LABELS[mode] ?? "Process Audio")}
                    </>
                )}
            </button>

            {result && (
                <div style={{ background: "rgba(16,21,40,0.8)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 14, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Transcript</span>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            {result.language_code && (
                                <span style={{ fontSize: 12, color: "#c4b5fd", background: "rgba(139,92,246,0.15)", padding: "3px 8px", borderRadius: 20 }}>
                                    {result.language_code}
                                </span>
                            )}
                            {result.language_probability && (
                                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                                    {(result.language_probability * 100).toFixed(0)}% confidence
                                </span>
                            )}
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 15, color: "#e2e8f0", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.transcript}</p>
                </div>
            )}
        </div>
    );
}

// ─── TTS Tab ──────────────────────────────────────────────────────────────────
function TTSTab({ apiKey }: { apiKey: string }) {
    const [text, setText] = useState("");
    const [ttsModel, setTtsModel] = useState("bulbul:v3");
    const [langCode, setLangCode] = useState("hi-IN");
    const [speaker, setSpeaker] = useState("Shubh");
    const [sampleRate, setSampleRate] = useState(22050);
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState("");

    // bulbul:v1 has fewer speakers
    const isV1 = ttsModel === "bulbul:v1";
    const speakerOpts = isV1
        ? [{ value: "meera", label: "Meera" }, { value: "pavithra", label: "Pavithra" }, { value: "maitreyi", label: "Maitreyi" },
        { value: "arvind", label: "Arvind" }, { value: "amol", label: "Amol" }, { value: "amartya", label: "Amartya" }]
        : TTS_SPEAKER_OPTIONS;

    // v3 REST supports up to 48kHz; v1/v2 cap at 22050
    const sampleRateOpts = ttsModel === "bulbul:v3"
        ? [
            { value: 8000, label: "8 kHz (Telephony)" },
            { value: 16000, label: "16 kHz (Good)" },
            { value: 22050, label: "22 kHz (High)" },
            { value: 24000, label: "24 kHz (Premium)" },
        ]
        : [
            { value: 8000, label: "8 kHz (Telephony)" },
            { value: 16000, label: "16 kHz (Good)" },
            { value: 22050, label: "22 kHz (High)" },
        ];

    const handleModelChange = (m: string) => {
        setTtsModel(m);
        setSpeaker("Shubh");
        // Cap sample rate if downgrading model
        if (m !== "bulbul:v3" && sampleRate > 22050) setSampleRate(22050);
        setAudioUrl(null);
    };

    const convert = async () => {
        if (!text.trim()) return;
        setLoading(true); setError(""); setAudioUrl(null);
        try {
            const data = await callTTS(apiKey, text, langCode, speaker, ttsModel, sampleRate);
            if (data.audios?.[0]) {
                const audioData = data.audios[0];
                const byteCharacters = atob(audioData);
                const byteNumbers = new Uint8Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
                const blob = new Blob([byteNumbers], { type: "audio/wav" });
                setAudioUrl(URL.createObjectURL(blob));
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Model + Language row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select
                    label="Model"
                    value={ttsModel}
                    onChange={handleModelChange}
                    options={[
                        { value: "bulbul:v3", label: "Bulbul v3 (Latest)" },
                        { value: "bulbul:v2", label: "Bulbul v2" },
                        { value: "bulbul:v1", label: "Bulbul v1" },
                    ]}
                />
                <Select
                    label="Language"
                    value={langCode}
                    onChange={setLangCode}
                    options={TTS_LANG_OPTIONS}
                />
            </div>

            {/* Speaker + Sample Rate row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select
                    label="Speaker Voice"
                    value={speaker}
                    onChange={setSpeaker}
                    options={speakerOpts}
                />
                <Select
                    label="Sample Rate"
                    value={String(sampleRate)}
                    onChange={v => setSampleRate(Number(v))}
                    options={sampleRateOpts.map(o => ({ value: String(o.value), label: o.label }))}
                />
            </div>

            {/* Model capability badge */}
            <div style={{
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.15)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "#94a3b8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <span>
                    {ttsModel === "bulbul:v3" && <><strong style={{ color: "#c4b5fd" }}>Bulbul v3</strong> — 30+ voices · 2500 chars · natural prosody</>}
                    {ttsModel === "bulbul:v2" && <><strong style={{ color: "#c4b5fd" }}>Bulbul v2</strong> — Stable · 2500 chars · all 11 languages</>}
                    {ttsModel === "bulbul:v1" && <><strong style={{ color: "#c4b5fd" }}>Bulbul v1</strong> — Legacy · 500 chars · 6 speakers</>}
                </span>
                <span style={{
                    fontSize: 11,
                    color: ttsModel === "bulbul:v3" ? "#86efac" : "#a78bfa",
                    background: ttsModel === "bulbul:v3" ? "rgba(134,239,172,0.1)" : "rgba(139,92,246,0.12)",
                    padding: "2px 8px",
                    borderRadius: 20,
                }}>
                    {ttsModel === "bulbul:v3" ? "Latest" : ttsModel === "bulbul:v2" ? "Stable" : "Legacy"}
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Text Input <span style={{ color: "#6d7a8f", textTransform: "none", fontWeight: 400 }}>
                        ({text.length}/{isV1 ? 500 : 2500})
                    </span>
                </label>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value.slice(0, isV1 ? 500 : 2500))}
                    placeholder="Enter text to convert to speech..."
                    rows={5}
                    style={{
                        background: "rgba(139,92,246,0.06)",
                        border: "1px solid rgba(139,92,246,0.25)",
                        borderRadius: 12,
                        color: "#e2e8f0",
                        padding: "14px 16px",
                        fontSize: 14,
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        lineHeight: 1.6,
                    }}
                />
            </div>

            {error && <ErrorBanner msg={error} />}

            <button
                onClick={convert}
                disabled={!text.trim() || loading}
                style={{
                    background: !text.trim() || loading ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                    border: "none",
                    borderRadius: 12,
                    color: !text.trim() || loading ? "#6d7a8f" : "white",
                    padding: "13px",
                    cursor: !text.trim() || loading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: !text.trim() || loading ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
                }}
            >
                {loading ? <><Icons.Loader /> Synthesizing...</> : <><Icons.Speaker /> Convert to Speech</>}
            </button>

            {audioUrl && (
                <div style={{ background: "rgba(16,21,40,0.8)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                        Audio Output — {speaker} · {ttsModel} · {sampleRate >= 1000 ? `${sampleRate / 1000} kHz` : `${sampleRate} Hz`}
                    </div>
                    <audio controls src={audioUrl} style={{ width: "100%", borderRadius: 8 }} />
                    <a href={audioUrl} download={`sarvam_tts_${ttsModel.replace(":", "_")}.wav`} style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 10,
                        color: "#c4b5fd",
                        fontSize: 13,
                        textDecoration: "none",
                    }}>
                        ↓ Download WAV
                    </a>
                </div>
            )}
        </div>
    );
}

// ─── Translate Tab ────────────────────────────────────────────────────────────
function TranslateTab({ apiKey }: { apiKey: string }) {
    const [input, setInput] = useState("");
    const [srcLang, setSrcLang] = useState("auto");
    const [tgtLang, setTgtLang] = useState("hi-IN");
    const [mode, setMode] = useState("formal");
    const [model, setModel] = useState("mayura:v1");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TranslateResult | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // Derive stable option arrays based on selected model
    const isMayura = model === "mayura:v1";
    const srcOptions = isMayura ? MAYURA_SRC_OPTIONS : LANG_OPTIONS_WITH_AUTO;
    const tgtOptions = isMayura ? MAYURA_TGT_OPTIONS : LANG_OPTIONS_NO_AUTO;

    const handleModelChange = (newModel: string) => {
        setModel(newModel);
        // Reset language selections to safe defaults when switching models
        setSrcLang("auto");
        setTgtLang("hi-IN");
        setResult(null);
        setError("");
    };

    const translate = async () => {
        if (!input.trim()) return;
        // Guard: target must never be "auto"
        if (tgtLang === "auto") {
            setError("Please select a specific target language (not Auto Detect).");
            return;
        }
        setLoading(true); setError(""); setResult(null);
        try {
            const data = await callTranslate(apiKey, input, srcLang, tgtLang, mode, model);
            setResult(data);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const copy = () => {
        if (result?.translated_text) {
            navigator.clipboard.writeText(result.translated_text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const swapLangs = () => {
        // Only swap if source is a real language (not auto), and target won't become "auto"
        if (srcLang !== "auto" && tgtLang !== "auto") {
            // Also verify the swapped values exist in both option lists
            const newSrc = tgtLang;
            const newTgt = srcLang;
            const srcValid = srcOptions.some(o => o.value === newSrc);
            const tgtValid = tgtOptions.some(o => o.value === newTgt);
            if (srcValid && tgtValid) {
                setSrcLang(newSrc);
                setTgtLang(newTgt);
            }
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Model & Mode */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select
                    label="Translation Model"
                    value={model}
                    onChange={handleModelChange}
                    options={[
                        { value: "mayura:v1", label: "Mayura v1 (11 langs)" },
                        { value: "sarvam-translate:v1", label: "Sarvam Translate (22 langs)" },
                    ]}
                />
                <Select
                    label="Style"
                    value={mode}
                    onChange={setMode}
                    disabled={model === "sarvam-translate:v1"}
                    options={TRANSLATE_MODES}
                />
            </div>

            {/* Language selectors with swap */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ flex: 1 }}>
                    <Select label="Source" value={srcLang} onChange={setSrcLang}
                        options={srcOptions} />
                </div>
                <button
                    onClick={swapLangs}
                    style={{
                        background: "rgba(139,92,246,0.15)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: 8,
                        color: "#c4b5fd",
                        padding: "8px 12px",
                        cursor: "pointer",
                        marginBottom: 1,
                    }}
                    title="Swap languages"
                >
                    ⇄
                </button>
                <div style={{ flex: 1 }}>
                    <Select label="Target" value={tgtLang} onChange={setTgtLang}
                        options={tgtOptions} />
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Input Text</label>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter text to translate..."
                    rows={4}
                    style={{
                        background: "rgba(139,92,246,0.06)",
                        border: "1px solid rgba(139,92,246,0.25)",
                        borderRadius: 12,
                        color: "#e2e8f0",
                        padding: "14px 16px",
                        fontSize: 14,
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                    }}
                />
            </div>

            {error && <ErrorBanner msg={error} />}

            <button
                onClick={translate}
                disabled={!input.trim() || loading}
                style={{
                    background: !input.trim() || loading ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                    border: "none",
                    borderRadius: 12,
                    color: !input.trim() || loading ? "#6d7a8f" : "white",
                    padding: "13px",
                    cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: !input.trim() || loading ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
                }}
            >
                {loading ? <><Icons.Loader /> Translating...</> : <><Icons.Translate /> Translate</>}
            </button>

            {result && (
                <div style={{ background: "rgba(16,21,40,0.8)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 14, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Translation</span>
                        <button onClick={copy} style={{
                            background: "rgba(139,92,246,0.15)",
                            border: "1px solid rgba(139,92,246,0.3)",
                            borderRadius: 6,
                            color: copied ? "#86efac" : "#c4b5fd",
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}>
                            <Icons.Copy /> {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                    <p style={{ margin: 0, fontSize: 15, color: "#e2e8f0", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                        {result.translated_text}
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Sarvam Vision / Document Intelligence Tab ────────────────────────────────
const VISION_LANGUAGES = [
    { value: "hi-IN", label: "Hindi" }, { value: "bn-IN", label: "Bengali" },
    { value: "ta-IN", label: "Tamil" }, { value: "te-IN", label: "Telugu" },
    { value: "mr-IN", label: "Marathi" }, { value: "gu-IN", label: "Gujarati" },
    { value: "kn-IN", label: "Kannada" }, { value: "ml-IN", label: "Malayalam" },
    { value: "pa-IN", label: "Punjabi" }, { value: "od-IN", label: "Odia" },
    { value: "as-IN", label: "Assamese" }, { value: "ur-IN", label: "Urdu" },
    { value: "sa-IN", label: "Sanskrit" }, { value: "ne-IN", label: "Nepali" },
    { value: "doi-IN", label: "Dogri" }, { value: "brx-IN", label: "Bodo" },
    { value: "kok-IN", label: "Konkani" }, { value: "mai-IN", label: "Maithili" },
    { value: "sd-IN", label: "Sindhi" }, { value: "ks-IN", label: "Kashmiri" },
    { value: "mni-IN", label: "Manipuri" }, { value: "sat-IN", label: "Santali" },
    { value: "en-IN", label: "English" },
];

function VisionTab({ apiKey }: { apiKey: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState("en-IN");
    const [outputFormat, setOutputFormat] = useState("md");
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [corsBlocked, setCorsBlocked] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const BASE = "https://api.sarvam.ai/document-intelligence";
    const H = { "api-subscription-key": apiKey };

    const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

    const isCorsError = (e: unknown) =>
        e instanceof TypeError && (e.message.includes("Failed to fetch") || e.message.includes("NetworkError") || e.message.includes("CORS"));

    const processDocument = async () => {
        if (!file) return;
        setLoading(true); setError(""); setCorsBlocked(false); setDownloadUrl(null); setJobId(null); stopPolling();
        let wasCorsBlocked = false;

        try {
            // ── Step 1: Create job ──────────────────────────────────────────────────
            setStatusMsg("Creating job…");
            let jobRes: Response;
            try {
                jobRes = await fetch(`${BASE}/jobs`, {
                    method: "POST",
                    headers: { ...H, "Content-Type": "application/json" },
                    body: JSON.stringify({ language, output_format: outputFormat }),
                });
            } catch (e) {
                if (isCorsError(e)) { wasCorsBlocked = true; setCorsBlocked(true); throw new Error("CORS"); }
                throw e;
            }
            if (!jobRes.ok) throw new Error(`Create job failed (${jobRes.status}): ${await jobRes.text()}`);
            const { job_id } = await jobRes.json();
            setJobId(job_id);

            // ── Step 2: Upload file ─────────────────────────────────────────────────
            setStatusMsg("Uploading file…");
            const form = new FormData();
            form.append("file", file);
            const uploadRes = await fetch(`${BASE}/jobs/${job_id}/files`, {
                method: "POST",
                headers: H,
                body: form,
            });
            if (!uploadRes.ok) throw new Error(`Upload failed (${uploadRes.status}): ${await uploadRes.text()}`);

            // ── Step 3: Start job ───────────────────────────────────────────────────
            setStatusMsg("Starting processing…");
            const startRes = await fetch(`${BASE}/jobs/${job_id}/start`, {
                method: "POST",
                headers: { ...H, "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            if (!startRes.ok) throw new Error(`Start failed (${startRes.status}): ${await startRes.text()}`);

            // ── Step 4: Poll every 4s ───────────────────────────────────────────────
            let elapsed = 0;
            await new Promise<void>((resolve, reject) => {
                pollRef.current = setInterval(async () => {
                    elapsed += 4;
                    setStatusMsg(`Processing… (${elapsed}s)`);
                    if (elapsed > 180) { stopPolling(); reject(new Error("Timed out after 3 minutes")); return; }
                    try {
                        const statusRes = await fetch(`${BASE}/jobs/${job_id}`, { headers: H });
                        if (!statusRes.ok) return; // transient, keep polling
                        const { job_state } = await statusRes.json();
                        if (job_state === "COMPLETED") {
                            stopPolling();
                            resolve();
                        } else if (job_state === "FAILED") {
                            stopPolling();
                            reject(new Error("Job processing failed on server"));
                        }
                    } catch { /* keep polling on network flicker */ }
                }, 4000);
            });

            // ── Step 5: Download output ZIP ─────────────────────────────────────────
            setStatusMsg("Downloading output…");
            const outputRes = await fetch(`${BASE}/jobs/${job_id}/output`, { headers: H });
            if (!outputRes.ok) throw new Error(`Output download failed (${outputRes.status})`);
            const blob = await outputRes.blob();
            setDownloadUrl(URL.createObjectURL(blob));
            setStatusMsg("");

        } catch (e: unknown) {
            stopPolling();
            if ((e as Error).message !== "CORS") {
                setError((e as Error).message ?? "Unknown error");
            }
        } finally {
            setLoading(false);
            if (!wasCorsBlocked) setStatusMsg("");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Header info */}
            <div style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(91,33,182,0.05))",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: 12, padding: "14px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
            }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>🔬</span>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#c4b5fd", marginBottom: 4 }}>
                        Sarvam Vision — Document Intelligence
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                        3B parameter VLM for high-accuracy OCR across 23 languages. Extracts text, tables, and structure
                        from PDFs and scanned images. Output delivered as a ZIP containing HTML or Markdown files.
                    </div>
                </div>
            </div>

            {/* CORS warning */}
            {corsBlocked && (
                <div style={{
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.35)",
                    borderRadius: 12, padding: "14px 16px",
                    fontSize: 13, color: "#fbbf24", lineHeight: 1.7,
                }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ CORS policy blocked this request</div>
                    <div style={{ color: "#94a3b8" }}>
                        The <code style={{ color: "#c4b5fd" }}>/document-intelligence</code> endpoint does not allow
                        direct browser requests. To use Sarvam Vision you need to call the API from a backend
                        (Node.js, Python, etc.) and proxy it to your frontend. The SDK call looks like:
                    </div>
                    <pre style={{
                        marginTop: 10, background: "rgba(0,0,0,0.4)", borderRadius: 8,
                        padding: "10px 14px", fontSize: 11, color: "#e2e8f0",
                        overflowX: "auto", whiteSpace: "pre",
                    }}>{`from sarvamai import SarvamAI
client = SarvamAI(api_subscription_key="YOUR_KEY")
job = client.document_intelligence.create_job(
    language="${language}", output_format="${outputFormat}"
)
job.upload_file("document.pdf")
job.start()
job.wait_until_complete()
job.download_output("./output.zip")`}</pre>
                </div>
            )}

            {/* Config row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select label="Document Language" value={language} onChange={setLanguage}
                    options={VISION_LANGUAGES} />
                <Select label="Output Format" value={outputFormat} onChange={setOutputFormat}
                    options={[
                        { value: "md", label: "Markdown (.md)" },
                        { value: "html", label: "HTML (.html)" },
                    ]} />
            </div>

            {/* File drop zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                style={{
                    border: `2px dashed ${file ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.25)"}`,
                    borderRadius: 14, padding: "32px 20px", textAlign: "center", cursor: "pointer",
                    background: file ? "rgba(139,92,246,0.08)" : "transparent",
                    transition: "all 0.2s",
                }}
            >
                <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.zip"
                    style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                <div style={{ color: file ? "#c4b5fd" : "#6d7a8f" }}>
                    <Icons.Upload />
                    <div style={{ marginTop: 10, fontSize: 14, fontWeight: file ? 600 : 400 }}>
                        {file ? file.name : "Drop document here or click to upload"}
                    </div>
                    <div style={{ fontSize: 12, color: "#4a5568", marginTop: 4 }}>
                        PDF · PNG · JPG · ZIP (flat archive of pages)
                    </div>
                </div>
            </div>

            {/* Status indicator */}
            {statusMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a78bfa", fontSize: 13 }}>
                    <Icons.Loader /> {statusMsg}
                </div>
            )}

            {error && <ErrorBanner msg={error} />}

            {/* Action button */}
            <button
                onClick={processDocument}
                disabled={!file || loading}
                style={{
                    background: !file || loading ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                    border: "none", borderRadius: 12,
                    color: !file || loading ? "#6d7a8f" : "white",
                    padding: "13px", cursor: !file || loading ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: !file || loading ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
                    transition: "all 0.2s",
                }}
            >
                {loading
                    ? <><Icons.Loader /> {statusMsg || "Processing…"}</>
                    : <><Icons.Vision /> Process with Sarvam Vision</>}
            </button>

            {/* Job ID badge */}
            {jobId && (
                <div style={{ fontSize: 11, color: "#6d7a8f" }}>
                    Job ID: <span style={{ color: "#8b5cf6", fontFamily: "monospace" }}>{jobId}</span>
                </div>
            )}

            {/* Download result */}
            {downloadUrl && (
                <div style={{
                    background: "rgba(134,239,172,0.06)",
                    border: "1px solid rgba(134,239,172,0.25)",
                    borderRadius: 14, padding: 18,
                }}>
                    <div style={{ fontSize: 12, color: "#86efac", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                        ✓ Processing Complete
                    </div>
                    <p style={{ margin: "0 0 14px", fontSize: 13, color: "#94a3b8" }}>
                        Your document has been processed. The ZIP contains one{" "}
                        <strong style={{ color: "#e2e8f0" }}>.{outputFormat}</strong> file per page with
                        extracted text, tables, and structure preserved.
                    </p>
                    <a
                        href={downloadUrl}
                        download={`sarvam_vision_${outputFormat}_output.zip`}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            color: "white",
                            background: "linear-gradient(135deg, #059669, #065f46)",
                            padding: "11px 20px", borderRadius: 10,
                            fontSize: 13, fontWeight: 700, textDecoration: "none",
                            boxShadow: "0 4px 14px rgba(5,150,105,0.35)",
                        }}
                    >
                        ↓ Download ZIP ({outputFormat.toUpperCase()} output)
                    </a>
                </div>
            )}
        </div>
    );
}

// ─── Text Tools Tab (Transliterate + Detect Language) ────────────────────────
function TextToolsTab({ apiKey }: { apiKey: string }) {
    const [tool, setTool] = useState<"translit" | "detect">("translit");

    // --- Transliteration state ---
    const [translitInput, setTranslitInput] = useState("");
    const [translitSrc, setTranslitSrc] = useState("hi-IN");
    const [translitTgt, setTranslitTgt] = useState("en-IN");
    const [translitNumerals, setTranslitNumerals] = useState("international");
    const [translitLoading, setTranslitLoading] = useState(false);
    const [translitResult, setTranslitResult] = useState<string | null>(null);
    const [translitError, setTranslitError] = useState("");
    const [translitCopied, setTranslitCopied] = useState(false);

    // --- Language Detection state ---
    const [detectInput, setDetectInput] = useState("");
    const [detectLoading, setDetectLoading] = useState(false);
    const [detectResult, setDetectResult] = useState<{ language_code: string; script_code: string; confidence_score: number; } | null>(null);
    const [detectError, setDetectError] = useState("");

    const runTranslit = async () => {
        if (!translitInput.trim()) return;
        setTranslitLoading(true); setTranslitError(""); setTranslitResult(null);
        try {
            const res = await fetch("https://api.sarvam.ai/transliterate", {
                method: "POST",
                headers: { "api-subscription-key": apiKey, "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: translitInput,
                    source_language_code: translitSrc,
                    target_language_code: translitTgt,
                    numerals_format: translitNumerals,
                }),
            });
            if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
            const data = await res.json();
            setTranslitResult(data.transliterated_text || data.output || JSON.stringify(data));
        } catch (e: unknown) {
            setTranslitError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setTranslitLoading(false);
        }
    };

    const runDetect = async () => {
        if (!detectInput.trim()) return;
        setDetectLoading(true); setDetectError(""); setDetectResult(null);
        try {
            const res = await fetch("https://api.sarvam.ai/text-lid", {
                method: "POST",
                headers: { "api-subscription-key": apiKey, "Content-Type": "application/json" },
                body: JSON.stringify({ input: detectInput }),
            });
            if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
            const data = await res.json();
            setDetectResult({
                language_code: data.language_code || data.detected_language || "unknown",
                script_code: data.script_code || "",
                confidence_score: data.confidence_score ?? data.confidence ?? 1,
            });
        } catch (e: unknown) {
            setDetectError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setDetectLoading(false);
        }
    };

    // Transliteration only works en-IN ↔ Indic (not Indic ↔ Indic)
    const TRANSLIT_LANGS = LANGUAGES.filter(l => l.code !== "auto").map(l => ({ value: l.code, label: l.label }));

    const LANG_NAMES: Record<string, string> = Object.fromEntries(
        LANGUAGES.map(l => [l.code, l.label])
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Tool Switcher */}
            <div style={{ display: "flex", gap: 8 }}>
                {([
                    { id: "translit", label: "Transliterate", icon: "🔤" },
                    { id: "detect", label: "Detect Language", icon: "🔍" },
                ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        style={{
                            flex: 1,
                            background: tool === t.id
                                ? "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(91,33,182,0.25))"
                                : "rgba(16,21,40,0.6)",
                            border: `1px solid ${tool === t.id ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.15)"}`,
                            borderRadius: 10,
                            color: tool === t.id ? "#e9e5ff" : "#6d7a8f",
                            padding: "10px 14px",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: tool === t.id ? 700 : 500,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                        }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Transliterate ── */}
            {tool === "translit" && (
                <>
                    <div style={{
                        background: "rgba(139,92,246,0.06)",
                        border: "1px solid rgba(139,92,246,0.15)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 12,
                        color: "#94a3b8",
                    }}>
                        Converts text between scripts while keeping the same pronunciation. E.g. <em style={{ color: "#c4b5fd" }}>नमस्ते</em> → <em style={{ color: "#c4b5fd" }}>namaste</em>. Works between English and any Indic script.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "flex-end" }}>
                        <Select label="Source Script" value={translitSrc} onChange={setTranslitSrc} options={TRANSLIT_LANGS} />
                        <div style={{ paddingBottom: 2, color: "#6d7a8f", fontSize: 18 }}>→</div>
                        <Select label="Target Script" value={translitTgt} onChange={setTranslitTgt} options={TRANSLIT_LANGS} />
                    </div>

                    <Select
                        label="Numeral Format"
                        value={translitNumerals}
                        onChange={setTranslitNumerals}
                        options={[
                            { value: "international", label: "International (0–9)" },
                            { value: "native", label: "Native script numerals" },
                        ]}
                    />

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Input Text</label>
                        <textarea
                            value={translitInput}
                            onChange={e => setTranslitInput(e.target.value)}
                            placeholder="Enter text to transliterate..."
                            rows={3}
                            style={{
                                background: "rgba(139,92,246,0.06)",
                                border: "1px solid rgba(139,92,246,0.25)",
                                borderRadius: 12,
                                color: "#e2e8f0",
                                padding: "12px 14px",
                                fontSize: 14,
                                resize: "vertical",
                                outline: "none",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>

                    {translitError && <ErrorBanner msg={translitError} />}

                    <button
                        onClick={runTranslit}
                        disabled={!translitInput.trim() || translitLoading}
                        style={{
                            background: !translitInput.trim() || translitLoading ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                            border: "none", borderRadius: 12,
                            color: !translitInput.trim() || translitLoading ? "#6d7a8f" : "white",
                            padding: "13px", cursor: !translitInput.trim() || translitLoading ? "not-allowed" : "pointer",
                            fontSize: 14, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            boxShadow: !translitInput.trim() || translitLoading ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
                        }}
                    >
                        {translitLoading ? <><Icons.Loader /> Transliterating...</> : <>🔤 Transliterate</>}
                    </button>

                    {translitResult && (
                        <div style={{ background: "rgba(16,21,40,0.8)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 14, padding: 18 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Result — {LANG_NAMES[translitSrc] || translitSrc} → {LANG_NAMES[translitTgt] || translitTgt}
                                </span>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(translitResult); setTranslitCopied(true); setTimeout(() => setTranslitCopied(false), 1500); }}
                                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 6, color: translitCopied ? "#86efac" : "#c4b5fd", padding: "4px 10px", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                                >
                                    <Icons.Copy /> {translitCopied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <p style={{ margin: 0, fontSize: 16, color: "#e2e8f0", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{translitResult}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── Detect Language ── */}
            {tool === "detect" && (
                <>
                    <div style={{
                        background: "rgba(139,92,246,0.06)",
                        border: "1px solid rgba(139,92,246,0.15)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 12,
                        color: "#94a3b8",
                    }}>
                        Automatically identifies the language and script of any text. Supports all 22 official Indian languages + English.
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Input Text</label>
                        <textarea
                            value={detectInput}
                            onChange={e => setDetectInput(e.target.value)}
                            placeholder="Paste text in any Indian language..."
                            rows={4}
                            style={{
                                background: "rgba(139,92,246,0.06)",
                                border: "1px solid rgba(139,92,246,0.25)",
                                borderRadius: 12,
                                color: "#e2e8f0",
                                padding: "12px 14px",
                                fontSize: 14,
                                resize: "vertical",
                                outline: "none",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>

                    {detectError && <ErrorBanner msg={detectError} />}

                    <button
                        onClick={runDetect}
                        disabled={!detectInput.trim() || detectLoading}
                        style={{
                            background: !detectInput.trim() || detectLoading ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                            border: "none", borderRadius: 12,
                            color: !detectInput.trim() || detectLoading ? "#6d7a8f" : "white",
                            padding: "13px", cursor: !detectInput.trim() || detectLoading ? "not-allowed" : "pointer",
                            fontSize: 14, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            boxShadow: !detectInput.trim() || detectLoading ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
                        }}
                    >
                        {detectLoading ? <><Icons.Loader /> Detecting...</> : <>🔍 Detect Language</>}
                    </button>

                    {detectResult && (
                        <div style={{ background: "rgba(16,21,40,0.8)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 14, padding: 20 }}>
                            <div style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                                Detection Result
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                {[
                                    { label: "Language", value: LANG_NAMES[detectResult.language_code] || detectResult.language_code },
                                    { label: "BCP-47 Code", value: detectResult.language_code },
                                    { label: "Confidence", value: `${(detectResult.confidence_score * 100).toFixed(1)}%` },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        background: "rgba(139,92,246,0.08)",
                                        border: "1px solid rgba(139,92,246,0.2)",
                                        borderRadius: 10,
                                        padding: "12px 14px",
                                        textAlign: "center",
                                    }}>
                                        <div style={{ fontSize: 11, color: "#6d7a8f", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{item.label}</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: "#c4b5fd" }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                            {detectResult.script_code && (
                                <div style={{ marginTop: 12, fontSize: 13, color: "#94a3b8" }}>
                                    Script: <span style={{ color: "#e2e8f0" }}>{detectResult.script_code}</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Sarvam() {
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [keyInput, setKeyInput] = useState("");
    const [keySet, setKeySet] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("chat");
    const { theme } = useTheme();

    const handleSetKey = useCallback(() => {
        if (keyInput.trim()) {
            setApiKey(keyInput.trim());
            setKeySet(true);
        }
    }, [keyInput]);

    const TABS: { id: Tab; label: string; icon: () => JSX.Element; desc: string }[] = [
        { id: "chat", label: "Chat", icon: Icons.Chat, desc: "Sarvam-M LLM" },
        { id: "stt", label: "Speech→Text", icon: Icons.Mic, desc: "Saaras v3" },
        { id: "tts", label: "Text→Speech", icon: Icons.Speaker, desc: "Bulbul v3" },
        { id: "translate", label: "Translate", icon: Icons.Translate, desc: "Mayura / Sarvam-Translate" },
        { id: "doc", label: "Doc Intelligence", icon: Icons.Vision, desc: "Sarvam Vision — 3B VLM · OCR · 23 langs" },
        { id: "vision", label: "Text Tools", icon: Icons.Brain, desc: "Transliterate · Detect Language" },
    ];

    // Theme-aware colors
    const isDark = theme === "dark" || theme === "system";
    const colors = {
        bg: isDark ? "#0a0a1a" : "#f8f9fa",
        cardBg: isDark ? "rgba(16, 21, 40, 0.9)" : "rgba(255, 255, 255, 0.95)",
        text: isDark ? "#e2e8f0" : "#1a202c",
        textMuted: isDark ? "#6d7a8f" : "#718096",
        border: isDark ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.3)",
        borderActive: isDark ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.6)",
        primary: isDark ? "#8b5cf6" : "#7c3aed",
        primaryLight: isDark ? "#c4b5fd" : "#a78bfa",
        success: isDark ? "#86efac" : "#10b981",
        successBorder: isDark ? "rgba(134,239,172,0.3)" : "rgba(16,185,129,0.4)",
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: isDark
                ? "linear-gradient(135deg, #0a0a1a 0%, #1a0b2e 50%, #0a0a1a 100%)"
                : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)",
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            color: colors.text,
            padding: "20px 16px",
            transition: "background 0.3s ease, color 0.3s ease",
        }}>
            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${isDark ? "rgba(139,92,246,0.05)" : "rgba(139,92,246,0.1)"}; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.4)"}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${isDark ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.6)"}; }
        * { box-sizing: border-box; }
        select option { background: ${isDark ? "#1e1b4b" : "#ffffff"}; color: ${colors.text}; }
      `}</style>

            <div style={{ maxWidth: 720, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 28, animation: "fadeIn 0.5s ease" }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        background: isDark
                            ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(91,33,182,0.15))"
                            : "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(91,33,182,0.1))",
                        border: `1px solid ${colors.border}`,
                        borderRadius: 50,
                        padding: "6px 18px",
                        marginBottom: 16,
                        boxShadow: isDark
                            ? "0 4px 20px rgba(124,58,237,0.2)"
                            : "0 4px 20px rgba(124,58,237,0.15)",
                        transition: "all 0.3s ease",
                    }}>
                        <span style={{ fontSize: 18 }}>🇮🇳</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors.primaryLight, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            Sarvam AI
                        </span>
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize: 34,
                        fontWeight: 800,
                        background: isDark
                            ? "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)"
                            : "linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-0.02em",
                        textShadow: isDark ? "none" : "0 2px 10px rgba(124,58,237,0.1)",
                    }}>
                        Indic Language Intelligence
                    </h1>
                    <p style={{ margin: "10px 0 0", fontSize: 14, color: colors.textMuted }}>
                        Chat · Speech · Translation · Document AI — across 22+ Indian languages
                    </p>
                </div>

                {/* API Key Section */}
                <div style={{
                    background: colors.cardBg,
                    border: `1px solid ${keySet ? colors.successBorder : colors.border}`,
                    borderRadius: 16,
                    padding: "18px 20px",
                    marginBottom: 20,
                    animation: "fadeIn 0.5s ease 0.1s both",
                    boxShadow: isDark
                        ? "0 8px 32px rgba(0,0,0,0.3)"
                        : "0 8px 32px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <Icons.Key />
                        <span style={{ fontSize: 13, fontWeight: 700, color: keySet ? colors.success : colors.primaryLight }}>
                            {keySet ? "✓ API Key Set" : "Enter Your Sarvam API Key"}
                        </span>
                        {keySet && (
                            <button
                                onClick={() => { setKeySet(false); setApiKey(""); setKeyInput(""); }}
                                style={{
                                    marginLeft: "auto",
                                    background: "transparent",
                                    border: "none",
                                    color: "#f87171",
                                    fontSize: 12,
                                    cursor: "pointer",
                                    transition: "opacity 0.2s ease",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            >
                                Change
                            </button>
                        )}
                    </div>
                    {!keySet ? (
                        <>
                            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
                                Get your key at{" "}
                                <a href="https://dashboard.sarvam.ai" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary, textDecoration: "none", fontWeight: 600 }}>
                                    dashboard.sarvam.ai
                                </a>
                                {" "}— stored only in memory, never sent anywhere else.
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <div style={{ flex: 1, position: "relative" }}>
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={keyInput}
                                        onChange={e => setKeyInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSetKey()}
                                        placeholder="sarvam-xxxxxxxxxxxx"
                                        style={{
                                            width: "100%",
                                            background: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.05)",
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 10,
                                            color: colors.text,
                                            padding: "11px 40px 11px 14px",
                                            fontSize: 14,
                                            outline: "none",
                                            fontFamily: "monospace",
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                    <button
                                        onClick={() => setShowKey(s => !s)}
                                        style={{
                                            position: "absolute",
                                            right: 10,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "transparent",
                                            border: "none",
                                            color: colors.textMuted,
                                            cursor: "pointer",
                                            padding: 0,
                                            transition: "color 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                                        onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                                    >
                                        {showKey ? <Icons.EyeOff /> : <Icons.Eye />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleSetKey}
                                    disabled={!keyInput.trim()}
                                    style={{
                                        background: keyInput.trim()
                                            ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                                            : isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)",
                                        border: "none",
                                        borderRadius: 10,
                                        color: keyInput.trim() ? "white" : colors.textMuted,
                                        padding: "11px 20px",
                                        cursor: keyInput.trim() ? "pointer" : "not-allowed",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                        boxShadow: keyInput.trim()
                                            ? "0 4px 16px rgba(124,58,237,0.3)"
                                            : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    Set Key
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: 13, color: colors.textMuted }}>
                            Key ending in <code style={{ background: isDark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4, color: colors.primaryLight }}>
                                ...{apiKey.slice(-8)}
                            </code> — ready to use all Sarvam APIs below.
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: "flex",
                    gap: 6,
                    marginBottom: 16,
                    overflowX: "auto",
                    paddingBottom: 4,
                    animation: "fadeIn 0.5s ease 0.2s both",
                }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    background: active
                                        ? isDark
                                            ? "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(91,33,182,0.25))"
                                            : "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(91,33,182,0.15))"
                                        : isDark
                                            ? "rgba(16,21,40,0.6)"
                                            : "rgba(255,255,255,0.5)",
                                    border: active
                                        ? `1px solid ${colors.borderActive}`
                                        : `1px solid ${colors.border}`,
                                    borderRadius: 12,
                                    color: active ? (isDark ? "#e9e5ff" : "#5b21b6") : colors.textMuted,
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: active ? 700 : 500,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    whiteSpace: "nowrap",
                                    transition: "all 0.2s ease",
                                    boxShadow: active
                                        ? isDark
                                            ? "0 2px 12px rgba(124,58,237,0.3)"
                                            : "0 2px 12px rgba(124,58,237,0.2)"
                                        : "none",
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = isDark
                                            ? "rgba(16,21,40,0.8)"
                                            : "rgba(255,255,255,0.8)";
                                        e.currentTarget.style.borderColor = colors.borderActive;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = isDark
                                            ? "rgba(16,21,40,0.6)"
                                            : "rgba(255,255,255,0.5)";
                                        e.currentTarget.style.borderColor = colors.border;
                                    }
                                }}
                            >
                                <Icon /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Description */}
                <div style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    marginBottom: 14,
                    paddingLeft: 4,
                }}>
                    {TABS.find(t => t.id === activeTab)?.desc}
                    {!keySet && (
                        <span style={{ color: "#f87171", marginLeft: 8 }}>
                            ← Set your API key above to use this feature
                        </span>
                    )}
                </div>

                {/* Tab Content */}
                <div style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    padding: "22px 24px",
                    animation: "fadeIn 0.3s ease",
                    backdropFilter: "blur(10px)",
                    boxShadow: isDark
                        ? "0 8px 32px rgba(0,0,0,0.4)"
                        : "0 8px 32px rgba(0,0,0,0.1)",
                    opacity: keySet ? 1 : 0.5,
                    pointerEvents: keySet ? "auto" : "none",
                    transition: "all 0.3s ease",
                }}>
                    {activeTab === "chat" && <ChatTab apiKey={apiKey} />}
                    {activeTab === "stt" && <STTTab apiKey={apiKey} />}
                    {activeTab === "tts" && <TTSTab apiKey={apiKey} />}
                    {activeTab === "translate" && <TranslateTab apiKey={apiKey} />}
                    {activeTab === "doc" && <VisionTab apiKey={apiKey} />}
                    {activeTab === "vision" && <TextToolsTab apiKey={apiKey} />}
                </div>

                {/* Models footer */}
                <div style={{
                    marginTop: 20,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                    animation: "fadeIn 0.5s ease 0.4s both",
                }}>
                    {["Sarvam-M", "Saaras v3", "Saarika v2.5", "Bulbul v3", "Bulbul v2", "Bulbul v1", "Mayura", "Sarvam Translate", "Sarvam Vision"].map(m => (
                        <span key={m} style={{
                            fontSize: 11,
                            color: isDark ? "#4a5568" : "#64748b",
                            background: isDark
                                ? "rgba(139,92,246,0.06)"
                                : "rgba(139,92,246,0.08)",
                            border: `1px solid ${isDark ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.15)"}`,
                            borderRadius: 20,
                            padding: "4px 10px",
                            transition: "all 0.2s ease",
                        }}>
                            {m}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}