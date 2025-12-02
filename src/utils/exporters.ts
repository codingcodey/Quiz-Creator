import type { Quiz, Question } from '../types/quiz';

// Export quiz to CSV format
export function exportToCSV(quiz: Quiz): string {
  const headers = ['Question Number', 'Question Type', 'Question Text', 'Options/Answer', 'Correct Answer', 'Hint', 'Explanation'];
  const rows: string[][] = [headers];

  quiz.questions.forEach((question, index) => {
    const row: string[] = [
      String(index + 1),
      question.type,
      question.text,
      question.type === 'type-in'
        ? question.expectedAnswer || ''
        : question.options?.map((o) => o.text).join(' | ') || '',
      question.type === 'type-in'
        ? question.expectedAnswer || ''
        : question.options?.filter((o) => o.isCorrect).map((o) => o.text).join(' | ') || '',
      question.hint || '',
      question.explanation || '',
    ];
    rows.push(row);
  });

  return rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Download CSV file
export function downloadCSV(quiz: Quiz): void {
  const csv = exportToCSV(quiz);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(quiz.title)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import quiz from CSV
export function importFromCSV(csvContent: string): Partial<Quiz> {
  const lines = parseCSV(csvContent);
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].map((h) => h.toLowerCase().trim());
  const questions: Question[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.length < 3) continue;

    const questionText = getColumnValue(row, headers, ['question text', 'question', 'text']);
    const questionType = getColumnValue(row, headers, ['question type', 'type']);
    const optionsOrAnswer = getColumnValue(row, headers, ['options/answer', 'options', 'answer']);
    const correctAnswer = getColumnValue(row, headers, ['correct answer', 'correct']);
    const hint = getColumnValue(row, headers, ['hint']);
    const explanation = getColumnValue(row, headers, ['explanation']);

    if (!questionText) continue;

    const type = questionType?.toLowerCase().includes('type') ? 'type-in'
      : questionType?.toLowerCase().includes('multi') ? 'multi-select'
      : 'multiple-choice';

    const question: Question = {
      id: crypto.randomUUID(),
      type,
      text: questionText,
      hint: hint || undefined,
      explanation: explanation || undefined,
    };

    if (type === 'type-in') {
      question.expectedAnswer = optionsOrAnswer || correctAnswer || '';
    } else {
      const optionTexts = optionsOrAnswer?.split('|').map((o) => o.trim()).filter(Boolean) || [];
      const correctTexts = correctAnswer?.split('|').map((o) => o.trim().toLowerCase()) || [];

      question.options = optionTexts.map((text) => ({
        id: crypto.randomUUID(),
        text,
        isCorrect: correctTexts.includes(text.toLowerCase()),
      }));

      // If no correct answers marked, mark the first one
      if (!question.options.some((o) => o.isCorrect) && question.options.length > 0) {
        question.options[0].isCorrect = true;
      }
    }

    questions.push(question);
  }

  return { questions };
}

function parseCSV(content: string): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentValue += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentValue += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentValue);
        currentValue = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentLine.push(currentValue);
        lines.push(currentLine);
        currentLine = [];
        currentValue = '';
        if (char === '\r') i++;
      } else {
        currentValue += char;
      }
    }
  }

  if (currentValue || currentLine.length > 0) {
    currentLine.push(currentValue);
    lines.push(currentLine);
  }

  return lines;
}

function getColumnValue(row: string[], headers: string[], possibleNames: string[]): string | undefined {
  for (const name of possibleNames) {
    const index = headers.indexOf(name);
    if (index !== -1 && row[index]) {
      return row[index].trim();
    }
  }
  return undefined;
}

// Export quiz to printable HTML/PDF
export function generatePrintableHTML(quiz: Quiz, options: { showAnswers: boolean; showHints: boolean } = { showAnswers: false, showHints: false }): string {
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Georgia', serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 28px; margin-bottom: 8px; }
      .description { color: #666; margin-bottom: 32px; }
      .question { margin-bottom: 24px; page-break-inside: avoid; }
      .question-number { font-weight: bold; margin-bottom: 8px; }
      .question-text { margin-bottom: 12px; font-size: 16px; }
      .options { margin-left: 24px; }
      .option { margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; }
      .option-marker { width: 20px; height: 20px; border: 2px solid #333; border-radius: ${quiz.questions.some(q => q.type === 'multi-select') ? '4px' : '50%'}; flex-shrink: 0; margin-top: 2px; }
      .option.correct .option-marker { background: #22c55e; border-color: #22c55e; }
      .type-in-answer { border-bottom: 2px solid #333; min-width: 200px; display: inline-block; height: 24px; }
      .hint { color: #666; font-style: italic; font-size: 14px; margin-top: 8px; }
      .answer-key { margin-top: 48px; padding-top: 24px; border-top: 2px solid #333; }
      .answer-key h2 { margin-bottom: 16px; }
      .answer-item { margin-bottom: 8px; }
      @media print {
        body { padding: 20px; }
        .answer-key { page-break-before: always; }
      }
    </style>
  `;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${quiz.title}</title>
      ${styles}
    </head>
    <body>
      <h1>${quiz.title}</h1>
      ${quiz.description ? `<p class="description">${quiz.description}</p>` : ''}
  `;

  quiz.questions.forEach((question, index) => {
    html += `
      <div class="question">
        <div class="question-number">Question ${index + 1}</div>
        <div class="question-text">${question.text}</div>
    `;

    if (question.type === 'type-in') {
      html += `<div class="type-in-answer">${options.showAnswers ? question.expectedAnswer : ''}</div>`;
    } else if (question.options) {
      html += '<div class="options">';
      question.options.forEach((option) => {
        const correctClass = options.showAnswers && option.isCorrect ? ' correct' : '';
        html += `
          <div class="option${correctClass}">
            <div class="option-marker"></div>
            <span>${option.text}</span>
          </div>
        `;
      });
      html += '</div>';
    }

    if (options.showHints && question.hint) {
      html += `<div class="hint">💡 Hint: ${question.hint}</div>`;
    }

    html += '</div>';
  });

  // Answer key section (if not showing inline)
  if (!options.showAnswers) {
    html += `
      <div class="answer-key">
        <h2>Answer Key</h2>
    `;
    quiz.questions.forEach((question, index) => {
      let answer = '';
      if (question.type === 'type-in') {
        answer = question.expectedAnswer || '';
      } else {
        answer = question.options?.filter((o) => o.isCorrect).map((o) => o.text).join(', ') || '';
      }
      html += `<div class="answer-item"><strong>${index + 1}.</strong> ${answer}</div>`;
    });
    html += '</div>';
  }

  html += '</body></html>';
  return html;
}

// Open print dialog with quiz
export function printQuiz(quiz: Quiz, options?: { showAnswers: boolean; showHints: boolean }): void {
  const html = generatePrintableHTML(quiz, options);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Sanitize filename
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

// Export quiz to JSON (with pretty formatting)
export function exportToJSON(quiz: Quiz): string {
  return JSON.stringify(quiz, null, 2);
}

// Download JSON file
export function downloadJSON(quiz: Quiz): void {
  const json = exportToJSON(quiz);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(quiz.title)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

