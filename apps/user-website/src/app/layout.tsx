import type { Metadata } from 'next'
import { Archivo_Narrow, Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo-narrow',
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam-pro',
})

export const metadata: Metadata = {
  title: 'IDL News - User Website',
  description: 'IDL News User Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${archivoNarrow.variable} ${beVietnamPro.variable}`}>{children}</body>
    </html>
  )
}
