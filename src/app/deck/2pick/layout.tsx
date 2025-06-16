
export default function DeckLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
          <header className="fixed top-0 left-0 right-0 h-16 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4 truncate">
            <p className="text-xl font-bold truncate">2Pick構築</p>
          </div>
        </div>
      </header>
      <main className="pt-20 px-2">
        {children}
      </main>
    </>
  );
}
