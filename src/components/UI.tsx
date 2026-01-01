import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SansText, SerifText, MonoText } from './Typography';
import { ChevronDown, ChevronRight, Search } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SearchBar = ({ value, onChangeText, placeholder = "Rechercher..." }: { value: string, onChangeText: (t: string) => void, placeholder?: string }) => (
  <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-xl mx-4 my-2 border border-gray-200">
    <Search size={18} color="#9CA3AF" />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      className="flex-1 ml-3 h-10"
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

export const FilterChip = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`px-4 py-1.5 rounded-full mr-2 border ${active ? 'bg-gray-800 border-gray-800' : 'bg-transparent border-gray-300'}`}
  >
    <SansText className={`text-sm ${active ? 'text-white' : 'text-gray-600'}`}>
      {label}
    </SansText>
  </TouchableOpacity>
);

export const Divider = () => <View className="h-[1px] bg-gray-200 w-full my-4" />;

export const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    if (Platform.OS === 'ios' || (Platform.OS === 'android' && !UIManager.setLayoutAnimationEnabledExperimental)) {
         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setIsOpen(!isOpen);
  };

  return (
    <View className="mb-4 border-b border-gray-100 pb-2">
      <TouchableOpacity onPress={toggle} className="flex-row justify-between items-center py-2">
        <SerifText className="text-lg font-semibold">{title}</SerifText>
        {isOpen ? (
          <ChevronDown size={20} color="#6B7280" />
        ) : (
          <ChevronRight size={20} color="#6B7280" />
        )}
      </TouchableOpacity>
      {isOpen && <View className="mt-2">{children}</View>}
    </View>
  );
};

export const DataTable = ({ headers, rows }: { headers: string[], rows: string[][] }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-4">
    <View className="border border-gray-200 rounded-lg overflow-hidden">
      <View className="flex-row bg-gray-50 border-b border-gray-200">
        {headers.map((h, i) => (
          <View key={i} className="px-4 py-3 min-w-[100px]">
            <SansText className="font-bold text-gray-700 capitalize">{h}</SansText>
          </View>
        ))}
      </View>
      {rows.map((row, i) => (
        <View key={i} className={`flex-row border-b border-gray-100 ${i === rows.length - 1 ? 'border-b-0' : ''}`}>
          {row.map((cell, j) => (
            <View key={j} className="px-4 py-3 min-w-[100px]">
              <SansText className="text-gray-800">{cell}</SansText>
            </View>
          ))}
        </View>
      ))}
    </View>
  </ScrollView>
);

export const ExampleCard = ({ native, translit, translation, notes }: { native: string, translit: string, translation: string, notes?: string }) => (
  <View className="bg-white p-4 rounded-xl border border-gray-100 mb-4 shadow-sm">
    <SerifText className="text-xl mb-1 text-gray-900 italic">{native}</SerifText>
    <MonoText className="text-sm mb-2 opacity-70">{translit}</MonoText>
    <SansText className="text-gray-800 mb-2">{translation}</SansText>
    {notes && (
      <SansText className="text-xs italic text-gray-500 border-t border-gray-50 pt-2">{notes}</SansText>
    )}
  </View>
);
