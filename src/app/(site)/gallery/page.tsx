export default function GalleryPage() {
  const placeholders = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-charcoal-900 pt-32 pb-20 px-6 text-center">
        <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-4">
          Inspiration
        </p>
        <h1 className="font-serif text-5xl font-bold text-white mb-4">
          Salon Gallery
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Real salons. Real transformations. See how our furniture looks in
          professional spaces across the US.
        </p>
      </section>

      {/* Gallery grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {placeholders.map((i) => (
              <div
                key={i}
                className="aspect-square bg-cream-100 rounded-2xl flex items-center justify-center border border-cream-200 hover:border-gold-400 transition-colors group cursor-pointer"
              >
                <span className="font-serif text-4xl text-cream-200 group-hover:text-gold-400/30 transition-colors">
                  K
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-charcoal-800/30 mt-8">
            Gallery images coming soon — add photos via your Supabase storage bucket.
          </p>
        </div>
      </section>
    </div>
  );
}
