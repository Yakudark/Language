import React from 'react';
import { Text, TextProps } from 'react-native';
import { cssInterop } from 'nativewind';

export const SerifText = ({ style, ...props }: TextProps) => (
  <Text 
    style={[{ fontFamily: 'Merriweather_400Regular' }, style]} 
    {...props} 
  />
);

export const MonoText = ({ style, ...props }: TextProps) => (
  <Text 
    style={[{ fontFamily: 'JetBrainsMono_400Regular' }, style]} 
    {...props} 
  />
);

export const SansText = ({ style, ...props }: TextProps) => (
  <Text 
    style={[{ fontFamily: 'Inter_400Regular' }, style]} 
    {...props} 
  />
);

cssInterop(SerifText, { className: 'style' });
cssInterop(MonoText, { className: 'style' });
cssInterop(SansText, { className: 'style' });

export const Heading = ({ children, level = 1, className = "" }: { children: React.ReactNode, level?: 1 | 2 | 3, className?: string }) => {
  const sizes = {
    1: "text-3xl font-bold mb-4 text-brand-900",
    2: "text-2xl font-semibold mb-3 text-brand-900",
    3: "text-xl font-medium mb-2 text-brand-900",
  };
  
  return (
    <SerifText className={`${sizes[level]} ${className}`}>
      {children}
    </SerifText>
  );
};
