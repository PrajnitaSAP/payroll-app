import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

import EmployeeListScreen from './screens/EmployeeListScreen';
import AddEmployeeScreen from './screens/AddEmployeeScreen';
import RunPayrollScreen from './screens/RunPayrollScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createNativeStackNavigator();

function HistoryIcon({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.historyBtn}>
      {/* Document body */}
      <View style={styles.doc}>
        {/* White rotated square masks top-right corner to simulate fold */}
        <View style={styles.foldMask} />
        {/* Fold crease line */}
        <View style={styles.foldLine} />
        {/* Text lines */}
        <View style={[styles.docLine, { width: 14, top: 7 }]} />
        <View style={[styles.docLine, { width: 10, top: 12 }]} />
        <View style={[styles.docLine, { width: 12, top: 17 }]} />
        {/* Dollar sign on document */}
        <Text style={styles.docDollar}>$</Text>
      </View>
      {/* Badge circle overlapping bottom-right */}
      <View style={styles.badge}>
        <Text style={styles.badgeDollar}>$</Text>
        <Text style={styles.badgeArrow}>↓</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#007AFF',
          headerTitleStyle: { color: '#000', fontWeight: '700', fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen
          name="EmployeeList"
          component={EmployeeListScreen}
          options={({ navigation }) => ({
            headerTitle: () => (
              <TouchableOpacity onPress={() => navigation.navigate('History')} activeOpacity={0.7}>
                <Text style={styles.headerTitle}>My Team</Text>
              </TouchableOpacity>
            ),
            headerLeft: () => (
              <HistoryIcon onPress={() => navigation.navigate('History')} />
            ),
            headerRight: () => (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddEmployee')}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="AddEmployee"
          component={AddEmployeeScreen}
          options={({ route }) => ({
            title: route.params?.employee ? 'Edit Employee' : 'New Employee',
          })}
        />
        <Stack.Screen
          name="RunPayroll"
          component={RunPayrollScreen}
          options={{ title: 'Run Payroll' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Payroll History' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  historyBtn: {
    marginRight: 4,
    width: 34,
    height: 40,
  },
  doc: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 26,
    height: 34,
    borderWidth: 2.5,
    borderColor: '#3D3D3D',
    borderRadius: 4,
    borderTopRightRadius: 0,
  },
  foldMask: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  foldLine: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomColor: '#3D3D3D',
    borderLeftColor: '#3D3D3D',
  },
  docLine: {
    position: 'absolute',
    left: 4,
    height: 2,
    backgroundColor: '#3D3D3D',
    borderRadius: 1,
  },
  docDollar: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#3D3D3D',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#3D3D3D',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  badgeDollar: {
    fontSize: 7,
    fontWeight: '700',
    color: '#3D3D3D',
    lineHeight: 9,
  },
  badgeArrow: {
    fontSize: 7,
    fontWeight: '700',
    color: '#3D3D3D',
    lineHeight: 9,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
