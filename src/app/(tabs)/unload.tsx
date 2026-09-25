import { ChooseSession } from '@/components/ChooseSession';
import { Screen } from '@/components/ui';
import { space } from '@/theme/tokens';

export default function UnloadTab() {
  return (
    <Screen withTabBar contentStyle={{ paddingTop: space.lg }}>
      <ChooseSession ctx={{}} />
    </Screen>
  );
}
