// lib/compressor.ts

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.0 - 1.0
}

export const compressImage = (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8
    } = options

    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar'))
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Gagal membuat konteks canvas'))

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Gagal mengompres gambar'))

            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
            const compressedFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now()
            })

            resolve(compressedFile)
          },
          'image/webp',
          quality
        )
      }
      
      img.onerror = (error) => reject(error)
    }
    
    reader.onerror = (error) => reject(error)
  })
}