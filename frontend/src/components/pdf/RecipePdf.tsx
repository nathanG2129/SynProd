import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Product, ProductType, PRODUCT_TYPE_INFO, getProductTypeDisplayName } from '../../types/product';

interface RecipePdfProps {
  product: Product;
  orderQuantity: number;
  capacityTypeKey: string; // e.g., 'tubs', 'bottles', 'pouches'
}

// Local capacity map to mirror calculator behavior
const CAPACITY_OPTIONS: Record<ProductType, Record<string, { label: string; multiplier: number }>> = {
  [ProductType.CHEESE]: {
    tubs: { label: 'Tubs', multiplier: 1 }
  },
  [ProductType.GREEK_YOGURT]: {
    tubs: { label: 'Tubs', multiplier: 1 }
  },
  [ProductType.DRINKS]: {
    bottles: { label: 'Bottles', multiplier: 1 },
    pouches: { label: 'Pouches', multiplier: 5.5 }
  }
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
    paddingBottom: 8
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#2f3a2a'
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    color: '#4b5b3f'
  },
  section: {
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 8,
    color: '#2f3a2a',
    fontWeight: 700
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  chip: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#b7c792',
    color: '#2f3a2a'
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f1f6e8',
    borderWidth: 1,
    borderColor: '#d9e4c2'
  },
  tr: {
    display: 'flex',
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb'
  },
  th: {
    padding: 6,
    fontWeight: 700,
    borderRightWidth: 1,
    borderRightColor: '#d9e4c2',
    textAlign: 'center'
  },
  td: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    textAlign: 'center'
  },
  tdLeft: {
    textAlign: 'left'
  },
  noRightBorder: {
    borderRightWidth: 0
  },
  colName: { width: '55%' },
  colSmall: { width: '15%' },
  colMedium: { width: '30%' },
  footer: {
    marginTop: 24,
    fontSize: 9,
    color: '#6b7280'
  }
});

export const RecipePdf: React.FC<RecipePdfProps> = ({ product, orderQuantity, capacityTypeKey }) => {
  const typeInfo = PRODUCT_TYPE_INFO[product.productType];
  const capacityMap = CAPACITY_OPTIONS[product.productType];
  const selectedCapacity = capacityMap[capacityTypeKey] || Object.values(capacityMap)[0];

  const totalWeight = typeInfo.baseWeight * (orderQuantity || 0) * (selectedCapacity?.multiplier || 1);

  const calcComponentWeight = (percentage: number) => (totalWeight * percentage) / 100;
  const calcIngredientAmount = (quantity: number) => {
    const ratio = totalWeight / typeInfo.baseWeight;
    return quantity * ratio;
  };

  const totalPercent = (product.compositions || []).reduce((sum, c) => sum + (c.percentage || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{product.name} – Production Recipe</Text>
          <Text style={styles.subtitle}>
            {getProductTypeDisplayName(product.productType)} • Base {typeInfo.baseWeight}
            {typeInfo.baseWeightUnit}
          </Text>
          {product.description ? (
            <Text style={{ marginTop: 6, color: '#6b7280' }}>{product.description}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.row}>
            <Text>Quantity</Text>
            <Text style={styles.chip}>{orderQuantity} {selectedCapacity?.label || ''}</Text>
          </View>
          <View style={styles.row}>
            <Text>Total Weight</Text>
            <Text style={styles.chip}>{Number.isFinite(totalWeight) ? totalWeight.toFixed(1) : '0.0'}g</Text>
          </View>
          {product.createdByName ? (
            <View style={styles.row}>
              <Text>Created By</Text>
              <Text>{product.createdByName}</Text>
            </View>
          ) : null}
        </View>

        {product.compositions && product.compositions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Composition</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colName, styles.tdLeft]}>Component</Text>
              <Text style={[styles.th, styles.colSmall]}>%</Text>
              <Text style={[styles.th, styles.colMedium, styles.noRightBorder]}>Weight (g)</Text>
            </View>
            {product.compositions
              .slice()
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((c, idx) => (
                <View key={idx} style={styles.tr}>
                  <Text style={[styles.td, styles.colName, styles.tdLeft]}>
                    {c.componentName}{c.notes ? ` — ${c.notes}` : ''}
                  </Text>
                  <Text style={[styles.td, styles.colSmall]}>{(c.percentage || 0).toFixed(2)}%</Text>
                  <Text style={[styles.td, styles.colMedium, styles.noRightBorder]}>{calcComponentWeight(c.percentage || 0).toFixed(1)}</Text>
                </View>
              ))}
            <View style={styles.tr}>
              <Text style={[styles.td, styles.colName, styles.tdLeft]}>Total</Text>
              <Text style={[styles.td, styles.colSmall]}>{totalPercent.toFixed(1)}%</Text>
              <Text style={[styles.td, styles.colMedium, styles.noRightBorder]}>{Number.isFinite(totalWeight) ? totalWeight.toFixed(1) : '0.0'}</Text>
            </View>
          </View>
        ) : null}

        {product.additionalIngredients && product.additionalIngredients.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Ingredients</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colName, styles.tdLeft]}>Ingredient</Text>
              <Text style={[styles.th, styles.colSmall]}>Base</Text>
              <Text style={[styles.th, styles.colMedium, styles.noRightBorder]}>Calculated</Text>
            </View>
            {product.additionalIngredients
              .slice()
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((i, idx) => (
                <View key={idx} style={styles.tr}>
                  <Text style={[styles.td, styles.colName, styles.tdLeft]}>
                    {i.ingredientName}{i.notes ? ` — ${i.notes}` : ''}
                  </Text>
                  <Text style={[styles.td, styles.colSmall]}>
                    {(i.quantity || 0)} {i.unit} / {typeInfo.baseWeight}{typeInfo.baseWeightUnit}
                  </Text>
                  <Text style={[styles.td, styles.colMedium, styles.noRightBorder]}>
                    {Number.isFinite(calcIngredientAmount(i.quantity || 0)) ? calcIngredientAmount(i.quantity || 0).toFixed(2) : '0.00'} {i.unit}
                  </Text>
                </View>
              ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text>Generated by SynProd • {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default RecipePdf;


