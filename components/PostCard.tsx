// components/PostCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'

// Helper untuk format tanggal ala Twitter (dd/mm/yyyy)
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
      background: 'rgba(255, 255, 255, 0.02)', // Background post lebih gelap/transparan
      borderBottom: '1px solid var(--border-color)', // Garis pemisah tipis di bawah
      padding: '20px 0', // Padding vertikal agak lega
      display: 'flex',
      gap: '15px' // Jarak antara foto dan konten
    }}>
      
      {/* --- BAGIAN KIRI: FOTO PROFIL ALA TWITTER (CLEAN) --- */}
      <Link href={`/user/${post.author.username}`} style={{flexShrink: 0}}>
        <div style={{
          width: '48px', height: '48px', // Ukuran standar Twitter
          borderRadius: '50%', overflow: 'hidden',
          background: '#333', // Fallback color
          // HAPUS BORDER NEON DISINI. Ganti dengan border sangat tipis atau hapus sama sekali.
          border: '1px solid rgba(255,255,255,0.08)' 
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
            // Placeholder kalau gak ada foto (Inisial Nama)
            <div style={{
              width: '100%', height: '100%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 'bold', color: '#888', background: '#222'
            }}>
              {post.author.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      </Link>

      {/* --- BAGIAN KANAN: KONTEN POST --- */}
      <div style={{flexGrow: 1}}>
        {/* Header: Nama, Username, Tanggal */}
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap'}}>
          <Link href={`/user/${post.author.username}`} style={{textDecoration: 'none', color: '#fff', fontWeight: 'bold', fontSize: '15px'}}>
              {post.author.name}
          </Link>
          <span style={{color: 'var(--text-muted)', fontSize: '14px'}}>
            @{post.author.username} · {formatDate(post.createdAt)}
          </span>
        </div>

        {/* Isi Postingan */}
        <h3 style={{
          fontSize: '16px', fontWeight: 'normal', margin: '0 0 10px 0', 
          color: '#fff', lineHeight: '1.5', whiteSpace: 'pre-wrap'
        }}>
          {post.title}
        </h3>
        {post.content && (
           <p style={{fontSize:'15px', color:'var(--text-muted)', lineHeight:'1.5', margin:'0 0 15px 0', whiteSpace: 'pre-wrap'}}>
             {post.content}
           </p>
        )}

        {/* Footer: Tombol Like & Komen */}
        <div style={{display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '13px'}}>
           <LikeButton post={post} currentUserId={currentUserId} />
           
           <div style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
             <span>💬</span>
             <span>{post.comments.length} Comment</span>
           </div>
        </div>
        
        {/* Bagian Komentar (Accordion) */}
        <CommentSection post={post} currentUserId={currentUserId} />
      </div>
    </article>
  )
}