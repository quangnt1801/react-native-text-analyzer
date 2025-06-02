import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ExtractText } from 'react-native-text-analyzer';

export default function App() {
  useEffect(() => {
    const result = ExtractText({
      input: 'Gửi son cho Thuỷ 0922001100, 103A Nguyễn Hữu Cảnh, Q. Bình Thạnh',
    });
    console.log(result);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
