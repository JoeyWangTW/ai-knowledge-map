export const metadata = {
  title: 'AI Knowledge Map',
  description: 'Learn with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen" >{children}</body>
    </html>
  )
}
