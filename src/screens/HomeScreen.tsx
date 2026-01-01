import React, { useState, useEffect } from 'react';
import { View, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar, FilterChip } from '../components/UI';
import { LanguageItem } from '../components/LanguageItem';
import { repository } from '../repositories/EncyclopediaRepository';
import { LanguageModel } from '../models/database';
import { SansText, Heading } from '../components/Typography';
import { useIsFocused } from '@react-navigation/native';

export const HomeScreen = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [languages, setLanguages] = useState<LanguageModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      loadLanguages();
    }
  }, [isFocused]);

  const loadLanguages = async () => {
    try {
      const data = await repository.getLanguages();
      setLanguages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des langues :", error);
    } finally {
      setLoading(false);
    }
  };

  const filters = ['Tout', 'Terre du Milieu', 'Star Trek', 'Game of Thrones', 'Fantasy', 'Sci-Fi'];

  const filteredLanguages = languages.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                          l.universe.toLowerCase().includes(search.toLowerCase());
    const filterValue = activeFilter === 'Tout' ? 'All' : activeFilter;
    const matchesFilter = activeFilter === 'Tout' || l.universe === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView className="flex-1 bg-brand-50" edges={['top']}>
      <View className="pt-6 px-6">
        <Heading level={1} className="text-brand-900 tracking-tight">Encyclopédie</Heading>
        <SansText className="text-brand-500 -mt-4 mb-6 text-base italic">Archives linguistiques des civilisations connues</SansText>
      </View>
      
      <SearchBar value={search} onChangeText={setSearch} placeholder="Rechercher une civilisation..." />
      
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

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        <FlatList
          data={filteredLanguages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <LanguageItem 
              language={item} 
              onPress={() => navigation.navigate('LanguageDetail', { id: item.id })} 
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <SansText className="text-brand-400">Aucun enregistrement trouvé.</SansText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
