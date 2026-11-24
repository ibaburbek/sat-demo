# SAT MATH LAB

**Master the concepts. Understand the language. Solve with confidence.**

SAT MATH LAB is an interactive Digital SAT Math learning platform built specifically for students who understand mathematics but have limited English proficiency. It combines simple English mathematical theory, interactive English–Russian vocabulary tooltips, dynamic SVG visualizations, original SAT-style practice and assessment banks, a 30-minute Teacher Demo Mode, and browser-based A4 PDF worksheet generation with 5 mm squared graph-paper working grids.

## Key Features

- **Digital SAT Curriculum (4 Domains, 44 Topics):** Structured around the four official Digital SAT Math domains (*Algebra*, *Advanced Math*, *Problem-Solving and Data Analysis*, and *Geometry and Trigonometry*).
- **3 Complete Interactive Modules:**
  - *Linear Equations in One Variable*
  - *Systems of Linear Equations*
  - *Quadratic Equations*
  - Each complete module includes learning objectives, simple-English theory, worked examples, copyable formula cards, interactive SVG coordinate visualizers, **22 original practice questions** (6 Easy, 10 Medium, 6 Medium-Hard; Multiple Choice + Student-Produced Response), and a **10-question Knowledge Check** (3 Easy, 4 Medium, 3 Medium-Hard).
- **Interactive English–Russian Vocabulary Support (`<TranslatedText />`):**
  - Phrase-first matching (e.g., `"at least"`, `"infinitely many solutions"`, `"sum of the solutions"`) across 290+ SAT Math terms.
  - Desktop hover tooltips and mobile tap-to-translate popovers.
  - Searchable glossary and teacher tool to add custom translations stored in `localStorage`.
- **A4 PDF Worksheet Generator:**
  - **Student Worksheet Mode:** A4 layout with Student Name and Date fields, questions, answer choices, page numbers, and a **5 mm squared graph-paper working area** below every question (no questions split across pages).
  - **Teacher Answer Key Mode:** Complete solutions, correct answers, and common mistake notes.
- **Teacher Demo Mode (30-Minute Trial Lesson):**
  - Zero-registration 30-minute diagnostic lesson with live countdown timer, 5 structured phases, optional English / Kazakh / Russian teacher guidance, guided coaching questions, embedded 10-question diagnostic, and summary report.
- **Zero Backend / No API Keys Required:** All progress, practice responses, quiz scores, and custom vocabulary are persisted locally in browser `localStorage`.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** + **Tailwind CSS v4**
- **KaTeX** for mathematical typesetting
- **jsPDF** for client-side A4 PDF generation
- **Lucide React** for UI icons

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs on port 3000)
npm run dev

# 3. Type-check and build for production
npm run lint
npm run build
```

## GitHub & Vercel Deployment

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SAT MATH LAB"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Import the repository into [Vercel](https://vercel.com/new).
3. Vercel automatically detects Vite (`vercel.json` is included):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy with zero environment variables required.
