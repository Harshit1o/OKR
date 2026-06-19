import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { cn } from "@plane/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPLIT_REGEX = /[\s,;]+/;

type Props = {
  existingEmails: string[];
  onAppend: (emails: string[]) => void;
  className?: string;
};

function parseEmails(raw: string, existing: Set<string>): { valid: string[]; invalid: string[] } {
  const tokens = raw
    .split(SPLIT_REGEX)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const tok of tokens) {
    if (seen.has(tok) || existing.has(tok)) continue;
    seen.add(tok);
    if (EMAIL_REGEX.test(tok)) valid.push(tok);
    else invalid.push(tok);
  }
  return { valid, invalid };
}

export function BulkEmailPanel({ existingEmails, onAppend, className }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const existingSet = new Set(existingEmails.map((e) => e.trim().toLowerCase()).filter(Boolean));

  const handleAdd = () => {
    const { valid, invalid } = parseEmails(text, existingSet);
    if (valid.length === 0) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("error"),
        message:
          invalid.length > 0
            ? `No valid emails found. Invalid: ${invalid.slice(0, 3).join(", ")}${invalid.length > 3 ? "…" : ""}`
            : "Paste at least one email address.",
      });
      return;
    }
    onAppend(valid);
    setText("");
    setOpen(false);
    setToast({
      type: TOAST_TYPE.SUCCESS,
      title: "Added",
      message:
        invalid.length > 0
          ? `${valid.length} email${valid.length === 1 ? "" : "s"} added. Skipped ${invalid.length} invalid.`
          : `${valid.length} email${valid.length === 1 ? "" : "s"} added.`,
    });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("error"),
        message: "File too large (max 2 MB).",
      });
      e.target.value = "";
      return;
    }
    try {
      const content = await file.text();
      setText((prev) => (prev ? `${prev}\n${content}` : content));
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("error"),
        message: "Could not read file.",
      });
    }
    e.target.value = "";
  };

  return (
    <div className={cn("rounded-md border border-subtle bg-layer-1 px-3 py-2", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-13 font-medium text-secondary hover:text-primary"
      >
        <span>Bulk invite — paste a list or upload CSV</span>
        <span className="text-11 text-tertiary">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"alice@example.com, bob@example.com\ncarol@example.com"}
            rows={4}
            className="w-full resize-y rounded-md border border-subtle bg-canvas px-2 py-1.5 text-13 text-primary outline-none focus:border-accent-strong"
          />
          <div className="flex items-center justify-between gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-12 text-secondary hover:text-primary">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload .csv / .txt</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="hidden"
                onChange={handleFile}
              />
            </label>
            <Button type="button" variant="primary" size="sm" onClick={handleAdd}>
              Add to invitations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
