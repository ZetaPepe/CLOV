import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { AIChatbox } from "@/components/ai-chatbox"
import { LogoMarquee } from "@/components/logo-marquee"
import { Footer } from "@/components/footer"

// ✅ Force static generation for low TTFB
export const dynamic = "force-static"

export default function Page() {
  return (
    <>
      <main className="min-h-[100dvh] text-white">
        <SiteHeader />
        <Hero />
        <AIChatbox />
        <LogoMarquee />
      </main>
      <Footer />
    </>
  )
}
