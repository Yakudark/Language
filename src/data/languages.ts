export interface Language {
    id: string;
    name: string;
    nativeName: string;
    universe: string;
    tags: string[];
    description: string;
    image?: any;
    writingSystem: {
        name: string;
        description: string;
        scriptImage?: string;
    };
    phonetics: {
        description: string;
        vowels: string[];
        consonants: string[];
    };
    grammar: {
        title: string;
        content: string;
    }[];
    examples: Example[];
}

export interface Example {
    id: string;
    native: string;
    transliteration: string;
    translation: string;
    notes?: string;
}

export const LANGUAGES: Language[] = [
    {
        id: 'quenya',
        name: 'Quenya',
        nativeName: 'Eldarin',
        universe: 'Middle-earth',
        tags: ['Elvish', 'Arda', 'Inflected'],
        image: require('../../assets/images/quenya.png'),
        description: 'Quenya is one of the Elvish languages devised by J.R.R. Tolkien, representing the high tongue of the Noldor.',
        writingSystem: {
            name: 'Tengwar',
            description: 'The Tengwar are an artificial script created by Fëanor, and used for writing several of the languages of Middle-earth.'
        },
        phonetics: {
            description: 'Quenya phonology is somewhat similar to Finnish or Latin.',
            vowels: ['a', 'e', 'i', 'o', 'u'],
            consonants: ['p', 't', 'c', 'f', 's', 'h', 'm', 'n', 'l', 'r', 'v', 'y', 'w']
        },
        grammar: [
            {
                title: 'Nouns',
                content: 'Quenya nouns have ten cases: nominative, accusative, genitive, possessive, dative, locative, allative, ablative, instrumental, and respective.'
            },
            {
                title: 'Verbs',
                content: 'Verbs are conjugated for tense and mood, with suffixes indicating the subject.'
            }
        ],
        examples: [
            {
                id: 'q1',
                native: 'Namárië! Nai hiruvalyë Valimar.',
                transliteration: 'Namárië! Nai hiruvalyë Valimar.',
                translation: 'Farewell! Maybe thou shalt find Valimar.'
            },
            {
                id: 'q2',
                native: 'Elen síla lúmenn’ omentielvo',
                transliteration: 'Elen síla lúmenn’ omentielvo',
                translation: 'A star shines on the hour of our meeting.',
                notes: 'A common Elvish greeting.'
            }
        ]
    },
    {
        id: 'klingon',
        name: 'Klingon',
        nativeName: 'tlhIngan Hol',
        universe: 'Star Trek',
        tags: ['Warrior', 'Aggressive', 'OVS'],
        image: require('../../assets/images/klingon.png'),
        description: 'Klingon is the constructed language spoken by the fictional Klingons in the Star Trek universe.',
        writingSystem: {
            name: 'pIqaD',
            description: 'The Klingon script is known as pIqaD. It is highly angular and sharp.'
        },
        phonetics: {
            description: 'Klingon uses several sounds not found in English, including glottal stops and uvular fricatives.',
            vowels: ['a', 'e', 'I', 'o', 'u'],
            consonants: ['b', 'ch', 'D', 'gh', 'H', 'j', 'l', 'm', 'n', 'ng', 'p', 'q', 'Q', 'r', 'S', 't', 'tlh', 'v', 'w', 'y']
        },
        grammar: [
            {
                title: 'Word Order',
                content: 'Klingon uses an Object-Verb-Subject (OVS) word order, which is rare in natural human languages.'
            }
        ],
        examples: [
            {
                id: 'k1',
                native: 'Qapla’',
                transliteration: 'Qapla’',
                translation: 'Success!'
            }
        ]
    }
];
