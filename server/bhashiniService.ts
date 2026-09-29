/**
 * BHASHINI OCR Service — Server-side only integration with the official
 * BHASHINI / Udyat / Dhruva OCR inference pipeline.
 *
 * This module is imported ONLY by server.ts and never bundled into the
 * frontend. All API credentials are accessed through process.env.
 *
 * Two-step flow per official BHASHINI API documentation:
 *   1. Pipeline Config → discover serviceId for OCR model
 *   2. Inference → send base64 image, receive extracted text
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BhashiniCredentials {
  udyatApiKey: string;
  userId: string;
  inferenceKey: string;
}

export interface BhashiniOcrResult {
  extractedText: string;
  serviceId: string;
  sourceLanguage: string;
}

// ─── Language Mapping ───────────────────────────────────────────────────────

const LANGUAGE_CODE_MAP: Record<string, string> = {
  HINDI: 'hi',
  ENGLISH: 'en',
  BENGALI: 'bn',
  ODIA: 'or',
  MARATHI: 'mr',
  PUNJABI: 'pa',
  TAMIL: 'ta',
  TELUGU: 'te',
  GUJARATI: 'gu',
  KANNADA: 'kn',
  MALAYALAM: 'ml',
  URDU: 'ur',
  ASSAMESE: 'as',
};

/**
 * Maps the metadata language string used in the app (e.g. "HINDI", "AUTO") to
 * the BHASHINI-compatible BCP 47 code (e.g. "hi").
 */
export function toBhashiniLangCode(appLanguage?: string): string {
  if (!appLanguage || appLanguage.toUpperCase() === 'AUTO') {
    return 'hi'; // Default primary script for Indian revenue land records
  }
  const code = LANGUAGE_CODE_MAP[appLanguage.toUpperCase()];
  return code || 'hi';
}

// ─── Credential Validation ─────────────────────────────────────────────────

export function loadBhashiniCredentials(): BhashiniCredentials | null {
  const udyatApiKey = process.env.BHASHINI_UDYAT_API_KEY;
  const userId = process.env.BHASHINI_USER_ID;
  const inferenceKey = process.env.BHASHINI_INFERENCE_KEY;

  if (
    !udyatApiKey || udyatApiKey === 'your_ulca_api_key_here' ||
    !userId || userId === 'your_user_id_here' ||
    !inferenceKey || inferenceKey === 'your_inference_authorization_key_here'
  ) {
    return null;
  }

  return { udyatApiKey, userId, inferenceKey };
}

// ─── Step 1: Pipeline Config (discover OCR serviceId) ──────────────────────

const PIPELINE_CONFIG_URL =
  'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline';

interface PipelineConfigResponse {
  pipelineResponseConfig: Array<{
    taskType: string;
    config: Array<{
      serviceId: string;
      modelId?: string;
      language: {
        sourceLanguage: string;
      };
    }>;
  }>;
  pipelineInferenceAPIEndPoint?: {
    callbackUrl?: string;
    inferenceApiKey?: {
      name?: string;
      value?: string;
    };
  };
}

/**
 * Discover the correct serviceId for OCR in the requested language.
 * Caches the result per language to avoid redundant calls.
 */
