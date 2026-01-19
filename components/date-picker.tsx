import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function DatePickerDialog({ val, onValChange }: { val: Date, onValChange: (date: Date) => void }) {
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      onValChange(selectedDate);
    } 
    else if (Platform.OS === 'ios' && selectedDate) {
        onValChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    return `${date.getFullYear()} / ${date.getMonth() + 1} / ${date.getDate()}`;
  };

  return (
    <View style={styles.wrapper}>
      <Pressable 
        onPress={() => setShow(true)} 
        style={styles.button}
      >
        <Text style={styles.buttonText}>{formatDate(val)}</Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={val}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => onChange(event, selectedDate ?? new Date())}
        />
      )}
      
      {/* iOS specific: Spinner mode doesn't close itself, 
          so you might need a "Done" button for iOS specifically */}
      {show && Platform.OS === 'ios' && (
        <Pressable style={styles.doneButton} onPress={() => setShow(false)}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E2E6',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});