import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api/client';
import { Sparkles, Shield, ArrowRight, Check } from 'lucide-react';

interface AiRewriteModalProps {
  open: boolean;
  onClose: () => void;
  originalText: string;
  contextType: 'bullet' | 'summary';
  role?: string;
  onApply: (refinedText: string) => void;
}

export function AiRewriteModal({
  open,
  onClose,
  originalText,
  contextType,
  role,
  onApply,
}: AiRewriteModalProps) {
  const [consentGranted, setConsentGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [quantPrompt, setQuantPrompt] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!consentGranted) {
      setError('Please acknowledge the privacy consent checkbox to continue.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (contextType === 'bullet') {
        const res = await api.aiRewriteBullet({
          bullet: originalText,
          role,
          consent: true,
        });
        setSuggestions(res.suggestions);
        setQuantPrompt(res.quantificationPrompt || null);
        if (res.suggestions.length > 0) {
          setSelectedText(res.suggestions[0]);
        }
      } else {
        const res = await api.aiPolishSummary({
          summary: originalText,
          targetRole: role,
          consent: true,
        });
        setSuggestions([res.polished]);
        setSelectedText(res.polished);
      }
    } catch (err: any) {
      setError(err.message || 'AI service temporarily unavailable. Using standard rule heuristics.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selectedText) {
      onApply(selectedText);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={contextType === 'bullet' ? 'AI Bullet Point Polish' : 'AI Professional Summary Polish'}
      description="Enhance impact and action verbs while strictly preserving your authentic career achievements."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Privacy Consent Notice */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Shield className="h-4 w-4 text-emerald-700" />
            <span>Anti-Hallucination & Privacy Safeguard</span>
          </div>
          <p className="leading-relaxed">
            Our AI service improves phrasing, strong action verbs, and readability. It will <strong>never invent</strong> employers, metrics, or technologies.
          </p>
          <label className="flex items-center gap-2 text-slate-900 font-medium cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
            />
            <span>I consent to sending this snippet to the AI service for rephrasing</span>
          </label>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Original Text
          </label>
          <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 italic">
            "{originalText || 'No text provided'}"
          </div>
        </div>

        {/* Generate Trigger */}
        {suggestions.length === 0 && (
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              disabled={!consentGranted || !originalText.trim()}
              loading={loading}
              onClick={handleGenerate}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Generate ATS Suggestions
            </Button>
          </div>
        )}

        {/* Suggestions Display */}
        {suggestions.length > 0 && (
          <div className="space-y-3 pt-2">
            {quantPrompt && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Quantification Prompt:</span>
                {quantPrompt}
              </div>
            )}

            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Select or Edit Recommended Phrasing:
            </label>

            <div className="space-y-2">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedText(sug)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedText === sug
                      ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="leading-relaxed">{sug}</p>
                    {selectedText === sug && (
                      <Check className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Textarea
                label="Fine-tune selected wording:"
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSuggestions([]);
                  setSelectedText('');
                }}
              >
                Regenerate
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800"
                  onClick={handleApply}
                >
                  Apply to Resume
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
