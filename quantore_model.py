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

# --- Fix Matplotlib backend for headless or Tk errors ---
import matplotlib
try:
    import tkinter
    matplotlib.use('TkAgg')  # normal interactive backend
except Exception:
    matplotlib.use('Agg')  # fallback for environments without GUI

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
    mlp = MLPRegressor(hidden_layer_sizes=(128, 64, 32),
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
    # plt.figure(figsize=(11,5))
    # plt.plot(y_test.values, label="Actual", color="#1f77b4")
    # plt.plot(rf_pred, label="Random Forest", color="#2ca02c", alpha=0.8)
    # plt.plot(mlp_pred, label="MLP Prediction", color="#d62728", alpha=0.7)
    # plt.title("Predicted vs Actual Future Stock Change After Flooding", fontsize=12)
    # plt.xlabel("Flood Events (chronological)")
    # plt.ylabel("Δ Stock Price (Next Month)")
    # plt.legend()
    # plt.tight_layout()
    # plt.show()
    # # ==========================================================
    # # 💹 Reconstruct Stock Prices (from predicted deltas)
    # # ==========================================================
    # print("\n💹 Reconstructing stock price curves from predictions...")

    # # Get the last 20% of actual stock prices (test set)
    # start_index = int(len(df) * 0.8)
    # actual_prices = df["Close"].iloc[start_index:].values
    # start_price = actual_prices[0]

    # # Build cumulative predicted price sequences
    # pred_rf_prices = [start_price]
    # pred_mlp_prices = [start_price]
    # for i in range(len(rf_pred)):
    #     pred_rf_prices.append(pred_rf_prices[-1] + rf_pred[i])
    #     pred_mlp_prices.append(pred_mlp_prices[-1] + mlp_pred[i])

    # # Plot actual vs predicted stock prices
    # plt.figure(figsize=(11,5))
    # plt.plot(actual_prices, label="Actual Stock Price", color="blue")
    # plt.plot(pred_rf_prices[:-1], label="Predicted RF Price", color="green", alpha=0.8)
    # plt.plot(pred_mlp_prices[:-1], label="Predicted MLP Price", color="red", alpha=0.7)
    # plt.title("Predicted vs Actual Stock Price (Reconstructed from Flood Data)", fontsize=12)
    # plt.xlabel("Time (test set portion)")
    # plt.ylabel("Stock Price ($)")
    # plt.legend()
    # plt.tight_layout()
    # plt.show()

    # ==========================================================
    # 🌧️ Rainfall vs Stock Price (Correlation Visualization)
    # ==========================================================
    print("\n🌧️ Plotting rainfall vs stock price correlation per company...")

    for company in df["Company"].unique():
        sub = df[df["Company"] == company].sort_values("Date")
        if len(sub) < 10:
            continue

        fig, ax1 = plt.subplots(figsize=(10, 5))

        # --- Plot stock price (left y-axis) ---
        ax1.plot(sub["Date"], sub["Close"], color="blue", label="Stock Price ($)")
        ax1.set_xlabel("Date")
        ax1.set_ylabel("Stock Price ($)", color="blue")
        ax1.tick_params(axis='y', labelcolor="blue")

        # --- Plot rainfall/flood (right y-axis) ---
        ax2 = ax1.twinx()
        ax2.plot(sub["Date"], sub["FloodAmount"], color="gray", linestyle="--", label="Flood Amount (m³/s)")
        ax2.set_ylabel("Flood Amount (m³/s)", color="gray")
        ax2.tick_params(axis='y', labelcolor="gray")

        # --- Add title and legend ---
        plt.title(f"{company}: Rainfall vs Stock Price Over Time")
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines1 + lines2, labels1 + labels2, loc="upper left")

        plt.gcf().autofmt_xdate(rotation=45)
        plt.tight_layout()
        plt.show()

        # --- Print correlation for quick insight ---
        corr = sub[["FloodAmount", "Close"]].corr().iloc[0, 1]
        print(f"   💧 {company}: Flood–Stock correlation = {corr:.3f}")

    # ==========================================================
    # 📊 Per-company: Actual vs Predicted Stock Price (test split)
    # ==========================================================
    print("\n📈 Plotting per-company price curves (test portion)...")

    for company in df["Company"].unique():
        sub = df[df["Company"] == company].copy()
        if len(sub) < 10:
            continue  # not enough points to plot

        # same feature columns, but only the test portion for this company
        split_idx = int(len(sub) * 0.8)
        Xc_test = sub[["FloodAmount", "Latitude", "Longitude", "Company_Code"]].iloc[split_idx:]
        yc_actual_close = sub["Close"].iloc[split_idx:]
        dates = sub["Date"].iloc[split_idx:]

        # predict deltas on the test rows, then reconstruct price from the first actual test price
        rf_d = rf.predict(Xc_test)
        mlp_d = mlp.predict(Xc_test)

        start_price = float(yc_actual_close.iloc[0])
        rf_price = [start_price]
        mlp_price = [start_price]
        for i in range(len(rf_d)):
            rf_price.append(rf_price[-1] + rf_d[i])
            mlp_price.append(mlp_price[-1] + mlp_d[i])

        plt.figure(figsize=(10,5))
        plt.plot(dates.values, yc_actual_close.values, label="Actual", color="blue")
        plt.plot(dates.values, rf_price[:-1], label="RF Predicted", color="green")
        plt.plot(dates.values, mlp_price[:-1], label="MLP Predicted", color="red")
        plt.title(f"{company}: Predicted vs Actual Stock Price (Test Portion)")
        plt.xlabel("Date")
        plt.ylabel("Price ($)")
        plt.xticks(rotation=45)
        plt.legend()
        plt.tight_layout()
        plt.show()
    
     # ==========================================================
    # 🔮 Combined Past Predictions + 6-Month Geometric Flood Forecast
    # ==========================================================
    print("\n🔮 Generating 6-Month Extended Forecasts (geometric rainfall increase)...")

    horizon = 6
    decreasing_future_rows = []
    increasing_future_rows = []
    static_low_future_rows = []
    static_high_future_rows = []


    for company in df["Company"].unique():
        # --- Historical subset ---
        sub = df[df["Company"] == company].sort_values("Date").iloc[-24:].copy()
        lat_mean = float(sub["Latitude"].mean())
        lon_mean = float(sub["Longitude"].mean())
        last_date = pd.to_datetime(sub["Date"].max())
        last_price = float(sub["Close"].iloc[-1])

        # 🌧️ Geometric rainfall growath: multiplies each month (exponential style)
        decreasing_floods = np.geomspace(1500, 100, horizon)
        increasing_floods = np.geomspace(100, 1500, horizon)
        static_low_floods = np.geomspace(100, 100, horizon)
        static_high_floods = np.geomspace(1500, 1500, horizon)


        for i in range(horizon):
            decreasing_future_rows.append({
                "Company": company,
                "Date": (last_date + pd.offsets.MonthEnd(i+1)).normalize(),
                "FloodAmount": float(decreasing_floods[i]),
                "Latitude": lat_mean,
                "Longitude": lon_mean
            })

        for i in range(horizon):
            increasing_future_rows.append({
                "Company": company,
                "Date": (last_date + pd.offsets.MonthEnd(i+1)).normalize(),
                "FloodAmount": float(increasing_floods[i]),
                "Latitude": lat_mean,
                "Longitude": lon_mean
            })

        for i in range(horizon):
            static_low_future_rows.append({
                "Company": company,
                "Date": (last_date + pd.offsets.MonthEnd(i+1)).normalize(),
                "FloodAmount": float(static_low_floods[i]),
                "Latitude": lat_mean,
                "Longitude": lon_mean
            })

        for i in range(horizon):
            static_high_future_rows.append({
                "Company": company,
                "Date": (last_date + pd.offsets.MonthEnd(i+1)).normalize(),
                "FloodAmount": float(static_high_floods[i]),
                "Latitude": lat_mean,
                "Longitude": lon_mean
            })

        # --- Build DataFrame for this company's future ---
        future_decreasing_df = pd.DataFrame([r for r in decreasing_future_rows if r["Company"] == company])
        cat = df["Company"].astype("category")
        mapping = dict(zip(cat.cat.categories, cat.cat.codes))
        future_decreasing_df["Company_Code"] = future_decreasing_df["Company"].map(mapping)

        future_increasing_df = pd.DataFrame([r for r in increasing_future_rows if r["Company"] == company])
        cat = df["Company"].astype("category")
        mapping = dict(zip(cat.cat.categories, cat.cat.codes))
        future_increasing_df["Company_Code"] = future_increasing_df["Company"].map(mapping)

        future_static_low_df = pd.DataFrame([r for r in static_low_future_rows if r["Company"] == company])
        cat = df["Company"].astype("category")
        mapping = dict(zip(cat.cat.categories, cat.cat.codes))
        future_static_low_df["Company_Code"] = future_static_low_df["Company"].map(mapping)

        future_static_high_df = pd.DataFrame([r for r in static_high_future_rows if r["Company"] == company])
        cat = df["Company"].astype("category")
        mapping = dict(zip(cat.cat.categories, cat.cat.codes))
        future_static_high_df["Company_Code"] = future_static_high_df["Company"].map(mapping)

        X_decreasing_future = future_decreasing_df[["FloodAmount", "Latitude", "Longitude", "Company_Code"]]
        X_increasing_future = future_increasing_df[["FloodAmount", "Latitude", "Longitude", "Company_Code"]]
        X_static_low_future = future_static_low_df[["FloodAmount", "Latitude", "Longitude", "Company_Code"]]
        X_static_high_future = future_static_high_df[["FloodAmount", "Latitude", "Longitude", "Company_Code"]]

        # Uncomment this if higher rainfall should *lower* stock prices:
        # X_future["FloodAmount"] *= -1

        # Predict Δ changes
        future_decreasing_df["Pred_RF_Change"]  = rf.predict(X_decreasing_future)
        future_decreasing_df["Pred_MLP_Change"] = mlp.predict(X_decreasing_future)

        future_increasing_df["Pred_RF_Change"]  = rf.predict(X_increasing_future)
        future_increasing_df["Pred_MLP_Change"] = mlp.predict(X_increasing_future)

        future_static_low_df["Pred_RF_Change"]  = rf.predict(X_static_low_future)
        future_static_low_df["Pred_MLP_Change"] = mlp.predict(X_static_low_future)

        future_static_high_df["Pred_RF_Change"]  = rf.predict(X_static_high_future)
        future_static_high_df["Pred_MLP_Change"] = mlp.predict(X_static_high_future)

        # Roll forward prices
        rf_prices = [last_price]
        mlp_prices = [last_price]
        for d_rf, d_mlp in zip(future_decreasing_df["Pred_RF_Change"], future_decreasing_df["Pred_MLP_Change"]):
            rf_prices.append(rf_prices[-1] + d_rf)
            mlp_prices.append(mlp_prices[-1] + d_mlp)
        future_decreasing_df["Pred_RF_Price"]  = rf_prices[1:]
        future_decreasing_df["Pred_MLP_Price"] = mlp_prices[1:]

        rf_prices = [last_price]
        mlp_prices = [last_price]
        for d_rf, d_mlp in zip(future_increasing_df["Pred_RF_Change"], future_increasing_df["Pred_MLP_Change"]):
            rf_prices.append(rf_prices[-1] + d_rf)
            mlp_prices.append(mlp_prices[-1] + d_mlp)
        future_increasing_df["Pred_RF_Price"]  = rf_prices[1:]
        future_increasing_df["Pred_MLP_Price"] = mlp_prices[1:]

        rf_prices = [last_price]
        mlp_prices = [last_price]
        for d_rf, d_mlp in zip(future_static_low_df["Pred_RF_Change"], future_static_low_df["Pred_MLP_Change"]):
            rf_prices.append(rf_prices[-1] + d_rf)
            mlp_prices.append(mlp_prices[-1] + d_mlp)
        future_static_low_df["Pred_RF_Price"]  = rf_prices[1:]
        future_static_low_df["Pred_MLP_Price"] = mlp_prices[1:]

        rf_prices = [last_price]
        mlp_prices = [last_price]
        for d_rf, d_mlp in zip(future_static_high_df["Pred_RF_Change"], future_static_high_df["Pred_MLP_Change"]):
            rf_prices.append(rf_prices[-1] + d_rf)
            mlp_prices.append(mlp_prices[-1] + d_mlp)
        future_static_high_df["Pred_RF_Price"]  = rf_prices[1:]
        future_static_high_df["Pred_MLP_Price"] = mlp_prices[1:]

        # --- Rebuild historical predicted series ---
        test_rf = rf.predict(sub[["FloodAmount", "Latitude", "Longitude", "Company_Code"]])
        test_mlp = mlp.predict(sub[["FloodAmount", "Latitude", "Longitude", "Company_Code"]])
        hist_rf_prices = [sub["Close"].iloc[0]]
        hist_mlp_prices = [sub["Close"].iloc[0]]
        for drf, dmlp in zip(test_rf, test_mlp):
            hist_rf_prices.append(hist_rf_prices[-1] + drf)
            hist_mlp_prices.append(hist_mlp_prices[-1] + dmlp)
        sub["RF_Price"]  = hist_rf_prices[1:]
        sub["MLP_Price"] = hist_mlp_prices[1:]

        # --- Plot unified timeline (past + future) ---
        plt.figure(figsize=(11,5))
        plt.plot(sub["Date"], sub["Close"], color="blue", label="Actual (Last 24m)")
        plt.plot(sub["Date"], sub["RF_Price"], "g--", label="RF Predicted (Last 24m)")
        plt.plot(sub["Date"], sub["MLP_Price"], "r--", label="MLP Predicted (Last 24m)")
        # plt.plot(future_decreasing_df["Date"], future_decreasing_df["Pred_RF_Price"], "go--", color="red",label="RF Forecast (Next 6m)")
        plt.plot(future_decreasing_df["Date"], future_decreasing_df["Pred_MLP_Price"], "ro--", color="orange", label="MLP Forecast (Next 6m)")
        # plt.plot(future_increasing_df["Date"], future_increasing_df["Pred_RF_Price"], "go--", color="green",label="RF Forecast (Next 6m)")
        plt.plot(future_increasing_df["Date"], future_increasing_df["Pred_MLP_Price"], "ro--", color="black", label="MLP Forecast (Next 6m)")
        # plt.plot(future_static_low_df["Date"], future_static_low_df["Pred_RF_Price"], "go--", color="teal",label="RF Forecast (Next 6m)")
        plt.plot(future_static_low_df["Date"], future_static_low_df["Pred_MLP_Price"], "ro--", color="gray", label="MLP Forecast (Next 6m)")
        # plt.plot(future_static_high_df["Date"], future_static_high_df["Pred_RF_Price"], "go--", color="pink",label="RF Forecast (Next 6m)")
        plt.plot(future_static_high_df["Date"], future_static_high_df["Pred_MLP_Price"], "ro--", color="brown", label="MLP Forecast (Next 6m)")

        plt.axvline(sub["Date"].iloc[-1], color="gray", linestyle="--", alpha=0.7)
        plt.text(sub["Date"].iloc[-1], plt.ylim()[1]*0.95, "Forecast Start", rotation=90, color="gray")

        plt.xlim(sub["Date"].iloc[0], future_decreasing_df["Date"].iloc[-1])

        plt.title(f"{company}: Actual + 6-Month Forecast (Geometric Flood Increase)")
        plt.xlabel("Date")
        plt.ylabel("Stock Price ($)")
        plt.xticks(rotation=45)
        plt.legend()
        plt.tight_layout()
        plt.show()

        # Print future flood values for transparency
        print(f"\n🌧️ Synthetic flood values for {company}:")
        print(future_decreasing_df[["Date", "FloodAmount"]])
        print(future_increasing_df[["Date", "FloodAmount"]])
        print(future_static_low_df[["Date", "FloodAmount"]])
        print(future_static_high_df[["Date", "FloodAmount"]])


    decreasing_forecasts = pd.concat(
        [pd.DataFrame([r for r in decreasing_future_rows if r["Company"] == c])
         for c in df["Company"].unique()],
        ignore_index=True
    )
    increasing_forecasts = pd.concat(
        [pd.DataFrame([r for r in increasing_future_rows if r["Company"] == c])
         for c in df["Company"].unique()],
        ignore_index=True
    )
    static_low_forecasts = pd.concat(
        [pd.DataFrame([r for r in static_low_future_rows if r["Company"] == c])
         for c in df["Company"].unique()],
        ignore_index=True
    )
    static_high_forecasts = pd.concat(
        [pd.DataFrame([r for r in static_high_future_rows if r["Company"] == c])
         for c in df["Company"].unique()],
        ignore_index=True
    )
    
    print("\n📈 Head of future forecast table:")
    print(decreasing_forecasts[["Company", "Date", "FloodAmount"]].head())
    print(increasing_forecasts[["Company", "Date", "FloodAmount"]].head())
    print(static_low_forecasts[["Company", "Date", "FloodAmount"]].head())
    print(static_high_forecasts[["Company", "Date", "FloodAmount"]].head())



# ==========================================================
# 4️⃣ ENTRY POINT
# ==========================================================
if __name__ == "__main__":
    main()
