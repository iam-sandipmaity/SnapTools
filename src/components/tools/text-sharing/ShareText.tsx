'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Copy, QrCode, Users, Wifi, AlertCircle, Download, Eye,
  Lock, RefreshCw, Hash, FileText, Maximize2, Minimize2,
  WifiOff, Link2, Settings2, Scissors, MessageSquare,
  Timer, UserX, Search, ZoomIn, ZoomOut, Send, X, ChevronDown,
  ChevronUp, Trash2, ClipboardList, RotateCcw, RotateCw,
  History, Camera, UserCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedElement from '@/components/animated-element';
import Peer, { DataConnection } from 'peerjs';
import { createTextShareLink, copyToClipboard, downloadTextFile, PermissionMode } from '@/lib/peer-text-transfer';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ViewerInfo {
  conn: DataConnection;
  id: string;
  name: string;
  joinedAt: Date;
  authed: boolean;
  color: string;
  lastSeen: Date;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isHost: boolean;
}

interface LogEntry {
  time: string;
  msg: string;
  type: 'info' | 'success' | 'warn';
}

interface Snapshot {
  id: string;
  label: string;
  content: string;
  timestamp: Date;
  charCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const VIEWER_COLORS = [
  'bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500',
  'bg-pink-500','bg-teal-500','bg-red-500','bg-indigo-500',
];

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:a.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:a.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:a.relay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
];

const SYNTAX_LANGUAGES = ['plain','javascript','typescript','python','html','css','json','bash','sql','markdown','rust','go','java','cpp'];

