'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@baseplate/ui/button';

export interface MediaUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  label?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Drag-and-drop file uploader with preview list and upload action. Accepts
 * images or documents, shows selected file names and sizes, then calls
 * onUpload with the chosen File array.
 */
export function MediaUpload({
  onUpload,
  accept,
  multiple = false,
  label = 'Upload files',
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    setFiles((prev) => (multiple ? [...prev, ...incoming] : incoming));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleRemove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await onUpload(files);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed p-8 text-center transition ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <p className="text-sm text-gray-600">Drag and drop files here, or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm"
            >
              <span className="truncate text-gray-700">{file.name}</span>
              <span className="flex items-center gap-2">
                <span className="text-gray-500">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleUpload} disabled={files.length === 0 || loading}>
        {loading ? 'Uploading…' : 'Upload'}
      </Button>
    </div>
  );
}
