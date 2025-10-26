import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { prompt, slides } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21'
    });

    let systemPrompt = '';

    if (slides && slides.length > 0) {
      systemPrompt = `You are a presentation assistant. The user already has a presentation with ${slides.length} slides.
They want to edit/update it. Here are the current slides:
${JSON.stringify(slides, null, 2)}

Based on their request, modify the slides accordingly and return ONLY a valid JSON object with this exact structure:

{
  "thoughts": [
    {
      "role": "assistant",
      "content": "Understanding your request",
      "type": "thinking",
      "actionDetails": "Brief description of what changes you're making to the presentation."
    },
    {
      "role": "assistant",
      "content": "I'll update the presentation based on your request.",
      "type": "normal"
    }
  ],
  "slides": [
    {
      "title": "Updated Slide Title",
      "content": "Updated content",
      "backgroundColor": "#6B7B7F",
      "image": true
    }
  ]
}

Guidelines:
1. Keep existing slides that don't need changes
2. Add new slides if requested
3. Modify slides based on user's request
4. Maintain the same JSON structure
5. Use different background colors for variety (#6B7B7F, #8B9B9F, #5B6B6F, #7B8B8F)
6. Include thoughts array explaining what you're doing

Return ONLY the JSON object, no additional text.`;
    } else {
      systemPrompt = `You are a presentation assistant that creates engaging PowerPoint presentations.
Generate a presentation based on the user's topic. Return ONLY a valid JSON object with this exact structure:

{
  "thoughts": [
    {
      "role": "assistant",
      "content": "Defining the Scope",
      "type": "thinking",
      "actionDetails": "Brief description of your research process and what you're focusing on."
    },
    {
      "role": "assistant",
      "content": "I'll start by gathering some information about [topic] to create a comprehensive presentation for you.",
      "type": "normal"
    },
    {
      "role": "assistant",
      "content": "Searching the web",
      "type": "action",
      "actionDetails": "Searching the web\n'What is [topic]'"
    },
    {
      "role": "assistant",
      "content": "I've found several good resources defining [topic]. Now I'll read a couple of these to get a deeper understanding.",
      "type": "normal"
    },
    {
      "role": "assistant",
      "content": "Reading website",
      "type": "action",
      "actionDetails": "Reading website\nhttps://example.com/article"
    },
    {
      "role": "assistant",
      "content": "Analyzing the Information",
      "type": "thinking",
      "actionDetails": "Brief description of how you're synthesizing the information to create the presentation outline."
    }
  ],
  "slides": [
    {
      "title": "Slide Title",
      "content": "Subtitle or key point",
      "backgroundColor": "#6B7B7F",
      "image": true
    }
  ]
}

Guidelines:
1. Create 5-8 slides covering the topic comprehensively
2. First slide should be a title slide with the main topic
3. Include engaging titles and concise content
4. Use different background colors for variety (#6B7B7F, #8B9B9F, #5B6B6F, #7B8B8F)
5. Set "image": true for slides that would benefit from visuals (first 2-3 slides)
6. Include thoughts array showing your research and thinking process
7. Make thoughts realistic and engaging, as if you're actually researching the topic

Return ONLY the JSON object, no additional text.`;
    }

    const result = await model.generateContent(`${systemPrompt}\n\nUser request: ${prompt}`);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini Response:', text);

    // Extract JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('No JSON found in response');
      // If no JSON found, create a simple response
      return NextResponse.json({
        thoughts: [
          {
            role: 'assistant',
            content: text,
            type: 'normal'
          }
        ],
        slides: slides || [] // Return existing slides if editing
      });
    }

    try {
      const jsonResponse = JSON.parse(jsonMatch[0]);
      console.log('Parsed JSON:', jsonResponse);
      return NextResponse.json(jsonResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw text:', text);
      return NextResponse.json({
        thoughts: [
          {
            role: 'assistant',
            content: 'I encountered an error processing your request. Please try rephrasing.',
            type: 'normal'
          }
        ],
        slides: slides || []
      });
    }
  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation. Please try again.' },
      { status: 500 }
    );
  }
}