function generateId(len = 8) {
  const length = Math.max(8, Math.min(16, len));
  return Array.from({ length }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

function formatTimer(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatRelTime(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return d.toLocaleTimeString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle
// ─────────────────────────────────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button onClick={onChange}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// StatsBar
// ─────────────────────────────────────────────────────────────────────────────
const StatsBar: React.FC<{ chars: number; words: number; lines: number; viewers: number; lang: string }> = ({ chars, words, lines, viewers, lang }) => (
  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-mono px-1 select-none">
    <span><span className="text-foreground font-semibold">{chars.toLocaleString()}</span> chars</span>
    <span className="opacity-30">·</span>
    <span><span className="text-foreground font-semibold">{words.toLocaleString()}</span> words</span>
    <span className="opacity-30">·</span>
    <span><span className="text-foreground font-semibold">{lines.toLocaleString()}</span> lines</span>
    {lang !== 'plain' && (<><span className="opacity-30">·</span><span className="text-primary font-medium">{lang}</span></>)}
    {viewers > 0 && (
      <><span className="opacity-30">·</span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-600 dark:text-green-400 font-medium">live · {viewers} viewer{viewers !== 1 ? 's' : ''}</span>
      </span></>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Line-numbered editor
// ─────────────────────────────────────────────────────────────────────────────
const LineNumberedEditor: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  fontSize: number;
  showLineNumbers: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  minHeight?: string;
}> = ({ value, onChange, placeholder, fontSize, showLineNumbers, textareaRef, minHeight = '340px' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineCount = Math.max(value.split('\n').length, 1);
  const lineHeight = Math.round(fontSize * 1.6);

  // Sync scroll between line numbers and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="relative flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring">
      {showLineNumbers && (
        <div
          ref={scrollRef}
          className="select-none overflow-hidden text-right border-r border-border bg-muted/30 shrink-0"
          style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`, minWidth: `${String(lineCount).length * 0.65 + 1.5}rem`, padding: '8px 8px 8px 4px' }}
          aria-hidden
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="text-muted-foreground/50">{i + 1}</div>
          ))}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="flex-1 resize-none bg-transparent p-2 font-mono outline-none w-full"
        style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`, minHeight, tabSize: 2 }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Side Panel wrapper
// ─────────────────────────────────────────────────────────────────────────────
const SidePanel: React.FC<{ title: string; onClose: () => void; maxHeight: string; children: React.ReactNode }> = ({ title, onClose, maxHeight, children }) => (
  <div className="w-72 shrink-0 rounded-lg border bg-background flex flex-col overflow-hidden" style={{ maxHeight, minHeight: '200px' }}>
    <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onClose}><X className="h-3 w-3" /></Button>
    </div>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
const TextSharer: React.FC = () => {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [oneTimeLink, setOneTimeLink] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState(13);
  const [language, setLanguage] = useState('plain');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const lastPushedRef = useRef('');

  const [viewers, setViewers] = useState<ViewerInfo[]>([]);
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('read-only');
  const [customId, setCustomId] = useState('');
  const [idLength, setIdLength] = useState(8);
  const [password, setPassword] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [maxViewers, setMaxViewers] = useState(0);
  const [expiryMins, setExpiryMins] = useState(0);
  const [expirySecsLeft, setExpirySecsLeft] = useState(0);
  const [oneTimeEnabled, setOneTimeEnabled] = useState(false);
  const [oneTimeUsed, setOneTimeUsed] = useState(false);

  const [showQR, setShowQR] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePanel, setActivePanel] = useState<'viewers' | 'chat' | 'log' | 'snapshots' | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findMatchCount, setFindMatchCount] = useState(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadChat, setUnreadChat] = useState(0);
  const [connectionLog, setConnectionLog] = useState<LogEntry[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [snapshotLabel, setSnapshotLabel] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const peerIdRef = useRef<string | null>(null);
  const viewersRef = useRef<ViewerInfo[]>([]);
  const permissionRef = useRef<PermissionMode>('read-only');
  const passwordRef = useRef('');
  const passwordEnabledRef = useRef(false);
  const maxViewersRef = useRef(0);
  const oneTimeUsedRef = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const colorCounterRef = useRef(0);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textContentRef = useRef('');
  const languageRef = useRef('plain');
  const activePanelRef = useRef<string | null>(null);

  useEffect(() => { viewersRef.current = viewers; }, [viewers]);
  useEffect(() => { permissionRef.current = permissionMode; }, [permissionMode]);
  useEffect(() => { passwordRef.current = password; }, [password]);
  useEffect(() => { passwordEnabledRef.current = passwordEnabled; }, [passwordEnabled]);
  useEffect(() => { maxViewersRef.current = maxViewers; }, [maxViewers]);
  useEffect(() => { textContentRef.current = textContent; }, [textContent]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { activePanelRef.current = activePanel; }, [activePanel]);

  useEffect(() => {
    if (!findText) { setFindMatchCount(0); return; }
    setFindMatchCount(textContent.split(findText).length - 1);
  }, [findText, textContent]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    if (activePanel === 'chat') setUnreadChat(0);
  }, [activePanel, chatMessages]);

  useEffect(() => {
    return () => {
      peerRef.current?.destroy();
      [updateTimeoutRef, historyTimeoutRef, expiryTimerRef, expiryIntervalRef].forEach(r => {
        if (r.current) clearTimeout(r.current as any);
      });
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!shareLink) return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); }
      if (meta && e.key === 'f') { e.preventDefault(); setFindOpen(v => !v); }
      if (e.key === 'Escape') {
        if (fullscreen) setFullscreen(false);
        else if (findOpen) setFindOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shareLink, fullscreen, findOpen]);

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setConnectionLog(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 100));
  }, []);

  const broadcastAll = useCallback((data: any) => {
    viewersRef.current.filter(v => v.authed && v.conn.open).forEach(v => v.conn.send(data));
  }, []);

  // ── Undo/Redo ─────────────────────────────────────────────────────────────
  const pushHistory = useCallback((content: string) => {
    if (content === lastPushedRef.current) return;
    lastPushedRef.current = content;
    setUndoStack(prev => [...prev.slice(-49), content]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      next.pop();
      const newContent = next.length > 0 ? next[next.length - 1] : '';
      setRedoStack(r => [...r, textContentRef.current]);
      setTextContent(newContent);
      textContentRef.current = newContent;
      lastPushedRef.current = newContent;
      broadcastAll({ type: 'text-update', data: { content: newContent, timestamp: Date.now(), senderId: peerIdRef.current } });
      return next;
    });
  }, [broadcastAll]);

  const handleRedo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const entry = next.pop()!;
      setUndoStack(u => [...u, textContentRef.current]);
      setTextContent(entry);
      textContentRef.current = entry;
      lastPushedRef.current = entry;
      broadcastAll({ type: 'text-update', data: { content: entry, timestamp: Date.now(), senderId: peerIdRef.current } });
      return next;
    });
  }, [broadcastAll]);

  // ── Init session ──────────────────────────────────────────────────────────
  const initializeSharing = async () => {
    setIsInitializing(true);
    try {
      const pid = customId || generateId(idLength);
      const newPeer = await new Promise<Peer>((resolve, reject) => {
        const p = new Peer(pid, { config: { iceServers: ICE_SERVERS } });
        p.on('open', () => resolve(p));
        p.on('error', reject);
        setTimeout(() => reject(new Error('timeout')), 15000);
      });

      peerRef.current = newPeer;
      setPeerId(pid);
      peerIdRef.current = pid;
      const link = createTextShareLink(pid);
      setShareLink(link);
      if (oneTimeEnabled) setOneTimeLink(`${link}?ot=1`);
      addLog(`Session started · ID: ${pid}`, 'success');

      if (expiryMins > 0) {
        const totalSecs = expiryMins * 60;
        setExpirySecsLeft(totalSecs);
        expiryIntervalRef.current = setInterval(() => {
          setExpirySecsLeft(prev => { if (prev <= 1) { clearInterval(expiryIntervalRef.current!); return 0; } return prev - 1; });
        }, 1000) as unknown as NodeJS.Timeout;
        expiryTimerRef.current = setTimeout(() => {
          toast.warning('Session expired!');
          viewersRef.current.forEach(v => { v.conn.send({ type: 'session-expired', data: {} }); setTimeout(() => v.conn.close(), 300); });
          newPeer.destroy();
          setShareLink(null); setPeerId(null); setViewers([]);
          addLog('Session expired', 'warn');
        }, totalSecs * 1000);
      }

      newPeer.on('connection', (conn) => {
        // One-time check
        if (oneTimeEnabled && oneTimeUsedRef.current) {
          conn.on('open', () => { conn.send({ type: 'rejected', data: { reason: 'This one-time link has already been used.' } }); setTimeout(() => conn.close(), 500); });
          return;
        }
        // Max viewers
        if (maxViewersRef.current > 0 && viewersRef.current.filter(v => v.authed).length >= maxViewersRef.current) {
          conn.on('open', () => { conn.send({ type: 'rejected', data: { reason: 'Session is full.' } }); setTimeout(() => conn.close(), 500); });
          addLog('Rejected: session full', 'warn');
          return;
        }

        const color = VIEWER_COLORS[colorCounterRef.current % VIEWER_COLORS.length];
        colorCounterRef.current++;
        const info: ViewerInfo = {
          conn, id: conn.peer, name: `Viewer ${colorCounterRef.current}`,
          joinedAt: new Date(), authed: !passwordEnabledRef.current,
          color, lastSeen: new Date(),
        };

        conn.on('open', () => {
          if (passwordEnabledRef.current) {
            conn.send({ type: 'auth-required', data: {} });
            setViewers(prev => { const u = [...prev, info]; viewersRef.current = u; return u; });
            addLog(`Auth challenge → ${info.name}`, 'info');
          } else {
            provisionViewer(info);
          }

          conn.on('data', (data: any) => {
            info.lastSeen = new Date();
            setViewers(prev => prev.map(v => v.id === conn.peer ? { ...v, lastSeen: new Date() } : v));

            switch (data.type) {
              case 'auth-response':
                if (data.data.password === passwordRef.current) {
                  info.authed = true;
                  conn.send({ type: 'auth-success', data: {} });
                  provisionViewer(info);
                  if (oneTimeEnabled) { oneTimeUsedRef.current = true; setOneTimeUsed(true); addLog('One-time link consumed', 'info'); }
                } else {
                  conn.send({ type: 'auth-failed', data: {} });
                  addLog(`${info.name} failed auth`, 'warn');
                  conn.close();
                }
                break;

              case 'viewer-name':
                const newName = String(data.data.name).slice(0, 30);
                info.name = newName;
                setViewers(prev => prev.map(v => v.id === conn.peer ? { ...v, name: newName } : v));
                addLog(`Renamed → ${newName}`, 'info');
                break;

              case 'text-update':
                if (!info.authed || permissionRef.current !== 'read-write') return;
                if (data.data.senderId !== peerIdRef.current) {
                  const c = data.data.content;
                  pushHistory(textContentRef.current);
                  setTextContent(c); textContentRef.current = c;
                  viewersRef.current.filter(v => v.id !== conn.peer && v.authed && v.conn.open).forEach(v => v.conn.send(data));
                }
                break;

              case 'chat':
                if (!info.authed) return;
                const msg: ChatMessage = { ...data.data, senderName: info.name, senderId: conn.peer, timestamp: new Date(data.data.timestamp), isHost: false };
                setChatMessages(prev => [...prev, msg]);
                setUnreadChat(prev => activePanelRef.current !== 'chat' ? prev + 1 : 0);
                viewersRef.current.filter(v => v.id !== conn.peer && v.authed && v.conn.open).forEach(v => v.conn.send({ type: 'chat', data: msg }));
                break;
            }
          });
        });

        conn.on('close', () => {
          setViewers(prev => { const u = prev.filter(v => v.id !== conn.peer); viewersRef.current = u; return u; });
          addLog(`${info.name} disconnected`, 'warn');
          toast.info(`${info.name} left`);
          setChatMessages(prev => [...prev, { id: Date.now().toString(), senderId: 'system', senderName: 'System', text: `${info.name} left`, timestamp: new Date(), isHost: false }]);
        });

        conn.on('error', err => addLog(`${info.name} error: ${err.message}`, 'warn'));
      });

      newPeer.on('error', err => addLog(`Peer error: ${err.message}`, 'warn'));
      toast.success('Session started!');
    } catch (e: any) {
      addLog(`Init failed: ${e?.message}`, 'warn');
      toast.error('Failed to start session');
    } finally {
      setIsInitializing(false);
    }
  };

  const provisionViewer = (info: ViewerInfo) => {
    if (!info.authed) info.authed = true;
    info.conn.send({ type: 'permission', data: { mode: permissionRef.current } });
    info.conn.send({ type: 'language', data: { language: languageRef.current } });
    info.conn.send({ type: 'text-update', data: { content: textContentRef.current, timestamp: Date.now(), senderId: peerIdRef.current } });
    setViewers(prev => {
      const exists = prev.find(v => v.id === info.id);
      const updated = exists ? prev.map(v => v.id === info.id ? { ...v, authed: true } : v) : [...prev, info];
      viewersRef.current = updated;
      return updated;
    });
    toast.success(`${info.name} joined!`);
    addLog(`${info.name} connected`, 'success');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextContent(val); textContentRef.current = val;
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => pushHistory(val), 800);
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      broadcastAll({ type: 'text-update', data: { content: val, timestamp: Date.now(), senderId: peerIdRef.current } });
    }, 80);
  };

  const handlePermissionChange = (mode: PermissionMode) => {
    setPermissionMode(mode); permissionRef.current = mode;
    broadcastAll({ type: 'permission', data: { mode } });
    addLog(`Mode → ${mode}`, 'info');
    toast.success(mode === 'read-only' ? 'Switched to Read-Only' : 'Switched to Collaborative');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang); languageRef.current = lang;
    broadcastAll({ type: 'language', data: { language: lang } });
  };

  const handleReplace = (all: boolean) => {
    if (!findText) return;
    pushHistory(textContent);
    const updated = all
      ? textContent.split(findText).join(replaceText)
      : (() => { const i = textContent.indexOf(findText); if (i === -1) { toast.error('Not found'); return textContent; } return textContent.slice(0, i) + replaceText + textContent.slice(i + findText.length); })();
    setTextContent(updated); textContentRef.current = updated;
    broadcastAll({ type: 'text-update', data: { content: updated, timestamp: Date.now(), senderId: peerIdRef.current } });
    if (all) toast.success(`Replaced ${findMatchCount} occurrences`);
  };

  const handleFormat = (type: 'upper' | 'lower' | 'trim' | 'clear') => {
    pushHistory(textContent);
    const t = type === 'upper' ? textContent.toUpperCase() : type === 'lower' ? textContent.toLowerCase() :
      type === 'trim' ? textContent.split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n') : '';
    setTextContent(t); textContentRef.current = t;
    broadcastAll({ type: 'text-update', data: { content: t, timestamp: Date.now(), senderId: peerIdRef.current } });
  };

  const handleCopy = async (format: 'plain' | 'html' | 'markdown') => {
    let c = textContent;
    if (format === 'html') c = `<pre><code class="language-${language}">${textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    if (format === 'markdown') c = `\`\`\`${language === 'plain' ? '' : language}\n${textContent}\n\`\`\``;
    const ok = await copyToClipboard(c);
    toast[ok ? 'success' : 'error'](ok ? `Copied as ${format}!` : 'Copy failed');
  };

  const takeSnapshot = () => {
    if (!textContent) { toast.error('Nothing to snapshot'); return; }
    const snap: Snapshot = { id: Date.now().toString(), label: snapshotLabel || `Snapshot ${snapshots.length + 1}`, content: textContent, timestamp: new Date(), charCount: textContent.length };
    setSnapshots(prev => [snap, ...prev].slice(0, 20));
    setSnapshotLabel('');
    toast.success(`Saved: ${snap.label}`);
  };

  const restoreSnapshot = (snap: Snapshot) => {
    pushHistory(textContent);
    setTextContent(snap.content); textContentRef.current = snap.content;
    broadcastAll({ type: 'text-update', data: { content: snap.content, timestamp: Date.now(), senderId: peerIdRef.current } });
    toast.success(`Restored: ${snap.label}`);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), senderId: peerIdRef.current || 'host', senderName: 'Host (You)', text: chatInput.trim(), timestamp: new Date(), isHost: true };
    setChatMessages(prev => [...prev, msg]);
    broadcastAll({ type: 'chat', data: { ...msg, timestamp: msg.timestamp.getTime() } });
    setChatInput('');
  };

  const kickViewer = (id: string) => {
    const v = viewersRef.current.find(x => x.id === id);
    if (!v) return;
    v.conn.send({ type: 'kicked', data: {} });
    setTimeout(() => v.conn.close(), 200);
    addLog(`Kicked ${v.name}`, 'warn');
    toast.info(`Kicked ${v.name}`);
  };

  const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const lineCount = textContent ? textContent.split('\n').length : 0;
  const authedViewers = viewers.filter(v => v.authed);
  const panelMaxHeight = fullscreen ? 'calc(100vh - 300px)' : '460px';

  // ── Shared session UI ─────────────────────────────────────────────────────
  const sessionUI = (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={permissionMode === 'read-only' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => handlePermissionChange('read-only')}>
          <Eye className="h-3 w-3 mr-1" /> Read-Only
        </Button>
        <Button size="sm" variant={permissionMode === 'read-write' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => handlePermissionChange('read-write')}>
          <Users className="h-3 w-3 mr-1" /> Collaborative
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <select value={language} onChange={e => handleLanguageChange(e.target.value)}
          className="h-7 rounded-md border border-input bg-background px-2 text-xs font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring">
          {SYNTAX_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <div className="h-4 w-px bg-border mx-1" />
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFontSize(s => Math.max(10, s - 1))}><ZoomOut className="h-3.5 w-3.5" /></Button>
        <span className="text-xs font-mono text-muted-foreground w-6 text-center select-none">{fontSize}</span>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFontSize(s => Math.min(24, s + 1))}><ZoomIn className="h-3.5 w-3.5" /></Button>
        <button onClick={() => setShowLineNumbers(v => !v)}
          className={`h-7 px-2 rounded-md text-xs border transition-colors ${showLineNumbers ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-muted-foreground hover:bg-muted'}`}>
          #
        </button>

        <div className="ml-auto flex gap-1.5 flex-wrap items-center">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleUndo} disabled={undoStack.length === 0} title="Undo (⌘Z)"><RotateCcw className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleRedo} disabled={redoStack.length === 0} title="Redo (⌘⇧Z)"><RotateCw className="h-3.5 w-3.5" /></Button>
          <div className="h-4 w-px bg-border mx-0.5" />
          {(['viewers', 'chat', 'log', 'snapshots'] as const).map(panel => {
            const icons = { viewers: <Users className="h-3 w-3" />, chat: <MessageSquare className="h-3 w-3" />, log: <ClipboardList className="h-3 w-3" />, snapshots: <History className="h-3 w-3" /> };
            const count = { viewers: authedViewers.length, chat: unreadChat, log: 0, snapshots: snapshots.length };
            return (
              <Button key={panel} variant={activePanel === panel ? 'default' : 'outline'} size="sm"
                className="h-7 text-xs gap-1 relative capitalize"
                onClick={() => setActivePanel(p => p === panel ? null : panel)}>
                {icons[panel]} {panel}
                {count[panel] > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold ${panel === 'chat' && unreadChat > 0 ? 'bg-red-500' : 'bg-primary'}`}>
                    {count[panel]}
                  </span>
                )}
              </Button>
            );
          })}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFullscreen(v => !v)} title="Fullscreen (Esc to exit)">
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border bg-muted/30">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => setFindOpen(v => !v)}><Search className="h-3 w-3" /> Find</Button>
        <div className="h-4 w-px bg-border mx-0.5" />
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handleCopy('plain')} disabled={!textContent}><Copy className="h-3 w-3" /> Copy</Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleCopy('markdown')} disabled={!textContent}>MD</Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleCopy('html')} disabled={!textContent}>HTML</Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1"
          onClick={() => { downloadTextFile(textContent, `session.${language === 'plain' ? 'txt' : language}`); toast.success('Saved!'); }} disabled={!textContent}>
          <Download className="h-3 w-3" /> Save
        </Button>
        <div className="h-4 w-px bg-border mx-0.5" />
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleFormat('upper')} disabled={!textContent}>AA</Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleFormat('lower')} disabled={!textContent}>aa</Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handleFormat('trim')} disabled={!textContent}><Scissors className="h-3 w-3" />Trim</Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive ml-auto" onClick={() => handleFormat('clear')} disabled={!textContent}>
          <Trash2 className="h-3 w-3" />Clear
        </Button>
      </div>

      {/* Find & Replace */}
      {findOpen && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20 items-center">
          <div className="relative">
            <Input className="h-7 text-xs w-44 pr-10" placeholder="Find…" value={findText} onChange={e => setFindText(e.target.value)} />
            {findMatchCount > 0 && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">{findMatchCount}</span>}
          </div>
          <Input className="h-7 text-xs w-44" placeholder="Replace with…" value={replaceText} onChange={e => setReplaceText(e.target.value)} />
          <Button size="sm" className="h-7 text-xs" onClick={() => handleReplace(false)} disabled={!findText}>Replace</Button>
          <Button size="sm" className="h-7 text-xs" variant="outline" onClick={() => handleReplace(true)} disabled={!findText || findMatchCount === 0}>All ({findMatchCount})</Button>
          <Button size="sm" className="h-7 w-7 p-0" variant="ghost" onClick={() => setFindOpen(false)}><X className="h-3.5 w-3.5" /></Button>
        </div>
      )}

      {/* Editor + panel */}
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-2">
          <LineNumberedEditor value={textContent} onChange={handleTextChange}
            placeholder="Start typing… viewers see updates in real-time."
            fontSize={fontSize} showLineNumbers={showLineNumbers} textareaRef={textareaRef}
            minHeight={fullscreen ? 'calc(100vh - 380px)' : '340px'} />
          <StatsBar chars={textContent.length} words={words} lines={lineCount} viewers={authedViewers.length} lang={language} />
        </div>

        {activePanel && (
          <SidePanel title={activePanel} onClose={() => setActivePanel(null)} maxHeight={panelMaxHeight}>
            {/* Viewers */}
            {activePanel === 'viewers' && (
              <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                {authedViewers.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No viewers connected</p>}
                {authedViewers.map(v => (
                  <div key={v.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/40 group">
                    <span className={`h-7 w-7 rounded-full ${v.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{v.name.charAt(0).toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatRelTime(v.lastSeen)}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0" onClick={() => kickViewer(v.id)}>
                      <UserX className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {viewers.filter(v => !v.authed).length > 0 && (
                  <div className="border-t pt-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1">Awaiting auth</p>
                    {viewers.filter(v => !v.authed).map(v => (
                      <div key={v.id} className="flex items-center gap-2 p-2 opacity-50">
                        <Lock className="h-3.5 w-3.5" /><span className="text-xs">Pending…</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat */}
            {activePanel === 'chat' && (
              <>
                <div ref={chatScrollRef} className="overflow-y-auto flex-1 p-2 space-y-2">
                  {chatMessages.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No messages</p>}
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={msg.senderId === 'system' ? 'text-center' : 'space-y-0.5'}>
                      {msg.senderId === 'system'
                        ? <p className="text-[10px] text-muted-foreground italic">{msg.text}</p>
                        : <><p className={`text-[10px] font-semibold ${msg.isHost ? 'text-primary' : ''}`}>{msg.senderName}</p>
                          <div className={`text-xs rounded-lg px-2.5 py-1.5 break-words ${msg.isHost ? 'bg-primary text-primary-foreground ml-4' : 'bg-muted mr-4'}`}>{msg.text}</div>
                          <p className="text-[9px] text-muted-foreground">{msg.timestamp.toLocaleTimeString()}</p></>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5 p-2 border-t shrink-0">
                  <Input className="h-7 text-xs" placeholder="Message…" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} />
                  <Button size="sm" className="h-7 w-7 p-0 shrink-0" onClick={sendChat} disabled={!chatInput.trim()}><Send className="h-3 w-3" /></Button>
                </div>
              </>
            )}

            {/* Log */}
            {activePanel === 'log' && (
              <div className="overflow-y-auto flex-1 p-2 space-y-0.5 font-mono text-[10px]">
                {connectionLog.length === 0 && <p className="text-muted-foreground text-center py-8 italic">No events</p>}
                {connectionLog.map((l, i) => (
                  <div key={i} className={`flex gap-2 ${l.type === 'success' ? 'text-green-600 dark:text-green-400' : l.type === 'warn' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                    <span className="opacity-50 shrink-0">{l.time}</span><span className="break-all">{l.msg}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Snapshots */}
            {activePanel === 'snapshots' && (
              <>
                <div className="p-2 border-b space-y-1.5 shrink-0">
                  <div className="flex gap-1.5">
                    <Input className="h-7 text-xs flex-1" placeholder="Label (optional)" value={snapshotLabel}
                      onChange={e => setSnapshotLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && takeSnapshot()} />
                    <Button size="sm" className="h-7 gap-1 px-2 shrink-0" onClick={takeSnapshot} disabled={!textContent}><Camera className="h-3 w-3" />Save</Button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                  {snapshots.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No snapshots yet</p>}
                  {snapshots.map(snap => (
                    <div key={snap.id} className="rounded-md border p-2 space-y-1 hover:bg-muted/30 group">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-medium truncate flex-1">{snap.label}</p>
                        <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => restoreSnapshot(snap)}>Restore</Button>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{snap.charCount.toLocaleString()} chars</span>
                        <span>{snap.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SidePanel>
        )}
      </div>

      {/* Share section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" />Share Link</p>
          {passwordEnabled && <Badge variant="outline" className="text-xs gap-1"><Lock className="h-2.5 w-2.5" />Password</Badge>}
          {maxViewers > 0 && <Badge variant="outline" className="text-xs gap-1"><Users className="h-2.5 w-2.5" />Max {maxViewers}</Badge>}
          {expiryMins > 0 && expirySecsLeft > 0 && <Badge variant="outline" className="text-xs gap-1 font-mono border-amber-500/50 text-amber-600 dark:text-amber-400"><Timer className="h-2.5 w-2.5" />{formatTimer(expirySecsLeft)}</Badge>}
          {oneTimeEnabled && <Badge variant="outline" className={`text-xs gap-1 ${oneTimeUsed ? 'line-through text-muted-foreground' : 'border-purple-500/50 text-purple-600 dark:text-purple-400'}`}>⚡ One-time {oneTimeUsed ? '(used)' : ''}</Badge>}
        </div>
        <div className="flex gap-2">
          <Input value={shareLink!} readOnly className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={async () => { const ok = await copyToClipboard(shareLink!); toast[ok ? 'success' : 'error'](ok ? 'Copied!' : 'Failed'); }}><Copy className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setShowQR(v => !v)}><QrCode className="h-4 w-4" /></Button>
        </div>
        {oneTimeLink && !oneTimeUsed && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><span className="text-purple-500">⚡</span>One-time link (expires after first use)</p>
            <div className="flex gap-2">
              <Input value={oneTimeLink} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={async () => { const ok = await copyToClipboard(oneTimeLink); toast[ok ? 'success' : 'error'](ok ? 'Copied!' : 'Failed'); }}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Keep this tab open. <strong className="text-amber-600 dark:text-amber-400">Closing it ends the session.</strong></p>
      </div>

      {showQR && (
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border w-fit mx-auto">
          <QRCodeSVG value={shareLink!} size={180} level="H" includeMargin />
          <p className="text-xs text-gray-500">Scan to join on mobile</p>
        </div>
      )}
    </div>
  );

  // ── Fullscreen render ─────────────────────────────────────────────────────
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="p-4 max-w-7xl mx-auto h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">Real-Time Text Sharing</span>
              {expirySecsLeft > 0 && <Badge variant="outline" className="font-mono border-amber-500/50 text-amber-600 dark:text-amber-400"><Timer className="h-3 w-3 mr-1" />{formatTimer(expirySecsLeft)}</Badge>}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${authedViewers.length > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30' : 'bg-muted text-muted-foreground border-border'}`}>
                {authedViewers.length > 0 ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {authedViewers.length > 0 ? `${authedViewers.length} viewer${authedViewers.length !== 1 ? 's' : ''}` : 'Waiting…'}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setFullscreen(false)} className="gap-1.5">
              <Minimize2 className="h-4 w-4" /> Exit Fullscreen <span className="text-muted-foreground text-xs">(Esc)</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto">{sessionUI}</div>
        </div>
      </div>
    );
  }

  // ── Normal render ─────────────────────────────────────────────────────────
  return (
    <AnimatedElement>
      <Card className="border-2 max-w-5xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Real-Time Text Sharing
              </CardTitle>
              <CardDescription className="mt-0.5">Peer-to-peer — your content never touches a server</CardDescription>
            </div>
            {shareLink && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${authedViewers.length > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30' : 'bg-muted text-muted-foreground border-border'}`}>
                {authedViewers.length > 0 ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {authedViewers.length > 0 ? `${authedViewers.length} viewer${authedViewers.length !== 1 ? 's' : ''}` : 'Waiting…'}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          {!shareLink ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-300 space-y-0.5">
                    <p className="font-semibold text-amber-900 dark:text-amber-200">Before you start</p>
                    <p>Keep this tab open. Works on home Wi-Fi; corporate/university networks may block P2P — try mobile hotspot if needed.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 overflow-hidden">
                <button className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors" onClick={() => setShowAdvanced(v => !v)}>
                  <Settings2 className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Session Settings</span>
                  <span className="ml-auto">{showAdvanced ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</span>
                </button>
                {showAdvanced && (
                  <div className="px-4 pb-4 space-y-5 border-t">
                    <div className="space-y-1.5 pt-4">
                      <label className="text-sm font-medium flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />Custom Session ID</label>
                      <Input placeholder="Letters, numbers, hyphens only" value={customId} onChange={e => setCustomId(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))} maxLength={20} className="font-mono" />
                      {!customId && (
                        <div className="pt-1 space-y-1.5">
                          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Auto-ID length</span><Badge variant="secondary" className="font-mono">{idLength} chars</Badge></div>
                          <input type="range" min="8" max="16" value={idLength} onChange={e => setIdLength(+e.target.value)} className="w-full accent-primary" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" />Password Protection</label>
                        <Toggle checked={passwordEnabled} onChange={() => setPasswordEnabled(v => !v)} />
                      </div>
                      {passwordEnabled && <Input type="password" placeholder="Session password" value={password} onChange={e => setPassword(e.target.value)} />}
                      <p className="text-xs text-muted-foreground">Viewers must enter this password before receiving any content.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-1.5"><span className="text-purple-500">⚡</span>One-Time View Link</label>
                        <Toggle checked={oneTimeEnabled} onChange={() => setOneTimeEnabled(v => !v)} />
                      </div>
                      <p className="text-xs text-muted-foreground">Generates a special link that self-destructs after the first viewer connects.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Max Viewers</label>
                        <Badge variant="secondary">{maxViewers === 0 ? 'Unlimited' : maxViewers}</Badge>
                      </div>
                      <input type="range" min="0" max="20" value={maxViewers} onChange={e => setMaxViewers(+e.target.value)} className="w-full accent-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" />Session Expiry</label>
                        <Badge variant="secondary">{expiryMins === 0 ? 'Never' : `${expiryMins}m`}</Badge>
                      </div>
                      <input type="range" min="0" max="120" step="5" value={expiryMins} onChange={e => setExpiryMins(+e.target.value)} className="w-full accent-primary" />
                      <p className="text-xs text-muted-foreground">Auto-closes and disconnects all viewers.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Access Mode</label>
                      <div className="flex gap-2">
                        <Button size="sm" variant={permissionMode === 'read-only' ? 'default' : 'outline'} onClick={() => setPermissionMode('read-only')}><Eye className="h-3.5 w-3.5 mr-1.5" />Read-Only</Button>
                        <Button size="sm" variant={permissionMode === 'read-write' ? 'default' : 'outline'} onClick={() => setPermissionMode('read-write')}><Users className="h-3.5 w-3.5 mr-1.5" />Collaborative</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center py-4">
                <Button onClick={initializeSharing} disabled={isInitializing} size="lg" className="px-10">
                  {isInitializing ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Initializing…</> : <><Wifi className="h-4 w-4 mr-2" />Start Sharing Session</>}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">Generates a unique link to share with anyone</p>
              </div>
            </div>
          ) : sessionUI}
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default TextSharer;