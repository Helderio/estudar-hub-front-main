import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropProps {
  id: string;
  accept: string;
  file: File | null;
  onFile: (file: File | undefined) => void;
  onClear?: () => void;
  hint: string;
  preview?: string | null;
  className?: string;
}

/** Zona para escolher ou largar um ficheiro. */
export const FileDrop = ({ id, accept, file, onFile, onClear, hint, preview, className }: FileDropProps) => {
  const [over, setOver] = useState(false);

  const accepts = (f: File) =>
    accept
      .split(',')
      .map((a) => a.trim())
      .some((a) => (a.endsWith('/*') ? f.type.startsWith(a.slice(0, -1)) : f.type === a));

  return (
    <div className={cn('relative', className)}>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f && accepts(f)) onFile(f);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed px-4 py-6 text-center transition-colors',
          over ? 'border-primary bg-primary/5' : 'border-input bg-card hover:border-primary/50',
          preview && 'p-0',
        )}
      >
        {preview ? (
          <img src={preview} alt="" className="aspect-[16/7] w-full object-cover" />
        ) : (
          <>
            <Upload size={20} className="text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium text-foreground">{file ? file.name : 'Escolher ficheiro ou largar aqui'}</span>
            <span className="text-xs text-muted-foreground">{hint}</span>
          </>
        )}
        <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {file && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Remover ficheiro"
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-card/95 text-muted-foreground shadow-sm hover:text-foreground"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};
