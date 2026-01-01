import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Text, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../components/UI';
import { SansText, SerifText, Heading, NativeText } from '../components/Typography';
import { X, Globe, Book, FileText, MessageSquare, Headphones, Type, Trash2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react-native';
import { repository } from '../repositories/EncyclopediaRepository';
import { LexiconEntryModel, SearchResult } from '../models/database';
import { transliterate, applySindarinUmlaut } from '../utils/transliteration';

export const DictionaryScreen = () => {
  const [search, setSearch] = useState('');
  const [lexicon, setLexicon] = useState<LexiconEntryModel[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedWord, setSelectedWord] = useState<LexiconEntryModel | null>(null);
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadLexicon();
    }
  }, [isFocused]);

  const loadLexicon = async () => {
    setLoading(true);
    try {
      const data = await repository.getAllLexiconEntries();
      setLexicon(data);
    } catch (error) {
      console.error("Erreur chargement lexique :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const performSearch = async () => {
      if (search.length > 1) {
        setLoading(true);
        try {
          const results = await repository.searchDocuments(search);
          setSearchResults(results);
        } catch (error) {
          console.error("Erreur recherche :", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    performSearch();
  }, [search]);

  const handleDelete = async (id: number) => {
    Alert.alert(
      "Suppression",
      "Voulez-vous vraiment effacer ce concept et toutes ses traductions ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
             try {
               await repository.deleteLexiconEntry(id);
               setSelectedWord(null);
               loadLexicon();
             } catch (error) {
               console.error("Erreur suppression :", error);
               Alert.alert("Erreur", "Impossible de supprimer ce mot.");
             }
          }
        }
      ]
    );
  };

  const renderLexiconItem = ({ item }: { item: LexiconEntryModel }) => (
    <TouchableOpacity 
      className="bg-white mx-6 mb-3 p-5 rounded-3xl border border-brand-100 shadow-sm flex-row justify-between items-center"
      onPress={() => setSelectedWord(item)}
    >
      <View className="flex-1 mr-4">
        <SansText className="text-brand-900 font-bold text-lg">{item.word}</SansText>
        <SansText className="text-brand-400 text-[10px] uppercase font-black tracking-widest mt-0.5">{item.type}</SansText>
      </View>
      <View className="flex-row">
          {item.translations.slice(0, 2).map((t, i) => (
              <View key={i} className="ml-2 bg-brand-50 px-4 py-3 rounded-2xl border border-brand-100 items-center justify-center min-w-[80px]">
                  {/* CARACTERES SPECIAUX (TOP) */}
                  <NativeText lang={t.conlangId} style={{ fontSize: 26 }} className="text-brand-900 text-center">
                    {t.nativeText || transliterate(t.text, t.conlangId)}
                  </NativeText>
                  
                  {/* ROMANISATION (BOTTOM) */}
                  <SansText className="text-[10px] text-brand-500 font-bold italic mt-1 text-center">
                    {t.romanization || t.text}
                  </SansText>
                  
                  <View className="bg-brand-900 px-1.5 rounded-full mt-2">
                    <SansText className="text-[6px] text-white uppercase font-black">{t.conlangId}</SansText>
                  </View>
              </View>
          ))}
      </View>
    </TouchableOpacity>
  );

  const groupLexiconByLetter = () => {
    const grouped: Record<string, LexiconEntryModel[]> = {};
    const sorted = [...lexicon].sort((a, b) => a.word.localeCompare(b.word));
    
    sorted.forEach(item => {
      const letter = item.word.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(item);
    });
    
    return Object.keys(grouped).sort().map(letter => ({
      letter,
      data: grouped[letter]
    }));
  };

  const renderAccordionSection = ({ item }: { item: { letter: string, data: LexiconEntryModel[] } }) => {
    const isExpanded = expandedLetter === item.letter;
    
    return (
      <View className="mb-4">
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => setExpandedLetter(isExpanded ? null : item.letter)}
          className="flex-row items-center justify-between bg-brand-900 mx-6 px-6 py-4 rounded-2xl shadow-md"
        >
          <View className="flex-row items-center">
            <View className="bg-white/20 w-10 h-10 rounded-xl items-center justify-center mr-4">
               <SerifText className="text-white text-xl font-bold">{item.letter}</SerifText>
            </View>
            <SansText className="text-white font-bold text-base">{item.data.length} mot{item.data.length > 1 ? 's' : ''}</SansText>
          </View>
          {isExpanded ? <ChevronDown size={20} color="white" /> : <ChevronRight size={20} color="white" />}
        </TouchableOpacity>
        
        {isExpanded && (
          <View className="mt-3">
            {item.data.map((word, idx) => (
              <View key={word.id}>
                {renderLexiconItem({ item: word })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'language': return <Globe size={16} color="#4B5563" />;
        case 'lexicon': return <Book size={16} color="#4B5563" />;
        case 'grammar': return <FileText size={16} color="#4B5563" />;
        case 'example': return <MessageSquare size={16} color="#4B5563" />;
        default: return <Book size={16} color="#4B5563" />;
      }
    };

    const getTypeLabel = () => {
        switch (item.type) {
            case 'language': return 'Civilisation';
            case 'lexicon': return 'Mot';
            case 'grammar': return 'Grammaire';
            case 'example': return 'Exemple';
            default: return 'Archive';
        }
    };

    return (
      <TouchableOpacity 
        className="bg-white mx-6 mb-3 p-4 rounded-2xl border border-brand-100 shadow-sm"
      >
        <View className="flex-row items-center mb-2">
          <View className="bg-brand-50 p-2 rounded-lg mr-3">
            {getIcon()}
          </View>
          <View>
            <SansText className="text-[10px] text-brand-400 uppercase font-bold tracking-tighter">{getTypeLabel()}</SansText>
            <SerifText className="text-base font-bold text-brand-900">{item.title}</SerifText>
          </View>
        </View>
        <SansText className="text-brand-600 text-sm italic" numberOfLines={2}>
          "{item.content}"
        </SansText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-50" edges={['top']}>
      <View className="pt-6 px-6">
        <Heading level={1} className="text-brand-900 tracking-tight">Lexique</Heading>
        <SansText className="text-brand-500 -mt-4 mb-6 text-base italic">Exploration des concepts et leurs formes</SansText>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Rechercher par concept français..." />

      {loading && !search ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        <FlatList
          data={search.length > 1 ? searchResults : groupLexiconByLetter() as any[]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={search.length > 1 ? renderSearchResult : renderAccordionSection as any}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <SansText className="text-brand-400">Aucun résultat trouvé.</SansText>
            </View>
          }
        />
      )}

      <Modal visible={!!selectedWord} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] px-8 py-10 h-[80%]">
            <View className="absolute right-6 top-6 flex-row items-center z-50">
                {selectedWord && (
                    <TouchableOpacity 
                        className="bg-red-50 p-4 rounded-full mr-3 shadow-sm"
                        onPress={() => handleDelete(selectedWord.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Trash2 size={24} color="#EF4444" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    className="bg-brand-50 p-4 rounded-full shadow-sm"
                    onPress={() => setSelectedWord(null)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            {selectedWord && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <SansText className="text-brand-400 uppercase tracking-widest font-bold text-xs mb-2">Concept Universel</SansText>
                <SerifText className="text-5xl font-black text-brand-900 mb-2">{selectedWord.word}</SerifText>
                <View className="bg-brand-900 self-start px-3 py-1 rounded-full mb-8">
                  <SansText className="text-white text-[10px] font-bold uppercase">{selectedWord.type}</SansText>
                </View>

                <Heading level={2}>Traductions</Heading>
                {selectedWord.translations.map((t, idx) => (
                  <View key={idx} className="bg-brand-50 p-6 rounded-[32px] border border-brand-100 mb-6">
                     {/* CONLANG BADGE & MAIN TEXT */}
                     <View className="mb-4">
                        <View className="bg-brand-900 self-start px-3 py-1 rounded-full mb-3">
                            <SansText className="text-white text-[10px] font-black uppercase tracking-widest">{t.conlangName || t.conlangId}</SansText>
                        </View>
                        <SerifText className="text-4xl text-brand-900 font-bold">{t.text}</SerifText>
                     </View>

                     {/* NATIVE SCRIPT DISPLAY (STACKED) */}
                     <View className="bg-white/80 p-5 rounded-2xl border border-brand-100 items-center justify-center">
                        <NativeText lang={t.conlangId} style={{ fontSize: 44, lineHeight: 54 }} className="text-brand-900 text-center">
                            {t.nativeText || transliterate(t.text, t.conlangId)}
                        </NativeText>
                        <SansText className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-2">Script Natif</SansText>
                     </View>

                     <View className="flex-row flex-wrap mt-4">
                        {t.romanization && (
                            <View className="flex-row items-center mr-6 mb-2">
                                <Type size={14} color="#9CA3AF" />
                                <SansText className="text-sm text-brand-600 ml-2 italic">{t.romanization}</SansText>
                            </View>
                        )}
                        {t.pronunciation && (
                            <View className="flex-row items-center mb-2">
                                <Headphones size={14} color="#9CA3AF" />
                                <SansText className="text-sm text-brand-600 ml-2 font-medium">{t.pronunciation}</SansText>
                            </View>
                        )}
                     </View>

                     {t.conlangId === 'sindarin' && (
                         <View className="mt-4 p-4 bg-brand-200/50 rounded-2xl border border-brand-200">
                             <View className="flex-row justify-between items-center">
                                 <View>
                                     <SansText className="text-[10px] font-black text-brand-400 uppercase tracking-tighter italic">Pluriel (Mutation I-Umlaut)</SansText>
                                     <SerifText className="text-xl text-brand-900 font-bold">{applySindarinUmlaut(t.text)}</SerifText>
                                 </View>
                                 <NativeText lang="sindarin" className="text-3xl text-brand-900 opacity-60">
                                     {transliterate(applySindarinUmlaut(t.text), 'sindarin')}
                                 </NativeText>
                             </View>
                         </View>
                     )}
                  </View>
                ))}

                {selectedWord.etymology && (
                    <View className="mt-4">
                        <Heading level={2}>Étymologie</Heading>
                        <SansText className="text-brand-600 italic leading-6 mb-8">
                        {selectedWord.etymology}
                        </SansText>
                    </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
