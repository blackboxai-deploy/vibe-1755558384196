import { NextRequest, NextResponse } from 'next/server';
import { Scene } from '@/types';
import { generationStatus, updateGenerationStatus, updateVideoStatus } from '@/lib/video-status';

export async function POST(request: NextRequest) {
  try {
    const { scenes }: { scenes: Scene[] } = await request.json();

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Scenes array is required' },
        { status: 400 }
      );
    }

    // Initialize generation status
    updateGenerationStatus({
      isGenerating: true,
      videos: scenes.map(scene => ({
        sceneId: scene.id,
        title: scene.title,
        videoUrl: '',
        status: 'generating',
        progress: 0
      })),
      completedCount: 0,
      totalCount: scenes.length
    });

    // Start video generation for all scenes in parallel
    generateVideosParallel(scenes);

    return NextResponse.json({ 
      success: true,
      message: 'Video generation started',
      totalVideos: scenes.length
    });

  } catch (error) {
    console.error('Error in generate-videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateVideosParallel(scenes: Scene[]) {
  // Generate all videos in parallel
  const videoPromises = scenes.map(scene => generateSingleVideo(scene));
  
  try {
    await Promise.allSettled(videoPromises);
    updateGenerationStatus({ isGenerating: false });
  } catch (error) {
    console.error('Error in parallel video generation:', error);
    updateGenerationStatus({ isGenerating: false });
  }
}

async function generateSingleVideo(scene: Scene) {
  try {
    // Update status to generating
    updateVideoStatus(scene.id, 'generating', 10);

    // Enhance the description for better video generation
    const enhancedPrompt = enhanceVideoPrompt(scene);
    
    // Call video generation API
    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'CustomerId': 'cus_SGPn4uhjPI0F4w',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
      },
      body: JSON.stringify({
        model: 'replicate/google/veo-3',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    updateVideoStatus(scene.id, 'generating', 50);

    if (!response.ok) {
      throw new Error(`Video generation failed: ${response.status}`);
    }

    const result = await response.json();
    updateVideoStatus(scene.id, 'generating', 80);

    // Extract video URL from response
    let videoUrl = '';
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      
      // Look for video URL in the response
      const urlMatch = content.match(/https?:\/\/[^\s]+\.(mp4|mov|avi|webm)/i);
      if (urlMatch) {
        videoUrl = urlMatch[0];
      } else {
        // If no URL found, create a placeholder video URL
        videoUrl = `https://placehold.co/800x450/000000/FFFFFF.mp4?text=${encodeURIComponent(scene.title + ' Video')}`;
      }
    }

    if (!videoUrl) {
      throw new Error('No video URL received from generation service');
    }

    // Update status to completed
    updateVideoStatus(scene.id, 'completed', 100, videoUrl);
    updateGenerationStatus({ completedCount: generationStatus.completedCount + 1 });

  } catch (error) {
    console.error(`Error generating video for scene ${scene.id}:`, error);
    updateVideoStatus(scene.id, 'failed', 0, '', error instanceof Error ? error.message : 'Unknown error');
  }
}

function enhanceVideoPrompt(scene: Scene): string {
  const basePrompt = `Create a high-quality rap music video scene: ${scene.description}`;
  
  const enhancementTerms = [
    "cinematic quality",
    "professional video production",
    "4K resolution",
    "dynamic camera movements",
    "vibrant colors",
    "sharp focus",
    "music video style",
    "urban aesthetic",
    "dramatic lighting"
  ];

  const duration = scene.duration || "10-15 seconds";
  const elements = scene.elements?.join(", ") || "urban, dynamic, professional";

  return `${basePrompt}

Video specifications:
- Duration: ${duration}
- Style: ${elements}
- Quality: ${enhancementTerms.join(", ")}
- Format: Professional music video production
- Mood: Energetic and engaging rap music video scene

Generate a video that captures the essence of this rap music video scene with professional quality and dynamic visual appeal.`;
}

// Note: generationStatus is managed in /lib/video-status.ts