import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export default function SearchBar({ onChangeText }) {
  const [query, setQuery] = useState('');

  function handleChange(text) {
    setQuery(text);
    onChangeText(text);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search employees..."
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={handleChange}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <View style={styles.iconWrap}>
          <View style={styles.lens} />
          <View style={styles.handle} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 30,
    paddingHorizontal: 18,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  iconWrap: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  lens: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  handle: {
    width: 2,
    height: 7,
    backgroundColor: '#000',
    borderRadius: 1,
    position: 'absolute',
    bottom: 0,
    right: 1,
    transform: [{ rotate: '-45deg' }],
  },
});
