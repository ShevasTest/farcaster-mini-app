export interface CoinPrice { // Kept for reference or if getTopCoins is used elsewhere, but not for the main game page
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

// New interface for detailed market data for a single coin
export interface CoinMarketData {
  id: string; // coingecko id
  current_price: number;
  price_change_percentage_24h: number;
  // image_url is not directly used here, we get it from our DB
}

// Function to get detailed market data for a single coin from CoinGecko
export async function getCoinMarketData(coinId: string): Promise<CoinMarketData | null> {
  try {
    // Construct the CoinGecko API URL for a specific coin
    // Note: CoinGecko's /coins/{id} endpoint provides more details than /simple/price
    // but for just price and 24h change, /coins/markets with ids parameter is efficient.
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=false`
    );

    if (!response.ok) {
      console.error(`Failed to fetch market data for ${coinId}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const coinData = data[0];
      return {
        id: coinData.id,
        current_price: coinData.current_price,
        price_change_percentage_24h: coinData.price_change_percentage_24h,
      };
    } else {
      console.warn(`No market data found for ${coinId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching market data for ${coinId}:`, error);
    return null;
  }
}


// Original getTopCoins function (can be kept if used elsewhere or for fallback, but not primary for game page)
export async function getTopCoins(): Promise<CoinPrice[]> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
    );

    if (!response.ok) throw new Error("Failed to fetch from CoinGecko");

    const data = await response.json();

    const stablecoins = [
      "usdt",
      "usdc",
      "busd",
      "dai",
      "tusd",
      "usdp",
      "usdd",
      "gusd",
      "frax",
      "lusd",
    ];
    const filtered = data.filter(
      (coin: CoinPrice) =>
        !stablecoins.includes(coin.id.toLowerCase()) &&
        !coin.symbol.toLowerCase().includes("usd")
    );

    return filtered.slice(0, 8);
  } catch (error) {
    console.error("Error fetching prices from CoinGecko:", error);
    // Return mock data as fallback
    return [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 45230,
        price_change_percentage_24h: 2.34,
        image: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        current_price: 2890,
        price_change_percentage_24h: -1.23,
        image:
          "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
      },
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        current_price: 98.45,
        price_change_percentage_24h: 5.67,
        image:
          "https://assets.coingecko.com/coins/images/4128/thumb/solana.png",
      },
    ];
  }
}
