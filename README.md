# Certificate Generator

A client-side web application built with Next.js to automate the generation of certificates. Users can upload a background template (PDF, PNG, or JPG), upload an Excel file containing user data, map the data to the certificate using an interactive canvas, and download the generated certificates as a ZIP file containing multiple PDFs. Additionally, the text editor features a color change option, so users can easily change the color of the text.

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Excel Parsing:** `xlsx`
- **Interactive Canvas:** `fabric.js`
- **PDF Generation:** `pdf-lib`
- **PDF Rendering:** `pdfjs-dist` (for PDF template uploads)
- **ZIP Bundling:** `jszip` & `file-saver`
- **Email Sending:** `nodemailer` (SMTP)

---

## 📁 Folder Structure

```text
certi/
├── app/
│   ├── api/
│   │   └── send-email/
│   │       └── route.ts          # Next.js API route for sending emails via SMTP
│   ├── globals.css               # Global styles and Tailwind configuration
│   ├── layout.tsx                # Main application layout
│   └── page.tsx                  # Main application page (holds the Editor)
├── components/
│   ├── ui/                       # Generic UI components (Buttons, Inputs, Dialogs)
│   └── editor/                   # Specific components for the certificate generator
│       ├── CertificateEditor.tsx # The main wrapper component
│       ├── CanvasWorkspace.tsx   # The Fabric.js interactive canvas area
│       ├── Toolbar.tsx           # Controls for text (font size, color, add variable)
│       ├── ExportPanel.tsx       # Progress bar and Download buttons
│       └── EmailPanel.tsx        # Email distribution UI (ZIP upload, matching, sending)
├── lib/
│   ├── utils.ts                  # Helper functions (e.g., Tailwind class merging)
│   ├── excel.ts                  # Logic to read and parse .xlsx/.csv files using `xlsx`
│   ├── pdf.ts                    # PDF rendering (pdfjs-dist) for template uploads
│   ├── generator.ts              # Logic to loop data, create PDFs, and zip using `jszip`
│   ├── email-matcher.ts          # Unzip signed PDFs, read metadata, match to Excel rows
│   └── file.ts                   # ZIP/file download helpers (jszip, file-saver)
├── hooks/
│   └── useEditorState.ts         # Custom React hook to manage canvas state, uploaded data, and selected template
└── public/                       # Static assets (fonts, default images)
```

---

## 🗺️ Project Implementation Plan

### Phase 1: Setup & Foundations (✅ Completed)

- [x] Scaffold the folders (`components/editor`, `lib`, `hooks`).
- [x] Build the main `CertificateEditor` layout (a top-level mode switch between the Generator Hub and the Email Distribution Hub).
- [x] Setup basic UI components.

### Phase 2: Data & File Handling (✅ Completed)

- [x] Build the File Upload UI (integrated directly into the Editor sidebar for simplicity).
- [x] Implement `lib/excel.ts` to parse uploaded Excel files and extract column headers (e.g., "Name", "Score") and row data.
- [x] Handle template file uploads (PDF, PNG, JPG) to set as the certificate background.
  - _Note on PDFs:_ If a user uploads a PDF template, the app uses `pdfjs-dist` to safely read the first page in-memory and convert it to a high-quality image for the canvas. The original PDF file on the user's computer is **never modified or overwritten**.
- [x] Create the `useEditorState` hook to store the parsed Excel data and the template image URL.

### Phase 3: The Interactive Canvas (✅ Completed)

- [x] Integrate `fabric.js` into `CanvasWorkspace.tsx`.
- [x] Load the uploaded template (PDF, PNG, JPG) as the non-movable background of the canvas.
- [x] Display buttons for each detected Excel column header in the Design tab.
- [x] When a header is clicked, spawn a draggable, resizable text box on the canvas representing that variable (e.g. `{{Name}}`).

### Phase 4: Toolbar & Styling (✅ Completed)

- [x] Build the `Toolbar.tsx` using Shadcn UI components (Select, Slider, Input, Label).
- [x] Allow the user to click a text box on the canvas and change its styling:
  - Font Size (Slider + number input, range 8–200)
  - Font Family (10 built-in fonts via Select dropdown)
  - Text Color (native color picker + hex input)
  - Bold / Italic / Underline toggle buttons
  - Text Alignment (Left, Center, Right)
- [x] Add a "Delete" button to remove variables from the canvas.
- [x] Toolbar auto-syncs when switching between selected objects.

