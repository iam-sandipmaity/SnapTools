'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Copy, QrCode, Users, Wifi } from 'lucide-react';
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

  useEffect(() => {
    // Cleanup peer connection on unmount
    return () => {
      if (peer) {
        peer.destroy();
      }
    };
  }, [peer]);

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
      // Initialize PeerJS connection
      const newPeer = await initializePeer();
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
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
                  Share this link with the receiver. Both of you must be online for the transfer to work.
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