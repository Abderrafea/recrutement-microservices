import { useRef, useState, type DragEvent, type ChangeEvent, type ReactNode } from 'react';

interface FileUploadZoneProps {
  label: string;
  accept?: string;
  error?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  icon?: ReactNode;
}

const defaultIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
  </svg>
);

export function FileUploadZone({ label, accept = '.pdf,.doc,.docx', error, value, onChange, icon }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | null) {
    if (!file) return;
    const name = file.name.toLowerCase();
    const allowed = accept.split(',').map((e) => e.trim().replace('*', ''));
    const valid = allowed.some((ext) => name.endsWith(ext));
    if (!valid) return;
    onChange(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-ink/70">{label}</label>

      <div
        role="button"
        tabIndex={0}
        aria-label={`Déposer ou sélectionner ${label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          'group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-coral bg-coral/5 scale-[1.01]'
            : value
              ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50'
              : 'border-ink/20 bg-white/60 hover:border-coral/60 hover:bg-coral/5',
          error ? 'border-rose-400 bg-rose-50/40' : '',
        ].join(' ')}
      >
        {/* Icon area */}
        <div className={[
          'flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-200',
          value ? 'bg-emerald-100 text-emerald-600' : 'bg-ink/5 text-ink/40 group-hover:bg-coral/10 group-hover:text-coral',
        ].join(' ')}>
          {value ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          ) : (icon ?? defaultIcon)}
        </div>

        {/* Text */}
        {value ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-700 truncate max-w-[220px]">{value.name}</p>
            <p className="text-xs text-emerald-600/70 mt-0.5">{(value.size / 1024).toFixed(1)} Ko · Cliquer pour changer</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold text-ink/65 group-hover:text-ink/80 transition-colors">
              Glissez-déposez ou <span className="text-coral underline underline-offset-2">parcourez</span>
            </p>
            <p className="text-xs text-ink/40 mt-0.5">PDF, DOC, DOCX · Max 10 Mo</p>
          </div>
        )}

        {/* Dragging overlay */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-coral/10 flex items-center justify-center pointer-events-none">
            <p className="text-sm font-bold text-coral animate-pulse">Déposez ici !</p>
          </div>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleInputChange}
      />
    </div>
  );
}
