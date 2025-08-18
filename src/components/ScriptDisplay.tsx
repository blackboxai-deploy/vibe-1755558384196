"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScriptResponse } from '@/types';

interface ScriptDisplayProps {
  script: ScriptResponse;
  onStartVideoGeneration: () => Promise<void>;
  isVideoGenerationStarted: boolean;
}

export function ScriptDisplay({ script, onStartVideoGeneration, isVideoGenerationStarted }: ScriptDisplayProps) {
  return (
    <Card className="bg-transparent border-white/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-2xl">Generated Script</CardTitle>
            <CardDescription className="text-gray-300">
              Your rap video concept: {script.concept}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/50">
            5 Scenes Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Script Overview */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <h3 className="text-white font-semibold mb-2">Video Overview</h3>
          <p className="text-gray-300 text-sm">
            <span className="font-medium">Total Duration:</span> {script.totalDuration}
          </p>
          <p className="text-gray-300 text-sm">
            <span className="font-medium">Scenes:</span> {script.scenes.length} cinematic sequences
          </p>
        </div>

        {/* Scenes */}
        <div className="space-y-4">
          <h3 className="text-white text-xl font-semibold">Scene Breakdown</h3>
          <div className="grid gap-4">
            {script.scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {scene.id}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{scene.title}</h4>
                      <p className="text-gray-400 text-sm">{scene.duration}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-3 leading-relaxed">
                  {scene.description}
                </p>
                
                {scene.elements && scene.elements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {scene.elements.map((element, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-white/10 text-gray-300 border-white/30 text-xs"
                      >
                        {element}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generate Videos Button */}
        <div className="pt-4 border-t border-white/20">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-white text-lg font-semibold">Ready to Create Videos?</h3>
              <p className="text-gray-300 text-sm">
                Each scene will be converted into a high-quality video clip using AI
              </p>
            </div>
            
            <Button
              onClick={onStartVideoGeneration}
              disabled={isVideoGenerationStarted}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 text-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isVideoGenerationStarted ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Videos in Progress...</span>
                </div>
              ) : (
                'Generate Video Clips'
              )}
            </Button>
            
            {!isVideoGenerationStarted && (
              <p className="text-gray-400 text-xs">
                Video generation typically takes 10-15 minutes per scene
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}