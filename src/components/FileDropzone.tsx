import { useRef, useState, type DragEvent, type ReactNode } from 'react'

interface FileDropzoneProps {
  onFiles: (files: File[]) => void
  accept: string
  icon: ReactNode
  title: string
  hint: string
  multiple?: boolean
}

export function FileDropzone({
  onFiles,
  accept,
  icon,
  title,
  hint,
  multiple = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) onFiles(multiple ? files : [files[0]])
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
        isDragging ? 'border-accent-500 bg-accent-50' : 'border-stone-300 hover:border-accent-400'
      }`}
    >
      <span className="text-4xl">{icon}</span>
      <p className="font-medium text-stone-800">{title}</p>
      <p className="text-sm text-stone-500">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length > 0) onFiles(files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
