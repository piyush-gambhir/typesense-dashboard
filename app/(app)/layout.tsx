// import Footer from "@/components/Footer";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <Header />
      <div className="flex h-full flex-row">
        <Sidebar />
        {children}
      </div>

      {/* <Footer /> */}
    </div>
  );
}
