import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLandRecords } from '../../context/LandRecordContext';
import type { OcrProcessingResult } from '../../services/ocrService';
import type { LandRecord } from '../../types/landRecord';
import {
  Upload, CheckCircle, Lock, FileText, Image, AlertTriangle,
  X, Clock, CheckSquare, Cpu,
  Shield, UserCheck, FileSearch, Settings2, Globe
} from 'lucide-react';

type UploadStep = 'idle' | 'uploaded' | 'processing' | 'done';

interface PipelineStage {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  duration: number; // ms
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'preprocessing',  label: 'Image Pre-processing',          description: 'Denoising, deskewing, binarization (300 DPI)',      icon: Settings2,  duration: 600 },
  { id: 'script',         label: 'Language / Script Detection',   description: 'Devanagari (Hindi) & Latin (English) script parsing', icon: Globe,      duration: 500 },
  { id: 'ocr',            label: 'OCR Engine Extraction',         description: 'Deep Learning text block extraction & bounding boxes',icon: FileSearch, duration: 900 },
  { id: 'parsing',        label: 'Structured Field Extraction',   description: 'Parsing Khata, Khasra, Owner, Area & Land Category', icon: Cpu,        duration: 700 },
  { id: 'validation',     label: 'Rule & Duplicate Engine',       description: 'Required fields, format & registry duplicate check', icon: Shield,     duration: 600 },
  { id: 'scoring',        label: 'Field Confidence & Risk Score',  description: 'Calculating per-field OCR confidence & anomaly risk',icon: CheckSquare,duration: 400 },
  { id: 'routing',        label: 'Auto-Routing to Verification',  description: 'Routing to Verification Officer Queue based on rules',icon: UserCheck,  duration: 400 },
];

