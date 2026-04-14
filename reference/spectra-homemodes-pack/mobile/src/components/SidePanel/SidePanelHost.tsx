import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, TouchTarget } from '../../theme';
import { usePanel } from '../../state/panel';
import { MOCK_VISITS, MOCK_MIXES } from '../../mocks/homeMocks';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';

interface SidePanelHostProps {
  onNavigate: (route: string, params: Record<string, string>) => void;
}

export function SidePanelHost({ onNavigate }: SidePanelHostProps) {
  const { state, dispatch } = usePanel();

  if (!state.isOpen || !state.panelType || !state.entityId) return null;

  const close = () => dispatch({ type: 'CLOSE_PANEL' });

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {state.panelType === 'visit_detail' ? 'Visit Detail' : 'Mix Detail'}
          </Text>
          <TouchableOpacity onPress={close} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          {state.panelType === 'visit_detail' && (
            <VisitDetailContent
              visitId={state.entityId}
              onNavigate={onNavigate}
              onClose={close}
            />
          )}
          {state.panelType === 'mix_detail' && (
            <MixDetailContent
              mixId={state.entityId}
              onNavigate={onNavigate}
              onClose={close}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function VisitDetailContent({
  visitId,
  onNavigate,
  onClose,
}: {
  visitId: string;
  onNavigate: (route: string, params: Record<string, string>) => void;
  onClose: () => void;
}) {
  const visit = MOCK_VISITS.find((v) => v.visitId === visitId);
  if (!visit) return <Text style={styles.empty}>Visit not found</Text>;

  return (
    <>
      <Text style={styles.detailLabel}>Client</Text>
      <Text style={styles.detailValue}>{visit.clientName}</Text>

      <Text style={styles.detailLabel}>Service</Text>
      <Text style={styles.detailValue}>{visit.service}</Text>

      <Text style={styles.detailLabel}>Stage</Text>
      <Text style={styles.detailValue}>{visit.stage.replace('_', ' ')}</Text>

      <Text style={styles.detailLabel}>Staff</Text>
      <Text style={styles.detailValue}>{visit.assignedStaffName}</Text>

      {visit.mixCost != null && (
        <>
          <Text style={styles.detailLabel}>Mix Cost</Text>
          <Text style={styles.detailValue}>₪{visit.mixCost.toFixed(2)}</Text>
        </>
      )}

      <View style={styles.actions}>
        <PrimaryButton
          title="Open Mix Session"
          onPress={() => {
            onClose();
            onNavigate('MixSession', { visitId: visit.visitId });
          }}
        />
        <SecondaryButton
          title="Checkout"
          onPress={() => {
            onClose();
            onNavigate('CheckoutVisit', { visitId: visit.visitId });
          }}
        />
      </View>
    </>
  );
}

function MixDetailContent({
  mixId,
  onNavigate,
  onClose,
}: {
  mixId: string;
  onNavigate: (route: string, params: Record<string, string>) => void;
  onClose: () => void;
}) {
  const mix = MOCK_MIXES.find((m) => m.mixId === mixId);
  if (!mix) return <Text style={styles.empty}>Mix not found</Text>;

  return (
    <>
      <Text style={styles.detailLabel}>Client</Text>
      <Text style={styles.detailValue}>{mix.clientName}</Text>

      <Text style={styles.detailLabel}>State</Text>
      <Text style={styles.detailValue}>{mix.state}</Text>

      <Text style={styles.detailLabel}>Items</Text>
      <Text style={styles.detailValue}>{mix.itemCount}</Text>

      <Text style={styles.detailLabel}>Total Weight</Text>
      <Text style={styles.detailValue}>{mix.totalWeightGrams}g</Text>

      <Text style={styles.detailLabel}>Cost</Text>
      <Text style={styles.detailValue}>₪{mix.totalCost.toFixed(2)}</Text>

      <View style={styles.actions}>
        <PrimaryButton
          title="Open Mix Session"
          onPress={() => {
            onClose();
            onNavigate('MixSession', { visitId: mix.visitId, mixId: mix.mixId });
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 100,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    width: 380,
    backgroundColor: Colors.background,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: Spacing.lg,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  empty: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
