import { useRef, useState, type DragEvent } from 'react'

interface FileDropzoneProps {
  onFile: (file: File) => void
}

export function FileDropzone({ onFile }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onFile(file)
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
      <span className="text-4xl">📄</span>
      <p className="font-medium text-stone-800">
        Sleep je bankafschrift of Excel-bestand hierheen, of klik om te kiezen
      </p>
      <p className="text-sm text-stone-500">CSV of XLSX — bijvoorbeeld een export van je bank</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}
