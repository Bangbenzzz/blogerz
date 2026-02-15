"use client";

import { useState, useEffect } from 'react';

export default function TypewriterText() {
  const text = "CREATIVE LOGIC";
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const speed = isDeleting ? 50 : 100; // Kecepatan hapus lebih cepat
    const pauseDuration = 2000; // Jeda 2 detik setelah selesai mengetik

    const handleTyping = () => {
      if (!isDeleting) {
        // Mode Mengetik
        if (index < text.length) {
          setDisplayedText(text.substring(0, index + 1));
          setIndex(index + 1);
        } else {
          // Selesai mengetik, tunggu lalu hapus
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        // Mode Menghapus
        if (index > 0) {
          setDisplayedText(text.substring(0, index - 1));
          setIndex(index - 1);
        } else {
          // Selesai menghapus, mulai mengetik lagi
          setIsDeleting(false);
        }
      }
    };

    const timer = setTimeout(handleTyping, speed);
    return () => clearTimeout(timer);
  }, [index, isDeleting, text]);

  return (
    // Ganti warna stroke dan border kursor ke Biru (#3B82F6)
    <span className="text-transparent [-webkit-text-stroke:2px_#3B82F6] relative">
      {displayedText}
      {/* Kursor Berkedip */}
      <span className="animate-[blink_1s_step-end_infinite] border-r-2 border-[#3B82F6] ml-1 absolute right-[-8px] top-0 h-full">&nbsp;</span>
    </span>
  );
}