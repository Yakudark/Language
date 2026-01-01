import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar, FilterChip } from '../components/UI';
import { SansText, SerifText, Heading, MonoText } from '../components/Typography';
import { X, Globe } from 'lucide-react-native';

interface Translation {
  language: string;
  text: string;
  code: string;
}

interface Word {
  id: string;
  word: string;
  definitions: string[];
  type: string;
  etymology?: string;
  translations: Translation[];
}

const WORDS: Word[] = [
  {
    id: '1',
    word: 'Elen',
    definitions: ['A celestial body of light', 'Often used as a metaphor for hope in Quenya'],
    type: 'Noun',
    etymology: 'Primitive Elvish *elen',
    translations: [
      { code: 'en', language: 'English', text: 'Star' },
      { code: 'fr', language: 'Français', text: 'Étoile' },
      { code: 'es', language: 'Español', text: 'Estrella' },
      { code: 'de', language: 'Deutsch', text: 'Stern' }
    ]
  },
  {
    id: '2',
    word: 'Namárië',
    definitions: ['Formula of leave-taking', 'Literally "Be it well"'],
    type: 'Interjection',
    etymology: 'na- (be) + márië (well)',
    translations: [
      { code: 'en', language: 'English', text: 'Farewell' },
      { code: 'fr', language: 'Français', text: 'Adieu' },
      { code: 'es', language: 'Español', text: 'Adiós' }
    ]
  },
  {
    id: '3',
    word: 'Qapla’',
    definitions: ['Expression of victory or good luck', 'Most common Klingon farewell'],
    type: 'Noun/Interjection',
    translations: [
      { code: 'en', language: 'English', text: 'Success' },
      { code: 'fr', language: 'Français', text: 'Succès' },
      { code: 'ru', language: 'Русский', text: 'Успех' }
    ]
  }
];

export const DictionaryScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedLangCode, setSelectedLangCode] = useState('en');

  const filteredWords = WORDS.filter(w => 
    w.word.toLowerCase().includes(search.toLowerCase()) || 
    w.translations.some(t => t.text.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedTranslation = selectedWord?.translations.find(t => t.code === selectedLangCode) 
    || selectedWord?.translations[0];

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <View className="pt-8 px-6 mb-4">
        <Heading level={1}>Lexicon</Heading>
        <SansText className="text-brand-500 -mt-3">Documented original terms and their variations</SansText>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search original words..." />

      <FlatList
        data={filteredWords}
        keyExtractor={item => item.id}
        className="px-2"
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => {
              setSelectedWord(item);
              // Reset to English or first available when opening
              setSelectedLangCode('en');
            }}
            className="mx-4 my-2 p-4 bg-white rounded-2xl border border-brand-100 flex-row justify-between items-center shadow-sm"
          >
            <View>
              <SerifText className="text-2xl font-bold text-brand-900">{item.word}</SerifText>
              <SansText className="text-brand-400 text-xs uppercase tracking-widest">{item.type}</SansText>
            </View>
            <View className="bg-brand-50 p-2 rounded-full">
               <Globe size={16} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Word Detail Modal */}
      <Modal
        visible={!!selectedWord}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedWord(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] p-8 min-h-[70%] shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row justify-between items-start mb-8">
              <View>
                <SerifText className="text-5xl font-black text-brand-900 tracking-tighter">{selectedWord?.word}</SerifText>
                <SansText className="text-brand-400 text-sm uppercase tracking-[0.2em] mt-1">{selectedWord?.type}</SansText>
              </View>
              <TouchableOpacity onPress={() => setSelectedWord(null)} className="p-3 bg-brand-100 rounded-full">
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Definitions Section */}
              <View className="mb-8">
                <Heading level={3} className="text-brand-400 text-xs uppercase tracking-widest mb-4">Core Definition</Heading>
                {selectedWord?.definitions.map((def, i) => (
                  <View key={i} className="flex-row mb-3 bg-brand-50 p-4 rounded-2xl">
                    <SansText className="mr-3 text-brand-300 font-bold">{i + 1}.</SansText>
                    <SansText className="flex-1 text-brand-800 leading-6 italic">{def}</SansText>
                  </View>
                ))}
              </View>

              {/* Etymology Section */}
              {selectedWord?.etymology && (
                <View className="mb-8">
                  <Heading level={3} className="text-brand-400 text-xs uppercase tracking-widest mb-3">Origin & Etymology</Heading>
                  <View className="bg-brand-900 p-4 rounded-2xl">
                    <MonoText className="text-brand-100">
                      {selectedWord.etymology}
                    </MonoText>
                  </View>
                </View>
              )}

              {/* NEW: Multi-language Translations Section */}
              <View className="mb-10 pb-10">
                <Heading level={3} className="text-brand-400 text-xs uppercase tracking-widest mb-4">Translations</Heading>
                
                {/* Language Selector Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                  {selectedWord?.translations.map((t) => (
                    <TouchableOpacity
                      key={t.code}
                      onPress={() => setSelectedLangCode(t.code)}
                      className={`px-5 py-2.5 rounded-full mr-3 border ${selectedLangCode === t.code ? 'bg-brand-900 border-brand-900' : 'bg-transparent border-brand-200'}`}
                    >
                      <SansText className={`text-xs font-bold ${selectedLangCode === t.code ? 'text-white' : 'text-brand-500'}`}>
                        {t.language}
                      </SansText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Display Area for Selected Translation */}
                <View className="bg-brand-100 p-6 rounded-[32px] border border-brand-200">
                  <View className="flex-row items-center mb-2">
                    <View className="mr-2">
                      <Globe size={14} color="#6B7280" />
                    </View>
                    <SansText className="text-brand-400 text-[10px] uppercase font-bold tracking-widest">
                      {selectedTranslation?.language} Variant
                    </SansText>
                  </View>
                  <SerifText className="text-4xl font-bold text-brand-900">
                    {selectedTranslation?.text}
                  </SerifText>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
