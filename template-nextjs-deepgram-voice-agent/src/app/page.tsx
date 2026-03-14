"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  PhoneOff,
  Moon,
  CheckCircle2,
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  Mail,
  Hash,
  Calendar,
  ChevronLeft,
  ArrowUp,
  Github,
  Star,
  Sparkles,
  GithubIcon,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";
import {useUser} from "@clerk/nextjs";
export default function KolletLanding() {
  const [visible, setVisible] = useState(false);
  const {user} = useUser();

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] antialiased selection:bg-[#0071E3]/20">
      {/* ---------------- NAV ---------------- */}
      <nav className="fixed top-0 w-full z-50 bg-[#FBFBFD]/80 backdrop-blur-xl border-b border-[#D2D2D7]/30">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 bg-[#1D1D1F] rounded-[6px] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="font-semibold text-[17px] tracking-tight">
              Kollect
            </span>
           
          </div>

          <div className="flex items-center gap-4">
          
            <Link href={user ? "/home" : "/sign-in"} className="text-sm font-medium hover:opacity-70">
              Sign in
            </Link>
            <Link
              href="/home"
              className="bg-[#0071E3] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#0077ED] transition active:scale-95"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------------- HERO ---------------- */}
      <section className="pt-32 pb-24 px-6 text-center bg-gradient-to-b from-white via-[#F5F7FF] to-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Link href={'https://github.com/get-convex/templates/tree/main/template-nextjs-deepgram-voice-agent'} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D2D2D7]/40 rounded-full shadow-sm">
              <GithubIcon size={14} className="text-black" />
              <span className="text-[13px] font-medium text-black">
                Open source 
              </span>
            </Link>
          </div>

          <h1
            className={`text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-[-0.02em] leading-[1.05] transition-all duration-1000 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Turn boring surveys <br />
           <span className="text-[#595959]">into conversations.</span>
          </h1>

          <p
            className={`mt-6 text-lg sm:text-xl text-[#86868B] max-w-2xl mx-auto transition-all duration-1000 delay-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            Generate forms with AI, collect responses through voice.<br/>
            Open source, self-hostable, and privacy-first.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/c/hutT3Gsafh2n61T0c2E2U"
                className="bg-[#1D1D1F] text-white px-8 py-3 rounded-full text-[16px] font-medium hover:bg-[#323236] transition active:scale-95 flex items-center gap-2 justify-center"
              >
               Try live survey <PhoneCall size={18} />
              </Link>
              <Link
                href="/home"
                className="bg-white text-[#1D1D1F] px-8 py-3 rounded-full text-[16px] font-medium border border-[#D2D2D7] hover:bg-[#F5F5F7] transition active:scale-95 flex items-center gap-2 justify-center"
              >
            
              Create your first AI survey
                  <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-sm text-[#86868B]">
               Self-host or try limited cloud demo
            </p>
          </div>
        </div>
      </section>



      {/* ---------------- CHAT DEMO ---------------- */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[34px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-[#D2D2D7]/50 p-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#86868B]">
              Live Experience
            </p>

            <h3 className="mt-6 text-2xl font-medium leading-snug">
               Ready to begin this short survey ?
            </h3>

            <div className="mt-16 flex flex-col items-center gap-6">
              <p className="text-xs uppercase tracking-widest text-[#86868B]">
                Listening
              </p>

              <div className="flex items-center gap-6">
                <button className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center">
                  <Moon size={18} />
                </button>

                <Link href="/c/hutT3Gsafh2n61T0c2E2U" className="relative">
                  <div className="absolute inset-0 bg-[#1cce1f] rounded-full animate-ping opacity-10"></div>
                  <button className="relative w-16 h-16 bg-[#1cce1f] rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition active:scale-95">
                    <PhoneCall size={24} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- WHY IT CONVERTS ---------------- */}
      <section className="py-24 bg-[#F5F5F7] px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Forms feel like work.
            <br />
            Conversations feel natural.
          </h2>

          <div className="mt-16 grid sm:grid-cols-3 gap-10 text-left">
            {[
              {
                title: "Higher completion rates",
                desc: "Up to 3x better than traditional forms",
              },
              {
                title: "Voice interaction",
                desc: "Respond by speaking instead of typing",
              },
              {
                title: "Adaptive AI follow-ups",
                desc: "Smart questions based on responses",
              },
            ].map((item) => (
              <div key={item.title}>
                <CheckCircle2 className="text-[#0071E3] mb-4" />
                <p className="text-lg font-medium mb-2">{item.title}</p>
                <p className="text-sm text-[#86868B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Open Source Benefits --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#34C759]/10 rounded-full border border-[#34C759]/20 mb-6">
            <Github size={16} className="text-[#34C759]" />
            <span className="text-[13px] font-bold text-[#34C759]">
              Free Open Source
            </span>
          </div>

          <h2 className="text-3xl sm:text-[40px] font-bold tracking-tight mb-4">
            Own your data. Own your infrastructure.
          </h2>
          <p className="text-[17px] text-[#86868B] max-w-2xl mx-auto mb-12">
            Self-host on your own servers or use our managed cloud. No vendor
            lock-in, full transparency, and complete control.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Self-hostable",
                desc: "Deploy anywhere—your server, AWS, GCP, or Azure",
              },
              {
                title: "Privacy-first",
                desc: "Your data never leaves your infrastructure",
              },
              {
                title: "Fully customizable",
                desc: "Modify the code to fit your exact needs",
              },
              {
                title: "Type Safe",
                desc: "Built with TypeScript for reliability",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-[#FBFBFD] rounded-2xl border border-[#D2D2D7]/40 text-left"
              >
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[#86868B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Product Preview --- */}
      <section id="product" className="py-24 lg:py-32 bg-[#F5F5F7] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1D1D1F] text-white text-[12px] font-semibold mb-4">
              The Builder
            </span>
            <h2 className="text-3xl sm:text-[40px] font-bold tracking-tight mb-4">
              Drag, drop, done.
            </h2>
            <p className="text-[17px] text-[#86868B] mb-8">
              Build manually or let AI do the heavy lifting.
            </p>
          </div>

          {/* AI Generation Input */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#D2D2D7]/40 p-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Create or update questions with AI..."
                  className="flex-1 px-6 py-4 text-[15px] text-[#1D1D1F] placeholder:text-[#86868B] bg-transparent outline-none"
                />
                <button className="w-12 h-12 bg-[#86868B] hover:bg-[#1D1D1F] rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0">
                  <ArrowUp size={20} className="text-white" />
                </button>
              </div>
            </div>
          
          </div>

          <div className="bg-white rounded-[32px] border border-[#D2D2D7]/40 shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex flex-col lg:flex-row h-auto lg:h-[700px]">
              {/* Sidebar */}
              <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#F2F2F7] p-4 lg:p-6 bg-[#FBFBFD]">
                <p className="hidden lg:block text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-4">
                  Blocks
                </p>
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                  {[
                    { label: "Short answer", icon: <Type size={16} /> },
                    { label: "Long answer", icon: <AlignLeft size={16} /> },
                    { label: "Multiple choice", icon: <CheckSquare size={16} /> },
                    { label: "Single choice", icon: <Circle size={16} /> },
                    { label: "Email", icon: <Mail size={16} /> },
                    { label: "Number", icon: <Hash size={16} /> },
                    { label: "Date", icon: <Calendar size={16} /> },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex-shrink-0 flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#424245] hover:bg-[#E8E8ED] hover:text-[#1D1D1F] rounded-xl transition-all text-left group"
                    >
                      <span className="text-[#86868B] group-hover:text-[#0071E3] transition-colors">
                        {item.icon}
                      </span>
                      <span className="lg:inline whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 flex flex-col min-w-0 bg-white">
                <div className="h-14 border-b border-[#F2F2F7] px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors text-[#86868B]">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-[13px] font-medium text-[#86868B]">
                      Editing:{" "}
                      <span className="text-[#1D1D1F]">
                        Customer Feedback Q2
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] rounded-full text-[12px] font-semibold hover:bg-[#E8E8ED] transition-colors">
                      <Sparkles size={14} />
                      Generate with AI
                    </button>
                    <button className="bg-[#0071E3] text-white px-4 py-2 rounded-full text-[12px] font-semibold hover:bg-[#0077ED] transition-colors">
                      Publish
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center mb-10">
                      <h3 className="text-[28px] font-bold tracking-tight mb-2">
                        Customer Feedback Q2
                      </h3>
                      <p className="text-[14px] text-[#86868B]">
                        Help us improve your experience
                      </p>
                    </div>

                    <div className="p-6 lg:p-8 rounded-[20px] border-2 border-[#0071E3] bg-[#0071E3]/5 relative group cursor-pointer">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0071E3] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        1
                      </div>
                      <div className="flex items-center gap-2 mb-3 text-[#0071E3]">
                        <Type size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Short answer
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold mb-1">
                      {`  What's your name?`}
                      </h4>
                      <p className="text-[14px] text-[#86868B]">
                      {`  We'd love to know who we're talking to`}
                      </p>
                    </div>

                    <div className="p-6 lg:p-8 rounded-[20px] border border-[#D2D2D7]/40 bg-[#FBFBFD] hover:border-[#0071E3]/50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-2 mb-3 text-[#D2D2D7] group-hover:text-[#0071E3] transition-colors">
                        <CheckSquare size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Multiple choice
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold mb-3">
                        {`  How satisfied are you?`}
                      </h4>
                      <div className="space-y-2">
                        {[
                          "Very satisfied",
                          "Satisfied",
                          "Neutral",
                          "Dissatisfied",
                        ].map((opt) => (
                          <div
                            key={opt}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E8E8ED]"
                          >
                            <div className="w-4 h-4 rounded border-2 border-[#D2D2D7]" />
                            <span className="text-[14px]">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl sm:text-[48px] font-bold tracking-tight mb-6">
            Ready to transform your surveys?
          </h2>
          <p className="text-[17px] sm:text-[19px] text-[#86868B] mb-8 max-w-xl mx-auto">
            Change the way you collect feedback.<br/>
             Try self-hosted Kollect today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/home"
              className="bg-[#0071E3] text-white px-8 py-4 rounded-full font-semibold text-[16px] hover:bg-[#0077ED] transition-all active:scale-95 shadow-xl shadow-[#0071E3]/25"
            >
              Get started free
            </Link>
            <Link
              href="template-nextjs-deepgram-voice-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#1D1D1F] px-8 py-4 rounded-full font-semibold text-[16px] border border-[#D2D2D7] hover:bg-[#F5F5F7] transition-all flex items-center justify-center gap-2"
            >
              <Github size={18} />
              Star on GitHub
            </Link>
          </div>
          <p className="mt-6 text-[13px] text-[#86868B]">
            Self-host or use our cloud • No credit card required • MIT License
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 lg:py-16 border-t border-[#D2D2D7]/30 bg-[#FBFBFD] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#1D1D1F] rounded-[5px]" />
              <span className="font-semibold text-[15px] tracking-tight">
                Kollect AI
              </span>
              <Link
                href="template-nextjs-deepgram-voice-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                <Github size={16} />
              </Link>
            </div>
            
            <p className="text-[11px] text-[#86868B] font-medium">
              © 2026 Kollect. MIT License.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}