### Phase 4.5: Live Preview (✅ Completed)

- [x] Add a preview mode where `{{Name}}`, `{{Score}}`, etc. are replaced with real data from the Excel rows.
- [x] Add "Previous / Next" buttons to cycle through rows (e.g., Row 1 of 50, Row 2 of 50...).
- [x] Allow the user to toggle between **Edit mode** (shows `{{variables}}`, draggable) and **Preview mode** (shows real data, non-editable).
- [x] Use `fabric.Textbox` instead of `IText` so long text wraps automatically within a resizable width boundary.
- [x] This lets the user verify positioning and styling before generating.

### Phase 5: The Generation Engine (✅ Completed)

- [x] Build the `ExportPanel.tsx` and `lib/generator.ts`.
- [x] When "Generate" is clicked, write logic that:
  1. Loops through every row of the Excel data.
  2. Updates the text on the Fabric canvas with the current row's specific data.
  3. Converts the canvas to a 2× resolution PNG and embeds it in a PDF via `pdf-lib`.
  4. Pushes that PDF into a `jszip` bundle (with deduplicated filenames).
  5. Triggers a single `.zip` file download to the user using `file-saver`.
- [x] Export panel shows row/variable stats, animated progress bar, and success/error states.
- [ ] **(Proposed) Dual Export Mode:** Give users a choice between exporting as a **ZIP of single PDFs** (default) or a **Single Multi-page PDF**. If a single PDF is chosen, the generator will combine all certificates into one file and embed a comma-separated list of all recipient emails into the document's metadata for later matching.

### SMTP Email Configuration

To enable the bulk email distribution feature (Phase 6), this application uses SMTP (Simple Mail Transfer Protocol) configured via environment variables.

#### How SMTP Works

SMTP is the standard protocol for sending emails across the internet. By configuring SMTP credentials, you allow the Next.js server to log into your email provider (like Gmail, Outlook, or a custom server) and send emails on your behalf, just as if you were using an email client like Outlook or Apple Mail.

#### How to Set It Up

1. Create a `.env.local` file in the root of your project.
2. Add your SMTP credentials to the file:

```env
# Example for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Certification Board <no-reply@yourdomain.com>"
```

**Note for Gmail Users:** You cannot use your regular Gmail password. You must use an **App Password**.

1. Go to your [Google Account Security settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned on.
3. Search for **App passwords** and create a new one (e.g., name it "Certificate App").
4. Use that 16-character password as your `SMTP_PASS`.

---

### Phase 6: Bulk Email Distribution & Metadata Matching (✅ Completed)

- **The Challenge:** After certificates are signed by external/government applications, the files are often renamed, making it difficult to match them back to the correct person for emailing.
- **The Solution (Smart Matching):**
  - _Primary:_ The generator injects the recipient's unique email address into the hidden PDF `Keywords` metadata using `pdf-lib`. The system extracts this completely ignoring filenames.
  - _Fallback:_ If a PDF lacks metadata (e.g. externally generated), the system intelligently falls back to matching the base filename against the uploaded Excel rows to find the recipient.
- [x] **The Feature:**
  1. Created a dedicated top-level **Email Distributor** mode, hiding the visual canvas and presenting a clean distribution dashboard via `EmailPanel.tsx`.
  2. **Standalone Capable:** Users can upload `.xlsx` files directly in the Distributor Hub to use dynamic `{{Variables}}` in their emails, or they can skip Excel entirely and just send generic emails directly to addresses found in the PDFs.
  3. The user customizes an **Email Subject** and **Email Body Template** (supports `{{Variable}}` placeholders).
  4. The user uploads either a `.zip` file of signed PDFs or a single `.pdf` file.
     - _(Proposed)_ If a **Single Multi-page PDF** is uploaded (generated from the dual export mode), the system will read the comma-separated emails from the metadata, split the document into individual pages, and map each page to the correct email address for distribution.
  5. The system performs the Smart Matching (Metadata -> Filename) and displays a detailed **Match Preview** showing matched counts, the `SMTP_FROM` sender address, and a collapsible list of exact recipient emails.
     - _(Proposed)_ Add a **PDF Preview** feature for each matched recipient in the list, allowing users to view the exact certificate attachment before clicking "Send" to ensure accuracy.
  6. The app uses a **Next.js API route** (`app/api/send-email/route.ts`) to bulk email the PDFs to each recipient using `nodemailer` via SMTP.
  7. Full progress bar during sending, success/error states, and retry capability.
