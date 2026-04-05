import { useRef, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useProgressPhotos } from '../hooks/useProgressPhotos'
import { useUploadPhoto, useDeletePhoto } from '../hooks/useUploadPhoto'
import type { BodyProgressPhoto, ProgressPhotoType } from '@/types'

const PHOTO_TYPES: { type: ProgressPhotoType; label: string }[] = [
  { type: 'front', label: 'Front' },
  { type: 'back', label: 'Back' },
  { type: 'side', label: 'Side' },
]

// ─── Resolve photo URL (supports both Cloudinary https:// and legacy local paths) ───
function resolveUrl(photoUrl: string): string {
  if (photoUrl.startsWith('http')) return photoUrl
  const base = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'
  return `${base}${photoUrl}`
}

// ─── Image Lightbox Modal ─────────────────────────────────────────────────────
interface LightboxProps {
  photos: Record<ProgressPhotoType, BodyProgressPhoto | undefined>
  initialType: ProgressPhotoType
  onClose: () => void
}

function Lightbox({ photos, initialType, onClose }: LightboxProps) {
  const [currentIdx, setCurrentIdx] = useState(
    PHOTO_TYPES.findIndex((p) => p.type === initialType),
  )

  const current = PHOTO_TYPES[currentIdx]
  const photo = photos[current.type]

  const canPrev = currentIdx > 0
  const canNext = currentIdx < PHOTO_TYPES.length - 1

  const prev = useCallback(() => {
    if (canPrev) setCurrentIdx((i) => i - 1)
  }, [canPrev])

  const next = useCallback(() => {
    if (canNext) setCurrentIdx((i) => i + 1)
  }, [canNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [prev, next, onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Type tabs */}
        <div className="flex gap-1">
          {PHOTO_TYPES.map(({ type, label }, idx) => (
            <button
              key={type}
              onClick={() => setCurrentIdx(idx)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium font-manrope transition-colors',
                idx === currentIdx
                  ? 'bg-white text-black'
                  : photos[type]
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white/10 text-white/40 cursor-not-allowed',
              )}
              disabled={!photos[type]}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Image area */}
      <div
        className="relative flex items-center justify-center w-full h-full px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev arrow */}
        <button
          onClick={prev}
          disabled={!canPrev}
          className={clsx(
            'absolute left-3 p-3 rounded-full transition-colors',
            canPrev
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'text-white/20 cursor-not-allowed',
          )}
          aria-label="Previous photo"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Photo */}
        <div className="flex flex-col items-center gap-3 max-h-full">
          {photo ? (
            <img
              key={current.type}
              src={resolveUrl(photo.photoUrl)}
              alt={current.label}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-64 w-48 rounded-xl bg-white/5 border-2 border-dashed border-white/20">
              <svg className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/40 text-sm font-manrope">No photo yet</p>
            </div>
          )}

          {/* Label + date */}
          <div className="text-center">
            <p className="text-white font-medium font-manrope capitalize">{current.label}</p>
            {photo && (
              <p className="text-white/50 text-xs font-manrope mt-0.5">
                {new Date(photo.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          disabled={!canNext}
          className={clsx(
            'absolute right-3 p-3 rounded-full transition-colors',
            canNext
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'text-white/20 cursor-not-allowed',
          )}
          aria-label="Next photo"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
        {PHOTO_TYPES.map(({ type }, idx) => (
          <button
            key={type}
            onClick={() => setCurrentIdx(idx)}
            className={clsx(
              'w-2 h-2 rounded-full transition-all',
              idx === currentIdx ? 'bg-white w-5' : 'bg-white/30 hover:bg-white/50',
            )}
            aria-label={PHOTO_TYPES[idx].label}
          />
        ))}
      </div>
    </div>,
    document.body,
  )
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({
  photoType,
  existing,
  onView,
}: {
  photoType: ProgressPhotoType
  existing?: BodyProgressPhoto
  onView: (type: ProgressPhotoType) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: upload, isPending: uploading } = useUploadPhoto()
  const { mutate: remove, isPending: removing } = useDeletePhoto()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('photoType', photoType)
    upload(formData)
    e.target.value = ''
  }

  const photoUrl = existing ? resolveUrl(existing.photoUrl) : null

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={clsx(
          'relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-colors',
          existing
            ? 'border-brand/20 hover:border-brand/50 cursor-pointer'
            : 'border-dashed border-outline-variant/50 hover:border-outline-variant bg-surface-low cursor-pointer',
        )}
        onClick={() => {
          if (uploading || removing) return
          if (existing) {
            onView(photoType)
          } else {
            inputRef.current?.click()
          }
        }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={photoType} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant/60">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs">Add photo</span>
          </div>
        )}

        {(uploading || removing) && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {/* View icon overlay on hover */}
        {existing && !uploading && !removing && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity p-2 rounded-full bg-black/50">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        )}

        {/* Delete + Upload buttons for existing photo */}
        {existing && !uploading && !removing && (
          <div className="absolute bottom-1.5 right-1.5 flex gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Replace */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="Replace photo"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            {/* Delete */}
            <button
              type="button"
              onClick={() => remove(existing.id)}
              className="h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
              aria-label="Remove photo"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <span className="text-xs font-medium text-on-surface-variant font-manrope capitalize">{photoType}</span>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function ProgressPhotoSection() {
  const { data: photos = [], isLoading } = useProgressPhotos()
  const [viewingType, setViewingType] = useState<ProgressPhotoType | null>(null)

  const latestByType = PHOTO_TYPES.reduce<Record<ProgressPhotoType, BodyProgressPhoto | undefined>>(
    (acc, { type }) => {
      acc[type] = photos
        .filter((p) => p.photoType === type)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      return acc
    },
    {} as Record<ProgressPhotoType, BodyProgressPhoto | undefined>,
  )

  return (
    <>
      <Card header="Progress Photos">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mt-1">
            {PHOTO_TYPES.map(({ type }) => (
              <UploadZone
                key={type}
                photoType={type}
                existing={latestByType[type]}
                onView={setViewingType}
              />
            ))}
          </div>
        )}
        <p className="text-xs text-on-surface-variant/60 font-manrope mt-3 text-center">
          Tap a zone to upload · Tap photo to view
        </p>
      </Card>

      {viewingType && (
        <Lightbox
          photos={latestByType}
          initialType={viewingType}
          onClose={() => setViewingType(null)}
        />
      )}
    </>
  )
}
