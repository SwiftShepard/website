export default function TransitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="transition-page">
      {children}
    </div>
  );
} 