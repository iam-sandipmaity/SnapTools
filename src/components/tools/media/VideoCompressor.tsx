import { useState, useEffect } from 'react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileVideo, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchFile } from '@ffmpeg/util';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const VideoCompressor = () => {
    const { ffmpeg, loaded, load, isLoading } = useFFmpeg();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [compressionLevel, setCompressionLevel] = useState('medium');
    const [resolution, setResolution] = useState('original');
    const [progress, setProgress] = useState(0);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressedVideoUrl, setCompressedVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        load();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setCompressedVideoUrl(null);
            setProgress(0);
        }
    };

    const compressVideo = async () => {
        if (!videoFile || !loaded) return;

        setIsCompressing(true);
        setProgress(0);

        const inputFileName = 'input.mp4';
        const outputFileName = 'output.mp4';

        try {
            await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

            let crf = '23'; // Medium
            if (compressionLevel === 'low') crf = '18'; // High quality, low compression
            if (compressionLevel === 'high') crf = '28'; // Low quality, high compression

            ffmpeg.on('progress', ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            const ffmpegArgs = [
                '-i', inputFileName,
                '-vcodec', 'libx264',
                '-crf', crf,
                '-preset', 'ultrafast',
            ];

            if (resolution !== 'original') {
                ffmpegArgs.push('-vf', `scale=-2:${resolution}`);
            }

            ffmpegArgs.push(outputFileName);

            await ffmpeg.exec(ffmpegArgs);

            const data = await ffmpeg.readFile(outputFileName);
            const url = URL.createObjectURL(new Blob([data as any], { type: 'video/mp4' }));
            setCompressedVideoUrl(url);

            toast.success('Video compressed successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to compress video.');
        } finally {
            setIsCompressing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Video Compressor</CardTitle>
                    <CardDescription>
                        Reduce video file size locally in your browser.
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

                            {videoFile && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-lg">
                                        <FileVideo className="w-8 h-8 text-primary" />
                                        <div>
                                            <p className="font-medium">{videoFile.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Compression Level</label>
                                            <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low (High Quality)</SelectItem>
                                                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                                                    <SelectItem value="high">High (Smallest Size)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Resolution (Resize)</label>
                                            <Select value={resolution} onValueChange={setResolution}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="original">Original</SelectItem>
                                                    <SelectItem value="720">720p (HD)</SelectItem>
                                                    <SelectItem value="480">480p (SD)</SelectItem>
                                                    <SelectItem value="360">360p (Low)</SelectItem>
                                                    <SelectItem value="240">240p (Very Low)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={compressVideo}
                                        disabled={isCompressing}
                                        className="w-full"
                                    >
                                        {isCompressing ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Compressing...
                                            </>
                                        ) : (
                                            'Compress Video'
                                        )}
                                    </Button>

                                    {isCompressing && (
                                        <div className="space-y-1">
                                            <Progress value={progress} />
                                            <p className="text-xs text-center text-muted-foreground">{progress}%</p>
                                        </div>
                                    )}

                                    {compressedVideoUrl && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg text-center space-y-4">
                                            <h3 className="font-medium text-green-800 dark:text-green-300">Compression Complete!</h3>
                                            <div className="flex justify-center gap-4">
                                                <a
                                                    href={compressedVideoUrl}
                                                    download={`compressed_${videoFile.name}`}
                                                >
                                                    <Button size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download Compressed Video
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

export default VideoCompressor;
