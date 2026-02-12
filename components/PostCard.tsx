// components/PostCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'

// Helper format tanggal
const formatDate = (dateString: Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'numeric', year: 'numeric'
  })
}

export default function PostCard({ post, currentUserId }: { post: any, currentUserId?: string }) {
  const hasAvatar = post.author?.avatarUrl

  return (
    <article style={{
      background: 'transparent',
      borderBottom: '1px solid var(--border-color)',
      // Padding diubah: Atas/Bawah 20px, Kiri/Kanan 0 (karena container utama sudah kasih jarak 5%)
      padding: '20px 0', 
      display: 'flex',
      gap: '15px',
      width: '100%',      // Pentung: Lebar penuh
      boxSizing: 'border-box', // Agar padding tidak nambah ukuran elemen
    }}>
      
      {/* --- BAGIAN KIRI: FOTO PROFIL --- */}
      <Link href={`/user/${post.author.username}`} style={{flexShrink: 0}}>
        <div style={{
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          overflow: 'hidden',
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)',
          // Responsif: Ukuran avatar bisa mengecil sedikit di mobile sangat kecil
          // (Opsional) bisa ditambahkan di media query CSS jika perlu
        }}>
          {hasAvatar ? (
             <Image 
               src={post.author.avatarUrl} 
               alt={post.author.name} 
               width={48} height={48} 
               style={{objectFit: 'cover', width: '100%', height: '100%'}} 
               unoptimized
             />
          ) : (
            <div style={{
              width: '100%', height: '100%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 'bold', 
              color: 'var(--text-muted)', 
              background: 'var(--bg-secondary)'
            }}>
              {post.author.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      </Link>

      {/* --- BAGIAN KANAN: KONTEN POST --- */}
      {/* Container ini akan memenuhi sisa ruang (flex-grow: 1) */}
      <div style={{
        flexGrow: 1, 
        minWidth: 0, // <--- INI PENTING! Agar teks panjang tidak mendorong layar melebar, tapi turun ke bawah (wrap)
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header: Nama, Username, Tanggal */}
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '2px', 
          flexWrap: 'wrap' // Agara nama dan tanggal turun baris baru jika layar sempit
        }}>
          
          <Link href={`/user/${post.author.username}`} style={{
              textDecoration: 'none', 
              color: 'var(--text-main)',
              fontWeight: 'bold', 
              fontSize: '15px'
          }}>
              {post.author.name}
          </Link>
          
          <span style={{
            color: 'var(--text-muted)', 
            fontSize: '14px',
            whiteSpace: 'nowrap' // Agar tanggal tidak terpotong aneh
          }}>
            @{post.author.username} · {formatDate(post.createdAt)}
          </span>
        </div>

        {/* JUDUL POSTINGAN */}
        <h3 style={{
          fontSize: '16px', 
          fontWeight: 'normal', 
          margin: '0 0 10px 0', 
          color: 'var(--text-main)', 
          lineHeight: '1.5', 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word' // Agar kata panjang OTOMATIS TURUN ke baris baru
        }}>
          {post.title}
        </h3>

        {/* ISI KONTEN (RESPONSIF) */}
        {post.content && (
           <p style={{
             fontSize:'15px', 
             color:'var(--text-muted)', 
             lineHeight:'1.6', // Sedikit dinaikkan untuk keterbacaan
             margin:'0 0 15px 0', 
             whiteSpace: 'pre-wrap',
             wordBreak: 'break-word', // Agar kata panjang OTOMATIS TURUN ke baris baru
             width: '100%' // Mengikuti lebar parent
           }}>
             {post.content}
           </p>
        )}

        {/* Footer: Tombol Like & Komen */}
        <div style={{
          display: 'flex', 
          gap: '30px', 
          color: 'var(--text-muted)', 
          fontSize: '13px',
          marginTop: 'auto' // Dorong footer ke bawah jika konten pendek
        }}>
           <LikeButton post={post} currentUserId={currentUserId} />
           
           <div style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
             <span>💬</span>
             <span>{post.comments.length} Comment</span>
           </div>
        </div>
        
        {/* Bagian Komentar */}
        <CommentSection post={post} currentUserId={currentUserId} />
      </div>
    </article>
  )
}