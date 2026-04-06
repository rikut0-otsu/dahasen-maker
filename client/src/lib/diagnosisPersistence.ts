import type { Answer, AxisResult, IndicatorScores } from "@/hooks/useDiagnosis";
import { ApiError, saveDiagnosisResult } from "@/lib/api";

const PENDING_DIAGNOSIS_RESULTS_KEY = "pending_diagnosis_results_v1";
const SAVE_RETRY_DELAYS_MS = [0, 500, 1500];
let pendingFlushPromise: Promise<number> | null = null;

export interface DiagnosisPersistenceInput {
  resultId?: string;
  typeId: string;
  answers: Answer[];
  indicatorScores: IndicatorScores;
  axisResult: AxisResult;
}

interface PendingDiagnosisResult extends DiagnosisPersistenceInput {
  resultId: string;
  queuedAt: number;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readPendingDiagnosisResults() {
  if (!canUseStorage()) {
    return [] as PendingDiagnosisResult[];
  }

  try {
    const raw = window.localStorage.getItem(PENDING_DIAGNOSIS_RESULTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingDiagnosisResult[]) : [];
  } catch (error) {
    console.error("Failed to read pending diagnosis results:", error);
    return [];
  }
}

export function getPendingDiagnosisResultCount() {
  return readPendingDiagnosisResults().length;
}

function writePendingDiagnosisResults(items: PendingDiagnosisResult[]) {
  if (!canUseStorage()) {
    return;
  }

  try {
    if (items.length === 0) {
      window.localStorage.removeItem(PENDING_DIAGNOSIS_RESULTS_KEY);
      return;
    }

    window.localStorage.setItem(PENDING_DIAGNOSIS_RESULTS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to write pending diagnosis results:", error);
  }
}

function upsertPendingDiagnosisResult(item: PendingDiagnosisResult) {
  const items = readPendingDiagnosisResults();
  const nextItems = items.filter((entry) => entry.resultId !== item.resultId);
  nextItems.push(item);
  writePendingDiagnosisResults(nextItems);
}

function removePendingDiagnosisResult(resultId: string) {
  const items = readPendingDiagnosisResults();
  writePendingDiagnosisResults(items.filter((entry) => entry.resultId !== resultId));
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function sendDiagnosisResult(item: PendingDiagnosisResult) {
  await saveDiagnosisResult({
    resultId: item.resultId,
    typeId: item.typeId,
    answers: item.answers,
    indicatorScores: item.indicatorScores,
    axisResult: item.axisResult,
  });
}

export async function persistDiagnosisResult(input: DiagnosisPersistenceInput) {
  const pendingItem: PendingDiagnosisResult = {
    ...input,
    resultId: input.resultId ?? crypto.randomUUID(),
    queuedAt: Date.now(),
  };

  upsertPendingDiagnosisResult(pendingItem);

  let lastError: unknown = null;
  for (const delayMs of SAVE_RETRY_DELAYS_MS) {
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    try {
      await sendDiagnosisResult(pendingItem);
      removePendingDiagnosisResult(pendingItem.resultId);
      return {
        resultId: pendingItem.resultId,
      };
    } catch (error) {
      lastError = error;

      if (error instanceof ApiError && error.status === 401) {
        break;
      }
    }
  }

  throw lastError ?? new Error("診断結果の保存に失敗しました");
}

export async function flushPendingDiagnosisResults() {
  if (pendingFlushPromise) {
    return pendingFlushPromise;
  }

  pendingFlushPromise = (async () => {
    const items = readPendingDiagnosisResults().sort((a, b) => a.queuedAt - b.queuedAt);
    let flushedCount = 0;

    for (const item of items) {
      try {
        await sendDiagnosisResult(item);
        removePendingDiagnosisResult(item.resultId);
        flushedCount += 1;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          break;
        }

        console.error("Failed to flush pending diagnosis result:", error);
      }
    }

    return flushedCount;
  })();

  try {
    return await pendingFlushPromise;
  } finally {
    pendingFlushPromise = null;
  }
}
