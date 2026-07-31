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

### Phase 2: Data & File Handling (✅ Completed)

- [x] Build the File Upload UI (integrated directly into the Editor sidebar for simplicity).
- [x] Implement `lib/excel.ts` to parse uploaded Excel files and extract column headers (e.g., "Name", "Score") and row data.
- [x] Handle image file uploads to set as the certificate background.
- [x] Create the `useEditorState` hook to store the parsed Excel data and the template image URL.

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

### Phase 6: Bulk Email Distribution & Metadata Matching (New Feature)

- **The Challenge:** After certificates are signed by external/government applications, the files are often renamed, making it difficult to match them back to the correct person for emailing.
- **The Solution (Invisible Metadata):** During **Phase 5**, the generator will inject the recipient's unique email address into the hidden PDF `Keywords` metadata using `pdf-lib`. This leaves the visual certificate completely untouched.
- **The Feature:**
  1. Create a new "Email Distribution" tab.
  2. The user can customize an **Email Message Template** (e.g., "Hello {{Name}}, please find your signed certificate attached...").
  3. The user uploads the returned `.zip` file of signed PDFs alongside the original Excel data.
  4. The app unzips the file, reads the hidden `Keywords` metadata from each PDF to extract the email address, completely ignoring the filenames.
  5. It matches the email to the exact row in the Excel data.
  6. The app uses an API route to bulk email the correctly matched, signed PDF to each recipient using the customized message template!