export const UploadPage: React.FC<{ onNavigateToVerification?: () => void }> = ({ onNavigateToVerification }) => {
  const { user, permissions } = useAuth();
  const { processDocumentUpload } = useLandRecords();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<UploadStep>('idle');
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [processedResult, setProcessedResult] = useState<{
    record: LandRecord;
    ocrResult: OcrProcessingResult;
  } | null>(null);

  // Metadata form
  const [meta, setMeta] = useState({
    state: 'Rajasthan',
    district: 'Jaipur Rural',
    tehsil: 'Sanganer',
    village: 'Rampur',
    recordYear: '2026',
    language: 'HINDI',
    docType: 'Jamabandi (Record of Rights)',
  });

  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
  const MAX_SIZE_MB = 25;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|tiff)$/i)) {
      return 'Invalid file type. Please upload PDF, JPG, PNG, or TIFF documents only.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileDrop = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) { setErrorMessage(err); return; }
    setErrorMessage(null);
    setUploadedFile(file);
    setCurrentStep('uploaded');
    setCompletedStages([]);
    setActiveStageIdx(-1);
    setProcessedResult(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileDrop(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileDrop(file);
  };

  const startProcessing = async () => {
    if (!uploadedFile) return;
    setCurrentStep('processing');
    setCompletedStages([]);
    setActiveStageIdx(0);

    // Run stages visually
    const processPromise = processDocumentUpload(
      uploadedFile,
      meta,
      user?.name || 'Land Record Officer',
      user?.role || 'LAND_RECORD_OFFICER'
    );

    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      setActiveStageIdx(i);
      await new Promise(r => setTimeout(r, PIPELINE_STAGES[i].duration));
      setCompletedStages(prev => [...prev, PIPELINE_STAGES[i].id]);
    }

    const result = await processPromise;
    setProcessedResult(result);
    setCurrentStep('done');
    setActiveStageIdx(-1);
  };

  const reset = () => {
    setUploadedFile(null);
    setCurrentStep('idle');
    setCompletedStages([]);
    setActiveStageIdx(-1);
    setErrorMessage(null);
    setProcessedResult(null);
  };

  const isProcessing = currentStep === 'processing';

  const getStageStatus = (stageId: string, idx: number) => {
    if (completedStages.includes(stageId)) return 'done';
    if (activeStageIdx === idx && isProcessing) return 'active';
    return 'pending';
  };

  const fileIcon = () => {
    if (!uploadedFile) return null;
    if (uploadedFile.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-600" />;
    return <Image className="w-8 h-8 text-blue-600" />;
  };

  if (!permissions.canUploadDocuments) {
    return (
      <div className="gov-card p-8 text-center max-w-md mx-auto my-12 rounded border border-slate-300">
        <Lock className="w-10 h-10 text-rose-700 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-1">Permission required: Land Record Officer designation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Page Header */}
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Document Upload & Digitization Engine</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Ingest physical Jamabandi / Khatoni / RoR scans into OCR extraction & validation pipeline
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="gov-badge gov-badge-success">● OCR Engine Active</span>
          <span className="gov-badge gov-badge-info">● Multilingual Script Parser</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Upload + Metadata */}
        <div className="lg:col-span-7 space-y-4">
          {/* Drop Zone */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-white">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-200">
              Document File Ingestion
            </h2>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-300 rounded text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {errorMessage}
              </div>
            )}

            {/* Drop area */}
            {currentStep === 'idle' && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragging ? 'border-[#064E3B] bg-emerald-50' : 'border-slate-300 hover:border-[#064E3B] hover:bg-slate-50 bg-slate-50/50'
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.tiff" className="hidden" onChange={onFileSelect} />
                <Upload className="w-10 h-10 text-[#064E3B] mx-auto mb-3 opacity-70" />
                <div className="text-sm font-bold text-slate-800 mb-1">
                  {isDragging ? 'Drop the file here' : 'Drag & Drop or Click to Select'}
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  Supported formats: PDF, JPG, JPEG, PNG, TIFF (scanned register copy or land document)
                </div>
                <div className="text-[11px] font-mono text-slate-400">Maximum file size: 25 MB</div>
              </div>
            )}

            {/* File selected — waiting to process */}
            {currentStep === 'uploaded' && uploadedFile && (
              <div className="border border-emerald-300 bg-emerald-50/80 rounded p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {fileIcon()}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{uploadedFile.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.type || 'document'}
                    </div>
                  </div>
                  <button onClick={reset} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Document uploaded and stored. Ready for OCR extraction & validation.
                </div>
                <button
                  onClick={startProcessing}
                  className="w-full gov-btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Cpu className="w-4 h-4" /> Run OCR & Structured Validation Engine
                </button>
              </div>
            )}

            {/* Processing in progress */}
            {isProcessing && (
              <div className="border border-amber-300 bg-amber-50 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-amber-900">
                    AI Pipeline Active — {PIPELINE_STAGES[activeStageIdx]?.label}…
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-1.5 mb-2">
                  <div
                    className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(completedStages.length / PIPELINE_STAGES.length) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-amber-700 font-mono">
                  Step {completedStages.length + 1} of {PIPELINE_STAGES.length}: {PIPELINE_STAGES[activeStageIdx]?.description}
                </div>
              </div>
            )}

            {/* Done — Results Summary */}
            {currentStep === 'done' && processedResult && (
              <div className="border border-emerald-400 bg-emerald-50/90 rounded p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                    <span className="text-sm font-bold text-emerald-900">
                      Processing Complete — Record #{processedResult.record.id}
                    </span>
                  </div>
                  <span className="gov-badge gov-badge-warning text-[10px]">
                    {processedResult.record.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Script & Confidence Signals */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded border border-emerald-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Detected Script & Language</div>
                    <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      {processedResult.ocrResult.detectedLanguages.join(', ')}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-emerald-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Overall OCR Confidence</div>
                    <div className={`font-extrabold text-sm ${
                      processedResult.ocrResult.overallOcrConfidence >= 90 ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {processedResult.ocrResult.overallOcrConfidence}%
                    </div>
                  </div>
                </div>

                {/* Automatic Routing Notice */}
                <div className="p-3 bg-amber-100/80 border border-amber-300 rounded text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    Automated Routing to Verification Officer Queue
                  </div>
                  <div className="text-[11px] text-amber-800">
                    {processedResult.record.flagReason || 'Document requires mandatory officer verification before public publication.'}
                  </div>
                </div>

                {/* Extracted Fields Preview */}
                <div className="bg-white p-3 rounded border border-emerald-200 text-xs space-y-2 max-h-48 overflow-y-auto">
                  <div className="font-bold text-slate-900 border-b pb-1 text-[11px]">Extracted Land Record Fields</div>
                  <div className="grid grid-cols-2 gap-2">
                    {processedResult.ocrResult.extractedFields.map(f => (
                      <div key={f.fieldName} className="p-1.5 bg-slate-50 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{f.fieldLabel}</div>
                        <div className="font-bold text-slate-900">{f.value}</div>
                        <div className="text-[9px] text-slate-500 flex items-center justify-between mt-0.5">
                          <span>Confidence: {f.confidence}%</span>
                          {f.confidence < 75 && <span className="text-amber-700 font-bold">⚠️ Review Needed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {onNavigateToVerification && (
                    <button
                      onClick={onNavigateToVerification}
                      className="gov-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 flex-1 justify-center"
                    >
                      <UserCheck className="w-4 h-4" /> Open Verification Desk
                    </button>
                  )}
                  <button onClick={reset} className="gov-btn-secondary py-2 px-4 text-xs font-bold flex-1">
                    Upload Another Document
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Processing Pipeline Visualization */}
          {(isProcessing || currentStep === 'done') && (
            <div className="gov-card p-5 rounded border border-slate-300 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-200">
                AI Processing Pipeline Audit Stages
              </h3>
              <div className="space-y-2">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const status = getStageStatus(stage.id, idx);
                  return (
                    <div
                      key={stage.id}
                      className={`flex items-center gap-3 p-2.5 rounded border transition-all ${
                        status === 'done'   ? 'border-emerald-200 bg-emerald-50/60' :
                        status === 'active' ? 'border-amber-300 bg-amber-50 shadow-sm' :
                                             'border-slate-100 bg-slate-50/50 opacity-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        status === 'done'   ? 'bg-emerald-600' :
                        status === 'active' ? 'bg-amber-500' :
                                             'bg-slate-200'
                      }`}>
                        {status === 'done'   ? <CheckCircle className="w-3.5 h-3.5 text-white" /> :
                         status === 'active' ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                                              <Clock className="w-3 h-3 text-slate-400" />}
                      </div>
                      <Icon className={`w-4 h-4 shrink-0 ${
                        status === 'done' ? 'text-emerald-700' : status === 'active' ? 'text-amber-700' : 'text-slate-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-bold ${
                          status === 'done' ? 'text-emerald-900' : status === 'active' ? 'text-amber-900' : 'text-slate-500'
                        }`}>{stage.label}</div>
                        <div className="text-[11px] text-slate-500 truncate">{stage.description}</div>
                      </div>
                      <div className={`text-[10px] font-mono font-bold uppercase shrink-0 ${
                        status === 'done'   ? 'text-emerald-700' :
                        status === 'active' ? 'text-amber-700' :
                                             'text-slate-400'
                      }`}>
                        {status === 'done' ? '✓ Done' : status === 'active' ? '⟳ Running' : '○ Pending'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Metadata Form + Protocol */}
        <div className="lg:col-span-5 space-y-4">
          {/* Jurisdiction Metadata */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-200">
              Document Metadata & Script Hints
            </h3>
            <div className="space-y-3 text-xs">
              {[
                { label: 'Document Type', key: 'docType', options: ['Jamabandi (Record of Rights)', 'Khatoni (Khata Register)', 'Khasra Girdawari', 'Mutation Register', 'Revenue Survey Map', 'Patta Document', 'Other RoR Document'] },
                { label: 'State',     key: 'state',     options: ['Rajasthan', 'Bihar', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Haryana'] },
                { label: 'District',  key: 'district',  options: ['Jaipur Rural', 'Patna', 'Lucknow', 'South 24 Parganas', 'Varanasi', 'Agra', 'Muzaffarpur'] },
                { label: 'Tehsil',    key: 'tehsil',    options: ['Sanganer', 'Chaksu', 'Phagi', 'Amber', 'Patna Sadar', 'Lucknow East', 'Baruipur'] },
                { label: 'Village / Mauza', key: 'village', options: ['Rampur', 'Kishanpura', 'Phagi Central', 'Danapur', 'Sisendi Khas', 'Bhangar Rajarhat'] },
                { label: 'Record Year', key: 'recordYear', options: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'] },
                { label: 'Document Script / Language', key: 'language', options: ['HINDI', 'ENGLISH', 'BENGALI', 'ODIA', 'MARATHI', 'PUNJABI'] },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="block text-slate-700 font-bold mb-1">{label}</label>
                  <select
                    value={meta[key as keyof typeof meta]}
                    onChange={e => setMeta(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#064E3B]"
                  >
                    {options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Protocol Info */}
          <div className="gov-card p-4 rounded border border-slate-300 bg-slate-50 text-xs space-y-3">
            <h3 className="font-bold text-[#064E3B] uppercase tracking-wider text-[11px] pb-2 border-b border-slate-200">
              Digitization SOP Protocol (DoLR Guidelines)
            </h3>
            <ol className="space-y-2 list-none text-slate-700 font-medium">
              {[
                'Original document binary storage & hash validation',
                'Script auto-detection (Devanagari / English)',
                'Tesseract & Deep Learning OCR block extraction',
                'Structured Khata / Khasra field mapping',
                'Per-field confidence scoring & format validation',
                'Automated duplicate & area mismatch check',
                'Routing to Verification Officer for manual review',
                'Immutable audit logging of all processing events',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#064E3B] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
