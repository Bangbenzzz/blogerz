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
      /* GANTI BACKGROUND BIAR ADAPTIF */
      background: 'transparent', 
      borderBottom: '1px solid var(--border-color)', 
      padding: '20px 0', 
      display: 'flex',
      gap: '15px' 
    }}>
      
      {/* --- BAGIAN KIRI: FOTO PROFIL --- */}
      <Link href={`/user/${post.author.username}`} style={{flexShrink: 0}}>
        <div style={{
          width: '48px', height: '48px', 
          borderRadius: '50%', overflow: 'hidden',
          /* GANTI BACKGROUND Placeholder biar gak hitam pekat di light mode */
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)' 
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
            // Placeholder Inisial
            <div style={{
              width: '100%', height: '100%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 'bold', 
              /* GANTI WARNA BIAR ADAPTIF */
              color: 'var(--text-muted)', 
              background: 'var(--bg-secondary)' // atau transparent
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
          
          {/* NAMA USER: DULU ERROR DI LIGHT MODE, SEKARANG FIXED */}
          <Link href={`/user/${post.author.username}`} style={{
              textDecoration: 'none', 
              color: 'var(--text-main)', /* <--- SUDAH DIGANTI */
              fontWeight: 'bold', 
              fontSize: '15px'
          }}>
              {post.author.name}
          </Link>
          
          <span style={{color: 'var(--text-muted)', fontSize: '14px'}}>
            @{post.author.username} · {formatDate(post.createdAt)}
          </span>
        </div>

        {/* JUDUL POSTINGAN */}
        <h3 style={{
          fontSize: '16px', fontWeight: 'normal', margin: '0 0 10px 0', 
          /* GANTI JADI TEXT-MAIN */
          color: 'var(--text-main)', 
          lineHeight: '1.5', whiteSpace: 'pre-wrap'
        }}>
          {post.title}
        </h3>

        {/* ISI KONTEN */}
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
        
        {/* Bagian Komentar */}
        <CommentSection post={post} currentUserId={currentUserId} />
      </div>
    </article>
  )
}