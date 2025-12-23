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

        // Average time in stage
        Map<String, Double> avgTimeInStage = calculateAvgTimeInStage(allApps);
        analytics.put("avgTimeInStage", avgTimeInStage);

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

    private Map<String, Double> calculateAvgTimeInStage(List<ApplicationEntity> apps) {
        Map<String, Double> avgTime = new HashMap<>();

        // This is simplified - in production, you'd track actual time in each stage via
        // activity log
        // For now, calculate time from dateApplied to current status change
        for (ApplicationEntity.Status status : ApplicationEntity.Status.values()) {
            List<ApplicationEntity> appsInStatus = apps.stream()
                    .filter(app -> app.getStatus() == status && app.getDateApplied() != null)
                    .collect(Collectors.toList());

            if (!appsInStatus.isEmpty()) {
                double avgDays = appsInStatus.stream()
                        .mapToLong(app -> {
                            OffsetDateTime start = app.getDateApplied();
                            OffsetDateTime end = app.getUpdatedAt();
                            return java.time.Duration.between(start, end).toDays();
                        })
                        .average()
                        .orElse(0.0);

                avgTime.put(status.name(), avgDays);
            }
        }

        return avgTime;
    }
}
