import { Badge } from "@/components/ui/badge";
import { DocumentStatus } from "@workspace/api-client-react";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: DocumentStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className={`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50 gap-1.5 py-1.5 px-3 font-semibold shadow-sm ${className || ''}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className={`bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50 gap-2 py-1.5 px-3 font-semibold shadow-sm overflow-hidden relative ${className || ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          <div className="relative flex items-center justify-center w-3.5 h-3.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin absolute text-indigo-600 dark:text-indigo-400" />
            <div className="absolute w-full h-full bg-indigo-500 rounded-full animate-ping opacity-25"></div>
          </div>
          <span className="relative z-10">Processing</span>
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className={`bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50 gap-1.5 py-1.5 px-3 font-semibold shadow-sm ${className || ''}`}>
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </Badge>
      );
    case "queued":
    default:
      return (
        <Badge variant="outline" className={`bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 gap-1.5 py-1.5 px-3 font-semibold shadow-sm ${className || ''}`}>
          <Clock className="w-3.5 h-3.5" />
          Queued
        </Badge>
      );
  }
}
