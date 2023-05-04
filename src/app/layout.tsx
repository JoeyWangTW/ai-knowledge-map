import './globals.css'

export const metadata = {
  title: 'AI Knowledge Map',
  description: 'Transform your brainstorming with AI-powered diagrams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen bg-zinc-800 text-white" >{children}</body>
    </html>
  )
}
