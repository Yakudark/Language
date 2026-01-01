import React from 'react';
import { TouchableOpacity, View, ImageBackground } from 'react-native';
import { SansText, SerifText } from './Typography';
import { Language } from '../data/languages';

export const LanguageItem = ({ language, onPress }: { language: Language, onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="mx-4 mb-6 rounded-3xl overflow-hidden shadow-sm bg-white border border-brand-100"
    style={{ elevation: 3 }}
  >
    <ImageBackground 
      source={language.image} 
      className="h-48 justify-end"
      resizeMode="cover"
    >
      <View className="bg-black/40 absolute inset-0" />
      <View className="p-5">
        <View className="flex-row items-baseline mb-1">
          <SerifText className="text-2xl font-bold text-white">{language.name}</SerifText>
          <SansText className="ml-2 text-white/70 text-sm italic">{language.nativeName}</SansText>
        </View>
        <View className="flex-row items-center justify-between">
           <View className="flex-row">
            <View className="bg-white/20 px-2 py-0.5 rounded mr-2">
              <SansText className="text-xs text-white uppercase tracking-widest">{language.universe}</SansText>
            </View>
          </View>
          <View className="bg-white/10 p-1.5 rounded-full">
          </View>
        </View>
      </View>
    </ImageBackground>
  </TouchableOpacity>
);
