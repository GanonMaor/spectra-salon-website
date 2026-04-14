import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, TouchTarget } from '../theme';
import { PrimaryButton } from '../components';
import { RootStackParamList } from '../navigation/routes';
import { useSession } from '../state/session';
import { MOCK_STAFF } from '../mocks/homeMocks';
import type { StaffRole } from '../viewmodels/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectStaff'>;

const ROLES: { value: StaffRole; label: string; hebrew: string }[] = [
  { value: 'colorbar', label: 'ColorBar', hebrew: 'סטייליסט' },
  { value: 'reception', label: 'Reception', hebrew: 'קבלה' },
  { value: 'manager', label: 'Manager', hebrew: 'מנהל' },
];

export function SelectStaffScreen({ navigation }: Props) {
  const { dispatch } = useSession();
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);

  const selectedStaff = MOCK_STAFF.find((s) => s.id === selectedStaffId);

  const handleSubmit = () => {
    if (!selectedStaffId || !selectedRole) return;
    dispatch({ type: 'SET_STAFF', staffId: selectedStaffId, role: selectedRole });
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Spectra</Text>
        <Text style={styles.subtitle}>בחר צוות</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STAFF</Text>
        {MOCK_STAFF.map((staff) => (
          <TouchableOpacity
            key={staff.id}
            style={[
              styles.staffRow,
              selectedStaffId === staff.id && styles.staffRowSelected,
            ]}
            onPress={() => {
              setSelectedStaffId(staff.id);
              if (!selectedRole) setSelectedRole(staff.defaultRole);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{staff.avatarInitials}</Text>
            </View>
            <View style={styles.staffInfo}>
              <Text style={styles.staffName}>{staff.name}</Text>
              <Text style={styles.staffRole}>Default: {staff.defaultRole}</Text>
            </View>
            {selectedStaffId === staff.id && (
              <Text style={styles.check}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ROLE OVERRIDE</Text>
        <View style={styles.roleRow}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleChip,
                selectedRole === role.value && styles.roleChipSelected,
              ]}
              onPress={() => setSelectedRole(role.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.roleLabel,
                  selectedRole === role.value && styles.roleLabelSelected,
                ]}
              >
                {role.label}
              </Text>
              <Text
                style={[
                  styles.roleHebrew,
                  selectedRole === role.value && styles.roleHebrewSelected,
                ]}
              >
                {role.hebrew}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title={
            selectedStaff && selectedRole
              ? `Enter as ${selectedStaff.name} (${selectedRole})`
              : 'Select staff and role'
          }
          onPress={handleSubmit}
          disabled={!selectedStaffId || !selectedRole}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  staffRowSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#F0F4FF',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  staffRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  check: {
    fontSize: 20,
    color: Colors.accent,
    fontWeight: '700',
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roleChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  roleChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  roleLabelSelected: {
    color: Colors.textInverse,
  },
  roleHebrew: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleHebrewSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginTop: 'auto',
  },
});
