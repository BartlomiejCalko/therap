import { useState } from 'react';

import { Insights, MonthView, Timeline, WeekView } from '@/components/CalendarViews';
import { T } from '@/components/T';
import { Screen, Segmented } from '@/components/ui';
import { useStore } from '@/store/store';
import { space } from '@/theme/tokens';

type View = 'timeline' | 'week' | 'month' | 'insights';

export default function CalendarTab() {
  const { sessions, checkins, settings } = useStore().data;
  const [view, setView] = useState<View>('timeline');
  const minutes = sessions.reduce(
    (sum, s) => sum + Math.max(1, Math.round((s.endedAt - s.startedAt) / 60000)),
    0,
  );

  return (
    <Screen withTabBar contentStyle={{ paddingTop: space.lg }}>
      <T variant="title" center>
        Calendar
      </T>
      <T variant="small" tone="faint" center style={{ marginTop: space.xs, marginBottom: space.lg }}>
        {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} · {minutes} minutes
      </T>
      <Segmented<View>
        value={view}
        onChange={setView}
        items={[
          { key: 'timeline', label: 'Timeline' },
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
          { key: 'insights', label: 'Insights' },
        ]}
      />
      {view === 'timeline' && <Timeline sessions={sessions} checkins={checkins} />}
      {view === 'week' && <WeekView sessions={sessions} checkins={checkins} />}
      {view === 'month' && <MonthView sessions={sessions} checkins={checkins} />}
      {view === 'insights' && (
        <Insights sessions={sessions} checkins={checkins} noticeShift={settings.noticeShift} />
      )}
    </Screen>
  );
}
