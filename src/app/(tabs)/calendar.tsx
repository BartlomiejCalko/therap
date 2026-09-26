import { useState } from 'react';

import { Insights, MonthView, Timeline, WeekView } from '@/components/CalendarViews';
import { T } from '@/components/T';
import { Screen, Segmented } from '@/components/ui';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import { space } from '@/theme/tokens';

type View = 'timeline' | 'week' | 'month' | 'insights';

export default function CalendarTab() {
  const t = useT();
  const { sessions, checkins, settings } = useStore().data;
  const [view, setView] = useState<View>('timeline');
  const minutes = sessions.reduce(
    (sum, s) => sum + Math.max(1, Math.round((s.endedAt - s.startedAt) / 60000)),
    0,
  );

  return (
    <Screen withTabBar contentStyle={{ paddingTop: space.lg }}>
      <T variant="title" center>
        {t.calendar.title}
      </T>
      <T variant="small" tone="faint" center style={{ marginTop: space.xs, marginBottom: space.lg }}>
        {t.calendar.summary(sessions.length, minutes)}
      </T>
      <Segmented<View>
        value={view}
        onChange={setView}
        items={[
          { key: 'timeline', label: t.calendar.views.timeline },
          { key: 'week', label: t.calendar.views.week },
          { key: 'month', label: t.calendar.views.month },
          { key: 'insights', label: t.calendar.views.insights },
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
