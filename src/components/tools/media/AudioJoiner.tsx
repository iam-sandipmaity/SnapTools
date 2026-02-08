import { useState, useEffect } from 'react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Music, Download, RefreshCw, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { fetchFile } from '@ffmpeg/util';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const AudioJoiner = () => {
    const { ffmpeg, loaded, load, isLoading } = useFFmpeg();
    const [audioFiles, setAudioFiles] = useState<File[]>([]);
    const [joinedAudioUrl, setJoinedAudioUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAudioFiles(prev => [...prev, ...newFiles]);
            setJoinedAudioUrl(null);
            setProgress(0);
        }
    };

    const removeFile = (index: number) => {
        setAudioFiles(prev => prev.filter((_, i) => i !== index));
    };

    const joinAudio = async () => {
        if (audioFiles.length < 2 || !loaded) {
            toast.error('Please upload at least 2 audio files.');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        const outputFileName = 'output.mp3';

        try {
            // Write all files
            const inputArgs: string[] = [];
            const filterInputs: string[] = [];

            for (let i = 0; i < audioFiles.length; i++) {
                const fileName = `input${i}.${audioFiles[i].name.split('.').pop()}`;
                await ffmpeg.writeFile(fileName, await fetchFile(audioFiles[i]));
                inputArgs.push('-i', fileName);
                filterInputs.push(`[${i}:a]`);
            }

            ffmpeg.on('progress', ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            // Creates filter complex string: [0:a][1:a]concat=n=2:v=0:a=1[out]
            const filterComplex = `${filterInputs.join('')}concat=n=${audioFiles.length}:v=0:a=1[out]`;

            await ffmpeg.exec([
                ...inputArgs,
                '-filter_complex', filterComplex,
                '-map', '[out]',
                outputFileName
            ]);

            const data = await ffmpeg.readFile(outputFileName);
            const url = URL.createObjectURL(new Blob([data as any], { type: 'audio/mpeg' }));
            setJoinedAudioUrl(url);

            toast.success('Audio merged successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to merge audio.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Audio Joiner</CardTitle>
                    <CardDescription>
                        Merge multiple audio files into a single track.
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
                                        <Plus className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Click to add audio files</p>
                                    </div>
                                    <input
                                        id="audio-upload"
                                        type="file"
                                        accept="audio/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {audioFiles.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-medium">Files to Merge ({audioFiles.length})</h3>
                                    <div className="bg-muted/30 rounded-lg divide-y">
                                        {audioFiles.map((file, index) => (
                                            <div key={index} className="p-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <Music className="text-primary w-4 h-4" />
                                                    <span className="text-sm">{file.name}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={joinAudio}
                                        disabled={isProcessing || audioFiles.length < 2}
                                        className="w-full"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Merging...
                                            </>
                                        ) : (
                                            'Merge Files'
                                        )}
                                    </Button>

                                    {isProcessing && (
                                        <div className="space-y-1">
                                            <Progress value={progress} />
                                            <p className="text-xs text-center text-muted-foreground">{progress}%</p>
                                        </div>
                                    )}

                                    {joinedAudioUrl && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg text-center space-y-4">
                                            <h3 className="font-medium text-green-800 dark:text-green-300">Mergin Complete!</h3>
                                            <div className="flex justify-center gap-4">
                                                <audio controls src={joinedAudioUrl} className="h-10" />
                                                <a
                                                    href={joinedAudioUrl}
                                                    download="merged_audio.mp3"
                                                >
                                                    <Button size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download Merged Audio
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

export default AudioJoiner;
