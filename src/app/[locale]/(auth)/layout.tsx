export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[78vh] items-center justify-center bg-cream-50 px-5 py-14">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
