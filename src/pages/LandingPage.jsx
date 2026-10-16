import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Camera,
  CheckCircle2,
  Radio,
  Flame,
  CloudRain,
  PhoneCall,
  Sparkles,
  Car,
  ChevronRight,
  LifeBuoy,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';
import Badge from '../components/common/Badge';
import heroAmbulanceImg from '../assets/hero_ambulance.jpg';

export default function LandingPage() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900">
      {/* =========================================================================
          1. HERO SECTION (Strictly matching the upper-left quadrant of the mockup)
         ========================================================================= */}
      <section id="hero" className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
              {/* Emergency Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>24/7 Community Emergency Dispatch Network</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-slate-950 tracking-tight leading-[1.1]">
                  Faster Response
                  <span className="block text-slate-900">Safer Communities</span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Report emergencies, track updates, and help build a safer tomorrow.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/report">
                  <Button variant="primary" size="lg" icon={AlertTriangle} className="shadow-md">
                    Report an Emergency
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => scrollToSection('how-it-works')}
                  className="font-medium"
                >
                  Learn More
                </Button>
              </div>

              {/* Three Feature Cards Matching Mockup */}
              <div className="pt-2 sm:pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Feature 1: 24/7 Emergency Support */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-resq-card flex items-center space-x-3 transition-transform hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">24/7</div>
                    <div className="text-xs text-slate-500 leading-tight mt-0.5">Emergency Support</div>
                  </div>
                </div>

                {/* Feature 2: Real-time Updates */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-resq-card flex items-center space-x-3 transition-transform hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">Real-time</div>
                    <div className="text-xs text-slate-500 leading-tight mt-0.5">Updates</div>
                  </div>
                </div>

                {/* Feature 3: Safer Communities */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-resq-card flex items-center space-x-3 transition-transform hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">Safer</div>
                    <div className="text-xs text-slate-500 leading-tight mt-0.5">Communities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Column (5 cols on desktop, matching mockup composition) */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
              <div className="relative w-full max-w-lg lg:max-w-none">
                {/* Ambient emergency glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-amber-500/10 rounded-3xl blur-xl opacity-75 -z-10" />

                {/* Image Container with Organic Rounded Mask matching the reference */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-900 aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3]">
                  <img
                    src={heroAmbulanceImg}
                    alt="ResQOne Emergency Ambulance responding to high-priority citizen call"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Overlaid status badge at bottom of image */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-white">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-semibold tracking-wide">Emergency Services Active</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-600/90 text-white font-medium">
                      Avg Response: &lt;7m
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. HOW IT WORKS SECTION (Explaining the Citizen Reporting Workflow)
         ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              Clear &bull; Fast &bull; Coordinated
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              How ResQOne Works for Citizens
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              When an unexpected emergency occurs, seconds matter. Our 4-step workflow connects citizens directly with verified local first responders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card hoverable className="relative">
              <CardContent className="space-y-3 pt-6">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm border border-red-100">
                  01
                </div>
                <h3 className="text-base font-semibold text-slate-900">1. Report Emergency</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select incident category (Road Accident, Fire, Medical, Flood), share live GPS location, and attach supporting photos.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <MapPin className="w-3.5 h-3.5" /> One-tap GPS locator
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card hoverable className="relative">
              <CardContent className="space-y-3 pt-6">
                <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm border border-violet-100">
                  02
                </div>
                <h3 className="text-base font-semibold text-slate-900">2. Incident Verified</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The central command center verifies incident validity, calculates severity, and eliminates duplicate reports automatically.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-violet-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Rapid triage validation
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card hoverable className="relative">
              <CardContent className="space-y-3 pt-6">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm border border-sky-100">
                  03
                </div>
                <h3 className="text-base font-semibold text-slate-900">3. Team Dispatched</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nearest emergency responders (ambulances, fire brigade, police) are dispatched with optimized route navigation.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-sky-600 font-medium">
                  <Radio className="w-3.5 h-3.5" /> Unit assigned &amp; moving
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card hoverable className="relative">
              <CardContent className="space-y-3 pt-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100">
                  04
                </div>
                <h3 className="text-base font-semibold text-slate-900">4. Track to Resolution</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Follow step-by-step progress on your citizen dashboard timeline until responders complete on-site resolution.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Full status history
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SAFETY & COMMUNITY ADVISORIES (Echoing mockup "Safety Tips" card)
         ========================================================================= */}
      <section id="about" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Citizen Preparedness
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Community Safety &amp; Emergency Guidelines
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              Standard operating procedures every citizen should follow before responders arrive at the scene.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Safety Tip 1 */}
            <Card className="border-slate-200">
              <CardContent className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base">Road Collision Protocol</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Turn on hazard lights immediately. Do not move severely injured victims unless there is fire risk. Share landmark information for dispatchers.
                </p>
                <div className="pt-2">
                  <Badge status="in-progress" size="sm">First-aid Guidance</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tip 2 */}
            <Card className="border-slate-200">
              <CardContent className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CloudRain className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base">Heavy Rain &amp; Flooding</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  During heavy rain, avoid low-lying underpasses and waterlogged avenues. Keep mobile phones charged and monitor civil safety broadcasts.
                </p>
                <div className="pt-2">
                  <Badge status="resolved" size="sm">Weather Advisory</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tip 3 */}
            <Card className="border-slate-200">
              <CardContent className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base">Structural Fire Evacuation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evacuate via designated fire exits. Crawl low beneath toxic smoke, test door handles with back of hand before opening, and never use elevators.
                </p>
                <div className="pt-2">
                  <Badge status="critical" size="sm">Critical Evacuation</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Emergency Numbers Bar */}
          <div className="mt-10 bg-white border border-slate-200 rounded-xl p-5 shadow-resq-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 rounded-lg bg-red-600 text-white flex-shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">National Emergency Services Hotline</h4>
                <p className="text-xs text-slate-500">Free 24/7 telephonic dispatch throughout India</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-mono font-bold tracking-wider">
                Emergency: 112
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-medium">
                Ambulance: 108
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-medium">
                Fire: 101
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PROMINENT CALL TO ACTION (CTA)
         ========================================================================= */}
      <section id="cta" className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] text-white rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            {/* Background pattern and glow */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-slate-800/40 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl text-left space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                Community Vigilance Network
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Ready to Help Protect Your Neighborhood?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Join ResQOne to report civic incidents instantly, track official dispatch updates, and receive neighborhood safety warnings.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link to="/report">
                  <Button variant="primary" size="lg" icon={AlertTriangle}>
                    Report an Emergency
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-slate-400 text-slate-900 bg-white hover:bg-slate-100 hover:text-slate-900"
                  >
                    Create Citizen Account
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="lg" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Explore Citizen App &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CONTACT & HELPLINE SECTION
         ========================================================================= */}
      <section id="contact" className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-resq-card flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">24/7 Operations Desk</h4>
                <p className="text-xs text-slate-500 mt-0.5">Emergency coordination and citizen assistance</p>
                <p className="text-xs font-semibold text-red-600 mt-2">support@resqone.org</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-resq-card flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Coverage Territory</h4>
                <p className="text-xs text-slate-500 mt-0.5">District Command &amp; Municipal Service Sectors</p>
                <p className="text-xs font-semibold text-slate-700 mt-2">Indore &amp; Surrounding Regions</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-resq-card flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Citizen Data Protection</h4>
                <p className="text-xs text-slate-500 mt-0.5">Encrypted telemetry &amp; secure verification</p>
                <p className="text-xs font-semibold text-emerald-600 mt-2">Verified Emergency Platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
