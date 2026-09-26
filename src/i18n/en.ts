// English — the default language and the source of truth for every other dictionary.
import { pluralEn } from './plural';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const short = (s: string) => s.slice(0, 3);

export const en = {
  language: 'English',

  dates: {
    weekdayShort: (d: Date) => short(WEEKDAYS[d.getDay()]),
    // Monday first.
    initials: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    long: (d: Date) => `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`,
    short: (d: Date) => `${short(WEEKDAYS[d.getDay()])} ${d.getDate()} ${short(MONTHS[d.getMonth()])}`,
    range: (a: Date, b: Date) =>
      `${a.getDate()} ${short(MONTHS[a.getMonth()])} – ${b.getDate()} ${short(MONTHS[b.getMonth()])}`,
    month: (m: number) => MONTHS[m],
    today: 'Today',
    yesterday: 'Yesterday',
    greeting: (hour: number): string =>
      hour < 5 ? 'Hello' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
  },

  common: {
    back: 'Back',
    close: 'Close',
    more: 'More',
    moreOptions: 'More options',
    begin: 'Begin',
    skip: 'Skip',
    save: 'Save',
    cancel: 'Cancel',
    done: 'Done',
    delete: 'Delete',
    settings: 'Settings',
    minutes: (n: number) => `${n} min`,
    words: (n: number) => `${n} ${pluralEn(n, 'word', 'words')}`,
    letGo: 'Let go.',
  },

  tabs: {
    today: 'Today',
    capture: 'Capture',
    unload: 'Unload',
    breath: 'Breath',
    calendar: 'Calendar',
  },

  states: {
    'too-much': 'Too much at once',
    scattered: 'My mind feels scattered',
    stuck: 'I feel stuck',
    weighing: 'Something is weighing on me',
  },

  sessions: {
    pause: { name: 'Pause', line: 'Settle immediate tension.' },
    clarity: { name: 'Clarity', line: 'Organize thoughts and sharpen focus.' },
    space: { name: 'Space', line: 'Clear mental clutter and make room to breathe.' },
    release: { name: 'Release', line: "Let go of what you've been carrying." },
  },

  sounds: {
    none: 'Silence',
    rain: 'Soft rain',
    brown: 'Brown noise',
    drone: 'Low drone',
  },

  starters: [
    "What's taking up the most space in your mind?",
    'What keeps returning?',
    "What haven't you said?",
    'What feels unfinished?',
    'What are you trying not to think about?',
    'Write the thing you keep rehearsing in your head.',
    "You don't have to understand it. Start describing it.",
    "What are you carrying that you don't want to carry right now?",
    'What needs to get out of your head?',
    "What are you feeling that you haven't given words to yet?",
  ],

  companion: [
    "Keep going. There's no wrong way.",
    "You don't have to make sense yet.",
    'Stay with it a little longer.',
    'What else is there?',
    'It can be messy here.',
    'Nobody is reading this.',
    'Say it plainly.',
    'Follow the thought wherever it goes.',
    "You're allowed to repeat yourself.",
    'Let the next sentence come.',
    'Notice what you keep circling.',
    'Slower is fine.',
  ],

  welcome: {
    tagline: 'Your thoughts have somewhere to go.',
    nameLabel: 'What should we call you?',
    namePlaceholder: 'Your first name',
    begin: 'Begin',
  },

  today: {
    subtitle: 'Your thoughts have somewhere to go.',
    question: "What's on your mind right now?",
    chooseSession: 'Choose a session',
    chooseSessionHint: 'Straight to writing',
    guideLabel: 'Guide',
    guideTitle: 'How to Unload',
    guideHint: 'Before you begin',
    waiting: (n: number) => (n === 1 ? 'One thought is waiting for you' : `${n} thoughts are waiting for you`),
    recent: 'Recent sessions',
    seeAll: 'See all',
    empty: 'Your sessions will rest here.',
    parts: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' },
  },

  checkin: {
    label: 'What brings you here now',
    question: 'If it had a name, what would it be?',
    placeholder: 'one word or a few is enough',
    forward: 'Forward',
  },

  affirmation: "You don't need to solve it now, just give it a place to go.",

  choose: {
    title: 'Choose your session',
    subtitle: 'Four lengths of quiet',
    unloading: 'Unloading',
    cameWith: 'You came with',
    howToWrite: 'How to write',
    a11y: (name: string, minutes: number, line: string) => `${name}, ${minutes} minutes. ${line}`,
  },

  howTo: {
    title: 'How to write',
    paragraphs: [
      'Write down whatever is on your mind.',
      "A thought. A worry. Something that happened today or something you keep coming back to. Maybe something that's been on your mind for a while or something that just popped into your head.",
      "You don't have to write well. You don't even have to know what you're trying to say. Just put it down.",
      'It can be messy. It can be repetitive. You can change direction halfway through.',
      "You don't need to make sense of it yet.",
      'Think of it less as writing and more as emptying your mind.',
    ],
    maybeIntro: 'Maybe you start with:',
    examples: [
      "I don't know what to write.",
      'I keep thinking about that conversation.',
      "Maybe I'm overthinking it.",
      "I don't know why this still bothers me.",
    ],
    closing: [
      "That's enough.",
      "You're not here to solve anything or find an answer just yet.",
      "There's no right way to do this. Just start where you are.",
    ],
    cta: 'Choose your session',
  },

  setup: {
    title: 'Design your session',
    starters: 'Starter prompt',
    startersHint: 'A question to begin with',
    companion: 'Companion phrases',
    companionHint: 'Quiet words above the keyboard',
    breath: 'Breathe first',
    breathHint: 'One minute to arrive before you write',
    sound: 'Focus sound',
  },

  ground: {
    label: 'Before you begin',
    title: 'Arrive first',
    hint: 'One minute to land. Breathe with the circle.',
    start: 'Start writing',
  },

  write: {
    leave: 'Leave session',
    time: 'Time',
    mute: 'Mute sound',
    unmute: 'Play sound',
    captured: 'Your captured thought',
    beginHere: 'Begin here',
    anotherPrompt: 'Another prompt',
    placeholder: 'Start anywhere.',
    finish: 'Finish',
    timeUp: "That's the time. Finish your thought.",
    leaveTitle: 'Leave this session?',
    finishKeep: 'Finish and keep what I wrote',
    keepWriting: 'Keep writing',
    leaveWithoutSaving: 'Leave without saving',
    leaveEmpty: 'Leave',
  },

  complete: {
    title: 'You made some space.',
    unloaded: 'What you unloaded',
    swipe: 'Swipe up to let it go',
    keep: 'Keep',
    letGo: 'Let it go',
    note: 'Letting go erases the words. The session stays in your calendar.',
    released: "Gone. You don't have to carry it.",
    kept: 'Kept. You can let it go later.',
    noticeShift: 'Want to notice what shifted?',
  },

  shift: {
    title: 'Notice the shift',
    intro: "There's nothing to measure. Just notice what feels different — if anything.",
    areas: {
      mind: { name: 'Mind', better: 'Quieter', same: 'Same', worse: 'More active' },
      body: { name: 'Body', better: 'More settled', same: 'Same', worse: 'More tense' },
      attention: { name: 'Attention', better: 'Clearer', same: 'Same', worse: 'Still scattered' },
    },
    // "7 quieter · 2 same · 1 more active"
    summary: (parts: { label: string; count: number }[]) =>
      parts.map((p) => `${p.count} ${p.label.toLowerCase()}`).join(' · '),
  },

  capture: {
    title: 'Capture',
    intro: "Save a thought before it slips away. Come back to it when you're ready to explore it further.",
    label: 'Write one thought or sentence',
    placeholder: 'It keeps coming back that…',
    saved: 'Saved for later',
    forLater: 'For later',
    all: 'All',
    waiting: 'Waiting',
    explored: 'Explored',
    empty: 'Nothing here yet.',
    sheetTitle: 'This thought',
    unloadThis: 'Unload this',
  },

  breath: {
    title: 'Breath',
    idle: 'Ready when you are',
    left: (clock: string) => `${clock} left`,
    stop: 'Stop',
    phases: { in: 'Breathe in', hold: 'Hold', out: 'Breathe out', rest: 'Rest' },
    patterns: {
      settle: { name: 'Settle', line: 'A longer exhale tells the body it is safe.' },
      box: { name: 'Box', line: 'Four even sides. Steadies a racing mind.' },
      deep: { name: 'Deep', line: 'A slow reset, good before sleep.' },
      even: { name: 'Even', line: 'Six breaths a minute. Quiet and balanced.' },
    },
  },

  calendar: {
    title: 'Calendar',
    summary: (sessions: number, minutes: number) =>
      `${sessions} ${pluralEn(sessions, 'session', 'sessions')} · ${minutes} ${pluralEn(minutes, 'minute', 'minutes')}`,
    views: { timeline: 'Timeline', week: 'Week', month: 'Month', insights: 'Insights' },
    firstSession: 'Your first session will appear here.',
    prevWeek: 'Previous week',
    nextWeek: 'Next week',
    dayMinutes: (m: number) => `${m}m`,
    weekLegend: 'Filled circles were kept. Open circles were let go.',
    quietWeek: 'A quiet week.',
    thisWeek: 'This week',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    noSessionsDay: 'No sessions this day.',
    stats: { sessions: 'Sessions', minutes: 'Minutes', letGo: 'Let go' },
    recentLine: (count: number, favourite: string) => `${count} in the last 30 days · most often ${favourite}`,
    brings: 'What brings you here',
    bringsEmpty: "Choose what's on your mind on Today to see it here.",
    shifts: 'Your shifts',
    shiftsEmpty: 'After a session, notice what shifted to see it here.',
    shiftsOff: 'Turn on “Notice the shift” in Settings to see this.',
  },

  entry: {
    missing: 'This session is no longer here.',
    fromCapture: (text: string) => `From capture: ${text}`,
    released: 'You let this one go.',
    shifted: 'What shifted',
    again: 'Unload again',
    sheetTitle: 'This session',
    letGo: 'Let it go',
    delete: 'Delete session',
    note: 'Letting go keeps the session in your calendar. Deleting removes it completely.',
  },

  settings: {
    title: 'Settings',
    about: 'About',
    method: 'The Unload method',
    language: 'Language',
    languageDetail: (name: string) => `${name} · follows your device`,
    appearance: 'Appearance',
    themes: { system: 'System', light: 'Light', dark: 'Dark' },
    sessions: 'Sessions',
    designEach: 'Design each session',
    designEachHint: 'Choose what to include every time you start',
    askEachTime: 'Ask me each time about',
    askAbout: (title: string) => `Ask about ${title}`,
    alwaysUse: 'Always use',
    everySession: 'Every session includes',
    options: {
      starters: { title: 'Starter prompts', detail: 'A question to begin with' },
      companion: { title: 'Companion phrases', detail: 'Quiet words above the keyboard while you write' },
      sound: { title: 'Focus sound', detail: 'A soft loop in the background' },
      breath: { title: 'Breathing invitation', detail: 'One minute to arrive before writing' },
    },
    showHowTo: 'Show “How to write”',
    showHowToHint: 'A small guide on the session screen',
    noticeShift: 'Notice the shift',
    noticeShiftHint: 'Invite me to notice what changed after a session',
    privacy: 'Privacy & security',
    pin: 'PIN lock',
    on: 'On',
    off: 'Off',
    data: 'Your data',
    dataHint: 'What is stored and where',
    account: 'Account',
    name: 'Name',
    namePlaceholder: 'Your first name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    subscription: 'Subscription',
    subscriptionHint: 'Plan, renewal and how to cancel',
    version: 'Unload · 1.0',
  },

  method: {
    title: 'The Unload method',
    intro:
      'Unload is a way of emptying your head onto a page. Not a journal, not a diary — a place for thoughts to go so you can stop carrying them.',
    steps: [
      {
        title: 'Notice',
        body: 'Say what is here right now. Give it a name if you can — one word is enough. Naming a feeling makes it smaller.',
      },
      {
        title: 'Empty',
        body: 'Write without stopping for a set time. Do not edit, do not judge, do not reread. Messy and repetitive is exactly right.',
      },
      {
        title: 'Leave it',
        body: 'When the time is up, keep the page or let it go. Then, if you like, notice what shifted in your mind, body and attention.',
      },
    ],
    captureLabel: 'Capture',
    capture:
      'Some thoughts arrive at the wrong moment. Capture them in one sentence and come back when you have time to unload them properly.',
    disclaimer:
      'Unload is a tool for working on yourself. It is not a replacement for therapy or medical care. If you are in crisis, contact local emergency services or a crisis line in your country.',
  },

  pin: {
    menu: 'PIN lock is on',
    verify: 'Enter your current PIN',
    choose: 'Choose a 4-digit PIN',
    confirm: 'Enter it once more',
    menuHint: 'Unload asks for it when you open the app.',
    hint: 'Keep your sessions private on this device.',
    change: 'Change PIN',
    turnOff: 'Turn off PIN',
    mismatch: 'That PIN does not match.',
    different: 'The two PINs were different. Try again.',
    delete: 'Delete',
  },

  lock: {
    enter: 'Enter your PIN',
    retry: 'Try again',
  },

  privacy: {
    title: 'Your data',
    points: [
      {
        title: 'What we keep',
        body: 'Your sessions, captured thoughts, check-ins, what you noticed after sessions, and your settings.',
      },
      {
        title: 'Where it lives',
        body: 'Only on this device. Nothing you write is sent to a server, shared, or used to train anything.',
      },
      {
        title: 'Letting go',
        body: 'When you let a session go, its words are erased. Only the date, length and session type remain.',
      },
      {
        title: 'Your account',
        body: 'Your name and email are used to greet you and for your subscription. You can change them at any time.',
      },
    ],
    deleteAll: 'Delete all my data',
    confirmTitle: 'Delete everything?',
    confirmBody: 'Every session, capture and setting on this device will be erased. This cannot be undone.',
    confirm: 'Delete all data',
  },

  subscription: {
    title: 'Subscription',
    current: 'Current plan',
    trial: 'Free trial',
    started: 'Started',
    ends: 'Ends',
    plans: 'Available plans',
    monthly: { name: 'Monthly', price: '— / month', note: 'Cancel any time' },
    yearly: { name: 'Yearly', price: '— / year', note: 'Two months free' },
    howToCancel: 'How to cancel',
    cancelBody: (store: 'ios' | 'android'): string =>
      store === 'android'
        ? 'Subscriptions are managed by Google Play. Open the Play Store, tap your profile, then Payments & subscriptions → Subscriptions, choose Unload and cancel. You keep access until the end of the period you paid for.'
        : 'Subscriptions are managed by the App Store. Open Settings, tap your name, then Subscriptions, choose Unload and cancel. You keep access until the end of the period you paid for.',
  },
};

export type Dict = typeof en;
