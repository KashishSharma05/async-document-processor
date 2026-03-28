import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useGetDocument } from "@workspace/api-client-react";
import { useSaveDocumentData, useExportFile } from "@/hooks/use-docflow";
import { ArrowLeft, Download, FileText, Calendar, HardDrive, Save, AlertCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const { data: document, isLoading } = useGetDocument(id, {
    query: { refetchInterval: (data) => (data?.status === 'processing' || data?.status === 'queued') ? 2000 : false }
  });
  
  const { mutate: saveDoc, isPending: isSaving } = useSaveDocumentData();
  const { exportFile } = useExportFile();

  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync editor with data when it loads
  useEffect(() => {
    if (document?.extractedData && !jsonText) {
      setJsonText(JSON.stringify(document.extractedData, null, 2));
    }
  }, [document?.extractedData, jsonText]);

  const handleSave = () => {
    try {
      setJsonError(null);
      const parsed = jsonText ? JSON.parse(jsonText) : null;
      saveDoc({ id, data: { extractedData: parsed } });
    } catch (e: any) {
      setJsonError("Invalid JSON: " + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 max-w-6xl mx-auto flex justify-center mt-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-muted rounded-xl mb-4"></div>
          <div className="h-6 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-10 text-center mt-20">
        <h2 className="text-2xl font-bold text-foreground">Document not found</h2>
        <button onClick={() => setLocation("/jobs")} className="mt-4 text-primary hover:underline">Return to jobs</button>
      </div>
    );
  }

  const isCompleted = document.status === "completed";

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => window.history.back()}
          className="p-2 border border-border/50 bg-card rounded-xl text-muted-foreground hover:text-foreground hover:shadow-sm transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground truncate">{document.filename}</h1>
            <StatusBadge status={document.status} className="hidden sm:flex" />
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-1">ID: {document.id}</p>
        </div>
        
        {isCompleted && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => exportFile(id, "csv", document.filename)}
              className="px-4 py-2 bg-card border border-border shadow-sm rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              CSV
            </button>
            <button 
              onClick={() => exportFile(id, "json", document.filename)}
              className="px-4 py-2 bg-card border border-border shadow-sm rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              JSON
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Col: Metadata */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Metadata</h3>
            <div className="space-y-4">
              <MetaItem icon={FileText} label="Type" value={document.mimeType} />
              <MetaItem icon={HardDrive} label="Size" value={`${(document.fileSize / 1024).toFixed(2)} KB`} />
              <MetaItem icon={Calendar} label="Uploaded" value={format(new Date(document.uploadedAt), "PPp")} />
              {document.processedAt && (
                <MetaItem icon={CheckCircle2Icon} label="Processed" value={format(new Date(document.processedAt), "PPp")} />
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Processing Progress</p>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    document.status === 'failed' ? 'bg-red-500' : 
                    document.status === 'completed' ? 'bg-emerald-500' : 
                    'bg-primary relative'
                  }`}
                  style={{ width: `${document.progress}%` }}
                />
              </div>
              {document.errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{document.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Extracted Data */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <h3 className="font-display font-bold text-foreground">Extracted Data</h3>
            <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted rounded">JSON Editor</span>
          </div>
          
          <div className="flex-1 p-0 relative min-h-[300px] bg-slate-950">
            {!isCompleted && document.status !== 'failed' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p>Extraction in progress...</p>
              </div>
            ) : (
              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  if (jsonError) setJsonError(null);
                }}
                spellCheck={false}
                className="w-full h-full p-6 bg-transparent text-slate-300 font-mono text-sm outline-none resize-none focus:ring-0 leading-relaxed"
                placeholder="{\n  // Extracted data will appear here\n}"
              />
            )}
          </div>
          
          {(isCompleted || document.status === 'failed') && (
            <div className="p-4 border-t border-border/50 bg-card/50 flex items-center justify-between">
              <div className="text-sm font-medium text-red-500 flex-1 px-4">
                {jsonError}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || !!jsonError || document.status !== 'completed'}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}

function CheckCircle2Icon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
