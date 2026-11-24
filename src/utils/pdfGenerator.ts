import { jsPDF } from 'jspdf';
import { DifficultyLevel, Question } from '../types/curriculum';

export interface PdfGenerationOptions {
  topicTitle: string;
  domainName: string;
  studentName: string;
  dateStr: string;
  difficultyFilter: DifficultyLevel | 'all';
  questions: Question[];
  mode: 'worksheet' | 'answer-key';
}

/**
 * Converts LaTeX-formatted SAT math text into clean WinAnsi-safe plain math notation
 * so jsPDF's built-in Helvetica font never prints broken Unicode glyphs.
 */
export function formatLatexForPdf(input: string): string {
  let text = input;

  // Replace common LaTeX commands before stripping $ delimiters
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');
  text = text.replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)');
  text = text.replace(/\\left\(/g, '(');
  text = text.replace(/\\right\)/g, ')');
  text = text.replace(/\\left\[/g, '[');
  text = text.replace(/\\right\]/g, ']');
  text = text.replace(/\\pm/g, '±');
  text = text.replace(/\\times/g, '×');
  text = text.replace(/\\cdot/g, '·');
  text = text.replace(/\\div/g, '÷');
  text = text.replace(/\\neq/g, '!=');
  text = text.replace(/\\leq|\\le/g, '<=');
  text = text.replace(/\\geq|\\ge/g, '>=');
  text = text.replace(/\\implies/g, '=>');
  text = text.replace(/\\text\{([^{}]+)\}/g, '$1');
  text = text.replace(/\\quad|\\qquad/g, '  ');
  text = text.replace(/\\Delta/g, 'Delta');
  text = text.replace(/\\pi/g, 'pi');
  text = text.replace(/\\\$/g, '$');

  // Exponents like ^2, ^3, ^{2}
  text = text.replace(/\^2\b/g, '²');
  text = text.replace(/\^3\b/g, '³');
  text = text.replace(/\^\{2\}/g, '²');
  text = text.replace(/\^\{3\}/g, '³');
  text = text.replace(/\^\{([^{}]+)\}/g, '^($1)');

  // Subscripts like x_1
  text = text.replace(/_\{([^{}]+)\}/g, '$1');
  text = text.replace(/_([0-9a-zA-Z])/g, '$1');

  // Remove remaining $ delimiters and curly braces
  text = text.replace(/\$\$/g, '');
  text = text.replace(/\$/g, '');
  text = text.replace(/[{}]/g, '');

  // Clean up simple single-digit fractions like (1)/(2) -> 1/2
  text = text.replace(/\(([0-9a-zA-Z-]+)\)\/\(([0-9a-zA-Z-]+)\)/g, '$1/$2');

  // Replace any characters outside WinAnsi range safely
  text = text
    .replace(/√/g, 'sqrt')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≠/g, '!=')
    .replace(/Δ/g, 'Delta')
    .replace(/π/g, 'pi')
    .replace(/−/g, '-')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/’/g, "'")
    .replace(/“|”/g, '"');

  return text.replace(/\s+/g, ' ').trim();
}

function difficultyLabel(diff: DifficultyLevel): string {
  if (diff === 'easy') return 'Easy';
  if (diff === 'medium') return 'Medium';
  return 'Medium-Hard';
}

function drawSquaredWorkingGrid(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const step = 5; // Exact 5 mm squared notebook paper grid
  const cols = Math.floor(width / step);
  const rows = Math.floor(height / step);
  const snappedWidth = cols * step;
  const snappedHeight = rows * step;

  // Very light background tint inside work area
  doc.setFillColor(252, 253, 255);
  doc.rect(x, y, snappedWidth, snappedHeight, 'F');

  // Internal 5mm grid lines (very light gray)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.15);

  for (let c = 1; c < cols; c++) {
    const gx = x + c * step;
    doc.line(gx, y, gx, y + snappedHeight);
  }
  for (let r = 1; r < rows; r++) {
    const gy = y + r * step;
    doc.line(x, gy, x + snappedWidth, gy);
  }

  // Crisp subtle outer border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(x, y, snappedWidth, snappedHeight);

  // Subtle corner label inside top-left of grid
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Work area (5 mm grid)', x + 2, y + 3.6);
}

function addHeadersAndFooters(
  doc: jsPDF,
  topicTitle: string,
  mode: 'worksheet' | 'answer-key'
) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running header on pages 2+
    if (p > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('SAT MATH LAB', margin, 11);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const label = `${topicTitle} - ${
        mode === 'worksheet' ? 'Student Practice Worksheet' : 'Teacher Answer Key'
      }`;
      doc.text(label, pageWidth - margin, 11, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.line(margin, 13.5, pageWidth - margin, 13.5);
    }

    // Clean footer on every page
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'SAT MATH LAB | Original Digital SAT Practice Material',
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 8, {
      align: 'right',
    });
  }
}

