import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLandRecords } from '../../context/LandRecordContext';
import { useTranslation } from '../../i18n/LanguageContext';
import type { DocumentMetadata, OcrProcessingResult } from '../../services/ocrService';
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
  { id: 'ocr',            label: 'BHASHINI OCR Extraction',       description: 'Processing document with BHASHINI OCR engine…',      icon: FileSearch, duration: 900 },
  { id: 'parsing',        label: 'Structured Field Extraction',   description: 'Parsing Khata, Khasra, Owner, Area & Land Category', icon: Cpu,        duration: 700 },
  { id: 'validation',     label: 'Rule & Duplicate Engine',       description: 'Required fields, format & registry duplicate check', icon: Shield,     duration: 600 },
  { id: 'scoring',        label: 'Field Confidence & Risk Score',  description: 'Calculating per-field OCR confidence & anomaly risk',icon: CheckSquare,duration: 400 },
  { id: 'routing',        label: 'Routing to Officer Review',     description: 'Routing to Land Record Officer Review Queue based on rules',icon: UserCheck,  duration: 400 },
];

export const UploadPage: React.FC<{ onNavigateToVerification?: (recordId?: string) => void }> = ({ onNavigateToVerification }) => {
  const { user, permissions } = useAuth();
  const { t } = useTranslation();
  const { processDocumentUpload, setActiveVerificationRecordId, activeVerificationRecordId } = useLandRecords();
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

  // Metadata form (all optional hints for OCR / validation)
  const [meta, setMeta] = useState<DocumentMetadata>({
    state: '',
    district: '',
    tehsil: '',
    village: '',
    recordYear: '',
    language: 'AUTO',
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
    setErrorMessage(null);
    setProcessedResult(null);

    try {
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
      if (!result || !result.ocrResult || !result.ocrResult.extractedFields || result.ocrResult.extractedFields.length === 0) {
        throw new Error("Unable to extract data from this document. Please upload a clearer image and try again.");
      }
      setProcessedResult(result);
      setCurrentStep('done');
      setActiveStageIdx(-1);
    } catch (err: any) {
      console.error('OCR Processing Error:', err);
      setErrorMessage(err?.message || "Unable to extract data from this document. Please upload a clearer image and try again.");
      setCurrentStep('uploaded');
      setActiveStageIdx(-1);
    }
  };

  const handleOpenVerificationDesk = () => {
    const targetId = processedResult?.record?.id || activeVerificationRecordId || undefined;
    console.log('[OCR Pipeline] Opening Verification Desk: verificationRequestId =', targetId);
    if (targetId) {
      setActiveVerificationRecordId(targetId);
    }
    if (onNavigateToVerification) {
      onNavigateToVerification(targetId);
    }
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('upload.title')}</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {t('upload.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="gov-badge gov-badge-success">● {t('upload.bhashiniActive')}</span>
          <span className="gov-badge gov-badge-info">● {t('upload.multilingualScript')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Upload + Metadata */}
        <div className="lg:col-span-7 space-y-4">
          {/* Drop Zone */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-white">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-200">
              {t('upload.ingestionTitle')}
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
                  {isDragging ? t('upload.dropHere') : t('upload.dragDrop')}
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  {t('upload.supportedFormats')}
                </div>
                <div className="text-[11px] font-mono text-slate-400">{t('upload.maxSize')}</div>
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
                  {t('upload.readyForOcr')}
                </div>
                <button
                  onClick={startProcessing}
                  className="w-full gov-btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Cpu className="w-4 h-4" /> {t('upload.runOcrBtn')}
                </button>
              </div>
            )}

            {/* Processing in progress */}
            {isProcessing && (
              <div className="border border-amber-300 bg-amber-50 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-amber-900">
                    Processing document with BHASHINI OCR — {PIPELINE_STAGES[activeStageIdx]?.label}…
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
                      {t('upload.completeTitle')}{processedResult.record.id}
                    </span>
                  </div>
                  <span className={`gov-badge ${
                    processedResult.ocrResult.overallOcrConfidence >= 80 ? 'gov-badge-success' : 'gov-badge-warning'
                  } text-[10px]`}>
                    {processedResult.record.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Script & Tripartite Genuine Confidence Signals */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded border border-emerald-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{t('upload.detectedScript')}</div>
                    <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1 truncate">
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{processedResult.ocrResult.detectedLanguages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-emerald-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Field Completeness</div>
                    <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {processedResult.ocrResult.extractedFields.filter(f => f.value && f.value.trim().length > 0).length} / {processedResult.ocrResult.extractedFields.length} Identified
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-emerald-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{t('upload.overallConfidence')}</div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className={`font-extrabold text-sm ${
                        processedResult.ocrResult.overallOcrConfidence >= 80
                          ? 'text-emerald-700'
                          : processedResult.ocrResult.overallOcrConfidence >= 60
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}>
                        {processedResult.ocrResult.overallOcrConfidence}%
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        (OCR: {processedResult.ocrResult.ocrCharConfidence || processedResult.ocrResult.overallOcrConfidence}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Automatic Routing / Confidence Notice */}
                {processedResult.ocrResult.overallOcrConfidence < 75 || processedResult.ocrResult.extractedFields.filter(f => f.value).length < 10 ? (
                  <div className="p-3 bg-amber-100/90 border border-amber-300 rounded text-xs space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      Low OCR Confidence / Incomplete Mandatory Fields — Manual Verification Required
                    </div>
                    <div className="text-[11px] text-amber-800">
                      {processedResult.record.flagReason || 'Document requires mandatory officer verification before public publication.'}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                      High-Confidence Extraction — Ready for Officer Review
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Mandatory land-record fields extracted and verified against registry schema.
                    </div>
                  </div>
                )}

                {/* Extracted Fields Preview */}
                <div className="bg-white p-3 rounded border border-emerald-200 text-xs space-y-2 max-h-72 overflow-y-auto">
                  <div className="font-bold text-slate-900 border-b pb-1 text-[11px] flex items-center justify-between">
                    <span>{t('upload.extractedFieldsTitle')}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {processedResult.ocrResult.extractedFields.filter(f => f.value && f.value.trim().length > 0).length} / {processedResult.ocrResult.extractedFields.length} {t('upload.identifiedCount')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {processedResult.ocrResult.extractedFields.map(f => (
                      <div key={f.fieldName} className={`p-2 rounded border ${f.value ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/50 border-amber-200 opacity-75'}`}>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{f.fieldLabel}</div>
                        <div
                          dir={f.isRtl ? 'rtl' : 'ltr'}
                          className={`font-bold text-xs mt-0.5 truncate ${
                            f.value ? 'text-slate-900' : 'text-slate-400 italic'
                          } ${f.isRtl ? 'text-right font-medium font-serif' : ''}`}
                        >
                          {f.value || 'Not detected — Requires verification'}
                        </div>
                        {f.transliteratedValue && (
                          <div className="text-[10px] text-slate-500 font-sans italic truncate">
                            Transliteration: {f.transliteratedValue}
                          </div>
                        )}
                        <div className="text-[9px] text-slate-500 flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                          <span className="font-mono">
                            Confidence: <strong className={f.confidence >= 80 ? 'text-emerald-700' : f.confidence > 0 ? 'text-amber-700' : 'text-slate-400'}>{f.confidence}%</strong>
                          </span>
                          {f.evidence?.boundingBox ? (
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-mono">BBox Evidence ✓</span>
                          ) : f.value ? (
                            <span className="text-[8px] bg-blue-100 text-blue-800 px-1 rounded font-mono">Text Match</span>
                          ) : (
                            <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded font-mono">No Evidence</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw OCR Text Log */}
                {processedResult.ocrResult.rawExtractedText && (
                  <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-[11px] space-y-1">
                    <div className="text-[10px] uppercase font-bold text-amber-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                      <span>{processedResult.ocrResult.engineName || t('upload.rawOcrOutput')}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {processedResult.ocrResult.textBlocks.length} text blocks extracted
                      </span>
                    </div>
                    <pre
                      dir={processedResult.ocrResult.detectedLanguages.some(l => l.includes('Urdu')) ? 'rtl' : 'ltr'}
                      className="whitespace-pre-wrap font-mono text-[10px] text-slate-300 max-h-32 overflow-y-auto pt-1 leading-relaxed"
                    >
                      {processedResult.ocrResult.rawExtractedText}
                    </pre>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {onNavigateToVerification && (
                    <button
                      onClick={handleOpenVerificationDesk}
                      className="gov-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 flex-1 justify-center"
                    >
                      <UserCheck className="w-4 h-4" /> {t('upload.openVerificationDesk')}
                    </button>
                  )}
                  <button onClick={reset} className="gov-btn-secondary py-2 px-4 text-xs font-bold flex-1">
                    {t('upload.uploadAnother')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Processing Pipeline Visualization */}
          {(isProcessing || currentStep === 'done') && (
            <div className="gov-card p-5 rounded border border-slate-300 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-200">
                {t('upload.auditStages')}
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
                        {status === 'done' ? '✓ ' + t('common.verified') : status === 'active' ? '⟳ ' + t('common.loading') : '○ ' + t('common.pending')}
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
          {/* Jurisdiction Metadata & Script Hints */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {t('upload.metadataPanelTitle')}
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                {t('upload.optionalHints')}
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              {t('upload.metadataHelp')}
            </p>

            <div className="space-y-3 text-xs">
              {/* Document Type */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('upload.docType')}</label>
                <select
                  value={meta.docType || ''}
                  onChange={e => setMeta(prev => ({ ...prev, docType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#064E3B]"
                >
                  <option value="Jamabandi (Record of Rights)">Jamabandi (Record of Rights)</option>
                  <option value="Khatoni (Khata Register)">Khatoni (Khata Register)</option>
                  <option value="Khasra Girdawari">Khasra Girdawari</option>
                  <option value="Mutation Register">Mutation Register</option>
                  <option value="Revenue Survey Map">Revenue Survey Map</option>
                  <option value="Patta Document">Patta Document</option>
                  <option value="Other Land Record">Other Land Record</option>
                </select>
              </div>

              {/* Language / Script Hint */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                  <span>{t('upload.scriptLanguage')}</span>
                  <span className="text-[10px] text-emerald-700 font-medium">{t('upload.bhashiniHint')}</span>
                </label>
                <select
                  value={meta.language || 'AUTO'}
                  onChange={e => setMeta(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full bg-emerald-50/50 border border-emerald-300 rounded px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#064E3B]"
                >
                  <option value="AUTO">{t('upload.autoDetectScript')}</option>
                  <option value="HINDI">Hindi (Devanagari)</option>
                  <option value="ENGLISH">English (Latin)</option>
                  <option value="BENGALI">Bengali (Bangla)</option>
                  <option value="ODIA">Odia</option>
                  <option value="MARATHI">Marathi (Devanagari)</option>
                  <option value="PUNJABI">Punjabi (Gurmukhi)</option>
                  <option value="GUJARATI">Gujarati</option>
                  <option value="TAMIL">Tamil</option>
                  <option value="TELUGU">Telugu</option>
                  <option value="KANNADA">Kannada</option>
                  <option value="MALAYALAM">Malayalam</option>
                  <option value="URDU">Urdu</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('upload.state')}</label>
                <select
                  value={meta.state || ''}
                  onChange={e => setMeta(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#064E3B]"
                >
                  <option value="">{t('upload.selectState')}</option>
                  {[
                    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir'
                  ].map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              {/* District & Tehsil Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('upload.district')}</label>
                  <input
                    type="text"
                    value={meta.district || ''}
                    onChange={e => setMeta(prev => ({ ...prev, district: e.target.value }))}
                    placeholder={t('upload.districtPlaceholder')}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('upload.tehsil')}</label>
                  <input
                    type="text"
                    value={meta.tehsil || ''}
                    onChange={e => setMeta(prev => ({ ...prev, tehsil: e.target.value }))}
                    placeholder={t('upload.tehsilPlaceholder')}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#064E3B]"
                  />
                </div>
              </div>

              {/* Village & Year Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('upload.village')}</label>
                  <input
                    type="text"
                    value={meta.village || ''}
                    onChange={e => setMeta(prev => ({ ...prev, village: e.target.value }))}
                    placeholder={t('upload.villagePlaceholder')}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('upload.recordYear')}</label>
                  <input
                    type="text"
                    value={meta.recordYear || ''}
                    onChange={e => setMeta(prev => ({ ...prev, recordYear: e.target.value }))}
                    placeholder={t('upload.yearPlaceholder')}
                    maxLength={4}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#064E3B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Protocol Info */}
          <div className="gov-card p-4 rounded border border-slate-300 bg-slate-50 text-xs space-y-3">
            <h3 className="font-bold text-[#064E3B] uppercase tracking-wider text-[11px] pb-2 border-b border-slate-200">
              {t('upload.sopTitle')}
            </h3>
            <ol className="space-y-2 list-none text-slate-700 font-medium">
              {[
                'Original document binary storage & hash validation',
                'Script auto-detection (Devanagari / English)',
                'BHASHINI Udyat OCR text extraction',
                'Structured Khata / Khasra field mapping',
                'Per-field confidence scoring & format validation',
                'Automated duplicate & area mismatch check',
                'Routing to Land Record Officer for review & verification',
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
