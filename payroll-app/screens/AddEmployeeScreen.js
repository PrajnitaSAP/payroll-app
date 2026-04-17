import { useEffect, useRef, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMPLOYEES_KEY } from './EmployeeListScreen';
import ConfirmRemoveModal from '../components/ConfirmRemoveModal';

export const MONTHLY_LOG_KEY = 'monthly_log';

function getMonthKey() {
  return new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function StepperField({ label, hint, value, onChangeText, step, allowHalf }) {
  const num = parseFloat(value) || 0;

  function decrement() {
    const next = allowHalf ? Math.max(0, num - 0.5) : Math.max(0, num - step);
    onChangeText(String(next));
  }

  function increment() {
    const next = allowHalf ? num + 0.5 : num + step;
    onChangeText(String(next));
  }

  return (
    <View style={styles.stepperField}>
      <View style={styles.stepperLeft}>
        <Text style={styles.stepperLabel}>{label}</Text>
        <Text style={styles.stepperHint}>{hint}</Text>
      </View>
      <View style={styles.stepperRight}>
        <TouchableOpacity style={styles.stepperBtn} activeOpacity={0.7} onPress={decrement}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.stepperValue}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          selectTextOnFocus
        />
        <TouchableOpacity style={styles.stepperBtn} activeOpacity={0.7} onPress={increment}>
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AddEmployeeScreen({ navigation, route }) {
  const existing = route.params?.employee;
  const isEditing = !!existing;
  const didSave = useRef(false);

  const [name, setName] = useState(existing?.name ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [salary, setSalary] = useState(existing?.salary ? String(existing.salary) : '');
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const [logAbsent, setLogAbsent] = useState('0');
  const [logOvertime, setLogOvertime] = useState('0');
  const [logAdvance, setLogAdvance] = useState('0');

  useEffect(() => {
    if (isEditing) loadMonthlyLog();
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!didSave.current) saveMonthlyLog();
    });
    return unsubscribe;
  }, [navigation, logAbsent, logOvertime, logAdvance]);

  async function loadMonthlyLog() {
    try {
      const stored = await AsyncStorage.getItem(MONTHLY_LOG_KEY);
      const log = stored ? JSON.parse(stored) : {};
      const empLog = log[getMonthKey()]?.[existing.id];
      if (empLog) {
        setLogAbsent(String(empLog.absentDays));
        setLogOvertime(String(empLog.overtimeHours));
        setLogAdvance(String(empLog.advance));
      }
    } catch {}
  }

  async function saveMonthlyLog() {
    try {
      const stored = await AsyncStorage.getItem(MONTHLY_LOG_KEY);
      const log = stored ? JSON.parse(stored) : {};
      const monthKey = getMonthKey();
      if (!log[monthKey]) log[monthKey] = {};
      log[monthKey][existing.id] = {
        absentDays: parseFloat(logAbsent) || 0,
        overtimeHours: parseFloat(logOvertime) || 0,
        advance: parseInt(logAdvance, 10) || 0,
      };
      await AsyncStorage.setItem(MONTHLY_LOG_KEY, JSON.stringify(log));
    } catch {}
  }

  async function saveEmployee() {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter the employee name.');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Phone number must be exactly 10 digits.');
      return;
    }
    if (!salary.trim() || isNaN(Number(salary)) || Number(salary) <= 0) {
      Alert.alert('Invalid Salary', 'Please enter a valid monthly salary.');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(EMPLOYEES_KEY);
      const employees = stored ? JSON.parse(stored) : [];

      if (isEditing) {
        const updated = employees.map((e) =>
          e.id === existing.id
            ? { ...e, name: name.trim(), phone: phone.trim(), salary: Number(salary) }
            : e
        );
        await AsyncStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
        await saveMonthlyLog();
        didSave.current = true;
      } else {
        const newEmployee = {
          id: Date.now().toString(),
          name: name.trim(),
          phone: phone.trim(),
          salary: Number(salary),
        };
        await AsyncStorage.setItem(EMPLOYEES_KEY, JSON.stringify([...employees, newEmployee]));
      }

      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save employee. Please try again.');
    }
  }

  async function deleteEmployee() {
    try {
      const stored = await AsyncStorage.getItem(EMPLOYEES_KEY);
      const employees = stored ? JSON.parse(stored) : [];
      const updated = employees.filter((e) => e.id !== existing.id);
      await AsyncStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));

      // Clean up monthly log for this employee
      const logStored = await AsyncStorage.getItem(MONTHLY_LOG_KEY);
      if (logStored) {
        const log = JSON.parse(logStored);
        const monthKey = getMonthKey();
        if (log[monthKey]?.[existing.id]) {
          delete log[monthKey][existing.id];
          await AsyncStorage.setItem(MONTHLY_LOG_KEY, JSON.stringify(log));
        }
      }

      didSave.current = true;
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not remove employee.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Fields */}
        <View style={styles.fieldGroup}>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ravi Kumar"
              placeholderTextColor="#C7C7CC"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+91</Text>
              </View>
              <View style={styles.phoneDivider} />
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="10-digit number"
                placeholderTextColor="#C7C7CC"
                value={phone}
                onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, '').slice(0, 10))}
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.field}>
            <Text style={styles.label}>Monthly Salary (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 15000"
              placeholderTextColor="#C7C7CC"
              value={salary}
              onChangeText={setSalary}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* This Month Log (edit mode only) */}
        {isEditing && (
          <>
            <View style={styles.monthLogHeader}>
              <Text style={styles.monthLogTitle}>THIS MONTH</Text>
              <Text style={styles.monthLogMonth}>{getMonthKey()}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <StepperField
                label="Absent Days"
                hint="Days not worked (unpaid)"
                value={logAbsent}
                onChangeText={setLogAbsent}
                step={0.5}
                allowHalf
              />
              <View style={styles.fieldDivider} />
              <StepperField
                label="Overtime Hours"
                hint="Extra hours worked"
                value={logOvertime}
                onChangeText={setLogOvertime}
                step={1}
              />
              <View style={styles.fieldDivider} />
              <View style={styles.stepperField}>
                <View style={styles.stepperLeft}>
                  <Text style={styles.stepperLabel}>Advance (₹)</Text>
                  <Text style={styles.stepperHint}>Salary paid in advance</Text>
                </View>
                <TextInput
                  style={styles.advanceInput}
                  value={logAdvance}
                  onChangeText={(val) => setLogAdvance(val.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
              </View>
            </View>
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={saveEmployee}>
          <Text style={styles.saveButtonText}>Save Employee</Text>
        </TouchableOpacity>

        {/* Delete Button (edit mode only) */}
        {isEditing && (
          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8} onPress={() => setShowRemoveModal(true)}>
            <Text style={styles.deleteButtonText}>Remove Employee</Text>
          </TouchableOpacity>
        )}

        <ConfirmRemoveModal
          visible={showRemoveModal}
          employeeName={existing?.name ?? ''}
          onConfirm={deleteEmployee}
          onCancel={() => setShowRemoveModal(false)}
        />

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
    paddingTop: 28,
  },
  fieldGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  field: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 16,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    fontSize: 17,
    color: '#000',
    paddingVertical: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    paddingRight: 10,
  },
  phonePrefixText: {
    fontSize: 17,
    color: '#000',
    fontWeight: '500',
  },
  phoneDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E5E5EA',
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
  },
  monthLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  monthLogTitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  monthLogMonth: {
    fontSize: 13,
    color: '#8E8E93',
  },
  stepperField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stepperLeft: {
    flex: 1,
    marginRight: 12,
  },
  stepperLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  stepperHint: {
    fontSize: 12,
    color: '#8E8E93',
  },
  stepperRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    lineHeight: 22,
  },
  stepperValue: {
    width: 56,
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  advanceInput: {
    width: 72,
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
    borderBottomWidth: 1.5,
    borderBottomColor: '#007AFF',
    paddingBottom: 2,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
});
