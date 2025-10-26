# AI Slide Generator

An AI-powered chat application that generates professional PowerPoint presentations using Gemini AI. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Core Features
- **Chat Interface**: Interactive chat-based UI similar to MagicSlides AI
- **AI-Powered Generation**: Uses Gemini Reasoning Model (gemini-2.0-flash-thinking-exp-01-21) for intelligent slide creation
- **PPT Generation**: Creates professional presentations using pptxgenjs
- **Dynamic Editing**: Update and refine slides through conversational prompts
- **Live Preview**: Real-time slide preview as you generate content

### Optional Features
- **Progress Streaming**: Visual progress bar showing AI generation status
- **Multiple Download Formats**: Download presentations as PPTX or PDF
- **Chat History**: Save and revisit previous presentations with localStorage
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Google Generative AI (Gemini)
- **PPT Generation**: pptxgenjs
- **PDF Generation**: jsPDF
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Gemini API Key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd my-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

To get your Gemini API key:
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Sign in with your Google account
- Click "Get API Key" or "Create API Key"
- Copy the key and paste it in your `.env.local` file

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal)

## Usage

### Creating Your First Presentation

1. Enter a topic in the chat input (e.g., "Create a presentation about Artificial Intelligence")
2. Watch as the AI researches and generates slides with progress updates
3. View the generated slides in the right panel
4. Download as PPTX or PDF using the download buttons

### Editing Slides

After generating a presentation, you can refine it by:
- Asking the AI to add more slides
- Requesting changes to specific slides
- Changing the style or content
- Adding or removing information

Example prompts:
- "Add a slide about machine learning applications"
- "Make the presentation more technical"
- "Change the color scheme to blue"
- "Add more details to slide 3"

### Managing History

- Click the History icon (left sidebar) to view past presentations
- Select any previous chat to reload it
- Click "New Chat" to start fresh
- History is saved locally in your browser

### Downloading Presentations

Choose from two formats:
- **PPTX**: Editable PowerPoint format with full styling
- **PDF**: Fixed format for sharing and presenting

## Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/
│   │   │   │   └── route.ts        # Gemini AI integration
│   │   │   └── download/
│   │   │       └── route.ts        # PPTX/PDF generation
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main chat interface
│   │   └── globals.css             # Global styles
│   └── ...
├── .env.local                      # Environment variables (create this)
├── package.json
└── README.md
```

## API Routes

### POST /api/generate
Generates slide content using Gemini AI.

**Request Body:**
```json
{
  "prompt": "Create a presentation about AI",
  "slides": [] // Optional: existing slides for editing
}
```

**Response:**
```json
{
  "thoughts": [
    {
      "role": "assistant",
      "content": "Defining the Scope",
      "type": "thinking",
      "actionDetails": "Research process description"
    }
  ],
  "slides": [
    {
      "title": "Artificial Intelligence",
      "content": "Transforming Industries and Society",
      "backgroundColor": "#6B7B7F",
      "image": true
    }
  ]
}
```

### POST /api/download
Generates downloadable presentation files.

**Request Body:**
```json
{
  "slides": [...],
  "format": "pptx" // or "pdf"
}
```

**Response:** Binary file download

## Assumptions Made

1. **API Model**: Using `gemini-2.0-flash-thinking-exp-01-21` as it's the latest reasoning model available
2. **Slide Design**: Implemented a clean, professional design matching the Figma reference
3. **Image Placeholders**: Since AI doesn't generate actual images, using colored rectangles as visual placeholders
4. **Thinking Process**: Simulated AI reasoning steps to match the reference UI behavior
5. **Progress Streaming**: Implemented client-side progress simulation for better UX
6. **Local Storage**: Chat history is stored in browser localStorage (not database)
7. **Color Scheme**: Used neutral grays (#6B7B7F variations) for professional appearance
8. **Responsive Design**: Optimized for desktop with mobile support via collapsible sidebar

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Building for Production

```bash
npm run build
npm start
```

## Deployment

This app can be deployed on any platform that supports Next.js:

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add `GEMINI_API_KEY` in Environment Variables
4. Deploy

### Other Platforms
- Netlify
- Railway
- AWS Amplify
- Google Cloud Run
- Any Node.js hosting

**Important**: Don't forget to add your `GEMINI_API_KEY` environment variable in your deployment platform's settings.

## Troubleshooting

### API Key Issues
- Ensure `GEMINI_API_KEY` is set in `.env.local`
- Restart the dev server after adding environment variables
- Check that the API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Chat History Not Saving
- Check browser console for localStorage errors
- Ensure you're not in private/incognito mode
- Clear browser cache if issues persist

## Future Enhancements

Potential improvements for future versions:
- Real AI-generated images using DALL-E or similar
- Database storage for chat history
- User authentication and accounts
- Collaboration features
- More slide templates and themes
- Export to Google Slides
- Custom branding options

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- UI design inspired by [MagicSlides AI](https://www.magicslides.app/)
- Icons by [Lucide](https://lucide.dev/)

---

**Note**: This is a demonstration project. For production use, consider implementing proper error handling, rate limiting, and security measures.
