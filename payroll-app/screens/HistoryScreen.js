import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HISTORY_KEY = 'payroll_history';

export default function HistoryScreen() {
  const [months, setMonths] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setMonths(JSON.parse(stored));
      }
    } catch {
      setMonths([]);
    }
  }

  function toggleMonth(monthKey) {
    setExpanded((prev) => (prev === monthKey ? null : monthKey));
  }

  function MonthCard({ item }) {
    const isOpen = expanded === item.monthKey;
    const total = item.records.reduce((sum, r) => sum + r.netPay, 0);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.monthHeader}
          activeOpacity={0.7}
          onPress={() => toggleMonth(item.monthKey)}
        >
          <View>
            <Text style={styles.monthLabel}>{item.monthKey}</Text>
            <Text style={styles.monthSub}>{item.records.length} employees</Text>
          </View>
          <View style={styles.monthRight}>
            <Text style={styles.monthTotal}>₹{total.toLocaleString('en-IN')}</Text>
            <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.recordList}>
            {item.records.map((r, i) => (
              <View key={r.employeeId} style={[styles.record, i > 0 && styles.recordBorder]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{r.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{r.name}</Text>
                  <View style={styles.recordBreakdown}>
                    <Text style={styles.recordDetail}>Base ₹{r.baseSalary.toLocaleString('en-IN')}</Text>
                    {r.deduction > 0 && (
                      <Text style={[styles.recordDetail, styles.deductionText]}>
                        − ₹{r.deduction.toLocaleString('en-IN')}
                      </Text>
                    )}
                    {r.overtime > 0 && (
                      <Text style={[styles.recordDetail, styles.overtimeText]}>
                        + ₹{r.overtime.toLocaleString('en-IN')}
                      </Text>
                    )}
                    {r.bonus > 0 && (
                      <Text style={[styles.recordDetail, styles.bonusText]}>
                        + ₹{r.bonus.toLocaleString('en-IN')} bonus
                      </Text>
                    )}
                    {r.advance > 0 && (
                      <Text style={[styles.recordDetail, styles.deductionText]}>
                        − ₹{r.advance.toLocaleString('en-IN')} advance
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.recordNetPay}>₹{r.netPay.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={months}
        keyExtractor={(item) => item.monthKey}
        renderItem={({ item }) => <MonthCard item={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payroll history yet.</Text>
            <Text style={styles.emptySubText}>Completed payroll runs will appear here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    padding: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  monthSub: {
    fontSize: 13,
    color: '#8E8E93',
  },
  monthRight: {
    alignItems: 'flex-end',
  },
  monthTotal: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 4,
  },
  chevron: {
    fontSize: 11,
    color: '#8E8E93',
  },
  separator: {
    height: 12,
  },
  recordList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recordBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  recordBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recordDetail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  deductionText: {
    color: '#FF3B30',
  },
  overtimeText: {
    color: '#007AFF',
  },
  bonusText: {
    color: '#34C759',
  },
  recordNetPay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
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
});
