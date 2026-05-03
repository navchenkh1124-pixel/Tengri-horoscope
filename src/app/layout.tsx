import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Cinzel } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cinzel',
})

export const metadata: Metadata = {
  title: 'Tengri Horoscope — AI Зурхай',
  description: 'Монгол уламжлалт зурхай, Барууны астрологи болон Ведик тооцоог AI-р нэгтгэсэн платформ.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className={`${cormorant.variable} ${dmSans.variable} ${cinzel.variable}`}>
        {children}
      </body>
    </html>
  )
}
