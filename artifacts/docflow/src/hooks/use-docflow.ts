import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

  return useUploadDocument({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        toast.success("Document uploaded", {
          description: "Queued for processing. You can track progress in Jobs.",
          duration: 4000,
        });
      },
      onError: (err: any) => {
        toast.error("Upload failed", {
          description: err?.message || "There was an error uploading the document.",
          duration: 5000,
        });
      },
    },
  });
}

export function useSaveDocumentData() {
  const qc = useQueryClient();

  return useUpdateDocument({
    mutation: {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetDocumentQueryKey(data.id) });
        qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        toast.success("Changes saved", {
          description: "Extracted document data has been updated.",
          duration: 3000,
        });
      },
      onError: (err: any) => {
        toast.error("Save failed", {
          description: err?.message || "Could not save the document data.",
          duration: 5000,
        });
      },
    },
  });
}

export function useRetryJob() {
  const qc = useQueryClient();

  return useRetryDocument({
    mutation: {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetDocumentQueryKey(data.id) });
        qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        toast.success("Job requeued", {
          description: "The document has been added back to the processing queue.",
          duration: 3000,
        });
      },
      onError: (err: any) => {
        toast.error("Retry failed", {
          description: err?.message || "Could not retry the job.",
          duration: 5000,
        });
      },
    },
  });
}

export function useExportFile() {
  const handleExport = async (id: string, format: "json" | "csv", filename: string) => {
    const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);
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

      toast.success("Export complete", {
        id: toastId,
        description: `File downloaded as .${format}`,
        duration: 3000,
      });
    } catch (err: any) {
      toast.error("Export failed", {
        id: toastId,
        description: err?.message || "Could not export document data.",
        duration: 5000,
      });
    }
  };

  return { exportFile: handleExport };
}
