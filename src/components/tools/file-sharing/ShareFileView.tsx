'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, CheckCircle2, FileText, Image, Film, Music, Archive, File, Wifi, WifiOff, Info } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import Peer from 'peerjs';
import { initializePeer, receiveFile, downloadFile, TransferProgress, FileMetadata } from '@/lib/peer-file-transfer';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

type ConnectionStatus = 'connecting' | 'connected' | 'receiving' | 'complete' | 'error';

const getFileIcon = (fileName: string, size: number = 64) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const iconClass = `h-${size} w-${size}`;

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <Image className={iconClass} />;
  }
  if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext || '')) {
    return <Film className={iconClass} />;
  }
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) {
    return <Music className={iconClass} />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
    return <Archive className={iconClass} />;
  }
  if (['txt', 'doc', 'docx', 'pdf'].includes(ext || '')) {
    return <FileText className={iconClass} />;
  }
  return <File className={iconClass} />;
};

const ShareFileView: React.FC = () => {
  const { peerId } = useParams<{ peerId: string }>();
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [receivedFile, setReceivedFile] = useState<Blob | null>(null);
  const [transferProgress, setTransferProgress] = useState<TransferProgress | null>(null);

  useEffect(() => {
    if (!peerId) {
      setError('Invalid share link');
      setStatus('error');
      return;
    }

    const connectToPeer = async () => {
      try {
        // Initialize our own peer
        const newPeer = await initializePeer();
        setPeer(newPeer);

        // Connect to the sender
        const conn = newPeer.connect(peerId);

        conn.on('open', () => {
          console.log('Connected to sender');
          setStatus('connected');
          toast.success('Connected to sender!');

          // Start receiving file
          setStatus('receiving');
          receiveFile(conn, (progress) => {
            setTransferProgress(progress);
          })
            .then(({ file, metadata }) => {
              setReceivedFile(file);
              setFileMetadata(metadata);
              setStatus('complete');
              toast.success('File received successfully!');
            })
            .catch((error) => {
              console.error('Receive error:', error);
              setError('Failed to receive file');
              setStatus('error');
              toast.error('Failed to receive file');
            });
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
      if (peer) {
        peer.destroy();
      }
    };
  }, [peerId]);

  const handleDownload = () => {
    if (receivedFile && fileMetadata) {
      downloadFile(receivedFile, fileMetadata.name);
      toast.success('Download started!');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connecting':
        return (
          <Badge variant="outline" className="gap-2 border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Connecting
          </Badge>
        );
      case 'connected':
        return (
          <Badge variant="outline" className="gap-2 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
            <Wifi className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'receiving':
        return (
          <Badge variant="outline" className="gap-2 border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Receiving
          </Badge>
        );
      case 'complete':
        return (
          <Badge variant="outline" className="gap-2 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Complete
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
    switch (status) {
      case 'connecting':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
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
            </div>

            <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="text-foreground/90">
                    <strong>P2P File Transfer</strong> - Your file will be transferred directly from the sender's device to yours.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    No files are stored on any server. Keep this page open to maintain the connection.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'connected':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
                <CheckCircle2 className="relative h-20 w-20 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Connected Successfully!</h2>
              <p className="text-muted-foreground">
                Preparing to receive file...
              </p>
            </div>

            <div className="rounded-xl border-2 border-green-500/50 bg-green-500/5 p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Connection Established
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    File transfer will begin shortly. Please keep this page open.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'receiving':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <Loader2 className="relative h-16 w-16 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Receiving File</h2>
              <p className="text-muted-foreground">Please keep this page open...</p>
            </div>

            {transferProgress && (
              <div className="space-y-6">
                <div className="rounded-xl border bg-muted/50 p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Transfer Progress</span>
                    <span className="text-2xl font-bold">{transferProgress.percentage.toFixed(1)}%</span>
                  </div>

                  <div className="relative">
                    <Progress value={transferProgress.percentage} className="h-3" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatFileSize(transferProgress.loaded)}</span>
                    <span>{formatFileSize(transferProgress.total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl border bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Speed</p>
                    <p className="text-lg font-bold text-blue-600">
                      ~{((transferProgress.loaded / 1024 / 1024) / 2).toFixed(1)} MB/s
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl border bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Received</p>
                    <p className="text-lg font-bold text-purple-600">{formatFileSize(transferProgress.loaded)}</p>
                  </div>
                  <div className="text-center p-4 rounded-xl border bg-gradient-to-br from-pink-500/5 to-pink-500/10">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Remaining</p>
                    <p className="text-lg font-bold text-pink-600">
                      {formatFileSize(transferProgress.total - transferProgress.loaded)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative inline-block mb-6"
              >
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
                <CheckCircle2 className="relative h-20 w-20 text-green-500" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">File Received!</h2>
              <p className="text-muted-foreground">Your file is ready to download</p>
            </div>

            {fileMetadata && (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

                  <div className="relative space-y-6">
                    <div className="flex items-center justify-center">
                      <div className="p-6 rounded-2xl bg-background/80 backdrop-blur-sm border-2 shadow-lg">
                        {getFileIcon(fileMetadata.name, 16)}
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-bold break-all px-4">{fileMetadata.name}</h3>
                      <div className="flex items-center justify-center gap-3">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {formatFileSize(fileMetadata.size)}
                        </Badge>
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {fileMetadata.type || 'Unknown type'}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      onClick={handleDownload}
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download File
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="text-foreground/90">
                        <strong>Transfer Complete!</strong> Your file has been successfully received via peer-to-peer connection.
                      </p>
                      <p className="text-muted-foreground mt-2">
                        Click the download button above to save the file to your device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl" />
                <WifiOff className="relative h-20 w-20 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Connection Failed</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {error || 'Unable to establish connection with the sender'}
              </p>
            </div>

            <div className="rounded-xl border-2 border-red-500/50 bg-red-500/5 p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    Connection Error
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                    Unable to connect to the sender. Please check the following:
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
                    <li>The sender is online and has the page open</li>
                    <li>The share link is correct and hasn't expired</li>
                    <li>Both devices have stable internet connections</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <AnimatedElement className="w-full max-w-2xl">
        <Card className="border-2 shadow-2xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-8 py-6 border-b">
            <div className="absolute inset-0 bg-grid-white/5" />
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Receive Shared File</h1>
                <p className="text-sm text-muted-foreground">
                  Secure peer-to-peer file transfer
                </p>
              </div>
              {getStatusBadge()}
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

export default ShareFileView;