import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'encyclopedia_v6.db';

export const initDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    // Activer les clés étrangères
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Création des tables
    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS languages (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                nativeName TEXT,
                universe TEXT,
                description TEXT,
                image TEXT,
                tags TEXT,
                writingSystemName TEXT,
                writingSystemDescription TEXT
            );
        `);

    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS grammar_sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                languageId TEXT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                FOREIGN KEY (languageId) REFERENCES languages(id) ON DELETE CASCADE
            );
        `);

    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS phonetics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                languageId TEXT,
                description TEXT,
                vowels TEXT,
                consonants TEXT,
                FOREIGN KEY (languageId) REFERENCES languages(id) ON DELETE CASCADE
            );
        `);

    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS lexicon_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL UNIQUE, 
                type TEXT,
                etymology TEXT
            );
        `);

    // TRANSLATION TABLE: Added nativeText, romanization, pronunciation
    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS lexicon_translations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entryId INTEGER,
                conlangId TEXT,
                text TEXT NOT NULL,
                nativeText TEXT,
                romanization TEXT,
                pronunciation TEXT,
                FOREIGN KEY (entryId) REFERENCES lexicon_entries(id) ON DELETE CASCADE,
                FOREIGN KEY (conlangId) REFERENCES languages(id) ON DELETE CASCADE
            );
        `);

    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS examples (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                languageId TEXT,
                native TEXT NOT NULL,
                transliteration TEXT,
                translation TEXT NOT NULL,
                notes TEXT,
                FOREIGN KEY (languageId) REFERENCES languages(id) ON DELETE CASCADE
            );
        `);

    await db.execAsync(`
            CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
                type,
                languageId,
                referenceId,
                title,
                content
            );
        `);

    const countResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM languages');
    if (!countResult || countResult.count === 0) {
      console.log("Initialisation des données conceptuelles v6 (Script Natif + Phonétique)...");
      await seedData(db);
    }

    return db;
  } catch (error) {
    console.error("ÉCHEC DE L'INITIALISATION DE LA BASE :", error);
    throw error;
  }
};

const seedData = async (db: SQLite.SQLiteDatabase) => {
  await db.withTransactionAsync(async () => {
    // --- LANGUAGES ---
    await db.runAsync(`
            INSERT INTO languages (id, name, nativeName, universe, description, image, tags, writingSystemName, writingSystemDescription)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['sindarin', 'Sindarin', 'Edhellen', 'Terre du Milieu',
        'Le Sindarin est la principale langue elfique de la Terre du Milieu.',
        'sindarin', 'Elfique, Arda, Doux', 'Cirth', 'Le Cirth est une écriture semi-alphabétique.']
    );

    await db.runAsync(`
            INSERT INTO languages (id, name, nativeName, universe, description, image, tags, writingSystemName, writingSystemDescription)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['dothraki', 'Dothraki', 'Lekh Dothraki', 'Game of Thrones',
        'La langue des Dothrakis, un peuple cavalier nomade.',
        'dothraki', 'Tribal, Agressif, Nomade', 'Aucun', 'Principalement oral.']
    );

    // --- CONCEPT HELPER ---
    const addConcept = async (french: string, type: string) => {
      const res = await db.runAsync('INSERT INTO lexicon_entries (word, type) VALUES (?, ?)', [french, type]);
      return res.lastInsertRowId;
    };

    const addTranslation = async (entryId: number, conlangId: string, text: string, native?: string, rom?: string, pron?: string) => {
      await db.runAsync(
        'INSERT INTO lexicon_translations (entryId, conlangId, text, nativeText, romanization, pronunciation) VALUES (?, ?, ?, ?, ?, ?)',
        [entryId, conlangId, text, native || null, rom || null, pron || null]
      );
      await db.runAsync('INSERT INTO documents_fts (type, languageId, referenceId, title, content) VALUES (?, ?, ?, ?, ?)', ['lexicon', conlangId, entryId, 'Lexique', text]);
    };

    const idAmi = await addConcept('Ami', 'Nom');
    await addTranslation(idAmi, 'sindarin', 'Mellon', '󱲣󱲩󱲫󱲫󱲮󱲫', 'mellon', '[ˈmɛl.lɔn]');
    await addTranslation(idAmi, 'dothraki', 'Okeo', null, 'okeo', '[o.ke.o]');

    const idRoi = await addConcept('Roi', 'Nom');
    await addTranslation(idRoi, 'sindarin', 'Aran', null, 'aran', '[ˈa.ran]');
    await addTranslation(idRoi, 'dothraki', 'Khal', null, 'khal', '[xal]');

    const idSoleil = await addConcept('Soleil', 'Nom');
    await addTranslation(idSoleil, 'sindarin', 'Anor', null, 'anor', '[ˈa.nɔr]');
    await addTranslation(idSoleil, 'dothraki', 'Shekh', null, 'shekh', '[ʃex]');

    await db.runAsync(`INSERT INTO grammar_sections (languageId, title, content) VALUES (?, ?, ?)`,
      ['sindarin', 'Mutation Consonantique', 'En Sindarin, les consonnes mutent...']);

    await db.runAsync('INSERT INTO documents_fts (type, languageId, referenceId, title, content) VALUES (?, ?, ?, ?, ?)', ['language', 'sindarin', 0, 'Sindarin', 'Langue Elfique']);
    await db.runAsync('INSERT INTO documents_fts (type, languageId, referenceId, title, content) VALUES (?, ?, ?, ?, ?)', ['language', 'dothraki', 0, 'Dothraki', 'Langue Cavalier']);
  });
};
