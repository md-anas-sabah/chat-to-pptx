import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

interface Slide {
  title: string;
  content: string;
  layout?: string;
  backgroundColor?: string;
  image?: string | boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { slides } = await req.json();

    if (!slides || slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides provided' },
        { status: 400 }
      );
    }

    const pptx = new PptxGenJS();

    // Set presentation properties
    pptx.author = 'AI Slide Generator';
    pptx.company = 'MagicSlides AI';
    pptx.subject = 'AI Generated Presentation';
    pptx.title = slides[0]?.title || 'Presentation';

    // Create slides
    slides.forEach((slideData: Slide, index: number) => {
      const slide = pptx.addSlide();

      // Set background color
      const bgColor = slideData.backgroundColor || '6B7B7F';
      const cleanBgColor = bgColor.replace('#', '');
      slide.background = { color: cleanBgColor };

      // Add title
      if (slideData.title) {
        const titleY = slideData.content ? 2.0 : 2.5;
        slide.addText(slideData.title, {
          x: slideData.image ? 5.0 : 1.0,
          y: titleY,
          w: slideData.image ? 4.5 : 8.5,
          h: 1.5,
          fontSize: 44,
          bold: true,
          color: 'FFFFFF',
          align: slideData.image ? 'left' : 'center',
          valign: 'middle',
        });
      }

      // Add content/subtitle
      if (slideData.content) {
        slide.addText(slideData.content, {
          x: slideData.image ? 5.0 : 1.0,
          y: 3.8,
          w: slideData.image ? 4.5 : 8.5,
          h: 1.0,
          fontSize: 20,
          color: 'FFFFFF',
          align: slideData.image ? 'left' : 'center',
          valign: 'top',
        });
      }

      // Add image placeholder if specified
      if (slideData.image) {
        // Add a dark rectangle as placeholder for image
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: 1.5,
          w: 3.5,
          h: 3.5,
          fill: { color: '2D2D2D' },
        });

        // Add a decorative shape
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5,
          y: 1.2,
          w: 2.0,
          h: 2.0,
          fill: { color: cleanBgColor },
          transparency: 50,
        });
      }

      // Add slide number
      slide.addText(`${index + 1}`, {
        x: 0.5,
        y: 5.0,
        w: 1.0,
        h: 0.4,
        fontSize: 14,
        color: 'FFFFFF',
        align: 'left',
      });
    });

    // Generate the PPTX file
    const buffer = await pptx.write({ outputType: 'arraybuffer' });

    // Return the file as a response
    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="presentation.pptx"',
      },
    });
  } catch (error) {
    console.error('Error generating PPTX:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation file' },
      { status: 500 }
    );
  }
}
