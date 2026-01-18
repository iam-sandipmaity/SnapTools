'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Loader2, AlertCircle, CheckCircle, Copy, Eye } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

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
              toast.info(`Mode changed to ${data.data.mode === 'read-only' ? 'Read-Only' : 'Read-Write (Collaborative)'}`);
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

  const getStatusBadge = () => {
    switch (status) {
      case 'connecting':
        return (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Connecting...</span>
          </div>
        );
      case 'connected':
      case 'receiving':
        return (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Connected</span>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                • Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Disconnected</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Connection Error</span>
          </div>
        );
    }
  };

  const renderContent = () => {
    if (status === 'error') {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to connect. Please make sure the sender is online and the link is correct.'}
          </AlertDescription>
        </Alert>
      );
    }

    if (status === 'connecting') {
      return (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-lg font-medium">Connecting to sender...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we establish a connection
          </p>
        </div>
      );
    }

    if (status === 'disconnected') {
      return (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The connection has been closed. The sender may have left or closed their browser.
              You can still view and copy the last received text below.
            </AlertDescription>
          </Alert>

          {textContent && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-medium">Last Received Text (Read-Only)</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyText}
                      disabled={!textContent}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
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
                </div>
                <Textarea
                  ref={textareaRef}
                  value={textContent}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-muted/50"
                  rows={15}
                />
                <p className="text-xs text-muted-foreground">
                  {textContent.length} characters
                </p>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {status === 'connected' && !textContent && (
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Connected and ready! Waiting for the sender to start typing...
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-medium">Shared Text (Read-Only)</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyText}
                disabled={!textContent}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
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
          </div>
          <Textarea
            ref={textareaRef}
            value={textContent}
            onChange={handleTextChange}
            readOnly={permissionMode === 'read-only'}
            placeholder={permissionMode === 'read-write' ? 'Type here to edit collaboratively...' : 'Waiting for text...'}
            className={`min-h-[300px] font-mono text-sm ${permissionMode === 'read-only' ? 'bg-muted/50' : 'bg-background'}`}
            rows={15}
          />
          <p className="text-xs text-muted-foreground">
            {textContent.length} characters
            {textContent && ' • Updates in real-time'}
            {permissionMode === 'read-write' && ' • Collaborative editing enabled'}
          </p>
        </div>

        <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <Eye className="h-4 w-4 text-blue-600 dark:text-blue-500" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            {permissionMode === 'read-only' 
              ? 'You are viewing this text in real-time. Any changes made by the owner will appear here instantly. Keep this page open to maintain the connection.'
              : 'Collaborative editing enabled! You can edit this text and your changes will sync in real-time with all connected users. Keep this page open to maintain the connection.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <AnimatedElement>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>View Shared Text (P2P Real-Time)</CardTitle>
              <CardDescription>
                Viewing text shared by another user in real-time
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderContent()}
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default ShareTextView;
