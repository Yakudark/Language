import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, initDatabase } from '../database/db';
import {
    LanguageModel,
    GrammarSectionModel,
    PhoneticsModel,
    LexiconEntryModel,
    ExampleModel,
    SearchResult,
    LexiconTranslationModel
} from '../models/database';

class EncyclopediaRepository {
    private db: SQLite.SQLiteDatabase | null = null;
    private initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

    private async getDb(): Promise<SQLite.SQLiteDatabase> {
        if (this.db) return this.db;
        if (!this.initPromise) {
            this.initPromise = initDatabase();
        }
        this.db = await this.initPromise;
        return this.db;
    }

    async getLanguages(): Promise<LanguageModel[]> {
        const db = await this.getDb();
        const rows = await db.getAllAsync<any>('SELECT * FROM languages');
        return rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : []
        }));
    }

    async getLanguageById(id: string): Promise<LanguageModel | null> {
        const db = await this.getDb();
        const row = await db.getFirstAsync<any>('SELECT * FROM languages WHERE id = ?', [id]);
        if (!row) return null;
        return {
            ...row,
            tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : []
        };
    }

    async getGrammarSections(languageId: string): Promise<GrammarSectionModel[]> {
        const db = await this.getDb();
        return db.getAllAsync<GrammarSectionModel>('SELECT * FROM grammar_sections WHERE languageId = ?', [languageId]);
    }

    async getPhonetics(languageId: string): Promise<PhoneticsModel | null> {
        const db = await this.getDb();
        const row = await db.getFirstAsync<any>('SELECT * FROM phonetics WHERE languageId = ?', [languageId]);
        if (!row) return null;
        return {
            ...row,
            vowels: row.vowels ? row.vowels.split(',').map((v: string) => v.trim()) : [],
            consonants: row.consonants ? row.consonants.split(',').map((c: string) => c.trim()) : []
        };
    }

    async getLexiconEntries(languageId: string): Promise<LexiconEntryModel[]> {
        const db = await this.getDb();
        const entries = await db.getAllAsync<any>(`
            SELECT DISTINCT e.* FROM lexicon_entries e
            JOIN lexicon_translations t ON e.id = t.entryId
            WHERE t.conlangId = ?`, [languageId]);

        const result: LexiconEntryModel[] = [];
        for (const entry of entries) {
            const translations = await db.getAllAsync<any>(`
                SELECT t.*, l.name as conlangName 
                FROM lexicon_translations t
                JOIN languages l ON t.conlangId = l.id
                WHERE t.entryId = ? AND t.conlangId = ?`, [entry.id, languageId]);
            result.push({ ...entry, translations });
        }
        return result;
    }

    async getAllLexiconEntries(): Promise<LexiconEntryModel[]> {
        const db = await this.getDb();
        const entries = await db.getAllAsync<any>('SELECT * FROM lexicon_entries');

        const result: LexiconEntryModel[] = [];
        for (const entry of entries) {
            const translations = await db.getAllAsync<any>(`
                SELECT t.*, l.name as conlangName 
                FROM lexicon_translations t
                JOIN languages l ON t.conlangId = l.id
                WHERE t.entryId = ?`, [entry.id]);
            result.push({ ...entry, translations });
        }
        return result;
    }

    async getExamples(languageId: string): Promise<ExampleModel[]> {
        const db = await this.getDb();
        return db.getAllAsync<ExampleModel>('SELECT * FROM examples WHERE languageId = ?', [languageId]);
    }

    async searchDocuments(query: string): Promise<SearchResult[]> {
        const db = await this.getDb();
        const searchQuery = `*${query}*`;
        return db.getAllAsync<SearchResult>(
            'SELECT type, languageId, referenceId, title, content FROM documents_fts WHERE documents_fts MATCH ? ORDER BY rank',
            [searchQuery]
        );
    }

    // --- PERSISTENCE ---

    async addLanguage(lang: Omit<LanguageModel, 'id'>): Promise<string> {
        const db = await this.getDb();
        const id = lang.name.toLowerCase().replace(/\s+/g, '_');
        await db.runAsync(
            `INSERT INTO languages (id, name, nativeName, universe, description, image, tags, writingSystemName, writingSystemDescription)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, lang.name, lang.nativeName, lang.universe, lang.description, lang.image || 'quenya', lang.tags.join(','), lang.writingSystemName, lang.writingSystemDescription]
        );
        await db.runAsync('INSERT INTO documents_fts (type, languageId, referenceId, title, content) VALUES (?, ?, ?, ?, ?)', ['language', id, 0, lang.name, lang.description]);
        return id;
    }

    async addLexiconEntry(entry: {
        word: string,
        type: string,
        etymology?: string,
        conlangId: string,
        translation: string,
        nativeText?: string,
        romanization?: string,
        pronunciation?: string
    }): Promise<number> {
        const db = await this.getDb();
        const result = await db.runAsync(
            'INSERT INTO lexicon_entries (word, type, etymology) VALUES (?, ?, ?)',
            [entry.word, entry.type, entry.etymology || '']
        );
        const entryId = result.lastInsertRowId;
        await this.addTranslation(entryId, {
            conlangId: entry.conlangId,
            text: entry.translation,
            nativeText: entry.nativeText,
            romanization: entry.romanization,
            pronunciation: entry.pronunciation
        }, entry.conlangId, entry.word);
        return entryId;
    }

    async getLexiconEntryByWord(word: string): Promise<LexiconEntryModel | null> {
        const db = await this.getDb();
        const entry = await db.getFirstAsync<any>('SELECT * FROM lexicon_entries WHERE LOWER(word) = LOWER(?)', [word]);
        if (!entry) return null;

        const translations = await db.getAllAsync<any>(`
            SELECT t.*, l.name as conlangName 
            FROM lexicon_translations t
            JOIN languages l ON t.conlangId = l.id
            WHERE t.entryId = ?`, [entry.id]);

        return { ...entry, translations };
    }

    async addTranslation(entryId: number, t: {
        conlangId: string,
        text: string,
        nativeText?: string,
        romanization?: string,
        pronunciation?: string
    }, conlangId: string, word: string): Promise<void> {
        const db = await this.getDb();
        await db.runAsync(
            'INSERT INTO lexicon_translations (entryId, conlangId, text, nativeText, romanization, pronunciation) VALUES (?, ?, ?, ?, ?, ?)',
            [entryId, t.conlangId, t.text, t.nativeText || null, t.romanization || null, t.pronunciation || null]
        );
        await db.runAsync('INSERT INTO documents_fts (type, languageId, referenceId, title, content) VALUES (?, ?, ?, ?, ?)', ['lexicon', conlangId, entryId, word, t.text]);
    }

    async addGrammarSection(section: Omit<GrammarSectionModel, 'id'>): Promise<number> {
        const db = await this.getDb();
        const result = await db.runAsync('INSERT INTO grammar_sections (languageId, title, content) VALUES (?, ?, ?)', [section.languageId, section.title, section.content]);
        const sectionId = result.lastInsertRowId;
        await db.runAsync('INSERT INTO documents_fts (type, languageId, referenceId, title, content) VALUES (?, ?, ?, ?, ?)', ['grammar', section.languageId, sectionId, section.title, section.content]);
        return sectionId;
    }

    async deleteLanguage(id: string): Promise<void> {
        const db = await this.getDb();
        await db.withTransactionAsync(async () => {
            await db.runAsync('DELETE FROM documents_fts WHERE languageId = ?', [id]);
            await db.runAsync('DELETE FROM languages WHERE id = ?', [id]);
        });
    }

    async deleteLexiconEntry(id: number): Promise<void> {
        const db = await this.getDb();
        await db.withTransactionAsync(async () => {
            // Cascade delete is handled by the database schema (ON DELETE CASCADE)
            // But we must manually clean up the FTS index
            await db.runAsync('DELETE FROM documents_fts WHERE type = ? AND referenceId = ?', ['lexicon', id]);
            await db.runAsync('DELETE FROM lexicon_entries WHERE id = ?', [id]);
        });
    }
}

export const repository = new EncyclopediaRepository();
