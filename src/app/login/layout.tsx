
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Ensure dark theme is applied and use a very dark background
    // The 'dark' class on html and bg-background should handle this based on globals.css
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 dark">
      {children}
    </div>
  );
}
