import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api/client';
import type { ResumeVersion, ResumeData } from '@/types/resume';
import { formatDate } from '@/lib/utils';
import { History, Plus, RotateCcw, Clock } from 'lucide-react';

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  resumeId: string;
  onRestore: (restoredData: ResumeData) => void;
}

export function VersionHistoryModal({
  open,
  onClose,
  resumeId,
  onRestore,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const data = await api.listResumeVersions(resumeId);
      setVersions(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, resumeId]);

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await api.createResumeVersion(resumeId, {
        title: newTitle,
        change_summary: changeSummary,
      });
      setNewTitle('');
      setChangeSummary('');
      fetchVersions();
    } catch (err: any) {
      alert(err.message || 'Failed to create snapshot');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Restore this snapshot? Any unsaved edits in your current working draft will be replaced.')) {
      return;
    }
    try {
      const restored = await api.restoreResumeVersion(resumeId, versionId);
      onRestore(restored.data);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to restore snapshot');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Resume Version History"
      description="Track changes, create named milestones, and restore previous snapshots."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Create Snapshot Form */}
        <form onSubmit={handleCreateSnapshot} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-emerald-700" />
            Snapshot Current Resume State
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Milestone name (e.g. Pre-Fintech tailor)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Summary of changes (optional)"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={creating} className="bg-emerald-700 hover:bg-emerald-800 text-xs">
              Save Snapshot
            </Button>
          </div>
        </form>

        {/* Existing Versions List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Saved Milestones ({versions.length})
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
              No saved snapshots yet. Create one above to preserve your resume state.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{ver.title}</span>
                      <Badge variant="neutral">v{ver.version_number}</Badge>
                    </div>
                    {ver.change_summary && (
                      <p className="text-slate-500 text-[11px] mt-0.5">{ver.change_summary}</p>
                    )}
                    <span className="flex items-center gap-1 text-slate-400 text-[10px] mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(ver.created_at)}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2.5 border-slate-300"
                    onClick={() => handleRestore(ver.id)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1 text-slate-600" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
