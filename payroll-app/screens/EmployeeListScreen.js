
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
import { MONTHLY_LOG_KEY } from './AddEmployeeScreen';
import { HISTORY_KEY } from './HistoryScreen';

export const EMPLOYEES_KEY = 'employees';

const WORKING_DAYS = 26;

const SAMPLE_EMPLOYEES = [
  { id: '1', name: 'Ravi Kumar', phone: '9876543210', salary: 15000 },
  { id: '2', name: 'Priya Singh', phone: '9123456780', salary: 12000 },
  { id: '3', name: 'Mohan Das', phone: '9988776655', salary: 18000 },
];

function getMonthKey() {
  return new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function formatLogSummary(empLog) {
  if (!empLog) return null;
  const parts = [];
  if (empLog.absentDays > 0) parts.push(`${empLog.absentDays}d absent`);
  if (empLog.overtimeHours > 0) parts.push(`${empLog.overtimeHours}h OT`);
  if (empLog.advance > 0) parts.push(`₹${empLog.advance} advance`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function PayrollSummaryCard({ payroll, onViewDetails }) {
  const totalPaid = payroll.records.reduce((sum, r) => sum + r.netPay, 0);
  const totalLeaves = payroll.records.reduce((sum, r) => {
    const dailyRate = r.baseSalary / WORKING_DAYS;
    return sum + (dailyRate > 0 ? r.deduction / dailyRate : 0);
  }, 0);
  const roundedLeaves = Math.round(totalLeaves * 2) / 2;
  const employeeCount = payroll.records.length;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryGreenBar} />
      <View style={styles.summaryContent}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryDone}>✓ Payroll Done</Text>
          <Text style={styles.summaryMonth}>{payroll.monthKey}</Text>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{totalPaid.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Total Paid</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{roundedLeaves}</Text>
            <Text style={styles.statLabel}>Total Leaves</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{employeeCount}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onViewDetails}>
          <Text style={styles.summaryLink}>View Full Breakdown →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatElapsed(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function getSpeedMessage(seconds) {
  if (seconds <= 30) return 'Lightning fast!';
  if (seconds <= 60) return 'Under a minute!';
  if (seconds <= 120) return 'Quick work!';
  return 'All done!';
}

export default function EmployeeListScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [monthlyLog, setMonthlyLog] = useState({});
  const [currentMonthPayroll, setCurrentMonthPayroll] = useState(null);
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? employees.filter((e) =>
        e.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : employees;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  async function loadData() {
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

    try {
      const logStored = await AsyncStorage.getItem(MONTHLY_LOG_KEY);
      const log = logStored ? JSON.parse(logStored) : {};
      setMonthlyLog(log[getMonthKey()] || {});
    } catch {
      setMonthlyLog({});
    }

    try {
      const historyStored = await AsyncStorage.getItem(HISTORY_KEY);
      const history = historyStored ? JSON.parse(historyStored) : [];
      const thisMonth = history.find((h) => h.monthKey === getMonthKey());
      setCurrentMonthPayroll(thisMonth || null);
    } catch {
      setCurrentMonthPayroll(null);
    }
  }

  function EmployeeRow({ item }) {
    const logSummary = formatLogSummary(monthlyLog[item.id]);

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
          {logSummary && <Text style={styles.logSummary}>{logSummary}</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar onChangeText={setQuery} />
      {currentMonthPayroll ? (
        <PayrollSummaryCard
          payroll={currentMonthPayroll}
          onViewDetails={() => navigation.navigate('History')}
        />
      ) : (
        employees.length > 0 && (
          <Text style={styles.tagline}>60-second payroll for your team</Text>
        )
      )}
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
          {currentMonthPayroll ? (
            <TouchableOpacity
              style={styles.payrollDoneButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RunPayroll', { employees })}
            >
              <Text style={styles.payrollDoneText}>✓ Payroll Done</Text>
              {currentMonthPayroll.elapsedSeconds != null && (
                <Text style={styles.payrollSpeedText}>
                  {getSpeedMessage(currentMonthPayroll.elapsedSeconds)} Finished in {formatElapsed(currentMonthPayroll.elapsedSeconds)}
                </Text>
              )}
              <Text style={styles.payrollRerunText}>Tap to re-run</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.payrollButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RunPayroll', { employees })}
            >
              <Text style={styles.payrollButtonText}>Run Payroll</Text>
            </TouchableOpacity>
          )}
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
  tagline: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 6,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  summaryGreenBar: {
    width: 4,
    backgroundColor: '#34C759',
  },
  summaryContent: {
    flex: 1,
    padding: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryDone: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34C759',
  },
  summaryMonth: {
    fontSize: 13,
    color: '#8E8E93',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E5EA',
  },
  summaryLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
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
  logSummary: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
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
  payrollDoneButton: {
    backgroundColor: '#F0FFF4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#34C759',
  },
  payrollDoneText: {
    color: '#34C759',
    fontSize: 17,
    fontWeight: '700',
  },
  payrollSpeedText: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 4,
  },
  payrollRerunText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
