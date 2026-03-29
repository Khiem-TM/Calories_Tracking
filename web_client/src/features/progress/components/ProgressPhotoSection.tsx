import { useRef } from 'react'
import { clsx } from 'clsx'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useProgressPhotos } from '../hooks/useProgressPhotos'
import { useUploadPhoto, useDeletePhoto } from '../hooks/useUploadPhoto'
import type { BodyProgressPhoto, ProgressPhotoType } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

const PHOTO_TYPES: { type: ProgressPhotoType; label: string }[] = [
  { type: 'front', label: 'Front' },
  { type: 'back', label: 'Back' },
  { type: 'side', label: 'Side' },
]

function UploadZone({
  photoType,
  existing,
}: {
  photoType: ProgressPhotoType
  existing?: BodyProgressPhoto
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

  const photoUrl = existing
    ? existing.photoUrl.startsWith('http')
      ? existing.photoUrl
      : `${BASE_URL}${existing.photoUrl}`
    : null

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={clsx(
          'relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-pointer transition-colors',
          existing
            ? 'border-brand/20 hover:border-brand/50'
            : 'border-dashed border-outline-variant/50 hover:border-outline-variant bg-surface-low',
        )}
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

        {existing && !removing && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); remove(existing.id) }}
            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Remove photo"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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

export function ProgressPhotoSection() {
  const { data: photos = [], isLoading } = useProgressPhotos()

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
    <Card header="Progress Photos">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mt-1">
          {PHOTO_TYPES.map(({ type }) => (
            <UploadZone key={type} photoType={type} existing={latestByType[type]} />
          ))}
        </div>
      )}
      <p className="text-xs text-on-surface-variant/60 font-manrope mt-3 text-center">
        Tap a zone to upload or replace a photo
      </p>
    </Card>
  )
}
