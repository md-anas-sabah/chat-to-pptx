import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';

interface Slide {
  title: string;
  content: string;
  layout?: string;
  backgroundColor?: string;
  image?: string | boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { slides, format = 'pptx' } = await req.json();

    if (!slides || slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides provided' },
        { status: 400 }
      );
    }

    if (format === 'pdf') {
      return generatePDF(slides);
    } else {
      return generatePPTX(slides);
    }
  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation file' },
      { status: 500 }
    );
  }
}

async function generatePPTX(slides: Slide[]) {
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
        fill: { color: cleanBgColor, transparency: 50 },
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
}

async function generatePDF(slides: Slide[]) {
  // Create PDF in landscape mode (16:9 aspect ratio)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167.0625] // A4 landscape width, 16:9 height
  });

  slides.forEach((slideData: Slide, index: number) => {
    if (index > 0) {
      pdf.addPage();
    }

    // Convert hex color to RGB
    const bgColor = slideData.backgroundColor || '#6B7B7F';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Set background color
    pdf.setFillColor(r, g, b);
    pdf.rect(0, 0, 297, 167.0625, 'F');

    // Set text color to white
    pdf.setTextColor(255, 255, 255);

    // Add title
    if (slideData.title) {
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');

      const titleX = slideData.image ? 160 : 148.5;
      const titleY = slideData.content ? 70 : 83.5;
      const align = slideData.image ? 'left' : 'center';

      pdf.text(slideData.title, titleX, titleY, {
        align: align as 'left' | 'center',
        maxWidth: slideData.image ? 120 : 260
      });
    }

    // Add content
    if (slideData.content) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');

      const contentX = slideData.image ? 160 : 148.5;
      const contentY = 95;
      const align = slideData.image ? 'left' : 'center';

      pdf.text(slideData.content, contentX, contentY, {
        align: align as 'left' | 'center',
        maxWidth: slideData.image ? 120 : 260
      });
    }

    // Add image placeholder
    if (slideData.image) {
      pdf.setFillColor(45, 45, 45);
      pdf.rect(20, 40, 90, 90, 'F');

      // Add decorative shape
      pdf.setFillColor(r, g, b, 0.5);
      pdf.rect(15, 35, 50, 50, 'F');
    }

    // Add slide number
    pdf.setFontSize(10);
    pdf.text(`${index + 1}`, 15, 160);
  });

  // Generate PDF buffer
  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

  // Return the file as a response
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="presentation.pdf"',
    },
  });
}
