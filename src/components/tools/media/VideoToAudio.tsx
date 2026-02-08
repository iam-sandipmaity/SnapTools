import { useState, useEffect } from 'react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileAudio, Download, RefreshCw, AlertCircle, Video } from 'lucide-react';
import { fetchFile } from '@ffmpeg/util';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const VideoToAudio = () => {
    const { ffmpeg, loaded, load, isLoading } = useFFmpeg();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [targetFormat, setTargetFormat] = useState('mp3');

    useEffect(() => {
        load();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setAudioUrl(null);
            setProgress(0);
        }
    };

    const extractAudio = async () => {
        if (!videoFile || !loaded) return;

        setIsConverting(true);
        setProgress(0);
        const inputFileName = 'input.mp4';
        const outputFileName = `output.${targetFormat}`;

        try {
            await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

            ffmpeg.on('progress', ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            await ffmpeg.exec([
                '-i', inputFileName,
                '-vn', // No video
                '-acodec', targetFormat === 'mp3' ? 'libmp3lame' : 'copy',
                outputFileName
            ]);

            const data = await ffmpeg.readFile(outputFileName);
            const mimeType = targetFormat === 'mp3' ? 'audio/mpeg' : `audio/${targetFormat}`;
            const url = URL.createObjectURL(new Blob([data], { type: mimeType }));
            setAudioUrl(url);

            toast.success('Audio extracted successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to extract audio.');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Video to Audio</CardTitle>
                    <CardDescription>
                        Extract audio from video files. Convert video to MP3, WAV, etc.
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
                            <p>Failed to load video processor. Please refresh the page.</p>
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
                                    <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Video className="text-primary w-6 h-6" />
                                            <span className="font-medium">{videoFile.name}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setVideoFile(null)}>
                                            Remove
                                        </Button>
                                    </div>

                                    <div className="flex gap-4 items-end">
                                        <div className="w-full sm:w-48 space-y-2">
                                            <label className="text-sm font-medium">Output Format</label>
                                            <Select value={targetFormat} onValueChange={setTargetFormat}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mp3">MP3</SelectItem>
                                                    <SelectItem value="wav">WAV</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={extractAudio}
                                            disabled={isConverting}
                                            className="w-full sm:w-auto"
                                        >
                                            {isConverting ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                    Extracting...
                                                </>
                                            ) : (
                                                'Extract Audio'
                                            )}
                                        </Button>
                                    </div>

                                    {isConverting && (
                                        <div className="space-y-1">
                                            <Progress value={progress} />
                                            <p className="text-xs text-center text-muted-foreground">{progress}%</p>
                                        </div>
                                    )}

                                    {audioUrl && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg text-center space-y-4">
                                            <h3 className="font-medium text-green-800 dark:text-green-300">Audio Extracted!</h3>
                                            <div className="flex justify-center gap-4">
                                                <audio controls src={audioUrl} className="h-10" />
                                                <a
                                                    href={audioUrl}
                                                    download={`audio_${videoFile.name.split('.')[0]}.${targetFormat}`}
                                                >
                                                    <Button size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download Audio
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

export default VideoToAudio;
