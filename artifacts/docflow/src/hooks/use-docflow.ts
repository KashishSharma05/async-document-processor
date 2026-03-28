import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  useUploadDocument,
  useUpdateDocument,
  useRetryDocument,
  getListDocumentsQueryKey,
  getGetStatsQueryKey,
  getGetDocumentQueryKey,
  exportDocument,
} from "@workspace/api-client-react";

/**
 * Custom wrappers around the generated orval API hooks
 * to automatically handle cache invalidation and toasts.
 */

export function useUploadFile() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useUploadDocument({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        toast({
          title: "Document Uploaded",
          description: "Your document has been successfully queued for processing.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Upload Failed",
          description: err?.message || "There was an error uploading the document.",
          variant: "destructive",
        });
      },
    },
  });
}

export function useSaveDocumentData() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useUpdateDocument({
    mutation: {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetDocumentQueryKey(data.id) });
        qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        toast({
          title: "Data Saved",
          description: "Document extracted data has been updated.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Save Failed",
          description: err?.message || "Could not save the document data.",
          variant: "destructive",
        });
      },
    },
  });
}

export function useRetryJob() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useRetryDocument({
    mutation: {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetDocumentQueryKey(data.id) });
        qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        toast({
          title: "Job Retried",
          description: "The document processing job has been requeued.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Retry Failed",
          description: err?.message || "Could not retry the job.",
          variant: "destructive",
        });
      },
    },
  });
}

export function useExportFile() {
  const { toast } = useToast();

  const handleExport = async (id: string, format: "json" | "csv", filename: string) => {
    try {
      const result = await exportDocument(id, { format });
      
      const content = typeof result === "string" 
        ? result 
        : JSON.stringify(result, null, 2);
      
      const blob = new Blob([content], { 
        type: format === "json" ? "application/json" : "text/csv" 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename.replace(/\.[^/.]+$/, "")}-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `Downloaded as ${format.toUpperCase()}`,
      });
    } catch (err: any) {
      toast({
        title: "Export Failed",
        description: err?.message || "Could not export document data.",
        variant: "destructive",
      });
    }
  };

  return { exportFile: handleExport };
}
