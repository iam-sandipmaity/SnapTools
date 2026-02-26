'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Download, Loader2, AlertCircle, CheckCircle2, FileText, Image,
  Film, Music, Archive, File, Wifi, WifiOff, RefreshCw,
  Shield, Zap, Eye, Send, MessageSquare, X, Package,
  FolderOpen, Layers, Gauge, Clock, CheckCheck, Bell,
  BellOff, ChevronDown, ChevronUp, Filter, ArrowDownToLine,
  Star, BarChart3, User, Info, Lock, Inbox,
} from 'lucide-react';
import Peer from 'peerjs';
import { receiveFile, downloadFile, TransferProgress, FileMetadata } from '@/lib/peer-file-transfer';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type ConnStatus = 'connecting' | 'auth' | 'connected' | 'receiving' | 'idle' | 'error' | 'rejected' | 'expired';

interface ReceivedFile {
  id: string;
  blob: Blob;
  metadata: FileMetadata;
  receivedAt: Date;
  duration: number;
  avgSpeed: number;
  downloaded: boolean;
  starred: boolean;
  preview?: string; // For images
}

interface IncomingFile {
  id: string;
  name: string;
  size: number;
}

interface BatchInfo {
  totalFiles: number;
  totalSize: number;
  files: IncomingFile[];
  doneFiles: number;
  receivedBytes: number;
  startTime: Date;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatBytes(bytes: number, d = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), 3);
  return `${(bytes / k ** i).toFixed(d)} ${s[i]}`;
}

