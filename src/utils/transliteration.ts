
/**
 * Universal Transliteration Engine
 */

export interface TransliterationRule {
    pattern: string | RegExp;
    replacement: string;
}

// --- SINDARIN (TENGWAR FONT MAPPING) ---
const SINDARIN_DIGRAMS: Record<string, string> = {
    th: "T", dh: "D", ch: "H", ng: "G", hw: "W", rh: "R", lh: "L",
};
const SINDARIN_CONSONANTS: Record<string, string> = {
    p: "p", b: "b", t: "t", d: "d", k: "k", c: "k", g: "g", f: "f", v: "v", s: "s", h: "h", l: "l", r: "r", m: "m", n: "n", w: "w", y: "y",
};
const SINDARIN_VOWELS: Record<string, string> = {
    a: "`", e: "´", i: "^", o: "~", u: "¨",
};

// --- KOREAN (HANGUL SYLLABLE COMPOSITION) ---
const KOREAN_CHOSEONG: Record<string, number> = {
    'g': 0, 'kk': 1, 'n': 2, 'd': 3, 'tt': 4, 'r': 5, 'l': 5, 'm': 6, 'b': 7, 'pp': 8, 's': 9, 'ss': 10, '': 11, 'ng': 11, 'j': 12, 'jj': 13, 'ch': 14, 'k': 15, 't': 16, 'p': 17, 'h': 18
};
const KOREAN_JUNGSEONG: Record<string, number> = {
    'a': 0, 'ae': 1, 'ya': 2, 'yae': 3, 'eo': 4, 'e': 5, 'yeo': 6, 'ye': 7, 'o': 8, 'wa': 9, 'wae': 10, 'oe': 11, 'yo': 12, 'u': 13, 'wo': 14, 'we': 15, 'wi': 16, 'yu': 17, 'eu': 18, 'ui': 19, 'i': 20
};
const KOREAN_JONGSEONG: Record<string, number> = {
    '': 0, 'g': 1, 'kk': 2, 'gs': 3, 'n': 4, 'nj': 5, 'nh': 6, 'd': 7, 'l': 8, 'lg': 9, 'lm': 10, 'lb': 11, 'ls': 12, 'lt': 13, 'lp': 14, 'lh': 15, 'm': 16, 'b': 17, 'bs': 18, 's': 19, 'ss': 20, 'ng': 21, 'j': 22, 'ch': 23, 'k': 24, 't': 25, 'p': 26, 'h': 27
};

const composeHangul = (cho: string, jung: string, jong: string = ''): string => {
    // Treat empty choseong as 'null' consonant ㅇ (index 11)
    const choIdx = KOREAN_CHOSEONG[cho] ?? 11;
    const jungIdx = KOREAN_JUNGSEONG[jung];
    const jongIdx = KOREAN_JONGSEONG[jong] ?? 0;

    if (jungIdx === undefined) return (cho || '') + (jung || '') + (jong || '');

    const code = (choIdx * 588) + (jungIdx * 28) + jongIdx + 44032;
    return String.fromCharCode(code);
};

export const transliterate = (text: string, languageId: string): string => {
    const lang = languageId.toLowerCase();
    const input = text.toLowerCase();

    // Support "sindarin" as ID or name part
    if (lang.includes('sindarin')) {
        let result = ""; let i = 0;
        while (i < input.length) {
            const two = input.slice(i, i + 2);
            if (SINDARIN_DIGRAMS[two]) { result += SINDARIN_DIGRAMS[two]; i += 2; continue; }
            const char = input[i];
            if (SINDARIN_VOWELS[char]) { result += SINDARIN_VOWELS[char]; i++; continue; }
            if (SINDARIN_CONSONANTS[char]) { result += SINDARIN_CONSONANTS[char]; i++; continue; }
            result += char; i++;
        }
        return result;
    }

    // Support "korean" or "coréen" as ID or name part
    if (lang.includes('korean') || lang.includes('cor') || lang.includes('kor')) {
        // Improved regex: Optionally missing choseong, required jungseong, optionally jongseong
        // This is a simplified greedy parser
        const regex = /([gkdrlmbshjcnpt]{0,2})([aeiouy]{1,2})([gkdrlmbshjcnpt]{0,2})/g;
        return input.replace(regex, (match, cho, jung, jong) => {
            // If we have a jungseong, we can try to compose
            if (KOREAN_JUNGSEONG[jung] !== undefined) {
                return composeHangul(cho, jung, jong);
            }
            return match;
        });
    }

    return text;
};

export const applySindarinUmlaut = (word: string): string => {
    let text = word.toLowerCase();
    const transformations: [RegExp, string][] = [
        [/au$/, "oe"], [/ie$/, "i"], [/io$/, "y"], [/alph$/, "eilph"], [/narn$/, "nern"], [/ang$/, "eng"], [/ar$/, "er"], [/tal$/, "tail"],
        [/a($|[^aeiou])/, "ai$1"], [/e($|[^aeiou])/, "i$1"], [/é($|[^aeiou])|ê($|[^aeiou])/, "í$1"], [/o($|[^aeiou])/, "y$1"], [/ó($|[^aeiou])|ô($|[^aeiou])/, "ý$1"], [/u($|[^aeiou])/, "y$1"], [/ú($|[^aeiou])|û($|[^aeiou])/, "ui$1"],
    ];
    for (const [pattern, replacement] of transformations) {
        if (pattern.test(text)) return text.replace(pattern, replacement);
    }
    return text;
};

export const generatePronunciation = (text: string, languageId: string): string => {
    if (languageId.toLowerCase().includes('sindarin')) {
        let ipa = text.toLowerCase().replace(/th/g, 'θ').replace(/dh/g, 'ð').replace(/ch/g, 'x').replace(/r/g, 'r').replace(/y/g, 'y');
        return `[${ipa}]`;
    }
    return '';
};
