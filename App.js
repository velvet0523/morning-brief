import React from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const DATA_URL = 'https://raw.githubusercontent.com/velvet0523/morning-brief/main/data/today.json';

export default function App() {
  const [data, setData] = React.useState(null);
  const [tab, setTab] = React.useState('NEWS');
  const [refreshing, setRefreshing] = React.useState(false);
  const [newStock, setNewStock] = React.useState('');
  const [addedStocks, setAddedStocks] = React.useState([]);
  const loadData = React.useCallback(() => {
    setRefreshing(true);
    return fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => r.json()).then(setData).catch(() => {}).finally(() => setRefreshing(false));
  }, []);
  React.useEffect(() => { loadData(); }, [loadData]);

  const stories = data?.stories || [];
  const macroStories = stories.filter((story) => story.category === 'MACRO');
  const industryStories = stories.filter((story) => story.category === 'INDUSTRY');
  const markets = data?.markets || ['S&P 500', 'NASDAQ', 'KOSPI', '닛케이 225', '원·달러', 'WTI'].map((label) => ({ label, value: '—' }));
  const stocks = data?.stocks || [
    { symbol: '005930.KS', name: '삼성전자', change: '—', stance: '분석 예정', reason: '관심 종목을 등록하면 오늘 뉴스와 주가 변동의 연결고리를 분석합니다.' },
    { symbol: '000660.KS', name: 'SK하이닉스', change: '—', stance: '분석 예정', reason: '반도체·메모리 수급과 산업 뉴스의 영향을 표시합니다.' },
    { symbol: 'NVDA', name: 'NVIDIA', change: '—', stance: '분석 예정', reason: 'AI 인프라 투자와 공급망 뉴스의 영향을 표시합니다.' },
  ];

  const visibleStocks = [...stocks, ...addedStocks];
  const addStock = () => {
    const symbol = newStock.trim().toUpperCase();
    if (!symbol || visibleStocks.some((stock) => stock.symbol === symbol)) return;
    setAddedStocks([...addedStocks, { symbol, name: symbol, change: '—', stance: '분석 예정', reason: '추가한 관심 종목입니다. 다음 브리핑부터 관련 뉴스와 주가 영향을 분석합니다.' }]);
    setNewStock('');
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
      <StatusBar style="light" />
      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#62a8ff" />}>
          <Text style={styles.eyebrow}>MORNING BRIEF</Text>
          <Text style={styles.title}>{tab === 'NEWS' ? '아침 브리핑' : '관심 종목'}</Text>
          <Text style={styles.date}>{data?.date || '오늘'} · 한국시간</Text>
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
          ) : (
            <>
              <View style={styles.hero}><Text style={styles.heroLabel}>TODAY'S STOCK IMPACT</Text><Text style={styles.heroText}>오늘 뉴스가 관심 종목에 미친 영향을 확인하세요.</Text><Text style={styles.heroHint}>주가 변화의 원인을 호재·악재·수급성 움직임으로 구분합니다.</Text></View>
              <Text style={styles.section}>관심 종목 분석</Text>
              <View style={styles.addBox}><TextInput value={newStock} onChangeText={setNewStock} placeholder="티커 입력 (예: MU, 005930.KS)" placeholderTextColor="#64748b" style={styles.input} autoCapitalize="characters"/><Pressable onPress={addStock} style={styles.addButton}><Text style={styles.addButtonText}>추가</Text></Pressable></View>
              {visibleStocks.map((stock) => <View style={styles.card} key={stock.symbol}><View style={styles.row}><Text style={styles.stockName}>{stock.name}</Text><Text style={styles.stockChange}>{stock.change}</Text></View><Text style={styles.symbol}>{stock.symbol} · {stock.stance}</Text><Text style={styles.body}>{stock.reason}</Text><Text style={styles.why}>분석 기준 · 관련 매크로·산업 뉴스, 기업 고유 이슈, 시장 수급을 구분해 판단합니다.</Text></View>)}
              <Text style={styles.footer}>관심 종목 목록은 다음 단계에서 네가 지정한 종목으로 교체합니다.</Text>
            </>
          )}
          <Text style={styles.footer}>데이터 기준 시각과 출처를 함께 표시합니다.</Text>
        </ScrollView>
      </View>
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'NEWS' && styles.activeTab]} onPress={() => setTab('NEWS')}><Text style={[styles.tabText, tab === 'NEWS' && styles.activeTabText]}>NEWS</Text><Text style={styles.tabHint}>오늘의 거시·산업 뉴스</Text></Pressable>
        <Pressable style={[styles.tab, tab === 'STOCK' && styles.activeTab]} onPress={() => setTab('STOCK')}><Text style={[styles.tabText, tab === 'STOCK' && styles.activeTabText]}>STOCK</Text><Text style={styles.tabHint}>관심 종목 영향 분석</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b1220' },
  body: { flex: 1 },
  container: { padding: 22, paddingTop: 62, paddingBottom: 34 },
  eyebrow: { color: '#62a8ff', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#f5f7fb', fontSize: 32, fontWeight: '800', marginTop: 8 },
  date: { color: '#94a3b8', marginTop: 6, fontSize: 13 },
  hero: { backgroundColor: '#14345a', borderRadius: 18, padding: 20, marginTop: 24 },
  heroLabel: { color: '#8ec5ff', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  heroText: { color: '#fff', fontSize: 21, lineHeight: 29, fontWeight: '700', marginTop: 10 },
  heroHint: { color: '#b8d7f7', fontSize: 12, marginTop: 14 },
  section: { color: '#f5f7fb', fontSize: 19, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  card: { backgroundColor: '#151f31', borderRadius: 16, padding: 17, marginBottom: 12, borderWidth: 1, borderColor: '#22314a' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { color: '#7fb8f5', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  level: { color: '#f3c969', fontSize: 12, fontWeight: '700' },
  cardTitle: { color: '#f5f7fb', fontSize: 17, fontWeight: '700', lineHeight: 23, marginTop: 10 },
  body: { color: '#c0cad9', fontSize: 14, lineHeight: 21, marginTop: 8 },
  why: { color: '#8fa3bd', fontSize: 12, lineHeight: 18, marginTop: 12 },
  source: { color: '#62a8ff', fontSize: 12, fontWeight: '700', marginTop: 14 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { backgroundColor: '#151f31', borderRadius: 13, padding: 14, width: '47%' },
  metricLabel: { color: '#8fa3bd', fontSize: 12 },
  metricValue: { color: '#f5f7fb', fontSize: 17, fontWeight: '800', marginTop: 5 },
  addBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#151f31', color: '#f5f7fb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#22314a' },
  addButton: { backgroundColor: '#2d78cf', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, marginLeft: 8 },
  addButtonText: { color: '#fff', fontWeight: '800' },
  stockName: { color: '#f5f7fb', fontSize: 19, fontWeight: '800' },
  stockChange: { color: '#f3c969', fontSize: 16, fontWeight: '800' },
  symbol: { color: '#7fb8f5', fontSize: 12, marginTop: 6 },
  tabs: { flexDirection: 'row', backgroundColor: '#111a2b', borderTopWidth: 1, borderTopColor: '#22314a', paddingBottom: 8, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, marginHorizontal: 6 },
  activeTab: { backgroundColor: '#1b4778' },
  tabText: { color: '#94a3b8', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  activeTabText: { color: '#fff' },
  tabHint: { color: '#64748b', fontSize: 10, marginTop: 3 },
  empty: { color: '#64748b', fontSize: 13, marginBottom: 4 },
  footer: { color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 28 },
});
