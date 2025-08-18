import { VideoResult } from '@/types';

// Store video generation status in memory (in production, use Redis or database)
export let generationStatus: {
  isGenerating: boolean;
  videos: VideoResult[];
  completedCount: number;
  totalCount: number;
} = {
  isGenerating: false,
  videos: [],
  completedCount: 0,
  totalCount: 0
};

export function updateGenerationStatus(newStatus: Partial<typeof generationStatus>) {
  generationStatus = { ...generationStatus, ...newStatus };
}

export function updateVideoStatus(
  sceneId: number, 
  status: VideoResult['status'], 
  progress: number, 
  videoUrl?: string, 
  error?: string
) {
  const videoIndex = generationStatus.videos.findIndex(v => v.sceneId === sceneId);
  if (videoIndex !== -1) {
    generationStatus.videos[videoIndex] = {
      ...generationStatus.videos[videoIndex],
      status,
      progress,
      ...(videoUrl && { videoUrl }),
      ...(error && { error })
    };
  }
}