# MCP Server – Currency & Crypto Chat

This project is an example of an **MCP server**. Users can query currency and cryptocurrency rates by asking natural language questions. MCP analyzes the question, selects the correct instrument, and presents the results to the user in a clear manner.

## Features

- Querying exchange rates:
    - `get_currency_rates`
    - `get_single_exchange_rate`
    - `get_historical_rates`
    - `get_rate_range`
- Querying cryptocurrency rates:
    - `get_crypto_rates`
- LLM-supported tool selection and argument generation
- User-friendly result descriptions
- Integration with JSON-based API
- Supports date range queries

## Installation

```bash
git clone <repo-url>
cd <repo-folder>
pip install -r requirements.txt
```

## Running MCP Server

```bash
python chat_client_api.py
```
```bash
python chat_server_api.py
```

#### API Usage

- Once the server is running, questions can be sent via the /chat endpoint.

```bash
POST /chat
{
    "query": "What is today's EUR to USD exchange rate?"
}
```

#### Supported Tools

- **get_currency_rates** – Gets all exchange rates for a given base currency.
- **get_single_exchange_rate** – Gets the current exchange rate for a single currency pair.
- **get_historical_rate** – Gets exchange rates for a given date.
- **get_rate_range** – Gets exchange rates for a given date range.
- **get_crypto_rates** – Gets the current exchange rates for cryptocurrencies.