function generateId(len = 8) {
  return Array.from({ length: len }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

function getFileType(name: string): 'image' | 'video' | 'audio' | 'archive' | 'document' | 'other' {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','svg','avif','heic','bmp'].includes(ext)) return 'image';
  if (['mp4','avi','mov','mkv','webm','m4v'].includes(ext)) return 'video';
  if (['mp3','wav','ogg','flac','aac','m4a'].includes(ext)) return 'audio';
  if (['zip','rar','7z','tar','gz','bz2'].includes(ext)) return 'archive';
  if (['txt','doc','docx','pdf','md','csv','xls','xlsx','ppt','pptx'].includes(ext)) return 'document';
  return 'other';
}

const FILE_CFG = {
  image:    { Icon: Image,    color: 'text-pink-500',    bg: 'bg-pink-500/10 border-pink-500/25', gradient: 'from-pink-500/15 to-fuchsia-500/10' },
  video:    { Icon: Film,     color: 'text-violet-500',  bg: 'bg-violet-500/10 border-violet-500/25', gradient: 'from-violet-500/15 to-purple-500/10' },
  audio:    { Icon: Music,    color: 'text-sky-500',     bg: 'bg-sky-500/10 border-sky-500/25', gradient: 'from-sky-500/15 to-cyan-500/10' },
  archive:  { Icon: Archive,  color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/25', gradient: 'from-amber-500/15 to-orange-500/10' },
  document: { Icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/25', gradient: 'from-emerald-500/15 to-teal-500/10' },
  other:    { Icon: File,     color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/25', gradient: 'from-slate-500/15 to-zinc-500/10' },
};

function fmtETA(secs: number): string {
  if (secs < 0 || !isFinite(secs)) return '—';
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

function getPlatform(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac/.test(ua)) return 'macOS';
  if (/Win/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// ProgressRing
// ─────────────────────────────────────────────────────────────────────────────
const ProgressRing: React.FC<{ percentage: number; size?: number; strokeWidth?: number; color?: string }> = ({
  percentage, size = 120, strokeWidth = 8, color = 'stroke-primary',
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-muted" strokeWidth={strokeWidth} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
        className={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.4, ease: 'easeOut' }} />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FileCard (received)
// ─────────────────────────────────────────────────────────────────────────────
function ReceivedFileCard({ f, onDownload, onStar, onPreview }: {
  f: ReceivedFile;
  onDownload: () => void;
  onStar: () => void;
  onPreview: () => void;
}) {
  const t = getFileType(f.metadata.name);
  const { Icon, color, bg, gradient } = FILE_CFG[t];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-xl border-2 overflow-hidden bg-gradient-to-br ${gradient} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Icon / preview */}
        <div className={`shrink-0 h-11 w-11 rounded-xl border flex items-center justify-center ${bg} relative`}>
          {f.preview ? (
            <img src={f.preview} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <Icon className={`h-5 w-5 ${color}`} />
          )}
          {f.downloaded && (
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight">{f.metadata.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground font-mono">{formatBytes(f.metadata.size)}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-[10px] text-muted-foreground font-mono">{formatBytes(f.avgSpeed)}/s</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-[10px] text-muted-foreground">{f.receivedAt.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {(t === 'image' || t === 'video' || t === 'audio') && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onPreview}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 transition-colors ${f.starred ? 'text-amber-500' : 'opacity-0 group-hover:opacity-100'}`} onClick={onStar}>
            <Star className={`h-3.5 w-3.5 ${f.starred ? 'fill-amber-500' : ''}`} />
          </Button>
          <Button size="sm" className="h-7 gap-1 text-xs px-2" onClick={onDownload}>
            <Download className="h-3 w-3" />
            {f.downloaded ? 'Again' : 'Save'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IncomingFileItem (during transfer)
// ─────────────────────────────────────────────────────────────────────────────
function IncomingFileItem({ f, isCurrent, progress }: {
  f: IncomingFile; isCurrent: boolean; progress?: number;
}) {
  const t = getFileType(f.name);
  const { Icon, color, bg } = FILE_CFG[t];
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${isCurrent ? 'bg-primary/5 border border-primary/20' : 'opacity-50'}`}>
      <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${bg} relative`}>
        <Icon className={`h-4 w-4 ${color}`} />
        {isCurrent && (
          <div className="absolute -inset-0.5">
            <ProgressRing percentage={progress ?? 0} size={40} strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{f.name}</p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <span>{formatBytes(f.size)}</span>
          {isCurrent && progress !== undefined && (
            <><span className="text-muted-foreground/40">·</span><span className="text-primary">{progress.toFixed(0)}%</span></>
          )}
        </div>
        {isCurrent && progress !== undefined && (
          <div className="h-0.5 rounded-full bg-muted mt-1 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {isCurrent ? (
        <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
      ) : (
        <Clock className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: ConnStatus; retryCount?: number }> = ({ status, retryCount = 0 }) => {
  const map: Record<ConnStatus, { icon: React.ReactNode; label: string; cls: string }> = {
    connecting: { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: retryCount > 0 ? `Retry #${retryCount}` : 'Connecting', cls: 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    auth: { icon: <Lock className="h-3 w-3" />, label: 'Auth Required', cls: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    connected: { icon: <Wifi className="h-3 w-3" />, label: 'Connected', cls: 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400' },
    receiving: { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: 'Receiving', cls: 'border-primary/50 bg-primary/10 text-primary' },
    idle: { icon: <CheckCircle2 className="h-3 w-3" />, label: 'Ready', cls: 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400' },
    complete: { icon: <CheckCheck className="h-3 w-3" />, label: 'Complete', cls: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    error: { icon: <AlertCircle className="h-3 w-3" />, label: 'Error', cls: 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400' },
    rejected: { icon: <X className="h-3 w-3" />, label: 'Rejected', cls: 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400' },
    expired: { icon: <Clock className="h-3 w-3" />, label: 'Expired', cls: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  } as any;
  const { icon, label, cls } = map[status] ?? map['connecting'];
  return <Badge variant="outline" className={`gap-1.5 text-xs ${cls}`}>{icon}{label}</Badge>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Preview Modal
// ─────────────────────────────────────────────────────────────────────────────
function PreviewModal({ file, onClose }: { file: ReceivedFile; onClose: () => void }) {
  const t = getFileType(file.metadata.name);
  const url = URL.createObjectURL(file.blob);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="relative bg-background rounded-2xl border-2 overflow-hidden max-w-2xl w-full max-h-[80vh] shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold truncate flex-1 pr-4">{file.metadata.name}</p>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-auto max-h-[70vh] flex items-center justify-center bg-muted/20 p-4">
          {t === 'image' && <img src={url} alt={file.metadata.name} className="max-w-full max-h-full object-contain rounded-lg" />}
          {t === 'video' && <video src={url} controls className="max-w-full max-h-full rounded-lg" autoPlay />}
          {t === 'audio' && (
            <div className="w-full p-8 space-y-4 text-center">
              <Music className="h-16 w-16 text-sky-500 mx-auto" />
              <p className="font-medium">{file.metadata.name}</p>
              <audio src={url} controls className="w-full" autoPlay />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadFile(file.blob, file.metadata.name)}>
            <Download className="h-3.5 w-3.5" />Download
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Receiver
// ─────────────────────────────────────────────────────────────────────────────
const ShareFileView: React.FC = () => {
  const { peerId: hostPeerId } = useParams<{ peerId: string }>();

  // Connection state
  const [status, setStatus] = useState<ConnStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryIn, setRetryIn] = useState(0);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);

  // Auth
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Nickname
  const [nickname, setNickname] = useState('');
  const [nickSet, setNickSet] = useState(false);

  // Transfer
  const [currentProgress, setCurrentProgress] = useState<TransferProgress | null>(null);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState<number | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  // Batch
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [manifestFiles, setManifestFiles] = useState<IncomingFile[]>([]);

  // Received files
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<ReceivedFile | null>(null);
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showReceived, setShowReceived] = useState(true);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(false);

  // Refs
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastProgressRef = useRef<{ bytes: number; time: number } | null>(null);
  const batchInfoRef = useRef<BatchInfo | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      peerRef.current?.destroy();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => { batchInfoRef.current = batchInfo; }, [batchInfo]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    if (showChat) setUnreadChat(0);
  }, [showChat, chatMessages]);

  // Request browser notifications
  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifEnabled(perm === 'granted');
      if (perm === 'granted') toast.success('Notifications enabled');
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (notifEnabled && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const scheduleRetry = useCallback((attempt: number) => {
    const delay = Math.min(3000 * Math.pow(1.5, attempt), 20000);
    const delaySecs = Math.ceil(delay / 1000);
    if (!mountedRef.current) return;
    setRetryIn(delaySecs);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setRetryIn(p => { if (p <= 1) { clearInterval(countdownRef.current!); return 0; } return p - 1; });
    }, 1000);
    retryTimerRef.current = setTimeout(() => { if (mountedRef.current) connect(attempt + 1); }, delay);
  }, []);

  const connect = useCallback(async (attempt = 0) => {
    if (!hostPeerId || !mountedRef.current) return;
    peerRef.current?.destroy();
    if (!mountedRef.current) return;
    setStatus('connecting');
    setRetryCount(attempt);
    setError(null);
    setNeedsPassword(false);
    setAuthError(false);

    try {
      const newPeer = await new Promise<Peer>((resolve, reject) => {
        const p = new Peer(generateId(8), { config: { iceServers: ICE_SERVERS } });
        p.on('open', () => resolve(p));
        p.on('error', reject);
        setTimeout(() => reject(new Error('Peer init timeout')), 15000);
      });
      if (!mountedRef.current) { newPeer.destroy(); return; }
      peerRef.current = newPeer;

      const conn = newPeer.connect(hostPeerId, { reliable: true });
      connRef.current = conn;

      const openTimeout = setTimeout(() => {
        if (!mountedRef.current) return;
        setError('Connection timed out. The sender may be offline.');
        setStatus('error');
        scheduleRetry(attempt);
      }, 20000);

      conn.on('open', () => {
        clearTimeout(openTimeout);
        if (!mountedRef.current) return;
        setStatus('connected');
        toast.success('Connected!');

        // Send identity
        const name = nickname || `Receiver-${generateId(4)}`;
        conn.send({ type: 'receiver-name', data: { name, platform: getPlatform() } });
      });

      conn.on('data', async (data: any) => {
        if (!mountedRef.current) return;

        switch (data.type) {
          case 'auth-required':
            setNeedsPassword(true);
            setStatus('auth' as any);
            break;

          case 'auth-success':
            setNeedsPassword(false);
            setStatus('idle');
            toast.success('Authenticated!');
            break;

          case 'auth-failed':
            setAuthError(true);
            toast.error('Wrong password');
            break;

          case 'rejected':
            setRejectedReason(data.data.reason);
            setStatus('rejected' as any);
            toast.error(`Rejected: ${data.data.reason}`);
            break;

          case 'session-expired':
            setStatus('expired' as any);
            toast.warning('Session expired');
            break;

          case 'kicked':
            setStatus('rejected' as any);
            setRejectedReason('You were removed from this session.');
            toast.error('Kicked from session');
            break;

          case 'file-manifest':
            setManifestFiles(data.data.files || []);
            break;

          case 'new-files':
            setManifestFiles(prev => {
              const existingIds = new Set(prev.map((f: IncomingFile) => f.id));
              const newFiles = (data.data.files as IncomingFile[]).filter(f => !existingIds.has(f.id));
              return [...prev, ...newFiles];
            });
            sendNotification('New files queued', `${data.data.files.length} new file(s) queued for transfer`);
            break;

          case 'batch-start':
            const batch: BatchInfo = {
              totalFiles: data.data.count,
              totalSize: data.data.totalSize,
              files: data.data.files,
              doneFiles: 0,
              receivedBytes: 0,
              startTime: new Date(),
            };
            setBatchInfo(batch);
            setManifestFiles(data.data.files);
            setStatus('receiving');
            sendNotification('Transfer starting', `Receiving ${data.data.count} file(s)…`);
            break;

          case 'batch-end':
            setBatchInfo(prev => prev ? { ...prev, doneFiles: data.data.totalFiles } : null);
            setStatus('idle');
            setCurrentProgress(null);
            setCurrentFileName(null);
            sendNotification('Transfer complete!', `${data.data.totalFiles} file(s) received successfully`);
            toast.success(`All ${data.data.totalFiles} files received!`);
            break;

          case 'chat':
            const msg: ChatMessage = { ...data.data, isHost: true, timestamp: new Date(data.data.timestamp) };
            setChatMessages(prev => [...prev, msg]);
            setUnreadChat(prev => !showChat ? prev + 1 : 0);
            if (!showChat) toast.info(`💬 ${msg.senderName}: ${msg.text.slice(0, 50)}`);
            break;

          default:
            // Could be a file chunk — handled by receiveFile
            break;
        }
      });

      // Start continuous file receiving loop
      const startReceiving = async () => {
        while (mountedRef.current && conn.open) {
          try {
            lastProgressRef.current = null;
            const { file, metadata } = await receiveFile(conn, (prog) => {
              if (!mountedRef.current) return;
              setCurrentProgress(prog);
              setCurrentFileName(metadata?.name ?? null);

              const now = Date.now();
              const last = lastProgressRef.current;
              if (last) {
                const dt = (now - last.time) / 1000;
                const db = prog.loaded - last.bytes;
                if (dt > 0.1) {
                  const spd = db / dt;
                  setSpeed(spd);
                  const remaining = prog.total - prog.loaded;
                  setEta(spd > 0 ? Math.ceil(remaining / spd) : null);
                  setBatchInfo(prev => prev ? { ...prev, receivedBytes: prev.receivedBytes + db } : null);
                }
              }
              lastProgressRef.current = { bytes: prog.loaded, time: now };
            });

            if (!mountedRef.current) return;

            const dur = (Date.now() - (lastProgressRef.current?.time ?? Date.now())) / 1000;
            const avgSpeed = dur > 0 ? file.size / dur : 0;

            // Generate preview for images
            let preview: string | undefined;
            if (getFileType(metadata.name) === 'image' && file.size < 10 * 1024 * 1024) {
              preview = URL.createObjectURL(file);
            }

            const receivedFile: ReceivedFile = {
              id: `${Date.now()}-${Math.random()}`,
              blob: file,
              metadata,
              receivedAt: new Date(),
              duration: dur,
              avgSpeed,
              downloaded: false,
              starred: false,
              preview,
            };

            setReceivedFiles(prev => [receivedFile, ...prev]);
            setBatchInfo(prev => prev ? { ...prev, doneFiles: prev.doneFiles + 1 } : null);
            setStatus('receiving');
            setSpeed(0);
            setEta(null);
            setCurrentProgress(null);
            setCurrentFileName(null);

            toast.success(`"${metadata.name}" received!`);
          } catch (err: any) {
            if (!mountedRef.current) return;
            if (err?.message?.includes('closed') || err?.message?.includes('disconnect')) break;
            console.warn('File receive error:', err);
          }
        }
      };

      conn.on('open', () => {
        // Small delay to allow handshake
        setTimeout(startReceiving, 300);
      });

      conn.on('error', err => {
        clearTimeout(openTimeout);
        if (!mountedRef.current) return;
        setError(`Connection error: ${err.message}`);
        setStatus('error');
        scheduleRetry(attempt);
      });

      conn.on('close', () => {
        if (!mountedRef.current) return;
        if (receivedFiles.length === 0) {
          setError('Sender disconnected before any files were received.');
          setStatus('error');
          scheduleRetry(attempt);
        }
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
      setError(`Failed to connect: ${err?.message}`);
      setStatus('error');
      scheduleRetry(attempt);
    }
  }, [hostPeerId, scheduleRetry, nickname]);

  useEffect(() => {
    if (!hostPeerId) { setError('Invalid share link — missing sender ID.'); setStatus('error'); return; }
    connect(0);
  }, [hostPeerId, connect]);

  const submitNickname = () => {
    if (!nickSet) {
      setNickSet(true);
      if (connRef.current?.open) {
        connRef.current.send({ type: 'receiver-name', data: { name: nickname || 'Anonymous', platform: getPlatform() } });
      }
    }
  };

  const submitPassword = () => {
    if (connRef.current?.open) {
      connRef.current.send({ type: 'auth-response', data: { password: passwordInput } });
      setPasswordInput('');
    }
  };

  const sendChat = () => {
    if (!chatInput.trim() || !connRef.current?.open) return;
    const msg: ChatMessage = {
      id: Date.now().toString(), senderId: 'me', senderName: nickname || 'You',
      text: chatInput.trim(), timestamp: new Date(), isHost: false,
    };
    setChatMessages(prev => [...prev, msg]);
    connRef.current.send({ type: 'chat', data: { ...msg, timestamp: msg.timestamp.getTime() } });
    setChatInput('');
  };

  const downloadFile_ = (f: ReceivedFile) => {
    downloadFile(f.blob, f.metadata.name);
    setReceivedFiles(prev => prev.map(x => x.id === f.id ? { ...x, downloaded: true } : x));
  };

  const downloadAll = () => {
    const toDownload = receivedFiles.filter(f => !f.downloaded);
    if (!toDownload.length) { toast.error('All files already downloaded'); return; }
    toDownload.forEach(f => downloadFile_(f));
    toast.success(`Downloading ${toDownload.length} files…`);
  };

  const toggleStar = (id: string) => setReceivedFiles(prev => prev.map(f => f.id === id ? { ...f, starred: !f.starred } : f));

  const filteredFiles = receivedFiles
    .filter(f => !filterStarred || f.starred)
    .filter(f => filterType === 'all' || getFileType(f.metadata.name) === filterType);

  const pct = currentProgress?.percentage ?? 0;
  const batchPct = batchInfo && batchInfo.totalSize > 0
    ? (batchInfo.receivedBytes / batchInfo.totalSize) * 100
    : 0;

  const totalReceivedBytes = receivedFiles.reduce((a, f) => a + f.metadata.size, 0);
  const notDownloaded = receivedFiles.filter(f => !f.downloaded).length;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-start justify-center p-4 pt-8 md:pt-16">
      <div className="w-full max-w-xl space-y-4">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/8 via-background to-primary/12 p-5 shadow-lg">
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
                <ArrowDownToLine className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Receive Files</h1>
                <p className="text-xs text-muted-foreground">Secure P2P · direct transfer · no server</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={status} retryCount={retryCount} />
              {'Notification' in window && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={requestNotifications} title="Enable notifications">
                  {notifEnabled ? <Bell className="h-3.5 w-3.5 text-primary" /> : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
                </Button>
              )}
            </div>
          </div>

          {/* Nickname bar (shown before fully connected) */}
          {!nickSet && (status === 'connected' || status === 'idle' || status === 'receiving') && (
            <div className="relative mt-3 flex gap-2 border-t pt-3">
              <Input className="h-8 text-xs font-mono" placeholder="Set your display name (optional)"
                value={nickname} onChange={e => setNickname(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitNickname()} />
              <Button size="sm" className="h-8 px-3 text-xs shrink-0" onClick={submitNickname}>
                Set Name
              </Button>
            </div>
          )}
        </div>

        {/* ── Auth modal ── */}
        <AnimatePresence>
          {(status as string) === 'auth' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="font-bold">Password Required</h2>
                  <p className="text-xs text-muted-foreground">The sender has protected this session</p>
                </div>
              </div>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} className="h-10 font-mono pr-10"
                  placeholder="Enter session password"
                  value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitPassword()} />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {authError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Incorrect password</p>}
              <Button className="w-full gap-2" onClick={submitPassword} disabled={!passwordInput.trim()}>
                <Lock className="h-4 w-4" />Authenticate
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Rejected / Expired ── */}
        <AnimatePresence>
          {((status as string) === 'rejected' || (status as string) === 'expired') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6 text-center space-y-3">
              <X className="h-10 w-10 text-red-500 mx-auto" />
              <h2 className="font-bold text-lg">{(status as string) === 'expired' ? 'Session Expired' : 'Access Denied'}</h2>
              <p className="text-sm text-muted-foreground">{rejectedReason || 'This session is no longer available.'}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Connecting ── */}
        <AnimatePresence>
          {status === 'connecting' && (
            <motion.div key="connecting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 bg-card p-8 space-y-6 text-center shadow-lg">
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-2xl bg-primary/10 border-2 border-primary/20">
                  <Wifi className="h-12 w-12 text-primary animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{retryCount > 0 ? `Reconnecting… (attempt ${retryCount})` : 'Connecting to Sender'}</h2>
                <p className="text-sm text-muted-foreground">Establishing secure P2P connection</p>
              </div>
              <div className="flex justify-center gap-2">
                {[0, 120, 240].map((d, i) => (
                  <div key={i} className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <span>End-to-end encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <span>No server storage</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Manifest / Waiting ── */}
        <AnimatePresence>
          {status === 'idle' && manifestFiles.length > 0 && receivedFiles.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 bg-card p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{manifestFiles.length} file{manifestFiles.length !== 1 ? 's' : ''} queued</h3>
                <span className="text-xs text-muted-foreground font-mono">({formatBytes(manifestFiles.reduce((a, f) => a + f.size, 0))})</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {manifestFiles.map(f => (
                  <IncomingFileItem key={f.id} f={f} isCurrent={false} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">Waiting for sender to start transfer…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Active Transfer ── */}
        <AnimatePresence>
          {status === 'receiving' && (
            <motion.div key="receiving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl border-2 bg-card p-6 shadow-lg space-y-5">

              {/* Batch progress header */}
              {batchInfo && batchInfo.totalFiles > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      Batch: {batchInfo.doneFiles}/{batchInfo.totalFiles} files
                    </div>
                    <span className="font-mono font-bold text-primary">{batchPct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full bg-primary/60 rounded-full"
                      animate={{ width: `${batchPct}%` }} transition={{ duration: 0.4 }} />
                  </div>
                </div>
              )}

              {/* Current file ring */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <ProgressRing percentage={pct} size={130} strokeWidth={9} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold tabular-nums">{pct.toFixed(0)}<span className="text-lg text-muted-foreground">%</span></p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">receiving</p>
                    </div>
                  </div>
                </div>
                {currentFileName && (
                  <div className="text-center">
                    <p className="text-sm font-semibold truncate max-w-xs">{currentFileName}</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              {currentProgress && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Received', val: formatBytes(currentProgress.loaded), accent: 'text-primary' },
                    { label: 'Speed', val: speed > 0 ? `${formatBytes(speed)}/s` : '—', accent: 'text-blue-600 dark:text-blue-400' },
                    { label: 'ETA', val: eta != null ? fmtETA(eta) : '—', accent: 'text-purple-600 dark:text-purple-400' },
                  ].map(({ label, val, accent }) => (
                    <div key={label} className="rounded-xl border bg-muted/20 p-2.5 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
                      <p className={`text-xs font-bold tabular-nums ${accent}`}>{val}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* File queue during transfer */}
              {batchInfo && batchInfo.files.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {batchInfo.files.map((f, i) => (
                    <IncomingFileItem key={f.id} f={f}
                      isCurrent={currentFileName === f.name}
                      progress={currentFileName === f.name ? pct : undefined} />
                  ))}
                </div>
              )}

              {/* Linear bar */}
              {currentProgress && (
                <div className="space-y-1.5">
                  <div className="relative h-2.5 rounded-full overflow-hidden bg-muted">
                    <motion.div className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{formatBytes(currentProgress.loaded)}</span>
                    <span>{formatBytes(currentProgress.total)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        <AnimatePresence>
          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 bg-card p-6 shadow-lg space-y-5">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl" />
                  <div className="relative p-5 rounded-2xl bg-destructive/10 border-2 border-destructive/30">
                    <WifiOff className="h-12 w-12 text-destructive" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Connection Failed</h2>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
                </div>
                {retryIn > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Retrying in <span className="font-mono font-bold text-foreground">{retryIn}s</span>
                  </p>
                )}
                <Button variant="outline" size="sm" onClick={() => connect(0)} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />Retry Now
                </Button>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-1.5">
                <p className="text-xs font-semibold flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-destructive" />Troubleshooting</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Sender must keep their page open and session active</p>
                  <p>• Corporate / university networks may block P2P — try mobile hotspot</p>
                  <p>• VPNs can interfere with WebRTC connections</p>
                  <p>• Make sure the share link hasn't expired</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Received Files Library ── */}
        <AnimatePresence>
          {receivedFiles.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 bg-card shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/10">
                <button className="flex items-center gap-2 font-semibold text-sm"
                  onClick={() => setShowReceived(v => !v)}>
                  <FolderOpen className="h-4 w-4 text-primary" />
                  {receivedFiles.length} file{receivedFiles.length !== 1 ? 's' : ''} received
                  <span className="text-muted-foreground font-normal text-xs">({formatBytes(totalReceivedBytes)})</span>
                  {showReceived ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
                <div className="flex items-center gap-2">
                  {notDownloaded > 0 && (
                    <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={downloadAll}>
                      <ArrowDownToLine className="h-3 w-3" />Save All ({notDownloaded})
                    </Button>
                  )}
                </div>
              </div>

              {showReceived && (
                <div className="p-4 space-y-3">
                  {/* Filter bar */}
                  {receivedFiles.length > 2 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setFilterStarred(v => !v)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${filterStarred ? 'bg-amber-500/10 border-amber-500/40 text-amber-600' : 'border-border text-muted-foreground hover:bg-muted/50'}`}>
                        <Star className="h-3 w-3" />Starred
                      </button>
                      {['all', 'image', 'video', 'audio', 'document', 'archive'].map(t => {
                        const count = t === 'all' ? receivedFiles.length : receivedFiles.filter(f => getFileType(f.metadata.name) === t).length;
                        if (t !== 'all' && count === 0) return null;
                        return (
                          <button key={t} onClick={() => setFilterType(t)}
                            className={`text-xs px-2 py-1 rounded-full border transition-colors capitalize ${filterType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted/50'}`}>
                            {t} {t !== 'all' && `(${count})`}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* File list */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                    {filteredFiles.map(f => (
                      <ReceivedFileCard key={f.id} f={f}
                        onDownload={() => downloadFile_(f)}
                        onStar={() => toggleStar(f.id)}
                        onPreview={() => setPreviewFile(f)}
                      />
                    ))}
                    {filteredFiles.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4 italic">No files match this filter</p>
                    )}
                  </div>

                  {/* Summary stats */}
                  <div className="flex items-center gap-4 pt-1 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CheckCheck className="h-3.5 w-3.5 text-emerald-500" />{receivedFiles.filter(f => f.downloaded).length} downloaded</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" />{receivedFiles.filter(f => f.starred).length} starred</span>
                    <span className="flex items-center gap-1 ml-auto"><Gauge className="h-3.5 w-3.5" />
                      Avg {formatBytes(receivedFiles.reduce((a, f) => a + f.avgSpeed, 0) / receivedFiles.length)}/s
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat ── */}
        {(status === 'connected' || status === 'idle' || status === 'receiving' || receivedFiles.length > 0) && (
          <div className="rounded-2xl border-2 bg-card shadow-lg overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-3 bg-muted/10 hover:bg-muted/20 transition-colors"
              onClick={() => setShowChat(v => !v)}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-primary" />
                Chat with sender
                {unreadChat > 0 && (
                  <span className="h-5 w-5 rounded-full bg-red-500 text-[10px] text-white font-bold flex items-center justify-center">{unreadChat}</span>
                )}
              </div>
              {showChat ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {showChat && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div ref={chatScrollRef} className="max-h-48 overflow-y-auto p-3 space-y-2 border-t">
                    {chatMessages.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center italic py-4">No messages yet</p>
                    )}
                    {chatMessages.map(m => (
                      <div key={m.id} className="space-y-0.5">
                        <p className={`text-[10px] font-semibold ${m.isHost ? 'text-primary' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {m.isHost ? '🖥 ' : '📱 '}{m.senderName}
                        </p>
                        <div className={`text-xs rounded-xl px-3 py-1.5 ${m.isHost ? 'bg-muted mr-8' : 'bg-primary/10 ml-8'}`}>
                          {m.text}
                        </div>
                        <p className="text-[9px] text-muted-foreground">{m.timestamp.toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 p-2 border-t">
                    <Input className="h-8 text-xs" placeholder="Send a message…"
                      value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()} />
                    <Button size="sm" className="h-8 w-8 p-0" onClick={sendChat} disabled={!chatInput.trim()}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Security note ── */}
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground/60 pb-4 px-1">
          <Shield className="h-3.5 w-3.5 mt-0.5 text-green-500 shrink-0" />
          <p>Files transferred directly from sender's device · zero server storage · WebRTC end-to-end encryption · keep this tab open</p>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {previewFile && (
          <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareFileView;