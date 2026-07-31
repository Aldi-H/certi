# Certificate Generator

A client-side web application built with Next.js to automate the generation of certificates. Users can upload a background image, upload an Excel file containing user data, map the data to the certificate using an interactive canvas, and download the generated certificates as a ZIP file containing multiple PDFs.

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Excel Parsing:** `xlsx`
- **Interactive Canvas:** `fabric.js`
- **PDF Generation:** `pdf-lib` / `jspdf`
- **ZIP Bundling:** `jszip` & `file-saver`

---

## 📁 Folder Structure

```text
certi/
├── app/
│   ├── globals.css           # Global styles and Tailwind configuration
│   ├── layout.tsx            # Main application layout
│   └── page.tsx              # Main application page (holds the Editor)
├── components/
│   ├── ui/                   # Generic UI components (Buttons, Inputs, Dialogs)
│   └── editor/               # Specific components for the certificate generator
│       ├── CertificateEditor.tsx # The main wrapper component
│       ├── FileUploader.tsx      # Handles drag-and-drop for Excel & Template
│       ├── CanvasWorkspace.tsx   # The Fabric.js interactive canvas area
│       ├── Toolbar.tsx           # Controls for text (font size, color, add variable)
│       └── ExportPanel.tsx       # Progress bar and Download buttons
├── lib/
│   ├── utils.ts              # Helper functions (e.g., Tailwind class merging)
│   ├── excel.ts              # Logic to read and parse .xlsx/.csv files using `xlsx`
│   └── generator.ts          # Logic to loop data, create PDFs, and zip using `jszip`
├── hooks/
│   └── useEditorState.ts     # Custom React hook to manage canvas state, uploaded data, and selected template
└── public/                   # Static assets (fonts, default images)
```

---

## 🗺️ Project Implementation Plan

### Phase 1: Setup & Foundations (✅ Completed)

- [x] Scaffold the folders (`components/editor`, `lib`, `hooks`).
- [x] Build the main `CertificateEditor` layout (a split view: Controls on the left, Canvas on the right).
- [x] Setup basic UI components.

### Phase 2: Data & File Handling

- Build the `FileUploader.tsx`.
- Implement `lib/excel.ts` to parse uploaded Excel files and extract column headers (e.g., "Name", "Score") and row data.
- Handle image file uploads to set as the certificate background.
- Create the `useEditorState` hook to store the parsed Excel data and the template image URL.

### Phase 3: The Interactive Canvas

- Integrate `fabric.js` into `CanvasWorkspace.tsx`.
- Load the uploaded template image as the non-movable background of the canvas.
- Display buttons for each detected Excel column header.
- When a header is clicked, spawn a draggable, resizable text box on the canvas representing that variable.

### Phase 4: Toolbar & Styling

- Build the `Toolbar.tsx`.
- Allow the user to click a text box on the canvas and change its styling:
  - Font Size & Font Family
  - Text Color
  - Text Alignment (Left, Center, Right)
- Add a "Delete" button to remove variables from the canvas.

### Phase 5: The Generation Engine (The Grand Finale)

- Build the `ExportPanel.tsx` and `lib/generator.ts`.
- When "Generate" is clicked, write logic that:
  1. Loops through every row of the Excel data.
  2. Updates the text on the hidden Fabric canvas with the current row's specific data.
  3. Converts the canvas to an image/PDF.
  4. Pushes that PDF into a `jszip` bundle.
  5. Triggers a single `.zip` file download to the user using `file-saver`.
