import './globals.css';

export const metadata = {
  title: 'TradePulse - Verified Skilled Trade Jobs',
  description: 'Direct trade jobs with verified hourly pay, tooling and company benefits.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
