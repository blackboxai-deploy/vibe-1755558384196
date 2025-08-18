import { NextResponse } from 'next/server';
import { generationStatus } from '@/lib/video-status';
import { GenerationStatus } from '@/types';

export async function GET() {
  try {
    const response: GenerationStatus = {
      scriptGenerated: true, // Assuming script was generated if we're checking video status
      videosStarted: generationStatus.isGenerating || generationStatus.completedCount > 0,
      videosCompleted: generationStatus.completedCount,
      totalVideos: generationStatus.totalCount,
      videos: generationStatus.videos,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in check-status:', error);
    return NextResponse.json(
      { 
        scriptGenerated: false,
        videosStarted: false,
        videosCompleted: 0,
        totalVideos: 0,
        videos: [],
        error: 'Failed to check status'
      },
      { status: 500 }
    );
  }
}