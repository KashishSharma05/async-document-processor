import { useState } from "react";
import { useListDocuments } from "@workspace/api-client-react";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { useRetryJob } from "@/hooks/use-docflow";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["All", "Processing", "Completed", "Failed", "Queued"];

export default function Jobs() {
  const [activeTab, setActiveTab] = useState("All");
  const { data: documents, isLoading } = useListDocuments({
    query: { refetchInterval: 2000 } // Poll every 2s
  });
  
  const { mutate: retryDoc, isPending: isRetrying } = useRetryJob();

  const filteredDocs = documents?.filter(doc => 
    activeTab === "All" ? true : doc.status.toLowerCase() === activeTab.toLowerCase()
  ) || [];

  const processingCount = documents?.filter(d => d.status === 'processing').length || 0;

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Processing Jobs</h1>
        <p className="text-muted-foreground mt-1 text-lg">Live status of your document extraction queue.</p>
      </div>

      <div className="bg-card border border-border/60 shadow-lg shadow-black/5 rounded-2xl flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Tabs */}
        <div className="px-6 py-4 border-b border-border/60 flex items-center gap-3 overflow-x-auto bg-card/80 backdrop-blur sticky top-0 z-20">
          {TABS.map(tab => {
            const count = tab === "All" 
              ? documents?.length 
              : documents?.filter(d => d.status.toLowerCase() === tab.toLowerCase()).length;
              
            const isProcessing = tab === "Processing" && processingCount > 0;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 group active:scale-[0.97] select-none ${
                  activeTab === tab 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {isProcessing && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping absolute top-1 right-1"></span>
                )}
                {isProcessing && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-1 right-1"></span>
                )}
                {tab}
                {count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === tab ? 'bg-white/20' : 'bg-background shadow-sm border border-border/50 group-hover:border-border'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-muted/40 backdrop-blur-md z-10">
              <tr className="border-b border-border/60">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Document ID & Name</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest w-64">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Uploaded</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading && !documents ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-l-2 border-transparent">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-muted animate-pulse shrink-0"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted animate-pulse rounded-lg w-40"></div>
                          <div className="h-3 bg-muted animate-pulse rounded-lg w-24 opacity-60"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-7 bg-muted animate-pulse rounded-full w-24"></div></td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="h-3 bg-muted animate-pulse rounded-lg w-10"></div>
                        <div className="h-2.5 bg-muted animate-pulse rounded-full w-full"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted animate-pulse rounded-lg w-28"></div></td>
                    <td className="px-6 py-5 text-right"><div className="h-9 bg-muted animate-pulse rounded-xl w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                      <ListTree className="w-10 h-10 opacity-50" />
                    </div>
                    <p className="text-xl font-bold text-foreground">No jobs found</p>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">There are no jobs matching the "{activeTab}" filter at the moment.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredDocs.map((doc, index) => (
                    <motion.tr 
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="hover:bg-muted/40 transition-all duration-150 group border-l-2 border-transparent hover:border-primary/40"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground truncate max-w-[250px]">{doc.filename}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1 opacity-70">id: {doc.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-foreground">{doc.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border/30 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 relative ${
                                doc.status === 'failed' ? 'bg-red-500' : 
                                doc.status === 'completed' ? 'bg-emerald-500' : 
                                'bg-gradient-to-r from-indigo-500 to-violet-500'
                              }`}
                              style={{ width: `${doc.progress}%` }}
                            >
                              {doc.status === 'processing' && (
                                <div className="absolute inset-0 overflow-hidden rounded-full">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.8s_ease-in-out_infinite]"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-3 items-center">
                          {doc.status === 'failed' && (
                            <button 
                              onClick={() => retryDoc({ id: doc.id })}
                              disabled={isRetrying}
                              className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-150 shadow-sm border border-transparent hover:border-red-200 active:scale-90 select-none"
                              title="Retry Job"
                            >
                              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                            </button>
                          )}
                          <Link 
                            href={`/documents/${doc.id}`}
                            className="px-4 py-2 bg-background border border-border hover:border-primary/50 hover:bg-primary/5 text-sm font-bold rounded-xl shadow-sm hover:shadow active:scale-[0.96] transition-all duration-150 select-none"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ListTree(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12h-8"/><path d="M21 6H8"/><path d="M21 18h-8"/><path d="M12 12s-3 0-3-3"/><path d="M12 18s-3 0-3-3"/><path d="M3 6v12"/><path d="M3 18h3"/>
    </svg>
  );
}
