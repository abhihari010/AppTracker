package com.apptracker.controller;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.repository.ApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final ApplicationRepository applicationRepository;

    public AnalyticsController(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics(@AuthenticationPrincipal UUID userId) {
        List<ApplicationEntity> allApps = applicationRepository.findAll()
                .stream()
                .filter(app -> app.getUserId().equals(userId))
                .collect(Collectors.toList());

        Map<String, Object> analytics = new HashMap<>();

        // Total counts by status
        Map<String, Long> statusCounts = allApps.stream()
                .collect(Collectors.groupingBy(
                        app -> app.getStatus().name(),
                        Collectors.counting()));
        analytics.put("statusCounts", statusCounts);

        // Applications per week (last 12 weeks)
        Map<String, Long> appsPerWeek = calculateAppsPerWeek(allApps);
        analytics.put("appsPerWeek", appsPerWeek);

        // Conversion rates
        long totalApplied = statusCounts.getOrDefault("APPLIED", 0L) +
                statusCounts.getOrDefault("OA", 0L) +
                statusCounts.getOrDefault("INTERVIEW", 0L) +
                statusCounts.getOrDefault("OFFER", 0L);

        long interviews = statusCounts.getOrDefault("INTERVIEW", 0L) + statusCounts.getOrDefault("OFFER", 0L);
        long offers = statusCounts.getOrDefault("OFFER", 0L);

        Map<String, Double> conversionRates = new HashMap<>();
        conversionRates.put("appliedToInterview", totalApplied > 0 ? (double) interviews / totalApplied * 100 : 0);
        conversionRates.put("interviewToOffer", interviews > 0 ? (double) offers / interviews * 100 : 0);
        conversionRates.put("appliedToOffer", totalApplied > 0 ? (double) offers / totalApplied * 100 : 0);
        analytics.put("conversionRates", conversionRates);

        return ResponseEntity.ok(analytics);
    }

    private Map<String, Long> calculateAppsPerWeek(List<ApplicationEntity> apps) {
        OffsetDateTime twelveWeeksAgo = OffsetDateTime.now().minusWeeks(12)
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        Map<String, Long> weeklyCount = new LinkedHashMap<>();

        for (int i = 0; i < 12; i++) {
            OffsetDateTime weekStart = twelveWeeksAgo.plusWeeks(i);
            OffsetDateTime weekEnd = weekStart.plusWeeks(1);

            long count = apps.stream()
                    .filter(app -> app.getDateApplied() != null)
                    .filter(app -> !app.getDateApplied().isBefore(weekStart) && app.getDateApplied().isBefore(weekEnd))
                    .count();

            String weekLabel = String.format("Week of %02d/%02d",
                    weekStart.getMonthValue(), weekStart.getDayOfMonth());
            weeklyCount.put(weekLabel, count);
        }

        return weeklyCount;
    }

}
