'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Copy, QrCode, Users, Wifi, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedElement from '@/components/animated-element';
import Peer, { DataConnection } from 'peerjs';
import { initializePeer, sendFile, createShareLink, TransferProgress } from '@/lib/peer-file-transfer';
import { Progress } from '@/components/ui/progress';

interface FileInfo {
  file: File;
  shareLink: string;
  peerId: string;
}

const FileSharer: React.FC = () => {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [transferProgress, setTransferProgress] = useState<TransferProgress | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [customId, setCustomId] = useState('');
  const [idLength, setIdLength] = useState(5);

  useEffect(() => {
    // Cleanup peer connection on unmount
    return () => {
      if (peer) {
        peer.destroy();
      }
    };
  }, [peer]);

  // Prevent page refresh when file is ready to share
  useEffect(() => {
    if (!fileInfo) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
      return ''; // Some browsers require a return value
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fileInfo]);


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 500MB');
      return;
    }

    setIsUploading(true);

    try {
      // Initialize PeerJS connection with custom ID or length
      const newPeer = await initializePeer(customId || undefined, idLength);
      setPeer(newPeer);

      const peerId = newPeer.id!;
      const shareLink = createShareLink(peerId);

      setFileInfo({
        file,
        shareLink,
        peerId
      });

      // Listen for incoming connections
      newPeer.on('connection', (conn) => {
        console.log('Receiver connected:', conn.peer);
        setConnections(prev => [...prev, conn]);

        conn.on('open', async () => {
          toast.success('Receiver connected! Starting transfer...');
          setIsTransferring(true);

          try {
            await sendFile(conn, file, (progress) => {
              setTransferProgress(progress);
            });

            toast.success('File sent successfully!');
            setIsTransferring(false);
            setTransferProgress(null);
          } catch (error) {
            console.error('Transfer error:', error);
            toast.error('Failed to send file');
            setIsTransferring(false);
          }
        });

        conn.on('close', () => {
          console.log('Connection closed');
          setConnections(prev => prev.filter(c => c !== conn));
        });

        conn.on('error', (error) => {
          console.error('Connection error:', error);
          toast.error('Connection error occurred');
        });
      });

      toast.success('File ready to share! Share the link with the receiver.');
    } catch (error) {
      console.error('Peer initialization error:', error);
      toast.error('Failed to initialize file sharing');
    } finally {
      setIsUploading(false);
    }
  }, [customId, idLength]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: false,
    noKeyboard: false,
    preventDropOnDocument: true, // Prevent browser from opening file
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <AnimatedElement>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Share File (P2P)</CardTitle>
          <CardDescription>
            Upload a file to share it directly with anyone through a peer-to-peer connection
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Important Guidelines */}
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertTitle className="text-amber-900 dark:text-amber-400 font-semibold">
              Important: Requirements for Successful File Sharing
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300 mt-2">
              <ul className="space-y-1.5 text-sm list-disc list-inside">
                <li>
                  <strong>Stay on this page</strong> - Do not navigate away or close this tab until the transfer is complete
                </li>
                <li>
                  <strong>Keep browser active</strong> - Do not minimize the browser or switch to another tab for extended periods
                </li>
                <li>
                  <strong>Both parties must be online</strong> - You and the receiver must be connected simultaneously
                </li>
                <li>
                  <strong>Stable network required</strong> - Maintain a stable internet connection throughout the transfer
                </li>
                <li>
                  <strong>File size limit</strong> - Maximum file size is 500MB
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Link Customization */}
          {!fileInfo && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Customize Your Share Link (Optional)</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custom ID</label>
                <Input
                  placeholder="Leave empty for auto-generated ID"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  maxLength={10}
                  disabled={isUploading}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Use only letters and numbers. Leave empty to auto-generate.
                </p>
              </div>

              {!customId && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Auto-Generated ID Length</label>
                    <span className="text-sm font-mono bg-primary/10 px-2 py-0.5 rounded">
                      {idLength} characters
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={idLength}
                    onChange={(e) => setIdLength(parseInt(e.target.value))}
                    disabled={isUploading}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3 (shorter)</span>
                    <span>10 (more secure)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            {isUploading ? (
              <p>Preparing file...</p>
            ) : isDragActive ? (
              <p>Drop the file here</p>
            ) : (
              <div className="space-y-2">
                <p>Drag & drop a file here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Maximum file size: 500MB
                </p>
              </div>
            )}
          </div>

          {fileInfo && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium mb-1">File Details</p>
                <p className="text-sm text-muted-foreground">
                  {fileInfo.file.name} ({(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>

              {/* Warning: Don't refresh */}
              <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <AlertTitle className="text-amber-900 dark:text-amber-400 font-semibold">
                  Keep This Page Open!
                </AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                  <strong>Do not refresh, close, or navigate away from this page.</strong> Your file is ready to share, and the connection will be lost if you leave.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {connections.length > 0 ? (
                    <span className="text-green-600 font-medium">
                      {connections.length} receiver(s) connected
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Waiting for receiver to connect...
                    </span>
                  )}
                </span>
              </div>

              {isTransferring && transferProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Transferring...</span>
                    <span>{transferProgress.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={transferProgress.percentage} />
                </div>
              )}

              <div className="space-y-2">
                <p className="font-medium">Share Link</p>
                <div className="flex gap-2">
                  <Input
                    value={fileInfo.shareLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(fileInfo.shareLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with the receiver. <strong className="text-amber-600 dark:text-amber-500">Keep this page open</strong> - both of you must stay online and on your respective pages for the transfer to work.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">QR Code</p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={fileInfo.shareLink}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default FileSharer;