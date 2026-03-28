import { useGetStats, useListDocuments } from "@workspace/api-client-react";
import { FileText, Loader2, CheckCircle2, AlertCircle, ArrowRight, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Simple animated counter component
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    let totalDuration = 1000;
    let incrementTime = (totalDuration / end);
    
    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetStats({
    query: { refetchInterval: 5000 }
  });
  
  const { data: documents, isLoading: isDocsLoading } = useListDocuments({
    query: { refetchInterval: 5000 }
  });

  const recentDocs = documents?.slice(0, 5) || [];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Overview of your document processing operations.</p>
        </div>
        <Link href="/upload" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300">
          <FileText className="w-5 h-5" />
          Process New Document
        </Link>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Total Documents" 
            value={stats?.total} 
            icon={FileText} 
            isLoading={isStatsLoading} 
            colorClass="text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400"
            gradientClass="from-indigo-500 to-blue-500"
            trend="+12%"
            trendUp={true}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Processing" 
            value={stats?.processing} 
            icon={Activity} 
            isLoading={isStatsLoading} 
            colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
            gradientClass="from-blue-500 to-cyan-500"
            animateIcon
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Completed" 
            value={stats?.completed} 
            icon={CheckCircle2} 
            isLoading={isStatsLoading} 
            colorClass="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
            gradientClass="from-emerald-500 to-teal-500"
            trend="+8%"
            trendUp={true}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Failed" 
            value={stats?.failed} 
            icon={AlertCircle} 
            isLoading={isStatsLoading} 
            colorClass="text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
            gradientClass="from-red-500 to-orange-500"
            trend="-2%"
            trendUp={false}
          />
        </motion.div>
      </motion.div>

      {/* Recent Documents Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-card border border-border/60 shadow-lg shadow-black/5 rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between bg-card/80 backdrop-blur-md">
          <h2 className="text-xl font-bold font-display text-foreground">Recent Activity</h2>
          <Link href="/jobs" className="text-sm font-semibold text-primary hover:text-indigo-700 flex items-center gap-1.5 group px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
            View all jobs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/40 border-b border-border/60 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Document</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isDocsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><div className="h-5 bg-muted animate-pulse rounded w-3/4"></div></td>
                    <td className="px-6 py-5"><div className="h-5 bg-muted animate-pulse rounded w-1/2"></div></td>
                    <td className="px-6 py-5"><div className="h-6 bg-muted animate-pulse rounded-full w-24"></div></td>
                    <td className="px-6 py-5"><div className="h-2 bg-muted animate-pulse rounded-full w-full"></div></td>
                    <td className="px-6 py-5"><div className="h-9 bg-muted animate-pulse rounded-xl w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : recentDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="font-semibold text-foreground text-lg">No documents yet</p>
                    <p className="text-sm mt-1 max-w-sm mx-auto">Upload your first document to automatically extract and process its data.</p>
                  </td>
                </tr>
              ) : (
                recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md transition-all duration-300">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground uppercase font-medium mt-0.5">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-5 w-1/4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground">{doc.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              doc.status === 'failed' ? 'bg-red-500' : 
                              doc.status === 'completed' ? 'bg-emerald-500' : 
                              'bg-gradient-to-r from-indigo-500 to-violet-500 relative'
                            }`}
                            style={{ width: `${doc.progress}%` }}
                          >
                            {doc.status === 'processing' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/documents/${doc.id}`}
                        className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-xl bg-background border border-border text-foreground hover:bg-primary hover:text-white hover:border-primary shadow-sm hover:shadow transition-all duration-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  isLoading, 
  colorClass,
  gradientClass,
  animateIcon = false,
  trend,
  trendUp
}: { 
  title: string, 
  value?: number, 
  icon: any, 
  isLoading: boolean, 
  colorClass: string,
  gradientClass: string,
  animateIcon?: boolean,
  trend?: string,
  trendUp?: boolean
}) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden h-full flex flex-col">
      {/* Top Gradient Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradientClass} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
      
      {/* Background decoration */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} opacity-5 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
      
      <div className="flex justify-between items-start mb-6 relative">
        <div className={`p-3.5 rounded-2xl ${colorClass} ring-1 ring-black/5 dark:ring-white/10 shadow-sm`}>
          <Icon className={`w-6 h-6 ${animateIcon ? 'animate-pulse' : ''}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-400'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      
      <div className="relative mt-auto">
        {isLoading ? (
          <div className="h-10 bg-muted animate-pulse rounded-xl w-20 mb-2"></div>
        ) : (
          <h3 className="text-4xl font-display font-bold text-foreground tracking-tight mb-1">
            <AnimatedCounter value={value ?? 0} />
          </h3>
        )}
        <p className="text-sm text-muted-foreground font-semibold">{title}</p>
      </div>
    </div>
  );
}
