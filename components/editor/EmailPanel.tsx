"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  ChevronDown,
  ChevronUp,
  Table,
} from "lucide-react";

import {
  matchCertificatesToRecipients,
  renderTemplate,
  type MatchedCertificate,
} from "@/lib/email-matcher";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface EmailPanelProps {
  excelData: Record<string, unknown>[];
  columns: string[];
  onExcelUpload?: (file: File) => void;
}

type EmailState =
  "configure" | "uploading" | "matched" | "sending" | "done" | "error";

export default function EmailPanel({
  excelData,
  columns,
  onExcelUpload,
}: EmailPanelProps) {
  // Auto-detect email column
  const defaultEmailCol =
    columns.find((c) => c.toLowerCase().includes("email")) ?? "";

  const [emailColumn, setEmailColumn] = useState(defaultEmailCol);
  const [subject, setSubject] = useState("Your Certificate is Ready!");
  const [bodyTemplate, setBodyTemplate] = useState(
    "Hello,\n\nPlease find your certificate attached to this email.\n\nBest regards,\nCertification Board",
  );
  const [state, setState] = useState<EmailState>("configure");
  const [matches, setMatches] = useState<MatchedCertificate[]>([]);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [senderEmail, setSenderEmail] = useState<string>("Loading...");

  useEffect(() => {
    fetch("/api/email-config")
      .then((res) => res.json())
      .then((data) => setSenderEmail(data.from))
      .catch(() => setSenderEmail("Error fetching sender info"));
  }, []);

  const zipInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const matchedCount =
    excelData.length > 0
      ? matches.filter((m) => m.matchedRow !== null).length
      : matches.filter((m) => !!m.email).length;
  const unmatchedCount = matches.length - matchedCount;

  const handleZipUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (excelData.length > 0 && !emailColumn) {
        alert("Please select the email column first.");
        return;
      }

      setState("uploading");
      setErrorMessage("");

      try {
        const results = await matchCertificatesToRecipients(
          file,
          excelData,
          emailColumn,
        );

        if (results.length === 0) {
          throw new Error("No PDF files found.");
        }

        setMatches(results);
        setState("matched");
      } catch (err) {
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to process the ZIP.",
        );
      }

      // Reset file input so the same file can be re-uploaded
      if (zipInputRef.current) zipInputRef.current.value = "";
    },
    [emailColumn, excelData],
  );

  const handleSendAll = useCallback(async () => {
    const toSend = matches.filter(
      (m) => m.email && (excelData.length === 0 || m.matchedRow !== null),
    );

    if (toSend.length === 0) {
      alert("No matched certificates to send.");
      return;
    }

    setState("sending");
    setSendProgress({ current: 0, total: toSend.length });
    setErrorMessage("");

    try {
      for (let i = 0; i < toSend.length; i++) {
        const cert = toSend[i];
        const row = cert.matchedRow;

        // Render the subject and body with row data
        const renderedSubject = renderTemplate(subject, row);
        const renderedBody = renderTemplate(bodyTemplate, row);

        const formData = new FormData();
        formData.append("to", cert.email);
        formData.append("subject", renderedSubject);
        formData.append("body", renderedBody);
        const pdfBuffer = cert.pdfBytes.buffer.slice(
          cert.pdfBytes.byteOffset,
          cert.pdfBytes.byteOffset + cert.pdfBytes.byteLength,
        ) as ArrayBuffer;
        const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
        formData.append("attachment", pdfBlob);
        formData.append("filename", cert.filename);

        const res = await fetch("/api/send-email", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || `Failed to send email to ${cert.email}`,
          );
        }

        setSendProgress({ current: i + 1, total: toSend.length });
      }

      setState("done");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to send emails.",
      );
    }
  }, [matches, subject, bodyTemplate]);

  const handleReset = () => {
    setState("configure");
    setMatches([]);
    setSendProgress({ current: 0, total: 0 });
    setErrorMessage("");
  };

  const sendPercentage =
    sendProgress.total > 0
      ? Math.round((sendProgress.current / sendProgress.total) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        {/* Step 1: Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail size={16} />
              Email Distribution
            </CardTitle>
            <CardDescription>
              Send signed certificates to recipients via email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email column selector (only if Excel data is present) */}
            {excelData.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Email Column</Label>
                  <Select value={emailColumn} onValueChange={setEmailColumn}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select the email column…" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!emailColumn && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Your Excel data must have a column with email addresses.
                    </p>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-xs">Email Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your Certificate is Ready!"
                disabled={state === "sending"}
              />
            </div>

            {/* Body template */}
            <div className="space-y-2">
              <Label className="text-xs">
                Email Body{" "}
                <span className="text-neutral-400">
                  (use {"{{Column}}"} for variables)
                </span>
              </Label>
              <textarea
                value={bodyTemplate}
                onChange={(e) => setBodyTemplate(e.target.value)}
                rows={5}
                disabled={state === "sending"}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Hello {{Name}},&#10;&#10;Please find your certificate attached..."
              />
              {columns.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {columns.slice(0, 5).map((col) => (
                    <Badge
                      key={col}
                      variant="secondary"
                      className="cursor-pointer font-mono text-[10px]"
                      onClick={() =>
                        setBodyTemplate((prev) => prev + `{{${col}}}`)
                      }
                    >
                      {`{{${col}}}`}
                    </Badge>
                  ))}
                </div>
              )}
              {excelData.length === 0 ? (
                <div className="mt-4 rounded-md bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                  <p className="mb-3">
                    <strong>💡 Pro Tip:</strong> You can use this distribution
                    hub independently! However, since you haven&apos;t uploaded
                    any Excel data, you won&apos;t be able to use dynamic
                    <code>{"{{Variables}}"}</code> in the email above.
                  </p>
                  {onExcelUpload && (
                    <div>
                      <input
                        type="file"
                        accept=".xlsx,.csv"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            onExcelUpload(e.target.files[0]);
                            if (excelInputRef.current)
                              excelInputRef.current.value = "";
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-blue-200 bg-white text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900"
                        onClick={() => excelInputRef.current?.click()}
                      >
                        <Table size={14} />
                        Upload Excel Data
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-md bg-neutral-100 p-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                  <p>
                    <strong>💡 Note:</strong> Your uploaded Excel data will be
                    used to replace the
                    <code>{"{{Variables}}"}</code> in the email above for each
                    specific recipient.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        {/* Step 2: Upload signed ZIP */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Upload Signed Certificates
            </CardTitle>
            <CardDescription>
              Upload the ZIP of signed PDFs. The app matches them to recipients
              using hidden metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="file"
              accept=".zip,.pdf"
              className="hidden"
              ref={zipInputRef}
              onChange={handleZipUpload}
            />

            {state === "configure" && (
              <>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => zipInputRef.current?.click()}
                  disabled={excelData.length > 0 && !emailColumn}
                >
                  <FileArchive size={16} />
                  Select ZIP or PDF
                </Button>
                <p className="text-center text-xs text-neutral-500">
                  Upload a .zip file of generated certificates, or a single .pdf
                  file.
                </p>
              </>
            )}

            {state === "uploading" && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-neutral-500">
                <Loader2 size={16} className="animate-spin" />
                Processing files and matching PDFs…
              </div>
            )}

            {/* Step 3: Match results */}
            {state === "matched" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center dark:border-green-800 dark:bg-green-950/30">
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">
                      {matchedCount}
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-500">
                      {excelData.length > 0 ? "Matched" : "Ready"}
                    </p>
                  </div>
                  {unmatchedCount > 0 && (
                    <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center dark:border-amber-800 dark:bg-amber-950/30">
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                        {unmatchedCount}
                      </p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-500">
                        {excelData.length > 0 ? "Unmatched" : "No Email Found"}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    From:
                  </p>
                  <div className="truncate rounded-md border border-neutral-200 bg-neutral-100 p-2 font-mono text-sm dark:border-neutral-800 dark:bg-neutral-900">
                    {senderEmail}
                  </div>
                </div>

                <div>
                  {/* Toggle details */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setShowMatchDetails((p) => !p)}
                  >
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      To: ({matchedCount} Recipients)
                    </span>
                    {showMatchDetails ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>

                  {showMatchDetails && (
                    <div className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-2 text-xs dark:border-neutral-800">
                      {matches.map((m, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded px-2 py-1 ${
                            m.matchedRow
                              ? "bg-green-50 dark:bg-green-950/20"
                              : "bg-amber-50 dark:bg-amber-950/20"
                          }`}
                        >
                          <span className="truncate font-mono">
                            {m.email || "—"}
                          </span>
                          {excelData.length > 0 && (
                            <Badge
                              variant={m.matchedRow ? "default" : "secondary"}
                              className="ml-2 flex-shrink-0 text-[10px]"
                            >
                              {m.matchedRow ? "✓" : "?"}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <Button
                  className="w-full gap-2"
                  onClick={handleSendAll}
                  disabled={matchedCount === 0}
                >
                  <Send size={16} />
                  Send {matchedCount} Email{matchedCount !== 1 ? "s" : ""}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={handleReset}
                >
                  Start Over
                </Button>
              </div>
            )}

            {/* Sending progress */}
            {state === "sending" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <Loader2 size={12} className="animate-spin" />
                      Sending email {sendProgress.current + 1} of{" "}
                      {sendProgress.total}…
                    </span>
                    <span className="font-medium tabular-nums">
                      {sendPercentage}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 ease-out"
                      style={{ width: `${sendPercentage}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-neutral-500 tabular-nums">
                    {sendProgress.current} / {sendProgress.total}
                  </p>
                </div>
              </div>
            )}

            {/* Done */}
            {state === "done" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800 dark:bg-green-950/30">
                  <CheckCircle2
                    size={16}
                    className="flex-shrink-0 text-green-600 dark:text-green-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      All emails sent!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      {sendProgress.total} certificate
                      {sendProgress.total !== 1 ? "s" : ""} distributed
                      successfully.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={handleReset}
                >
                  Send Another Batch
                </Button>
              </div>
            )}

            {/* Error */}
            {state === "error" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-950/30">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Something went wrong
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500">
                      {errorMessage}
                    </p>
                  </div>
                </div>
                <Button className="w-full gap-2" onClick={handleReset}>
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
