import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Trash2, 
  PlusCircle,
  ChevronRight,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { User, Complaint } from '../types';
import { cn } from '../utils';

interface UserDashboardProps {
  user: User | null;
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchComplaints = async () => {
      try {
        const res = await fetch(`/api/complaints?user_id=${user.id}`);
        const data = await res.json();
        setComplaints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    completed: complaints.filter(c => c.status === 'Completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">My Dashboard</h1>
          <p className="text-slate-600">Track and manage your garbage reports.</p>
        </div>
        <Link to="/report" className="btn-primary flex items-center justify-center gap-2">
          <PlusCircle className="w-5 h-5" /> New Report
        </Link>
      </div>

      {/* Stats Summary Box */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Reports</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cleaned</div>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="text-slate-300 w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No reports yet</h3>
          <p className="text-slate-500 mb-8">You haven't submitted any garbage reports yet. Start by reporting an issue in your area.</p>
          <Link to="/report" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Submit Your First Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {complaints.map((complaint, i) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={complaint.image} 
                  alt="Garbage" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 backdrop-blur-md",
                    getStatusClass(complaint.status)
                  )}>
                    {getStatusIcon(complaint.status)}
                    {complaint.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm">
                    {complaint.waste_type || 'Unclassified'}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm",
                    complaint.priority === 'High' ? "bg-red-500/80 text-white" :
                    complaint.priority === 'Medium' ? "bg-amber-500/80 text-white" :
                    "bg-emerald-500/80 text-white"
                  )}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(complaint.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{complaint.area_name || 'Unnamed Area'}</h3>
                <div className="flex items-center justify-between text-slate-500 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="line-clamp-1">{complaint.location}</span>
                  </div>
                  {complaint.lat && complaint.lng && (
                    <a 
                      href={`https://www.google.com/maps?q=${complaint.lat},${complaint.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: #{complaint.id}</span>
                  <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
