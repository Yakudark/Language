import React, { useState } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar, FilterChip } from '../components/UI';
import { LanguageItem } from '../components/LanguageItem';
import { LANGUAGES } from '../data/languages';
import { SansText, Heading } from '../components/Typography';

export const HomeScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Middle-earth', 'Star Trek', 'Fantasy', 'Sci-Fi'];

  const filteredLanguages = LANGUAGES.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                          l.universe.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || l.universe === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView className="flex-1 bg-brand-50" edges={['top']}>
      <View className="pt-6 px-6">
        <Heading level={1} className="text-brand-900 tracking-tight">Encyclopedia</Heading>
        <SansText className="text-brand-500 -mt-4 mb-6 text-base italic">Linguistic records of known civilizations</SansText>
      </View>
      
      <SearchBar value={search} onChangeText={setSearch} />
      
      <View className="mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6 py-2">
          {filters.map(f => (
            <FilterChip 
              key={f} 
              label={f} 
              active={activeFilter === f} 
              onPress={() => setActiveFilter(f)} 
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredLanguages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LanguageItem 
            language={item} 
            onPress={() => navigation.navigate('LanguageDetail', { language: item })} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};
