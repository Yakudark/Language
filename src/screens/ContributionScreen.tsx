import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, BookOpen, PenTool, Sparkles, CheckCircle2, Languages, Globe, Mic, Repeat, Lightbulb, AlertCircle, Type, Headphones, Wand2 } from 'lucide-react-native';
import { repository } from '../repositories/EncyclopediaRepository';
import { LanguageModel, LexiconEntryModel } from '../models/database';
import { transliterate, generatePronunciation } from '../utils/transliteration';
import { NativeText } from '../components/Typography';

const SansBold = ({ children, style }: any) => <Text style={[{ fontFamily: 'Inter_700Bold' }, style]}>{children}</Text>;
const SerifBlack = ({ children, style }: any) => <Text style={[{ fontFamily: 'Merriweather_700Bold' }, style]}>{children}</Text>;

export const ContributionScreen = ({ navigation }: any) => {
  const [activeType, setActiveType] = useState('Word');
  const [targetLangId, setTargetLangId] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState<LanguageModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [frenchWord, setFrenchWord] = useState('');
  const [translatedValue, setTranslatedValue] = useState('');
  const [nativeText, setNativeText] = useState('');
  const [romanization, setRomanization] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [content, setContent] = useState('');
  const [nativeName, setNativeName] = useState('');
  const [universe, setUniverse] = useState('');
  const [entryName, setEntryName] = useState('');

  // Existing check state
  const [existingEntry, setExistingEntry] = useState<LexiconEntryModel | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const data = await repository.getLanguages();
      setAvailableLanguages(data);
      if (data.length > 0 && !targetLangId) setTargetLangId(data[0].id);
    } catch (error) {
      console.error("Erreur chargement langues contribution :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeType === 'Word' && frenchWord.length > 1) {
        const timer = setTimeout(async () => {
            setCheckingExisting(true);
            try {
                const entry = await repository.getLexiconEntryByWord(frenchWord);
                setExistingEntry(entry);
            } catch (error) {
                console.error("Check error:", error);
            } finally {
                setCheckingExisting(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    } else {
        setExistingEntry(null);
    }
  }, [frenchWord, activeType]);

  const handleAutoTransliterate = () => {
    if (!translatedValue) {
      Alert.alert("Attente", "Veuillez d'abord saisir le mot traduit pour générer le script natif.");
      return;
    }
    const native = transliterate(translatedValue, targetLangId);
    setNativeText(native);
    
    // Also generate IPA if empty
    if (!pronunciation) {
      const p = generatePronunciation(translatedValue, targetLangId);
      setPronunciation(p);
    }

    // Also auto-fill romanization if empty (usually same as translatedValue)
    if (!romanization) {
      setRomanization(translatedValue.toLowerCase());
    }
  };

  const handleSave = async () => {
    try {
      if (activeType === 'Language') {
        if (!entryName || !universe) {
          Alert.alert("Information manquante", "Veuillez entrer un nom et un univers.");
          return;
        }
        await repository.addLanguage({
          name: entryName,
          nativeName: nativeName || entryName,
          universe: universe,
          description: content,
          image: 'quenya', 
          tags: ['Construite'],
          writingSystemName: 'Inconnu',
          writingSystemDescription: 'Aucune description disponible.'
        });
        Alert.alert("Succès", "Civilisation ajoutée à l'encyclopédie !");
      } else if (activeType === 'Word') {
        if (!frenchWord || !translatedValue) {
          Alert.alert("Information manquante", "Veuillez entrer le mot en français et sa traduction.");
          return;
        }

        if (existingEntry) {
            const alreadyTranslated = existingEntry.translations.find(t => t.conlangId === targetLangId && t.text.toLowerCase() === translatedValue.toLowerCase());
            if (alreadyTranslated) {
                Alert.alert("Déjà existant", `Ce concept possède déjà la traduction "${translatedValue}" pour cette langue.`);
                return;
            }

            await repository.addTranslation(existingEntry.id, {
                conlangId: targetLangId,
                text: translatedValue,
                nativeText,
                romanization,
                pronunciation
            }, targetLangId, frenchWord);
            Alert.alert("Succès", `Traduction ajoutée au concept existant "${frenchWord}" !`);
        } else {
            await repository.addLexiconEntry({
              word: frenchWord,
              type: 'Nom',
              conlangId: targetLangId,
              translation: translatedValue,
              nativeText,
              romanization,
              pronunciation
            });
            Alert.alert("Succès", "Nouveau concept créé !");
        }
      }

      // Reset form
      setFrenchWord('');
      setTranslatedValue('');
      setNativeText('');
      setRomanization('');
      setPronunciation('');
      setEntryName('');
      setContent('');
      setNativeName('');
      setUniverse('');
      setExistingEntry(null);
      loadLanguages();
      
    } catch (error) {
      console.error("Erreur sauvegarde :", error);
      Alert.alert("Erreur", "Impossible de sauvegarder l'enregistrement.");
    }
  };

  const entryTypes = [
    { id: 'Language', Icon: Languages, label: 'Civilisation' },
    { id: 'Word', Icon: BookOpen, label: 'Mot' },
    { id: 'Grammar', Icon: PenTool, label: 'Grammaire' },
    { id: 'Phonology', Icon: Mic, label: 'Phonologie' },
    { id: 'Conjugation', Icon: Repeat, label: 'Conjugaison' },
    { id: 'Example', Icon: Lightbulb, label: 'Exemple' },
  ];

  const targetLangName = availableLanguages.find(l => l.id === targetLangId)?.name || 'Inconnue';

  const renderTargetLangPicker = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 12, letterSpacing: 1 }}>CHOISIR LA CIVILISATION CIBLE</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {availableLanguages.map(lang => (
          <TouchableOpacity 
            key={lang.id}
            onPress={() => setTargetLangId(lang.id)}
            style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: targetLangId === lang.id ? '#111827' : 'white', borderWidth: 1, borderColor: targetLangId === lang.id ? '#111827' : '#E5E7EB', marginRight: 8, marginBottom: 8 }}
          >
            <Text style={{ fontSize: 13, color: targetLangId === lang.id ? 'white' : '#6B7280', fontWeight: targetLangId === lang.id ? 'bold' : 'normal' }}>{lang.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFormFields = () => {
    const isLang = activeType === 'Language';

    return (
      <View>
        {!isLang && renderTargetLangPicker()}

        {activeType === 'Word' && (
          <View>
             <View style={{ marginBottom: 24 }}>
               <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>MOT EN FRANÇAIS (CONCEPT)</Text>
               <TextInput 
                value={frenchWord}
                onChangeText={setFrenchWord}
                placeholder={`ex: Ami, Soleil...`} 
                style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 18 }} 
               />
               
               {checkingExisting && <ActivityIndicator size="small" color="#111827" style={{ marginTop: 8 }} />}

               {existingEntry && (
                   <View style={{ marginTop: 12, padding: 12, backgroundColor: '#FEF3C7', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                           <AlertCircle size={14} color="#D97706" />
                           <Text style={{ marginLeft: 6, fontSize: 11, fontWeight: 'bold', color: '#B45309' }}>CONCEPT UNIVERSEL DÉCOUVERT</Text>
                       </View>
                       <Text style={{ fontSize: 12, color: '#92400E' }}>Ce mot est déjà dans les archives avec :</Text>
                       <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                           {existingEntry.translations.map((t, idx) => (
                               <View key={idx} style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6, marginBottom: 4, borderWidth: 1, borderColor: '#FED7AA' }}>
                                   <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 'bold' }}>{t.conlangName?.toUpperCase()}</Text>
                                   <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827' }}>{t.text}</Text>
                               </View>
                           ))}
                       </View>
                   </View>
               )}
             </View>

             <View style={{ marginBottom: 24, padding: 20, backgroundColor: '#F9FAFB', borderRadius: 28, borderWidth: 1, borderColor: '#F3F4F6' }}>
               <SansBold style={{ fontSize: 14, color: '#111827', marginBottom: 16 }}>DÉTAILS EN {targetLangName.toUpperCase()}</SansBold>
               
               <View style={{ marginBottom: 16 }}>
                 <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 6 }}>MOT / ÉTIQUETTE</Text>
                 <TextInput 
                  value={translatedValue}
                  onChangeText={setTranslatedValue}
                  placeholder={`ex: Mellon`} 
                  style={{ fontSize: 16, color: '#111827', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 4 }} 
                 />
               </View>

               <View style={{ marginBottom: 16 }}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Type size={12} color="#9CA3AF" />
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', marginLeft: 4 }}>CARACTÈRES SPÉCIAUX (SCRIPT)</Text>
                    </View>
                    <TouchableOpacity onPress={handleAutoTransliterate} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                       <Wand2 size={10} color="#7C3AED" />
                       <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#7C3AED', marginLeft: 4 }}>GÉNÉRER</Text>
                    </TouchableOpacity>
                 </View>
                  <TextInput 
                  value={nativeText}
                  onChangeText={setNativeText}
                  placeholder={`ex: 󱲣󱲩󱲫󱲫󱲮󱲫 ou 안녕하세요`} 
                  style={{ 
                    fontSize: 24, 
                    color: '#111827', 
                    borderBottomWidth: 1, 
                    borderBottomColor: '#E5E7EB', 
                    paddingBottom: 4,
                    fontFamily: targetLangId.toLowerCase().includes('sindarin') ? 'Tengwar' : (targetLangId.toLowerCase().includes('cor') || targetLangId.toLowerCase().includes('kor') ? 'Merriweather_400Regular' : undefined) 
                  }} 
                 />
                 {nativeText && (targetLangId.toLowerCase().includes('sindarin') || targetLangId.toLowerCase().includes('cor') || targetLangId.toLowerCase().includes('kor')) && (
                   <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center' }}>
                     <NativeText lang={targetLangId} style={{ fontSize: 40, color: '#111827' }}>{nativeText}</NativeText>
                     <Text style={{ fontSize: 9, color: '#9CA3AF', marginTop: 4 }}>
                       {targetLangId.toLowerCase().includes('sindarin') ? 'APERÇU CALLIGRAPHIQUE' : 'APERÇU HANGUL'}
                     </Text>
                   </View>
                 )}
               </View>

               <View style={{ marginBottom: 16 }}>
                 <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 6 }}>ROMANISATION</Text>
                 <TextInput 
                  value={romanization}
                  onChangeText={setRomanization}
                  placeholder={`ex: mellon`} 
                  style={{ fontSize: 16, color: '#111827', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 4 }} 
                 />
               </View>

               <View style={{ marginBottom: 8 }}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Headphones size={12} color="#9CA3AF" />
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', marginLeft: 4 }}>PRONONCIATION (IPA)</Text>
                 </View>
                 <TextInput 
                  value={pronunciation}
                  onChangeText={setPronunciation}
                  placeholder={`ex: [ˈmɛl.lɔn]`} 
                  style={{ fontSize: 16, color: '#111827', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 4 }} 
                 />
               </View>
             </View>
          </View>
        )}

        {isLang && (
          <View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>NOM DE LA CIVILISATION</Text>
              <TextInput value={entryName} onChangeText={setEntryName} placeholder="ex: Quenya" style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' }} />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>NOM NATIF</Text>
              <TextInput value={nativeName} onChangeText={setNativeName} placeholder="ex: Eldarin" style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' }} />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>UNIVERS</Text>
              <TextInput value={universe} onChangeText={setUniverse} placeholder="ex: Terre du Milieu" style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' }} />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>DESCRIPTION</Text>
              <TextInput value={content} onChangeText={setContent} multiline placeholder="Vue d'ensemble générale..." style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', height: 100 }} />
            </View>
          </View>
        )}

        {!isLang && activeType !== 'Word' && (
           <View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>TITRE DE L'ENTRÉE</Text>
              <TextInput value={entryName} onChangeText={setEntryName} placeholder="ex: Cas de noms" style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' }} />
            </View>
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>CONTENU</Text>
              <TextInput value={content} onChangeText={setContent} multiline placeholder="Règles détaillées ou exemples..." style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', height: 120 }} />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <SerifBlack style={{ fontSize: 32, color: '#111827', marginBottom: 8 }}>Contribution</SerifBlack>
          <Text style={{ color: '#6B7280', marginBottom: 32 }}>Enrichir l'encyclopédie universelle</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#111827" />
          ) : (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32, marginHorizontal: -4 }}>
                {entryTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => {
                        setActiveType(type.id);
                        setFrenchWord('');
                        setTranslatedValue('');
                        setNativeText('');
                        setRomanization('');
                        setPronunciation('');
                        setEntryName('');
                        setContent('');
                        setExistingEntry(null);
                    }}
                    style={{
                      width: '31%',
                      aspectRatio: 1,
                      padding: 12,
                      backgroundColor: activeType === type.id ? '#111827' : 'white',
                      borderRadius: 24,
                      margin: '1%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      elevation: 2
                    }}
                  >
                    <type.Icon size={20} color={activeType === type.id ? 'white' : '#374151'} />
                    <Text style={{ color: activeType === type.id ? 'white' : '#374151', fontSize: 9, fontWeight: 'bold', textAlign: 'center', marginTop: 8 }}>{type.label.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                <SansBold style={{ fontSize: 20, marginBottom: 24, color: '#111827' }}>Brouillon : {activeType}</SansBold>
                
                {renderFormFields()}

                <TouchableOpacity 
                  onPress={handleSave}
                  style={{ backgroundColor: '#111827', padding: 20, borderRadius: 24, alignItems: 'center', marginTop: 12 }}
                >
                    <SansBold style={{ color: 'white', letterSpacing: 1 }}>SAUVEGARDER</SansBold>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
