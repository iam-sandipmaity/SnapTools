'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload, Copy, QrCode, Users, Wifi, AlertCircle, Lock,
  Timer, Hash, Settings2, ChevronDown, WifiOff,
  X, RefreshCw, Zap, Eye, EyeOff, UserX, CheckCircle2,
  Send, MessageSquare, ClipboardList, Trash2, RotateCcw,
  Clock, Gauge, FolderOpen, Inbox, File, Image, Film,
  Music, Archive, FileText, Shield, Package, Layers,
  ChevronUp, BarChart3, Globe, Pause, Play, SkipForward,
  Download, Star, Bell, SortAsc, Filter, ArrowUpDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedElement from '@/components/animated-element';
import { useDropzone } from 'react-dropzone';
import Peer, { DataConnection } from 'peerjs';
import { initializePeer, sendFile, createShareLink, TransferProgress } from '@/lib/peer-file-transfer';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface QueuedFile {
  id: string;
  file: File;
  status: 'queued' | 'sending' | 'done' | 'error' | 'paused';
  progress: number;
  preview?: string;
  addedAt: Date;
  sentTo: string[];
  errorMsg?: string;
}

interface ReceiverInfo {
  conn: DataConnection;
  id: string;
  name: string;
  joinedAt: Date;
  authed: boolean;
  color: string;
  transferring: boolean;
  currentFile: string | null;
  currentProgress: number;
  lastSeen: Date;
  filesReceived: number;
  bytesReceived: number;
  filesAcked: Set<string>;
  platform?: string;
  speed: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isHost: boolean;
  reaction?: string;
}

interface LogEntry {
  time: string;
  msg: string;
  type: 'info' | 'success' | 'warn';
}

interface TransferRecord {
  filename: string;
  size: number;
  receiver: string;
  time: Date;
  duration: number;
  speed: number;
}

interface BulkTransferState {
  totalFiles: number;
  doneFiles: number;
  totalBytes: number;
  sentBytes: number;
  receiverIds: string[];
  startTime: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

const RECEIVER_COLORS = [
  'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-fuchsia-500',
];

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:a.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:a.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:a.relay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
];

function genId(len = 8) {
  const length = Math.max(8, Math.min(16, len));
  return Array.from({ length }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

function fmtBytes(b: number, d = 1): string {
  if (!b || b < 0) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(b) / Math.log(k)), 3);
  return `${(b / k ** i).toFixed(d)} ${s[i]}`;
}

