// app/(editor)/layout.tsx
export default function EditorLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen bg-transparent">
        {children}
      </div>
    );
  }
  