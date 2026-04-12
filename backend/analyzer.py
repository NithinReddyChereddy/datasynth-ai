import pandas as pd
import numpy as np
import io
from typing import Dict, Any, List

class DataAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self._sanitize_dates()

    def _parse_date(self, val):
        if pd.isna(val):
            return None
        
        # Handle Excel Serial Numbers (numeric values > 10000, usually around 40000-50000 for modern dates)
        if isinstance(val, (int, float, np.number)) and 10000 < val < 100000:
            try:
                # Excel base date is Dec 30, 1899
                return pd.to_datetime(val, unit='D', origin='1899-12-30')
            except:
                pass
        
        try:
            # Try parsing with pandas (handles ISO, multiple formats)
            d = pd.to_datetime(val, errors='coerce')
            if pd.notna(d) and hasattr(d, 'year'):
                # Validation: year range 1900-2100 as per requirements
                if 1900 <= d.year <= 2100:
                    return d
        except:
            pass
        return None

    def _sanitize_dates(self):
        """Identifies date columns and converts them to datetime format."""
        for col in self.df.columns:
            # Skip if already datetime
            if pd.api.types.is_datetime64_any_dtype(self.df[col]):
                continue
                
            # Sample data to check for dates (first 100 values)
            sample = self.df[col].dropna().head(100)
            if sample.empty:
                continue
                
            parsed_sample = sample.apply(self._parse_date)
            valid_ratio = parsed_sample.notna().sum() / len(sample)
            
            # 70% threshold for detection
            if valid_ratio >= 0.7:
                # Apply full parsing using vectorized operations
                # First check if the column is numeric (Excel serial numbers)
                if pd.api.types.is_numeric_dtype(self.df[col]):
                    # Check if values are in the typical Excel serial range (10000 - 100000)
                    if (self.df[col].min() > 10000) and (self.df[col].max() < 100000):
                        self.df[col] = pd.to_datetime(self.df[col], unit='D', origin='1899-12-30', errors='coerce')
                    else:
                        # Fallback for numerical values that might just be years or invalid
                        self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
                else:
                    self.df[col] = pd.to_datetime(self.df[col], errors='coerce')

    def get_summary(self) -> Dict[str, Any]:
        """Returns a high-level summary of the dataset."""
        summary = {
            "rows": len(self.df),
            "columns": len(self.df.columns),
            "column_names": self.df.columns.tolist(),
            "missing_values": self.df.isnull().sum().to_dict(),
            "column_types": self.df.dtypes.apply(lambda x: str(x)).to_dict(),
        }
        return summary

    def get_statistics(self) -> Dict[str, Any]:
        """Returns descriptive statistics for numerical columns."""
        numeric_df = self.df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            return {}
        
        stats = numeric_df.describe().to_dict()
        # Add correlation matrix
        if len(numeric_df.columns) > 1:
            stats["correlation_matrix"] = numeric_df.corr().replace({np.nan: None}).to_dict()
        
        # Outlier detection (Z-score > 3)
        outliers = {}
        for col in numeric_df.columns:
            mean = numeric_df[col].mean()
            std = numeric_df[col].std()
            if std > 0:
                upper_bound = mean + 3 * std
                lower_bound = mean - 3 * std
                outlier_count = ((numeric_df[col] > upper_bound) | (numeric_df[col] < lower_bound)).sum()
                if outlier_count > 0:
                    outliers[col] = int(outlier_count)
        stats["outliers"] = outliers
        
        return stats

    def get_visualizations(self) -> List[Dict[str, Any]]:
        """Suggests visualizations based on data types and structure."""
        suggestions = []
        
        # 1. Columns are already sanitized in __init__, just pick the datetime ones
        date_cols = [col for col in self.df.columns if pd.api.types.is_datetime64_any_dtype(self.df[col])]

        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        # Filter out numeric columns that look like IDs (all integers, unique, or monotonic)
        true_numeric = []
        for col in numeric_cols:
            if self.df[col].nunique() > 2 and not (self.df[col].dtype == 'int64' and self.df[col].is_unique):
                true_numeric.append(col)
        
        categorical_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()
        categorical_cols = [c for c in categorical_cols if c not in date_cols]

        # 2. Generate charts based on data structure
        
        # A. Time Series (Date + Numeric) - Multiple
        for date_col in date_cols[:3]:
            for num_col in true_numeric[:4]:
                try:
                    temp_df = self.df[[date_col, num_col]].dropna()
                    temp_df = temp_df.sort_values(by=date_col)
                    
                    if len(temp_df) > 100:
                        temp_df = temp_df.set_index(date_col).resample('D').mean().reset_index().dropna()
                    
                    if not temp_df.empty:
                        suggestions.append({
                            "id": f"ts_{date_col}_{num_col}",
                            "type": "line",
                            "title": f"{num_col} Growth Trend",
                            "x": temp_df[date_col].dt.strftime('%Y-%m-%d').tolist(),
                            "y": temp_df[num_col].tolist(),
                            "x_label": date_col,
                            "y_label": num_col
                        })
                except:
                    continue

        # B. Distribution (Numeric) - More histograms
        for col in true_numeric[:6]:
            series = self.df[col].dropna()
            if not series.empty:
                counts, bins = np.histogram(series, bins=min(20, series.nunique()))
                bin_centers = (bins[:-1] + bins[1:]) / 2
                
                suggestions.append({
                    "id": f"dist_{col}",
                    "type": "histogram",
                    "title": f"{col} Frequency Distribution",
                    "column": col,
                    "labels": [f"{b:.1f}" for b in bin_centers],
                    "values": counts.tolist(),
                    "x_label": col,
                    "y_label": "Frequency"
                })

        # C. Categorical Comparison (Bar Chart) - More bar charts
        for col in categorical_cols[:6]:
            counts = self.df[col].value_counts()
            num_categories = len(counts)
            
            if num_categories > 10:
                display_counts = counts.head(10)
                title = f"Top 10 {col} Breakdown"
            elif num_categories > 0:
                display_counts = counts
                title = f"{col} Distribution"
            else:
                continue

            suggestions.append({
                "id": f"bar_{col}",
                "type": "bar",
                "title": title,
                "labels": display_counts.index.tolist(),
                "values": display_counts.values.tolist(),
                "x_label": col,
                "y_label": "Count"
            })

        # D. Relationship (Numeric vs Numeric) - Correlation Heatmap
        if len(true_numeric) >= 2:
            try:
                corr_matrix = self.df[true_numeric].corr().replace({np.nan: 0}).to_dict()
                suggestions.append({
                    "id": "heatmap_correlation",
                    "type": "heatmap",
                    "title": "Feature Correlation Matrix",
                    "data": corr_matrix,
                    "columns": true_numeric
                })
            except:
                pass

        # E. Categorical Distribution - Pie / Donut Chart
        for col in categorical_cols[:4]:
            counts = self.df[col].value_counts()
            if len(counts) > 0:
                if len(counts) > 6:
                    top_5 = counts.head(5)
                    others_sum = counts.iloc[5:].sum()
                    if others_sum > 0:
                        pie_labels = top_5.index.tolist() + ["Others"]
                        pie_values = top_5.values.tolist() + [int(others_sum)]
                    else:
                        pie_labels = top_5.index.tolist()
                        pie_values = top_5.values.tolist()
                else:
                    pie_labels = counts.index.tolist()
                    pie_values = counts.values.tolist()

                suggestions.append({
                    "id": f"pie_{col}",
                    "type": "pie",
                    "title": f"Category Distribution of {col}",
                    "labels": pie_labels,
                    "values": pie_values
                })

        # F. Outlier Detection - Box Plot
        for col in true_numeric[:5]:
            series = self.df[col].dropna()
            if not series.empty:
                q1 = float(series.quantile(0.25))
                q3 = float(series.quantile(0.75))
                iqr = q3 - q1
                median = float(series.median())
                min_val = float(series.min())
                max_val = float(series.max())
                
                suggestions.append({
                    "id": f"box_{col}",
                    "type": "boxplot",
                    "title": f"Outlier Detection for {col}",
                    "column": col,
                    "stats": {
                        "q1": q1,
                        "q3": q3,
                        "median": median,
                        "min": min_val,
                        "max": max_val,
                        "iqr": iqr
                    }
                })

        # G. Existing Scatter plots (Multiple)
        if len(true_numeric) >= 2:
            import itertools
            for x_col, y_col in list(itertools.combinations(true_numeric[:4], 2))[:3]:
                sample_df = self.df[[x_col, y_col]].dropna()
                if len(sample_df) > 500:
                    sample_df = sample_df.sample(500)
                suggestions.append({
                    "id": f"scatter_{x_col}_{y_col}",
                    "type": "scatter",
                    "title": f"{x_col} vs {y_col} Relationship",
                    "x_label": x_col,
                    "y_label": y_col,
                    "x_data": sample_df[x_col].tolist(),
                    "y_data": sample_df[y_col].tolist()
                })

        # Final check
        if not suggestions:
            suggestions.append({
                "id": "no_data",
                "type": "empty",
                "title": "No suitable visualization available",
                "message": "We couldn't detect enough meaningful patterns to generate automated charts."
            })

        return suggestions

    def get_preview(self) -> List[Dict[str, Any]]:
        """Returns the first 50 rows of the dataset as a list of dicts."""
        # Convert datetime columns to ISO strings for JSON
        df_display = self.df.head(50).copy()
        for col in df_display.select_dtypes(include=['datetime64']).columns:
            df_display[col] = df_display[col].dt.strftime('%Y-%m-%d')
            
        return df_display.replace({np.nan: None}).to_dict(orient='records')

    def get_statistical_insights(self) -> List[str]:
        """Generates short, meaningful, human-readable insights matching auto-insight logic."""
        insights = []
        stats = self.get_statistics()
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        # Filter out ID columns for insights
        numeric_cols = [c for c in numeric_cols if self.df[c].nunique() > 2 and not (pd.api.types.is_integer_dtype(self.df[c]) and self.df[c].is_unique)]
        
        cat_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()
        date_cols = [col for col in self.df.columns if pd.api.types.is_datetime64_any_dtype(self.df[col])]

        # A. & B. TREND DETECTION AND PEAK/DROP (if date + numeric exists)
        if date_cols and numeric_cols:
            date_col = date_cols[0]
            num_col = numeric_cols[0]
            temp_df = self.df[[date_col, num_col]].dropna().sort_values(by=date_col)
            
            if len(temp_df) > 1:
                first_val = temp_df[num_col].iloc[0]
                last_val = temp_df[num_col].iloc[-1]
                
                # Trend
                if first_val != 0 and pd.notna(first_val) and pd.notna(last_val):
                    pct_change = ((last_val - first_val) / abs(first_val)) * 100
                    trend_dir = "increased" if pct_change > 0 else "decreased"
                    insights.append(f"{num_col} {trend_dir} by {abs(pct_change):.1f}% over the analyzed timeline.")
                
                # Peak / Drop
                max_idx = temp_df[num_col].idxmax()
                min_idx = temp_df[num_col].idxmin()
                max_row = temp_df.loc[max_idx]
                min_row = temp_df.loc[min_idx]
                max_date = max_row[date_col].strftime('%B %d, %Y')
                min_date = min_row[date_col].strftime('%B %d, %Y')
                if max_date != min_date:
                    insights.append(f"Peak {num_col} occurred on {max_date}, while lowest activity was observed on {min_date}.")

        # C. CATEGORY INSIGHTS (if categorical data exists)
        if len(insights) < 4 and cat_cols:
            cat_col = cat_cols[0]
            counts = self.df[cat_col].value_counts()
            if not counts.empty:
                top_cat = counts.idxmax()
                insights.append(f"'{top_cat}' accounts for the highest volume in {cat_col}.")

        # D. OUTLIER INSIGHT (Use Z-score or IQR)
        if len(insights) < 4 and "outliers" in stats and stats["outliers"]:
            worst_col = max(stats["outliers"], key=stats["outliers"].get)
            outlier_count = stats["outliers"][worst_col]
            insights.append(f"Detected {outlier_count} anomalies with extreme spikes in {worst_col}.")

        # E. CORRELATION INSIGHT (if multiple numeric columns)
        if len(insights) < 4 and "correlation_matrix" in stats:
            corr_matrix = pd.DataFrame(stats["correlation_matrix"])
            corr_unstacked = corr_matrix.abs().unstack()
            corr_unstacked = corr_unstacked[corr_unstacked < 0.9999] # Remove self correlation
            if not corr_unstacked.empty:
                max_corr_idx = corr_unstacked.idxmax()
                col1, col2 = max_corr_idx
                corr_val = corr_matrix.loc[col1, col2]
                if abs(corr_val) > 0.4:
                    rel_type = "positive" if corr_val > 0 else "negative"
                    insights.append(f"{col1} and {col2} show strong {rel_type} correlation (r ≈ {corr_val:.2f}).")

        # Fallback
        if not insights:
            insights.append(f"Dataset successfully processed containing {len(self.df)} total records.")
            if numeric_cols:
                avg_val = self.df[numeric_cols[0]].mean()
                insights.append(f"The average value for {numeric_cols[0]} is approximately {avg_val:.2f}.")

        return insights[:4]

    def get_ai_context(self) -> str:
        """Generates a text context for the AI to understand the dataset."""
        summary = self.get_summary()
        stats = self.get_statistics()
        
        context = f"Dataset Summary:\n"
        context += f"- Rows: {summary['rows']}, Columns: {summary['columns']}\n"
        context += f"- Columns: {', '.join(summary['column_names'])}\n"
        
        context += "\nMissing Values:\n"
        for col, count in summary['missing_values'].items():
            if count > 0:
                context += f"- {col}: {count}\n"
        
        if stats:
            context += "\nKey Statistics (Numeric):\n"
            for col, s in stats.items():
                if col not in ["correlation_matrix", "outliers"]:
                    context += f"- {col}: Mean={s.get('mean', 'N/A'):.2f}, Max={s.get('max', 'N/A'):.2f}, Min={s.get('min', 'N/A'):.2f}\n"
            
            if "outliers" in stats and stats["outliers"]:
                context += "\nOutliers Detected:\n"
                for col, count in stats["outliers"].items():
                    context += f"- {col}: {count} outliers found\n"
        
        return context

def load_data(file_content: bytes, filename: str) -> pd.DataFrame:
    """Loads CSV or Excel data into a Pandas DataFrame."""
    if filename.endswith('.csv'):
        return pd.read_csv(io.BytesIO(file_content))
    elif filename.endswith(('.xls', '.xlsx')):
        return pd.read_excel(io.BytesIO(file_content))
    else:
        raise ValueError("Unsupported file format. Please upload a CSV or Excel file.")