function fmtTimer(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function fmtRelTime(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

function fmtETA(secs: number): string {
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

function getFileType(name: string): 'image' | 'video' | 'audio' | 'archive' | 'document' | 'other' {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'heic', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'm4v', 'flv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus'].includes(ext)) return 'audio';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) return 'archive';
  if (['txt', 'doc', 'docx', 'pdf', 'md', 'rtf', 'csv', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document';
  return 'other';
}

const FILE_CFG = {
  image:    { Icon: Image,    color: 'text-pink-500',    soft: 'bg-pink-500/10 border-pink-500/25'    },
  video:    { Icon: Film,     color: 'text-violet-500',  soft: 'bg-violet-500/10 border-violet-500/25'  },
  audio:    { Icon: Music,    color: 'text-sky-500',     soft: 'bg-sky-500/10 border-sky-500/25'     },
  archive:  { Icon: Archive,  color: 'text-amber-500',   soft: 'bg-amber-500/10 border-amber-500/25'   },
  document: { Icon: FileText, color: 'text-emerald-500', soft: 'bg-emerald-500/10 border-emerald-500/25'},
  other:    { Icon: File,     color: 'text-slate-400',   soft: 'bg-slate-500/10 border-slate-500/25'   },
};

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-muted-foreground/25'}`}>
    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
  </button>
);

function useSpeedTracker() {
  const buf = useRef<{ t: number; n: number }[]>([]);
  return {
    push: (n: number) => {
      const now = Date.now();
      buf.current = [...buf.current.filter(s => now - s.t < 3000), { t: now, n }];
    },
    get: (): number => {
      const s = buf.current;
      if (s.length < 2) return 0;
      const dt = (s[s.length - 1].t - s[0].t) / 1000;
      return dt > 0 ? (s[s.length - 1].n - s[0].n) / dt : 0;
    },
    reset: () => { buf.current = []; },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ProgressRing
// ─────────────────────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 44, color = 'stroke-primary' }: { pct: number; size?: number; color?: string }) {
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted-foreground/20" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
        strokeLinecap="round" className={`${color} transition-all duration-300`} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FileCard
// ─────────────────────────────────────────────────────────────────────────────
function FileCard({ qf, onRemove, onRetry, speed, index }: {
  qf: QueuedFile; onRemove: () => void; onRetry: () => void; speed: number; index: number;
}) {
  const t = getFileType(qf.file.name);
  const { Icon, color, soft } = FILE_CFG[t];

  return (
    <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
      qf.status === 'sending' ? 'border-primary/30 bg-primary/4 shadow-sm'
      : qf.status === 'done'  ? 'border-emerald-500/25 bg-emerald-500/4'
      : qf.status === 'error' ? 'border-red-500/25 bg-red-500/4'
      : 'border-border bg-muted/20 hover:bg-muted/35'
    }`}>
      {/* Position badge */}
      {qf.status === 'queued' && (
        <span className="shrink-0 h-5 w-5 rounded-full bg-muted-foreground/15 text-[9px] font-bold flex items-center justify-center text-muted-foreground">
          {index + 1}
        </span>
      )}

      {/* Icon / preview */}
      <div className="relative shrink-0">
        {qf.preview ? (
          <img src={qf.preview} alt="" className="h-10 w-10 rounded-lg object-cover border" />
        ) : (
          <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${soft}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        )}
        {qf.status === 'sending' && (
          <div className="absolute -inset-1 pointer-events-none">
            <ProgressRing pct={qf.progress} size={52} />
          </div>
        )}
        {qf.status === 'done' && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
          </span>
        )}
        {qf.status === 'error' && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
            <X className="h-2.5 w-2.5 text-white" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium truncate leading-none">{qf.file.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono">{fmtBytes(qf.file.size)}</span>
          {qf.status === 'sending' && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-primary font-mono">{qf.progress.toFixed(1)}%</span>
              {speed > 0 && <>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-0.5">
                  <Gauge className="h-3 w-3" />{fmtBytes(speed)}/s
                </span>
                {speed > 0 && qf.progress < 100 && (
                  <>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ETA {fmtETA(Math.ceil((qf.file.size * (1 - qf.progress / 100)) / speed))}
                    </span>
                  </>
                )}
              </>}
            </>
          )}
          {qf.status === 'done' && qf.sentTo.length > 0 && (
            <span className="text-xs text-muted-foreground">→ {qf.sentTo.join(', ')}</span>
          )}
          {qf.status === 'error' && qf.errorMsg && (
            <span className="text-xs text-red-500">{qf.errorMsg}</span>
          )}
        </div>
        {qf.status === 'sending' && (
          <div className="h-0.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${qf.progress}%` }} />
          </div>
        )}
      </div>

      {/* Status / actions */}
      <div className="shrink-0 flex items-center gap-1.5">
        {qf.status === 'queued' && <span className="text-xs text-muted-foreground">Queued</span>}
        {qf.status === 'sending' && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary gap-1">
            <RefreshCw className="h-2.5 w-2.5 animate-spin" />Sending
          </Badge>
        )}
        {qf.status === 'done' && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" />Sent
          </Badge>
        )}
        {qf.status === 'error' && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-amber-500" onClick={onRetry} title="Retry">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        {qf.status !== 'sending' && (
          <Button variant="ghost" size="sm"
            className="h-6 w-6 p-0 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BulkProgressBar
// ─────────────────────────────────────────────────────────────────────────────
function BulkProgressBar({ bulk }: { bulk: BulkTransferState | null }) {
  if (!bulk) return null;
  const pct = bulk.totalBytes > 0 ? (bulk.sentBytes / bulk.totalBytes) * 100 : 0;
  const elapsed = (Date.now() - bulk.startTime.getTime()) / 1000;
  const speed = elapsed > 0 ? bulk.sentBytes / elapsed : 0;
  const remaining = bulk.totalBytes - bulk.sentBytes;
  const eta = speed > 0 ? Math.ceil(remaining / speed) : null;

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/4 p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-primary">
          <Layers className="h-3.5 w-3.5" />
          Bulk Transfer — {bulk.doneFiles}/{bulk.totalFiles} files
        </div>
        <div className="flex items-center gap-2 text-muted-foreground font-mono">
          {speed > 0 && <span>{fmtBytes(speed)}/s</span>}
          {eta !== null && <span>ETA {fmtETA(eta)}</span>}
          <span className="font-bold text-primary">{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>{fmtBytes(bulk.sentBytes)} / {fmtBytes(bulk.totalBytes)}</span>
        <span>{bulk.receiverIds.length} receiver{bulk.receiverIds.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SidePanel wrapper
// ─────────────────────────────────────────────────────────────────────────────
function SidePanel({ title, icon: Icon, onClose, children, badge }: {
  title: string; icon?: React.FC<any>; onClose: () => void; children: React.ReactNode; badge?: number;
}) {
  return (
    <div className="w-[280px] shrink-0 rounded-xl border bg-background flex flex-col overflow-hidden shadow-sm" style={{ maxHeight: 500 }}>
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/20 shrink-0">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
          {badge !== undefined && badge > 0 && (
            <span className="h-4 w-4 rounded-full bg-primary text-[9px] text-white font-bold flex items-center justify-center">{badge}</span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReceiverCard
// ─────────────────────────────────────────────────────────────────────────────
function ReceiverCard({ r, queuedFiles, onKick, onSend }: {
  r: ReceiverInfo; queuedFiles: QueuedFile[]; onKick: () => void; onSend: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 p-2.5 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className={`h-8 w-8 rounded-full ${r.color} flex items-center justify-center text-white text-[11px] font-bold shrink-0 relative`}>
          {r.name.charAt(0).toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{r.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {r.transferring ? (
              <span className="text-primary flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5 animate-spin inline" />
                {r.currentProgress.toFixed(0)}% — {r.currentFile ? r.currentFile.slice(0, 20) : '…'}
              </span>
            ) : fmtRelTime(r.lastSeen)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {r.filesReceived > 0 && (
            <Badge variant="outline" className="text-[9px] px-1 py-0">
              {r.filesReceived}✓
            </Badge>
          )}
          {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>

      {r.transferring && r.currentFile && (
        <div className="px-2.5 pb-1.5">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${r.currentProgress}%` }} />
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t px-2.5 py-2 space-y-1.5 bg-muted/10">
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <span>Files sent: <strong className="text-foreground">{r.filesReceived}</strong></span>
            <span>Data: <strong className="text-foreground">{fmtBytes(r.bytesReceived)}</strong></span>
            <span>Joined: <strong className="text-foreground">{r.joinedAt.toLocaleTimeString()}</strong></span>
            {r.platform && <span>Platform: <strong className="text-foreground">{r.platform}</strong></span>}
          </div>
          <div className="flex gap-1 pt-0.5">
            {!r.transferring && queuedFiles.length > 0 && (
              <Button size="sm" className="flex-1 h-6 text-[10px] gap-1" onClick={onSend}>
                <Send className="h-2.5 w-2.5" />Send {queuedFiles.length} file{queuedFiles.length !== 1 ? 's' : ''}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={onKick} title="Kick">
              <UserX className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const FileSharer: React.FC = () => {
  // Session state
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [oneTimeLink, setOneTimeLink] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Queue
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [activeSpeed, setActiveSpeed] = useState(0);
  const [transferHistory, setTransferHistory] = useState<TransferRecord[]>([]);
  const [bulkState, setBulkState] = useState<BulkTransferState | null>(null);
  const [sortBy, setSortBy] = useState<'added' | 'name' | 'size'>('added');
  const [filterStatus, setFilterStatus] = useState<'all' | 'queued' | 'done' | 'error'>('all');

  // Receivers
  const [receivers, setReceivers] = useState<ReceiverInfo[]>([]);

  // Settings
  const [customId, setCustomId] = useState('');
  const [idLength, setIdLength] = useState(8);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [maxReceivers, setMaxReceivers] = useState(0);
  const [expiryMins, setExpiryMins] = useState(0);
  const [expirySecsLeft, setExpirySecsLeft] = useState(0);
  const [oneTimeEnabled, setOneTimeEnabled] = useState(false);
  const [oneTimeUsed, setOneTimeUsed] = useState(false);
  const [autoSendOnJoin, setAutoSendOnJoin] = useState(true);
  const [sendBatchMode, setSendBatchMode] = useState(true); // Send manifest then all files

  // UI
  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activePanel, setActivePanel] = useState<'receivers' | 'chat' | 'log' | 'history' | 'stats' | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadChat, setUnreadChat] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [sessionStats, setSessionStats] = useState({ totalSent: 0, totalBytes: 0, avgSpeed: 0, peakSpeed: 0 });

  // Refs
  const peerRef = useRef<Peer | null>(null);
  const peerIdRef = useRef<string | null>(null);
  const receiversRef = useRef<ReceiverInfo[]>([]);
  const queueRef = useRef<QueuedFile[]>([]);
  const passwordRef = useRef('');
  const passwordEnabledRef = useRef(false);
  const maxReceiversRef = useRef(0);
  const oneTimeUsedRef = useRef(false);
  const colorCtr = useRef(0);
  const activePanelRef = useRef<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sp = useSpeedTracker();

  // Sync refs
  useEffect(() => { receiversRef.current = receivers; }, [receivers]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { passwordRef.current = password; }, [password]);
  useEffect(() => { passwordEnabledRef.current = passwordEnabled; }, [passwordEnabled]);
  useEffect(() => { maxReceiversRef.current = maxReceivers; }, [maxReceivers]);
  useEffect(() => { activePanelRef.current = activePanel; }, [activePanel]);
  useEffect(() => { if (activePanel === 'chat') setUnreadChat(0); }, [activePanel, chatMessages]);
  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    if (!shareLink) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [shareLink]);

  useEffect(() => () => {
    peerRef.current?.destroy();
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    if (expiryIntervalRef.current) clearInterval(expiryIntervalRef.current);
    queue.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
  }, []);

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setLog(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 200));
  }, []);

  const broadcast = useCallback((data: any) => {
    receiversRef.current.filter(r => r.authed && r.conn.open).forEach(r => r.conn.send(data));
  }, []);

  // ── Start session ─────────────────────────────────────────────────────────
  const startSession = async () => {
    setIsInitializing(true);
    try {
      const pid = customId || genId(idLength);
      const newPeer = await new Promise<Peer>((resolve, reject) => {
        const p = new Peer(pid, { config: { iceServers: ICE_SERVERS } });
        p.on('open', () => resolve(p));
        p.on('error', reject);
        setTimeout(() => reject(new Error('timeout')), 15000);
      });

      peerRef.current = newPeer;
      peerIdRef.current = pid;
      const link = createShareLink(pid);
      setShareLink(link);
      if (oneTimeEnabled) setOneTimeLink(`${link}?ot=1`);
      addLog(`Session started — ID: ${pid}`, 'success');

      if (expiryMins > 0) {
        const total = expiryMins * 60;
        setExpirySecsLeft(total);
        expiryIntervalRef.current = setInterval(() => setExpirySecsLeft(s => Math.max(0, s - 1)), 1000) as unknown as NodeJS.Timeout;
        expiryTimerRef.current = setTimeout(() => {
          receiversRef.current.forEach(r => { r.conn.send({ type: 'session-expired', data: {} }); setTimeout(() => r.conn.close(), 300); });
          newPeer.destroy(); setShareLink(null); setReceivers([]);
          addLog('Session expired', 'warn'); toast.warning('Session expired');
        }, total * 1000);
      }

      newPeer.on('connection', (conn) => {
        if (oneTimeEnabled && oneTimeUsedRef.current) {
          conn.on('open', () => { conn.send({ type: 'rejected', data: { reason: 'This one-time link has already been used.' } }); setTimeout(() => conn.close(), 400); });
          return;
        }
        if (maxReceiversRef.current > 0 && receiversRef.current.filter(r => r.authed).length >= maxReceiversRef.current) {
          conn.on('open', () => { conn.send({ type: 'rejected', data: { reason: 'Session is full.' } }); setTimeout(() => conn.close(), 400); });
          addLog('Rejected: session full', 'warn'); return;
        }

        const color = RECEIVER_COLORS[colorCtr.current % RECEIVER_COLORS.length]; colorCtr.current++;
        const info: ReceiverInfo = {
          conn, id: conn.peer, name: `Receiver ${colorCtr.current}`,
          joinedAt: new Date(), authed: !passwordEnabledRef.current,
          color, transferring: false, currentFile: null, currentProgress: 0,
          lastSeen: new Date(), filesReceived: 0, bytesReceived: 0,
          filesAcked: new Set(), speed: 0,
        };

        conn.on('open', () => {
          if (passwordEnabledRef.current) {
            conn.send({ type: 'auth-required', data: {} });
            setReceivers(prev => { const u = [...prev, info]; receiversRef.current = u; return u; });
          } else {
            provisionReceiver(info);
          }

          conn.on('data', (data: any) => {
            info.lastSeen = new Date();
            setReceivers(prev => prev.map(r => r.id === conn.peer ? { ...r, lastSeen: new Date() } : r));

            switch (data.type) {
              case 'auth-response':
                if (data.data.password === passwordRef.current) {
                  info.authed = true;
                  conn.send({ type: 'auth-success', data: {} });
                  provisionReceiver(info);
                  if (oneTimeEnabled) { oneTimeUsedRef.current = true; setOneTimeUsed(true); addLog('One-time link consumed', 'info'); }
                } else {
                  conn.send({ type: 'auth-failed', data: {} });
                  addLog(`${info.name} failed auth`, 'warn');
                  conn.close();
                }
                break;
              case 'receiver-name':
                info.name = String(data.data.name).slice(0, 30);
                info.platform = data.data.platform;
                setReceivers(prev => prev.map(r => r.id === conn.peer ? { ...r, name: info.name, platform: data.data.platform } : r));
                addLog(`${info.name} identified (${data.data.platform || 'unknown'})`, 'info');
                break;
              case 'file-ack':
                info.filesAcked.add(data.data.filename);
                break;
              case 'chat':
                if (!info.authed) return;
                const msg: ChatMessage = { ...data.data, senderName: info.name, senderId: conn.peer, timestamp: new Date(data.data.timestamp), isHost: false };
                setChatMessages(prev => [...prev, msg]);
                setUnreadChat(prev => activePanelRef.current !== 'chat' ? prev + 1 : 0);
                receiversRef.current.filter(r => r.id !== conn.peer && r.authed && r.conn.open).forEach(r => r.conn.send({ type: 'chat', data: msg }));
                break;
              case 'request-files':
                // Receiver requested specific files
                if (data.data.fileIds) {
                  const requested = queueRef.current.filter(f => data.data.fileIds.includes(f.id));
                  if (requested.length > 0) sendFilesToReceiver(info, requested);
                }
                break;
            }
          });
        });

        conn.on('close', () => {
          setReceivers(prev => { const u = prev.filter(r => r.id !== conn.peer); receiversRef.current = u; return u; });
          addLog(`${info.name} disconnected`, 'warn');
          toast.info(`${info.name} left`);
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(), senderId: 'system', senderName: 'System',
            text: `${info.name} left`, timestamp: new Date(), isHost: false,
          }]);
        });

        conn.on('error', err => addLog(`${info.name}: ${err.message}`, 'warn'));
      });

      newPeer.on('error', err => addLog(`Peer error: ${err.message}`, 'warn'));
      toast.success('Session started! Share the link.');
    } catch (e: any) {
      addLog(`Init failed: ${e?.message}`, 'warn');
      toast.error('Failed to start session');
    } finally {
      setIsInitializing(false);
    }
  };

  const provisionReceiver = (info: ReceiverInfo) => {
    if (!info.authed) info.authed = true;
    const waiting = queueRef.current.filter(f => f.status === 'queued');

    // Send manifest of all queued files
    if (waiting.length > 0) {
      info.conn.send({
        type: 'file-manifest',
        data: {
          count: waiting.length,
          totalSize: waiting.reduce((a, f) => a + f.file.size, 0),
          files: waiting.map(f => ({ id: f.id, name: f.file.name, size: f.file.size, type: f.file.type }))
        }
      });
    }

    setReceivers(prev => {
      const exists = prev.find(r => r.id === info.id);
      const u = exists ? prev.map(r => r.id === info.id ? { ...r, authed: true } : r) : [...prev, info];
      receiversRef.current = u; return u;
    });
    toast.success(`${info.name} joined!`);
    addLog(`${info.name} connected`, 'success');

    // Auto-send if enabled
    if (autoSendOnJoin && waiting.length > 0) {
      setTimeout(() => sendFilesToReceiver(info, waiting), 500);
    }
  };

  // ── Send files to receiver ────────────────────────────────────────────────
  const sendFilesToReceiver = async (receiver: ReceiverInfo, filesToSend?: QueuedFile[]) => {
    const toSend = filesToSend || queueRef.current.filter(f => f.status === 'queued');
    if (!toSend.length || !receiver.conn.open) return;

    // Notify batch start
    receiver.conn.send({
      type: 'batch-start',
      data: {
        count: toSend.length,
        totalSize: toSend.reduce((a, f) => a + f.file.size, 0),
        files: toSend.map(f => ({ id: f.id, name: f.file.name, size: f.file.size }))
      }
    });

    const batchStart = Date.now();
    let batchSentBytes = 0;

    for (const qf of toSend) {
      if (!receiver.conn.open) break;
      setQueue(prev => prev.map(f => f.id === qf.id ? { ...f, status: 'sending', progress: 0 } : f));
      setReceivers(prev => prev.map(r => r.id === receiver.id ? { ...r, transferring: true, currentFile: qf.file.name, currentProgress: 0 } : r));
      sp.reset();
      const t0 = Date.now();

      try {
        await sendFile(receiver.conn, qf.file, (prog) => {
          sp.push(prog.loaded);
          const spd = sp.get();
          setActiveSpeed(spd);
          batchSentBytes += prog.loaded - (qf.file.size * ((prog.percentage - 0.1) / 100));
          setQueue(prev => prev.map(f => f.id === qf.id ? { ...f, progress: prog.percentage } : f));
          setReceivers(prev => prev.map(r => r.id === receiver.id ? { ...r, currentProgress: prog.percentage, speed: spd } : r));
        });

        const dur = (Date.now() - t0) / 1000;
        const spd = qf.file.size / dur;
        setQueue(prev => prev.map(f => f.id === qf.id ? {
          ...f, status: 'done', progress: 100,
          sentTo: [...(f.sentTo || []), receiver.name]
        } : f));
        setReceivers(prev => prev.map(r => r.id === receiver.id ? {
          ...r, filesReceived: r.filesReceived + 1, bytesReceived: r.bytesReceived + qf.file.size, currentFile: null
        } : r));
        setTransferHistory(prev => [{
          filename: qf.file.name, size: qf.file.size, receiver: receiver.name,
          time: new Date(), duration: dur, speed: spd
        }, ...prev].slice(0, 200));
        setSessionStats(prev => ({
          totalSent: prev.totalSent + 1,
          totalBytes: prev.totalBytes + qf.file.size,
          avgSpeed: (prev.avgSpeed * prev.totalSent + spd) / (prev.totalSent + 1),
          peakSpeed: Math.max(prev.peakSpeed, spd),
        }));
        addLog(`Sent "${qf.file.name}" → ${receiver.name} in ${dur.toFixed(1)}s @ ${fmtBytes(spd)}/s`, 'success');
      } catch (err: any) {
        setQueue(prev => prev.map(f => f.id === qf.id ? { ...f, status: 'error', errorMsg: err.message } : f));
        setReceivers(prev => prev.map(r => r.id === receiver.id ? { ...r, transferring: false, currentFile: null } : r));
        addLog(`Send failed: ${err.message}`, 'warn');
        toast.error(`Failed: "${qf.file.name}"`);
      }
    }

    // Notify batch end
    receiver.conn.send({ type: 'batch-end', data: { totalFiles: toSend.length } });
    setReceivers(prev => prev.map(r => r.id === receiver.id ? { ...r, transferring: false } : r));
    setActiveSpeed(0);
    toast.success(`All ${toSend.length} files sent to ${receiver.name}!`);
  };

  const sendToAll = () => {
    const ready = receiversRef.current.filter(r => r.authed && r.conn.open && !r.transferring);
    if (!ready.length) { toast.error('No receivers available'); return; }
    const toSend = queueRef.current.filter(f => f.status === 'queued');
    if (!toSend.length) { toast.error('No files queued'); return; }

    const bulk: BulkTransferState = {
      totalFiles: toSend.length * ready.length,
      doneFiles: 0,
      totalBytes: toSend.reduce((a, f) => a + f.file.size, 0) * ready.length,
      sentBytes: 0,
      receiverIds: ready.map(r => r.id),
      startTime: new Date(),
    };
    setBulkState(bulk);
    ready.forEach(r => sendFilesToReceiver(r, toSend));
    addLog(`Bulk send: ${toSend.length} files → ${ready.length} receivers`, 'info');
  };

  const kickReceiver = (id: string) => {
    const r = receiversRef.current.find(x => x.id === id);
    if (!r) return;
    r.conn.send({ type: 'kicked', data: {} });
    setTimeout(() => r.conn.close(), 200);
    addLog(`Kicked ${r.name}`, 'warn'); toast.info(`Kicked ${r.name}`);
  };

  // ── File queue management ─────────────────────────────────────────────────
  const addFiles = useCallback((files: File[]) => {
    const valid: QueuedFile[] = [];
    files.forEach(f => {
      if (f.size > MAX_FILE_SIZE) { toast.error(`"${f.name}" exceeds 2 GB limit`); return; }
      const id = `${Date.now()}-${Math.random()}`;
      const entry: QueuedFile = { id, file: f, status: 'queued', progress: 0, addedAt: new Date(), sentTo: [] };
      if (getFileType(f.name) === 'image' && f.size < 5 * 1024 * 1024) entry.preview = URL.createObjectURL(f);
      valid.push(entry);
    });
    if (valid.length) {
      setQueue(prev => [...prev, ...valid]);
      toast.success(`${valid.length} file${valid.length > 1 ? 's' : ''} added`);

      // Notify connected receivers of new files
      if (receiversRef.current.some(r => r.authed)) {
        const notif = { type: 'new-files', data: { files: valid.map(f => ({ id: f.id, name: f.file.name, size: f.file.size })) } };
        receiversRef.current.filter(r => r.authed && r.conn.open).forEach(r => r.conn.send(notif));
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles, multiple: true, preventDropOnDocument: true,
  });

  const removeFile = (id: string) => setQueue(prev => {
    const f = prev.find(x => x.id === id);
    if (f?.preview) URL.revokeObjectURL(f.preview);
    return prev.filter(x => x.id !== id);
  });
  const retryFile = (id: string) => setQueue(prev => prev.map(f => f.id === id ? { ...f, status: 'queued', progress: 0, errorMsg: undefined } : f));
  const clearDone = () => setQueue(prev => prev.filter(f => f.status !== 'done'));
  const clearAll = () => { queue.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); }); setQueue([]); };
  const retryAll = () => setQueue(prev => prev.map(f => f.status === 'error' ? { ...f, status: 'queued', progress: 0, errorMsg: undefined } : f));

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(), senderId: peerIdRef.current || 'host',
      senderName: 'You (Host)', text: chatInput.trim(), timestamp: new Date(), isHost: true,
    };
    setChatMessages(prev => [...prev, msg]);
    broadcast({ type: 'chat', data: { ...msg, timestamp: msg.timestamp.getTime() } });
    setChatInput('');
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const authed = receivers.filter(r => r.authed);
  const queuedFiles = queue.filter(f => f.status === 'queued');
  const sendingFiles = queue.filter(f => f.status === 'sending');
  const doneFiles = queue.filter(f => f.status === 'done');
  const errorFiles = queue.filter(f => f.status === 'error');
  const totalQueueSize = queue.reduce((a, f) => a + f.file.size, 0);

  const sortedQueue = [...queue]
    .filter(f => filterStatus === 'all' || f.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'name') return a.file.name.localeCompare(b.file.name);
      if (sortBy === 'size') return b.file.size - a.file.size;
      return a.addedAt.getTime() - b.addedAt.getTime();
    });

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AnimatedElement>
      <Card className="border-2 max-w-5xl mx-auto shadow-lg">
        {/* Header */}
        <CardHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">P2P File Transfer</h2>
                <p className="text-xs text-muted-foreground">Direct device-to-device · no server · up to 2 GB</p>
              </div>
            </div>
            {shareLink && (
              <div className="flex items-center gap-2 flex-wrap">
                {expiryMins > 0 && expirySecsLeft > 0 && (
                  <Badge variant="outline" className="font-mono gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                    <Timer className="h-3 w-3" />{fmtTimer(expirySecsLeft)}
                  </Badge>
                )}
                {sessionStats.totalSent > 0 && (
                  <Badge variant="outline" className="font-mono gap-1 text-[10px]">
                    <BarChart3 className="h-3 w-3" />{sessionStats.totalSent} sent · {fmtBytes(sessionStats.totalBytes)}
                  </Badge>
                )}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  authed.length > 0
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {authed.length > 0
                    ? <><Wifi className="h-3.5 w-3.5" />{authed.length} receiver{authed.length !== 1 ? 's' : ''}</>
                    : <><WifiOff className="h-3.5 w-3.5" />Waiting…</>}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {!shareLink ? (
            /* ══ SETUP SCREEN ════════════════════════════════════════════ */
            <div className="space-y-4">
              <div className="flex gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-300">How P2P transfer works</p>
                  <p className="text-amber-700/80 dark:text-amber-400/80">Files go directly between devices — nothing is stored on any server. Both you and the receiver must stay online. Max 2 GB per file. Multiple files are sent in a batch.</p>
                </div>
              </div>

              <div className="rounded-xl border overflow-hidden">
                <button className="w-full flex items-center gap-2.5 px-4 py-3.5 text-left bg-muted/20 hover:bg-muted/40 transition-colors"
                  onClick={() => setShowSettings(v => !v)}>
                  <Settings2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-sm flex-1">Session Settings</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`} />
                </button>

                {showSettings && (
                  <div className="px-5 pb-5 pt-4 border-t space-y-5 bg-background">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />Session ID
                      </label>
                      <Input placeholder="Leave empty for auto-generated" value={customId}
                        onChange={e => setCustomId(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))} maxLength={20}
                        className="font-mono h-9" />
                      {!customId && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Auto-ID length</span><span className="font-mono">{idLength} chars</span>
                          </div>
                          <input type="range" min="8" max="16" value={idLength}
                            onChange={e => setIdLength(+e.target.value)} className="w-full accent-primary h-1" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5" />Password
                        </label>
                        <Toggle checked={passwordEnabled} onChange={() => setPasswordEnabled(v => !v)} />
                      </div>
                      {passwordEnabled && (
                        <div className="relative">
                          <Input type={showPassword ? 'text' : 'password'} placeholder="Session password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="h-9 pr-9 font-mono" />
                          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(v => !v)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-violet-500" />One-Time Link
                        </label>
                        <Toggle checked={oneTimeEnabled} onChange={() => setOneTimeEnabled(v => !v)} />
                      </div>
                      <p className="text-xs text-muted-foreground">Link self-destructs after the first receiver connects.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Send className="h-3.5 w-3.5 text-sky-500" />Auto-Send on Join
                        </label>
                        <Toggle checked={autoSendOnJoin} onChange={() => setAutoSendOnJoin(v => !v)} />
                      </div>
                      <p className="text-xs text-muted-foreground">Automatically start sending queued files when a receiver connects.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />Max Receivers
                        </label>
                        <span className="text-xs font-mono text-muted-foreground">{maxReceivers === 0 ? 'Unlimited' : maxReceivers}</span>
                      </div>
                      <input type="range" min="0" max="20" value={maxReceivers}
                        onChange={e => setMaxReceivers(+e.target.value)} className="w-full accent-primary h-1" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Timer className="h-3.5 w-3.5" />Session Expiry
                        </label>
                        <span className="text-xs font-mono text-muted-foreground">{expiryMins === 0 ? 'Never' : `${expiryMins}m`}</span>
                      </div>
                      <input type="range" min="0" max="120" step="5" value={expiryMins}
                        onChange={e => setExpiryMins(+e.target.value)} className="w-full accent-primary h-1" />
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={startSession} disabled={isInitializing} size="lg" className="w-full h-12 text-base font-semibold gap-2">
                {isInitializing
                  ? <><RefreshCw className="h-4 w-4 animate-spin" />Initializing…</>
                  : <><Wifi className="h-4 w-4" />Start Sharing Session</>}
              </Button>
            </div>
          ) : (
            /* ══ ACTIVE SESSION ══════════════════════════════════════════ */
            <div className="space-y-5">
              {/* Panel tab bar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {([
                  { key: 'receivers', icon: Users, count: authed.length },
                  { key: 'chat', icon: MessageSquare, count: unreadChat },
                  { key: 'log', icon: ClipboardList, count: 0 },
                  { key: 'history', icon: Clock, count: transferHistory.length },
                  { key: 'stats', icon: BarChart3, count: 0 },
                ] as const).map(({ key: p, icon: Icon, count }) => (
                  <Button key={p} size="sm" variant={activePanel === p ? 'default' : 'outline'}
                    className="h-8 text-xs gap-1.5 relative capitalize"
                    onClick={() => setActivePanel(prev => prev === p ? null : p)}>
                    <Icon className="h-3.5 w-3.5" />{p}
                    {count > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center ${p === 'chat' && unreadChat > 0 ? 'bg-red-500' : 'bg-primary'}`}>
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </Button>
                ))}

                {/* Auto-send indicator */}
                {autoSendOnJoin && (
                  <Badge variant="outline" className="text-[10px] gap-1 border-sky-500/40 text-sky-600 dark:text-sky-400 ml-auto">
                    <Zap className="h-2.5 w-2.5" />Auto-send on
                  </Badge>
                )}
              </div>

              {/* Bulk progress (if active) */}
              {bulkState && sendingFiles.length > 0 && <BulkProgressBar bulk={bulkState} />}

              {/* Dropzone + side panel */}
              <div className="flex gap-4 items-start">
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Drop zone */}
                  <div {...getRootProps()} className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-primary bg-primary/5 shadow-inner scale-[1.005]'
                      : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/15'
                  }`}>
                    <input {...getInputProps()} />
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-primary/20' : 'bg-muted'}`}>
                      <Upload className={`h-6 w-6 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{isDragActive ? 'Drop to add files' : 'Drop files here or click to browse'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Any file type · up to 2 GB each · batch send supported</p>
                    </div>
                  </div>

                  {/* File queue */}
                  {queue.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {queue.length} file{queue.length !== 1 ? 's' : ''} <span className="text-muted-foreground font-normal">({fmtBytes(totalQueueSize)})</span>
                          </span>
                          {sendingFiles.length > 0 && (
                            <Badge variant="outline" className="text-[10px] gap-1 border-primary/40 text-primary">
                              <RefreshCw className="h-2.5 w-2.5 animate-spin" />Sending {sendingFiles.length}
                            </Badge>
                          )}
                          {errorFiles.length > 0 && (
                            <Badge variant="outline" className="text-[10px] gap-1 border-red-500/40 text-red-500">
                              {errorFiles.length} error{errorFiles.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {/* Sort & filter */}
                          <select className="h-7 text-xs rounded-md border bg-background px-2 font-medium"
                            value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                            <option value="added">By date</option>
                            <option value="name">By name</option>
                            <option value="size">By size</option>
                          </select>
                          <select className="h-7 text-xs rounded-md border bg-background px-2 font-medium"
                            value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
                            <option value="all">All ({queue.length})</option>
                            <option value="queued">Queued ({queuedFiles.length})</option>
                            <option value="done">Done ({doneFiles.length})</option>
                            <option value="error">Errors ({errorFiles.length})</option>
                          </select>

                          {queuedFiles.length > 0 && authed.length > 0 && (
                            <Button size="sm" className="h-7 text-xs gap-1.5" onClick={sendToAll}>
                              <Send className="h-3 w-3" />Send All ({queuedFiles.length})
                            </Button>
                          )}
                          {errorFiles.length > 0 && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={retryAll}>
                              <RotateCcw className="h-3 w-3" />Retry Errors
                            </Button>
                          )}
                          {doneFiles.length > 0 && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={clearDone}>
                              <Trash2 className="h-3 w-3" />Clear Sent
                            </Button>
                          )}
                          {queue.length > 0 && sendingFiles.length === 0 && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={clearAll}>
                              Clear All
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                        {sortedQueue.map((qf, i) => (
                          <FileCard key={qf.id} qf={qf} index={i}
                            onRemove={() => removeFile(qf.id)}
                            onRetry={() => retryFile(qf.id)}
                            speed={qf.status === 'sending' ? activeSpeed : 0}
                          />
                        ))}
                        {sortedQueue.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4 italic">No files match this filter</p>
                        )}
                      </div>

                      {sendingFiles.length > 0 && activeSpeed > 0 && (
                        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground font-mono">
                          <Gauge className="h-3 w-3 text-primary" />
                          <span>{fmtBytes(activeSpeed)}/s</span>
                          <span className="text-muted-foreground/40">·</span>
                          <span>{doneFiles.length}/{queue.length} done</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20 text-sm text-muted-foreground">
                      <Inbox className="h-4 w-4 shrink-0" />
                      <span>No files added yet. Drop files above to queue them for batch transfer.</span>
                    </div>
                  )}
                </div>

                {/* ── Side panels ── */}
                {activePanel && (
                  <SidePanel
                    title={activePanel}
                    icon={{ receivers: Users, chat: MessageSquare, log: ClipboardList, history: Clock, stats: BarChart3 }[activePanel]}
                    onClose={() => setActivePanel(null)}
                    badge={activePanel === 'chat' ? unreadChat : undefined}
                  >
                    {/* Receivers */}
                    {activePanel === 'receivers' && (
                      <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {authed.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-10 text-center">
                            <Users className="h-8 w-8 text-muted-foreground/25" />
                            <p className="text-xs text-muted-foreground">No receivers connected yet</p>
                          </div>
                        )}
                        {authed.map(r => (
                          <ReceiverCard key={r.id} r={r} queuedFiles={queuedFiles}
                            onKick={() => kickReceiver(r.id)}
                            onSend={() => sendFilesToReceiver(r)}
                          />
                        ))}
                        {receivers.filter(r => !r.authed).length > 0 && (
                          <div className="border-t pt-2 mt-1">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-1 mb-1.5">Awaiting auth</p>
                            {receivers.filter(r => !r.authed).map(r => (
                              <div key={r.id} className="flex items-center gap-2 p-2 opacity-50">
                                <Lock className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs">Pending…</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {authed.length > 0 && queuedFiles.length > 0 && (
                          <div className="border-t pt-2 mt-1 sticky bottom-0 bg-background pb-1">
                            <Button size="sm" className="w-full h-7 text-xs gap-1.5" onClick={sendToAll}>
                              <Send className="h-3 w-3" />Send {queuedFiles.length} files to all
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chat */}
                    {activePanel === 'chat' && (
                      <>
                        <div ref={chatScrollRef} className="overflow-y-auto flex-1 p-2.5 space-y-2.5">
                          {chatMessages.length === 0 && (
                            <div className="flex flex-col items-center gap-2 py-10 text-center">
                              <MessageSquare className="h-7 w-7 text-muted-foreground/25" />
                              <p className="text-xs text-muted-foreground">No messages yet</p>
                            </div>
                          )}
                          {chatMessages.map(m => (
                            <div key={m.id} className={m.senderId === 'system' ? 'text-center' : 'space-y-0.5'}>
                              {m.senderId === 'system'
                                ? <p className="text-[10px] text-muted-foreground italic">{m.text}</p>
                                : <>
                                    <p className={`text-[10px] font-semibold ${m.isHost ? 'text-primary' : ''}`}>{m.senderName}</p>
                                    <div className={`text-xs rounded-xl px-2.5 py-1.5 break-words leading-relaxed ${m.isHost ? 'bg-primary text-primary-foreground ml-5' : 'bg-muted mr-5'}`}>
                                      {m.text}
                                    </div>
                                    <p className="text-[9px] text-muted-foreground">{m.timestamp.toLocaleTimeString()}</p>
                                  </>}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-1.5 p-2 border-t shrink-0">
                          <Input className="h-8 text-xs" placeholder="Message receivers…"
                            value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendChat()} />
                          <Button size="sm" className="h-8 w-8 p-0 shrink-0" onClick={sendChat} disabled={!chatInput.trim()}>
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Log */}
                    {activePanel === 'log' && (
                      <div className="overflow-y-auto flex-1 p-2 font-mono text-[10px] space-y-0.5">
                        {log.length === 0 && <p className="text-muted-foreground text-center italic py-10">No events yet</p>}
                        {log.map((l, i) => (
                          <div key={i} className={`flex gap-2 leading-relaxed ${l.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : l.type === 'warn' ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            <span className="opacity-40 shrink-0 tabular-nums">{l.time}</span>
                            <span className="break-all">{l.msg}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* History */}
                    {activePanel === 'history' && (
                      <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                        {transferHistory.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-10 text-center">
                            <Clock className="h-7 w-7 text-muted-foreground/25" />
                            <p className="text-xs text-muted-foreground">No completed transfers</p>
                          </div>
                        )}
                        {transferHistory.map((t, i) => (
                          <div key={i} className="p-2.5 rounded-lg border space-y-1 text-xs hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-1.5">
                              {(() => { const { Icon, color } = FILE_CFG[getFileType(t.filename)]; return <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />; })()}
                              <span className="font-medium truncate flex-1">{t.filename}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground font-mono text-[10px]">
                              <span>{fmtBytes(t.size)} → {t.receiver}</span>
                              <span className="text-emerald-500">{fmtBytes(t.speed)}/s</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground">{t.time.toLocaleTimeString()} · {t.duration.toFixed(1)}s</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    {activePanel === 'stats' && (
                      <div className="p-3 space-y-3 overflow-y-auto flex-1">
                        {[
                          { label: 'Files Sent', val: sessionStats.totalSent, unit: '' },
                          { label: 'Total Data', val: fmtBytes(sessionStats.totalBytes), unit: '' },
                          { label: 'Avg Speed', val: sessionStats.avgSpeed > 0 ? fmtBytes(sessionStats.avgSpeed) : '—', unit: sessionStats.avgSpeed > 0 ? '/s' : '' },
                          { label: 'Peak Speed', val: sessionStats.peakSpeed > 0 ? fmtBytes(sessionStats.peakSpeed) : '—', unit: sessionStats.peakSpeed > 0 ? '/s' : '' },
                          { label: 'Receivers', val: authed.length, unit: ' active' },
                          { label: 'Queue', val: queuedFiles.length, unit: ' queued' },
                        ].map(({ label, val, unit }) => (
                          <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
                            <span className="text-xs font-bold font-mono">{val}{unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </SidePanel>
                )}
              </div>

              {/* Share link section */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">Share Link</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {passwordEnabled && <Badge variant="outline" className="text-[10px] font-mono gap-1"><Lock className="h-2.5 w-2.5" />Protected</Badge>}
                    {maxReceivers > 0 && <Badge variant="outline" className="text-[10px] font-mono gap-1"><Users className="h-2.5 w-2.5" />Max {maxReceivers}</Badge>}
                    {expiryMins > 0 && expirySecsLeft > 0 && <Badge variant="outline" className="text-[10px] font-mono gap-1 border-amber-500/40 text-amber-500"><Timer className="h-2.5 w-2.5" />{fmtTimer(expirySecsLeft)}</Badge>}
                    {oneTimeEnabled && <Badge variant="outline" className={`text-[10px] font-mono gap-1 ${oneTimeUsed ? 'opacity-40 line-through' : 'border-violet-500/40 text-violet-500'}`}><Zap className="h-2.5 w-2.5" />{oneTimeUsed ? 'Used' : 'One-time'}</Badge>}
                    {autoSendOnJoin && <Badge variant="outline" className="text-[10px] font-mono gap-1 border-sky-500/40 text-sky-500"><Zap className="h-2.5 w-2.5" />Auto-send</Badge>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input value={shareLink!} readOnly className="font-mono text-xs h-9" />
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                    onClick={() => navigator.clipboard.writeText(shareLink!).then(() => toast.success('Copied!')).catch(() => toast.error('Failed'))}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setShowQR(v => !v)}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>

                {oneTimeLink && !oneTimeUsed && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-violet-500" />One-time link — expires after first use
                    </p>
                    <div className="flex gap-2">
                      <Input value={oneTimeLink} readOnly className="font-mono text-xs h-9" />
                      <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                        onClick={() => navigator.clipboard.writeText(oneTimeLink).then(() => toast.success('Copied!'))}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {showQR && (
                  <div className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border shadow-sm w-fit mx-auto">
                    <QRCodeSVG value={shareLink!} size={176} level="H" includeMargin />
                    <p className="text-xs text-gray-400">Scan to receive on mobile</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Keep this tab open throughout the transfer.{' '}
                  <strong className="text-amber-600 dark:text-amber-400">Closing this page ends the session.</strong>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default FileSharer;