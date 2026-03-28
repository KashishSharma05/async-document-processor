import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, CheckCircle, FileText, FileImage, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUploadFile } from "@/hooks/use-docflow";
import { useLocation } from "wouter";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const { mutate: uploadDoc, isPending } = useUploadFile();
  const [, setLocation] = useLocation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = () => {
    if (!file) return;
    
    uploadDoc({ data: { file } }, {
      onSuccess: () => {
        setLocation("/jobs");
      }
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-10 h-10 text-red-500" />;
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return <FileImage className="w-10 h-10 text-emerald-500" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-10 h-10 text-blue-500" />;
    return <FileIcon className="w-10 h-10 text-primary" />;
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-4xl mx-auto min-h-[calc(100vh-5rem)] flex flex-col justify-center py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight mb-3">Upload Document</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">Submit files for intelligent data extraction and automated processing.</p>
      </div>

      <div className="bg-card border border-border/60 shadow-xl shadow-black/5 rounded-[2rem] p-6 md:p-12 relative overflow-hidden">
        {/* Subtle top border gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              {...getRootProps()}
              className={`
                relative group border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer
                transition-all duration-500 ease-in-out flex flex-col items-center justify-center min-h-[400px]
                ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/30"}
              `}
            >
              <input {...getInputProps()} />
              
              {/* Animated background dots */}
              <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] pointer-events-none transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              <div className="relative z-10">
                <div className={`
                  w-24 h-24 rounded-full mb-8 mx-auto flex items-center justify-center
                  transition-all duration-500 ease-out
                  ${isDragActive ? "bg-primary text-white scale-110 shadow-2xl shadow-primary/40 rotate-6" : "bg-indigo-50 dark:bg-indigo-900/30 text-primary group-hover:scale-110 group-hover:bg-indigo-100 group-hover:shadow-xl shadow-black/5"}
                `}>
                  <UploadCloud className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold font-display text-foreground mb-3">
                  {isDragActive ? "Drop to upload now!" : "Select or drag file"}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-base">
                  Upload PDF, PNG, JPG, or DOCX files. Maximum file size 50MB.
                </p>
                <span className="inline-flex items-center gap-2 bg-foreground text-background shadow-lg px-8 py-3.5 rounded-xl text-sm font-bold group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <Sparkles className="w-4 h-4" />
                  Browse Files
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[400px] flex flex-col items-center justify-center"
            >
              <div className="bg-gradient-to-br from-background to-muted border border-border/60 rounded-3xl p-10 w-full max-w-lg relative shadow-2xl shadow-black/5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPending) setFile(null);
                  }}
                  disabled={isPending}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-2xl bg-white dark:bg-card shadow-lg shadow-black/5 border border-border flex items-center justify-center mb-6 relative">
                    {getFileIcon(file.name)}
                    {isPending && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <UploadCloud className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2 truncate w-full px-4" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-sm font-medium text-muted-foreground mb-10 px-4 py-1.5 bg-muted rounded-full">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  {/* Processing Steps */}
                  {isPending && (
                    <div className="w-full mb-8 space-y-3">
                      <div className="flex items-center gap-3 text-sm font-medium text-primary">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Uploading file...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground opacity-50">
                        <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>Extracting data...</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 active:translate-y-0.5 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    {isPending ? (
                      <>
                        <UploadCloud className="w-6 h-6 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Confirm & Process
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
