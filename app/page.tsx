import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#121212] container mx-auto px-12 py-4">
      <Navbar/>
      <div className="container mt-24 mx-auto px-12 py-4">
        <HeroSection />
      </div>
    </main>
  );
}
