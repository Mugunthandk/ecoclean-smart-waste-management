import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, MapPin, Trash2, Upload, X, CheckCircle2, Loader2, AlertCircle, Sparkles, ExternalLink, ShieldAlert } from 'lucide-react';
import { User } from '../types';
import { cn } from '../utils';
import { analyzeWaste } from '../services/gemini';

interface ReportProps {
  user: User | null;
}

export default function Report({ user }: ReportProps) {
  const [image, setImage] = useState<string | null>(null);
  const [areaName, setAreaName] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [suggestedAction, setSuggestedAction] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        
        // Auto-analyze using Gemini
        setIsClassifying(true);
        setError('');
        try {
          const analysis = await analyzeWaste(base64, description);
          setWasteType(analysis.wasteType);
          setPriority(analysis.priority);
          setSuggestedAction(analysis.suggestedAction);
        } catch (err) {
          console.error(err);
        } finally {
          setIsClassifying(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }, (err) => {
        setError("Could not detect location. Please enter manually.");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload a photo of the garbage.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          user_name: user?.name,
          area_name: areaName,
          location,
          lat,
          lng,
          description,
          image,
          waste_type: wasteType,
          priority,
          suggested_action: suggestedAction
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-600 w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
          <p className="text-slate-600">Thank you for helping keep the city clean.</p>
          <p className="text-slate-400 text-sm mt-4">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">Report Garbage</h1>
        <p className="text-slate-600">Provide details about the garbage problem you've spotted.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-10">
        {/* Left Column: Image Upload */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
              image ? "border-primary" : "border-slate-300 hover:border-primary hover:bg-emerald-50"
            )}
          >
            {image ? (
              <>
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="bg-white p-3 rounded-full shadow-lg">
                    <Camera className="text-primary w-6 h-6" />
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImage(null); setWasteType(''); }}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-red-500 shadow-md hover:bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <div className="bg-slate-100 p-6 rounded-full mb-4 group-hover:bg-emerald-100 transition-colors">
                  <Camera className="text-slate-400 group-hover:text-primary w-10 h-10" />
                </div>
                <p className="text-slate-600 font-semibold">Click to take a photo</p>
                <p className="text-slate-400 text-sm mt-1">or drag and drop</p>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </div>

          <AnimatePresence>
            {isClassifying && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100"
              >
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-emerald-700 text-sm font-medium">AI is classifying waste type...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {wasteType && !isClassifying && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 p-6 rounded-3xl space-y-4 text-white shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">AI Analysis</div>
                    <div className="text-lg font-bold">{wasteType} Waste</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={async () => {
                    if (!image) return;
                    setIsClassifying(true);
                    try {
                      const analysis = await analyzeWaste(image, description);
                      setWasteType(analysis.wasteType);
                      setPriority(analysis.priority);
                      setSuggestedAction(analysis.suggestedAction);
                    } catch (err) { console.error(err); }
                    finally { setIsClassifying(false); }
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-primary"
                  title="Re-analyze with description"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Priority</div>
                  <div className={cn(
                    "text-sm font-bold px-2 py-1 rounded-lg inline-block",
                    priority === 'High' ? "bg-red-500/20 text-red-400" :
                    priority === 'Medium' ? "bg-amber-500/20 text-amber-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {priority} Priority
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Action</div>
                  <div className="text-sm text-slate-300 font-medium">{suggestedAction}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Area Name</label>
            <div className="relative">
              <Trash2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                required
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Karur Bus Stand"
                className="input-field pl-12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Address / Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Street name or landmark"
                className="input-field pl-12"
              />
              <button 
                type="button"
                onClick={detectLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-dark"
              >
                Detect GPS
              </button>
            </div>
          </div>

          {lat && lng && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Latitude</div>
                <div className="text-sm font-mono text-slate-600">{lat.toFixed(6)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Longitude</div>
                <div className="text-sm font-mono text-slate-600">{lng.toFixed(6)}</div>
              </div>
            </div>
          )}

          {lat && lng && (
            <div className="mt-2">
              <a 
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                View on Google Maps
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about the issue (e.g. overflowing bin, construction waste)"
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Waste Category (Optional)</label>
            <select 
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              className="input-field appearance-none"
            >
              <option value="">Select Category</option>
              <option value="Plastic">Plastic</option>
              <option value="Organic">Organic</option>
              <option value="Paper">Paper</option>
              <option value="Metal">Metal</option>
              <option value="Glass">Glass</option>
              <option value="Electronic">Electronic</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isClassifying}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
