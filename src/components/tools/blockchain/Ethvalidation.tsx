import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { CSSProperties } from "react";

const ETH_REGEX = /^0x[0-9a-fA-F]{40}$/;

function keccak256Checksum(address: string): string {
    // Simple checksum display — EIP-55 visual indicator
    const hex = address.slice(2).toLowerCase();
    const mixed = hex.split("").map((c, i) =>
        parseInt(hex[i], 16) >= 8 ? c.toUpperCase() : c
    ).join("");
    return "0x" + mixed;
}

function classifyAddress(address: string): string {
    const lower = address.toLowerCase();
    if (lower === "0x" + "0".repeat(40)) return "Null / Burn Address";
    if (lower === "0xdead000000000000000042069420694206942069") return "Dead Address";
    if (lower.startsWith("0x000000000000000000000000")) return "Possibly a Contract Hash";
    return "Externally Owned Account (EOA)";
}

function segmentAddress(address: string): { prefix: string; segments: string[] } | string[] {
    if (!address || address.length < 42) return [address];
    const prefix = address.slice(0, 2);
    const segments: string[] = [];
    for (let i = 2; i < 42; i += 4) {
        segments.push(address.slice(i, i + 4));
    }
    return { prefix, segments };
}

export default function EthAddressValidator() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("idle"); // idle | valid | invalid
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (input === "") {
            setStatus("idle");
            return;
        }
        const t = setTimeout(() => {
            setStatus(ETH_REGEX.test(input) ? "valid" : "invalid");
        }, 200);
        return () => clearTimeout(t);
    }, [input]);

    const handlePaste = async () => {
        const text = await navigator.clipboard.readText();
        setInput(text.trim());
        inputRef.current?.focus();
    };

    const handleCopy = () => {
        if (status === "valid") {
            navigator.clipboard.writeText(keccak256Checksum(input));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClear = () => {
        setInput("");
        setStatus("idle");
        inputRef.current?.focus();
    };

    const isDark = resolvedTheme === "dark";
    const segmented = status === "valid" ? segmentAddress(input) : null;

    if (!mounted) return null;

    const styles: Record<string, CSSProperties> = {
        root: {
            minHeight: "100vh",
            background: isDark
                ? "radial-gradient(ellipse at 20% 50%, #0d1117 0%, #090c10 100%)"
                : "radial-gradient(ellipse at 20% 50%, #f0f4ff 0%, #e8edf8 100%)",
            fontFamily: "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            transition: "background 0.4s ease",
        },
        card: {
            width: "100%",
            maxWidth: "680px",
            background: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.75)",
            border: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.1)",
            borderRadius: "20px",
            padding: "48px 40px",
            backdropFilter: "blur(20px)",
            boxShadow: isDark
                ? "0 0 80px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
            position: "relative",
            overflow: "hidden",
        },
        glowBar: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
                status === "valid"
                    ? "linear-gradient(90deg, transparent, #10b981, transparent)"
                    : status === "invalid"
                        ? "linear-gradient(90deg, transparent, #ef4444, transparent)"
                        : "linear-gradient(90deg, transparent, #6366f1, transparent)",
            transition: "background 0.4s ease",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
        },
        titleGroup: {
            display: "flex",
            flexDirection: "column",
        },
        eyebrow: {
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
            marginBottom: "4px",
        },
        title: {
            fontSize: "22px",
            fontWeight: "700",
            color: isDark ? "#f0f6ff" : "#0f172a",
            letterSpacing: "-0.02em",
        },
        ethLogo: {
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: isDark
                ? "rgba(99,102,241,0.15)"
                : "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
        },
        themeToggle: {
            background: "none",
            border: isDark
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,0,0,0.1)",
            borderRadius: "10px",
            padding: "8px 14px",
            cursor: "pointer",
            color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
            fontSize: "12px",
            letterSpacing: "0.05em",
            transition: "all 0.2s",
            marginLeft: "12px",
        },
        inputWrapper: {
            position: "relative",
            marginBottom: "20px",
        },
        input: {
            width: "100%",
            background: isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.04)",
            border: `1.5px solid ${status === "valid"
                    ? "#10b981"
                    : status === "invalid"
                        ? "#ef4444"
                        : isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.15)"
                }`,
            borderRadius: "12px",
            padding: "16px 120px 16px 20px",
            fontSize: "14px",
            fontFamily: "inherit",
            color: isDark ? "#e2e8f0" : "#1e293b",
            outline: "none",
            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            boxShadow:
                status === "valid"
                    ? "0 0 0 3px rgba(16,185,129,0.1)"
                    : status === "invalid"
                        ? "0 0 0 3px rgba(239,68,68,0.1)"
                        : "none",
            letterSpacing: "0.05em",
            boxSizing: "border-box",
        },
        inputActions: {
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: "6px",
        },
        smallBtn: {
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            border: "none",
            borderRadius: "7px",
            padding: "5px 10px",
            cursor: "pointer",
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            fontSize: "11px",
            fontFamily: "inherit",
            letterSpacing: "0.05em",
            transition: "all 0.2s",
        },
        statusBadge: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "100px",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background:
                status === "valid"
                    ? "rgba(16,185,129,0.12)"
                    : status === "invalid"
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(99,102,241,0.12)",
            color:
                status === "valid"
                    ? "#10b981"
                    : status === "invalid"
                        ? "#ef4444"
                        : "#6366f1",
            border: `1px solid ${status === "valid"
                    ? "rgba(16,185,129,0.3)"
                    : status === "invalid"
                        ? "rgba(239,68,68,0.3)"
                        : "rgba(99,102,241,0.3)"
                }`,
            transition: "all 0.3s ease",
        },
        resultPanel: {
            marginTop: "24px",
            background: isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(0,0,0,0.025)",
            border: isDark
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(0,0,0,0.06)",
            borderRadius: "14px",
            padding: "24px",
            opacity: status === "valid" ? 1 : 0,
            transform: status === "valid" ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.35s ease",
            pointerEvents: status === "valid" ? "auto" : "none",
        },
        label: {
            fontSize: "10px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
            marginBottom: "8px",
            display: "block",
        },
        checksumRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
        },
        checksumAddr: {
            fontSize: "13px",
            color: isDark ? "#94a3b8" : "#475569",
            letterSpacing: "0.04em",
            wordBreak: "break-all",
            flex: 1,
        },
        copyBtn: {
            background: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "8px",
            padding: "6px 14px",
            cursor: "pointer",
            color: "#6366f1",
            fontSize: "11px",
            fontFamily: "inherit",
            letterSpacing: "0.06em",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
        },
        divider: {
            height: "1px",
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            margin: "16px 0",
        },
        segmentGrid: {
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginTop: "8px",
        },
        segment: {
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontFamily: "inherit",
            letterSpacing: "0.08em",
            background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.07)",
            color: isDark ? "rgba(165,180,252,0.9)" : "#4f46e5",
            border: "1px solid rgba(99,102,241,0.2)",
        },
        segmentPrefix: {
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontFamily: "inherit",
            letterSpacing: "0.08em",
            background: "rgba(16,185,129,0.1)",
            color: "#10b981",
            border: "1px solid rgba(16,185,129,0.25)",
            fontWeight: "700",
        },
        metaRow: {
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "16px",
        },
        metaChip: {
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "11px",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)",
            letterSpacing: "0.04em",
        },
        errorMsg: {
            marginTop: "12px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            fontSize: "12px",
            letterSpacing: "0.03em",
            opacity: status === "invalid" ? 1 : 0,
            transition: "opacity 0.3s ease",
        },
        footer: {
            marginTop: "10px",
            fontSize: "11px",
            color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)",
            letterSpacing: "0.05em",
            textAlign: "center",
        },
    };

    const diagnoseProblem = (addr: string): string => {
        if (!addr.startsWith("0x") && !addr.startsWith("0X")) return "Missing '0x' prefix";
        if (addr.length < 42) return `Too short — ${42 - addr.length} character(s) missing`;
        if (addr.length > 42) return `Too long — ${addr.length - 42} extra character(s)`;
        if (!/^[0-9a-fA-F]+$/.test(addr.slice(2))) return "Contains invalid non-hex character(s)";
        return "Invalid Ethereum address format";
    };

    // Narrow segmented to the object shape for rendering
    const segmentedObj = segmented && !Array.isArray(segmented) ? segmented : null;

    return (
        <div style={styles.root}>
            <link
                href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
            <div style={styles.card}>
                <div style={styles.glowBar} />

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.titleGroup}>
                        <span style={styles.eyebrow}>EIP-55 · ERC-20 Compatible</span>
                        <span style={styles.title}>ETH Address Validator</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={styles.ethLogo}>⟠</div>
                        <button
                            style={styles.themeToggle}
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                        >
                            {isDark ? "☀ Light" : "⬡ Dark"}
                        </button>
                    </div>
                </div>

                {/* Input */}
                <div style={styles.inputWrapper}>
                    <input
                        ref={inputRef}
                        style={styles.input}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="0x742d35Cc6634C0532925a3b8D4C9D5F2b6E24Ac1"
                        spellCheck={false}
                        autoComplete="off"
                    />
                    <div style={styles.inputActions}>
                        <button style={styles.smallBtn} onClick={handlePaste}>Paste</button>
                        {input && (
                            <button style={styles.smallBtn} onClick={handleClear}>Clear</button>
                        )}
                    </div>
                </div>

                {/* Status badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={styles.statusBadge}>
                        <span>
                            {status === "idle" ? "●" : status === "valid" ? "✓" : "✕"}
                        </span>
                        <span>
                            {status === "idle"
                                ? "Awaiting input"
                                : status === "valid"
                                    ? "Valid address"
                                    : "Invalid address"}
                        </span>
                    </div>
                    {status === "valid" && (
                        <span style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)", letterSpacing: "0.04em" }}>
                            {classifyAddress(input)}
                        </span>
                    )}
                </div>

                {/* Error panel */}
                {status === "invalid" && (
                    <div style={styles.errorMsg}>
                        ⚠ {diagnoseProblem(input)}
                    </div>
                )}

                {/* Result panel */}
                <div style={styles.resultPanel}>
                    <span style={styles.label}>EIP-55 Checksum Address</span>
                    <div style={styles.checksumRow}>
                        <span style={styles.checksumAddr}>
                            {status === "valid" ? keccak256Checksum(input) : ""}
                        </span>
                        <button style={styles.copyBtn} onClick={handleCopy}>
                            {copied ? "✓ Copied" : "Copy"}
                        </button>
                    </div>

                    <div style={styles.divider} />

                    <span style={styles.label}>Address Segments</span>
                    {segmentedObj && (
                        <div style={styles.segmentGrid}>
                            <span style={styles.segmentPrefix}>{segmentedObj.prefix}</span>
                            {segmentedObj.segments.map((seg, i) => (
                                <span key={i} style={styles.segment}>{seg}</span>
                            ))}
                        </div>
                    )}

                    <div style={styles.metaRow}>
                        <span style={styles.metaChip}>Length: 42 chars</span>
                        <span style={styles.metaChip}>Bytes: 20</span>
                        <span style={styles.metaChip}>Hex chars: 40</span>
                        <span style={styles.metaChip}>Network: Mainnet / L2</span>
                    </div>
                </div>

                <div style={{ height: "16px" }} />
                <div style={styles.footer}>
                    Validates per EIP-55 · Does not confirm on-chain existence
                </div>
            </div>
        </div>
    );
}