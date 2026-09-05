import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const DATA_URL = 'https://raw.githubusercontent.com/velvet0523/morning-brief/main/data/today.json';

export default function App() {
  const [data, setData] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const loadData = React.useCallback(() => {
    setRefreshing(true);
    return fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => r.json()).then(setData).catch(() => {}).finally(() => setRefreshing(false));
  }, []);
  React.useEffect(() => { loadData(); }, [loadData]);
  const stories = data?.stories || [];
  const macroStories = stories.filter((story) => story.category === 'MACRO');
  const industryStories = stories.filter((story) => story.category === 'INDUSTRY');
  const markets = data?.markets || ['S&P 500', 'NASDAQ', '원·달러', 'WTI'].map((label) => ({ label, value: '—' }));
  const renderStories = (items) => items.map((story) => (
    <View style={styles.card} key={story.tag + story.title}>
      <View style={styles.row}>
        <Text style={styles.tag}>{story.tag}</Text>
        <Text style={styles.level}>{story.level}{story.importanceScore ? ' · ' + story.importanceScore + '점' : ''}</Text>
      </View>
      <Text style={styles.cardTitle}>{story.title}</Text>
      <Text style={styles.body}>{story.summary}</Text>
      <Text style={styles.why}>왜 중요한가 · {story.why}</Text>
      <Text style={styles.source}>원문 출처 열기  ›</Text>
    </View>
  ));
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#62a8ff" />}>
        <Text style={styles.eyebrow}>MORNING BRIEF</Text>
        <Text style={styles.title}>아침 브리핑</Text>
        <Text style={styles.date}>{data?.date || '오늘'} · 한국시간</Text>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>TODAY IN 3 LINES</Text>
          <Text style={styles.heroText}>{data?.headline || '세계 경제와 주식시장의 핵심 흐름을 출근 전 빠르게 확인하세요.'}</Text>
          <Text style={styles.heroHint}>뉴스 수집·중요도 판단·요약 기능을 연결하는 중입니다.</Text>
        </View>
        <Text style={styles.section}>핵심 뉴스 · 매크로</Text>
        {macroStories.length ? renderStories(macroStories) : <Text style={styles.empty}>선정 기준을 통과한 매크로 뉴스가 없습니다.</Text>}
        <Text style={styles.section}>핵심 뉴스 · 산업</Text>
        {industryStories.length ? renderStories(industryStories) : <Text style={styles.empty}>선정 기준을 통과한 산업 뉴스가 없습니다.</Text>}
        <Text style={styles.section}>시장 한눈에 보기</Text>
        <View style={styles.metrics}>
          {markets.map((item) => <View style={styles.metric} key={item.label}><Text style={styles.metricLabel}>{item.label}</Text><Text style={styles.metricValue}>{item.value}</Text></View>)}
        </View>
        <Text style={styles.footer}>데이터가 준비되면 기준 시각과 출처를 함께 표시합니다.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b1220' },
  container: { padding: 22, paddingTop: 62, paddingBottom: 40 },
  eyebrow: { color: '#62a8ff', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#f5f7fb', fontSize: 32, fontWeight: '800', marginTop: 8 },
  date: { color: '#94a3b8', marginTop: 6, fontSize: 13 },
  hero: { backgroundColor: '#14345a', borderRadius: 18, padding: 20, marginTop: 24 },
  heroLabel: { color: '#8ec5ff', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  heroText: { color: '#fff', fontSize: 21, lineHeight: 29, fontWeight: '700', marginTop: 10 },
  heroHint: { color: '#b8d7f7', fontSize: 12, marginTop: 14 },
  section: { color: '#f5f7fb', fontSize: 19, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  card: { backgroundColor: '#151f31', borderRadius: 16, padding: 17, marginBottom: 12, borderWidth: 1, borderColor: '#22314a' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  tag: { color: '#7fb8f5', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  level: { color: '#f3c969', fontSize: 12, fontWeight: '700' },
  cardTitle: { color: '#f5f7fb', fontSize: 17, fontWeight: '700', lineHeight: 23, marginTop: 10 },
  body: { color: '#c0cad9', fontSize: 14, lineHeight: 21, marginTop: 8 },
  why: { color: '#8fa3bd', fontSize: 12, lineHeight: 18, marginTop: 12 },
  source: { color: '#62a8ff', fontSize: 12, fontWeight: '700', marginTop: 14 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { backgroundColor: '#151f31', borderRadius: 13, padding: 14, width: '47%' },
  metricLabel: { color: '#8fa3bd', fontSize: 12 },
  metricValue: { color: '#f5f7fb', fontSize: 20, fontWeight: '800', marginTop: 5 },
  empty: { color: '#64748b', fontSize: 13, marginBottom: 4 },
  footer: { color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 28 },
});
