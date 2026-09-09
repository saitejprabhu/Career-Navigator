import type { TextItem } from "pdfjs-dist/types/src/display/api";

interface PositionedItem {
  str: string;
  x: number;
  y: number;
}

function groupIntoColumns(items: PositionedItem[]): PositionedItem[][] {
  if (items.length === 0) return [];
  const xs = items.map((i) => i.x).sort((a, b) => a - b);

  // find the biggest horizontal gap in x-positions to guess a column split
  let maxGap = 0;
  let splitAt = -1;
  for (let i = 1; i < xs.length; i++) {
    const gap = xs[i] - xs[i - 1];
    if (gap > maxGap) {
      maxGap = gap;
      splitAt = xs[i];
    }
  }

  // only treat it as multi-column if the gap is meaningfully large
  if (splitAt === -1 || maxGap < 60) return [items];

  const left = items.filter((i) => i.x < splitAt);
  const right = items.filter((i) => i.x >= splitAt);
  return [left, right];
}

function sortColumnTopToBottom(items: PositionedItem[]): string {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  let text = "";
  let lastY: number | null = null;
  for (const item of sorted) {
    if (lastY !== null && Math.abs(item.y - lastY) > 4) text += "\n";
    text += item.str + " ";
    lastY = item.y;
  }
  return text;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const items: PositionedItem[] = content.items.map((raw) => {
        const item = raw as TextItem;
        return { str: item.str, x: item.transform[4], y: item.transform[5] };
      });

      const columns = groupIntoColumns(items);
      // read left column fully, then right column, matching visual reading order
      for (const col of columns) {
        fullText += sortColumnTopToBottom(col) + "\n\n";
      }
    }

    return fullText;
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX.");
}
