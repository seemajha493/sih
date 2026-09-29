import React, { useEffect, useRef, useState } from 'react';
import {
  FileWarning,
  Cpu,
  ShieldCheck,
  UploadCloud,
  ScanText,
  FileCheck2,
  UserCheck2,
  DatabaseZap,
  Users,
  Building2,
  Compass,
  ArrowDown,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const NationalLandRecordsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedStep, setSelectedStep] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full bg-[#F8FAFC] text-[#0F172A] font-sans select-none border-t border-slate-300 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1 — TOP THREE CARDS
           ══════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          <div
            className={`text-center max-w-2xl mx-auto transition-opacity duration-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#064E3B] bg-emerald-50 border border-emerald-300 px-3 py-0.5 rounded mb-2">
              National Land Records Modernization Programme
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Digitizing, Verifying & Securing National Land Records
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 01 */}
            <div
              className={`bg-white rounded border border-slate-300 p-5 shadow-xs hover:border-[#064E3B] transition-colors flex flex-col justify-between ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-xl font-bold text-[#064E3B]">
                    01
                  </span>
                  <div className="p-1.5 bg-emerald-50 text-[#064E3B] rounded border border-emerald-200">
                    <FileWarning className="w-4 h-4" />
                  </div>
                </div>

                <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#064E3B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  IDENTIFY
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Real Land Record Challenges
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Legacy documents, fragmented records, manual processes and difficult record verification create challenges in land administration.
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Layers className="w-3.5 h-3.5 text-emerald-800" />
                <span>Legacy record preservation & categorization</span>
              </div>
            </div>

            {/* Card 02 */}
            <div
              className={`bg-white rounded border border-slate-300 p-5 shadow-xs hover:border-[#064E3B] transition-colors flex flex-col justify-between ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-xl font-bold text-[#064E3B]">
                    02
                  </span>
                  <div className="p-1.5 bg-emerald-50 text-[#064E3B] rounded border border-emerald-200">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>

                <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#064E3B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  CONNECT
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Technology & Human Verification
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  AI-powered OCR, validation and authorized human review work together to process land records accurately.
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Cpu className="w-3.5 h-3.5 text-emerald-800" />
                <span>AI extraction + Revenue Officer validation</span>
              </div>
            </div>

            {/* Card 03 */}
            <div
              className={`bg-white rounded border border-slate-300 p-5 shadow-xs hover:border-[#064E3B] transition-colors flex flex-col justify-between ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-xl font-bold text-[#064E3B]">
                    03
                  </span>
                  <div className="p-1.5 bg-emerald-50 text-[#064E3B] rounded border border-emerald-200">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#064E3B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  IMPLEMENT
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Trusted Digital Land Records
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Transforming legacy land documents into structured, searchable and verifiable digital records.
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Tamper-proof, structured national repository</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2 — CENTRAL MESSAGE (GOVERNMENT MANDATE BANNER)
           ══════════════════════════════════════════════════════════════ */}
        <div
          className={`bg-[#064E3B] text-white rounded border border-[#043D2E] p-6 sm:p-8 text-center space-y-3 shadow-sm ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#043D2E] text-amber-300 px-2.5 py-1 rounded border border-amber-400/40">
            National Land-Record Digitization Vision
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            "One Record. One Trusted Digital Solution."
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Connecting citizens, authorized officials and technology to build secure, searchable and verifiable digital land records.
          </p>

          {/* National Tricolor Accent Bar */}
          <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-90 mt-2" />
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3 — HOW IT WORKS (HORIZONTAL 5-STEP PROCESS)
           ══════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#064E3B] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              HOW IT WORKS
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              From Land Records to Trusted Digital Data
            </h2>
            <p className="text-xs text-slate-600">
              Transforming legacy land documents into structured, searchable and verifiable digital records.
            </p>
          </div>

          {/* 5-Step Process Timeline */}
          <div className="relative pt-2">
            {/* Horizontal connecting line on desktop */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-slate-300 -z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Document Upload',
                  desc: 'Upload scanned, handwritten or legacy land records.',
                  icon: UploadCloud,
                },
                {
                  step: '02',
                  title: 'AI-Powered OCR',
                  desc: 'Detect the document script and language and extract relevant information.',
                  icon: ScanText,
                },
                {
                  step: '03',
                  title: 'Data Validation',
                  desc: 'Validate extracted land-record fields and identify inconsistencies.',
                  icon: FileCheck2,
                },
                {
                  step: '04',
                  title: 'Human Verification',
                  desc: 'Route low-confidence records to authorized officers for review.',
                  icon: UserCheck2,
                },
                {
                  step: '05',
                  title: 'Verified Digital Record',
                  desc: 'Create a secure, searchable and structured digital land record.',
                  icon: DatabaseZap,
                },
              ].map((item, index) => {
                const IconComponent = item.icon;
                const isSelected = selectedStep === index;

                return (
                  <div
                    key={item.step}
                    onClick={() => setSelectedStep(index)}
                    className="flex flex-col items-center text-center cursor-pointer group"
                  >
                    {/* Node Circle */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-xs mb-3 border-2 transition-colors ${
                        isSelected
                          ? 'bg-[#064E3B] text-amber-300 border-[#043D2E] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 group-hover:border-[#064E3B]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Step Card */}
                    <div
                      className={`p-3.5 rounded border text-left w-full transition-colors flex flex-col justify-between min-h-[125px] ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                          : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] font-bold text-[#064E3B] bg-emerald-100/80 px-1.5 py-0.2 rounded">
                            Step {item.step}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 4 — NATIONAL STAKEHOLDER FLOW ("WHO BENEFITS")
           ══════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded border border-slate-300 p-6 sm:p-8 space-y-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#064E3B] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              WHO BENEFITS
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Connecting Every Stakeholder in Land Records
            </h2>
            <p className="text-xs text-slate-600">
              A secure ecosystem for citizens, authorized officials and government land-record administration.
            </p>
          </div>

          {/* Stakeholder Cascading Flow */}
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* Node 1: Citizens */}
            <div className="p-4 rounded border border-slate-300 bg-slate-50 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-[#064E3B] rounded border border-emerald-200 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#064E3B]">
                  CITIZENS
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Access their own authorized land-record information.
                </p>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Node 2: Government */}
            <div className="p-4 rounded border border-slate-300 bg-slate-50 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-[#064E3B] rounded border border-emerald-200 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#064E3B]">
                  GOVERNMENT
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manage, validate and administer land records.
                </p>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Node 3: Officers Grid */}
            {/* Node 3: Land Record Officers */}
            <div className="p-4 rounded border border-slate-300 bg-slate-50 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-[#064E3B] rounded border border-emerald-200 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#064E3B]">
                  LAND RECORD OFFICERS
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Process documents, review AI extraction, validate anomalies, approve and publish verified records.
                </p>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Final Target Node: TRUSTED DIGITAL LAND RECORDS */}
            <div className="bg-[#064E3B] text-white border border-[#043D2E] rounded p-5 text-center space-y-2 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#043D2E] text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/40">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                FINAL NODE
              </div>

              <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
                TRUSTED DIGITAL LAND RECORDS
              </h3>

              <div className="inline-block text-xs font-semibold text-amber-300 bg-black/20 px-3 py-1 rounded">
                Secure • Searchable • Verified
              </div>

              <p className="text-xs text-emerald-100 max-w-md mx-auto leading-relaxed pt-1">
                A unified, verifiable, and tamper-proof digital repository enabling transparent land title administration across all states and union territories.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
