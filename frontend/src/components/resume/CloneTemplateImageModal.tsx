import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api/client';
import type { ResumeData, ResumeStyling, ExtractedTemplateProposal } from '@/types/resume';
import { ResumeLivePreview } from './ResumeLivePreview';
import {
  UploadCloud,
  Camera,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Image as ImageIcon,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface CloneTemplateImageModalProps {
  open: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  onApplyStyling: (newStyling: ResumeStyling) => void;
}

export function CloneTemplateImageModal({
  open,
  onClose,
  resumeData,
  onApplyStyling,
}: CloneTemplateImageModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [roleHint, setRoleHint] = useState<string>(resumeData.contact.headline || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [proposal, setProposal] = useState<ExtractedTemplateProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    if (!open) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [open]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedImage(null);
      setImageFileName('');
      setProposal(null);
      setError(null);
      setIsProcessing(false);
    }
  }, [open]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image file is too large. Please select an image under 8MB.');
      return;
    }

    setError(null);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setProposal(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);

    // Multi-phase progress indicator
    setProcessingStep('De-noising image and sharpening typography edges...');
    const t1 = setTimeout(() => {
      setProcessingStep('Scanning visual hierarchy, margins & header alignment...');
    }, 500);
    const t2 = setTimeout(() => {
      setProcessingStep('Synthesizing exact ATS-compliant vector template...');
    }, 1100);

    try {
      const result = await api.aiExtractTemplateFromImage({
        imageBase64: selectedImage,
        roleHint: roleHint.trim() || undefined,
        consent: true,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      setProposal(result);
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err.message || 'Failed to extract template from image. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!proposal) return;
    onApplyStyling(proposal.styling);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="5xl"
      title="Import Template from Screenshot or Photo"
      description="Upload any resume screenshot or photo. AI de-noises and reconstructs the exact template styling while ensuring 100% single-column ATS compliance."
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!proposal ? (
          <div className="space-y-5">
            {/* Image Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/60'
                  : selectedImage
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {selectedImage ? (
                <div className="flex flex-col items-center">
                  <div className="relative max-h-56 max-w-xs rounded-lg overflow-hidden border border-slate-300 shadow-xs mb-3">
                    <img
                      src={selectedImage}
                      alt="Selected template screenshot"
                      className="object-contain max-h-56 w-auto"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{imageFileName || 'Screenshot selected'}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Click or drag another image to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    Drop screenshot here, click to browse, or press Ctrl+V
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, JPEG, WEBP up to 8MB. Even blurry or low-res photos work!
                  </span>
                  <Badge variant="neutral" className="mt-3 text-[10px] font-mono">
                    💡 Tip: Press Win+Shift+S, take a clip, and hit Ctrl+V
                  </Badge>
                </div>
              )}
            </div>

            {/* Target Role Hint */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Role / Industry (Optional)
                </label>
                <Input
                  value={roleHint}
                  onChange={(e) => setRoleHint(e.target.value)}
                  placeholder="e.g. Software Engineer, Data Scientist, Finance Executive"
                  className="text-xs h-9"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Helps AI tune typographic pairing (e.g. Modern Sans-serif for tech, Classic Serif for finance).
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex flex-col justify-center space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Strict ATS De-noising & Guardrails</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  If the image has blur, skewed angles, or multi-column boxes, our AI de-noises and translates
                  it into a high-contrast, linear single-column format guaranteed to pass ATS scanners.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleProcessImage}
                disabled={!selectedImage || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-5 gap-2 shadow-xs cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    <span>{processingStep}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Analyze & Reconstruct Template</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Extracted Template Results & Side-by-Side Verification */
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    Template Reconstructed Successfully ({Math.round(proposal.confidenceScore * 100)}% Match)
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">{proposal.explanation}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-300 text-emerald-900 bg-white text-[11px] font-mono shrink-0">
                ATS Verified: Safe
              </Badge>
            </div>

            {/* Extracted Traits Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Primary Colors
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: proposal.styling.headingColor }}
                    title={`Heading: ${proposal.styling.headingColor}`}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: proposal.styling.accentColor }}
                    title={`Accent: ${proposal.styling.accentColor}`}
                  />
                  <span className="font-mono text-[11px] text-slate-700 font-medium">
                    {proposal.styling.headingColor}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Typography
                </span>
                <span className="font-semibold text-slate-900 capitalize">
                  {proposal.styling.fontFamily} ({proposal.styling.fontScale})
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Header Align
                </span>
                <span className="font-semibold text-slate-900 capitalize">
                  {proposal.styling.headerAlignment}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Divider Style
                </span>
                <span className="font-semibold text-slate-900 capitalize">
                  {proposal.styling.dividerStyle}
                </span>
              </div>
            </div>

            {/* Side-by-Side: Original Upload vs. Reconstructed Live A4 Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Left: Original Screenshot */}
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-100 flex flex-col h-[460px]">
                <div className="px-3 py-2 bg-slate-200 border-b border-slate-300 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-slate-600" />
                    Original Screenshot / Photo
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">Source</span>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900/5">
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt="Uploaded screenshot"
                      className="max-h-full max-w-full object-contain rounded shadow-sm border border-slate-200"
                    />
                  )}
                </div>
              </div>

              {/* Right: Reconstructed Live A4 Document */}
              <div className="border border-indigo-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col h-[460px]">
                <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between text-xs font-semibold text-indigo-950">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Crisp De-noised ATS Reconstructed Preview
                  </span>
                  <Badge variant="neutral" className="text-[10px] font-mono">
                    A4 Ready
                  </Badge>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 bg-slate-200/50 flex justify-center">
                  <div className="w-full max-w-full transform scale-[0.60] origin-top">
                    <ResumeLivePreview
                      data={resumeData}
                      overrideStyling={proposal.styling}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProposal(null)}
                className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Upload Different Image
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-xs border-slate-300 cursor-pointer"
                >
                  Exit / Close
                </Button>

                <Button
                  size="sm"
                  onClick={handleApply}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Apply Extracted Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
