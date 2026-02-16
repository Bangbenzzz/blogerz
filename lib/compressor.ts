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
        maxWidth = 1920, // Maksimal lebar 1920px
        maxHeight = 1080, // Maksimal tinggi 1080px
        quality = 0.8 // Kualitas 80%
      } = options
  
      // Validasi tipe file
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
  
          // Hitung rasio resize
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
  
          // Gambar gambar ke canvas dengan ukuran baru
          ctx.drawImage(img, 0, 0, width, height)
  
          // Konversi ke Blob (format WebP)
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Gagal mengompres gambar'))
  
              // Ubah blob jadi File dengan nama yang sama tapi ekstensi .webp
              const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
              const compressedFile = new File([blob], fileName, {
                type: 'image/webp',
                lastModified: Date.now()
              })
  
              resolve(compressedFile)
            },
            'image/webp', // Output format WebP
            quality
          )
        }
        
        img.onerror = (error) => reject(error)
      }
      
      reader.onerror = (error) => reject(error)
    })
  }