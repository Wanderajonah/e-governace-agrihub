import { useState, useEffect, useRef } from "react";
import * as api from "../../api";
import {
  Leaf, Menu, X, Users, Package, ShieldCheck, TrendingUp,
  ArrowLeftRight, BarChart2, CheckSquare, Tag, ArrowRight,
  MapPin, Mail, Phone, Clock, ChevronRight, Star, Quote,
  Facebook, Twitter, Linkedin, Instagram, Send, ChevronDown,
  ChevronUp, Lock, Flower2, Sprout,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

type Screen =
  | "login"
  | "dashboard"
  | "farmers"
  | "produce-registration"
  | "produce-verification"
  | "commodity-prices"
  | "transactions"
  | "market-analytics"
  | "reports"
  | "government"
  | "users"
  | "notifications"
  | "settings";

interface LandingPageProps {
  onLogin: (token: string, user: any) => void;
}

const A = {
  bg: "#0a0a14",
  card: "#12121f",
  border: "#1e1e32",
  green: "#2ecc71",
  greenDark: "#27ae60",
  amber: "#f39c12",
  text: "#f0f0f0",
  muted: "#8888a0",
};

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPortal, setShowPortal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await api.login(email, password);
      const { token, user } = res.data.data;
      onLogin(token, user);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const detail = err.response?.data?.errors?.[0];
      setLoginError(detail || msg || "Login failed. Please check your credentials.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await api.register({ name: regName, email, password, phone: regPhone });
      const { token, user } = res.data.data;
      onLogin(token, user);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const detail = err.response?.data?.errors?.[0];
      setLoginError(detail || msg || "Registration failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const openPortal = () => setShowPortal(true);
  const closePortal = () => { setShowPortal(false); setLoginError(""); };

  const viewMarketPrices = async (market: any) => {
    setSelectedMarket(market);
    setLoadingPrices(true);
    setMarketPrices([]);
    try {
      const res = await api.listPrices({ limit: 20 });
      setMarketPrices(res.data.data || []);
    } catch { setMarketPrices([]); }
    finally { setLoadingPrices(false); }
  };
  const closeMarketPrices = () => setSelectedMarket(null);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#markets", label: "Markets" },
    { href: "#projects", label: "Projects" },
    { href: "#blog", label: "News" },
    { href: "#contact", label: "Contact" },
  ];

  const services = [
    {
      icon: Users,
      title: "Farmers Registry",
      desc: "Centralized digital database of all registered farmers with comprehensive profiles and certification history.",
    },
    {
      icon: Package,
      title: "Produce Tracking",
      desc: "End-to-end traceability from harvest to market, ensuring transparency in the agricultural supply chain.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Control",
      desc: "Standardized inspection and verification processes that certify produce quality before market entry.",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      desc: "Real-time price monitoring, demand forecasting, and market analytics for better decision-making.",
    },
  ];

  const features = [
    {
      icon: Leaf,
      title: "Farmer Registration",
      desc: "Digitally register and manage farmer profiles with complete traceability and history.",
    },
    {
      icon: CheckSquare,
      title: "Produce Management",
      desc: "Track produce from farm gate through quality verification with full chain-of-custody.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assurance",
      desc: "Standardised inspection workflows to ensure only quality produce reaches consumers.",
    },
    {
      icon: TrendingUp,
      title: "Price Intelligence",
      desc: "Real-time commodity pricing with historical trends for informed trading decisions.",
    },
    {
      icon: ArrowLeftRight,
      title: "Transaction Recording",
      desc: "Secure digital recording of all market transactions with instant receipt generation.",
    },
    {
      icon: BarChart2,
      title: "Analytics & Reports",
      desc: "Comprehensive dashboards with exportable reports for data-driven governance.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Tendo", role: "Market Officer, Nakasero",
      quote: "AgriHub transformed our market management. Registration that took days now takes minutes. The data quality is unmatched.", initial: "ST",
    },
    {
      name: "David Okello", role: "Analyst, Ministry of Agriculture",
      quote: "Real-time market data has fundamentally changed how we formulate agricultural policy. This is the future of governance.", initial: "DO",
    },
    {
      name: "Grace Akello", role: "Farmer, Wakiso District",
      quote: "I see fair prices before leaving my farm. AgriHub gives smallholder farmers a voice in the market.", initial: "GA",
    },
  ];

  const markets = [
    {
      name: "Nakasero Market", location: "Kampala Central", traders: "1,200+", volume: "450 tons/wk",
      image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop&auto=format",
    },
    {
      name: "Kalerwe Market", location: "Kawempe Division", traders: "850+", volume: "280 tons/wk",
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop&auto=format",
    },
    {
      name: "Kireka Market", location: "Wakiso District", traders: "600+", volume: "190 tons/wk",
      image: "https://images.unsplash.com/photo-1498579687547-5b8da6e0f12b?w=600&h=400&fit=crop&auto=format",
    },
    {
      name: "Owino Market", location: "Kampala Central", traders: "2,000+", volume: "600 tons/wk",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop&auto=format",
    },
  ];

  const blogPosts = [
    {
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop&auto=format",
      date: "23 May 2024", category: "Organic", title: "Why Agriculture & Eco is for the Environment",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacus odio, egestas vitae augue sed.",
    },
    {
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop&auto=format",
      date: "23 May 2024", category: "Farming", title: "Wheat Harvest Organic Gather nice Moment",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacus odio, egestas vitae augue sed.",
    },
    {
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop&auto=format",
      date: "08 May 2024", category: "Livestock", title: "Agriculture Matters to the Future of World",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacus odio, egestas vitae augue sed.",
    },
  ];

  const faqs = [
    { q: "Who can use AgriHub?", a: "AgriHub is designed for market officers, farmers, traders, government officials, and agricultural analysts. Each role has specific permissions and dashboards tailored to their needs." },
    { q: "Is AgriHub free for farmers?", a: "Yes, farmers can register and access market prices, track their produce, and view transaction history at no cost." },
    { q: "How does quality verification work?", a: "Certified inspectors examine produce upon arrival at the market, log quality assessments against national standards, and issue digital certificates." },
    { q: "Can I access market prices from my phone?", a: "Absolutely. AgriHub is fully responsive and works on all devices. Farmers can check real-time prices from any smartphone." },
  ];

  return (
    <div style={{ background: A.bg }} className="min-h-screen text-white font-sans">

      {/* ─── Top Bar ─── */}
      <div className="hidden lg:block" style={{ background: '#06060e', borderBottom: `1px solid ${A.border}` }}>
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-10">
          <div className="flex items-center gap-6 text-xs" style={{ color: A.muted }}>
            <span className="flex items-center gap-1.5">
              <Mail size={12} style={{ color: A.green }} /> needhelp@company.com
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} style={{ color: A.green }} /> 80 Broklyn Golden Street USA
            </span>
          </div>
          <div className="flex items-center gap-3">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="hover:text-white transition-colors" style={{ color: A.muted }}>
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40" style={{ background: '#0a0a14cc', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${A.border}` }}>
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-16 lg:h-20">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: A.green }}>
              <Leaf size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AgriHub</span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}
                className="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: A.muted }}
                onMouseEnter={e => { e.currentTarget.style.color = A.green; e.currentTarget.style.background = '#2ecc7110'; }}
                onMouseLeave={e => { e.currentTarget.style.color = A.muted; e.currentTarget.style.background = 'transparent'; }}>
                {link.label}
              </a>
            ))}
            <div className="ml-3 pl-3 flex items-center gap-2" style={{ borderLeft: `1px solid ${A.border}` }}>
              <button type="button" onClick={() => { setAuthMode("login"); openPortal(); }}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: A.muted }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = '#ffffff10'; }}
                onMouseLeave={e => { e.currentTarget.style.color = A.muted; e.currentTarget.style.background = 'transparent'; }}>
                Log in
              </button>
              <button type="button" onClick={() => { setAuthMode("register"); openPortal(); }}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all shadow-lg"
                style={{ background: A.green }}
                onMouseEnter={e => { e.currentTarget.style.background = A.greenDark; }}
                onMouseLeave={e => { e.currentTarget.style.background = A.green; }}>
                Get Started
              </button>
            </div>
          </nav>

          <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-2 lg:hidden" style={{ color: A.muted }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="px-4 pb-6 pt-4 lg:hidden" style={{ background: A.card, borderTop: `1px solid ${A.border}` }}>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium rounded-lg" style={{ color: A.muted }}>
                  {link.label}
                </a>
              ))}
              <hr style={{ borderColor: A.border }} className="my-2" />
              <button type="button" onClick={() => { setMobileOpen(false); setAuthMode("login"); openPortal(); }}
                className="px-3 py-2.5 text-sm font-medium rounded-lg text-left" style={{ color: A.muted }}>
                Log in
              </button>
              <button type="button" onClick={() => { setMobileOpen(false); setAuthMode("register"); openPortal(); }}
                className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg text-left" style={{ background: A.green }}>
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=900&fit=crop&auto=format" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #0a0a14cc 40%, transparent 70%)' }} />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm" style={{ background: '#2ecc7115', border: `1px solid ${A.green}30`, color: A.green }}>
              <Leaf size={14} /> We are Producing Natural Products
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Agriculture.
            </h1>
            <p className="mt-5 text-lg sm:text-xl leading-relaxed max-w-lg" style={{ color: A.muted }}>
              Digitizing Uganda's agricultural markets — from produce arrival to final sale — so everyone relies on real numbers, not guesswork.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => { setAuthMode("register"); openPortal(); }}
                className="inline-flex items-center justify-center h-13 px-8 text-sm font-semibold text-white rounded-xl transition-all shadow-xl"
                style={{ background: A.green }}
                onMouseEnter={e => { e.currentTarget.style.background = A.greenDark; }}
                onMouseLeave={e => { e.currentTarget.style.background = A.green; }}>
                Discover More <ArrowRight size={16} className="ml-2" />
              </button>
              <a href="#services"
                className="inline-flex items-center justify-center h-13 px-8 text-sm font-medium rounded-xl transition-colors"
                style={{ color: A.text, border: `2px solid ${A.border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = A.green; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = A.border; }}>
                Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About ─── */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${A.border}` }}>
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&h=500&fit=crop&auto=format" alt="" className="w-full h-[420px] object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a14cc, transparent)' }} />
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-2xl p-6 shadow-xl hidden sm:block" style={{ background: A.card, border: `1px solid ${A.border}` }}>
              <p className="text-3xl font-bold" style={{ color: A.green }}>20+</p>
              <p style={{ color: A.muted }} className="text-sm">Years of Excellence</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>Get to Know AgriHub</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              AgriHub is the Digital Agriculture Governance Platform
            </h2>
            <div className="mt-4 w-16 h-1 rounded-full" style={{ background: A.green }} />
            <p className="mt-5 text-lg leading-relaxed" style={{ color: A.muted }}>
              We've 20 years of agriculture farming experience. Lorem ipsum dolor sit amet, consectetur
              adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Digital farmer registration with complete traceability",
                "Real-time market prices and commodity tracking",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: A.muted }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${A.green}20` }}>
                    <CheckSquare size={12} style={{ color: A.green }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <a href="#services" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: A.green }}
              onMouseEnter={e => { e.currentTarget.style.background = A.greenDark; }}
              onMouseLeave={e => { e.currentTarget.style.background = A.green; }}>
              About More <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="py-16 sm:py-24" style={{ borderTop: `1px solid ${A.border}`, borderBottom: `1px solid ${A.border}`, background: A.card }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>What We're Doing</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Services We're offering</h2>
            <div className="mx-auto mt-3 w-16 h-1 rounded-full" style={{ background: A.green }} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="group rounded-2xl p-6 transition-all duration-300"
                style={{ background: A.bg, border: `1px solid ${A.border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = A.green; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = A.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ background: `${A.green}15` }}>
                  <Icon size={24} style={{ color: A.green }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: A.muted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Brand Strip ─── */}
      <div className="py-10" style={{ borderBottom: `1px solid ${A.border}` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-40">
            {["Brand 1", "Brand 2", "Brand 3", "Brand 4", "Brand 5"].map((b) => (
              <div key={b} className="text-lg font-bold" style={{ color: A.muted }}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Features / How It Works ─── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>Pure Organic System</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Healthy system for your good governance
            </h2>
            <div className="mt-4 w-16 h-1 rounded-full" style={{ background: A.green }} />
            <p className="mt-5 text-lg leading-relaxed" style={{ color: A.muted }}>
              Lorem ipsum dolor sit amet nsectetur cing elit. Suspe ndisse suscipit sagittis leo
              sit met entum estibu dignissim posuere cubilia durae.
            </p>
            <div className="mt-6 flex gap-4">
              {["Harvesting", "Growth", "Maintenance"].map((tag) => (
                <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${A.green}15`, color: A.green, border: `1px solid ${A.green}30` }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl p-4 transition-all" style={{ background: A.card, border: `1px solid ${A.border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = A.green; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = A.border; }}>
                <Icon size={18} style={{ color: A.green }} />
                <p className="text-sm font-semibold text-white mt-2">{title}</p>
                <p className="text-xs mt-1" style={{ color: A.muted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Strip ─── */}
      <section className="relative overflow-hidden py-20" style={{ borderTop: `1px solid ${A.border}`, borderBottom: `1px solid ${A.border}` }}>
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1600&h=400&fit=crop&auto=format" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: '#0a0a14dd' }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>We're Selling Healthy Products</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Unbeatable Digital and Agriculture Services
          </h2>
          <a href="#contact" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: A.green }}
            onMouseEnter={e => { e.currentTarget.style.background = A.greenDark; }}
            onMouseLeave={e => { e.currentTarget.style.background = A.green; }}>
            Discover More <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>Our Testimonials</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">What They're talking about</h2>
          <div className="mx-auto mt-3 w-16 h-1 rounded-full" style={{ background: A.green }} />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map(({ name, role, quote, initial }) => (
            <div key={name} className="rounded-2xl p-8 transition-all" style={{ background: A.card, border: `1px solid ${A.border}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = A.green; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = A.border; }}>
              <Quote size={24} style={{ color: A.green }} className="mb-4" />
              <p className="text-sm leading-relaxed italic" style={{ color: A.muted }}>"{quote}"</p>
              <div className="mt-6 flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${A.border}` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: A.green }}>
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs" style={{ color: A.muted }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Counters ─── */}
      <section className="py-16" style={{ background: A.card, borderTop: `1px solid ${A.border}`, borderBottom: `1px solid ${A.border}` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Agriculture Products", value: "2,847" },
              { label: "Projects completed", value: "1,234" },
              { label: "Satisfied customers", value: "12,000+" },
              { label: "Expert farmers", value: "850+" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-6 rounded-2xl" style={{ background: A.bg, border: `1px solid ${A.border}` }}>
                <p className="text-3xl sm:text-4xl font-bold" style={{ color: A.green }}>{value}</p>
                <p className="mt-2 text-sm" style={{ color: A.muted }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Markets / Projects ─── */}
      <section id="markets" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>Our Latest Projects</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Recently completed Projects</h2>
          <div className="mx-auto mt-3 w-16 h-1 rounded-full" style={{ background: A.green }} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {markets.map((market, i) => (
            <article key={market.name} onClick={() => viewMarketPrices(market)}
              className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{ background: A.card, border: `1px solid ${A.border}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = A.green; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = A.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div className="relative h-44 overflow-hidden">
                <img src={market.image} alt={market.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a14, transparent)' }} />
                <div className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: A.green }}>
                  {["harvest", "farming", "organic", "solution"][i]}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-white group-hover" style={{}}>{market.name}</h3>
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: A.muted }}>
                  <MapPin size={10} /> {market.location}
                </p>
                <div className="mt-3 flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${A.border}` }}>
                  <div className="flex gap-3 text-xs" style={{ color: A.muted }}>
                    <span>{market.traders}</span>
                    <span>{market.volume}</span>
                  </div>
                  <span className="text-xs font-semibold flex items-center gap-1 transition-all" style={{ color: A.green }}>
                    View <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16 sm:py-24" style={{ background: A.card, borderTop: `1px solid ${A.border}`, borderBottom: `1px solid ${A.border}` }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>FAQ</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
            <div className="mx-auto mt-3 w-16 h-1 rounded-full" style={{ background: A.green }} />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ background: A.bg, border: `1px solid ${A.border}` }}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                  {activeFaq === i ? <ChevronUp size={16} style={{ color: A.green }} /> : <ChevronDown size={16} style={{ color: A.muted }} />}
                </button>
                {activeFaq === i && <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: A.muted }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Blog ─── */}
      <section id="blog" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>From the Blog Post</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Latest News & Articles</h2>
          <div className="mx-auto mt-3 w-16 h-1 rounded-full" style={{ background: A.green }} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {blogPosts.map((post, i) => (
            <article key={i} className="group rounded-2xl overflow-hidden transition-all duration-300" style={{ background: A.card, border: `1px solid ${A.border}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = A.green; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = A.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div className="relative h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: A.green }}>{post.category}</div>
              </div>
              <div className="p-5">
                <p className="text-xs" style={{ color: A.muted }}>{post.date}</p>
                <h3 className="text-base font-bold text-white mt-1 mb-2 group-hover" style={{}}>{post.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: A.muted }}>{post.desc}</p>
                <a href="#" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold transition-all" style={{ color: A.green }}>
                  Continue Reading <ChevronRight size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Contact CTA ─── */}
      <section id="contact" className="py-16 sm:py-20" style={{ background: A.card, borderTop: `1px solid ${A.border}` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: A.green }}>Contact Now</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Get in touch now</h2>
              <div className="mt-4 w-16 h-1 rounded-full" style={{ background: A.green }} />
              <p className="mt-5 leading-relaxed" style={{ color: A.muted }}>
                Lorem ipsum dolor sit amet, adipiscing elit. In hac habitasse platea dictumst.
                Duis porta, quam ut finibus ultrices.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Phone, label: "Have Question?", value: "+92 (8800)-9850" },
                  { icon: Mail, label: "Write Email", value: "needhelp@company.com" },
                  { icon: MapPin, label: "Visit Now", value: "88 Broklyn Golden Street. USA" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${A.green}15` }}>
                      <Icon size={18} style={{ color: A.green }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: A.muted }}>{label}</p>
                      <p className="text-sm font-semibold text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-8" style={{ background: A.bg, border: `1px solid ${A.border}` }}>
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${A.green}15` }}>
                  <Send size={32} style={{ color: A.green }} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Ready to transform your market?</p>
                  <p className="text-sm mt-1" style={{ color: A.muted }}>Join the growing network of markets using digital governance.</p>
                </div>
                <button type="button" onClick={() => { setAuthMode("register"); openPortal(); }}
                  className="w-full px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: A.green }}
                  onMouseEnter={e => { e.currentTarget.style.background = A.greenDark; }}
                  onMouseLeave={e => { e.currentTarget.style.background = A.green; }}>
                  Send a Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: '#06060e', borderTop: `1px solid ${A.border}` }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: A.green }}>
                  <Leaf size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">AgriHub</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: A.muted }}>
                Welcome to our Agriculture & Market platform. Lorem simply text amet cing elit.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: A.card, color: A.muted }}
                    onMouseEnter={e => { e.currentTarget.style.background = A.green; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = A.card; e.currentTarget.style.color = A.muted; }}>
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-4">Explore</h3>
              <ul className="space-y-2.5 text-sm">
                {["About", "Our Farmers", "New Projects", "Services", "Contact"].map((l) => (
                  <li key={l}>
                    <a href="#" className="transition-colors flex items-center gap-1" style={{ color: A.muted }}
                      onMouseEnter={e => { e.currentTarget.style.color = A.green; }}
                      onMouseLeave={e => { e.currentTarget.style.color = A.muted; }}>
                      <ChevronRight size={10} /> {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-4">News</h3>
              <ul className="space-y-3">
                {blogPosts.map((post, i) => (
                  <li key={i} className="flex gap-3">
                    <img src={post.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div>
                      <a href="#" className="text-sm font-medium text-white transition-colors leading-tight block"
                        onMouseEnter={e => { e.currentTarget.style.color = A.green; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'white'; }}>
                        {post.title}
                      </a>
                      <p className="text-xs mt-0.5" style={{ color: A.muted }}>{post.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-3 text-sm" style={{ color: A.muted }}>
                <li className="flex items-center gap-2">
                  <Phone size={12} style={{ color: A.green }} /> +92 (0088) 6823
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={12} style={{ color: A.green }} /> needhelp@company.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={12} style={{ color: A.green }} /> 80 Broklyn Golden Street. USA
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${A.border}` }}>
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: A.muted }}>&copy; {new Date().getFullYear()} AgriHub. All Rights Reserved.</p>
            <div className="flex items-center gap-4 text-xs" style={{ color: A.muted }}>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Auth Portal ─── */}
      {showPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 backdrop-blur-sm" style={{ background: '#00000080' }}>
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl" style={{ background: A.card, border: `1px solid ${A.border}` }}>
            <button type="button" onClick={closePortal} className="absolute right-3 top-3 z-10 rounded-lg p-1.5 transition-colors"
              style={{ background: A.bg, color: A.muted }}>
              <X size={16} />
            </button>
            <div className="grid md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative hidden min-h-[520px] p-10 md:flex md:flex-col md:justify-between"
                style={{ background: 'linear-gradient(135deg, #0a0a14, #12121f)', borderRight: `1px solid ${A.border}` }}>
                <div className="relative flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: A.green }}>
                    <Leaf size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">AgriHub</p>
                    <p className="text-sm" style={{ color: A.muted }}>Agricultural Market Platform</p>
                  </div>
                </div>
                <div className="relative mx-auto max-w-sm text-center">
                  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&h=520&fit=crop&auto=format" alt="" className="h-52 w-full rounded-xl object-cover shadow-lg" />
                </div>
                <div className="relative">
                  <p className="text-sm leading-6" style={{ color: A.muted }}>Digital agricultural governance for market officers, farmers, and government teams.</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 md:p-10">
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => { setAuthMode("login"); setLoginError(""); }}
                      className={`text-sm font-medium transition-colors pb-1 ${authMode === "login" ? "border-b-2" : ""}`}
                      style={authMode === "login" ? { color: A.green, borderColor: A.green } : { color: A.muted }}>
                      Sign in
                    </button>
                    <button onClick={() => { setAuthMode("register"); setLoginError(""); }}
                      className={`text-sm font-medium transition-colors pb-1 ${authMode === "register" ? "border-b-2" : ""}`}
                      style={authMode === "register" ? { color: A.green, borderColor: A.green } : { color: A.muted }}>
                      Create account
                    </button>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {authMode === "login" ? "Welcome back" : "Join AgriHub"}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: A.muted }}>
                    {authMode === "login" ? "Authorized access only for market administrators and officers." : "Register as a farmer to track your produce and access market prices."}
                  </p>
                </div>

                <form onSubmit={authMode === "login" ? handleSubmit : handleRegister} className="space-y-4">
                  {authMode === "register" && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white">Full Name</label>
                      <input type="text" placeholder="Your full name" value={regName} onChange={(e) => setRegName(e.target.value)}
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
                        style={{ background: A.bg, border: `1px solid ${A.border}` }}
                        onFocus={e => { e.currentTarget.style.borderColor = A.green; }}
                        onBlur={e => { e.currentTarget.style.borderColor = A.border; }} required />
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white">Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: A.muted }} />
                      <input type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-white outline-none transition"
                        style={{ background: A.bg, border: `1px solid ${A.border}` }}
                        onFocus={e => { e.currentTarget.style.borderColor = A.green; }}
                        onBlur={e => { e.currentTarget.style.borderColor = A.border; }} required />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: A.muted }} />
                      <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-white outline-none transition"
                        style={{ background: A.bg, border: `1px solid ${A.border}` }}
                        onFocus={e => { e.currentTarget.style.borderColor = A.green; }}
                        onBlur={e => { e.currentTarget.style.borderColor = A.border; }} required minLength={6} />
                    </div>
                  </div>
                  {authMode === "register" && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white">Phone Number</label>
                      <input type="tel" placeholder="+256 700 000 000" value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
                        style={{ background: A.bg, border: `1px solid ${A.border}` }}
                        onFocus={e => { e.currentTarget.style.borderColor = A.green; }}
                        onBlur={e => { e.currentTarget.style.borderColor = A.border; }} required />
                    </div>
                  )}
                  {loginError && (
                    <div className="rounded-xl p-3" style={{ background: '#e74c3c15', border: '1px solid #e74c3c30' }}>
                      <p className="text-xs font-medium" style={{ color: '#e74c3c' }}>{loginError}</p>
                    </div>
                  )}
                  {authMode === "login" && (
                    <div className="flex items-center justify-between text-sm" style={{ color: A.muted }}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked style={{ accentColor: A.green }} /> Remember me
                      </label>
                      <button type="button" className="font-medium transition-colors" style={{ color: A.green }}>Forgot password?</button>
                    </div>
                  )}
                  <button type="submit" disabled={loggingIn}
                    className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: A.green }}
                    onMouseEnter={e => { if (!loggingIn) e.currentTarget.style.background = A.greenDark; }}
                    onMouseLeave={e => { if (!loggingIn) e.currentTarget.style.background = A.green; }}>
                    {loggingIn ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}
                  </button>
                </form>
                <div className="mt-4 rounded-xl p-3" style={{ background: A.bg, border: `1px solid ${A.border}` }}>
                  <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: A.muted }}>
                    <Lock size={12} style={{ color: A.green }} /> Secure portal — authorized access only
                  </p>
                </div>
                <details className="group mt-4 rounded-xl p-4" style={{ background: A.bg, border: `1px solid ${A.border}` }}>
                  <summary className="cursor-pointer select-none text-xs font-medium transition-colors" style={{ color: A.muted }}>
                    Test Accounts
                  </summary>
                  <div className="mt-3 space-y-2 text-xs" style={{ color: A.muted }}>
                    <p className="flex justify-between gap-4"><span>Administrator</span><span className="font-mono">admin@agrihub.com / admin123</span></p>
                    <p className="flex justify-between gap-4"><span>Market Officer</span><span className="font-mono">officer@agrihub.com / officer123</span></p>
                    <p className="flex justify-between gap-4"><span>Government Officer</span><span className="font-mono">gov@agrihub.com / gov123</span></p>
                    <p className="flex justify-between gap-4"><span>Farmer</span><span className="font-mono">farmer@agrihub.com / farmer123</span></p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Market Prices Dialog ─── */}
      <Dialog open={!!selectedMarket} onOpenChange={(o) => !o && closeMarketPrices()}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-[1600px]" style={{ background: A.card, border: `1px solid ${A.border}`, color: 'white' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Current Prices — {selectedMarket?.name}</DialogTitle>
            <DialogDescription className="text-base" style={{ color: A.muted }}>
              Latest commodity prices at {selectedMarket?.location} — {selectedMarket?.traders} traders, {selectedMarket?.volume}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto space-y-6">
            {loadingPrices ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `3px solid ${A.border}`, borderTopColor: A.green }} />
              </div>
            ) : marketPrices.length === 0 ? (
              <div className="text-center py-16" style={{ color: A.muted }}>
                <Tag size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No price data available for this market yet.</p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
