'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Copy, QrCode, Users, Wifi, AlertCircle, Download, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedElement from '@/components/animated-element';
import Peer, { DataConnection } from 'peerjs';
import {
  initializeTextPeer,
  sendTextUpdate,
  broadcastTextUpdate,
  sendPermissionMode,
  createTextShareLink,
  copyToClipboard,
  downloadTextFile,
  PermissionMode
} from '@/lib/peer-text-transfer';

const TextSharer: React.FC = () => {
  const [textContent, setTextContent] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('read-only');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);
  const peerIdRef = useRef<string | null>(null);
  const permissionModeRef = useRef<PermissionMode>('read-only');

  // Keep refs in sync
  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  useEffect(() => {
    peerIdRef.current = peerId;
  }, [peerId]);

  useEffect(() => {
    permissionModeRef.current = permissionMode;
  }, [permissionMode]);

  useEffect(() => {
    // Cleanup peer connection on unmount
    return () => {
      if (peer) {
        peer.destroy();
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [peer]);

  const initializeSharing = async () => {
    setIsInitializing(true);

    try {
      // Initialize PeerJS connection
      const newPeer = await initializeTextPeer();
      setPeer(newPeer);

      const newPeerId = newPeer.id!;
      setPeerId(newPeerId);
      peerIdRef.current = newPeerId;
      const link = createTextShareLink(newPeerId);
      setShareLink(link);

      // Listen for incoming connections
      newPeer.on('connection', (conn) => {
        console.log('Receiver connected:', conn.peer);
        
        conn.on('open', () => {
          setConnections(prev => {
            const updated = [...prev, conn];
            setConnectedUsers(updated.length);
            connectionsRef.current = updated;
            return updated;
          });
          
          toast.success('A viewer connected!');
          
          // Send permission mode first
          sendPermissionMode(conn, permissionModeRef.current);
          
          // Send current text content immediately
          sendTextUpdate(conn, textContent);
          
          // Listen for incoming messages from receiver
          conn.on('data', (data: any) => {
            if (data.type === 'cursor-update') {
              console.log('Receiver cursor at:', data.data.cursorPosition);
            } else if (data.type === 'text-update') {
              // Handle incoming text updates from viewers (in read-write mode)
              const update = data.data;
              if (update.senderId !== peerIdRef.current) {
                setTextContent(update.content);
                // Broadcast to all other connections
                const otherConnections = connectionsRef.current.filter(c => c !== conn && c.open);
                broadcastTextUpdate(otherConnections, update.content, update.cursorPosition, update.senderId);
              }
            }
          });
        });

        conn.on('close', () => {
          console.log('Connection closed:', conn.peer);
          setConnections(prev => {
            const updated = prev.filter(c => c !== conn);
            setConnectedUsers(updated.length);
            connectionsRef.current = updated;
            return updated;
          });
          toast.info('A viewer disconnected');
        });

        conn.on('error', (error) => {
          console.error('Connection error:', error);
          toast.error('Connection error occurred');
        });
      });

      toast.success('Text sharing initialized! Share the link with viewers.');
    } catch (error) {
      console.error('Peer initialization error:', error);
      toast.error('Failed to initialize text sharing');
    } finally {
      setIsInitializing(false);
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
      // Send update to all connected peers
      broadcastTextUpdate(
        connectionsRef.current,
        newText,
        textareaRef.current?.selectionStart,
        peerIdRef.current || undefined
      );
    }, 100); // 100ms debounce
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      const success = await copyToClipboard(shareLink);
      if (success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Failed to copy link');
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

  return (
    <AnimatedElement>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Share Text (P2P Real-Time)</CardTitle>
          <CardDescription>
            Create a real-time text editor that others can view through a peer-to-peer connection
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Important Guidelines */}
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertTitle className="text-amber-900 dark:text-amber-400 font-semibold">
              Important: Requirements for Real-Time Text Sharing
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300 mt-2">
              <ul className="space-y-1.5 text-sm list-disc list-inside">
                <li>
                  <strong>Stay on this page</strong> - Do not navigate away or close this tab
                </li>
                <li>
                  <strong>Keep browser active</strong> - Viewers will see your text updates in real-time
                </li>
                <li>
                  <strong>Both parties must be online</strong> - You and viewers must be connected simultaneously
                </li>
                <li>
                  <strong>Stable network required</strong> - Maintain a stable internet connection
                </li>
                <li>
                  <strong>Choose access mode</strong> - Set read-only (viewers can't edit) or read-write (collaborative editing)
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {!shareLink ? (
            <div className="text-center py-8">
              <Button
                onClick={initializeSharing}
                disabled={isInitializing}
                size="lg"
              >
                {isInitializing ? 'Initializing...' : 'Start Text Sharing'}
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Click to initialize and get your shareable link
              </p>
            </div>
          ) : (
            <>
              {/* Connection Status */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {connectedUsers > 0 ? (
                    <span className="text-green-600 font-medium">
                      {connectedUsers} viewer(s) connected
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Waiting for viewers to connect...
                    </span>
                  )}
                </span>
              </div>

              {/* Permission Mode Toggle */}
              <div className="space-y-2">
                <label className="font-medium">Access Mode</label>
                <div className="flex gap-2">
                  <Button
                    variant={permissionMode === 'read-only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPermissionMode('read-only');
                      permissionModeRef.current = 'read-only';
                      connectionsRef.current.forEach(conn => sendPermissionMode(conn, 'read-only'));
                      toast.success('Mode changed to Read-Only');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Read-Only
                  </Button>
                  <Button
                    variant={permissionMode === 'read-write' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPermissionMode('read-write');
                      permissionModeRef.current = 'read-write';
                      connectionsRef.current.forEach(conn => sendPermissionMode(conn, 'read-write'));
                      toast.success('Mode changed to Read-Write (Collaborative)');
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Read-Write
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {permissionMode === 'read-only' 
                    ? 'Viewers can only read your text' 
                    : 'Viewers can edit the text collaboratively in real-time'}
                </p>
              </div>

              {/* Text Editor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-medium">Your Text</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!textContent}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <Textarea
                  ref={textareaRef}
                  value={textContent}
                  onChange={handleTextChange}
                  placeholder="Start typing... Your text will be shared in real-time with connected viewers."
                  className="min-h-[300px] font-mono text-sm"
                  rows={15}
                />
                <p className="text-xs text-muted-foreground">
                  {textContent.length} characters
                  {connectedUsers > 0 && ' • Broadcasting to ' + connectedUsers + ' viewer(s)'}
                </p>
              </div>

              {/* Share Link */}
              <div className="space-y-2">
                <p className="font-medium">Share Link</p>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with anyone who wants to view your text in real-time. 
                  <strong className="text-amber-600 dark:text-amber-500"> Keep this page open</strong> for the connection to work.
                </p>
              </div>

              {/* QR Code */}
              <div className="space-y-2">
                <p className="font-medium">QR Code</p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={shareLink}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan with a mobile device to view
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default TextSharer;
