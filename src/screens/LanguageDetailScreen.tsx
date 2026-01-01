import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ArrowLeft, Share2 } from 'lucide-react-native';
import { SansText, SerifText, Heading, MonoText } from '../components/Typography';
import { CollapsibleSection, DataTable, ExampleCard, Divider } from '../components/UI';
import { Language } from '../data/languages';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const LanguageDetailScreen = ({ route, navigation }: any) => {
  const { language }: { language: Language } = route.params;
  const [activeTab, setActiveTab] = useState('Overview');
  const [isFavorite, setIsFavorite] = useState(false);

  const tabs = ['Overview', 'Writing', 'Phonology', 'Grammar', 'Dictionary', 'Conjugation', 'Examples'];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <View className="mb-8">
            <SerifText className="text-lg leading-7 text-brand-800 italic mb-6">
              {language.description}
            </SerifText>
            
            <Heading level={2}>Context</Heading>
            <View className="bg-brand-100 p-4 rounded-xl mb-6">
              <View className="flex-row justify-between mb-2">
                <SansText className="text-brand-500">Universe</SansText>
                <SansText className="font-semibold text-brand-900">{language.universe}</SansText>
              </View>
              <View className="flex-row justify-between mb-2">
                <SansText className="text-brand-500">Classification</SansText>
                <SansText className="font-semibold text-brand-900">{language.tags.join(', ')}</SansText>
              </View>
            </View>
          </View>
        );
      case 'Writing':
        return (
          <View className="mb-8">
            <Heading level={2}>{language.writingSystem.name}</Heading>
            <SansText className="text-brand-700 leading-6 mb-4">
              {language.writingSystem.description}
            </SansText>
            <View className="bg-brand-50 border-2 border-dashed border-brand-200 aspect-[4/3] items-center justify-center rounded-2xl">
              <SerifText className="text-brand-300 text-center px-8 italic">Visual depiction of the ancient script</SerifText>
            </View>
          </View>
        );
      case 'Phonology':
        return (
          <View className="mb-8">
            <Heading level={2}>Phonetic System</Heading>
            <SansText className="text-brand-700 mb-6">{language.phonetics.description}</SansText>
            
            <CollapsibleSection title="Vowels" defaultOpen>
              <View className="flex-row flex-wrap">
                {language.phonetics.vowels.map(v => (
                  <MonoText key={v} className="mr-2 mb-2 px-3 py-1 font-bold">/{v}/</MonoText>
                ))}
              </View>
            </CollapsibleSection>

            <CollapsibleSection title="Consonants">
              <View className="flex-row flex-wrap">
                {language.phonetics.consonants.map(c => (
                  <MonoText key={c} className="mr-2 mb-2 px-3 py-1 font-bold">/{c}/</MonoText>
                ))}
              </View>
            </CollapsibleSection>
          </View>
        );
      case 'Grammar':
        return (
          <View className="mb-8">
            <Heading level={2}>Grammar Rules</Heading>
            {language.grammar.map((g, i) => (
              <CollapsibleSection key={i} title={g.title} defaultOpen={i === 0}>
                <SansText className="text-brand-700 leading-6">{g.content}</SansText>
                {g.title === 'Nouns' && (
                   <DataTable 
                    headers={['Case', 'Singular', 'Plural']} 
                    rows={[
                      ['Nom.', '-a', '-ar'],
                      ['Gen.', '-o', '-on'],
                      ['Dat.', '-n', '-in']
                    ]} 
                  />
                )}
              </CollapsibleSection>
            ))}
          </View>
        );
      case 'Dictionary':
        return (
          <View className="mb-8">
            <Heading level={2}>Core Terminology</Heading>
            <View className="mb-4">
              <View className="flex-row border-b border-brand-100 py-2">
                <SerifText className="w-1/2 font-bold text-brand-900">Term</SerifText>
                <SansText className="w-1/2 font-bold text-brand-900">English</SansText>
              </View>
              <View className="flex-row border-b border-brand-50 py-3">
                <SerifText className="w-1/2">Elen</SerifText>
                <SansText className="w-1/2 text-brand-600">Star</SansText>
              </View>
              <View className="flex-row border-b border-brand-50 py-3">
                <SerifText className="w-1/2">Isil</SerifText>
                <SansText className="w-1/2 text-brand-600">Moon</SansText>
              </View>
            </View>
            <TouchableOpacity 
               className="bg-brand-100 p-4 rounded-xl items-center mt-4 border border-brand-200"
               onPress={() => navigation.navigate('Main', { screen: 'Dictionary' })}
            >
              <SansText className="text-brand-900 font-bold uppercase tracking-widest text-xs">Full Lexicon</SansText>
            </TouchableOpacity>
          </View>
        );
      case 'Conjugation':
        return (
          <View className="mb-8">
            <Heading level={2}>Verb Conjugation</Heading>
            <SansText className="text-brand-700 mb-4 font-medium">Present Indicative of "to be"</SansText>
            <DataTable 
              headers={['Person', 'Singular', 'Plural']} 
              rows={[
                ['1st', 'nanyë', 'nalmë'],
                ['2nd', 'nalyë', 'naldë'],
                ['3rd', 'nassë', 'nantë']
              ]} 
            />
            <Divider />
            <SansText className="text-sm text-brand-500 italic mt-2">
              Note: Suffixes are attached to the verb stem to indicate person and number.
            </SansText>
          </View>
        );
      case 'Examples':
        return (
          <View className="mb-8">
            <Heading level={2}>Usage Examples</Heading>
            {language.examples.map(ex => (
              <ExampleCard 
                key={ex.id}
                native={ex.native}
                translit={ex.transliteration}
                translation={ex.translation}
                notes={ex.notes}
              />
            ))}
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
          source={language.image} 
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
