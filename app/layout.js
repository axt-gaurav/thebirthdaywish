import { Pacifico, Quicksand } from 'next/font/google';
import CONFIG from './config';
import './globals.css';

const pacifico = Pacifico({ weight: '400', subsets: ['latin'], variable: '--font-pacifico' });
const quicksand = Quicksand({ weight: ['500', '700'], subsets: ['latin'], variable: '--font-quicksand' });

export const metadata = {
  title: CONFIG.name ? `Happy Birthday, ${CONFIG.name}` : 'Happy Birthday',
  description: 'A little birthday surprise',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${pacifico.variable} ${quicksand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
