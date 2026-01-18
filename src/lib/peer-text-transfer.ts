import Peer, { DataConnection } from 'peerjs';

export interface TextUpdate {
    content: string;
    timestamp: number;
    cursorPosition?: number;
}

/**
 * Initialize a new PeerJS instance for text sharing
 */
export function initializeTextPeer(peerId?: string): Promise<Peer> {
    return new Promise((resolve, reject) => {
        const peer = new Peer(peerId, {
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
 * Send text update to a connected peer
 */
export function sendTextUpdate(
    connection: DataConnection,
    content: string,
    cursorPosition?: number
): void {
    const update: TextUpdate = {
        content,
        timestamp: Date.now(),
        cursorPosition
    };
    
    connection.send({ type: 'text-update', data: update });
}

/**
 * Send cursor position update
 */
export function sendCursorUpdate(
    connection: DataConnection,
    cursorPosition: number
): void {
    connection.send({ 
        type: 'cursor-update', 
        data: { cursorPosition, timestamp: Date.now() } 
    });
}

/**
 * Send notification that user is typing
 */
export function sendTypingNotification(
    connection: DataConnection,
    isTyping: boolean
): void {
    connection.send({ 
        type: 'typing', 
        data: { isTyping, timestamp: Date.now() } 
    });
}

/**
 * Create a shareable link with peer ID for text sharing
 */
export function createTextShareLink(peerId: string): string {
    return `${window.location.origin}/t/${peerId}`;
}

/**
 * Extract peer ID from text share URL
 */
export function extractPeerIdFromTextUrl(url: string): string | null {
    const match = url.match(/\/t\/([^\/]+)/);
    return match ? match[1] : null;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Download text as a file
 */
export function downloadTextFile(content: string, filename: string = 'shared-text.txt'): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
