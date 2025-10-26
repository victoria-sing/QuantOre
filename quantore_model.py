# ==========================================================
#  QuantOre: Flood Impact Prediction Model
#  Description:
#     This model analyzes how flooding or river discharge
#     at mining sites correlates with later stock price
#     changes for their parent companies.
# ==========================================================

# ---------- Imports ----------
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from tqdm import tqdm
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import r2_score, mean_squared_error

# ==========================================================
# 1️⃣ CONFIGURATION
# ==========================================================
DATA_FOLDER = "./flood data"   # Folder containing all company CSVs

# ==========================================================
# 2️⃣ HELPER FUNCTIONS
# ==========================================================

def detect_companies(folder):
    """
    Scans the data folder and automatically groups each
    company's stock file and site data files.
    """
    companies = {}
    for file in os.listdir(folder):
        if not file.endswith(".csv"):
            continue
        name = file.split("_")[0]
        companies.setdefault(name, {"stock": None, "sites": []})
        if "stock" in file.lower():
            companies[name]["stock"] = os.path.join(folder, file)
        else:
            companies[name]["sites"].append(os.path.join(folder, file))
    return companies

def load_company_data(company, file_list):
    """
    Reads and merges all site CSVs for a company.
    Handles metadata header + time–series blocks safely.
    """
    dfs = []
    print(f"\n📦 Processing {company}: {len(file_list)} site files")

    for file in tqdm(file_list, desc=f"Loading {company}", unit="file"):
        try:
            # --- Step 1: Read the first two lines manually ---
            with open(file, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # Skip empty lines
            lines = [line.strip() for line in lines if line.strip() != ""]

            # Extract lat/lon safely from the second line
            header_values = lines[1].split(",")
            lat = pd.to_numeric(header_values[0], errors="coerce")
            lon = pd.to_numeric(header_values[1], errors="coerce")

            if pd.isna(lat) or pd.isna(lon):
                tqdm.write(f"⚠️ Skipping {os.path.basename(file)} — invalid lat/lon values")
                continue

            # --- Step 2: Find where the time-series starts ---
            start_idx = None
            for i, line in enumerate(lines):
                if line.lower().startswith("time") or line.lower().startswith("date"):
                    start_idx = i
                    break

            if start_idx is None:
                tqdm.write(f"⚠️ Skipping {os.path.basename(file)} — no time/date header found")
                continue

            # --- Step 3: Read time-series data from that line onward ---
            df = pd.read_csv(file, skiprows=start_idx)
            df.columns = [c.strip() for c in df.columns]

            # Rename "time" → "Date"
            if "time" in df.columns:
                df.rename(columns={"time": "Date"}, inplace=True)
            elif "date" in df.columns:
                df.rename(columns={"date": "Date"}, inplace=True)

            # Detect discharge/rainfall column
            discharge_cols = [c for c in df.columns if "discharge" in c.lower() or "rain" in c.lower()]
            if not discharge_cols:
                tqdm.write(f"⚠️ Skipping {os.path.basename(file)} — no discharge/rain column found")
                continue
            df.rename(columns={discharge_cols[0]: "FloodAmount"}, inplace=True)

            # Attach metadata
            df["Latitude"] = lat
            df["Longitude"] = lon
            df["Company"] = company
            df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
            df.dropna(subset=["Date", "FloodAmount"], inplace=True)

            dfs.append(df)

        except Exception as e:
            tqdm.write(f"❌ Error reading {os.path.basename(file)}: {e}")

    if not dfs:
        tqdm.write(f"⚠️ No valid data for {company}")
        return pd.DataFrame()

    merged = pd.concat(dfs, ignore_index=True)
    grouped = merged.groupby("Date").agg({
        "Latitude": "mean",
        "Longitude": "mean",
        "FloodAmount": "mean"
    }).reset_index()
    grouped["Company"] = company

    tqdm.write(f"✅ {company}: {len(dfs)} valid sites processed")
    return grouped


def add_stock_data(company_data):
    """
    Merges the rainfall data with the company's stock data.
    The stock file must have 'Date' and 'Close' columns.
    """
    company = company_data["Company"].iloc[0]
    stock_file = os.path.join("./stock data", f"{company}_stock.csv")
    if not os.path.exists(stock_file):
        print(f"⚠️ No stock file found for {company}")
        return pd.DataFrame()

    stock = pd.read_csv(stock_file)
    stock["Date"] = pd.to_datetime(stock["Date"], format="%m/%Y", errors="coerce")
    stock["Company"] = company
    stock["Close"] = pd.to_numeric(stock["Close"].astype(str).str.replace(",", ""), errors="coerce")
    stock = stock.dropna(subset=["Date", "Close"])

    merged = pd.merge(company_data, stock, on=["Date", "Company"], how="inner")
    merged = merged.sort_values(["Company", "Date"]).reset_index(drop=True)

    merged["Future_Close"] = merged.groupby("Company")["Close"].shift(-1)
    merged["Future_Change"] = merged["Future_Close"] - merged["Close"]
    merged = merged.dropna()

    return merged


def build_dataset():
    """
    Loads and merges all company data (flood + stock)
    into a single training dataset.
    """
    company_files = detect_companies(DATA_FOLDER)
    print(f"\n📊 Found {len(company_files)} companies in '{DATA_FOLDER}'")

    all_data = []
    for company, files in tqdm(company_files.items(), desc="Companies", unit="company"):
        flood_data = load_company_data(company, files["sites"])
        if not flood_data.empty:
            merged = add_stock_data(flood_data)
            if not merged.empty:
                all_data.append(merged)

    if not all_data:
        raise RuntimeError("❌ No valid combined data found for any company.")

    df = pd.concat(all_data).reset_index(drop=True)
    print(f"\n✅ Combined dataset built with {len(df)} rows across {df['Company'].nunique()} companies.\n")
    return df


# ==========================================================
# 3️⃣ MAIN PIPELINE
# ==========================================================
def main():
    print("🚀 QuantOre Flood Model starting...\n")

    # --- Step 1: Build dataset ---
    df = build_dataset()

    # --- Step 2: Feature setup ---
    df["Company_Code"] = df["Company"].astype("category").cat.codes
    X = df[["FloodAmount", "Latitude", "Longitude", "Company_Code"]]
    y = df["Future_Change"]

    # --- Step 3: Train/test split ---
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    # ==========================================================
    # 🌲 Random Forest Model
    # ==========================================================
    print("\n🌲 Training Random Forest...")
    rf = RandomForestRegressor(n_estimators=200, random_state=42)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)

    # ==========================================================
    # 🧠 MLP Neural Network
    # ==========================================================
    print("\n🧠 Training MLP Neural Network...")
    mlp = MLPRegressor(hidden_layer_sizes=(64, 32, 16),
                       activation='relu',
                       solver='adam',
                       max_iter=1000,
                       random_state=42)
    mlp.fit(X_train, y_train)
    mlp_pred = mlp.predict(X_test)

    # --- Evaluate models ---
    def eval_model(name, y_true, y_pred):
        r2 = r2_score(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        print(f"{name}:  R² = {r2:.3f} | RMSE = {rmse:.3f}")
        return r2, rmse

    print("\n📊 Model Performance Summary:")
    eval_model("🌲 Random Forest", y_test, rf_pred)
    eval_model("🧠 MLP Neural Net", y_test, mlp_pred)

    # ==========================================================
    # 📈 Visualization
    # ==========================================================
    plt.figure(figsize=(11,5))
    plt.plot(y_test.values, label="Actual", color="#1f77b4")
    plt.plot(rf_pred, label="Random Forest", color="#2ca02c", alpha=0.8)
    plt.plot(mlp_pred, label="MLP Prediction", color="#d62728", alpha=0.7)
    plt.title("Predicted vs Actual Future Stock Change After Flooding", fontsize=12)
    plt.xlabel("Flood Events (chronological)")
    plt.ylabel("Δ Stock Price (Next Month)")
    plt.legend()
    plt.tight_layout()
    plt.show()

    # ==========================================================
    # 🔮 Future Example Predictions
    # ==========================================================
    print("\n🔮 Example Future Predictions:")

    future_floods = pd.DataFrame({
        "Company": ["CAMECO", "BHP", "RioTinto"],
        "FloodAmount": [200, 450, 300],
        "Latitude": [-31.95, -23.65, -19.92],
        "Longitude": [115.86, -70.40, -43.94]
    })

    mapping = dict(zip(df["Company"].astype("category").cat.categories,
                       df["Company"].astype("category").cat.codes))
    future_floods["Company_Code"] = future_floods["Company"].map(mapping)

    future_floods["Pred_RF_Change"]  = rf.predict(future_floods[["FloodAmount", "Latitude", "Longitude", "Company_Code"]])
    future_floods["Pred_MLP_Change"] = mlp.predict(future_floods[["FloodAmount", "Latitude", "Longitude", "Company_Code"]])

    print(future_floods)
    print("\n✅ QuantOre Flood Model complete.")


# ==========================================================
# 4️⃣ ENTRY POINT
# ==========================================================
if __name__ == "__main__":
    main()
