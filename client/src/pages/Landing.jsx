import LandingBackground from "../components/landing/LandingBackground";
import HeroSection from "../components/landing/HeroSection";
import CampusBanner from "../components/landing/CampusBanner";
import FeaturesSection from "../components/landing/FeaturesSection";
import AnalyticsSection from "../components/landing/AnalyticsSection";
import RolesSection from "../components/landing/RolesSection";
import FinalCtaSection from "../components/landing/FinalCtaSection";

const Landing = () => {
  return (
    <div className="overflow-x-hidden bg-[#fcfcff] text-slate-900">
      <LandingBackground />

      <main>
        <HeroSection />
        <CampusBanner />
        <FeaturesSection />
        <AnalyticsSection />
        <RolesSection />
        <FinalCtaSection />
      </main>
    </div>
  );
};

export default Landing;