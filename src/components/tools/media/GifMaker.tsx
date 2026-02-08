import { useState, useEffect } from 'react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileVideo, Download, RefreshCw, AlertCircle, Film } from 'lucide-react';
import { fetchFile } from '@ffmpeg/util';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const GifMaker = () => {
    const { ffmpeg, loaded, load, isLoading } = useFFmpeg();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setGifUrl(null);
            setProgress(0);
        }
    };

    const convertToGif = async () => {
        if (!videoFile || !loaded) return;

        setIsConverting(true);
        setProgress(0);
        const inputFileName = 'input.mp4';
        const outputFileName = 'output.gif';

        try {
            await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

            ffmpeg.on('progress', ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            // fps=10,scale=320:-1:flags=lanczos
            await ffmpeg.exec([
                '-i', inputFileName,
                '-vf', 'fps=10,scale=480:-1:flags=lanczos',
                '-c:v', 'gif',
                outputFileName
            ]);

            const data = await ffmpeg.readFile(outputFileName);
            const url = URL.createObjectURL(new Blob([data as any], { type: 'image/gif' }));
            setGifUrl(url);

            toast.success('GIF created successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create GIF.');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>GIF Maker</CardTitle>
                    <CardDescription>
                        Convert video to animated GIF online free.
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
                                            <FileVideo className="text-primary w-6 h-6" />
                                            <span className="font-medium">{videoFile.name}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setVideoFile(null)}>
                                            Remove
                                        </Button>
                                    </div>

                                    <Button
                                        onClick={convertToGif}
                                        disabled={isConverting}
                                        className="w-full sm:w-auto"
                                    >
                                        {isConverting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Creating GIF...
                                            </>
                                        ) : (
                                            'Create GIF'
                                        )}
                                    </Button>

                                    {isConverting && (
                                        <div className="space-y-1">
                                            <Progress value={progress} />
                                            <p className="text-xs text-center text-muted-foreground">{progress}%</p>
                                        </div>
                                    )}

                                    {gifUrl && (
                                        <div className="bg-muted/30 rounded-lg p-6 text-center space-y-4">
                                            <h3 className="font-medium">Created GIF</h3>
                                            <div className="flex justify-center">
                                                <img src={gifUrl} alt="Created GIF" className="max-w-full rounded-md shadow-sm" />
                                            </div>
                                            <a
                                                href={gifUrl}
                                                download={`animated_${videoFile.name.split('.')[0]}.gif`}
                                            >
                                                <Button size="sm" variant="secondary">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download GIF
                                                </Button>
                                            </a>
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

export default GifMaker;
