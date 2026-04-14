import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import { RootStackParamList } from '../../navigation/routes';
import { TopBar } from '../../components/TopBar';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SidePanelHost } from '../../components/SidePanel/SidePanelHost';
import { useSession } from '../../state/session';
import { usePanel } from '../../state/panel';
import { MOCK_STAFF } from '../../mocks/homeMocks';
import type { HomeMode } from '../../viewmodels/types';
import { ColorBarHome } from './modes/ColorBarHome';
import { ReceptionHome } from './modes/ReceptionHome';
import { ManagerHome } from './modes/ManagerHome';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MODE_CYCLE: HomeMode[] = ['colorbar', 'reception', 'manager'];

export function HomeScreen({ navigation }: Props) {
  const { state: session, dispatch: sessionDispatch } = useSession();
  const { state: panel } = usePanel();

  const activeMode = session.activeMode ?? 'colorbar';
  const staff = MOCK_STAFF.find((s) => s.id === session.activeStaffId);
  const staffName = staff?.name ?? 'Unknown';

  const handleSwitchMode = useCallback(() => {
    const currentIndex = MODE_CYCLE.indexOf(activeMode);
    const nextMode = MODE_CYCLE[(currentIndex + 1) % MODE_CYCLE.length];
    sessionDispatch({ type: 'SET_MODE', mode: nextMode });
  }, [activeMode, sessionDispatch]);

  const handleNavigate = useCallback(
    (route: string, params?: Record<string, string>) => {
      navigation.navigate(route as any, params as any);
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <TopBar
        activeMode={activeMode}
        syncState={session.syncState}
        staffName={staffName}
        onSwitchMode={handleSwitchMode}
      />
      <OfflineBanner syncState={session.syncState} />

      <View style={styles.modeContent}>
        {activeMode === 'colorbar' && (
          <ColorBarHome onNavigate={handleNavigate} />
        )}
        {activeMode === 'reception' && <ReceptionHome />}
        {activeMode === 'manager' && <ManagerHome />}
      </View>

      {panel.isOpen && <SidePanelHost onNavigate={handleNavigate} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modeContent: {
    flex: 1,
  },
});
