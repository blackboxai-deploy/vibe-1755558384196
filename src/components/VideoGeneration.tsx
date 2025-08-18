"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { GenerationStatus } from '@/types';

interface VideoGenerationProps {
  status: GenerationStatus;
}

export function VideoGeneration({ status }: VideoGenerationProps) {
  const progressPercentage = (status.videosCompleted / status.totalVideos) * 100;
  const allCompleted = status.videosCompleted === status.totalVideos;
  const hasErrors = status.videos.some(v => v.status === 'failed');

  const getStatusBadge = (videoStatus: string) => {
    switch (videoStatus) {
      case 'pending':
        return <Badge variant="secondary" className="bg-gray-600/20 text-gray-400">Pending</Badge>;
      case 'generating':
        return <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 animate-pulse">Generating</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-600/20 text-green-400">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="bg-red-600/20 text-red-400">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const downloadVideo = (videoUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllVideos = () => {
    status.videos.forEach(video => {
      if (video.status === 'completed' && video.videoUrl) {
        setTimeout(() => downloadVideo(video.videoUrl, video.title), 500);
      }
    });
  };

  return (
    <Card className="bg-transparent border-white/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-2xl">Video Generation</CardTitle>
            <CardDescription className="text-gray-300">
              {allCompleted 
                ? 'All videos have been generated successfully!' 
                : `Generating ${status.totalVideos} video clips from your script`
              }
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className={`${allCompleted ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'}`}
          >
            {status.videosCompleted}/{status.totalVideos} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Overall Progress</h3>
            <span className="text-gray-300 text-sm">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="w-full h-3 bg-white/20" 
          />
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">Error</h4>
            <p className="text-red-300 text-sm">{status.error}</p>
          </div>
        )}

        {/* Video Status List */}
        <div className="space-y-4">
          <h3 className="text-white text-xl font-semibold">Scene Videos</h3>
          <div className="grid gap-4">
            {status.videos.map((video) => (
              <div
                key={video.sceneId}
                className="bg-white/10 rounded-lg p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {video.sceneId}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{video.title}</h4>
                      {video.progress && video.status === 'generating' && (
                        <p className="text-gray-400 text-sm">{video.progress}% complete</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(video.status)}
                </div>

                {/* Video Player for completed videos */}
                {video.status === 'completed' && video.videoUrl && (
                  <div className="mt-4 space-y-3">
                    <VideoPlayer
                      videoUrl={video.videoUrl}
                      title={video.title}
                    />
                    <Button
                      onClick={() => downloadVideo(video.videoUrl, video.title)}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      Download Video
                    </Button>
                  </div>
                )}

                {/* Error Display for failed videos */}
                {video.status === 'failed' && video.error && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-600/50 rounded">
                    <p className="text-red-300 text-sm">{video.error}</p>
                  </div>
                )}

                {/* Loading indicator for generating videos */}
                {video.status === 'generating' && (
                  <div className="mt-3 flex items-center space-x-2 text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                    <span className="text-sm">Generating video...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Download All Button */}
        {allCompleted && !hasErrors && (
          <div className="pt-4 border-t border-white/20 text-center">
            <Button
              onClick={downloadAllVideos}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 text-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Download All Videos
            </Button>
            <p className="text-gray-400 text-sm mt-2">
              Downloads will start automatically with a short delay between each file
            </p>
          </div>
        )}

        {/* Generation Info */}
        {!allCompleted && status.videosStarted && (
          <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Video Generation in Progress</h4>
            <p className="text-blue-300 text-sm">
              Each video typically takes 10-15 minutes to generate. The page will update automatically as videos complete.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}