import "./globals.css";

export const metadata = {
  title: "Clareia",
  description:
    "Plataforma educativa que ensina a verificar informações antes de compartilhar - Grupo G14, USJT.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
