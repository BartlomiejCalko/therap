import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PIN_LENGTH, PinDots, PinPad } from '@/components/PinPad';
import { T } from '@/components/T';
import { CircleButton, PillButton, Screen, TopBar } from '@/components/ui';
import { useT } from '@/i18n';
import { done } from '@/lib/haptics';
import { checkPin, clearPin, savePin } from '@/lib/pin';
import { useStore } from '@/store/store';
import { space } from '@/theme/tokens';

type Step = 'menu' | 'verify' | 'new' | 'confirm';
type PinError = '' | 'mismatch' | 'different';

const leave = () => (router.canGoBack() ? router.back() : router.replace('/settings'));

export default function PinSettings() {
  const t = useT();
  const { data, updateSettings } = useStore();
  const enabled = data.settings.pinEnabled;
  const [step, setStep] = useState<Step>(enabled ? 'menu' : 'new');
  const [intent, setIntent] = useState<'change' | 'off'>('change');
  const [entry, setEntry] = useState('');
  const [first, setFirst] = useState('');
  const [error, setError] = useState<PinError>('');

  const titles: Record<Step, string> = {
    menu: t.pin.menu,
    verify: t.pin.verify,
    new: t.pin.choose,
    confirm: t.pin.confirm,
  };

  const complete = async (pin: string) => {
    if (step === 'verify') {
      if (!(await checkPin(pin))) return fail('mismatch');
      if (intent === 'off') {
        await clearPin();
        updateSettings({ pinEnabled: false });
        done();
        leave();
        return;
      }
      setStep('new');
    } else if (step === 'new') {
      setFirst(pin);
      setStep('confirm');
    } else if (step === 'confirm') {
      if (pin !== first) {
        setStep('new');
        return fail('different');
      }
      await savePin(pin);
      updateSettings({ pinEnabled: true });
      done();
      leave();
      return;
    }
    setEntry('');
  };

  const fail = (reason: Exclude<PinError, ''>) => {
    setError(reason);
    setTimeout(() => setEntry(''), 300);
  };

  const onDigit = (d: string) => {
    const next = (entry + d).slice(0, PIN_LENGTH);
    setError('');
    setEntry(next);
    if (next.length === PIN_LENGTH) complete(next);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={leave} />} />
      <T variant="title" center style={{ marginTop: space.lg }}>
        {titles[step]}
      </T>
      <T variant="small" tone={error ? 'accent' : 'faint'} center style={{ marginTop: space.sm, minHeight: 18 }}>
        {error ? t.pin[error] : step === 'menu' ? t.pin.menuHint : t.pin.hint}
      </T>

      {step === 'menu' ? (
        <View style={{ gap: 10, marginTop: space.xxl }}>
          <PillButton
            title={t.pin.change}
            onPress={() => {
              setIntent('change');
              setStep('verify');
            }}
          />
          <PillButton
            title={t.pin.turnOff}
            kind="secondary"
            onPress={() => {
              setIntent('off');
              setStep('verify');
            }}
          />
        </View>
      ) : (
        <>
          <PinDots length={entry.length} error={!!error} />
          <PinPad onDigit={onDigit} onDelete={() => setEntry((e) => e.slice(0, -1))} />
        </>
      )}
    </Screen>
  );
}
