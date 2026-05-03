export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-24 text-center font-sans dark:bg-black">
      <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
        {/* [ES-DRAFT] */}
        Hola. Bienvenida a Mente.
      </h1>
      <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {/* [ES-DRAFT] */}
        Estamos construyendo una compañera para acompañarte durante la
        perimenopausia: con seguimiento de síntomas, informes para tu médica y
        contenido confiable, todo en español.
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        {/* [ES-DRAFT] */}
        Pronto, aquí.
      </p>
    </main>
  );
}
