export interface LanguageModel {
    id: string;
    name: string;
    nativeName: string;
    universe: string;
    description: string;
    image: string;
    tags: string[];
    writingSystemName: string;
    writingSystemDescription: string;
}

export interface GrammarSectionModel {
    id: number;
    languageId: string;
    title: string;
    content: string;
}

export interface PhoneticsModel {
    id: number;
    languageId: string;
    description: string;
    vowels: string[];
    consonants: string[];
}

export interface LexiconEntryModel {
    id: number;
    word: string; // The concept (French)
    type: string;
    etymology?: string;
    translations: LexiconTranslationModel[];
}

export interface LexiconTranslationModel {
    id: number;
    entryId: number;
    conlangId: string; // ID of the target conlang (e.g. 'sindarin')
    conlangName?: string; // Cache the name for display
    text: string; // The main translated word or romanization
    nativeText?: string; // Special characters (e.g. Hangul, Tengwar)
    romanization?: string; // Standard romanization if 'text' is used for simplified spelling
    pronunciation?: string; // IPA or phonetic guides
}

export interface ExampleModel {
    id: number;
    languageId: string;
    native: string;
    transliteration: string;
    translation: string;
    notes?: string;
}

export interface SearchResult {
    type: 'language' | 'grammar' | 'lexicon' | 'example';
    languageId: string;
    referenceId: number;
    title: string;
    content: string;
}
