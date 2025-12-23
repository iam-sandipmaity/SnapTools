'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import Peer from 'peerjs';
import { initializePeer, receiveFile, downloadFile, TransferProgress, FileMetadata } from '@/lib/peer-file-transfer';
import { Progress } from '@/components/ui/progress';

type ConnectionStatus = 'connecting' | 'connected' | 'receiving' | 'complete' | 'error';

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

  const renderContent = () => {
    switch (status) {
      case 'connecting':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg font-medium">Connecting to sender...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we establish a connection
            </p>
          </div>
        );

      case 'connected':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">Connected!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Preparing to receive file...
            </p>
          </div>
        );

      case 'receiving':
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium">Receiving file...</p>
            </div>

            {transferProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{transferProgress.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={transferProgress.percentage} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {(transferProgress.loaded / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span>
                    {(transferProgress.total / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">File received successfully!</p>
            </div>

            {fileMetadata && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium mb-1">File Details</p>
                <p className="text-sm text-muted-foreground">
                  {fileMetadata.name} ({(fileMetadata.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleDownload}
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium">Connection Failed</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error || 'An error occurred while connecting'}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Make sure the sender is online and the link is correct
            </p>
          </div>
        );
    }
  };

  return (
    <AnimatedElement>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Receive Shared File</CardTitle>
          <CardDescription>
            Downloading file via peer-to-peer connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default ShareFileView;