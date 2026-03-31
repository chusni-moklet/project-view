'use client'
import { useState, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'

interface Props {
  value?: string
  onChange: (url: string) => void
  projectId?: string
}

export default function ImageUpload({ value, onChange, projectId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError('')
    setLoading(true)

    // Preview lokal dulu
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    const formData = new FormData()
    formData.append('file', file)
    if (projectId) formData.append('projectId', projectId)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Upload gagal')
      setPreview(value || '')
      setLoading(false)
      return
    }

    setPreview(data.url)
    onChange(data.url)
    setLoading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function remove() {
    setPreview('')
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-purple-200 group">
          <img src={preview} alt="Thumbnail" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={remove}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-600 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Hapus
            </button>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-purple-200 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all group"
        >
          {loading ? (
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <Upload className="h-5 w-5 text-violet-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Klik atau drag foto ke sini</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · Maks 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
