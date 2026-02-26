'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Download, Loader2, AlertCircle, Copy, Wifi, WifiOff,
  Edit3, Eye, Users, RefreshCw, Lock, FileText, Search,
  ZoomIn, ZoomOut, Send, MessageSquare, X, Scissors,
  CheckCircle2, ShieldAlert, UserCheck, Maximize2, Minimize2,
  RotateCcw, RotateCw, History
} from 'lucide-react';
import Peer from 'peerjs';
import { copyToClipboard, downloadTextFile, PermissionMode } from '@/lib/peer-text-transfer';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type ConnectionStatus = 'connecting' | 'connected' | 'receiving' | 'disconnected' | 'error' | 'auth' | 'kicked' | 'expired' | 'rejected';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isHost: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:a.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:a.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:a.relay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
];

function generateId(len = 8) {
  return Array.from({ length: len }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// StatsBar
// ─────────────────────────────────────────────────────────────────────────────
const StatsBar: React.FC<{ chars: number; words: number; lines: number; live: boolean }> = ({ chars, words, lines, live }) => (
  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-mono px-1 select-none">
    <span><span className="text-foreground font-semibold">{chars.toLocaleString()}</span> chars</span>
    <span className="opacity-30">·</span>
    <span><span className="text-foreground font-semibold">{words.toLocaleString()}</span> words</span>
    <span className="opacity-30">·</span>
    <span><span className="text-foreground font-semibold">{lines.toLocaleString()}</span> lines</span>
    {live && (
      <><span className="opacity-30">·</span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-600 dark:text-green-400 font-medium">live</span>
      </span></>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Line-numbered editor (viewer version)
// ─────────────────────────────────────────────────────────────────────────────
const LineNumberedEditor: React.FC<{
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
  placeholder?: string;
  fontSize: number;
  showLineNumbers: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  minHeight?: string;
  isEditable?: boolean;
}> = ({ value, onChange, readOnly, placeholder, fontSize, showLineNumbers, textareaRef, minHeight = '400px', isEditable }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineCount = Math.max(value.split('\n').length, 1);
  const lineHeight = Math.round(fontSize * 1.6);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (scrollRef.current) scrollRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  return (
    <div className={`relative flex rounded-md border overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring transition-colors ${isEditable ? 'border-primary/40' : 'border-input'}`}>
      {showLineNumbers && (
        <div ref={scrollRef}
          className="select-none overflow-hidden text-right border-r border-border bg-muted/30 shrink-0"
          style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`, minWidth: `${String(lineCount).length * 0.65 + 1.5}rem`, padding: '8px 8px 8px 4px' }}
          aria-hidden>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="text-muted-foreground/50">{i + 1}</div>
          ))}
        </div>
      )}
      <textarea ref={textareaRef} value={value} onChange={onChange} onScroll={handleScroll}
        readOnly={readOnly} placeholder={placeholder} spellCheck={false}
        autoCorrect="off" autoCapitalize="off"
        className={`flex-1 resize-none bg-transparent p-2 font-mono outline-none w-full ${readOnly ? 'cursor-default' : ''}`}
        style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`, minHeight, tabSize: 2 }}
      />
      {isEditable && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <Badge className="gap-1 bg-primary/80 backdrop-blur-sm text-xs"><Edit3 className="h-2.5 w-2.5" />Live</Badge>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
const ShareTextView: React.FC = () => {
  const { peerId: hostPeerId } = useParams<{ peerId: string }>();
  const [searchParams] = useSearchParams();
  const isOneTime = searchParams.get('ot') === '1';

  // Connection
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryIn, setRetryIn] = useState(0);
  const [rejectedReason, setRejectedReason] = useState('');

  // Content
  const [textContent, setTextContent] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('read-only');
  const [language, setLanguage] = useState('plain');
  const [fontSize, setFontSize] = useState(13);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Local undo/redo (for collaborative mode)
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const lastPushedRef = useRef('');

  // Auth
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [viewerName, setViewerName] = useState('');
  const [nameSet, setNameSet] = useState(false);

  // Find
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findMatchCount, setFindMatchCount] = useState(0);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const myPeerIdRef = useRef<string | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<any>(null);
  const permissionRef = useRef<PermissionMode>('read-only');
  const mountedRef = useRef(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const viewerNameRef = useRef('');
  const textContentRef = useRef('');
  const chatOpenRef = useRef(false);

  useEffect(() => { permissionRef.current = permissionMode; }, [permissionMode]);
  useEffect(() => { viewerNameRef.current = viewerName; }, [viewerName]);
  useEffect(() => { textContentRef.current = textContent; }, [textContent]);
  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);

  useEffect(() => {
    if (!findText) { setFindMatchCount(0); return; }
    setFindMatchCount(textContent.split(findText).length - 1);
  }, [findText, textContent]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    if (chatOpen) setUnreadChat(0);
  }, [chatOpen, chatMessages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (permissionRef.current === 'read-write') {
        if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
        if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); }
        if (meta && e.key === 'f') { e.preventDefault(); setFindOpen(v => !v); }
      }
      if (e.key === 'Escape') {
        if (fullscreen) setFullscreen(false);
        else if (findOpen) setFindOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen, findOpen]);

  const cleanup = useCallback(() => {
    [updateTimeoutRef, retryTimerRef, countdownRef, historyTimeoutRef].forEach(r => {
      if (r.current) clearTimeout(r.current as any);
    });
    connRef.current?.close();
    peerRef.current?.destroy();
    connRef.current = null;
    peerRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; cleanup(); };
  }, [cleanup]);

  const scheduleRetry = useCallback((attempt: number) => {
    const delay = Math.min(3000 * Math.pow(1.5, attempt), 20000);
    const delaySecs = Math.ceil(delay / 1000);
    if (!mountedRef.current) return;
    setRetryIn(delaySecs);
    countdownRef.current = setInterval(() => {
      setRetryIn(prev => { if (prev <= 1) { clearInterval(countdownRef.current!); return 0; } return prev - 1; });
    }, 1000) as unknown as NodeJS.Timeout;
    retryTimerRef.current = setTimeout(() => { if (mountedRef.current) connect(attempt + 1); }, delay);
  }, []);

  const connect = useCallback(async (attempt = 0) => {
    if (!hostPeerId || !mountedRef.current) return;
    connRef.current?.close();
    peerRef.current?.destroy();
    connRef.current = null;
    if (!mountedRef.current) return;
    setStatus('connecting');
    setRetryCount(attempt);

    try {
      const newPeer = await new Promise<Peer>((resolve, reject) => {
        const p = new Peer(generateId(8), { config: { iceServers: ICE_SERVERS } });
        p.on('open', () => resolve(p));
        p.on('error', reject);
        setTimeout(() => reject(new Error('Peer init timeout')), 15000);
      });
      if (!mountedRef.current) { newPeer.destroy(); return; }
      peerRef.current = newPeer;
      myPeerIdRef.current = newPeer.id!;

      const conn = newPeer.connect(hostPeerId, { reliable: true });
      connRef.current = conn;

      const openTimeout = setTimeout(() => {
        if (conn.open) return;
        conn.close(); newPeer.destroy();
        if (!mountedRef.current) return;
        setError('Connection timed out. The host may be offline or behind a firewall.');
        setStatus('error');
        scheduleRetry(attempt);
      }, 20000);

      conn.on('open', () => {
        clearTimeout(openTimeout);
        if (!mountedRef.current) return;
        setStatus('connected');
        setRetryCount(0);
        if (viewerNameRef.current) conn.send({ type: 'viewer-name', data: { name: viewerNameRef.current } });
        toast.success('Connected to host!');

        conn.on('data', (data: any) => {
          if (!mountedRef.current) return;
          switch (data.type) {
            case 'auth-required':
              setStatus('auth');
              break;
            case 'auth-failed':
              setAuthError('Incorrect password — please try again.');
              break;
            case 'auth-success':
              setAuthError('');
              setStatus('connected');
              toast.success('Authenticated!');
              break;
            case 'rejected':
              setRejectedReason(data.data?.reason || 'Connection rejected by host.');
              setStatus('rejected');
              break;
            case 'kicked':
              setStatus('kicked');
              toast.error('You were removed from the session.');
              break;
            case 'session-expired':
              setStatus('expired');
              toast.warning('Session expired.');
              break;
            case 'permission':
              setPermissionMode(data.data.mode);
              permissionRef.current = data.data.mode;
              toast.info(data.data.mode === 'read-only' ? '👁️ Read-Only mode' : '✏️ Collaborative mode');
              break;
            case 'language':
              setLanguage(data.data.language || 'plain');
              break;
            case 'text-update': {
              const update = data.data;
              if (update.senderId !== myPeerIdRef.current) {
                // Push to local undo before overwriting
                if (textContentRef.current !== update.content) {
                  pushHistory(textContentRef.current);
                }
                setTextContent(update.content);
                textContentRef.current = update.content;
                setLastUpdate(new Date(update.timestamp));
                setStatus('receiving');
              }
              break;
            }
            case 'chat': {
              const msg: ChatMessage = { ...data.data, timestamp: new Date(data.data.timestamp) };
              setChatMessages(prev => [...prev, msg]);
              if (!chatOpenRef.current) {
                setUnreadChat(prev => prev + 1);
                toast.info(`${msg.senderName}: ${msg.text.slice(0, 50)}…`, { icon: <MessageSquare className="h-4 w-4" /> });
              }
              break;
            }
          }
        });
      });

      conn.on('close', () => {
        if (!mountedRef.current) return;
        const s = status;
        if (s !== 'kicked' && s !== 'expired' && s !== 'rejected') setStatus('disconnected');
        toast.info('Host disconnected');
      });

      conn.on('error', err => {
        clearTimeout(openTimeout);
        if (!mountedRef.current) return;
        setError(`Connection error: ${err.message}`);
        setStatus('error');
        scheduleRetry(attempt);
      });

      newPeer.on('error', err => {
        clearTimeout(openTimeout);
        if (!mountedRef.current) return;
        setError(`Peer error: ${err.message}`);
        setStatus('error');
        scheduleRetry(attempt);
      });
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(`Init failed: ${err?.message}`);
      setStatus('error');
      scheduleRetry(attempt);
    }
  }, [hostPeerId, scheduleRetry]);

  useEffect(() => {
    if (!hostPeerId) { setError('Invalid share link — missing host ID.'); setStatus('error'); return; }
    connect(0);
  }, [hostPeerId, connect]);

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
      setTextContent(newContent); textContentRef.current = newContent; lastPushedRef.current = newContent;
      if (connRef.current?.open && permissionRef.current === 'read-write')
        connRef.current.send({ type: 'text-update', data: { content: newContent, timestamp: Date.now(), senderId: myPeerIdRef.current } });
      return next;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const entry = next.pop()!;
      setUndoStack(u => [...u, textContentRef.current]);
      setTextContent(entry); textContentRef.current = entry; lastPushedRef.current = entry;
      if (connRef.current?.open && permissionRef.current === 'read-write')
        connRef.current.send({ type: 'text-update', data: { content: entry, timestamp: Date.now(), senderId: myPeerIdRef.current } });
      return next;
    });
  }, []);

  // ── Text change ───────────────────────────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextContent(val); textContentRef.current = val;
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => pushHistory(val), 800);
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      if (connRef.current?.open && permissionRef.current === 'read-write')
        connRef.current.send({ type: 'text-update', data: { content: val, timestamp: Date.now(), senderId: myPeerIdRef.current } });
    }, 80);
  };

  // ── Format ────────────────────────────────────────────────────────────────
  const handleFormat = (type: 'upper' | 'lower' | 'trim') => {
    pushHistory(textContent);
    const t = type === 'upper' ? textContent.toUpperCase() : type === 'lower' ? textContent.toLowerCase()
      : textContent.split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n');
    setTextContent(t); textContentRef.current = t;
    if (connRef.current?.open && permissionRef.current === 'read-write')
      connRef.current.send({ type: 'text-update', data: { content: t, timestamp: Date.now(), senderId: myPeerIdRef.current } });
  };

  // ── Copy variants ─────────────────────────────────────────────────────────
  const handleCopy = async (format: 'plain' | 'html' | 'markdown') => {
    let c = textContent;
    if (format === 'html') c = `<pre><code class="language-${language}">${textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    if (format === 'markdown') c = `\`\`\`${language === 'plain' ? '' : language}\n${textContent}\n\`\`\``;
    const ok = await copyToClipboard(c);
    toast[ok ? 'success' : 'error'](ok ? `Copied as ${format}!` : 'Copy failed');
  };

  // ── Find & replace ────────────────────────────────────────────────────────
  const handleReplace = (all: boolean) => {
    if (!findText) return;
    pushHistory(textContent);
    const updated = all
      ? textContent.split(findText).join(replaceText)
      : (() => { const i = textContent.indexOf(findText); if (i === -1) { toast.error('Not found'); return textContent; } return textContent.slice(0, i) + replaceText + textContent.slice(i + findText.length); })();
    setTextContent(updated); textContentRef.current = updated;
    if (connRef.current?.open && permissionRef.current === 'read-write')
      connRef.current.send({ type: 'text-update', data: { content: updated, timestamp: Date.now(), senderId: myPeerIdRef.current } });
    if (all) toast.success(`Replaced ${findMatchCount} occurrences`);
  };

  // ── Auth & name ───────────────────────────────────────────────────────────
  const submitPassword = () => {
    if (!connRef.current?.open || !passwordInput) return;
    connRef.current.send({ type: 'auth-response', data: { password: passwordInput } });
    setPasswordInput('');
  };

  const submitName = () => {
    if (!viewerName.trim()) return;
    setNameSet(true);
    if (connRef.current?.open) connRef.current.send({ type: 'viewer-name', data: { name: viewerName.trim() } });
    toast.success(`You're "${viewerName.trim()}"`);
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendChat = () => {
    if (!chatInput.trim() || !connRef.current?.open) return;
    const msg: ChatMessage = { id: Date.now().toString(), senderId: myPeerIdRef.current || 'viewer', senderName: viewerName || 'You', text: chatInput.trim(), timestamp: new Date(), isHost: false };
    setChatMessages(prev => [...prev, msg]);
    connRef.current.send({ type: 'chat', data: { ...msg, timestamp: msg.timestamp.getTime() } });
    setChatInput('');
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const lineCount = textContent ? textContent.split('\n').length : 0;
  const isEditable = permissionMode === 'read-write' && (status === 'connected' || status === 'receiving');
  const isConnected = status === 'connected' || status === 'receiving';

  // ── Status badge ──────────────────────────────────────────────────────────
  const statusMap: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    connecting: { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: retryCount > 0 ? `Retry #${retryCount}` : 'Connecting', cls: 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    connected: { icon: <Wifi className="h-3 w-3" />, label: 'Connected', cls: 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400' },
    receiving: { icon: <Wifi className="h-3 w-3" />, label: lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'Live', cls: 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400' },
    disconnected: { icon: <WifiOff className="h-3 w-3" />, label: 'Disconnected', cls: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    error: { icon: <AlertCircle className="h-3 w-3" />, label: retryIn > 0 ? `Retry in ${retryIn}s` : 'Error', cls: 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400' },
    auth: { icon: <Lock className="h-3 w-3" />, label: 'Auth required', cls: 'border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    kicked: { icon: <ShieldAlert className="h-3 w-3" />, label: 'Removed', cls: 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400' },
    expired: { icon: <AlertCircle className="h-3 w-3" />, label: 'Session expired', cls: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    rejected: { icon: <ShieldAlert className="h-3 w-3" />, label: 'Rejected', cls: 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400' },
  };
  const s = statusMap[status] || statusMap.error;
  const StatusBadge = () => <Badge variant="outline" className={`gap-1.5 ${s.cls}`}>{s.icon}{s.label}</Badge>;

  // ─────────────────────────────────────────────────────────────────────────
  // Content area (shared between normal and fullscreen)
  // ─────────────────────────────────────────────────────────────────────────
  const renderBody = () => {
    // ── Auth screen ──────────────────────────────────────────────────────────
    if (status === 'auth') {
      return (
        <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="py-10 flex flex-col items-center gap-6 max-w-sm mx-auto">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Password Required</h2>
              <p className="text-sm text-muted-foreground mt-1">This session is protected. Enter the password to join.</p>
              {isOneTime && <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">⚡ This is a one-time access link</p>}
            </div>
          </div>

          {!nameSet && (
            <div className="w-full space-y-2 p-4 rounded-lg border bg-muted/20">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" /> Your Display Name <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <div className="flex gap-2">
                <Input placeholder="e.g. Alice" value={viewerName} onChange={e => setViewerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitName()} />
                <Button size="sm" variant="outline" onClick={submitName} disabled={!viewerName.trim()}>Set</Button>
              </div>
            </div>
          )}

          <div className="w-full space-y-3">
            {authError && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {authError}
              </div>
            )}
            <Input type="password" placeholder="Enter session password" value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitPassword()}
              className="text-sm" autoFocus />
            <Button className="w-full gap-2" onClick={submitPassword} disabled={!passwordInput}>
              <Lock className="h-4 w-4" /> Unlock Session
            </Button>
          </div>
        </motion.div>
      );
    }

    // ── Terminal states ───────────────────────────────────────────────────────
    if (status === 'kicked' || status === 'rejected' || status === 'expired') {
      const configs = {
        kicked: { icon: ShieldAlert, color: 'red', title: 'You were removed', desc: 'The host disconnected you from this session.' },
        rejected: { icon: ShieldAlert, color: 'red', title: 'Connection rejected', desc: rejectedReason || 'The host rejected your connection.' },
        expired: { icon: AlertCircle, color: 'amber', title: 'Session expired', desc: 'This sharing session has ended.' },
      };
      const cfg = configs[status as 'kicked' | 'rejected' | 'expired'];
      const Icon = cfg.icon;
      return (
        <motion.div key="terminal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-14 space-y-4">
          <div className={`p-4 rounded-2xl bg-${cfg.color}-500/10 border border-${cfg.color}-500/20 inline-block`}>
            <Icon className={`h-12 w-12 text-${cfg.color}-500`} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{cfg.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{cfg.desc}</p>
          </div>
          {textContent && (
            <div className="flex justify-center gap-2 flex-wrap">
              <Button variant="outline" onClick={() => handleCopy('plain')} className="gap-2"><Copy className="h-4 w-4" />Copy text</Button>
              <Button variant="outline" onClick={() => downloadTextFile(textContent)} className="gap-2"><Download className="h-4 w-4" />Download</Button>
            </div>
          )}
        </motion.div>
      );
    }

    // ── Connecting ────────────────────────────────────────────────────────────
    if (status === 'connecting') {
      return (
        <motion.div key="connecting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Wifi className="relative h-16 w-16 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{retryCount > 0 ? `Reconnecting… (attempt ${retryCount})` : 'Connecting to Host'}</h2>
            <p className="text-sm text-muted-foreground">Establishing secure peer-to-peer connection</p>
            {retryCount > 0 && error && <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">{error}</p>}
          </div>
          <div className="flex justify-center gap-1.5">
            {[0,150,300].map((d,i) => <div key={i} className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
          </div>
        </motion.div>
      );
    }

    // ── Error (no content yet) ────────────────────────────────────────────────
    if (status === 'error' && !textContent) {
      return (
        <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 space-y-5">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
            <WifiOff className="relative h-14 w-14 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Connection Failed</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
          </div>
          {retryIn > 0 && <p className="text-sm text-muted-foreground">Auto-retry in <span className="font-mono font-semibold text-foreground">{retryIn}s</span></p>}
          <Button variant="outline" size="sm" onClick={() => connect(0)} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Retry Now
          </Button>
          <div className="rounded-lg border bg-muted/20 p-4 text-left text-xs text-muted-foreground max-w-md mx-auto space-y-1.5">
            <p className="font-semibold text-foreground mb-1">Troubleshooting</p>
            <p>• Ensure the host still has their page open</p>
            <p>• Corporate/university networks block P2P — try mobile hotspot</p>
            <p>• VPNs can interfere with WebRTC connections</p>
            <p>• The host may have restarted their session with a new link</p>
          </div>
        </motion.div>
      );
    }

    // ── Main content ──────────────────────────────────────────────────────────
    return (
      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Name prompt */}
        {!nameSet && isConnected && (
          <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 flex items-center gap-3 flex-wrap">
            <UserCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm">Set display name:</span>
            <div className="flex gap-2 flex-1">
              <Input className="h-7 text-xs min-w-0 flex-1 max-w-44" placeholder="Your name" value={viewerName}
                onChange={e => setViewerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitName()} />
              <Button size="sm" className="h-7 text-xs shrink-0" onClick={submitName} disabled={!viewerName.trim()}>Set</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground shrink-0" onClick={() => setNameSet(true)}>Skip</Button>
            </div>
          </div>
        )}

        {/* Status banners */}
        {status === 'disconnected' && (
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-4 flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Host Disconnected</p>
              <p className="text-xs text-muted-foreground mt-0.5">Showing last received content. You can still copy or save it.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0" onClick={() => connect(0)}>
              <RefreshCw className="h-3 w-3" />Reconnect
            </Button>
          </div>
        )}
        {status === 'connected' && !textContent && (
          <div className="rounded-xl border-2 border-blue-500/40 bg-blue-500/5 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Connected!</p>
              <p className="text-xs text-muted-foreground">Waiting for the host to start typing…</p>
            </div>
          </div>
        )}

        {/* Editor controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isEditable ? 'default' : 'secondary'} className="gap-1.5">
            {isEditable ? <><Edit3 className="h-3 w-3" />Collaborative</> : <><Eye className="h-3 w-3" />Read-Only</>}
          </Badge>
          {language !== 'plain' && <Badge variant="outline" className="text-xs font-mono">{language}</Badge>}
          <div className="h-4 w-px bg-border mx-1" />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFontSize(s => Math.max(10, s - 1))}><ZoomOut className="h-3.5 w-3.5" /></Button>
          <span className="text-xs font-mono text-muted-foreground w-6 text-center select-none">{fontSize}</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFontSize(s => Math.min(24, s + 1))}><ZoomIn className="h-3.5 w-3.5" /></Button>
          <button onClick={() => setShowLineNumbers(v => !v)}
            className={`h-7 px-2 rounded-md text-xs border transition-colors ${showLineNumbers ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-muted-foreground hover:bg-muted'}`}>#</button>

          <div className="ml-auto flex gap-1.5 items-center">
            {isEditable && (
              <>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleUndo} disabled={undoStack.length === 0} title="Undo (⌘Z)"><RotateCcw className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleRedo} disabled={redoStack.length === 0} title="Redo"><RotateCw className="h-3.5 w-3.5" /></Button>
                <div className="h-4 w-px bg-border mx-0.5" />
              </>
            )}
            <Button variant={chatOpen ? 'default' : 'outline'} size="sm" className="h-7 text-xs gap-1 relative"
              onClick={() => setChatOpen(v => !v)}>
              <MessageSquare className="h-3 w-3" />Chat
              {unreadChat > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{unreadChat}</span>}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFullscreen(v => !v)} title="Fullscreen">
              {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border bg-muted/30">
          {isEditable && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => setFindOpen(v => !v)}><Search className="h-3 w-3" />Find</Button>
          )}
          <div className="h-4 w-px bg-border mx-0.5" />
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handleCopy('plain')} disabled={!textContent}><Copy className="h-3 w-3" />Copy</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleCopy('markdown')} disabled={!textContent}>MD</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleCopy('html')} disabled={!textContent}>HTML</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1"
            onClick={() => { downloadTextFile(textContent, `shared.${language === 'plain' ? 'txt' : language}`); toast.success('Saved!'); }} disabled={!textContent}>
            <Download className="h-3 w-3" />Save
          </Button>
          {isEditable && (
            <>
              <div className="h-4 w-px bg-border mx-0.5" />
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleFormat('upper')} disabled={!textContent}>AA</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleFormat('lower')} disabled={!textContent}>aa</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handleFormat('trim')} disabled={!textContent}><Scissors className="h-3 w-3" />Trim</Button>
            </>
          )}
        </div>

        {/* Find & Replace */}
        {findOpen && isEditable && (
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

        {/* Editor + Chat */}
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0 space-y-2">
            <LineNumberedEditor
              value={textContent} onChange={handleTextChange}
              readOnly={!isEditable}
              placeholder={isEditable ? 'Start typing to collaborate…' : 'Waiting for content from host…'}
              fontSize={fontSize} showLineNumbers={showLineNumbers} textareaRef={textareaRef}
              minHeight={fullscreen ? 'calc(100vh - 380px)' : '400px'}
              isEditable={isEditable}
            />
            {(isConnected || status === 'disconnected') && textContent && (
              <StatsBar chars={textContent.length} words={words} lines={lineCount} live={isConnected} />
            )}
          </div>

          {/* Chat sidebar */}
          {chatOpen && (
            <div className="w-64 shrink-0 rounded-lg border bg-background flex flex-col overflow-hidden"
              style={{ maxHeight: fullscreen ? 'calc(100vh - 320px)' : '480px', minHeight: '200px' }}>
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chat</span>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setChatOpen(false)}><X className="h-3 w-3" /></Button>
              </div>
              <div ref={chatScrollRef} className="overflow-y-auto flex-1 p-2 space-y-2">
                {chatMessages.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No messages yet</p>}
                {chatMessages.map(msg => (
                  <div key={msg.id} className={msg.senderId === 'system' ? 'text-center' : 'space-y-0.5'}>
                    {msg.senderId === 'system'
                      ? <p className="text-[10px] text-muted-foreground italic">{msg.text}</p>
                      : <>
                          <p className={`text-[10px] font-semibold ${msg.isHost ? 'text-primary' : ''}`}>
                            {msg.isHost ? `${msg.senderName} (Host)` : msg.senderName}
                          </p>
                          <div className={`text-xs rounded-lg px-2.5 py-1.5 break-words ${
                            msg.senderId === myPeerIdRef.current ? 'bg-primary text-primary-foreground ml-4'
                            : msg.isHost ? 'bg-primary/10 border border-primary/20 mr-4'
                            : 'bg-muted mr-4'
                          }`}>{msg.text}</div>
                          <p className="text-[9px] text-muted-foreground">{msg.timestamp.toLocaleTimeString()}</p>
                        </>}
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 p-2 border-t shrink-0">
                <Input className="h-7 text-xs" placeholder="Type…" value={chatInput}
                  onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                  disabled={!isConnected} />
                <Button size="sm" className="h-7 w-7 p-0 shrink-0" onClick={sendChat} disabled={!chatInput.trim() || !isConnected}>
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="rounded-xl border bg-muted/20 p-3.5 text-sm text-muted-foreground flex items-start gap-2.5">
          {isEditable ? <Users className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> : <Eye className="h-4 w-4 mt-0.5 shrink-0 text-primary" />}
          <p>
            {isEditable
              ? <><strong className="text-foreground">Collaborative:</strong> Your edits sync to all connected users.</>
              : <><strong className="text-foreground">Read-only:</strong> Host changes appear here in real-time.</>}
            {' '}Keep this tab open to stay connected.
          </p>
        </div>
      </motion.div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Fullscreen layout
  // ─────────────────────────────────────────────────────────────────────────
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto flex flex-col">
        {/* Fullscreen topbar */}
        <div className="shrink-0 border-b px-5 py-3 flex items-center justify-between bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-base font-bold leading-tight">Shared Text Session</h1>
              <p className="text-[10px] text-muted-foreground">Peer-to-peer · end-to-end</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge />
            <Button variant="outline" size="sm" onClick={() => setFullscreen(false)} className="gap-1.5 text-xs">
              <Minimize2 className="h-3.5 w-3.5" /> Exit <span className="text-muted-foreground">(Esc)</span>
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Normal layout — wrapped in a plain page container (no Card)
  // so the user can add their own navbar/footer around it
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Shared Text Session</h1>
              <p className="text-xs text-muted-foreground">Peer-to-peer · end-to-end direct</p>
            </div>
          </div>
          <StatusBadge />
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
      </div>
    </div>
  );
};

export default ShareTextView;