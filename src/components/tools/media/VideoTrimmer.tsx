import { useState, useRef, useEffect } from 'react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileVideo, Download, RefreshCw, AlertCircle, Scissors, Play, Pause } from 'lucide-react';
import { fetchFile } from '@ffmpeg/util';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const VideoTrimmer = () => {
    const { ffmpeg, loaded, load, isLoading } = useFFmpeg();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Time state
    const [startTime, setStartTime] = useState('00:00:00');
    const [endTime, setEndTime] = useState('00:00:10');

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        load();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
            setTrimmedVideoUrl(null);
            setProgress(0);
        }
    };

    const formatTime = (seconds: number) => {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    };

    const handleSetStart = () => {
        if (videoRef.current) {
            setStartTime(formatTime(videoRef.current.currentTime));
        }
    };

    const handleSetEnd = () => {
        if (videoRef.current) {
            setEndTime(formatTime(videoRef.current.currentTime));
        }
    };

    const trimVideo = async () => {
        if (!videoFile || !loaded) return;

        setIsProcessing(true);
        setProgress(0);

        const inputFileName = 'input.mp4';
        const outputFileName = 'output.mp4';

        try {
            await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

            ffmpeg.on('progress', ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            // Using -ss (start) and -to (end) with -c copy for fast trimming without re-encoding
            // Note: -c copy might not be perfectly precise at frame level if not at keyframe, 
            // but it's much faster. For precise trimming, re-encoding is needed.
            // Let's stick to copy for speed as requested generally, or re-encode if user wants (maybe add option later).
            // Actually user asked for optimization/speed earlier, so let's try copy first. 
            // If copy fails or is weird, we can switch to re-encoding.

            await ffmpeg.exec([
                '-i', inputFileName,
                '-ss', startTime,
                '-to', endTime,
                '-c:v', 'libx264', // Re-encoding ensures precision and compatibility
                '-c:a', 'copy',
                '-preset', 'ultrafast',
                outputFileName
            ]);

            const data = await ffmpeg.readFile(outputFileName);
            const url = URL.createObjectURL(new Blob([data as any], { type: 'video/mp4' }));
            setTrimmedVideoUrl(url);

            toast.success('Video trimmed successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to trim video.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Video Trimmer</CardTitle>
                    <CardDescription>
                        Trim video files online. Use the player to set precise start and end times.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!loaded && isLoading && (
                        <div className="text-center py-10">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                            <p className="text-muted-foreground">Loading FFmpeg core...</p>
                        </div>
                    )}

                    {!loaded && !isLoading && (
                        <div className="text-center py-6 bg-destructive/10 rounded-lg text-destructive">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <p>Failed to load processor. Please refresh the page.</p>
                            <Button variant="outline" onClick={() => load()} className="mt-4">Retry</Button>
                        </div>
                    )}

                    {loaded && (
                        <>
                            {!videoFile && (
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <label
                                        htmlFor="video-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">Click to upload video</p>
                                        </div>
                                        <input
                                            id="video-upload"
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            )}

                            {videoFile && videoUrl && (
                                <div className="space-y-6">
                                    <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileVideo className="text-primary w-6 h-6" />
                                            <span className="font-medium">{videoFile.name}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setVideoFile(null);
                                            setVideoUrl(null);
                                            setTrimmedVideoUrl(null);
                                        }}>
                                            Change Video
                                        </Button>
                                    </div>

                                    {/* Video Player for Preview */}
                                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                        <video
                                            ref={videoRef}
                                            src={videoUrl}
                                            controls
                                            className="w-full h-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Start Time (HH:MM:SS)</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                />
                                                <Button size="icon" variant="outline" onClick={handleSetStart} title="Set to current time">
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">End Time (HH:MM:SS)</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                />
                                                <Button size="icon" variant="outline" onClick={handleSetEnd} title="Set to current time">
                                                    <Pause className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={trimVideo}
                                        disabled={isProcessing}
                                        className="w-full"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Trimming...
                                            </>
                                        ) : (
                                            <>
                                                <Scissors className="mr-2 h-4 w-4" />
                                                Trim Video
                                            </>
                                        )}
                                    </Button>

                                    {isProcessing && (
                                        <div className="space-y-1">
                                            <Progress value={progress} />
                                            <p className="text-xs text-center text-muted-foreground">{progress}%</p>
                                        </div>
                                    )}

                                    {trimmedVideoUrl && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg text-center space-y-4">
                                            <h3 className="font-medium text-green-800 dark:text-green-300">Video Trimmed Successfully!</h3>
                                            <div className="flex justify-center gap-4">
                                                <a
                                                    href={trimmedVideoUrl}
                                                    download={`trimmed_${videoFile.name}`}
                                                >
                                                    <Button size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download Video
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoTrimmer;
