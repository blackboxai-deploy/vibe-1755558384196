import { NextRequest, NextResponse } from 'next/server';
import { ScriptResponse, AIResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create system prompt based on style
    const getSystemPrompt = (style: string) => {
      const basePrompt = `You are a creative rap music video director and scriptwriter. Create exactly 5 distinct scenes for a rap music video based on the user's concept. Each scene should be 10-15 seconds long with detailed visual descriptions suitable for AI video generation.

Return ONLY a valid JSON object with this exact structure:
{
  "concept": "Brief summary of the user's concept",
  "totalDuration": "50-75 seconds",
  "scenes": [
    {
      "id": 1,
      "title": "Scene Title",
      "description": "Detailed visual description with specific camera angles, lighting, setting, and action. Include cinematographic details like 'close-up shot', 'wide angle', 'dramatic lighting', etc.",
      "duration": "10-15 seconds",
      "elements": ["visual element 1", "visual element 2", "visual element 3"]
    }
  ]
}`;

      const styleGuides = {
        urban: " Focus on street culture, urban environments, graffiti, city skylines, and authentic street aesthetics.",
        cinematic: " Emphasize dramatic camera work, epic wide shots, cinematic lighting, and movie-like production value.",
        street: " Create raw, documentary-style scenes with handheld camera feel, real street locations, and authentic urban culture.",
        artistic: " Focus on creative visual metaphors, artistic lighting, abstract elements, and avant-garde cinematography."
      };

      return basePrompt + (styleGuides[style as keyof typeof styleGuides] || styleGuides.urban);
    };

    // Call AI service for script generation
    const aiResponse = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'CustomerId': 'cus_SGPn4uhjPI0F4w',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
      },
      body: JSON.stringify({
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(style)
          },
          {
            role: 'user',
            content: `Create a 5-scene rap music video script for: ${prompt}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API Error:', await aiResponse.text());
      return NextResponse.json(
        { error: 'Failed to generate script' },
        { status: 500 }
      );
    }

    const aiData: AIResponse = await aiResponse.json();
    const scriptContent = aiData.choices[0]?.message?.content;

    if (!scriptContent) {
      return NextResponse.json(
        { error: 'No script content received from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let scriptData: ScriptResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = scriptContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : scriptContent;
      scriptData = JSON.parse(jsonString);
      
      // Validate the structure
      if (!scriptData.scenes || !Array.isArray(scriptData.scenes) || scriptData.scenes.length !== 5) {
        throw new Error('Invalid script structure');
      }
      
      // Ensure all scenes have required fields
      scriptData.scenes.forEach((scene, index) => {
        if (!scene.id) scene.id = index + 1;
        if (!scene.title) scene.title = `Scene ${scene.id}`;
        if (!scene.description) throw new Error(`Scene ${scene.id} missing description`);
        if (!scene.duration) scene.duration = '10-15 seconds';
        if (!scene.elements) scene.elements = [];
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI Response:', scriptContent);
      
      // Fallback: create a structured response from the text
      scriptData = {
        concept: prompt,
        totalDuration: '50-75 seconds',
        scenes: [
          {
            id: 1,
            title: 'Opening Scene',
            description: `${style} style rap video opening scene based on: ${prompt}`,
            duration: '10-15 seconds',
            elements: ['opening', 'introduction', style]
          },
          {
            id: 2,
            title: 'Verse 1 Scene',
            description: `First verse with ${style} cinematography showing the main concept`,
            duration: '10-15 seconds',
            elements: ['verse', 'main action', style]
          },
          {
            id: 3,
            title: 'Chorus Scene',
            description: `Dynamic chorus scene with ${style} visual elements`,
            duration: '10-15 seconds',
            elements: ['chorus', 'energy', style]
          },
          {
            id: 4,
            title: 'Verse 2 Scene',
            description: `Second verse expanding on the theme with ${style} approach`,
            duration: '10-15 seconds',
            elements: ['verse 2', 'development', style]
          },
          {
            id: 5,
            title: 'Outro Scene',
            description: `Powerful ending scene with ${style} finale elements`,
            duration: '10-15 seconds',
            elements: ['outro', 'conclusion', style]
          }
        ]
      };
    }

    return NextResponse.json(scriptData);

  } catch (error) {
    console.error('Error in generate-script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}