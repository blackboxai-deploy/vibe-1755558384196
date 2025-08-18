// Types for the AI Rap Music Video Generator

export interface Scene {
  id: number;
  title: string;
  description: string;
  duration: string;
  elements: string[];
}

export interface ScriptResponse {
  scenes: Scene[];
  concept: string;
  totalDuration: string;
}

export interface VideoGenerationRequest {
  sceneId: number;
  description: string;
  title: string;
}

export interface VideoResult {
  sceneId: number;
  title: string;
  videoUrl: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  progress?: number;
}

export interface GenerationStatus {
  scriptGenerated: boolean;
  videosStarted: boolean;
  videosCompleted: number;
  totalVideos: number;
  videos: VideoResult[];
  error?: string;
}

export interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface PromptInputData {
  prompt: string;
  style?: 'urban' | 'cinematic' | 'street' | 'artistic';
  duration?: 'short' | 'medium' | 'long';
}