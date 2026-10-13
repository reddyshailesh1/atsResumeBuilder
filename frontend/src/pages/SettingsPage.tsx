import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { 
  Shield, 
  Trash2, 
  User, 
  Camera, 
  CheckCircle, 
  Sparkles, 
  Upload, 
  Check, 
  Edit3, 
  X 
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av1', label: 'Tech Pro', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { id: 'av2', label: 'Engineer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
  { id: 'av3', label: 'Architect', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
  { id: 'av4', label: 'Executive', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
  { id: 'av5', label: 'Specialist', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80' },
  { id: 'av6', label: 'Product Lead', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80' },
];

export function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Image must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setSaveError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setSaveError('Full Name cannot be blank.');
      return;
    }

    setSaveLoading(true);
    setSaveError(null);
    try {
      await api.updateProfile({
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
      });
      await refreshUser();
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      await api.deleteAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-[#fbfaf8] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b border-stone-200">
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-slate-900">
            Account & Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-sans mt-1">
            Manage your personal profile, custom avatar photo, and authentication credentials.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2 font-medium">
              <Check className="h-4 w-4 text-emerald-700" />
              Profile and avatar updated successfully! Changes reflect across your entire workspace.
            </span>
          </div>
        )}

        {saveError && (
          <Alert variant="danger">
            {saveError}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* 1. PROFILE DETAILS & AVATAR EDITOR                                        */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <div>
              <h2 className="font-serif-editorial text-2xl font-medium text-slate-900">
                Personal Identification
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Your career identification and profile avatar
              </p>
            </div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-none px-4 py-2 text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors border border-stone-300"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile & Avatar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFullName(user?.full_name || '');
                  setAvatarUrl(user?.avatar_url || '');
                  setSaveError(null);
                }}
                className="text-stone-500 hover:text-black text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {!isEditing ? (
            /* Read-Only Display Mode */
            <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Photo Display */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-100 border-2 border-stone-200 flex items-center justify-center shadow-xs">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif-editorial text-3xl font-semibold text-stone-700">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-500 block">
                      Full Name
                    </label>
                    <div className="mt-1 font-serif-editorial text-xl font-medium text-slate-900">
                      {user?.full_name || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-500 block">
                      Email Address
                    </label>
                    <div className="mt-1 font-mono text-sm text-stone-700">
                      {user?.email || 'Not specified'}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle className="h-3 w-3 text-emerald-700" />
                    Verified ATS Applicant Account
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Edit Profile & Avatar Form */
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
              {/* Avatar Selection & Upload Section */}
              <div>
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-700 block mb-2">
                  Profile Picture / Avatar
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Active Preview */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-100 border-2 border-stone-300 flex items-center justify-center shadow-md">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-serif-editorial text-3xl font-semibold text-stone-700">
                          {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs hover:bg-black cursor-pointer shadow-xs"
                        title="Remove custom avatar"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Upload Custom Image Button */}
                  <div className="space-y-2 text-center sm:text-left">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white hover:bg-stone-50 text-stone-800 rounded-none px-4 py-2 text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors border border-stone-300 shadow-2xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Photo from Computer</span>
                    </button>
                    <p className="text-[11px] text-stone-500 font-sans">
                      Supports JPG, PNG, WebP up to 2MB. Automatically centered and optimized.
                    </p>
                  </div>
                </div>

                {/* Preset Avatars Grid */}
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <span className="text-[11px] font-mono text-stone-500 block mb-2">
                    Or select from curated professional avatars:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatarUrl(av.url)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer p-0.5 ${
                          avatarUrl === av.url
                            ? 'border-black ring-2 ring-stone-400 scale-105'
                            : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                        }`}
                        title={av.label}
                      >
                        <img
                          src={av.url}
                          alt={av.label}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name Input */}
              <div className="pt-2">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-700 block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full sm:max-w-md h-10 px-3.5 rounded-lg border border-stone-300 bg-white text-sm text-slate-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="bg-black hover:bg-neutral-800 text-white rounded-none px-6 py-2.5 text-xs font-mono font-medium tracking-wide inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                >
                  <span className="text-[10px]">▪</span>
                  <span>{saveLoading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-mono text-stone-600 hover:text-black py-2 px-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. DATA PRIVACY & COMPLIANCE DISCLOSURE                                   */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <Shield className="h-5 w-5 text-stone-800" />
            <h2 className="font-serif-editorial text-2xl font-medium text-slate-900">
              Privacy Architecture & Security
            </h2>
          </div>
          <div className="mt-4 space-y-3 text-xs text-stone-600 font-sans leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-stone-800 shrink-0 mt-0.5" />
              <span><strong>Tenant Isolation:</strong> All resume records, versions, and job description comparisons are bound to your user ID and guarded by strict database ownership checks.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-stone-800 shrink-0 mt-0.5" />
              <span><strong>Zero Data Brokering:</strong> We never sell, scrape, or distribute your resume or profile data to third-party recruiters.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-stone-800 shrink-0 mt-0.5" />
              <span><strong>Instant Account Wipe:</strong> Deleting your account immediately purges all resumes, snapshots, parsed job descriptions, and scoring records in a single cascading operation.</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DANGER ZONE                                                            */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-rose-50/40 border border-rose-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-rose-200/60">
            <div>
              <h2 className="font-serif-editorial text-2xl font-medium text-rose-950">
                Danger Zone
              </h2>
              <p className="text-xs text-rose-700 font-sans mt-0.5">
                Permanently delete account and all associated resumes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="bg-rose-700 hover:bg-rose-800 text-white rounded-none px-4 py-2 text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
          <p className="mt-3 text-xs text-rose-800/80 font-sans leading-relaxed">
            Once you delete your account, there is no going back. Please be certain.
          </p>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Permanent Account Deletion"
        description="This action cannot be undone. All your resumes, ATS analyses, and career history will be permanently deleted."
      >
        <div className="space-y-4">
          <p className="text-xs text-stone-600">
            Type <strong className="font-mono text-rose-700 font-bold">DELETE</strong> to confirm account deletion:
          </p>
          <input
            type="text"
            placeholder="Type DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full h-10 px-3.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-rose-600 focus:border-rose-600"
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-xs font-mono px-4 py-2 border border-stone-300 rounded hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={confirmText !== 'DELETE' || deleteLoading}
              onClick={handleDeleteAccount}
              className="bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white rounded-none px-5 py-2 text-xs font-mono font-medium tracking-wide cursor-pointer transition-colors"
            >
              {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
