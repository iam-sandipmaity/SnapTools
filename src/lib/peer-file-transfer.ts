import Peer, { DataConnection } from 'peerjs';

const CHUNK_SIZE = 64 * 1024; // 64KB chunks

export interface FileMetadata {
    name: string;
    size: number;
    type: string;
}

export interface TransferProgress {
    loaded: number;
    total: number;
    percentage: number;
}

/**
 * Generate a short random peer ID
 */
function generateShortId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

/**
 * Initialize a new PeerJS instance
 */
export function initializePeer(peerId?: string): Promise<Peer> {
    return new Promise((resolve, reject) => {
        // Use custom short ID if not provided
        const id = peerId || generateShortId();
        // Use default PeerJS cloud server (0.peerjs.com)
        const peer = new Peer(id, {
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('open', () => {
            resolve(peer);
        });

        peer.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Send a file to a connected peer
 */
export async function sendFile(
    connection: DataConnection,
    file: File,
    onProgress?: (progress: TransferProgress) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        // Send file metadata first
        const metadata: FileMetadata = {
            name: file.name,
            size: file.size,
            type: file.type
        };

        connection.send({ type: 'metadata', data: metadata });

        // Read file and send in chunks
        const reader = new FileReader();
        let offset = 0;

        reader.onload = (e) => {
            if (e.target?.result) {
                connection.send({
                    type: 'chunk',
                    data: e.target.result
                });

                offset += CHUNK_SIZE;

                if (onProgress) {
                    onProgress({
                        loaded: Math.min(offset, file.size),
                        total: file.size,
                        percentage: Math.min((offset / file.size) * 100, 100)
                    });
                }

                if (offset < file.size) {
                    readNextChunk();
                } else {
                    connection.send({ type: 'done' });
                    resolve();
                }
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        const readNextChunk = () => {
            const slice = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        };

        // Start reading
        readNextChunk();
    });
}

/**
 * Receive a file from a connected peer
 */
export async function receiveFile(
    connection: DataConnection,
    onProgress?: (progress: TransferProgress) => void
): Promise<{ file: Blob; metadata: FileMetadata }> {
    return new Promise((resolve, reject) => {
        let metadata: FileMetadata | null = null;
        const chunks: ArrayBuffer[] = [];
        let receivedSize = 0;

        connection.on('data', (data: any) => {
            if (data.type === 'metadata') {
                metadata = data.data;
            } else if (data.type === 'chunk') {
                chunks.push(data.data);
                receivedSize += data.data.byteLength;

                if (metadata && onProgress) {
                    onProgress({
                        loaded: receivedSize,
                        total: metadata.size,
                        percentage: (receivedSize / metadata.size) * 100
                    });
                }
            } else if (data.type === 'done') {
                if (!metadata) {
                    reject(new Error('No metadata received'));
                    return;
                }

                const blob = new Blob(chunks, { type: metadata.type });
                resolve({ file: blob, metadata });
            }
        });

        connection.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Create a shareable link with peer ID
 */
export function createShareLink(peerId: string): string {
    return `${window.location.origin}/s/${peerId}`;
}

/**
 * Extract peer ID from share URL
 */
export function extractPeerIdFromUrl(url: string): string | null {
    const match = url.match(/\/s\/([^\/]+)/);
    return match ? match[1] : null;
}

/**
 * Download a blob as a file
 */
export function downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
