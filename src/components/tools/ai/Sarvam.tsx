import { useState, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    Key: (props: any) => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
    ),
    Chat: (props: any) => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    Mic: (props: any) => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    ),
    Speaker: (props: any) => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    Translate: (props: any) => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
    ),
    Vision: (props: any) => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Send: (props: any) => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    ),
    Eye: (props: any) => (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ),
    EyeOff: (props: any) => (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    ),
    Upload: (props: any) => (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    ),
    Copy: (props: any) => (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    Loader: (props: any) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cn("animate-spin", props.className)} {...props}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
        </svg>
    ),
    Brain: (props: any) => (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
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
        <div className="flex flex-col gap-2 group">
            {label && (
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 group-hover:text-primary transition-colors pl-1">
                    {label}
                </label>
            )}
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="w-full h-12 px-4 bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-xl text-sm font-bold text-foreground focus:ring-4 ring-primary/10 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            >
                {options.map((o, i) => (
                    <option key={`${o.value}-${i}`} value={o.value} className="bg-background text-foreground">
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function ErrorBanner({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500/80 text-xs font-bold leading-relaxed shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-red-500/10 rounded-full text-[10px]">
                ⚠
            </div>
            {msg}
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
        <div className="flex flex-col h-full gap-6">
            {/* Model selector row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Model Protocol"
                    value={chatModel}
                    onChange={v => { setChatModel(v); setMessages([]); }}
                    options={[
                        { value: "sarvam-m", label: "Sarvam-M (24B)" },
                        { value: "sarvam-m:thinking", label: "Sarvam-M Thinking" },
                    ]}
                />
                <Select
                    label="Reasoning Effort"
                    value={reasoningEffort}
                    onChange={setReasoningEffort}
                    options={[
                        { value: "", label: "Standard Execution" },
                        { value: "low", label: "Efficiency Mode" },
                        { value: "medium", label: "Balanced Analysis" },
                        { value: "high", label: "Deep Reasoning" },
                    ]}
                />
            </div>

            {/* Controls Protocol */}
            <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={wikiGrounding}
                            onChange={e => setWikiGrounding(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-5 h-5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md transition-all group-hover:border-primary/40 peer-checked:bg-primary peer-checked:border-primary" />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors">Wiki Grounding</span>
                </label>

                <div className="h-4 w-px bg-black/5 dark:bg-white/5 mx-2 hidden md:block" />

                <button
                    onClick={() => setShowSystem(s => !s)}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        showSystem
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-black/5 dark:bg-white/5 text-muted-foreground/60 border-transparent hover:border-black/10 dark:hover:border-white/10"
                    )}
                >
                    System Protocol
                </button>

                {messages.length > 0 && (
                    <button
                        onClick={() => setMessages([])}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/5 text-red-500/60 border border-transparent hover:border-red-500/20 transition-all ml-auto"
                    >
                        Clear Memory
                    </button>
                )}
            </div>

            {showSystem && (
                <textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    placeholder="Initialize system instructions..."
                    rows={3}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-2xl p-4 text-sm text-foreground focus:ring-4 ring-primary/10 outline-none transition-all resize-none placeholder:text-muted-foreground/20 font-medium"
                />
            )}

            {error && <ErrorBanner msg={error} />}

            {/* Messages Protocol Viewport */}
            <div className="flex-grow overflow-y-auto space-y-4 min-h-[300px] max-h-[500px] pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 translate-y-4">
                        <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700">🇮🇳</div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-center mb-2">Neural Link Initialized</p>
                        <p className="text-[10px] font-medium text-center">Ready for multilingual intelligence across 23 Indian protocols</p>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className={cn(
                            "flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                            m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        )}>
                            <div className={cn(
                                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                m.role === "user"
                                    ? "bg-primary text-white font-medium shadow-lg shadow-primary/10"
                                    : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-foreground"
                            )}>
                                {m.content}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30 px-1">
                                {m.role === "user" ? "Transmitted" : "Neural Response"}
                            </span>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse px-2">
                        <Icons.Loader className="w-3 h-3" />
                        Neural Processing...
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Protocol */}
            <div className="relative group mt-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { send(); } }}
                    placeholder="Enter Multilingual Query..."
                    disabled={loading}
                    className="w-full h-14 pl-6 pr-14 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 focus:ring-4 ring-primary/10 outline-none font-medium text-sm transition-all placeholder:text-muted-foreground/20 shadow-inner group-hover:border-primary/20"
                />
                <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                >
                    {loading ? <Icons.Loader className="w-4 h-4" /> : <Icons.Send className="w-3.5 h-3.5" />}
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
        <div className="flex flex-col gap-8">
            {/* STT Configuration Protocol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Intelligence Core"
                    value={sttModel}
                    onChange={v => { setSttModel(v); if (v === "saarika:v2.5") setMode("transcribe"); setResult(null); }}
                    options={[
                        { value: "saaras:v3", label: "Saaras v3 (Latest)" },
                        { value: "saarika:v2.5", label: "Saarika v2.5 (Legacy)" },
                    ]}
                />
                <Select
                    label="Signal Source Language"
                    value={langCode}
                    onChange={setLangCode}
                    options={LANG_OPTIONS_WITH_AUTO}
                />
            </div>

            {/* Analysis Mode selector — disabled for saarika */}
            <Select
                label={isSaarika ? "Output Mode Protocol (Saaras v3 exclusive)" : "Analysis Mode Protocol"}
                value={mode}
                onChange={setMode}
                disabled={isSaarika}
                options={STT_MODE_OPTIONS}
            />

            {/* File Ingestion Protocol */}
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 pl-1">
                    Signal Capture Protocol
                </p>
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                    className={cn(
                        "relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 transition-all duration-500 flex flex-col items-center justify-center gap-4 text-center overflow-hidden",
                        file
                            ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                            : "bg-black/5 dark:bg-white/[0.02] border-black/10 dark:border-white/5 hover:border-primary/30 hover:bg-primary/[0.02]"
                    )}
                >
                    <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />

                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                        file ? "bg-primary text-white scale-110 rotate-12" : "bg-black/5 dark:bg-white/5 text-muted-foreground/30 group-hover:scale-110"
                    )}>
                        {file ? <Icons.Chat className="w-8 h-8" /> : <Icons.Upload className="w-8 h-8" />}
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">
                            {file ? file.name : "Inject Audio Stream"}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · Detected Signal` : "wav · mp3 · flac · m4a"}
                        </p>
                    </div>

                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </div>

            {/* Mode Meta Protocol */}
            <div className="bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {isSaarika ? "Legacy System Info" : "Protocol Intelligence"}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/40">
                        {isSaarika ? "11 Language Vectors" : "23 Language Vectors"}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {isSaarika
                        ? "Transcribes in the same language spoken. Optimized for telephony and code-mixed speech."
                        : STT_MODES.find(m => m.value === mode)?.desc}
                </p>
            </div>

            {error && <ErrorBanner msg={error} />}

            <button
                onClick={transcribe}
                disabled={!file || loading}
                className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
            >
                {loading ? <Icons.Loader className="w-5 h-5" /> : <Icons.Mic className="w-5 h-5" />}
                {loading ? "Processing Stream..." : (isSaarika ? "Transcribe Audio" : (BTN_LABELS[mode] ?? "Process Audio"))}
            </button>

            {result && (
                <div className="mt-4 p-8 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Signal Extraction</span>
                        <div className="flex gap-4 items-center">
                            {result.language_code && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                                    {result.language_code}
                                </span>
                            )}
                            {result.language_probability && (
                                <span className="text-[10px] font-medium text-muted-foreground/40">
                                    {(result.language_probability * 100).toFixed(0)}% Certainty
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-inner">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">{result.transcript}</p>
                    </div>
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

    const isV1 = ttsModel === "bulbul:v1";
    const speakerOpts = isV1
        ? [{ value: "meera", label: "Meera" }, { value: "pavithra", label: "Pavithra" }, { value: "maitreyi", label: "Maitreyi" },
        { value: "arvind", label: "Arvind" }, { value: "amol", label: "Amol" }, { value: "amartya", label: "Amartya" }]
        : TTS_SPEAKER_OPTIONS;

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
        <div className="flex flex-col gap-8">
            {/* TTS Intelligence Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Voice Engine"
                    value={ttsModel}
                    onChange={handleModelChange}
                    options={[
                        { value: "bulbul:v3", label: "Bulbul v3 (Premium)" },
                        { value: "bulbul:v2", label: "Bulbul v2" },
                        { value: "bulbul:v1", label: "Bulbul v1 (Legacy)" },
                    ]}
                />
                <Select
                    label="Vocal Language"
                    value={langCode}
                    onChange={setLangCode}
                    options={TTS_LANG_OPTIONS}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Neural Speaker"
                    value={speaker}
                    onChange={setSpeaker}
                    options={speakerOpts}
                />
                <Select
                    label="Signal Fidelity (Sample Rate)"
                    value={sampleRate.toString()}
                    onChange={v => setSampleRate(parseInt(v))}
                    options={sampleRateOpts.map(o => ({ value: o.value.toString(), label: o.label }))}
                />
            </div>

            {/* Model capability badge */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex justify-between items-center shadow-inner">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {ttsModel.split(":")[1]?.toUpperCase().replace("V", "Version ")} Operational
                    </span>
                    <p className="text-xs text-muted-foreground font-medium italic">
                        {ttsModel === "bulbul:v3" && "30+ Neural Voices · High Fidelity Synthesis"}
                        {ttsModel === "bulbul:v2" && "Optimized Stability · Multi-regional Vocals"}
                        {ttsModel === "bulbul:v1" && "Legacy Synthesis · Efficiency Mode"}
                    </p>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                    ttsModel === "bulbul:v3" ? "bg-primary text-white" : "bg-black/10 dark:bg-white/10 text-muted-foreground"
                )}>
                    {ttsModel === "bulbul:v3" ? "Premium" : ttsModel === "bulbul:v2" ? "Standard" : "Legacy"}
                </div>
            </div>

            {/* Voice Synthesis Protocol */}
            <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
                        Intelligence Input Protocol
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground/30">
                        {text.length} / {isV1 ? 500 : 2500} Vectors
                    </span>
                </div>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value.slice(0, isV1 ? 500 : 2500))}
                    placeholder="Enter Multilingual Text for Vocal Synthesis..."
                    rows={5}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-[2rem] p-6 text-sm text-foreground focus:ring-4 ring-primary/10 outline-none transition-all resize-none placeholder:text-muted-foreground/20 font-medium shadow-inner"
                />
            </div>

            {error && <ErrorBanner msg={error} />}

            <button
                onClick={convert}
                disabled={!text.trim() || loading}
                className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
            >
                {loading ? <Icons.Loader className="w-5 h-5 shadow-inner animate-spin" /> : <Icons.Speaker className="w-5 h-5" />}
                {loading ? "Synthesizing Neural Signal..." : "Synthesize Voice Protocol"}
            </button>

            {audioUrl && (
                <div className="mt-4 p-8 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Synthesized Vocal Stream</span>
                        <a
                            href={audioUrl}
                            download={`sarvam_tts_${ttsModel.replace(":", "_")}.wav`}
                            className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
                        >
                            Download WAV Protocol ↓
                        </a>
                    </div>
                    <div className="bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-inner flex items-center justify-center">
                        <audio src={audioUrl} controls className="w-full h-10 accent-primary" />
                    </div>
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
        <div className="flex flex-col gap-8">
            {/* Translation Protocol Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Neural Linguistics Engine"
                    value={model}
                    onChange={handleModelChange}
                    options={[
                        { value: "mayura:v1", label: "Mayura v1 (11 Protocols)" },
                        { value: "sarvam-translate:v1", label: "Sarvam Translate (22 Protocols)" },
                    ]}
                />
                <Select
                    label="Linguistic Style"
                    value={mode}
                    onChange={setMode}
                    disabled={model === "sarvam-translate:v1"}
                    options={TRANSLATE_MODES}
                />
            </div>

            {/* Language Vector Synthesis */}
            <div className="flex items-center gap-4 relative">
                <div className="flex-1">
                    <Select label="Source Vector" value={srcLang} onChange={setSrcLang} options={srcOptions} />
                </div>

                <button
                    onClick={swapLangs}
                    className="mt-6 w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm group active:rotate-180"
                    title="Transpose Vectors"
                >
                    <Icons.Translate className="w-4 h-4" />
                </button>

                <div className="flex-1">
                    <Select label="Target Vector" value={tgtLang} onChange={setTgtLang} options={tgtOptions} />
                </div>
            </div>

            {/* Data Ingestion Protocol */}
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 pl-1">
                    Transmission Input
                </p>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter Multilingual Source Material for Translation..."
                    rows={5}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-[2rem] p-6 text-sm text-foreground focus:ring-4 ring-primary/10 outline-none transition-all resize-none placeholder:text-muted-foreground/20 font-medium shadow-inner"
                />
            </div>

            {error && <ErrorBanner msg={error} />}

            <button
                onClick={translate}
                disabled={!input.trim() || loading}
                className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
            >
                {loading ? <Icons.Loader className="w-5 h-5 animate-spin" /> : <Icons.Translate className="w-5 h-5" />}
                {loading ? "Synthesizing Translation..." : "Execute Linguistic Transposition"}
            </button>

            {result && (
                <div className="mt-4 p-8 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Target Vector Output</span>
                        <button
                            onClick={copy}
                            className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 px-4 py-2 rounded-xl border",
                                copied
                                    ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                                    : "bg-black/5 dark:bg-white/5 text-primary border-transparent hover:border-primary/20"
                            )}
                        >
                            {copied ? "Vector Copied" : "Extract Material"}
                            {copied ? "✓" : <Icons.Copy className="w-3 h-3" />}
                        </button>
                    </div>
                    <div className="bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-inner">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                            {result.translated_text}
                        </p>
                    </div>
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
        <div className="flex flex-col gap-8">
            {/* Intel Header Protocol */}
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner overflow-hidden relative group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                    🔬
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                        Sarvam Vision — Neural Document Intelligence
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        3B parameter VLM optimized for high-fidelity extraction across 23 Indian languages.
                        Processes PDFs and optical signals into structured Markdown or HTML protocols.
                    </p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            </div>

            {/* CORS Restriction Protocol */}
            {corsBlocked && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 text-amber-500">
                        <span className="text-lg">⚠</span>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600/80">Security Protocol Violation: CORS Restriction</h4>
                    </div>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                        The <code className="text-primary font-mono bg-black/5 dark:bg-white/5 px-1 rounded">/document-intelligence</code> portal enforces server-to-server communication exclusively.
                        Direct client-side ingestion is prohibited by security policy. SDK or backend proxy required.
                    </p>
                    <div className="relative group/code">
                        <pre className="p-4 bg-black/40 rounded-xl overflow-x-auto text-[10px] font-mono text-foreground/70 border border-white/5">
                            {`from sarvamai import SarvamAI
client = SarvamAI(api_subscription_key="YOUR_KEY")
job = client.document_intelligence.create_job(
    language="${language}", output_format="${outputFormat}"
)
job.upload_file("document.pdf")
job.start()
job.wait_until_complete()
job.download_output("./output.zip")`}
                        </pre>
                        <button
                            className="absolute top-3 right-3 opacity-0 group-hover/code:opacity-100 transition-opacity bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                            onClick={() => navigator.clipboard.writeText(`from sarvamai import SarvamAI\nclient = SarvamAI(api_subscription_key="YOUR_KEY")\njob = client.document_intelligence.create_job(language="${language}", output_format="${outputFormat}")\njob.upload_file("document.pdf")\njob.start()\njob.wait_until_complete()\njob.download_output("./output.zip")`)}
                        >
                            <Icons.Copy className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Extraction Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Source Signal Language" value={language} onChange={setLanguage} options={VISION_LANGUAGES} />
                <Select label="Output Protocol Format" value={outputFormat} onChange={setOutputFormat}
                    options={[
                        { value: "md", label: "Markdown (.md)" },
                        { value: "html", label: "HTML (.html)" },
                    ]} />
            </div>

            {/* Document Ingestion Protocol */}
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 pl-1">
                    Synthetic Document Capture
                </p>
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                    className={cn(
                        "relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-12 transition-all duration-500 flex flex-col items-center justify-center gap-4 text-center overflow-hidden",
                        file
                            ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                            : "bg-black/5 dark:bg-white/[0.02] border-black/10 dark:border-white/5 hover:border-primary/30 hover:bg-primary/[0.02]"
                    )}
                >
                    <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.zip" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />

                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                        file ? "bg-primary text-white scale-110 rotate-6" : "bg-black/5 dark:bg-white/5 text-muted-foreground/30 group-hover:scale-110"
                    )}>
                        {file ? <Icons.Chat className="w-8 h-8" /> : <Icons.Upload className="w-8 h-8" />}
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">
                            {file ? file.name : "Inject Document Intelligence Signal"}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · Analysis Ready` : "pdf · png · jpg · zip"}
                        </p>
                    </div>

                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </div>

            {statusMsg && (
                <div className="flex items-center justify-center gap-3 py-4 animate-pulse">
                    <Icons.Loader className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{statusMsg}</span>
                </div>
            )}

            {error && <ErrorBanner msg={error} />}

            <button
                onClick={processDocument}
                disabled={!file || loading}
                className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
            >
                {loading ? <Icons.Loader className="w-5 h-5 animate-spin" /> : <Icons.Brain className="w-5 h-5" />}
                {loading ? (statusMsg || "Processing Signal...") : "Execute Visual Intelligence"}
            </button>

            {jobId && !downloadUrl && (
                <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">
                        Active Job Parameter: <span className="font-mono text-primary/40 underline decoration-dotted">{jobId}</span>
                    </span>
                </div>
            )}

            {downloadUrl && (
                <div className="mt-4 p-8 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Extracted Intelligence Asset</span>
                    </div>
                    <a
                        href={downloadUrl}
                        download={`sarvam_vision_asset_${jobId || "extraction"}.zip`}
                        className="flex items-center justify-between p-6 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                ↓
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-primary">Download Intelligence ZIP</p>
                                <p className="text-[10px] font-medium text-primary/60 italic">Processed across 23 language vectors</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                            Ready
                        </span>
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
        <div className="flex flex-col gap-8">
            {/* Tool Selector Protocol */}
            <div className="flex p-1 bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/5 rounded-2xl">
                {([
                    { id: "translit", label: "Transliterate", icon: <Icons.Translate className="w-4 h-4" /> },
                    { id: "detect", label: "Detect Language", icon: <Icons.Brain className="w-4 h-4" /> },
                ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest",
                            tool === t.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Transliterate ── */}
            {tool === "translit" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4 shadow-inner">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary flex-shrink-0">🔤</div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            <span className="text-primary font-bold">Vector Transposition:</span> Converts text between scripts while maintaining phonetic fidelity.
                            Ideal for English ↔ Indic script mapping (e.g., <span className="italic">नमस्ते</span> ↔ <span className="italic">namaste</span>).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Select label="Source Vector" value={translitSrc} onChange={setTranslitSrc} options={TRANSLIT_LANGS} />
                            </div>
                            <div className="mt-6 text-primary flex items-center justify-center">→</div>
                            <div className="flex-1">
                                <Select label="Target Vector" value={translitTgt} onChange={setTranslitTgt} options={TRANSLIT_LANGS} />
                            </div>
                        </div>
                        <Select
                            label="Numeral Synthesis"
                            value={translitNumerals}
                            onChange={setTranslitNumerals}
                            options={[
                                { value: "international", label: "International Protocol (0–9)" },
                                { value: "native", label: "Native Script Protocol" },
                            ]}
                        />
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 pl-1">Input Signal Material</p>
                        <textarea
                            value={translitInput}
                            onChange={e => setTranslitInput(e.target.value)}
                            placeholder="Enter text to transliterate across vectors..."
                            rows={3}
                            className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-[2rem] p-6 text-sm text-foreground focus:ring-4 ring-primary/10 outline-none transition-all resize-none placeholder:text-muted-foreground/20 font-medium shadow-inner"
                        />
                    </div>

                    {translitError && <ErrorBanner msg={translitError} />}

                    <button
                        onClick={runTranslit}
                        disabled={!translitInput.trim() || translitLoading}
                        className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {translitLoading ? <Icons.Loader className="w-5 h-5 animate-spin" /> : <Icons.Translate className="w-5 h-5" />}
                        {translitLoading ? "Transposing Vectors..." : "Execute Transliteration Protocol"}
                    </button>

                    {translitResult && (
                        <div className="mt-4 p-8 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                    Transposed Output — {LANG_NAMES[translitSrc]} → {LANG_NAMES[translitTgt]}
                                </span>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(translitResult); setTranslitCopied(true); setTimeout(() => setTranslitCopied(false), 1500); }}
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 px-4 py-2 rounded-xl border",
                                        translitCopied
                                            ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                                            : "bg-black/5 dark:bg-white/5 text-primary border-transparent hover:border-primary/20"
                                    )}
                                >
                                    {translitCopied ? "Vector Extracted" : "Extract Output"}
                                    {translitCopied ? "✓" : <Icons.Copy className="w-3 h-3" />}
                                </button>
                            </div>
                            <div className="bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-inner">
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">{translitResult}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Detect Language ── */}
            {tool === "detect" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4 shadow-inner">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary flex-shrink-0">🔍</div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            <span className="text-primary font-bold">Linguistic Identification:</span> Automatically detects the language and script vector of any target text.
                            Coverage: All 22 official Indian languages + English.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 pl-1">Signal Monitoring Input</p>
                        <textarea
                            value={detectInput}
                            onChange={e => setDetectInput(e.target.value)}
                            placeholder="Paste linguistic material for vector identification..."
                            rows={5}
                            className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-[2rem] p-6 text-sm text-foreground focus:ring-4 ring-primary/10 outline-none transition-all resize-none placeholder:text-muted-foreground/20 font-medium shadow-inner"
                        />
                    </div>

                    {detectError && <ErrorBanner msg={detectError} />}

                    <button
                        onClick={runDetect}
                        disabled={!detectInput.trim() || detectLoading}
                        className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {detectLoading ? <Icons.Loader className="w-5 h-5 animate-spin" /> : <Icons.Brain className="w-5 h-5" />}
                        {detectLoading ? "Analyzing Signal..." : "Execute Identification Protocol"}
                    </button>

                    {detectResult && (
                        <div className="mt-4 p-8 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identification Results</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-inner text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Language Vector</p>
                                    <p className="text-xl font-black text-primary">{LANG_NAMES[detectResult.language_code] || detectResult.language_code}</p>
                                </div>
                                <div className="bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-inner text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Script Protocol</p>
                                    <p className="text-xl font-black text-primary font-mono">{detectResult.script_code || "Neural"}</p>
                                </div>
                                <div className="bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-inner text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Confidence Score</p>
                                    <p className="text-xl font-black text-primary">{(detectResult.confidence_score * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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

    const TABS: { id: Tab; label: string; icon: (props: any) => JSX.Element; desc: string }[] = [
        { id: "chat", label: "Chat", icon: Icons.Chat, desc: "Sarvam-M LLM" },
        { id: "stt", label: "Speech→Text", icon: Icons.Mic, desc: "Saaras v3" },
        { id: "tts", label: "Text→Speech", icon: Icons.Speaker, desc: "Bulbul v3" },
        { id: "translate", label: "Translate", icon: Icons.Translate, desc: "Mayura / Sarvam-Translate" },
        { id: "doc", label: "Doc Intelligence", icon: Icons.Vision, desc: "Sarvam Vision — 3B VLM · OCR · 23 langs" },
        { id: "vision", label: "Text Tools", icon: Icons.Brain, desc: "Transliterate · Detect Language" },
    ];

    // Theme-aware colors derived from Global Protocol
    const isDark = theme === "dark";
    const colors = {
        bg: "transparent",
        cardBg: "rgba(var(--card), 0.5)",
        text: "hsl(var(--foreground))",
        textMuted: "hsl(var(--muted-foreground))",
        border: "hsla(var(--primary), 0.1)",
        borderActive: "hsla(var(--primary), 0.4)",
        primary: "hsl(var(--primary))",
        primaryLight: "hsla(var(--primary), 0.8)",
        success: "#10b981",
        successBorder: "rgba(16,185,129,0.2)",
    };

    return (
        <div className="w-full font-sans text-foreground">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .fadeIn { animation: fadeIn 0.4s ease forwards; }
                input::placeholder { color: hsla(var(--foreground), 0.3); }
                * { box-sizing: border-box; }
                select option { background: ${isDark ? "#000" : "#fff"}; color: ${colors.text}; }
            `}</style>

            <div className="max-w-4xl mx-auto">

                <div className="bg-white/60 dark:bg-white/[0.01] backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[2rem] p-6 mb-8 shadow-2xl transition-all duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <Icons.Key className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">
                            {keySet ? "Intelligence Protocol Active" : "Authentication Required"}
                        </span>
                        {keySet && (
                            <button
                                onClick={() => { setKeySet(false); setApiKey(""); setKeyInput(""); }}
                                className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
                            >
                                Decommission Key
                            </button>
                        )}
                    </div>

                    {!keySet ? (
                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground/60 px-1 font-medium">
                                Secure your access via <a href="https://dashboard.sarvam.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">dashboard.sarvam.ai</a>.
                                Credentials persist in memory only.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-grow group">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={keyInput}
                                        onChange={e => setKeyInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSetKey()}
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        className="w-full h-14 pl-6 pr-14 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 focus:ring-4 ring-primary/10 outline-none font-mono text-sm transition-all placeholder:text-muted-foreground/30 shadow-inner"
                                    />
                                    <button
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors"
                                    >
                                        {showKey ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleSetKey}
                                    className="h-14 px-10 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all hover:shadow-primary/20 shrink-0"
                                >
                                    Initialize Suite
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground/60 px-1 flex items-center gap-2 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span>Authorization verified. Master Key: <code className="font-mono text-primary/80">...{apiKey.slice(-8)}</code></span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-4 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold text-xs tracking-tight shadow-sm border",
                                    active
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                        : "bg-white/50 dark:bg-white/[0.02] text-muted-foreground border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.05]"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Description Protocol */}
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-4 px-2">
                    {TABS.find(t => t.id === activeTab)?.desc}
                </div>

                <div className={cn(
                    "bg-white/80 dark:bg-black/20 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl transition-all duration-500",
                    !keySet && "opacity-40 grayscale pointer-events-none"
                )}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === "chat" && <ChatTab apiKey={apiKey} />}
                            {activeTab === "stt" && <STTTab apiKey={apiKey} />}
                            {activeTab === "tts" && <TTSTab apiKey={apiKey} />}
                            {activeTab === "translate" && <TranslateTab apiKey={apiKey} />}
                            {activeTab === "doc" && <VisionTab apiKey={apiKey} />}
                            {activeTab === "vision" && <TextToolsTab apiKey={apiKey} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Models Technical Protocol Footer */}
                <div className="mt-12 flex flex-wrap gap-2 justify-center fadeIn" style={{ animationDelay: '0.4s' }}>
                    {["Sarvam-M", "Saaras v3", "Saarika v2.5", "Bulbul v3", "Bulbul v2", "Bulbul v1", "Mayura", "Sarvam Translate", "Sarvam Vision"].map(m => (
                        <span key={m} className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:border-primary/30 transition-all cursor-default">
                            {m}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
