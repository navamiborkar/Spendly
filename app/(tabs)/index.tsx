import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import DropDownPicker from 'react-native-dropdown-picker';

export default function App() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [expenses, setExpenses] = useState<
    { id: string, amount: number, note: string, category: string, date: string }[]
  >([]);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Food', value: 'Food' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Other', value: 'Other' },
  ]);

  // Load saved expenses on startup
  useEffect(() => {
    const loadExpenses = async () => {
      const saved = await AsyncStorage.getItem('expenses');
      if (saved) setExpenses(JSON.parse(saved));
    };
    loadExpenses();
  }, []);

  // Save expenses when updated
  useEffect(() => {
    AsyncStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = () => {
    if (!amount) return;
    setExpenses(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        amount: parseFloat(amount),
        note,
        category,
        date: new Date().toISOString()
      }
    ]);
    setAmount('');
    setNote('');
    setCategory('');
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const clearExpenses = () => {
    setExpenses([]);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Pie chart data
  const screenWidth = Dimensions.get('window').width;
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoryTotals).map((category, index) => ({
    name: category,
    amount: categoryTotals[category],
    color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5],
    legendFontColor: '#000',
    legendFontSize: 12
  }));

  return (
    <View style={styles.background}>
      <Text style={styles.header}>Spendly</Text>
      <Text style={styles.total}>Total: ₹ {total.toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Amount"
        placeholderTextColor="black"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Note"
        placeholderTextColor="black"
        value={note}
        onChangeText={setNote}
      />

      <DropDownPicker
        open={open}
        value={category}
        items={items}
        setOpen={setOpen}
        setValue={setCategory}
        setItems={setItems}
        placeholder="Select category"
        style={{ marginVertical: 5, borderColor: '#ccc' }}
        textStyle={{ color: 'black' }}
        dropDownContainerStyle={{ borderColor: '#ccc' }}
      />

      <TouchableOpacity style={styles.addButton} onPress={addExpense}>
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={clearExpenses}>
        <Text style={styles.clearButtonText}>Clear All Expenses</Text>
      </TouchableOpacity>

      {pieData.length > 0 && (
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: () => '#000'
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={{ marginVertical: 10 }}
        />
      )}

      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>
                ₹ {item.amount} – {item.note} [{item.category}] ({new Date(item.date).toLocaleDateString()})
              </Text>
              <Text style={styles.deleteText} onPress={() => deleteExpense(item.id)}>✖</Text>
            </View>
          </View>
        )}
        style={styles.list}
        ListFooterComponent={() => (
          <Text style={styles.footer}>Created by Navami Borkar</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF5722',
    textAlign: 'center',
    marginTop: 40
  },
  total: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    color: 'black',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addButton: {
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  clearButton: {
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  clearButtonText: { color: '#fff', fontWeight: 'bold' },
  list: { marginTop: 10 },
  itemBox: {
    backgroundColor: '#e6ffe6',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemText: { color: 'green', fontSize: 16 },
  deleteText: { color: 'red', fontWeight: 'bold', marginLeft: 8 },
  footer: {
    marginTop: 10,
    textAlign: 'center',
    color: '#888',
    fontSize: 12
  }
});
