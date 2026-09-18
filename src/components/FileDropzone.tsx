import { useRef, useState, type DragEvent, type ReactNode } from 'react'

interface FileDropzoneProps {
  onFile: (file: File) => void
  accept: string
  icon: ReactNode
  title: string
  hint: string
}

export function FileDropzone({ onFile, accept, icon, title, hint }: FileDropzoneProps) {
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
      <span className="text-4xl">{icon}</span>
      <p className="font-medium text-stone-800">{title}</p>
      <p className="text-sm text-stone-500">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
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
