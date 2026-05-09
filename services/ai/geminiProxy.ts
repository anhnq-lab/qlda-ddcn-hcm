/**
 * AI Proxy Client — Gọi DeepSeek API thông qua Supabase Edge Function
 * OpenAI-compatible format (messages[], tool_calls)
 * Client → Supabase Edge Function (gemini-proxy) → DeepSeek API
 */
import { supabase } from '../../lib/supabase';

const FUNCTION_NAME = 'gemini-proxy';

// ── OpenAI-compatible Types ──────────────────────────────────────

export interface OAIToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

export interface AIMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_calls?: OAIToolCall[];
    tool_call_id?: string;
}

export interface AIResponse {
    choices?: Array<{
        message: {
            role: string;
            content: string | null;
            tool_calls?: OAIToolCall[];
        };
        finish_reason: string;
    }>;
    error?: string;
}

// ── Core API Call ────────────────────────────────────────────────

async function callProxy(body: Record<string, unknown>): Promise<AIResponse> {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body });

    if (error) {
        throw new Error(`AI proxy error: ${error.message}`);
    }
    if (data?.error) {
        throw new Error(`AI API error: ${data.error}`);
    }
    return data as AIResponse;
}

// ── Chat with optional function calling ──────────────────────────

export async function sendChatMessage(
    messages: AIMessage[],
    options?: {
        model?: string;
        tools?: unknown[];
        tool_choice?: string;
        max_tokens?: number;
        temperature?: number;
    }
): Promise<AIResponse> {
    return callProxy({
        model: options?.model || 'deepseek-chat',
        messages,
        tools: options?.tools,
        tool_choice: options?.tool_choice || 'auto',
        max_tokens: options?.max_tokens || 4096,
        temperature: options?.temperature ?? 0.3,
    });
}

// ── Simple text generation (no function calling) ─────────────────

export async function generateContent(
    prompt: string,
    options?: {
        model?: string;
        max_tokens?: number;
        temperature?: number;
    }
): Promise<string> {
    const response = await callProxy({
        model: options?.model || 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.max_tokens || 4096,
        temperature: options?.temperature ?? 0.2,
    });
    return response.choices?.[0]?.message?.content || '';
}

// ── Image analysis (DeepSeek không hỗ trợ vision — trả lỗi rõ ràng) ──

export async function generateFromImage(
    _imageBase64: string,
    _mimeType: string,
    _prompt: string,
    _options?: { model?: string }
): Promise<string> {
    throw new Error('Tính năng phân tích ảnh không khả dụng với DeepSeek. Vui lòng nhập thông tin thủ công.');
}

// ── Availability check ───────────────────────────────────────────

export function isGeminiProxyAvailable(): boolean {
    return true;
}

// ── Legacy type exports (backward compat) ────────────────────────
// Old code that imported GeminiContent/GeminiPart still compiles
export type GeminiContent = AIMessage;
export type GeminiPart = { text: string };
