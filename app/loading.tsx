'use client' // Wajib ditambahkan di baris paling atas!

import { Spinner } from '@geist-ui/core';

export default function Loading() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-neutral-900">
      <Spinner />
    </div>
  );
}