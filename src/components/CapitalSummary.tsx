import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CapitalState, GoldPriceState } from '../types/game';
import { fonts, fontSizes, radius } from '../theme';
import { glass } from '../theme/glass';
import { formatGram, formatPercent, formatTl } from '../utils/format';
import { GlassCard } from './GlassCard';

// Bölüm 2: Sermaye Gösterimi + Nakit/Stok/Borç Ayrımı.
// [DÜZELTME] Krem/kağıt kart yerine premium mor+altın cam dil (GlassCard) —
// Dükkân'daki tek görsel dile katıldı. Toptancı Güveni göstergesi buradan
// KALDIRILDI: aynı değer zaten üst HUD'da (Karizma'nın yanında) belirgin
// bir kartla gösteriliyor — burada tekrarı sadece dikey yer kaplıyordu,
// hiçbir bilgi kaybı yok.
export function CapitalSummary({
  capital,
  goldPrice,
  loanDueDay,
  currentDay,
  onRepayDebt,
}: {
  capital: CapitalState;
  goldPrice: GoldPriceState;
  wholesalerTrust: number;
  loanDueDay: number | null;
  currentDay: number;
  onRepayDebt: () => void;
}) {
  // Kasadaki nakit anlık kurdan gram altına çevrilerek gösterilir — ayrı,
  // sabit bir "rezerv" yok, sermayenin tamamı bu tek rakamda.
  const cashInGrams = capital.cashTl / goldPrice.buyPricePerGram;
  const netWorth = capital.cashTl + capital.stockValueTl - capital.debtTl;
  const netWorthInGrams = netWorth / goldPrice.buyPricePerGram;
  const isUp = goldPrice.dailyChangePercent >= 0;
  const canRepay = capital.debtTl > 0 && capital.cashTl > 0;

  return (
    <GlassCard style={styles.card}>
      <Text style={styles.label}>SERMAYEN</Text>
      <View style={styles.headlineRow}>
        <Text style={styles.headline}>{formatGram(cashInGrams)} altın</Text>
        <Text style={styles.headlineApprox}>≈ {formatTl(capital.cashTl)}</Text>
      </View>
      <Text style={[styles.change, { color: isUp ? glass.positive : glass.negative }]}>
        {formatPercent(goldPrice.dailyChangePercent)} (bugün)
      </Text>

      <View style={styles.divider} />

      <Row label="Nakit (Kasa)" value={formatTl(capital.cashTl)} />
      <Row label="Stok değeri (has altın karşılığı)" value={formatTl(capital.stockValueTl)} />
      <Row label="Borç" value={formatTl(capital.debtTl)} valueColor={glass.negative} />

      {capital.debtTl > 0 && (
        <View style={styles.debtActionRow}>
          {loanDueDay !== null && (
            <Text style={styles.dueLabel}>
              Vade: Gün {loanDueDay} (bugün {currentDay})
            </Text>
          )}
          {canRepay && (
            <Pressable style={styles.repayButton} onPress={onRepayDebt}>
              <Text style={styles.repayButtonLabel}>Borcu Öde</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.divider} />
      <Row label="Net Servet" value={formatTl(netWorth)} bold />
      <Text style={styles.netWorthGrams}>≈ {formatGram(netWorthInGrams)} altın karşılığı</Text>
    </GlassCard>
  );
}

function Row({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          bold && styles.rowValueBold,
          valueColor ? { color: valueColor } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.xs,
    color: glass.inkMuted,
    letterSpacing: 1,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 3,
  },
  headline: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.lg,
    color: glass.ink,
  },
  headlineApprox: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    color: glass.inkMuted,
  },
  change: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.xs,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: glass.borderSoft,
    marginVertical: 7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: glass.inkMuted,
  },
  rowLabelBold: {
    fontFamily: fonts.bodyBold,
    color: glass.ink,
  },
  rowValue: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    color: glass.ink,
  },
  rowValueBold: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.sm,
  },
  netWorthGrams: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: glass.inkMuted,
    textAlign: 'right',
    marginTop: 1,
  },
  debtActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  dueLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: glass.inkMuted,
  },
  repayButton: {
    backgroundColor: glass.gold,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  repayButtonLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: '#3A2A00',
  },
});
