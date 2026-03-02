import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  Trash2, 
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Loader2,
  Map as MapIcon,
  X,
  Calendar,
  MapPin,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { User, Complaint, Stats } from '../types';
import { cn } from '../utils';

// Fix for Leaflet default icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function StatCard({ stat }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${stat.color} p-3 rounded-2xl text-white transition-transform group-hover:scale-110`}>
          {stat.icon}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live</span>
          <Info className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
      <div className="text-sm text-slate-500 mt-1">{stat.label}</div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 right-0 -bottom-2 translate-y-full z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl pointer-events-none"
          >
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-sm font-medium mb-2">Count: <span className="text-primary">{stat.value}</span></div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {stat.description}
            </p>
            {/* Tooltip Arrow */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AdminDashboardProps {
  user: User | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [complaintsRes, statsRes] = await Promise.all([
          fetch('/api/complaints?role=admin'),
          fetch('/api/stats')
        ]);
        
        const complaintsData = await complaintsRes.json();
        const statsData = await statsRes.json();
        
        setComplaints(complaintsData);
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setComplaints(complaints.map(c => c.id === id ? { ...c, status: status as any } : c));
        // Refresh stats
        const statsRes = await fetch('/api/stats');
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComplaints = filter === 'All' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  const chartData = [
    { name: 'Pending', value: stats?.pending || 0, color: '#94a3b8' },
    { name: 'In Progress', value: stats?.inProgress || 0, color: '#f59e0b' },
    { name: 'Completed', value: stats?.completed || 0, color: '#10b981' },
  ];

  // Map center logic
  const mapComplaints = complaints.filter(c => c.lat && c.lng);
  const defaultCenter: [number, number] = mapComplaints.length > 0 
    ? [mapComplaints[0].lat!, mapComplaints[0].lng!] 
    : [20.5937, 78.9629]; // India center as fallback

  const priorityData = [
    { name: 'High', value: complaints.filter(c => c.priority === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: complaints.filter(c => c.priority === 'Low').length, color: '#10b981' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">Admin Command Center</h1>
        <p className="text-slate-600">Monitor and manage city-wide waste reports.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Reports', value: stats?.total, icon: <Trash2 className="w-6 h-6" />, color: 'bg-blue-500', description: 'Total number of garbage reports submitted by citizens across all categories.' },
          { label: 'Pending', value: stats?.pending, icon: <Clock className="w-6 h-6" />, color: 'bg-slate-400', description: 'New reports that are currently awaiting initial review and assignment.' },
          { label: 'In Progress', value: stats?.inProgress, icon: <AlertCircle className="w-6 h-6" />, color: 'bg-amber-500', description: 'Reports that have been assigned and are currently being cleaned by the crew.' },
          { label: 'Completed', value: stats?.completed, icon: <CheckCircle2 className="w-6 h-6" />, color: 'bg-emerald-500', description: 'Successfully resolved reports where the garbage has been cleared and verified.' },
        ].map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary" />
              Garbage Hotspots
            </h3>
            <span className="text-xs text-slate-500 font-medium">{mapComplaints.length} locations mapped</span>
          </div>
          <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-100">
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapComplaints.map((c) => (
                <Marker 
                  key={c.id} 
                  position={[c.lat!, c.lng!]}
                  eventHandlers={{
                    click: () => setSelectedComplaint(c),
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <div className="font-bold text-slate-900 mb-1">{c.waste_type} Waste</div>
                      <p className="text-xs text-slate-600 mb-2 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                        <span>By {c.user_name}</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded",
                          c.priority === 'High' ? 'bg-red-50 text-red-600' :
                          c.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        )}>{c.priority}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-3">
                        <span className="text-primary">{c.status}</span>
                        {c.lat && c.lng && (
                          <a 
                            href={`https://www.google.com/maps?q=${c.lat},${c.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-0.5 hover:underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Maps
                          </a>
                        )}
                      </div>
                      <button 
                        onClick={() => setSelectedComplaint(c)}
                        className="w-full py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        View Full Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Status Distribution</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Priority Distribution</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">All Reports</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm font-semibold text-slate-600 bg-slate-50 border-none rounded-lg px-3 py-1 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Area / Location</th>
                <th className="px-6 py-4">Waste Type</th>
                <th className="px-6 py-4">Priority Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{c.user_name}</div>
                    <div className="text-xs text-slate-400">ID: #{c.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{c.area_name || 'Unnamed Area'}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[150px]">{c.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                      {c.waste_type || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm",
                      c.priority === 'High' ? 'bg-red-500 text-white' :
                      c.priority === 'Medium' ? 'bg-amber-500 text-white' :
                      'bg-emerald-500 text-white'
                    )}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value)}
                      className={cn(
                        "text-xs font-bold px-3 py-1 rounded-full border outline-none",
                        c.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        c.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-700 border-slate-100'
                      )}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative h-64 sm:h-80">
                <img 
                  src={selectedComplaint.image} 
                  alt="Garbage" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-slate-900 shadow-lg hover:bg-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-md",
                    selectedComplaint.status === 'Completed' ? 'bg-emerald-50/90 text-emerald-700 border-emerald-100' :
                    selectedComplaint.status === 'In Progress' ? 'bg-amber-50/90 text-amber-700 border-amber-100' :
                    'bg-slate-50/90 text-slate-700 border-slate-100'
                  )}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reporter</div>
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-slate-600" />
                      </div>
                      <span className="text-lg font-bold text-slate-900">{selectedComplaint.user_name}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Priority Score</div>
                      <span className={cn(
                        "px-3 py-1 rounded-lg font-bold text-sm shadow-sm",
                        selectedComplaint.priority === 'High' ? "bg-red-500 text-white" :
                        selectedComplaint.priority === 'Medium' ? "bg-amber-500 text-white" :
                        "bg-emerald-500 text-white"
                      )}>
                        {selectedComplaint.priority}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Waste Type</div>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-bold text-sm">
                        {selectedComplaint.waste_type || 'Other'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Area Name</div>
                      <div className="text-lg font-bold text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {selectedComplaint.area_name || 'Unnamed Area'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</div>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                        {selectedComplaint.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Suggested Action</div>
                      <p className="text-primary leading-relaxed bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-sm font-medium">
                        {selectedComplaint.suggested_action || "Routine cleanup required."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Latitude</div>
                        <div className="text-xs font-mono text-slate-600">{selectedComplaint.lat?.toFixed(6)}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Longitude</div>
                        <div className="text-xs font-mono text-slate-600">{selectedComplaint.lng?.toFixed(6)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Location</div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm truncate">{selectedComplaint.location}</span>
                        {selectedComplaint.lat && selectedComplaint.lng && (
                          <a 
                            href={`https://www.google.com/maps?q=${selectedComplaint.lat},${selectedComplaint.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Reported On</div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm">{new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => setSelectedComplaint(null)}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <select 
                    value={selectedComplaint.status}
                    onChange={(e) => {
                      updateStatus(selectedComplaint.id, e.target.value);
                      setSelectedComplaint({ ...selectedComplaint, status: e.target.value as any });
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold outline-none cursor-pointer hover:bg-primary-dark transition-colors"
                  >
                    <option value="Pending">Set Pending</option>
                    <option value="In Progress">Set In Progress</option>
                    <option value="Completed">Set Completed</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
