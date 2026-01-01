import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ArrowLeft, Share2, Trash2, Headphones, Type } from 'lucide-react-native';
import { SansText, SerifText, Heading, MonoText, NativeText } from '../components/Typography';
import { CollapsibleSection, DataTable, ExampleCard, Divider } from '../components/UI';
import { repository } from '../repositories/EncyclopediaRepository';
import { 
  LanguageModel, 
  GrammarSectionModel, 
  PhoneticsModel, 
  ExampleModel, 
  LexiconEntryModel 
} from '../models/database';
import { getLanguageImage } from '../utils/assetManager';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const LanguageDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [activeTab, setActiveTab] = useState('Vue d\'ensemble');
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<LanguageModel | null>(null);
  const [grammar, setGrammar] = useState<GrammarSectionModel[]>([]);
  const [phonetics, setPhonetics] = useState<PhoneticsModel | null>(null);
  const [examples, setExamples] = useState<ExampleModel[]>([]);
  const [lexicon, setLexicon] = useState<LexiconEntryModel[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const langData = await repository.getLanguageById(id);
      if (!langData) return;
      
      setLanguage(langData);
      
      const [grammarData, phoneticsData, examplesData, lexiconData] = await Promise.all([
        repository.getGrammarSections(id),
        repository.getPhonetics(id),
        repository.getExamples(id),
        repository.getLexiconEntries(id)
      ]);
      
      setGrammar(grammarData);
      setPhonetics(phoneticsData);
      setExamples(examplesData);
      setLexicon(lexiconData);
    } catch (error) {
      console.error("Erreur lors du chargement des détails :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir effacer définitivement les archives de ${language?.name} ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              await repository.deleteLanguage(id);
              navigation.navigate('Main', { screen: 'Archive' });
            } catch (error) {
              console.error("Erreur de suppression :", error);
              Alert.alert("Erreur", "Impossible de supprimer la civilisation.");
            }
          }
        }
      ]
    );
  };

  const tabs = ['Vue d\'ensemble', 'Écriture', 'Phonologie', 'Grammaire', 'Lexique', 'Conjugaison', 'Exemples'];

  if (loading || !language) {
    return (
      <View className="flex-1 bg-brand-50 justify-center items-center">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Vue d\'ensemble':
        return (
          <View className="mb-8">
            <SerifText className="text-lg leading-7 text-brand-800 italic mb-6">
              {language.description}
            </SerifText>
            
            <Heading level={2}>Contexte</Heading>
            <View className="bg-brand-100 p-4 rounded-xl mb-6">
              <View className="flex-row justify-between mb-2">
                <SansText className="text-brand-500">Univers</SansText>
                <SansText className="font-semibold text-brand-900">{language.universe}</SansText>
              </View>
              <View className="flex-row justify-between mb-2">
                <SansText className="text-brand-500">Classification</SansText>
                <SansText className="font-semibold text-brand-900">{language.tags.join(', ')}</SansText>
              </View>
            </View>
          </View>
        );
      case 'Écriture':
        return (
          <View className="mb-8">
            <Heading level={2}>{language.writingSystemName}</Heading>
            <SansText className="text-brand-700 leading-6 mb-4">
              {language.writingSystemDescription}
            </SansText>
            <View className="bg-brand-50 border-2 border-dashed border-brand-200 aspect-[4/3] items-center justify-center rounded-2xl">
              <SerifText className="text-brand-300 text-center px-8 italic">Représentation visuelle de l'écriture ancienne</SerifText>
            </View>
          </View>
        );
      case 'Phonologie':
        return (
          <View className="mb-8">
            <Heading level={2}>Système Phonétique</Heading>
            <SansText className="text-brand-700 mb-6">{phonetics?.description || 'Détails phonétiques non disponibles.'}</SansText>
            
            {phonetics && (
              <>
                <CollapsibleSection title="Voyelles" defaultOpen>
                  <View className="flex-row flex-wrap">
                    {phonetics.vowels.map(v => (
                      <MonoText key={v} className="mr-2 mb-2 px-3 py-1 font-bold">/{v}/</MonoText>
                    ))}
                  </View>
                </CollapsibleSection>

                <CollapsibleSection title="Consonnes">
                  <View className="flex-row flex-wrap">
                    {phonetics.consonants.map(c => (
                      <MonoText key={c} className="mr-2 mb-2 px-3 py-1 font-bold">/{c}/</MonoText>
                    ))}
                  </View>
                </CollapsibleSection>
              </>
            )}
          </View>
        );
      case 'Grammaire':
        return (
          <View className="mb-8">
            <Heading level={2}>Règles de Grammaire</Heading>
            {grammar.length > 0 ? grammar.map((g, i) => (
              <CollapsibleSection key={i} title={g.title} defaultOpen={i === 0}>
                <SansText className="text-brand-700 leading-6">{g.content}</SansText>
              </CollapsibleSection>
            )) : (
              <SansText className="text-brand-400 italic">Aucune règle enregistrée.</SansText>
            )}
          </View>
        );
      case 'Lexique':
        return (
          <View className="mb-8">
            <Heading level={2}>Lexique local</Heading>
            <View className="mb-4">
              <View className="flex-row border-b border-brand-100 py-2">
                <SansText className="w-1/3 font-bold text-brand-900">Concept</SansText>
                <SansText className="w-1/3 font-bold text-brand-900">Natif</SansText>
                <SerifText className="w-1/3 font-bold text-brand-900">Spoken</SerifText>
              </View>
              {lexicon.length > 0 ? lexicon.slice(0, 15).map(item => {
                const translation = item.translations.find(t => t.conlangId === id);
                return (
                    <TouchableOpacity 
                        key={item.id} 
                        className="flex-row border-b border-brand-50 py-4 items-center"
                        onPress={() => navigation.navigate('Main', { screen: 'Dictionary' })}
                    >
                      <View className="w-1/3">
                        <SansText className="text-brand-900 font-bold">{item.word}</SansText>
                        <SansText className="text-[10px] text-brand-400 uppercase">{item.type}</SansText>
                      </View>
                      <View className="w-1/3">
                        <NativeText lang={id} className="text-brand-900 text-xl font-bold">
                            {translation?.nativeText || translation?.text || '-'}
                        </NativeText>
                      </View>
                      <View className="w-1/3">
                        <View className="flex-row items-center">
                            <Headphones size={10} color="#9CA3AF" />
                            <SansText className="text-brand-600 text-xs ml-1 italic" numberOfLines={1}>
                                {translation?.pronunciation || translation?.romanization || '-'}
                            </SansText>
                        </View>
                      </View>
                    </TouchableOpacity>
                );
              }) : (
                  <SansText className="text-brand-400 italic py-10 text-center">Aucun mot enregistré pour cette langue.</SansText>
              )}
            </View>
            <TouchableOpacity 
               className="bg-brand-100 p-4 rounded-xl items-center mt-4 border border-brand-200"
               onPress={() => navigation.navigate('Main', { screen: 'Dictionary' })}
            >
              <SansText className="text-brand-900 font-bold uppercase tracking-widest text-xs">Explorer tout le dictionnaire</SansText>
            </TouchableOpacity>
          </View>
        );
      case 'Conjugaison':
        return (
          <View className="mb-8">
            <Heading level={2}>Conjugaison des Verbes</Heading>
            <SansText className="text-brand-700 mb-4 font-medium">Présentation Indicative Standard</SansText>
            <DataTable 
              headers={['Personne', 'Singulier', 'Pluriel']} 
              rows={[
                ['1ère', '...', '...'],
                ['2ème', '...', '...'],
                ['3ème', '...', '...']
              ]} 
            />
            <Divider />
            <SansText className="text-sm text-brand-500 italic mt-2">
              Note : Les tableaux détaillés sont en cours d'archivage.
            </SansText>
          </View>
        );
      case 'Exemples':
        return (
          <View className="mb-8">
            <Heading level={2}>Exemples d'Usage</Heading>
            {examples.length > 0 ? examples.map(ex => (
              <ExampleCard 
                key={ex.id}
                native={ex.native}
                translit={ex.transliteration || ''}
                translation={ex.translation}
                notes={ex.notes}
              />
            )) : (
              <SansText className="text-brand-400 italic">Aucun exemple enregistré.</SansText>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-brand-50">
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <ImageBackground 
          source={getLanguageImage(language.image)} 
          className="h-96 w-full"
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(17,24,39,0.9)']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <SafeAreaView edges={['top']} className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-black/30 rounded-full">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row">
              <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} className="p-2 mr-2 bg-black/30 rounded-full">
                <Heart size={24} color={isFavorite ? "#EF4444" : "white"} fill={isFavorite ? "#EF4444" : "transparent"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} className="p-2 mr-2 bg-black/30 rounded-full">
                <Trash2 size={24} color="#F87171" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 bg-black/30 rounded-full">
                <Share2 size={24} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <View className="absolute bottom-10 px-6">
            <SerifText className="text-5xl font-black text-white tracking-widest uppercase">{language.name}</SerifText>
            <SansText className="text-lg text-white/70 italic mt-1 font-light tracking-wide">{language.nativeName}</SansText>
            <View className="flex-row flex-wrap mt-6">
              <View className="bg-white/10 border border-white/20 px-4 py-1 rounded-full backdrop-blur-md">
                 <SansText className="text-xs text-white uppercase tracking-[0.2em] font-bold">{language.universe}</SansText>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View className="bg-brand-50 border-b border-brand-200 shadow-sm">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 py-4">
            {tabs.map(tab => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                className={`mr-8 pb-3 border-b-2 ${activeTab === tab ? 'border-brand-900' : 'border-transparent'}`}
              >
                <SansText className={`text-xs font-bold uppercase tracking-[0.15em] ${activeTab === tab ? 'text-brand-900' : 'text-brand-400'}`}>
                  {tab}
                </SansText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 py-10">
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
};
