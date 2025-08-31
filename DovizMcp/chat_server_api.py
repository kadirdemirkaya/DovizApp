from mcp.server.fastmcp import FastMCP
from loguru import logger
import requests
import json
import requests
from mcp import Tool
from difflib import get_close_matches

mcp = FastMCP("BMI Server")

logger.info(f"Starting server {mcp.name}")

CURRENCY_LIST = {}

def find_closest_currency(input_str: str) -> str:
    """
    LLM veya kullanıcıdan gelen input'u CURRENCY_LIST ile eşleştirir.
    Dönen değer dizideki geçerli currency key (örn: "eur")
    """
    input_str = input_str.lower()

    key_matches = get_close_matches(input_str, [k.lower() for k in CURRENCY_LIST.keys()], n=1, cutoff=0.6)
    if key_matches:
        # Küçük harfi orijinal key ile eşleştir
        return next(k for k in CURRENCY_LIST.keys() if k.lower() == key_matches[0])

    value_matches = get_close_matches(input_str, [v.lower() for v in CURRENCY_LIST.values()], n=1, cutoff=0.6)
    if value_matches:
        return next(k for k, v in CURRENCY_LIST.items() if v.lower() == value_matches[0])

    return input_str

def load_currencies():
    global CURRENCY_LIST
    url = "http://localhost:8080/api/v1/currencies"
    response = requests.get(url)
    response.raise_for_status()
    
    json_data = response.json()  
    CURRENCY_LIST = json_data.get("data", {})  
    
    print(f"{len(CURRENCY_LIST)} currencies loaded")

@mcp.tool()
def get_currency_rates(base: str = "eur", targets: list[str] = None) -> dict:
    """
    Get exchange rates by base currency.
    
    Args:
        base: Base currency code, e.g., "eur"
        targets: Optional list of target currencies, e.g., ["USD", "TRY"]

    Returns:
        Dictionary of exchange rates.
    """

    base = find_closest_currency(base)
    if targets:
        targets = [find_closest_currency(t) for t in targets]

    url = f"http://localhost:8080/api/v1/rates/{base}"

    params = {}
    if targets:
        params["targets"] = ",".join(targets)
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    data = response.json()  # ApiResponse<CurrencyRates>

    rates = {}
    currency_data = data.get("data", {})
    if "rates" in currency_data:
        rates = currency_data["rates"]
    
    return {
        "base": currency_data.get("base", base),
        "date": currency_data.get("date"),
        "rates": rates
    }

@mcp.tool()
def get_single_exchange_rate(from_currency: str = "EUR", to_currency: str = "USD") -> dict:
    """
    Get exchange rate for a single currency pair.

    Args:
        from_currency: Base currency, e.g., "EUR"
        to_currency: Target currency, e.g., "USD"

    Returns:
        Dictionary containing base, target, rate, date, timestamp
    """

    from_currency = find_closest_currency(from_currency)
    to_currency = find_closest_currency(to_currency)

    url = "http://localhost:8080/api/v1/rate"
    params = {"from": from_currency, "to": to_currency}
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    data = response.json()  # ApiResponse<ExchangeRate>

    exchange_rate = data.get("data", {})
    
    return {
        "base": exchange_rate.get("base", from_currency),
        "target": exchange_rate.get("target", to_currency),
        "rate": exchange_rate.get("rate"),
        "date": exchange_rate.get("date"),
        "timestamp": exchange_rate.get("timestamp")
    }

@mcp.tool()
def get_historical_rates(base: str = "EUR", date: str = "2025-08-29") -> dict:
    """
    Get historical exchange rates for a specific base currency and date.

    Args:
        base: Base currency code, e.g., "EUR"
        date: Date in yyyy-MM-dd format, e.g., "2025-08-29"

    Returns:
        Dictionary with base, date, and rates map.
    """

    base = find_closest_currency(base)
    
    url = f"http://localhost:8080/api/v1/rates/{base}/{date}"
    
    response = requests.get(url)
    response.raise_for_status()
    
    data = response.json()  # ApiResponse<CurrencyRates>
    
    currency_data = data.get("data", {})
    
    rates = currency_data.get("rates", {})
    
    return {
        "base": currency_data.get("base", base),
        "date": currency_data.get("date", date),
        "rates": rates
    }

@mcp.tool()
def get_rate_range(
    base: str = "USD",
    target: str = "TRY",
    start: str = "2025-08-01",
    end: str = "2025-08-30"
) -> list:
    """
    Get exchange rate history for a base-target currency pair over a date range.

    Args:
        base: Base currency, e.g., "USD"
        target: Target currency, e.g., "TRY"
        start: Start date in yyyy-MM-dd format
        end: End date in yyyy-MM-dd format

    Returns:
        List of dictionaries containing base, target, rate, date, timestamp
    """
    base = find_closest_currency(base)
    target = find_closest_currency(target)

    url = f"http://localhost:8080/api/v1/rates/{base}/{target}/range"
    params = {"start": start, "end": end}
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    data = response.json()  # ApiResponse<List<ExchangeRate>>
    
    rate_list = data.get("data", [])
    
    result = []
    for item in rate_list:
        result.append({
            "base": item.get("base", base),
            "target": item.get("target", target),
            "rate": item.get("rate"),
            "date": item.get("date"),
            "timestamp": item.get("timestamp")
        })
    
    return result

@mcp.tool()
def get_crypto_rates(base: str = "BTC", targets: list[str] = None) -> dict:
    """
    Get cryptocurrency exchange rates for a base crypto currency.

    Args:
        base: Base cryptocurrency code, e.g., "BTC"
        targets: Optional list of target cryptocurrencies, e.g., ["ETH", "LTC"]

    Returns:
        Dictionary containing base, date, and rates map.
    """
    
    base = find_closest_currency(base)
    if targets:
        targets = [find_closest_currency(t) for t in targets]

    url = f"http://localhost:8080/api/v1/crypto/{base}"
    
    params = {}
    if targets:
        params["targets"] = ",".join(targets)
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    data = response.json()  # ApiResponse<CurrencyRates>
    currency_data = data.get("data", {})
    
    rates = currency_data.get("rates", {})
    
    return {
        "base": currency_data.get("base", base),
        "date": currency_data.get("date"),
        "rates": rates
    }

if __name__ == "__main__":
    load_currencies()
    mcp.run(transport="stdio")