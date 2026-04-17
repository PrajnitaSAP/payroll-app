
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '../components/SearchBar';

export const EMPLOYEES_KEY = 'employees';

const SAMPLE_EMPLOYEES = [
  { id: '1', name: 'Ravi Kumar', phone: '9876543210', salary: 15000 },
  { id: '2', name: 'Priya Singh', phone: '9123456780', salary: 12000 },
  { id: '3', name: 'Mohan Das', phone: '9988776655', salary: 18000 },
];

export default function EmployeeListScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? employees.filter((e) =>
        e.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : employees;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadEmployees);
    return unsubscribe;
  }, [navigation]);

  async function loadEmployees() {
    try {
      const stored = await AsyncStorage.getItem(EMPLOYEES_KEY);
      if (stored) {
        setEmployees(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(EMPLOYEES_KEY, JSON.stringify(SAMPLE_EMPLOYEES));
        setEmployees(SAMPLE_EMPLOYEES);
      }
    } catch {
      setEmployees(SAMPLE_EMPLOYEES);
    }
  }

  function EmployeeRow({ item }) {
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.6}
        onPress={() => navigation.navigate('AddEmployee', { employee: item })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeSalary}>₹{item.salary.toLocaleString('en-IN')}/month</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar onChangeText={setQuery} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmployeeRow item={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No employees yet.</Text>
            <Text style={styles.emptySubText}>Tap "+ Add" to add your first team member.</Text>
          </View>
        }
      />

      {filtered.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.payrollButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('RunPayroll', { employees })}
          >
            <Text style={styles.payrollButtonText}>Run Payroll</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  rowInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  employeeSalary: {
    fontSize: 14,
    color: '#8E8E93',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 78,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  payrollButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  payrollButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
