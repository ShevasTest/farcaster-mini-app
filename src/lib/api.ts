export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export async function getTopCoins(): Promise<CoinPrice[]> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
    );

    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();

    // Фильтруем стейблкоины
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
    console.error("Error fetching prices:", error);
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
