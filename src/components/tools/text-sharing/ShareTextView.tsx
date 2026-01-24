'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Loader2, AlertCircle, CheckCircle2, Copy, Wifi, WifiOff, Edit3, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import Peer, { DataConnection } from 'peerjs';
import {
  initializeTextPeer,
  copyToClipboard,
  downloadTextFile,
  sendTextUpdate,
  TextUpdate,
  PermissionMode
} from '@/lib/peer-text-transfer';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

type ConnectionStatus = 'connecting' | 'connected' | 'receiving' | 'disconnected' | 'error';

const ShareTextView: React.FC = () => {
  const { peerId } = useParams<{ peerId: string }>();
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [textContent, setTextContent] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('read-only');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const myPeerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!peerId) {
      setError('Invalid share link');
      setStatus('error');
      return;
    }

    const connectToPeer = async () => {
      try {
        // Initialize our own peer
        const newPeer = await initializeTextPeer();
        setPeer(newPeer);
        myPeerIdRef.current = newPeer.id!;

        // Connect to the sender
        const conn = newPeer.connect(peerId);
        setConnection(conn);

        conn.on('open', () => {
          console.log('Connected to sender');
          setStatus('connected');
          toast.success('Connected to text source!');

          // Listen for text updates and permissions
          conn.on('data', (data: any) => {
            if (data.type === 'permission') {
              setPermissionMode(data.data.mode);
              toast.info(`Mode changed to ${data.data.mode === 'read-only' ? 'Read-Only' : 'Collaborative'}`, {
                icon: data.data.mode === 'read-only' ? '👁️' : '✏️'
              });
            } else if (data.type === 'text-update') {
              const update: TextUpdate = data.data;
              // Only update if it's not from this viewer
              if (update.senderId !== myPeerIdRef.current) {
                setTextContent(update.content);
                setLastUpdate(new Date(update.timestamp));
                setStatus('receiving');
              }
            }
          });
        });

        conn.on('close', () => {
          console.log('Connection closed');
          setStatus('disconnected');
          toast.info('Connection closed by sender');
        });

        conn.on('error', (error) => {
          console.error('Connection error:', error);
          setError('Failed to connect to sender. They may be offline.');
          setStatus('error');
          toast.error('Connection failed');
        });

      } catch (error) {
        console.error('Peer initialization error:', error);
        setError('Failed to initialize connection');
        setStatus('error');
      }
    };

    connectToPeer();

    // Cleanup
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (connection) {
        connection.close();
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [peerId]);

  const handleCopyText = async () => {
    if (textContent) {
      const success = await copyToClipboard(textContent);
      if (success) {
        toast.success('Text copied to clipboard!');
      } else {
        toast.error('Failed to copy text');
      }
    }
  };

  const handleDownload = () => {
    if (textContent) {
      downloadTextFile(textContent);
      toast.success('Text downloaded!');
    } else {
      toast.error('No text to download');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextContent(newText);

    // Debounce updates to avoid flooding the connection
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      // Send update to owner and other viewers
      if (connection && connection.open && permissionMode === 'read-write') {
        sendTextUpdate(
          connection,
          newText,
          textareaRef.current?.selectionStart,
          myPeerIdRef.current || undefined
        );
      }
    }, 100); // 100ms debounce
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'connecting':
        return (
          <Badge variant="outline" className="gap-2 border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Connecting
          </Badge>
        );
      case 'connected':
      case 'receiving':
        return (
          <Badge variant="outline" className="gap-2 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
            <Wifi className="h-3 w-3" />
            Connected
            {lastUpdate && (
              <span className="text-xs opacity-70">
                • {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="gap-2 border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <WifiOff className="h-3 w-3" />
            Disconnected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="gap-2 border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
    }
  };

  const renderContent = () => {
    if (status === 'error') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl" />
            <WifiOff className="relative h-20 w-20 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Connection Failed</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {error || 'Unable to establish connection with the sender'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Make sure the sender is online and the link is correct</span>
          </div>
        </motion.div>
      );
    }

    if (status === 'connecting') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <Wifi className="relative h-20 w-20 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Connecting to Sender</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Establishing secure peer-to-peer connection...
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      );
    }

    if (status === 'disconnected') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <WifiOff className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Connection Closed
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  The sender has disconnected. You can still view and copy the last received text below.
                </p>
              </div>
            </div>
          </div>

          {textContent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Last Received Text</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyText}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={textContent}
                readOnly
                className="min-h-[350px] font-mono text-sm bg-muted/30 border-2 resize-none"
                rows={15}
              />

              <p className="text-xs text-muted-foreground text-center">
                {textContent.length.toLocaleString()} characters
              </p>
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {status === 'connected' && !textContent && (
          <div className="rounded-xl border-2 border-blue-500/50 bg-blue-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Connected & Ready!
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Waiting for the sender to start typing...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {permissionMode === 'read-only' ? (
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Shared Text</h3>
                  <Badge variant="secondary" className="gap-1.5">
                    <Eye className="h-3 w-3" />
                    Read-Only
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Collaborative Text</h3>
                  <Badge className="gap-1.5 bg-primary">
                    <Edit3 className="h-3 w-3" />
                    Editable
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyText} disabled={!textContent}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={!textContent}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={textContent}
              onChange={handleTextChange}
              readOnly={permissionMode === 'read-only'}
              placeholder={
                permissionMode === 'read-write'
                  ? 'Start typing to collaborate in real-time...'
                  : 'Waiting for text from sender...'
              }
              className={`min-h-[400px] font-mono text-sm border-2 resize-none transition-all ${permissionMode === 'read-only'
                ? 'bg-muted/30'
                : 'bg-background border-primary/50 focus:border-primary'
                }`}
              rows={18}
            />
            {permissionMode === 'read-write' && (
              <div className="absolute top-3 right-3 pointer-events-none">
                <Badge className="gap-1.5 bg-primary/90 backdrop-blur-sm">
                  <Edit3 className="h-3 w-3" />
                  Live Editing
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{textContent.length.toLocaleString()} characters</span>
            {textContent && (
              <span className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                Updates in real-time
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              {permissionMode === 'read-only' ? (
                <Eye className="h-5 w-5 text-primary" />
              ) : (
                <Users className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 text-sm">
              <p className="text-foreground/90">
                {permissionMode === 'read-only' ? (
                  <>
                    You're viewing this text in <strong>real-time</strong>. Any changes made by the owner will appear here instantly.
                  </>
                ) : (
                  <>
                    <strong>Collaborative editing enabled!</strong> You can edit this text and your changes will sync in real-time with all connected users.
                  </>
                )}
              </p>
              <p className="text-muted-foreground mt-2">
                Keep this page open to maintain the connection.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <AnimatedElement className="w-full max-w-4xl">
        <Card className="border-2 shadow-2xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-8 py-6 border-b">
            <div className="absolute inset-0 bg-grid-white/5" />
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">View Shared Text</h1>
                <p className="text-sm text-muted-foreground">
                  Real-time peer-to-peer text sharing
                </p>
              </div>
              {getStatusIndicator()}
            </div>
          </div>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default ShareTextView;
