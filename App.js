import React from 'react';
import { Alert, AppState, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA_URL = 'https://raw.githubusercontent.com/velvet0523/morning-brief/main/data/today.json';
const CHAT_REFRESH_URL = 'https://chatgpt.com/c/6a9c3a18-ce08-83ee-b207-0ab2e8886f30';
const THEME_STORAGE_KEY = '@morning-brief/theme';

const THEMES = {
  dark: {
    background: '#0b1220', surface: '#151f31', surfaceAlt: '#111a2b', border: '#22314a',
    divider: '#273750', hero: '#14345a', text: '#f5f7fb', body: '#c0cad9',
    secondary: '#8fa3bd', muted: '#94a3b8', subdued: '#64748b', accent: '#62a8ff',
    accentLight: '#8ec5ff', accentLabel: '#7fb8f5', activeSurface: '#1b4778',
    onAccent: '#ffffff', heroHint: '#b8d7f7', heroBody: '#d6e7fa',
    warning: '#f3c969', watchBackground: '#202238', watchText: '#d7dbea',
    primaryButton: '#2d78cf',
  },
  light: {
    background: '#f3f6fa', surface: '#ffffff', surfaceAlt: '#ffffff', border: '#d9e2ee',
    divider: '#e3e9f1', hero: '#dcecff', text: '#142033', body: '#34445a',
    secondary: '#5f7289', muted: '#60758e', subdued: '#7b8da3', accent: '#1769aa',
    accentLight: '#1769aa', accentLabel: '#1769aa', activeSurface: '#1769aa',
    onAccent: '#ffffff', heroHint: '#476b91', heroBody: '#294b70',
    warning: '#9a6500', watchBackground: '#fff6dc', watchText: '#4a5568',
    primaryButton: '#1769aa',
  },
};

const formatUpdatedAt = (value) => {
  if (!value) return '아직 갱신 기록 없음';
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function App() {
  const [data, setData] = React.useState(null);
  const [tab, setTab] = React.useState('NEWS');
  const [refreshing, setRefreshing] = React.useState(false);
  const [newStock, setNewStock] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [addedStocks, setAddedStocks] = React.useState([]);
  const [themeName, setThemeName] = React.useState('dark');
  const theme = THEMES[themeName];
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  React.useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedTheme) => {
        if (savedTheme === 'light' || savedTheme === 'dark') setThemeName(savedTheme);
      })
      .catch(() => {});
  }, []);

  const selectTheme = React.useCallback((nextTheme) => {
    setThemeName(nextTheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme).catch(() => {});
  }, []);
  const loadData = React.useCallback(() => {
    setRefreshing(true);
    return fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => r.json()).then(setData).catch(() => {}).finally(() => setRefreshing(false));
  }, []);
  React.useEffect(() => {
    loadData();
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') loadData();
    });
    return () => subscription.remove();
  }, [loadData]);

  const stories = data?.stories || [];
  const macroStories = stories.filter((story) => story.category === 'MACRO');
  const industryStories = stories.filter((story) => story.category === 'INDUSTRY');
  const markets = data?.markets || ['S&P 500', 'NASDAQ', 'KOSPI', '닛케이 225', '원·달러', 'WTI'].map((label) => ({ label, value: '—' }));
  const flow = data?.flowAnalysis || {
    title: '핵심 뉴스의 연결고리를 분석 중입니다',
    overview: '다음 AI 갱신부터 주요 사건이 금리·유가·산업과 주가에 전달되는 경로를 요약합니다.',
    links: [],
    watch: '사실로 확인된 변화와 시장의 추정을 구분해 표시합니다.',
  };
  const stocks = data?.stocks || [
    { symbol: '005930.KS', name: '삼성전자', change: '—', stance: '분석 예정', reason: '관심 종목을 등록하면 오늘 뉴스와 주가 변동의 연결고리를 분석합니다.' },
    { symbol: '000660.KS', name: 'SK하이닉스', change: '—', stance: '분석 예정', reason: '반도체·메모리 수급과 산업 뉴스의 영향을 표시합니다.' },
    { symbol: 'NVDA', name: 'NVIDIA', change: '—', stance: '분석 예정', reason: 'AI 인프라 투자와 공급망 뉴스의 영향을 표시합니다.' },
  ];

  const visibleStocks = [...stocks, ...addedStocks];
  const screenTitle = { NEWS: '아침 브리핑', STOCK: '관심 종목', FLOW: '뉴스 흐름' }[tab];
  const headerUpdatedAt = tab === 'STOCK' ? data?.updatedAt : (data?.newsUpdatedAt || data?.updatedAt);
  const addStock = () => {
    const symbol = newStock.trim().toUpperCase();
    if (!symbol || visibleStocks.some((stock) => stock.symbol === symbol)) return;
    setAddedStocks([...addedStocks, { symbol, name: symbol, change: '—', stance: '분석 예정', reason: '추가한 관심 종목입니다. 다음 브리핑부터 관련 뉴스와 주가 영향을 분석합니다.' }]);
    setNewStock('');
  };

  const requestAIRefresh = () => {
    Alert.alert(
      'AI 뉴스 최신화',
      'ChatGPT가 열리면 “지금 뉴스 갱신해줘”라고 보내세요. 분석이 끝난 뒤 앱으로 돌아오면 최신 데이터를 자동으로 다시 확인합니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: 'ChatGPT 열기', onPress: () => Linking.openURL(CHAT_REFRESH_URL) },
      ],
    );
  };

  const renderStories = (items) => items.map((story) => (
    <View style={styles.card} key={story.tag + story.title}>
      <View style={styles.row}><Text style={styles.tag}>{story.tag}</Text><Text style={styles.level}>{story.level}{story.importanceScore ? ' · ' + story.importanceScore + '점' : ''}</Text></View>
      <Text style={styles.cardTitle}>{story.title}</Text>
      <Text style={styles.body}>{story.summary}</Text>
      <Text style={styles.why}>왜 중요한가 · {story.why}</Text>
      <Pressable onPress={() => story.source && Linking.openURL(story.source)}><Text style={styles.source}>원문 출처 열기  ›</Text></Pressable>
    </View>
  ));

  return (
    <View style={styles.screen}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.accent} colors={[theme.accent]} />}>
          <View style={styles.buildRow}><Text style={styles.eyebrow}>MORNING BRIEF</Text><Text style={styles.build}>FLOW V3</Text></View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{screenTitle}</Text>
            {tab === 'NEWS' && <Pressable style={styles.refreshButton} onPress={requestAIRefresh}><Text style={styles.refreshIcon}>↻</Text><Text style={styles.refreshText}>뉴스 최신화</Text></Pressable>}
            {tab === 'STOCK' && <Pressable style={styles.searchIcon} onPress={() => setShowSearch(!showSearch)}><Text style={styles.searchIconText}>⌕</Text></Pressable>}
          </View>
          <Text style={styles.date}>{data?.date || '오늘'} · 한국시간</Text>
          <Text style={styles.updatedAt}>{tab === 'STOCK' ? '최근 데이터 반영' : '최근 AI 분석'} · {formatUpdatedAt(headerUpdatedAt)}</Text>
          {tab === 'STOCK' && showSearch && <View style={styles.topSearch}><TextInput value={newStock} onChangeText={setNewStock} placeholder="티커 입력 (예: MU, 005930.KS)" placeholderTextColor={theme.subdued} style={styles.input} autoCapitalize="characters" autoFocus/><Pressable onPress={addStock} style={styles.addButton}><Text style={styles.addButtonText}>추가</Text></Pressable></View>}
          {tab === 'NEWS' ? (
            <>
              <View style={styles.hero}><Text style={styles.heroLabel}>TODAY IN 3 LINES</Text><Text style={styles.heroText}>{data?.headline || '세계 경제와 주식시장의 핵심 흐름을 출근 전 빠르게 확인하세요.'}</Text><Text style={styles.heroHint}>AI가 중요도와 시장 영향을 분석한 브리핑입니다.</Text></View>
              <Text style={styles.section}>핵심 뉴스 · 매크로</Text>
              {macroStories.length ? renderStories(macroStories) : <Text style={styles.empty}>선정 기준을 통과한 매크로 뉴스가 없습니다.</Text>}
              <Text style={styles.section}>핵심 뉴스 · 산업</Text>
              {industryStories.length ? renderStories(industryStories) : <Text style={styles.empty}>선정 기준을 통과한 산업 뉴스가 없습니다.</Text>}
              <Text style={styles.section}>시장 한눈에 보기</Text>
              <View style={styles.metrics}>{markets.map((item) => <View style={styles.metric} key={item.label}><Text style={styles.metricLabel}>{item.label}</Text><Text style={styles.metricValue}>{item.value}</Text></View>)}</View>
            </>
          ) : tab === 'STOCK' ? (
            <>
              <View style={styles.hero}><Text style={styles.heroLabel}>TODAY'S STOCK IMPACT</Text><Text style={styles.heroText}>오늘 뉴스가 관심 종목에 미친 영향을 확인하세요.</Text><Text style={styles.heroHint}>주가 변화의 원인을 호재·악재·수급성 움직임으로 구분합니다.</Text></View>
              <Text style={styles.section}>관심 종목 분석</Text>
              {visibleStocks.map((stock) => <View style={styles.card} key={stock.symbol}><View style={styles.row}><Text style={styles.stockName}>{stock.name}</Text><Text style={styles.stockChange}>{stock.change}</Text></View><Text style={styles.symbol}>{stock.symbol} · {stock.stance}</Text><Text style={styles.stockTime}>분석 기준 · {formatUpdatedAt(stock.analyzedAt || data?.updatedAt)}</Text><Text style={styles.body}>{stock.reason}</Text><Text style={styles.why}>관련 매크로·산업 뉴스, 기업 고유 이슈, 시장 수급을 구분해 판단합니다.</Text></View>)}
              <Text style={styles.footer}>관심 종목 목록은 다음 단계에서 네가 지정한 종목으로 교체합니다.</Text>
            </>
          ) : (
            <>
              <View style={[styles.hero, styles.flowHero]}>
                <Text style={styles.heroLabel}>MARKET CAUSAL MAP</Text>
                <Text style={styles.flowTitle}>{flow.title}</Text>
                <Text style={styles.flowOverview}>{flow.overview}</Text>
              </View>
              <Text style={styles.section}>핵심 연결고리</Text>
              <View style={styles.flowCard}>
                {flow.links?.length ? flow.links.slice(0, 3).map((link, index) => (
                  <View style={[styles.flowLink, index > 0 && styles.flowDivider]} key={link.cause + link.effect}>
                    <Text style={styles.flowPath}>{link.cause}  →  {link.effect}</Text>
                    <Text style={styles.flowExplanation}>{link.explanation}</Text>
                  </View>
                )) : <Text style={styles.empty}>다음 뉴스 갱신부터 인과관계 분석이 표시됩니다.</Text>}
              </View>
              <View style={styles.watchCard}><Text style={styles.watchLabel}>앞으로 볼 변수</Text><Text style={styles.watchText}>{flow.watch}</Text></View>
              <Text style={styles.flowCaution}>AI 해석이며, 확인된 사실과 추정 경로를 구분해 작성합니다.</Text>
              <View style={styles.themeCard}>
                <View>
                  <Text style={styles.themeLabel}>화면 테마</Text>
                  <Text style={styles.themeHint}>원하는 화면 밝기를 선택하세요.</Text>
                </View>
                <View style={styles.themeToggle}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: themeName === 'light' }}
                    style={[styles.themeOption, themeName === 'light' && styles.themeOptionActive]}
                    onPress={() => selectTheme('light')}
                  >
                    <Text style={[styles.themeOptionText, themeName === 'light' && styles.themeOptionTextActive]}>☀ 일반</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: themeName === 'dark' }}
                    style={[styles.themeOption, themeName === 'dark' && styles.themeOptionActive]}
                    onPress={() => selectTheme('dark')}
                  >
                    <Text style={[styles.themeOptionText, themeName === 'dark' && styles.themeOptionTextActive]}>☾ 다크</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
          <Text style={styles.footer}>데이터 기준 시각과 출처를 함께 표시합니다.</Text>
        </ScrollView>
      </View>
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'NEWS' && styles.activeTab]} onPress={() => setTab('NEWS')}><Text style={[styles.tabText, tab === 'NEWS' && styles.activeTabText]}>NEWS</Text></Pressable>
        <Pressable style={[styles.tab, tab === 'STOCK' && styles.activeTab]} onPress={() => setTab('STOCK')}><Text style={[styles.tabText, tab === 'STOCK' && styles.activeTabText]}>STOCK</Text></Pressable>
        <Pressable style={[styles.tab, tab === 'FLOW' && styles.activeTab]} onPress={() => setTab('FLOW')}><Text style={[styles.tabText, tab === 'FLOW' && styles.activeTabText]}>FLOW</Text></Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  body: { flex: 1 },
  container: { padding: 22, paddingTop: 62, paddingBottom: 120 },
  buildRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: theme.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  build: { color: theme.accent, fontSize: 10, fontWeight: '800' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  title: { color: theme.text, fontSize: 32, fontWeight: '800' },
  refreshButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.activeSurface, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9 },
  refreshIcon: { color: theme.onAccent, fontSize: 18, fontWeight: '800', marginRight: 5 },
  refreshText: { color: theme.onAccent, fontSize: 12, fontWeight: '800' },
  searchIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: theme.activeSurface, alignItems: 'center', justifyContent: 'center' },
  searchIconText: { color: theme.onAccent, fontSize: 31, fontWeight: '700', lineHeight: 34 },
  date: { color: theme.muted, marginTop: 6, fontSize: 13 },
  updatedAt: { color: theme.subdued, marginTop: 4, fontSize: 11 },
  hero: { backgroundColor: theme.hero, borderRadius: 18, padding: 20, marginTop: 24 },
  heroLabel: { color: theme.accentLight, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  heroText: { color: theme.text, fontSize: 21, lineHeight: 29, fontWeight: '700', marginTop: 10 },
  heroHint: { color: theme.heroHint, fontSize: 12, marginTop: 14 },
  flowHero: { paddingBottom: 18 },
  flowTitle: { color: theme.text, fontSize: 19, lineHeight: 26, fontWeight: '800', marginTop: 9 },
  flowOverview: { color: theme.heroBody, fontSize: 13, lineHeight: 20, marginTop: 9 },
  flowCard: { backgroundColor: theme.surface, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border },
  flowLink: { paddingVertical: 13 },
  flowDivider: { borderTopWidth: 1, borderTopColor: theme.divider },
  flowPath: { color: theme.accentLight, fontSize: 13, fontWeight: '800' },
  flowExplanation: { color: theme.body, fontSize: 12, lineHeight: 18, marginTop: 5 },
  watchCard: { backgroundColor: theme.watchBackground, borderRadius: 14, padding: 14, marginTop: 12, borderLeftWidth: 3, borderLeftColor: theme.warning },
  watchLabel: { color: theme.warning, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  watchText: { color: theme.watchText, fontSize: 12, lineHeight: 18, marginTop: 5 },
  flowCaution: { color: theme.subdued, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 12 },
  themeCard: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginTop: 24, borderWidth: 1, borderColor: theme.border },
  themeLabel: { color: theme.text, fontSize: 15, fontWeight: '800' },
  themeHint: { color: theme.secondary, fontSize: 11, marginTop: 3 },
  themeToggle: { flexDirection: 'row', backgroundColor: theme.background, borderRadius: 12, padding: 4, marginTop: 14 },
  themeOption: { flex: 1, alignItems: 'center', borderRadius: 9, paddingVertical: 9 },
  themeOptionActive: { backgroundColor: theme.activeSurface },
  themeOptionText: { color: theme.muted, fontSize: 13, fontWeight: '800' },
  themeOptionTextActive: { color: theme.onAccent },
  section: { color: theme.text, fontSize: 19, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  card: { backgroundColor: theme.surface, borderRadius: 16, padding: 17, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { color: theme.accentLabel, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  level: { color: theme.warning, fontSize: 12, fontWeight: '700' },
  cardTitle: { color: theme.text, fontSize: 17, fontWeight: '700', lineHeight: 23, marginTop: 10 },
  body: { color: theme.body, fontSize: 14, lineHeight: 21, marginTop: 8 },
  why: { color: theme.secondary, fontSize: 12, lineHeight: 18, marginTop: 12 },
  source: { color: theme.accent, fontSize: 12, fontWeight: '700', marginTop: 14 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { backgroundColor: theme.surface, borderRadius: 13, padding: 14, width: '47%', borderWidth: 1, borderColor: theme.border },
  metricLabel: { color: theme.secondary, fontSize: 12 },
  metricValue: { color: theme.text, fontSize: 17, fontWeight: '800', marginTop: 5 },
  topSearch: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  input: { flex: 1, backgroundColor: theme.surface, color: theme.text, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: theme.border },
  addButton: { backgroundColor: theme.primaryButton, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, marginLeft: 8 },
  addButtonText: { color: theme.onAccent, fontWeight: '800' },
  stockName: { color: theme.text, fontSize: 19, fontWeight: '800' },
  stockChange: { color: theme.warning, fontSize: 16, fontWeight: '800' },
  symbol: { color: theme.accentLabel, fontSize: 12, marginTop: 6 },
  stockTime: { color: theme.subdued, fontSize: 10, marginTop: 4 },
  tabs: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20, elevation: 20, flexDirection: 'row', backgroundColor: theme.surfaceAlt, borderTopWidth: 1, borderTopColor: theme.border, paddingBottom: 14, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, marginHorizontal: 6 },
  activeTab: { backgroundColor: theme.activeSurface },
  tabText: { color: theme.muted, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  activeTabText: { color: theme.onAccent },
  tabHint: { color: theme.subdued, fontSize: 10, marginTop: 3 },
  empty: { color: theme.subdued, fontSize: 13, marginBottom: 4 },
  footer: { color: theme.subdued, fontSize: 12, textAlign: 'center', marginTop: 28 },
});
