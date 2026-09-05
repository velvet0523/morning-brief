import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const stories = [
  ['높음', 'GLOBAL', '오늘의 주요 경제 뉴스가 여기에 표시됩니다', '현재는 화면 시제품입니다. 이후 공개 뉴스 자료를 바탕으로 자동 선별·요약합니다.'],
  ['중간', 'MARKETS', '주요 시장 움직임과 확인할 변수', '지수·금리·환율·원자재의 방향과 배경을 한눈에 보여줍니다.'],
];

export default function App() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>MORNING BRIEF</Text>
        <Text style={styles.title}>아침 브리핑</Text>
        <Text style={styles.date}>2026년 9월 6일 · 한국시간</Text>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>TODAY IN 3 LINES</Text>
          <Text style={styles.heroText}>세계 경제와 주식시장의 핵심 흐름을{'\n'}출근 전 빠르게 확인하세요.</Text>
          <Text style={styles.heroHint}>뉴스 수집·중요도 판단·요약 기능을 연결하는 중입니다.</Text>
        </View>
        <Text style={styles.section}>핵심 뉴스</Text>
        {stories.map(([level, tag, title, summary]) => (
          <View style={styles.card} key={tag}>
            <View style={styles.row}><Text style={styles.tag}>{tag}</Text><Text style={styles.level}>{level}</Text></View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.body}>{summary}</Text>
            <Text style={styles.why}>왜 중요한가 · 시장 영향과 새로움을 기준으로 선별합니다.</Text>
            <Text style={styles.source}>원문 출처 열기  ›</Text>
          </View>
        ))}
        <Text style={styles.section}>시장 한눈에 보기</Text>
        <View style={styles.metrics}>
          {['S&P 500', 'NASDAQ', '원·달러', 'WTI'].map((x) => <View style={styles.metric} key={x}><Text style={styles.metricLabel}>{x}</Text><Text style={styles.metricValue}>—</Text></View>)}
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
  footer: { color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 28 },
});
