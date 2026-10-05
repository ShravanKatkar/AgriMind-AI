import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { VoiceDemoSection } from "@/components/landing/voice-demo-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { DiseasePreviewSection } from "@/components/landing/disease-preview-section"
import { CropsSection } from "@/components/landing/crops-section"
import { MarketPreviewSection } from "@/components/landing/market-preview-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { StatsSection } from "@/components/landing/stats-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { StoriesSection } from "@/components/landing/stories-section"
import { FAQSection } from "@/components/landing/faq-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <VoiceDemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DiseasePreviewSection />
      <CropsSection />
      <MarketPreviewSection />
      <TestimonialsSection />
      <StatsSection />
      <PricingSection />
      <StoriesSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}
