// Polski. Teksty są neutralne płciowo: bez form typu „zrobiłeś/zrobiłaś”.
import type { Dict } from './en';
import { pluralPl } from './plural';

const WEEKDAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const WEEKDAYS_SHORT = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
const MONTHS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];
// Dates use the genitive: „25 września”.
const MONTHS_OF = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];
const MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const pl: Dict = {
  language: 'Polski',

  dates: {
    weekdayShort: (d) => WEEKDAYS_SHORT[d.getDay()],
    initials: ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'],
    long: (d) => `${capital(WEEKDAYS[d.getDay()])}, ${d.getDate()} ${MONTHS_OF[d.getMonth()]}`,
    short: (d) => `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`,
    range: (a, b) =>
      `${a.getDate()} ${MONTHS_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]}`,
    month: (m) => MONTHS[m],
    today: 'Dziś',
    yesterday: 'Wczoraj',
    greeting: (hour) => (hour < 5 ? 'Witaj' : hour < 18 ? 'Dzień dobry' : 'Dobry wieczór'),
  },

  common: {
    back: 'Wstecz',
    close: 'Zamknij',
    more: 'Więcej',
    moreOptions: 'Więcej opcji',
    begin: 'Zacznij',
    skip: 'Pomiń',
    save: 'Zapisz',
    cancel: 'Anuluj',
    done: 'Gotowe',
    delete: 'Usuń',
    settings: 'Ustawienia',
    minutes: (n) => `${n} min`,
    words: (n) => `${n} ${pluralPl(n, 'słowo', 'słowa', 'słów')}`,
    letGo: 'Puszczone.',
  },

  tabs: {
    today: 'Dziś',
    capture: 'Złap myśl',
    unload: 'Sesja',
    breath: 'Oddech',
    calendar: 'Kalendarz',
  },

  states: {
    'too-much': 'Za dużo naraz',
    scattered: 'Myśli mi się rozbiegają',
    stuck: 'Stoję w miejscu',
    weighing: 'Coś mi ciąży',
  },

  sessions: {
    pause: { name: 'Pauza', line: 'Ukój bieżące napięcie.' },
    clarity: { name: 'Jasność', line: 'Uporządkuj myśli i wyostrz skupienie.' },
    space: { name: 'Przestrzeń', line: 'Zrób porządek w głowie i miejsce na oddech.' },
    release: { name: 'Uwolnienie', line: 'Odłóż to, co dźwigasz od dawna.' },
  },

  sounds: {
    none: 'Cisza',
    rain: 'Cichy deszcz',
    brown: 'Szum brązowy',
    drone: 'Niski ton',
  },

  starters: [
    'Co zajmuje najwięcej miejsca w twojej głowie?',
    'Co ciągle wraca?',
    'Co zostało niewypowiedziane?',
    'Co wydaje się niedokończone?',
    'O czym próbujesz nie myśleć?',
    'Zapisz to, co w kółko powtarzasz sobie w głowie.',
    'Nie musisz tego rozumieć. Zacznij to opisywać.',
    'Co nosisz w sobie, choć nie chcesz teraz tego dźwigać?',
    'Co musi wyjść z twojej głowy?',
    'Jakie uczucie wciąż czeka na słowa?',
  ],

  companion: [
    'Pisz dalej. Nie ma złego sposobu.',
    'To nie musi jeszcze mieć sensu.',
    'Zostań z tym jeszcze chwilę.',
    'Co jeszcze tam jest?',
    'Tu może być chaotycznie.',
    'Nikt tego nie czyta.',
    'Powiedz to wprost.',
    'Idź za myślą, dokądkolwiek prowadzi.',
    'Możesz się powtarzać.',
    'Pozwól przyjść kolejnemu zdaniu.',
    'Zauważ, wokół czego krążysz.',
    'Wolniej też jest dobrze.',
  ],

  welcome: {
    tagline: 'Twoje myśli mają dokąd pójść.',
    nameLabel: 'Jak mamy się do ciebie zwracać?',
    namePlaceholder: 'Twoje imię',
    begin: 'Zaczynamy',
  },

  today: {
    subtitle: 'Twoje myśli mają dokąd pójść.',
    question: 'Co masz teraz w głowie?',
    chooseSession: 'Wybierz sesję',
    chooseSessionHint: 'Od razu do pisania',
    guideLabel: 'Przewodnik',
    guideTitle: 'Jak pisać',
    guideHint: 'Zanim zaczniesz',
    waiting: (n) =>
      n === 1
        ? 'Jedna myśl na ciebie czeka'
        : `${n} ${pluralPl(n, 'myśl', 'myśli', 'myśli')} na ciebie ${pluralPl(n, 'czeka', 'czekają', 'czeka')}`,
    recent: 'Ostatnie sesje',
    seeAll: 'Wszystkie',
    empty: 'Tu odpoczną twoje sesje.',
    parts: { morning: 'Rano', afternoon: 'Popołudnie', evening: 'Wieczór', night: 'Noc' },
  },

  checkin: {
    label: 'Co cię tu teraz sprowadza',
    question: 'Gdyby to miało nazwę, jak by brzmiała?',
    placeholder: 'wystarczy jedno słowo albo kilka',
    forward: 'Dalej',
  },

  affirmation: 'Nie musisz tego teraz rozwiązywać. Wystarczy dać temu miejsce.',

  choose: {
    title: 'Wybierz sesję',
    subtitle: 'Cztery długości ciszy',
    unloading: 'Zrzucasz z głowy',
    cameWith: 'Przychodzisz z',
    howToWrite: 'Jak pisać',
    a11y: (name, minutes, line) => `${name}, ${minutes} ${pluralPl(minutes, 'minuta', 'minuty', 'minut')}. ${line}`,
  },

  howTo: {
    title: 'Jak pisać',
    paragraphs: [
      'Zapisz wszystko, co masz teraz w głowie.',
      'Myśl. Zmartwienie. Coś, co wydarzyło się dziś, albo coś, do czego wciąż wracasz. Może coś, co chodzi za tobą od dawna, a może coś, co właśnie przyszło do głowy.',
      'Nie musisz pisać dobrze. Nie musisz nawet wiedzieć, co chcesz powiedzieć. Po prostu to zapisz.',
      'Może być chaotycznie. Może się powtarzać. W połowie możesz zmienić kierunek.',
      'To nie musi jeszcze mieć sensu.',
      'Traktuj to mniej jak pisanie, a bardziej jak opróżnianie głowy.',
    ],
    maybeIntro: 'Możesz zacząć od:',
    examples: [
      'Nie wiem, co napisać.',
      'Ciągle myślę o tamtej rozmowie.',
      'Może za dużo o tym myślę.',
      'Nie wiem, dlaczego to wciąż mnie gryzie.',
    ],
    closing: [
      'To wystarczy.',
      'Nie jesteś tu po to, żeby cokolwiek rozwiązać czy znaleźć odpowiedź — jeszcze nie.',
      'Nie ma jednego właściwego sposobu. Zacznij tam, gdzie jesteś.',
    ],
    cta: 'Wybierz sesję',
  },

  setup: {
    title: 'Ułóż swoją sesję',
    starters: 'Pytanie na start',
    startersHint: 'Pytanie, od którego można zacząć',
    companion: 'Frazy wsparcia',
    companionHint: 'Ciche słowa nad klawiaturą',
    breath: 'Najpierw oddech',
    breathHint: 'Minuta, żeby się wyciszyć przed pisaniem',
    sound: 'Dźwięk skupienia',
  },

  ground: {
    label: 'Zanim zaczniesz',
    title: 'Najpierw się zatrzymaj',
    hint: 'Minuta, żeby wylądować. Oddychaj razem z kołem.',
    start: 'Zacznij pisać',
  },

  write: {
    leave: 'Wyjdź z sesji',
    time: 'Czas',
    mute: 'Wycisz dźwięk',
    unmute: 'Włącz dźwięk',
    captured: 'Twoja zapisana myśl',
    beginHere: 'Zacznij tutaj',
    anotherPrompt: 'Inne pytanie',
    placeholder: 'Zacznij od czegokolwiek.',
    finish: 'Zakończ',
    timeUp: 'To już czas. Dokończ myśl.',
    leaveTitle: 'Wyjść z sesji?',
    finishKeep: 'Zakończ i zachowaj zapis',
    keepWriting: 'Pisz dalej',
    leaveWithoutSaving: 'Wyjdź bez zapisywania',
    leaveEmpty: 'Wyjdź',
  },

  complete: {
    title: 'Zrobiło się trochę miejsca.',
    unloaded: 'Co wyszło z głowy',
    swipe: 'Przesuń w górę, żeby to puścić',
    keep: 'Zachowaj',
    letGo: 'Puść',
    note: 'Puszczenie usuwa słowa. Sesja zostaje w kalendarzu.',
    released: 'Nie ma. Nie musisz już tego nosić.',
    kept: 'Zachowane. Możesz to puścić później.',
    noticeShift: 'Chcesz zauważyć, co się zmieniło?',
  },

  shift: {
    title: 'Zauważ zmianę',
    intro: 'Nie ma tu czego mierzyć. Po prostu zauważ, co jest inaczej — jeśli cokolwiek.',
    areas: {
      mind: { name: 'Umysł', better: 'Spokojniejszy', same: 'Bez zmian', worse: 'Bardziej aktywny' },
      body: { name: 'Ciało', better: 'Bardziej rozluźnione', same: 'Bez zmian', worse: 'Bardziej spięte' },
      attention: { name: 'Uwaga', better: 'Jaśniejsza', same: 'Bez zmian', worse: 'Wciąż rozproszona' },
    },
    // „Spokojniejszy: 7 · Bez zmian: 2 · Bardziej aktywny: 1”
    summary: (parts) => parts.map((p) => `${p.label}: ${p.count}`).join(' · '),
  },

  capture: {
    title: 'Złap myśl',
    intro: 'Zapisz myśl, zanim ucieknie. Wróć do niej, kiedy będzie na to czas.',
    label: 'Zapisz jedną myśl lub zdanie',
    placeholder: 'Ciągle wraca do mnie to, że…',
    saved: 'Zapisane na później',
    forLater: 'Na później',
    all: 'Wszystkie',
    waiting: 'Czekają',
    explored: 'Zgłębione',
    empty: 'Jeszcze nic tu nie ma.',
    sheetTitle: 'Ta myśl',
    unloadThis: 'Rozpisz to',
  },

  breath: {
    title: 'Oddech',
    idle: 'Zacznij, kiedy zechcesz',
    left: (clock) => `zostało ${clock}`,
    stop: 'Przerwij',
    phases: { in: 'Wdech', hold: 'Zatrzymaj', out: 'Wydech', rest: 'Odpocznij' },
    patterns: {
      settle: { name: 'Ukojenie', line: 'Dłuższy wydech mówi ciału, że jest bezpiecznie.' },
      box: { name: 'Kwadrat', line: 'Cztery równe boki. Uspokaja gonitwę myśli.' },
      deep: { name: 'Głęboki', line: 'Powolny reset, dobry przed snem.' },
      even: { name: 'Równy', line: 'Sześć oddechów na minutę. Cicho i w równowadze.' },
    },
  },

  calendar: {
    title: 'Kalendarz',
    summary: (sessions, minutes) =>
      `${sessions} ${pluralPl(sessions, 'sesja', 'sesje', 'sesji')} · ${minutes} ${pluralPl(minutes, 'minuta', 'minuty', 'minut')}`,
    views: { timeline: 'Oś czasu', week: 'Tydzień', month: 'Miesiąc', insights: 'Wnioski' },
    firstSession: 'Tu pojawi się twoja pierwsza sesja.',
    prevWeek: 'Poprzedni tydzień',
    nextWeek: 'Następny tydzień',
    dayMinutes: (m) => `${m}′`,
    weekLegend: 'Pełne kółka to sesje zachowane, puste — puszczone.',
    quietWeek: 'Spokojny tydzień.',
    thisWeek: 'Ten tydzień',
    prevMonth: 'Poprzedni miesiąc',
    nextMonth: 'Następny miesiąc',
    noSessionsDay: 'Brak sesji tego dnia.',
    stats: { sessions: 'Sesje', minutes: 'Minuty', letGo: 'Puszczone' },
    recentLine: (count, favourite) => `${count} w ostatnich 30 dniach · najczęściej ${favourite}`,
    brings: 'Co cię tu sprowadza',
    bringsEmpty: 'Wybierz na ekranie Dziś, co masz w głowie, a zobaczysz to tutaj.',
    shifts: 'Twoje zmiany',
    shiftsEmpty: 'Po sesji zauważ, co się zmieniło — zobaczysz to tutaj.',
    shiftsOff: 'Włącz „Zauważ zmianę” w ustawieniach, żeby to zobaczyć.',
  },

  entry: {
    missing: 'Tej sesji już tu nie ma.',
    fromCapture: (text) => `Z zapisanej myśli: ${text}`,
    released: 'Ta sesja została puszczona.',
    shifted: 'Co się zmieniło',
    again: 'Nowa sesja',
    sheetTitle: 'Ta sesja',
    letGo: 'Puść',
    delete: 'Usuń sesję',
    note: 'Puszczenie zostawia sesję w kalendarzu. Usunięcie kasuje ją całkowicie.',
  },

  settings: {
    title: 'Ustawienia',
    about: 'O aplikacji',
    method: 'Metoda Unload',
    language: 'Język',
    languageDetail: (name) => `${name} · jak w ustawieniach urządzenia`,
    appearance: 'Wygląd',
    themes: { system: 'Systemowy', light: 'Jasny', dark: 'Ciemny' },
    sessions: 'Sesje',
    designEach: 'Układaj każdą sesję',
    designEachHint: 'Wybieraj za każdym razem, co ma się w niej znaleźć',
    askEachTime: 'Pytaj mnie za każdym razem o',
    askAbout: (title) => `Pytaj o: ${title}`,
    alwaysUse: 'Zawsze używaj',
    everySession: 'Każda sesja zawiera',
    options: {
      starters: { title: 'Pytania na start', detail: 'Pytanie, od którego można zacząć' },
      companion: { title: 'Frazy wsparcia', detail: 'Ciche słowa nad klawiaturą podczas pisania' },
      sound: { title: 'Dźwięk skupienia', detail: 'Delikatna pętla w tle' },
      breath: { title: 'Zaproszenie do oddechu', detail: 'Minuta na wyciszenie przed pisaniem' },
    },
    showHowTo: 'Pokazuj „Jak pisać”',
    showHowToHint: 'Krótki przewodnik na ekranie wyboru sesji',
    noticeShift: 'Zauważ zmianę',
    noticeShiftHint: 'Po sesji zapraszaj mnie do zauważenia, co się zmieniło',
    privacy: 'Prywatność i bezpieczeństwo',
    pin: 'Blokada PIN',
    on: 'Włączona',
    off: 'Wyłączona',
    data: 'Twoje dane',
    dataHint: 'Co jest przechowywane i gdzie',
    account: 'Konto',
    name: 'Imię',
    namePlaceholder: 'Twoje imię',
    email: 'E-mail',
    emailPlaceholder: 'ty@example.com',
    subscription: 'Subskrypcja',
    subscriptionHint: 'Plan, odnowienie i rezygnacja',
    version: 'Unload · 1.0',
  },

  method: {
    title: 'Metoda Unload',
    intro:
      'Unload to sposób na przelanie zawartości głowy na papier. Nie dziennik, nie pamiętnik — miejsce, do którego myśli mogą trafić, żeby nie trzeba było ich dłużej nosić.',
    steps: [
      {
        title: 'Zauważ',
        body: 'Powiedz, co jest tu teraz. Nazwij to, jeśli się da — jedno słowo wystarczy. Nazwane uczucie robi się mniejsze.',
      },
      {
        title: 'Opróżnij',
        body: 'Pisz bez przerwy przez ustalony czas. Nie poprawiaj, nie oceniaj, nie czytaj od nowa. Chaotycznie i z powtórzeniami — dokładnie tak ma być.',
      },
      {
        title: 'Zostaw',
        body: 'Kiedy czas minie, zachowaj zapis albo go puść. Potem, jeśli chcesz, zauważ, co zmieniło się w umyśle, ciele i uwadze.',
      },
    ],
    captureLabel: 'Złap myśl',
    capture:
      'Niektóre myśli przychodzą w złym momencie. Zapisz je jednym zdaniem i wróć, kiedy będzie czas, żeby się nimi zająć.',
    disclaimer:
      'Unload to narzędzie do pracy nad sobą. Nie zastępuje terapii ani opieki medycznej. W kryzysie skontaktuj się z lokalnym numerem alarmowym lub telefonem zaufania w swoim kraju.',
  },

  pin: {
    menu: 'Blokada PIN jest włączona',
    verify: 'Wpisz obecny PIN',
    choose: 'Wybierz 4-cyfrowy PIN',
    confirm: 'Wpisz go jeszcze raz',
    menuHint: 'Unload poprosi o niego przy każdym otwarciu.',
    hint: 'Twoje sesje zostaną prywatne na tym urządzeniu.',
    change: 'Zmień PIN',
    turnOff: 'Wyłącz PIN',
    mismatch: 'Ten PIN się nie zgadza.',
    different: 'Te dwa PIN-y się różnią. Spróbuj jeszcze raz.',
    delete: 'Usuń',
  },

  lock: {
    enter: 'Wpisz PIN',
    retry: 'Spróbuj jeszcze raz',
  },

  privacy: {
    title: 'Twoje dane',
    points: [
      {
        title: 'Co przechowujemy',
        body: 'Twoje sesje, zapisane myśli, check-iny, to, co zauważasz po sesjach, oraz ustawienia.',
      },
      {
        title: 'Gdzie to jest',
        body: 'Tylko na tym urządzeniu. Nic, co piszesz, nie trafia na serwer, nie jest udostępniane ani używane do trenowania czegokolwiek.',
      },
      {
        title: 'Puszczanie',
        body: 'Kiedy puszczasz sesję, jej słowa zostają usunięte. Zostają tylko data, długość i rodzaj sesji.',
      },
      {
        title: 'Twoje konto',
        body: 'Imię i e-mail służą do powitania i obsługi subskrypcji. Możesz je zmienić w każdej chwili.',
      },
    ],
    deleteAll: 'Usuń wszystkie moje dane',
    confirmTitle: 'Usunąć wszystko?',
    confirmBody:
      'Wszystkie sesje, zapisane myśli i ustawienia na tym urządzeniu zostaną usunięte. Tego nie da się cofnąć.',
    confirm: 'Usuń wszystkie dane',
  },

  subscription: {
    title: 'Subskrypcja',
    current: 'Obecny plan',
    trial: 'Bezpłatny okres próbny',
    started: 'Początek',
    ends: 'Koniec',
    plans: 'Dostępne plany',
    monthly: { name: 'Miesięczny', price: '— / miesiąc', note: 'Rezygnujesz, kiedy chcesz' },
    yearly: { name: 'Roczny', price: '— / rok', note: 'Dwa miesiące gratis' },
    howToCancel: 'Jak zrezygnować',
    cancelBody: (store) =>
      store === 'android'
        ? 'Subskrypcją zarządza Google Play. Otwórz Sklep Play, stuknij swój profil, potem Płatności i subskrypcje → Subskrypcje, wybierz Unload i anuluj. Dostęp zostaje do końca opłaconego okresu.'
        : 'Subskrypcją zarządza App Store. Otwórz Ustawienia, stuknij swoje imię, potem Subskrypcje, wybierz Unload i anuluj. Dostęp zostaje do końca opłaconego okresu.',
  },
};
