import Peer, { DataConnection } from 'peerjs';

export type PermissionMode = 'read-only' | 'read-write';

export interface TextUpdate {
    content: string;
    timestamp: number;
    cursorPosition?: number;
    senderId?: string;
}

export interface PermissionUpdate {
    mode: PermissionMode;
}

/**
 * Generate a short random peer ID
 * @param length - Length of the ID (8-16 characters, default: 8)
 */
function generateShortId(length: number = 8): string {
    const validLength = Math.max(8, Math.min(16, length));
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < validLength; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

/**
 * Initialize a new PeerJS instance for text sharing
 * @param customId - Optional custom peer ID provided by user
 * @param idLength - Optional length for auto-generated ID (8-16 characters)
 */
export function initializeTextPeer(customId?: string, idLength?: number): Promise<Peer> {
    return new Promise((resolve, reject) => {
        // Use custom ID if provided, otherwise generate one with specified length
        const id = customId || generateShortId(idLength);
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
 * Send text update to a connected peer
 */
export function sendTextUpdate(
    connection: DataConnection,
    content: string,
    cursorPosition?: number,
    senderId?: string
): void {
    const update: TextUpdate = {
        content,
        timestamp: Date.now(),
        cursorPosition,
        senderId
    };

    connection.send({ type: 'text-update', data: update });
}

/**
 * Broadcast text update to all connections
 */
export function broadcastTextUpdate(
    connections: DataConnection[],
    content: string,
    cursorPosition?: number,
    senderId?: string
): void {
    connections.forEach(conn => {
        if (conn.open) {
            sendTextUpdate(conn, content, cursorPosition, senderId);
        }
    });
}

/**
 * Send permission mode to a connected peer
 */
export function sendPermissionMode(
    connection: DataConnection,
    mode: PermissionMode
): void {
    connection.send({ type: 'permission', data: { mode } });
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
