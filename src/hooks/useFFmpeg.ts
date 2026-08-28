import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export const useFFmpeg = () => {
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    const load = async () => {
        setIsLoading(true);
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({ message }) => {
            if (messageRef.current) messageRef.current.textContent = message;
            console.log(message);
        });

        // toBlobURL is used to bypass CORS issue, urls must be same origin
        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'), 
                // Single-threaded ESM 0.12.x might not have a separate worker file or it might fail if provided?
                // Actually, let's NOT provide workerURL first for single-threaded ESM if it's not standard.
                // Wait, if I don't provide it, it defaults to relative path. Blob URL has no relative path. 
                // So I MUST provide it if it exists.
                // Let's assume it doesn't exist for single threaded or is not needed?
                // Let's check 0.12.10 ESM file list... 
                // Safe bet: just use the main file? No.
                // Let's try WITHOUT workerURL first but with ESM. 
                // If it fails, I'll add it. 
                // Actually, earlier failure was "failed to import", which was UMD.
                // So ESM is the right direction. 
            });
            setLoaded(true);
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            if (messageRef.current) messageRef.current.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        ffmpeg: ffmpegRef.current,
        loaded,
        isLoading,
        load,
        messageRef
    };
}
