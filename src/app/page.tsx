"use client";

import { useState } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { ScriptDisplay } from '@/components/ScriptDisplay';
import { VideoGeneration } from '@/components/VideoGeneration';
import { ScriptResponse, GenerationStatus } from '@/types';

export default function Home() {
  const [script, setScript] = useState<ScriptResponse | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const handlePromptSubmit = async (prompt: string, style: string) => {
    setIsGeneratingScript(true);
    setScript(null);
    setGenerationStatus(null);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, style }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const scriptData: ScriptResponse = await response.json();
      setScript(scriptData);
      
      // Initialize generation status
      setGenerationStatus({
        scriptGenerated: true,
        videosStarted: false,
        videosCompleted: 0,
        totalVideos: scriptData.scenes.length,
        videos: scriptData.scenes.map(scene => ({
          sceneId: scene.id,
          title: scene.title,
          videoUrl: '',
          status: 'pending',
        })),
      });
    } catch (error) {
      console.error('Error generating script:', error);
      setGenerationStatus({
        scriptGenerated: false,
        videosStarted: false,
        videosCompleted: 0,
        totalVideos: 0,
        videos: [],
        error: 'Failed to generate script. Please try again.',
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleStartVideoGeneration = async () => {
    if (!script || !generationStatus) return;

    setGenerationStatus(prev => prev ? {
      ...prev,
      videosStarted: true,
      videos: prev.videos.map(v => ({ ...v, status: 'generating' as const }))
    } : null);

    try {
      const response = await fetch('/api/generate-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenes: script.scenes }),
      });

      if (!response.ok) {
        throw new Error('Failed to start video generation');
      }

      // Start polling for updates
      pollVideoStatus();
    } catch (error) {
      console.error('Error starting video generation:', error);
      setGenerationStatus(prev => prev ? {
        ...prev,
        error: 'Failed to start video generation. Please try again.',
      } : null);
    }
  };

  const pollVideoStatus = async () => {
    const poll = async () => {
      try {
        const response = await fetch('/api/check-status');
        const status: GenerationStatus = await response.json();
        setGenerationStatus(status);

        // Continue polling if not all videos are completed
        if (status.videosCompleted < status.totalVideos && !status.error) {
          setTimeout(poll, 3000); // Poll every 3 seconds
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Rap Video Generator
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transform your rap concepts into epic music video scenes using cutting-edge AI technology
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Prompt Input */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <PromptInput 
                onSubmit={handlePromptSubmit}
                isLoading={isGeneratingScript}
              />
            </div>

            {/* Script Display */}
            {script && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <ScriptDisplay 
                  script={script}
                  onStartVideoGeneration={handleStartVideoGeneration}
                  isVideoGenerationStarted={generationStatus?.videosStarted || false}
                />
              </div>
            )}

            {/* Video Generation */}
            {generationStatus && generationStatus.scriptGenerated && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <VideoGeneration 
                  status={generationStatus}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-gray-400">
            <p>Powered by advanced AI technology for creative video generation</p>
          </div>
        </div>
      </div>
    </div>
  );
}