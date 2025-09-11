# Exchange API - Spring Boot

This project provides a powerful exchange rate API using the [Fawazahmed0 Exchange API](https://github.com/fawazahmed0/exchange-api).

## 🚀 Features

### 1️⃣ Available Endpoints
- **All Currencies**: `/api/v1/currency`
- **Base Currency Rates**: `/api/v1/rates/{base}`
- **Single Conversion Rate**: `/api/v1/rate?from={from}&to={to}`
- **Dated Rates**: `/api/v1/rates/{base}/{date}`
- **Minified JSON**: `/api/v1/rates/{base}/min`

### 2️⃣ Advanced Endpoints
- **Filtered Rates**: `/api/v1/rates/{base}?targets=usd,try,gbp`
- **Date Range**: `/api/v1/rates/{base}/{target}/range?start=2024-01-01&end=2024-12-31`
- **Crypto Rates**: `/api/v1/crypto/{base}?targets=usd,eur,try`
- **Health Check**: `/api/v1/health`

## 🛠️Technologies

- **Java 21**
- **Spring Boot 3.5.5**
- **Spring WebFlux** (Reactive programming)
- **Caffeine Cache**
- **Lombok**
- **Maven**

## 📋Requirements

-Java 21+
-Maven 3.6+

## 🚀 Installation and Running

### 1. Project Clone
``` bash
git clone <repository-url>
cd DovizServer/doviz-api
''''

### 2. Install Dependencies
``` bash
mvn clean install
''''

### 3. Run the Application
``` bash
mvn spring-boot:run
''''

The application will run at `http://localhost:8080/api`.

## 📚 API Usage Examples

### All Currencies
``` bash
GET /api/v1/currencies
''''

### All EUR-Based Rates
``` bash
GET /api/v1/rates/eur
''''

### EUR to TRY Conversion Rate
``` bash
GET /api/v1/rate?from=eur&to=try
''''

### Flexible Rates Only (USD, TRY, GBP)
``` bash
GET /api/v1/rates/eur?targets=usd,try,gbp
''''

### Date Rates
``` bash
GET /api/v1/rates/eur/2024-03-06
''''

### Date Range (For Chart)
``` bash
GET /api/v1/rates/eur/try/range?start=2024-01-01&end=2024-03-06
''''

### Crypto Rates
``` bash
GET /api/v1/crypto/btc?targets=usd,eur,try
''''

### Minified JSON
``` bash
GET /api/v1/rates/eur/min
''''

## 🔧 Configuration

You can find the following settings in the `application.properties` file:

````properties
# Server
server.port=8080
server.servlet.context-path=/api

# External API
app.external-api.base-url=https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1
app.external-api.timeout=10000
app.external-api.cache-ttl=300

# Cache
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=5m
```

## 📊 Cache Strategy

- **Currencies**: 5 minutes
- **Currencies**: 5 minutes
- **Historical Rates**: 5 minutes
- **Maximum Cache Size**: 1000 entries