const serviceIdCache = new Map<string, { serviceId: string; inferenceUrl: string; cachedAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function discoverOcrServiceId(
  credentials: BhashiniCredentials,
  sourceLanguage: string
): Promise<{ serviceId: string; inferenceUrl: string }> {
  // Check cache
  const cached = serviceIdCache.get(sourceLanguage);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { serviceId: cached.serviceId, inferenceUrl: cached.inferenceUrl };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(PIPELINE_CONFIG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ulcaApiKey: credentials.udyatApiKey,
        userID: credentials.userId,
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'ocr',
            config: {
              language: {
                sourceLanguage,
              },
            },
          },
        ],
        pipelineRequestConfig: {
          pipelineId: '64392f96daac500b55c543cd',
        },
      }),
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      throw new BhashiniApiError(
        'Invalid BHASHINI API credentials. Please verify BHASHINI_UDYAT_API_KEY and BHASHINI_USER_ID in your .env file.',
        response.status
      );
    }

    if (response.status === 429) {
      throw new BhashiniApiError(
        'BHASHINI API rate limit exceeded. Please wait a few minutes and try again.',
        429
      );
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new BhashiniApiError(
        `BHASHINI Pipeline Config API error (HTTP ${response.status}): ${errorBody}`,
        response.status
      );
    }

    const data: PipelineConfigResponse = await response.json();

    // Extract serviceId from the OCR task config
    const ocrConfig = data.pipelineResponseConfig?.find(
      (c) => c.taskType === 'ocr'
    );

    if (!ocrConfig?.config?.[0]?.serviceId) {
      throw new BhashiniApiError(
        `No OCR model/serviceId found for language "${sourceLanguage}". The BHASHINI platform may not support OCR for this language yet.`,
        404
      );
    }

    const serviceId = ocrConfig.config[0].serviceId;

    // Use the inference endpoint from the response, or the default Dhruva URL
    const inferenceUrl =
      data.pipelineInferenceAPIEndPoint?.callbackUrl ||
      'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

    // Cache result
    serviceIdCache.set(sourceLanguage, {
      serviceId,
      inferenceUrl,
      cachedAt: Date.now(),
    });

    return { serviceId, inferenceUrl };
  } catch (err: any) {
    if (err instanceof BhashiniApiError) throw err;
    if (err.name === 'AbortError') {
      throw new BhashiniApiError(
        'BHASHINI Pipeline Config request timed out after 15 seconds. Please check your network connection and try again.',
        408
      );
    }
    throw new BhashiniApiError(
      `Failed to connect to BHASHINI Pipeline Config API: ${err?.message || 'Network error'}`,
      0
    );
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Step 2: OCR Inference ─────────────────────────────────────────────────

export async function performBhashiniOcr(
  credentials: BhashiniCredentials,
  imageBase64: string,
  sourceLanguage: string
): Promise<BhashiniOcrResult> {
  // Step 1: Discover serviceId
  console.log(`[BHASHINI OCR Pipeline] 1. Discovering serviceId for sourceLanguage: "${sourceLanguage}"...`);
  const { serviceId, inferenceUrl } = await discoverOcrServiceId(
    credentials,
    sourceLanguage
  );
  console.log(`[BHASHINI OCR Pipeline] 2. Discovered serviceId: "${serviceId}" | Inference URL: ${inferenceUrl}`);

  // Step 2: Call inference endpoint
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout for OCR

  try {
    console.log(`[BHASHINI OCR Pipeline] 3. Sending OCR Inference Request (payload size: ${(imageBase64.length / 1024).toFixed(1)} KB base64)...`);
    const response = await fetch(inferenceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: credentials.inferenceKey,
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'ocr',
            config: {
              language: {
                sourceLanguage,
              },
              serviceId,
            },
          },
        ],
        inputData: {
          imageContent: imageBase64,
        },
      }),
      signal: controller.signal,
    });

    console.log(`[BHASHINI OCR Pipeline] 4. BHASHINI HTTP Status: ${response.status} ${response.statusText}`);

    if (response.status === 401 || response.status === 403) {
      throw new BhashiniApiError(
        'Invalid BHASHINI Inference API credentials. Please verify BHASHINI_INFERENCE_KEY in your .env file.',
        response.status
      );
    }

    if (response.status === 429) {
      throw new BhashiniApiError(
        'BHASHINI API rate limit exceeded. Please wait a few minutes and try again.',
        429
      );
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new BhashiniApiError(
        `BHASHINI OCR Inference API error (HTTP ${response.status}): ${errorBody}`,
        response.status
      );
    }

    const data = await response.json();
    console.log(`[BHASHINI OCR Pipeline] 5. BHASHINI Raw Response Top-level Keys: [${Object.keys(data || {}).join(', ')}]`);

    // Extract OCR text from the pipeline response
    // Response format: { pipelineResponse: [{ taskType: "ocr", output: [{ source: "extracted text" }] }] }
    const ocrOutput = data?.pipelineResponse?.find(
      (r: any) => r.taskType === 'ocr'
    );

    let extractedText = '';

    if (ocrOutput?.output) {
      if (Array.isArray(ocrOutput.output)) {
        // Each output element may have a `source` field with the OCR text
        extractedText = ocrOutput.output
          .map((o: any) => o.source || '')
          .filter((s: string) => s.length > 0)
          .join('\n');
      }
    }

    const hasText = Boolean(extractedText && extractedText.trim().length > 0);
    console.log(`[BHASHINI OCR Pipeline] 6. OCR Text Returned: ${hasText ? 'YES' : 'NO'} | Length: ${extractedText.length} chars`);
    if (hasText) {
      console.log(`[BHASHINI OCR Pipeline] 7. First 250 chars of extracted text:\n---\n${extractedText.substring(0, 250)}\n---`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new BhashiniApiError(
        'BHASHINI OCR returned empty result. The document may be unreadable, blank, or in an unsupported format. Please upload a clear, high-contrast document image.',
        204
      );
    }

    return {
      extractedText: extractedText.trim(),
      serviceId,
      sourceLanguage,
    };
  } catch (err: any) {
    if (err instanceof BhashiniApiError) throw err;
    if (err.name === 'AbortError') {
      throw new BhashiniApiError(
        'BHASHINI OCR request timed out after 30 seconds. The document may be too large or the service is experiencing high load. Please try again.',
        408
      );
    }
    throw new BhashiniApiError(
      `Failed to connect to BHASHINI OCR Inference API: ${err?.message || 'Network error'}`,
      0
    );
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Custom Error Class ────────────────────────────────────────────────────

export class BhashiniApiError extends Error {
  public readonly httpStatus: number;

  constructor(message: string, httpStatus: number) {
    super(message);
    this.name = 'BhashiniApiError';
    this.httpStatus = httpStatus;
  }
}
