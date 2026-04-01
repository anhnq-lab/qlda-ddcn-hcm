/**
 * Gemini Proxy Client — Gọi Gemini API thông qua Supabase Edge Function
 * 
 * Thay vì expose API key ở client, tất cả requests đi qua:
 * Client → Supabase Edge Function (gemini-proxy) → Gemini API
 * 
 * API key được lưu trong Supabase Edge Function Secrets
 */
import { supabase } from '../../lib/supabase';

const FUNCTION_NAME = 'gemini-proxy';

// ── Types (tương thích với @google/generative-ai) ────────────────

export interface GeminiContent {
    role: 'user' | 'model';
    parts: GeminiPart[];
}

export type GeminiPart =
    | { text: string }
    | { functionCall: { name: string; args: Record<string, unknown> } }
    | { functionResponse: { name: string; response: { result: unknown } } }
    | { inlineData: { mimeType: string; data: string } };

export interface GeminiGenerationConfig {
    maxOutputTokens?: number;
    temperature?: number;
}

export interface GeminiCandidate {
    content: { parts: GeminiPart[] };
    finishReason?: string;
}

export interface GeminiResponse {
    candidates?: GeminiCandidate[];
}

// ── Core API Call ────────────────────────────────────────────────

async function callGeminiProxy(body: Record<string, unknown>): Promise<GeminiResponse> {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
        body,
    });

    if (error) {
        throw new Error(`Gemini proxy error: ${error.message}`);
    }

    if (data?.error) {
        throw new Error(`Gemini API error: ${data.error}`);
    }

    return data as GeminiResponse;
}

// ── Simple Generation (no chat, no function calling) ────────────

export async function generateContent(
    prompt: string,
    options?: {
        model?: string;
        generationConfig?: GeminiGenerationConfig;
    }
): Promise<string> {
    const response = await callGeminiProxy({
        action: 'generateContent',
        model: options?.model || 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: options?.generationConfig || { maxOutputTokens: 4096, temperature: 0.2 },
    });

    const text = response.candidates?.[0]?.content?.parts
        ?.filter((p): p is { text: string } => 'text' in p)
        .map(p => p.text)
        .join('') || '';

    return text;
}

// ── Chat with Function Calling ──────────────────────────────────

export async function sendChatMessage(
    contents: GeminiContent[],
    options?: {
        model?: string;
        systemInstruction?: { parts: { text: string }[] };
        tools?: unknown[];
        toolConfig?: unknown;
        generationConfig?: GeminiGenerationConfig;
    }
): Promise<GeminiResponse> {
    return callGeminiProxy({
        action: 'generateContent',
        model: options?.model || 'gemini-2.0-flash',
        contents,
        systemInstruction: options?.systemInstruction,
        tools: options?.tools,
        toolConfig: options?.toolConfig,
        generationConfig: options?.generationConfig || { maxOutputTokens: 2048, temperature: 0.3 },
    });
}

// ── Multimodal (image + text) ───────────────────────────────────

export async function generateFromImage(
    imageBase64: string,
    mimeType: string,
    prompt: string,
    options?: {
        model?: string;
        generationConfig?: GeminiGenerationConfig;
    }
): Promise<string> {
    const response = await callGeminiProxy({
        action: 'generateContent',
        model: options?.model || 'gemini-2.0-flash',
        contents: [{
            role: 'user',
            parts: [
                { inlineData: { mimeType, data: imageBase64 } },
                { text: prompt },
            ],
        }],
        generationConfig: options?.generationConfig || { maxOutputTokens: 4096, temperature: 0.2 },
    });

    const text = response.candidates?.[0]?.content?.parts
        ?.filter((p): p is { text: string } => 'text' in p)
        .map(p => p.text)
        .join('') || '';

    return text;
}

// ── Check availability ──────────────────────────────────────────

export function isGeminiProxyAvailable(): boolean {
    // Always available since key is in Edge Function secrets
    return true;
}
