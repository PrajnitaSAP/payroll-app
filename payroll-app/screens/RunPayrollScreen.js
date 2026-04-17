import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const WORKING_DAYS = 26; // standard working days per month

function calcNetPay(salary, absentDays, overtimeHours, bonus) {
  const dailyRate = salary / WORKING_DAYS;
  const hourlyRate = dailyRate / 8;
  const deduction = dailyRate * absentDays;
  const overtime = hourlyRate * overtimeHours;
  return Math.round(salary - deduction + overtime + bonus);
}

export default function RunPayrollScreen({ navigation, route }) {
  const employees = route.params?.employees ?? [];
  const [index, setIndex] = useState(0);

  const [absentDays, setAbsentDays] = useState('0');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [bonus, setBonus] = useState('0');

  const employee = employees[index];
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const absent = parseFloat(absentDays) || 0;
  const overtime = parseFloat(overtimeHours) || 0;
  const bonusAmt = parseFloat(bonus) || 0;
  const netPay = calcNetPay(employee.salary, absent, overtime, bonusAmt);

  const dailyRate = Math.round(employee.salary / WORKING_DAYS);
  const hourlyRate = Math.round(dailyRate / 8);

  function handleDone() {
    if (index < employees.length - 1) {
      // Move to next employee, reset inputs
      setIndex(index + 1);
      setAbsentDays('0');
      setOvertimeHours('0');
      setBonus('0');
    } else {
      Alert.alert(
        'Payroll Complete',
        `Payroll for ${month} is done for all ${employees.length} employees.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Progress */}
        <Text style={styles.progress}>
          {index + 1} of {employees.length}
        </Text>

        {/* Employee name + base salary */}
        <View style={styles.employeeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{employee.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.baseSalary}>Base salary: ₹{employee.salary.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.fieldGroup}>

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeft}>
                <Text style={styles.fieldLabel}>Unpaid Absent Days</Text>
                <Text style={styles.fieldHint}>− ₹{dailyRate.toLocaleString('en-IN')} per day</Text>
              </View>
              <TextInput
                style={styles.numInput}
                value={absentDays}
                onChangeText={setAbsentDays}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeft}>
                <Text style={styles.fieldLabel}>Overtime Hours</Text>
                <Text style={styles.fieldHint}>+ ₹{hourlyRate.toLocaleString('en-IN')} per hour</Text>
              </View>
              <TextInput
                style={styles.numInput}
                value={overtimeHours}
                onChangeText={setOvertimeHours}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeft}>
                <Text style={styles.fieldLabel}>Festival Bonus (₹)</Text>
                <Text style={styles.fieldHint}>One-time addition</Text>
              </View>
              <TextInput
                style={styles.numInput}
                value={bonus}
                onChangeText={setBonus}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>
          </View>

        </View>

        {/* Net Pay */}
        <View style={styles.netPayCard}>
          <Text style={styles.netPayLabel}>Net Pay</Text>
          <Text style={styles.netPayAmount}>₹{netPay.toLocaleString('en-IN')}</Text>
        </View>

        {/* Done button */}
        <TouchableOpacity style={styles.doneButton} activeOpacity={0.8} onPress={handleDone}>
          <Text style={styles.doneButtonText}>
            {index < employees.length - 1 ? '✓ Done, Next Employee' : '✓ Finish Payroll'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  progress: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  baseSalary: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fieldGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  field: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLeft: {
    flex: 1,
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  fieldHint: {
    fontSize: 12,
    color: '#8E8E93',
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 16,
  },
  numInput: {
    width: 72,
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
    borderBottomWidth: 1.5,
    borderBottomColor: '#007AFF',
    paddingBottom: 2,
  },
  netPayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  netPayLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  netPayAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#34C759',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