export function generatePracticePdf(options: PdfGenerationOptions): void {
  const {
    topicTitle,
    domainName,
    studentName,
    dateStr,
    difficultyFilter,
    questions,
    mode,
  } = options;

  // A4 portrait in millimeters: 210 x 297
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm (exact multiple of 5mm!)
  const topStartPage2 = 19;
  const bottomLimit = pageHeight - 17;

  // PAGE 1 BRANDING & WORKSHEET HEADER
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, 14, contentWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('SAT MATH LAB', margin, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text(
    mode === 'worksheet' ? 'STUDENT PRACTICE WORKSHEET' : 'TEACHER ANSWER KEY',
    pageWidth - margin,
    23,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(15, 23, 42);
  doc.text(topicTitle, margin, 31);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const diffText =
    difficultyFilter === 'all'
      ? 'All Difficulties'
      : difficultyLabel(difficultyFilter);
  doc.text(
    `${domainName}  |  Difficulty: ${diffText}  |  ${questions.length} Questions`,
    margin,
    36.5
  );

  // Student Name / Date / Score Box
  let y = 41;
  if (mode === 'worksheet') {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('Student Name:', margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    if (studentName.trim()) {
      doc.text(studentName.trim(), margin + 30, y + 6);
    } else {
      doc.setDrawColor(148, 163, 184);
      doc.line(margin + 30, y + 6.5, margin + 100, y + 6.5);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margin + 108, y + 6);
    doc.setFont('helvetica', 'normal');
    if (dateStr.trim()) {
      doc.text(dateStr.trim(), margin + 120, y + 6);
    } else {
      doc.line(margin + 120, y + 6.5, margin + 174, y + 6.5);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Instructions: Show all algebraic steps inside the 5 mm squared working grid below each question.',
      margin + 4,
      y + 11.5
    );
    y += 20;
  } else {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 1, pageWidth - margin, y + 1);
    y += 7;
  }

  // RENDER QUESTIONS
  questions.forEach((q, idx) => {
    const qNumber = idx + 1;
    const cleanQuestion = formatLatexForPdf(q.question);
    const wrappedQ = doc.splitTextToSize(`${qNumber}.  ${cleanQuestion}`, contentWidth - 4);

    // Measure choices height
    let choiceLinesList: string[][] = [];
    let choicesHeight = 0;
    if (q.type === 'multiple-choice' && q.choices) {
      choiceLinesList = q.choices.map((c) =>
        doc.splitTextToSize(formatLatexForPdf(c), contentWidth - 10)
      );
      const totalChoiceLines = choiceLinesList.reduce((acc, lines) => acc + lines.length, 0);
      choicesHeight = totalChoiceLines * 4.5 + 2;
    } else {
      choicesHeight = 7; // SPR Answer blank line
    }

    const headerHeight = 5.5;
    const questionTextHeight = wrappedQ.length * 4.8;

    if (mode === 'worksheet') {
      const gridHeight = 45; // 9 rows of 5mm squares = 45mm generous calculation area
      const blockGap = 6;
      const totalBlockHeight =
        headerHeight + questionTextHeight + choicesHeight + gridHeight + blockGap;

      // Never split a question, its choices, or its working area across pages
      if (y + totalBlockHeight > bottomLimit) {
        doc.addPage();
        y = topStartPage2;
      }

      // Question meta line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      const typeTag =
        q.type === 'spr' ? 'Student-Produced Response (Grid-In)' : 'Multiple Choice';
      doc.text(
        `Question ${qNumber}  |  ${difficultyLabel(q.difficulty)}  |  ${typeTag}`,
        margin,
        y
      );
      y += headerHeight;

      // Question prompt
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(wrappedQ, margin, y);
      y += questionTextHeight + 1.5;

      // Choices or SPR answer box
      if (q.type === 'multiple-choice' && q.choices) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        choiceLinesList.forEach((lines) => {
          doc.text(lines, margin + 4, y);
          y += lines.length * 4.5;
        });
        y += 1.5;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text('Final Answer: ____________________', margin + 4, y + 1);
        y += 7;
      }

      // 5 mm graph-paper squared working area
      drawSquaredWorkingGrid(doc, margin, y, contentWidth, gridHeight);
      y += gridHeight + blockGap;
    } else {
      // TEACHER ANSWER KEY MODE
      const answerLine =
        q.type === 'multiple-choice'
          ? `Correct Answer: ${q.correctAnswer}`
          : `Correct Answer: ${q.correctAnswer}`;
      const expText = formatLatexForPdf(q.explanation);
      const wrappedExp = doc.splitTextToSize(`Solution: ${expText}`, contentWidth - 6);
      const mistakeText = formatLatexForPdf(q.commonMistake);
      const wrappedMistake = doc.splitTextToSize(
        `Common Mistake: ${mistakeText}`,
        contentWidth - 6
      );

      const blockHeight =
        headerHeight +
        questionTextHeight +
        choicesHeight +
        6 +
        wrappedExp.length * 4.4 +
        wrappedMistake.length * 4.2 +
        7;

      if (y + blockHeight > bottomLimit) {
        doc.addPage();
        y = topStartPage2;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      doc.text(
        `Question ${qNumber}  |  ${difficultyLabel(q.difficulty)}  |  ${
          q.type === 'spr' ? 'SPR' : 'MC'
        }`,
        margin,
        y
      );
      y += headerHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(wrappedQ, margin, y);
      y += questionTextHeight + 1;

      if (q.type === 'multiple-choice' && q.choices) {
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        choiceLinesList.forEach((lines) => {
          doc.text(lines, margin + 4, y);
          y += lines.length * 4.3;
        });
        y += 1.5;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(5, 150, 105);
      doc.text(answerLine, margin + 2, y + 1);
      y += 5.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(30, 41, 59);
      doc.text(wrappedExp, margin + 2, y);
      y += wrappedExp.length * 4.3 + 1;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.4);
      doc.setTextColor(100, 116, 139);
      doc.text(wrappedMistake, margin + 2, y);
      y += wrappedMistake.length * 4.1 + 4;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 1.5, pageWidth - margin, y - 1.5);
      y += 3;
    }
  });

  addHeadersAndFooters(doc, topicTitle, mode);

  const safeSlug = topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const suffix = mode === 'worksheet' ? 'student-worksheet' : 'teacher-answer-key';
  doc.save(`sat-math-lab-${safeSlug}-${suffix}.pdf`);
}
