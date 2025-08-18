"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface PromptInputProps {
  onSubmit: (prompt: string, style: string) => Promise<void>;
  isLoading: boolean;
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('urban');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    await onSubmit(prompt.trim(), style);
  };

  const examplePrompts = [
    "A successful rapper celebrating in a luxury penthouse with city skyline views",
    "Underground hip-hop cypher in a gritty urban alleyway with graffiti walls",
    "Futuristic rap performance in a neon-lit cyberpunk cityscape",
    "Classic 90s style rap video in a neighborhood block party setting",
    "Artistic black and white rap video with dramatic lighting and shadows"
  ];

  return (
    <Card className="bg-transparent border-white/30">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Create Your Rap Video</CardTitle>
        <CardDescription className="text-gray-300">
          Describe your rap music video concept and let AI create an epic 5-scene script
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-white text-lg">
              Video Concept
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe your rap music video concept, setting, mood, and style..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-white/20 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/30 transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <Label htmlFor="style" className="text-white text-lg">
              Video Style
            </Label>
            <Select value={style} onValueChange={setStyle} disabled={isLoading}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30">
                <SelectValue placeholder="Select video style" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="urban" className="text-white hover:bg-gray-800">
                  Urban Street Style
                </SelectItem>
                <SelectItem value="cinematic" className="text-white hover:bg-gray-800">
                  Cinematic Epic
                </SelectItem>
                <SelectItem value="street" className="text-white hover:bg-gray-800">
                  Raw Street Documentary
                </SelectItem>
                <SelectItem value="artistic" className="text-white hover:bg-gray-800">
                  Artistic Visual
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Generating Script...</span>
              </div>
            ) : (
              'Generate Video Script'
            )}
          </Button>
        </form>

        {/* Example Prompts */}
        <div className="space-y-3">
          <Label className="text-white text-sm font-medium">Example Prompts:</Label>
          <div className="grid gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                disabled={isLoading}
                className="text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-200 text-sm border border-white/10 hover:border-white/30"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}