package com.doviz.api.client;

import com.doviz.api.model.CurrencyRates;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
public class ExternalApiClient {

        private final WebClient webClient;
        private final String baseUrl;

        public ExternalApiClient(@Value("${app.external-api.base-url}") String baseUrl) {
                this.baseUrl = baseUrl;
                this.webClient = WebClient.builder()
                                .baseUrl(baseUrl)
                                .build();
        }

        @Cacheable("currencies")
        public Mono<Object> getAllCurrencies() {
                log.info("Fetching all currencies from external API");
                return webClient.get()
                                .uri("/currencies.json")
                                .retrieve()
                                .bodyToMono(Object.class)
                                .doOnSuccess(result -> log.info("Successfully fetched currencies"))
                                .doOnError(error -> log.error("Error fetching currencies: {}", error.getMessage()));
        }

        @Cacheable("rates")
        public Mono<CurrencyRates> getCurrencyRates(String baseCurrency) {
                return webClient.get()
                                .uri("/currencies/{base}.json", baseCurrency.toLowerCase())
                                .retrieve()
                                .bodyToMono(CurrencyRates.class)
                                .doOnSuccess(result -> {
                                        log.info("Fetched base: {}", result.getBase());
                                        log.info("Date: {}", result.getDate());
                                        log.info("Rates map size: {}", result.getRates().size());
                                        result.getRates().forEach((k, v) -> log.info("{} = {}", k, v));
                                })
                                .doOnError(error -> log.error("Error fetching rates for {}: {}", baseCurrency,
                                                error.getMessage()));
        }

        @Cacheable("historical-rates")
        public Mono<CurrencyRates> getHistoricalRates(String baseCurrency, LocalDate date) {
                String dateStr = date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                log.info("Fetching historical rates for {} on {}", baseCurrency, dateStr);

                String url = String.format("/v1/currencies/%s.json", baseCurrency.toLowerCase());
                String versionedBaseUrl = baseUrl.replace("@latest", "@" + dateStr);

                var response = webClient.mutate()
                                .baseUrl(versionedBaseUrl)
                                .build()
                                .get()
                                .uri("/currencies/{base}.json", baseCurrency.toLowerCase())
                                .retrieve()
                                .bodyToMono(CurrencyRates.class);

                return response;
        }

        @Cacheable("rates")
        public Mono<CurrencyRates> getMinifiedRates(String baseCurrency) {
                log.info("Fetching minified rates for base currency: {}", baseCurrency);
                return webClient.get()
                                .uri("/currencies/{base}.min.json", baseCurrency.toLowerCase())
                                .retrieve()
                                .bodyToMono(CurrencyRates.class)
                                .doOnSuccess(result -> log.info("Successfully fetched minified rates for {}",
                                                baseCurrency))
                                .doOnError(error -> log.error("Error fetching minified rates for {}: {}", baseCurrency,
                                                error.getMessage()));
        }
}