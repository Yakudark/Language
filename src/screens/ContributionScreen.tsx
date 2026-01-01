import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, BookOpen, PenTool, Sparkles, CheckCircle2, ChevronRight, Languages, Globe, Mic, Repeat, Lightbulb } from 'lucide-react-native';

const SansBold = ({ children, style }: any) => <Text style={[{ fontFamily: 'Inter_700Bold' }, style]}>{children}</Text>;
const SerifBlack = ({ children, style }: any) => <Text style={[{ fontFamily: 'Merriweather_700Bold' }, style]}>{children}</Text>;

export const ContributionScreen = () => {
  const [activeType, setActiveType] = useState('Word');
  const [sourceLang, setSourceLang] = useState('Quenya');
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['Français']);
  
  const languages = ['Quenya', 'Sindarin', 'Klingon', 'Dothraki'];
  const targets = ['Français', 'English', 'Español', 'Deutsch'];

  const entryTypes = [
    { id: 'Language', icon: <Languages size={20} color="#374151" />, label: 'Civilization' },
    { id: 'Word', icon: <BookOpen size={20} color="#374151" />, label: 'Word' },
    { id: 'Grammar', icon: <PenTool size={20} color="#374151" />, label: 'Grammar' },
    { id: 'Phonology', icon: <Mic size={20} color="#374151" />, label: 'Phonology' },
    { id: 'Conjugation', icon: <Repeat size={20} color="#374151" />, label: 'Conjugation' },
    { id: 'Example', icon: <Lightbulb size={20} color="#374151" />, label: 'Example' },
  ];

  const toggleTarget = (lang: string) => {
    if (selectedTargets.includes(lang)) {
      setSelectedTargets(selectedTargets.filter(t => t !== lang));
    } else {
      setSelectedTargets([...selectedTargets, lang]);
    }
  };

  const renderSourceLangPicker = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 12, letterSpacing: 1 }}>CHOOSE SOURCE CIVILIZATION</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {languages.map(lang => (
          <TouchableOpacity 
            key={lang}
            onPress={() => setSourceLang(lang)}
            style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: sourceLang === lang ? '#111827' : 'white', borderWidth: 1, borderColor: sourceLang === lang ? '#111827' : '#E5E7EB', marginRight: 8, marginBottom: 8 }}
          >
            <Text style={{ fontSize: 13, color: sourceLang === lang ? 'white' : '#6B7280', fontWeight: sourceLang === lang ? 'bold' : 'normal' }}>{lang}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFormFields = () => {
    const needsSourceLang = activeType !== 'Language';

    return (
      <View>
        {needsSourceLang && renderSourceLangPicker()}

        {activeType === 'Word' && (
          <View>
             <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 12, letterSpacing: 1 }}>TARGET TRANSLATIONS</Text>
             <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
               {targets.map(lang => {
                 const isSelected = selectedTargets.includes(lang);
                 return (
                   <TouchableOpacity 
                     key={lang}
                     onPress={() => toggleTarget(lang)}
                     style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: isSelected ? '#111827' : 'transparent', borderWidth: 1, borderColor: isSelected ? '#111827' : '#E5E7EB', marginRight: 8, marginBottom: 8 }}
                   >
                     {isSelected && <CheckCircle2 size={12} color="white" style={{ marginRight: 6 }} />}
                     <Text style={{ fontSize: 13, color: isSelected ? 'white' : '#6B7280', fontWeight: isSelected ? 'bold' : 'normal' }}>{lang}</Text>
                   </TouchableOpacity>
                 );
               })}
             </View>

             <View style={{ marginBottom: 24 }}>
               <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>WORD IN {sourceLang.toUpperCase()}</Text>
               <TextInput placeholder={`Enter word`} style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 18 }} />
             </View>

             {selectedTargets.map((lang) => (
               <View key={lang} style={{ marginBottom: 20, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6' }}>
                 <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827', letterSpacing: 1, marginBottom: 8 }}>TRANSLATION IN {lang.toUpperCase()}</Text>
                 <TextInput placeholder={`Enter meaning`} style={{ padding: 4, fontSize: 16, color: '#111827', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
               </View>
             ))}
          </View>
        )}

        {activeType === 'Phonology' && (
          <View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>PHONETIC SYMBOL FOR {sourceLang.toUpperCase()}</Text>
              <TextInput placeholder="e.g. /IPA/" style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', fontFamily: 'monospace' }} />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>DESCRIPTION & RULES</Text>
              <TextInput multiline placeholder="Pronunciation guide..." style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', height: 100 }} />
            </View>
          </View>
        )}

        {activeType === 'Conjugation' && (
          <View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>{sourceLang.toUpperCase()} VERB ROOT</Text>
              <TextInput placeholder="e.g. Mat- (to eat)" style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' }} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 16 }}>CONJUGATION TABLE (PRESENT)</Text>
            {['1st Person', '2nd Person', '3rd Person'].map(p => (
              <View key={p} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ flex: 1, fontSize: 13, color: '#374151' }}>{p}</Text>
                <TextInput placeholder="Form" style={{ flex: 2, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }} />
              </View>
            ))}
          </View>
        )}

        {activeType === 'Example' && (
          <View>
             <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>SENTENCE IN {sourceLang.toUpperCase()}</Text>
              <TextInput multiline placeholder="Enter original phrase..." style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', fontStyle: 'italic' }} />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>TRANSLATION</Text>
              <TextInput multiline placeholder="Meaning..." style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' }} />
            </View>
          </View>
        )}

        {activeType === 'Grammar' && (
          <View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>RULE NAME ({sourceLang.toUpperCase()})</Text>
              <TextInput placeholder="e.g. Plurality" style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' }} />
            </View>
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>EXPLANATION</Text>
              <TextInput multiline placeholder="Detail the rule..." style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', height: 100 }} />
            </View>
          </View>
        )}

        {activeType === 'Language' && (
          <View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>NEW CIVILIZATION NAME</Text>
              <TextInput placeholder="e.g. Valyrian" style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' }} />
            </View>
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>HISTORY & CONTEXT</Text>
              <TextInput multiline placeholder="Describe the civilization..." style={{ backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', height: 100 }} />
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
          <Text style={{ color: '#6B7280', marginBottom: 32 }}>Add new records to the encyclopedia</Text>

          {/* Type Selector Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32, marginHorizontal: -4 }}>
            {entryTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setActiveType(type.id)}
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
                <View style={{ marginBottom: 8 }}>
                   {React.cloneElement(type.icon as React.ReactElement, { color: activeType === type.id ? 'white' : '#374151' })}
                </View>
                <Text style={{ color: activeType === type.id ? 'white' : '#374151', fontSize: 9, fontWeight: 'bold', textAlign: 'center' }}>{type.label.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
             <SansBold style={{ fontSize: 20, marginBottom: 24, color: '#111827' }}>Draft: {activeType}</SansBold>
             
             {renderFormFields()}

             <TouchableOpacity 
               disabled={activeType === 'Word' && selectedTargets.length === 0}
               style={{ backgroundColor: (activeType === 'Word' && selectedTargets.length === 0) ? '#D1D5DB' : '#111827', padding: 20, borderRadius: 24, alignItems: 'center', marginTop: 12 }}
               onPress={() => alert('Record saved to drafts!')}
             >
                <SansBold style={{ color: 'white', letterSpacing: 1 }}>SAVE RECORD</SansBold>
             </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
