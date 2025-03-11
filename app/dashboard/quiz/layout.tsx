export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full mx-auto px-5 md:px-0 overflow-hidden p-12 max-w-[1024px]">
      <main>{children}</main>
    </div>
  );
}
