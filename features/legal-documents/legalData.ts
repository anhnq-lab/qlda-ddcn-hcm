/**
 * legalData.ts — COMPATIBILITY SHIM
 *
 * legalData.ts đã được xóa (2.1MB static data).
 * File này re-export tất cả types và constants từ LegalDocumentService
 * để các component cũ không bị vỡ khi import.
 *
 * TODO: Dần dần migrate từng component sang import trực tiếp từ:
 *   - Types: '@/services/LegalDocumentService'
 *   - Hooks: '@/features/legal-documents/useLegalDocuments'
 */
export type {
    DocType,
    DocStatus,
    LegalDocumentDB as LegalDocument,
    LegalChapterDB as LegalChapter,
    LegalArticleDB as LegalArticle,
    LegalDocumentSearchParams,
    LegalDocumentSearchResult,
} from '../../services/LegalDocumentService';

export {
    DOC_TYPE_LABELS,
    DOC_STATUS_LABELS,
    DOC_TYPE_COLORS,
    DOC_STATUS_COLORS,
} from '../../services/LegalDocumentService';

// Legacy exports that no longer exist (static data removed)
// These kept for type compatibility only — return empty arrays at runtime
import type { LegalDocumentDB } from '../../services/LegalDocumentService';
export const legalDocuments: LegalDocumentDB[] = [];
export const getDocArticleCount = (_doc: LegalDocumentDB) => 0;

// FlatArticle type (used in search/header components)
export type FlatArticle = {
    id: string;
    code: string;
    title: string;
    summary: string | null;
    content: string | null;
    fullContent: string | null;
    docId: string;
    docCode: string;
    docTitle: string;
    chapterTitle: string;
};
