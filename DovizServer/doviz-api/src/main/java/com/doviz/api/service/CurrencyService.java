package com.doviz.api.service;

import com.doviz.api.client.ExternalApiClient;
import com.doviz.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final ExternalApiClient externalApiClient;

    public Mono<ApiResponse<Object>> getAllCurrencies() {
        return externalApiClient.getAllCurrencies()
                .map(ApiResponse::success)
                .doOnError(error -> log.error("Error in getAllCurrencies: {}", error.getMessage()));
    }

    public Mono<ApiResponse<CurrencyRates>> getCurrencyRates(String baseCurrency) {
        return externalApiClient.getCurrencyRates(baseCurrency)
                .map(ApiResponse::success)
                .doOnError(error -> log.error("Error in getCurrencyRates: {}", error.getMessage()));
    }

    public Mono<ApiResponse<CurrencyRates>> getCurrencyRatesWithTargets(String baseCurrency, List<String> targets) {
        return externalApiClient.getCurrencyRates(baseCurrency)
                .map(rates -> {
                    if (rates == null || rates.getRates() == null) {
                        throw new RuntimeException("No rates data available for " + baseCurrency);
                    }
                    return filterRatesByTargets(rates, targets);
                })
                .map(ApiResponse::success)
                .doOnError(error -> log.error("Error in getCurrencyRatesWithTargets: {}", error.getMessage()));
    }

    public Mono<ApiResponse<ExchangeRate>> getSingleRate(String from, String to) {
        return externalApiClient.getCurrencyRates(from)
                .flatMap(rates -> {
                    if (rates == null || rates.getRates() == null) {
                        return Mono.error(new RuntimeException("No rates data available for " + from));
                    }

                    Double rate = rates.getRates().get(to.toLowerCase());
                    if (rate == null) {
                        return Mono.error(new RuntimeException("Rate not found for " + from + " to " + to));
                    }

                    ExchangeRate exchangeRate = new ExchangeRate(
                            from.toUpperCase(),
                            to.toUpperCase(),
                            java.math.BigDecimal.valueOf(rate),
                            LocalDate.now(),
                            System.currentTimeMillis());

                    return Mono.just(ApiResponse.success(exchangeRate));
                })
                .doOnError(error -> log.error("Error in getSingleRate: {}", error.getMessage()));
    }

    public Mono<ApiResponse<CurrencyRates>> getHistoricalRates(String baseCurrency, String date) {
        try {
            LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            return externalApiClient.getHistoricalRates(baseCurrency, localDate)
                    .map(ApiResponse::success)
                    .doOnError(error -> log.error("Error in getHistoricalRates: {}", error.getMessage()));
        } catch (Exception e) {
            return Mono.just(ApiResponse.error("Invalid date format. Use YYYY-MM-DD"));
        }
    }

    public Mono<ApiResponse<List<ExchangeRate>>> getRateRange(String baseCurrency, String targetCurrency,
            String startDate, String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            LocalDate end = LocalDate.parse(endDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            if (start.isAfter(end)) {
                return Mono.just(ApiResponse.error("Start date cannot be after end date"));
            }

            List<ExchangeRate> rateHistory = new ArrayList<>();
            LocalDate current = start;

            while (!current.isAfter(end)) {
                try {
                    CurrencyRates rates = externalApiClient.getHistoricalRates(baseCurrency, current).block();
                    System.out.println("DATE: " + rates.getDate());
                    System.out.println("RATES: " + rates.getRates());

                    if (rates != null && rates.getRates() != null) {
                        Map<String, Double> map = rates.getRates();

                        // Keyleri normalize et
                        Double rate = map.get(targetCurrency.toLowerCase());
                        if (rate == null) {
                            rate = map.get(targetCurrency.toUpperCase());
                        }
                        if (rate == null) {
                            rate = map.entrySet().stream()
                                    .filter(e -> e.getKey().equalsIgnoreCase(targetCurrency))
                                    .map(Map.Entry::getValue)
                                    .findFirst()
                                    .orElse(null);
                        }

                        if (rate != null) {
                            rateHistory.add(new ExchangeRate(
                                    baseCurrency.toUpperCase(),
                                    targetCurrency.toUpperCase(),
                                    java.math.BigDecimal.valueOf(rate),
                                    current,
                                    System.currentTimeMillis()));
                        } else {
                            log.warn("Rate for {} not found on {}", targetCurrency, current);
                        }
                    }

                } catch (Exception e) {
                    log.warn("Could not fetch rate for {} on {}", current, e.getMessage());
                }
                current = current.plusDays(1);
            }

            return Mono.just(ApiResponse.success(rateHistory,
                    String.format("Fetched %d rates from %s to %s", rateHistory.size(), startDate, endDate)));

        } catch (Exception e) {
            return Mono.just(ApiResponse.error("Invalid date format. Use YYYY-MM-DD"));
        }
    }

    public Mono<ApiResponse<CurrencyRates>> getCryptoRates(String baseCrypto, List<String> targets) {
        return externalApiClient.getCurrencyRates(baseCrypto)
                .map(rates -> {
                    if (rates == null || rates.getRates() == null) {
                        throw new RuntimeException("No crypto rates data available for " + baseCrypto);
                    }
                    return filterRatesByTargets(rates, targets);
                })
                .map(ApiResponse::success)
                .doOnError(error -> log.error("Error in getCryptoRates: {}", error.getMessage()));
    }

    public Mono<ApiResponse<CurrencyRates>> getMinifiedRates(String baseCurrency) {
        return externalApiClient.getMinifiedRates(baseCurrency)
                .map(ApiResponse::success)
                .doOnError(error -> log.error("Error in getMinifiedRates: {}", error.getMessage()));
    }

    private CurrencyRates filterRatesByTargets(CurrencyRates rates, List<String> targets) {
        if (rates == null || rates.getRates() == null) {
            throw new RuntimeException("No rates data available for filtering");
        }

        if (targets == null || targets.isEmpty()) {
            return rates;
        }

        Map<String, Double> filteredRates = rates.getRates().entrySet().stream()
                .filter(entry -> targets.stream()
                        .anyMatch(target -> target.equalsIgnoreCase(entry.getKey())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        return new CurrencyRates(rates.getBase(), rates.getDate(), filteredRates);
    }
}