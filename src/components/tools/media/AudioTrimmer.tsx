import { useState, useEffect } from 'react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Music, Download, RefreshCw, AlertCircle, Scissors } from 'lucide-react';
import { fetchFile } from '@ffmpeg/util';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const AudioTrimmer = () => {
    const { ffmpeg, loaded, load, isLoading } = useFFmpeg();
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [trimmedAudioUrl, setTrimmedAudioUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [startTime, setStartTime] = useState('00:00:00');
    const [endTime, setEndTime] = useState('00:00:10');

    useEffect(() => {
        load();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            setTrimmedAudioUrl(null);
            setProgress(0);
            // Reset times or try to detect duration (requires more complex logic)
        }
    };

    const trimAudio = async () => {
        if (!audioFile || !loaded) return;

        setIsProcessing(true);
        setProgress(0);
        const inputExtension = audioFile.name.split('.').pop() || 'mp3';
        const inputFileName = `input.${inputExtension}`;
        const outputFileName = `output.${inputExtension}`;

        try {
            await ffmpeg.writeFile(inputFileName, await fetchFile(audioFile));

            ffmpeg.on('progress', ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            await ffmpeg.exec([
                '-i', inputFileName,
                '-ss', startTime,
                '-to', endTime,
                '-c', 'copy',
                outputFileName
            ]);

            const data = await ffmpeg.readFile(outputFileName);
            const url = URL.createObjectURL(new Blob([data as any], { type: `audio/${inputExtension}` }));
            setTrimmedAudioUrl(url);

            toast.success('Audio trimmed successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to trim audio. Please check start/end times.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Audio Trimmer</CardTitle>
                    <CardDescription>
                        Cut and trim audio files to any length.
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
                                    htmlFor="audio-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Click to upload audio</p>
                                    </div>
                                    <input
                                        id="audio-upload"
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {audioFile && (
                                <div className="space-y-6">
                                    <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Music className="text-primary w-6 h-6" />
                                            <span className="font-medium">{audioFile.name}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setAudioFile(null)}>
                                            Remove
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Start Time</label>
                                            <Input
                                                type="text"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                placeholder="00:00:00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">End Time</label>
                                            <Input
                                                type="text"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                placeholder="00:00:10"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={trimAudio}
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
                                                Trim Audio
                                            </>
                                        )}
                                    </Button>

                                    {isProcessing && (
                                        <div className="space-y-1">
                                            <Progress value={progress} />
                                            <p className="text-xs text-center text-muted-foreground">{progress}%</p>
                                        </div>
                                    )}

                                    {trimmedAudioUrl && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg text-center space-y-4">
                                            <h3 className="font-medium text-green-800 dark:text-green-300">Audio Trimmed!</h3>
                                            <div className="flex justify-center gap-4">
                                                <audio controls src={trimmedAudioUrl} className="h-10" />
                                                <a
                                                    href={trimmedAudioUrl}
                                                    download={`trimmed_${audioFile.name}`}
                                                >
                                                    <Button size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
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

export default AudioTrimmer;
