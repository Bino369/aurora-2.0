/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Home, 
  Briefcase, 
  Info, 
  Mail, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  ChevronRight, 
  X,
  Globe,
  Phone,
  Layout,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  Download,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface BusinessData {
  businessName: string;
  businessType: string;
  services: string[];
  targetAudience: string;
  email: string;
  phone: string;
}

interface ClientRequest {
  id: string;
  clientName: string;
  businessName: string;
  businessType: string;
  services: string;
  targetAudience: string;
  email: string;
  phone: string;
  notes: string;
  generatedWebsite: string;
  status: 'Pending' | 'Generated' | 'Sent';
  date: number;
}

interface AIGeneratedContent {
  hero: {
    headline: string;
    tagline: string;
  };
  about: string;
  services: {
    title: string;
    description: string;
  }[];
  contact: string;
  ctaText: string;
}

// --- Components ---

const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;

        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900"
    />
  );
};

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl ${className}`}>
    {children}
  </div>
);

const Navbar: React.FC<{ activeSection: string; setActiveSection: (s: string) => void }> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'generator', label: 'Generator', icon: Globe },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <GlassCard className="px-4 py-2 flex items-center gap-2 md:gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
              activeSection === item.id 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <item.icon size={18} />
            <span className="hidden md:block text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </GlassCard>
    </nav>
  );
};

// --- Main App ---

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminTab, setAdminTab] = useState<'services' | 'requests'>('services');
  const [previewData, setPreviewData] = useState<BusinessData | null>(null);
  const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedServices = localStorage.getItem('aurora_services');
    if (savedServices) setServices(JSON.parse(savedServices));
    else {
      const defaultServices = [
        { id: '1', title: 'Web Design', description: 'Modern, responsive designs that convert.', icon: 'Layout' },
        { id: '2', title: 'SEO Optimization', description: 'Rank higher on search engines.', icon: 'Globe' },
        { id: '3', title: 'App Development', description: 'Custom mobile and web applications.', icon: 'Settings' },
      ];
      setServices(defaultServices);
      localStorage.setItem('aurora_services', JSON.stringify(defaultServices));
    }

    const savedRequests = localStorage.getItem('aurora_requests');
    if (savedRequests) setRequests(JSON.parse(savedRequests));
  }, []);

  const saveServices = (newServices: Service[]) => {
    setServices(newServices);
    localStorage.setItem('aurora_services', JSON.stringify(newServices));
  };

  const saveRequests = (newRequests: ClientRequest[]) => {
    setRequests(newRequests);
    localStorage.setItem('aurora_requests', JSON.stringify(newRequests));
  };

  const generateAIContent = async (data: BusinessData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate content');
      }
      const content = await response.json();
      setAiContent(content);
    } catch (error: any) {
      console.error("AI Generation failed:", error);
      alert(error.message || 'Failed to generate preview. Please try again.');
      // Fallback content if AI fails
      setAiContent({
        hero: { headline: `Welcome to ${data.businessName}`, tagline: `Premier ${data.businessType} services.` },
        about: `We are a leading ${data.businessType} dedicated to serving ${data.targetAudience}.`,
        services: data.services.map(s => ({ title: s, description: `High-quality ${s.toLowerCase()} solutions.` })),
        contact: `Get in touch with us today!`,
        ctaText: `Get Started`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newRequest: ClientRequest = {
      id: `REQ${Math.floor(10000 + Math.random() * 90000)}`,
      clientName: formData.get('clientName') as string,
      businessName: formData.get('businessName') as string,
      businessType: formData.get('businessType') as string,
      services: formData.get('services') as string,
      targetAudience: formData.get('targetAudience') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      notes: formData.get('notes') as string,
      generatedWebsite: '',
      status: 'Pending',
      date: Date.now(),
    };

    const updatedRequests = [newRequest, ...requests];
    saveRequests(updatedRequests);
    
    // Also show quick preview for immediate feedback
    const data: BusinessData = {
      businessName: newRequest.businessName,
      businessType: newRequest.businessType,
      services: newRequest.services.split(',').map(s => s.trim()),
      targetAudience: newRequest.targetAudience,
      email: newRequest.email,
      phone: newRequest.phone,
    };
    setPreviewData(data);
    alert(`Request ${newRequest.id} submitted successfully! Our team will review it.`);
    await generateAIContent(data);
    setShowPreview(true);
    e.currentTarget.reset();
  };

  const generateFullHTML = async (request: ClientRequest) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate HTML');
      }
      const { html } = await response.json();

      const updatedRequests = requests.map(r => 
        r.id === request.id ? { ...r, generatedWebsite: html, status: 'Generated' as const } : r
      );
      saveRequests(updatedRequests);
      alert('Website generated successfully!');
    } catch (error: any) {
      console.error("AI Full Generation failed:", error);
      alert(error.message || 'Failed to generate website. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHTML = (request: ClientRequest) => {
    const blob = new Blob([request.generatedWebsite], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${request.businessName.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const updatedRequests = requests.map(r => 
      r.id === request.id ? { ...r, status: 'Sent' as const } : r
    );
    saveRequests(updatedRequests);
    alert('Website downloaded and marked as Sent!');
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-purple-500/30">
      <CanvasBackground />
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeSection === 'home' && (
            <motion.section
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center gap-8"
            >
              <div className="space-y-4 max-w-3xl">
                <motion.h1 
                  className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Build Your Digital <br /> Future with Aurora
                </motion.h1>
                <p className="text-lg md:text-xl text-white/70 leading-relaxed">
                  Experience the next generation of web building. Modern, fast, and beautifully crafted for your business success.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setActiveSection('services')}
                  className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-white/10 flex items-center gap-2"
                >
                  Explore Services <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => setActiveSection('generator')}
                  className="px-8 py-4 backdrop-blur-md bg-white/10 border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  Try Website Generator
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
                {[
                  { title: 'Fast Performance', desc: 'Optimized for speed and efficiency.' },
                  { title: 'Modern Design', desc: 'Beautiful glassmorphism aesthetics.' },
                  { title: 'Easy Management', desc: 'Simple admin panel for your needs.' }
                ].map((feature, i) => (
                  <GlassCard key={i} className="p-6 text-left hover:bg-white/20 transition-colors cursor-default">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/60">{feature.desc}</p>
                  </GlassCard>
                ))}
              </div>
            </motion.section>
          )}

          {activeSection === 'services' && (
            <motion.section
              key="services"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold">Our Services</h2>
                <p className="text-white/60 max-w-2xl mx-auto">We provide a wide range of digital solutions to help your business grow and thrive in the modern web landscape.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <GlassCard key={service.id} className="p-8 group hover:bg-white/20 transition-all duration-500">
                    <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {service.icon === 'Layout' && <Layout className="text-purple-300" />}
                      {service.icon === 'Globe' && <Globe className="text-purple-300" />}
                      {service.icon === 'Settings' && <Settings className="text-purple-300" />}
                      {!['Layout', 'Globe', 'Settings'].includes(service.icon) && <Briefcase className="text-purple-300" />}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                    <p className="text-white/70 leading-relaxed">{service.description}</p>
                  </GlassCard>
                ))}
              </div>
            </motion.section>
          )}

          {activeSection === 'about' && (
            <motion.section
              key="about"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">About Aurora</h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  Aurora Web Builder was founded with a simple mission: to make high-end web design accessible and manageable for everyone. We believe that a digital presence should be as beautiful as it is functional.
                </p>
                <div className="space-y-4">
                  {[
                    'Expert Team of Designers',
                    'Cutting-edge Technology Stack',
                    'Customer-Centric Approach',
                    'Continuous Innovation'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-400" size={20} />
                      <span className="text-white/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <GlassCard className="aspect-video overflow-hidden relative">
                <img 
                  src="https://picsum.photos/seed/aurora/800/600" 
                  alt="Team working" 
                  className="w-full h-full object-cover opacity-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8 backdrop-blur-sm bg-black/20 rounded-2xl border border-white/10">
                    <p className="text-3xl font-bold">10+ Years</p>
                    <p className="text-white/60">of Excellence</p>
                  </div>
                </div>
              </GlassCard>
            </motion.section>
          )}

          {activeSection === 'contact' && (
            <motion.section
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <GlassCard className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                      <p className="text-white/60">Have a project in mind? Let's talk about how we can help you build something amazing.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          <Mail size={20} />
                        </div>
                        <span>hello@aurora.build</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          <Phone size={20} />
                        </div>
                        <span>+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <textarea 
                      placeholder="Your Message" 
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    ></textarea>
                    <button className="w-full py-4 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl transition-colors">
                      Send Message
                    </button>
                  </form>
                </div>
              </GlassCard>
            </motion.section>
          )}

          {activeSection === 'admin' && (
            <motion.section
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto"
            >
              {!isAdminLoggedIn ? (
                <div className="flex justify-center items-center min-h-[50vh]">
                  <GlassCard className="p-8 w-full max-w-md space-y-6">
                    <div className="text-center">
                      <Settings className="mx-auto mb-4 text-purple-400" size={48} />
                      <h2 className="text-2xl font-bold">Admin Login</h2>
                      <p className="text-white/60">Enter credentials to manage Aurora</p>
                    </div>
                    <form 
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const user = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value;
                        const pass = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                        if (user === 'admin' && pass === 'password') {
                          setIsAdminLoggedIn(true);
                        } else {
                          alert('Invalid credentials (Try admin/password)');
                        }
                      }}
                    >
                      <input 
                        name="username"
                        type="text" 
                        placeholder="Username" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <input 
                        name="password"
                        type="password" 
                        placeholder="Password" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <button className="w-full py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-white/90 transition-colors">
                        Login
                      </button>
                    </form>
                  </GlassCard>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setAdminTab('services')}
                        className={`px-6 py-2 rounded-xl transition-all ${adminTab === 'services' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                      >
                        Manage Services
                      </button>
                      <button 
                        onClick={() => setAdminTab('requests')}
                        className={`px-6 py-2 rounded-xl transition-all flex items-center gap-2 ${adminTab === 'requests' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                      >
                        Client Requests
                        {requests.filter(r => r.status === 'Pending').length > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                            {requests.filter(r => r.status === 'Pending').length}
                          </span>
                        )}
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsAdminLoggedIn(false)}
                      className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Logout
                    </button>
                  </div>

                  {adminTab === 'services' ? (
                    <div className="grid grid-cols-1 gap-4">
                      {services.map((service) => (
                        <GlassCard key={service.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                              <Layout size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold">{service.title}</h3>
                              <p className="text-sm text-white/60">{service.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const title = prompt('New Title:', service.title);
                                const desc = prompt('New Description:', service.description);
                                if (title && desc) {
                                  saveServices(services.map(s => s.id === service.id ? { ...s, title, description: desc } : s));
                                }
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Delete this service?')) {
                                  saveServices(services.filter(s => s.id !== service.id));
                                }
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                      <button 
                        onClick={() => {
                          const title = prompt('Service Title:');
                          const desc = prompt('Service Description:');
                          if (title && desc) {
                            const newService = {
                              id: Date.now().toString(),
                              title,
                              description: desc,
                              icon: 'Briefcase'
                            };
                            saveServices([...services, newService]);
                          }
                        }}
                        className="p-6 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-2 text-white/60 hover:text-white hover:border-white/40 transition-all"
                      >
                        <Plus size={20} /> Add New Service
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                          <thead>
                            <tr className="text-white/40 text-sm uppercase tracking-wider">
                              <th className="px-6 py-2">ID</th>
                              <th className="px-6 py-2">Client</th>
                              <th className="px-6 py-2">Business</th>
                              <th className="px-6 py-2">Date</th>
                              <th className="px-6 py-2">Status</th>
                              <th className="px-6 py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {requests.map((req) => (
                              <tr key={req.id} className="group">
                                <td className="px-6 py-4 bg-white/5 first:rounded-l-2xl border-y border-white/5 group-hover:bg-white/10 transition-colors">
                                  <span className="font-mono text-xs text-purple-400">{req.id}</span>
                                </td>
                                <td className="px-6 py-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 transition-colors">
                                  {req.clientName}
                                </td>
                                <td className="px-6 py-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 transition-colors">
                                  {req.businessName}
                                </td>
                                <td className="px-6 py-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 transition-colors text-white/60 text-sm">
                                  {new Date(req.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 transition-colors">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    req.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    req.status === 'Generated' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-emerald-500/20 text-emerald-400'
                                  }`}>
                                    {req.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 bg-white/5 last:rounded-r-2xl border-y border-white/5 group-hover:bg-white/10 transition-colors text-right">
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => { setSelectedRequest(req); setShowRequestDetails(true); }}
                                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                      title="View Details"
                                    >
                                      <Info size={18} />
                                    </button>
                                    <button 
                                      disabled={isGenerating}
                                      onClick={() => generateFullHTML(req)}
                                      className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${req.status === 'Pending' ? 'text-purple-400' : 'text-white/20'}`}
                                      title="Generate Website"
                                    >
                                      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                    </button>
                                    {req.status === 'Generated' && (
                                      <button 
                                        onClick={() => downloadHTML(req)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-emerald-400"
                                        title="Download & Send"
                                      >
                                        <ArrowRight size={18} />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => {
                                        if (confirm('Delete this request?')) {
                                          saveRequests(requests.filter(r => r.id !== req.id));
                                        }
                                      }}
                                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                                      title="Delete"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {requests.length === 0 && (
                        <div className="text-center py-20 text-white/40">
                          <Mail size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No client requests yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          )}

          {activeSection === 'generator' && (
            <motion.section
              key="generator"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <GlassCard className="p-8 space-y-8">
                <div className="text-center space-y-2">
                  <Globe className="mx-auto text-purple-400" size={48} />
                  <h2 className="text-3xl font-bold">Website Generator</h2>
                  <p className="text-white/60">Fill in your details to generate a professional preview.</p>
                </div>

                <form className="space-y-6" onSubmit={handleGeneratorSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Client Name</label>
                      <input 
                        name="clientName"
                        required
                        type="text" 
                        placeholder="Your Name" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Business Name</label>
                      <input 
                        name="businessName"
                        required
                        type="text" 
                        placeholder="e.g. Aurora Tech" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Business Type</label>
                      <input 
                        name="businessType"
                        required
                        type="text" 
                        placeholder="e.g. Digital Agency" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Target Audience</label>
                      <input 
                        name="targetAudience"
                        required
                        type="text" 
                        placeholder="e.g. Small business owners" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Services (comma separated)</label>
                    <input 
                      name="services"
                      required
                      type="text" 
                      placeholder="e.g. Web Design, SEO, Marketing" 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Contact Email</label>
                      <input 
                        name="email"
                        required
                        type="email" 
                        placeholder="contact@business.com" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Phone Number</label>
                      <input 
                        name="phone"
                        required
                        type="tel" 
                        placeholder="+1 (555) 000-0000" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Additional Notes</label>
                    <textarea 
                      name="notes"
                      rows={3}
                      placeholder="Any specific requirements or preferences..." 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    ></textarea>
                  </div>
                  <button 
                    disabled={isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        AI is crafting your site...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate AI Website Preview
                      </>
                    )}
                  </button>
                </form>
              </GlassCard>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 w-full max-w-6xl h-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-white/10"
            >
              <div className="p-4 bg-zinc-800 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm text-white/40 font-mono">preview://{previewData.businessName.toLowerCase().replace(/\s+/g, '-')}.aurora</span>
                </div>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-white text-zinc-900">
                {/* Generated Website Content */}
                <header className="px-8 py-6 flex justify-between items-center border-b">
                  <h1 className="text-2xl font-bold text-indigo-600">{previewData.businessName}</h1>
                  <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <span className="cursor-pointer hover:text-indigo-600">Home</span>
                    <span className="cursor-pointer hover:text-indigo-600">Services</span>
                    <span className="cursor-pointer hover:text-indigo-600">Contact</span>
                  </nav>
                </header>

                <section className="px-8 py-20 bg-indigo-50 text-center space-y-6">
                  <h2 className="text-5xl font-extrabold tracking-tight">
                    {aiContent?.hero.headline || `Welcome to ${previewData.businessName}`}
                  </h2>
                  <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
                    {aiContent?.hero.tagline || `Providing top-tier ${previewData.businessType} services tailored to your specific needs.`}
                  </p>
                  <button className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-200">
                    {aiContent?.ctaText || 'Get Started'}
                  </button>
                </section>

                <section className="px-8 py-20 space-y-12">
                  <h3 className="text-3xl font-bold text-center">About Us</h3>
                  <p className="text-center text-zinc-600 max-w-3xl mx-auto leading-relaxed">
                    {aiContent?.about || `We are a professional ${previewData.businessType} dedicated to providing the best solutions for our clients.`}
                  </p>
                </section>

                <section className="px-8 py-20 space-y-12 bg-zinc-50">
                  <h3 className="text-3xl font-bold text-center">Our Expert Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(aiContent?.services || previewData.services.map(s => ({ title: s, description: `Professional ${s.toLowerCase()} solutions.` }))).map((service, i) => (
                      <div key={i} className="p-8 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                          <CheckCircle2 className="text-indigo-600" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">{service.title}</h4>
                        <p className="text-zinc-500">{service.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="px-8 py-20 text-center space-y-6">
                  <h3 className="text-3xl font-bold">Ready to Elevate Your Business?</h3>
                  <p className="text-zinc-600 max-w-xl mx-auto">
                    {aiContent?.contact || 'Contact us today to discuss your project and how we can help you achieve your goals.'}
                  </p>
                  <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
                    <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
                      <Mail size={20} /> {previewData.email}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
                      <Phone size={20} /> {previewData.phone}
                    </div>
                  </div>
                </section>

                <footer className="px-8 py-12 bg-zinc-900 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold">{previewData.businessName}</h4>
                      <p className="text-zinc-400">Your trusted partner in {previewData.businessType}.</p>
                    </div>
                    <div className="space-y-4 text-right">
                      <h4 className="text-xl font-bold">Aurora Web Builder</h4>
                      <p className="text-zinc-400">Crafting digital excellence.</p>
                    </div>
                  </div>
                  <div className="mt-12 pt-8 border-t border-white/10 text-center text-zinc-500 text-sm">
                    © {new Date().getFullYear()} {previewData.businessName}. Built with Aurora AI.
                  </div>
                </footer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Details Modal */}
      <AnimatePresence>
        {showRequestDetails && selectedRequest && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Info className="text-purple-400" />
                  Request Details: {selectedRequest.id}
                </h3>
                <button onClick={() => setShowRequestDetails(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">Client Name</p>
                    <p className="text-lg">{selectedRequest.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">Business Name</p>
                    <p className="text-lg">{selectedRequest.businessName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">Business Type</p>
                    <p>{selectedRequest.businessType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">Date</p>
                    <p>{new Date(selectedRequest.date).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold mb-1">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.services.split(',').map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-sm">{s.trim()}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold mb-1">Target Audience</p>
                  <p className="text-white/80">{selectedRequest.targetAudience}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">Email</p>
                    <p className="text-purple-400">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">Phone</p>
                    <p className="text-purple-400">{selectedRequest.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold mb-1">Additional Notes</p>
                  <p className="text-white/60 italic">{selectedRequest.notes || 'No additional notes provided.'}</p>
                </div>
                {selectedRequest.status !== 'Pending' && (
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-white/40 uppercase font-bold">Generated Website Source</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRequest.generatedWebsite);
                          alert('Code copied to clipboard!');
                        }}
                        className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Copy size={14} /> Copy Code
                      </button>
                    </div>
                    <div className="bg-black/60 p-6 rounded-2xl font-mono text-xs text-emerald-400/80 border border-white/5 shadow-inner overflow-hidden">
                      <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        <pre className="whitespace-pre-wrap break-all">
                          {selectedRequest.generatedWebsite}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 bg-white/5 flex justify-end gap-3">
                <button 
                  onClick={() => setShowRequestDetails(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  Close
                </button>
                {selectedRequest.status === 'Pending' && (
                  <button 
                    onClick={() => { generateFullHTML(selectedRequest); setShowRequestDetails(false); }}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={18} /> Generate Website
                  </button>
                )}
                {selectedRequest.status !== 'Pending' && (
                  <button 
                    onClick={() => downloadHTML(selectedRequest)}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Download size={18} /> Download HTML
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 py-12 border-t border-white/10 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} Aurora Web Builder. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-white cursor-pointer transition-colors">Cookie Settings</span>
        </div>
      </footer>
    </div>
  );
}
