import { ChooseSession } from '@/components/ChooseSession';
import { TAB_BAR_SPACE } from '@/theme/tokens';

export default function UnloadTab() {
  return <ChooseSession ctx={{}} bottomInset={TAB_BAR_SPACE - 30} />;
}
