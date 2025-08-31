package com.doviz.api.controller;

import com.doviz.api.model.*;
import com.doviz.api.service.CurrencyService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Döviz API", description = "Döviz kuru operasyonları")
public class CurrencyController {

        private final CurrencyService currencyService;

        /**
         * Tüm para birimlerini getir
         */
        @GetMapping("/currencies")
        public Mono<ResponseEntity<ApiResponse<Object>>> getAllCurrencies() {
                log.info("GET /v1/currencies - Tüm para birimleri istendi");
                return currencyService.getAllCurrencies()
                                .map(response -> ResponseEntity.ok(response))
                                .doOnSuccess(result -> log.info("Tüm para birimleri başdarıyla getirildi"))
                                .doOnError(error -> log.error("Para birimleri getirilirken hata: {}",
                                                error.getMessage()));
        }

        /**
         * Baz para birimine göre tüm döviz kurlarını getir
         */
        @GetMapping("/rates/{base}")
        public Mono<ResponseEntity<ApiResponse<CurrencyRates>>> getCurrencyRates(
                        @PathVariable String base,
                        @RequestParam(required = false) List<String> targets) {

                log.info("GET /v1/rates/{} - {} bazlı kurlar istendi, targets: {}", base, base, targets);

                if (targets != null && !targets.isEmpty()) {
                        return currencyService.getCurrencyRatesWithTargets(base, targets)
                                        .map(response -> ResponseEntity.ok(response));
                }

                return currencyService.getCurrencyRates(base)
                                .map(response -> ResponseEntity.ok(response))
                                .doOnSuccess(result -> log.info("{} bazlı kurlar başarıyla getirildi", base))
                                .doOnError(error -> log.error("{} bazlı kurlar getirilirken hata: {}", base,
                                                error.getMessage()));
        }

        /**
         * Tek bir para birimi çifti için dönüşüm
         */
        @GetMapping("/rate")
        public Mono<ResponseEntity<ApiResponse<ExchangeRate>>> getSingleRate(
                        @RequestParam String from,
                        @RequestParam String to) {

                log.info("GET /v1/rate - {} → {} dönüşüm oranı istendi", from, to);

                return currencyService.getSingleRate(from, to)
                                .map(response -> ResponseEntity.ok(response))
                                .doOnSuccess(result -> log.info("{} → {} dönüşüm oranı başarıyla getirildi", from, to))
                                .doOnError(error -> log.error("{} → {} dönüşüm oranı getirilirken hata: {}", from, to,
                                                error.getMessage()));
        }

        /**
         * Tarih bazlı kurlar
         */
        @GetMapping("/rates/{base}/{date}")
        public Mono<ResponseEntity<ApiResponse<CurrencyRates>>> getHistoricalRates(
                        @PathVariable String base,
                        @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") String date) {

                log.info("GET /v1/rates/{}/{} - {} bazlı {} tarihli kurlar istendi", base, date, base, date);

                return currencyService.getHistoricalRates(base, date)
                                .map(response -> ResponseEntity.ok(response))
                                .doOnSuccess(result -> log.info("{} bazlı {} tarihli kurlar başarıyla getirildi", base,
                                                date))
                                .doOnError(error -> log.error("{} bazlı {} tarihli kurlar getirilirken hata: {}", base,
                                                date,
                                                error.getMessage()));
        }

        /**
         * Tarih aralığı ve grafik desteği
         */
        @GetMapping("/rates/{base}/{target}/range")
        public Mono<ResponseEntity<ApiResponse<List<ExchangeRate>>>> getRateRange(
                        @PathVariable String base,
                        @PathVariable String target,
                        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") String start,
                        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") String end) {

                log.info("GET /v1/rates/{}/{}/range - {} → {} aralık: {} - {}", base, target, base, target, start, end);

                return currencyService.getRateRange(base, target, start, end)
                                .map(response -> ResponseEntity.ok(response))
                                .doOnSuccess(result -> log.info("{} → {} aralık kurları başarıyla getirildi: {} - {}",
                                                base, target,
                                                start, end))
                                .doOnError(error -> log.error("{} → {} aralık kurları getirilirken hata: {}", base,
                                                target,
                                                error.getMessage()));
        }

        /**
         * Kripto bazlı kurlar
         */
        @GetMapping("/crypto/{base}")
        public Mono<ResponseEntity<ApiResponse<CurrencyRates>>> getCryptoRates(
                        @PathVariable String base,
                        @RequestParam(required = false) List<String> targets) {

                log.info("GET /v1/crypto/{} - {} kripto kurları istendi, targets: {}", base, base, targets);

                return currencyService.getCryptoRates(base, targets)
                                .map(response -> ResponseEntity.ok(response))
                                .doOnSuccess(result -> log.info("{} kripto kurları başarıyla getirildi", base))
                                .doOnError(error -> log.error("{} kripto kurları getirilirken hata: {}", base,
                                                error.getMessage()));
        }

        /**
         * Minified JSON versiyonu
         */
        @GetMapping("/rates/{base}/min")
        public Mono<ResponseEntity<ApiResponse<CurrencyRates>>> getMinifiedRates(@PathVariable String base) {
                log.info("GET /v1/rates/{}/min - {} bazlı minified kurlar istendi", base, base);

                return currencyService.getMinifiedRates(base)
                                .map(response -> ResponseEntity.ok(response))
                                .doOnSuccess(result -> log.info("{} bazlı minified kurlar başarıyla getirildi", base))
                                .doOnError(
                                                error -> log.error("{} bazlı minified kurlar getirilirken hata: {}",
                                                                base, error.getMessage()));
        }

        /**
         * Health check endpoint
         */
        @GetMapping("/health")
        public Mono<ResponseEntity<ApiResponse<String>>> healthCheck() {
                log.info("GET /v1/health - Health check istendi");
                return Mono.just(ResponseEntity.ok(ApiResponse.success("Doviz API is running!", "API is healthy")));
        }
}