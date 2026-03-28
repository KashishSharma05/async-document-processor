import { Router, type IRouter } from "express";
import multer from "multer";
import { eq } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import {
  ListDocumentsResponse,
  GetDocumentResponse,
  UpdateDocumentBody,
  UpdateDocumentParams,
  RetryDocumentParams,
  ExportDocumentParams,
  ExportDocumentQueryParams,
  GetStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Simulate async processing
function simulateProcessing(docId: number) {
  const steps = [20, 40, 60, 80, 100];
  let stepIndex = 0;

  const interval = setInterval(async () => {
    if (stepIndex >= steps.length) {
      clearInterval(interval);
      return;
    }

    const progress = steps[stepIndex];
    stepIndex++;

    try {
      if (progress < 100) {
        await db
          .update(documentsTable)
          .set({ status: "processing", progress })
          .where(eq(documentsTable.id, docId));
      } else {
        const extractedData = {
          title: `Extracted Document #${docId}`,
          author: "Auto Extracted",
          date: new Date().toISOString().split("T")[0],
          pageCount: Math.floor(Math.random() * 20) + 1,
          wordCount: Math.floor(Math.random() * 5000) + 500,
          language: "English",
          summary: "This document was automatically processed and data was extracted.",
          keywords: ["document", "processing", "extracted", "data"],
          confidence: (Math.random() * 0.2 + 0.8).toFixed(2),
        };

        // 10% chance to simulate failure
        const failed = Math.random() < 0.1;

        if (failed) {
          await db
            .update(documentsTable)
            .set({
              status: "failed",
              progress: 100,
              errorMessage: "Processing failed: Unable to parse document structure",
              processedAt: new Date(),
            })
            .where(eq(documentsTable.id, docId));
        } else {
          await db
            .update(documentsTable)
            .set({
              status: "completed",
              progress: 100,
              extractedData,
              processedAt: new Date(),
            })
            .where(eq(documentsTable.id, docId));
        }
      }
    } catch {
      clearInterval(interval);
    }
  }, 2000);
}

function formatDoc(doc: typeof documentsTable.$inferSelect) {
  return {
    id: String(doc.id),
    filename: doc.filename,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    status: doc.status,
    progress: doc.progress,
    uploadedAt: doc.uploadedAt.toISOString(),
    processedAt: doc.processedAt ? doc.processedAt.toISOString() : null,
    extractedData: doc.extractedData ?? null,
    errorMessage: doc.errorMessage ?? null,
  };
}

// GET /api/documents
router.get("/documents", async (_req, res) => {
  try {
    const docs = await db.select().from(documentsTable).orderBy(documentsTable.uploadedAt);
    const response = ListDocumentsResponse.parse(docs.map(formatDoc));
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/documents
router.post("/documents", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const [doc] = await db
      .insert(documentsTable)
      .values({
        filename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: "queued",
        progress: 0,
      })
      .returning();

    // Start async processing after a short delay
    setTimeout(() => simulateProcessing(doc.id), 1500);

    const response = GetDocumentResponse.parse(formatDoc(doc));
    res.status(201).json(response);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/documents/:id
router.get("/documents/:id", async (req, res) => {
  try {
    const { id } = GetDocumentParams.parse({ id: req.params.id });
    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, Number(id)));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    const response = GetDocumentResponse.parse(formatDoc(doc));
    res.json(response);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/documents/:id
router.patch("/documents/:id", async (req, res) => {
  try {
    const { id } = UpdateDocumentParams.parse({ id: req.params.id });
    const body = UpdateDocumentBody.parse(req.body);

    const [doc] = await db
      .update(documentsTable)
      .set({ extractedData: body.extractedData ?? undefined })
      .where(eq(documentsTable.id, Number(id)))
      .returning();

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(formatDoc(doc));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/documents/:id/retry
router.post("/documents/:id/retry", async (req, res) => {
  try {
    const { id } = RetryDocumentParams.parse({ id: req.params.id });

    const [doc] = await db
      .update(documentsTable)
      .set({ status: "queued", progress: 0, errorMessage: null, processedAt: null })
      .where(eq(documentsTable.id, Number(id)))
      .returning();

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    setTimeout(() => simulateProcessing(Number(id)), 1500);

    res.json(formatDoc(doc));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/documents/:id/export
router.get("/documents/:id/export", async (req, res) => {
  try {
    const { id } = ExportDocumentParams.parse({ id: req.params.id });
    const { format } = ExportDocumentQueryParams.parse(req.query);

    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, Number(id)));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    const data = {
      id: String(doc.id),
      filename: doc.filename,
      status: doc.status,
      uploadedAt: doc.uploadedAt.toISOString(),
      extractedData: doc.extractedData,
    };

    if (format === "csv") {
      const flat = doc.extractedData
        ? Object.entries(doc.extractedData as Record<string, unknown>).map(([k, v]) => `${k},${v}`).join("\n")
        : "";
      const csv = `Field,Value\nid,${data.id}\nfilename,${data.filename}\nstatus,${data.status}\nuploadedAt,${data.uploadedAt}\n${flat}`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${doc.filename}.csv"`);
      return res.send(csv);
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats
router.get("/stats", async (_req, res) => {
  try {
    const docs = await db.select().from(documentsTable);
    const stats = {
      total: docs.length,
      queued: docs.filter((d) => d.status === "queued").length,
      processing: docs.filter((d) => d.status === "processing").length,
      completed: docs.filter((d) => d.status === "completed").length,
      failed: docs.filter((d) => d.status === "failed").length,
    };

    const response = GetStatsResponse.parse(stats);
    res.json(response);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
