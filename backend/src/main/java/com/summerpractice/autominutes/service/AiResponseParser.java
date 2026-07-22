package com.summerpractice.autominutes.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AiResponseParser {

    private static final List<String> SECTION_LABELS = List.of(
            "CONCISE_SUMMARY", "DETAILED_SUMMARY", "KEY_POINTS",
            "DECISIONS", "FOLLOW_UP_NOTES", "ACTION_ITEMS"
    );

    public static ParsedAiResult parseRawResponse(String raw) {
        if (raw == null || raw.isBlank()) {
            return new ParsedAiResult("", "", "", "", "", new ArrayList<>());
        }

        String normalized = raw.replace("\r\n", "\n").trim();

        String conciseSummary = cleanProse(extractRawBlock(normalized, "CONCISE_SUMMARY"));
        String detailedSummary = cleanProse(extractRawBlock(normalized, "DETAILED_SUMMARY"));
        String keyPoints = extractBullets(extractRawBlock(normalized, "KEY_POINTS"));
        String decisions = extractBullets(extractRawBlock(normalized, "DECISIONS"));
        String followUpNotes = cleanProse(extractRawBlock(normalized, "FOLLOW_UP_NOTES"));
        List<ParsedActionItem> actionItems = extractActionItems(extractRawBlock(normalized, "ACTION_ITEMS"));

        return new ParsedAiResult(conciseSummary, detailedSummary, keyPoints, decisions, followUpNotes, actionItems);
    }

    /**
     * Finds "LABEL:" anywhere at the start of a line (content may follow on the
     * same line, or start on the next line) and returns everything up to the
     * next section label or end of text.
     */
    private static String extractRawBlock(String text, String label) {
        Pattern labelPattern = Pattern.compile("(?m)^" + Pattern.quote(label) + ":");
        Matcher matcher = labelPattern.matcher(text);
        if (!matcher.find()) {
            return "";
        }
        int contentStart = matcher.end();

        Pattern anyLabel = Pattern.compile(
                "(?m)^(" + String.join("|", SECTION_LABELS) + "):"
        );
        Matcher next = anyLabel.matcher(text);
        next.region(contentStart, text.length());

        int contentEnd = text.length();
        if (next.find()) {
            contentEnd = next.start();
        }

        return text.substring(contentStart, contentEnd).strip();
    }

    private static String cleanProse(String block) {
        if (block.isBlank() || block.equalsIgnoreCase("none")) {
            return "";
        }
        return block.strip();
    }

    private static String extractBullets(String block) {
        if (block.isBlank()) {
            return "";
        }
        List<String> lines = new ArrayList<>();
        for (String line : block.split("\n")) {
            String cleaned = line.strip();
            if (cleaned.startsWith("*") || cleaned.startsWith("-")) {
                cleaned = cleaned.substring(1).strip();
            }
            if (!cleaned.isEmpty() && !cleaned.equalsIgnoreCase("none")) {
                lines.add(cleaned);
            }
        }
        return String.join("\n", lines);
    }

    private static List<ParsedActionItem> extractActionItems(String block) {
        List<ParsedActionItem> items = new ArrayList<>();
        if (block.isBlank()) {
            return items;
        }

        for (String line : block.split("\n")) {
            String cleaned = line.strip();
            if (cleaned.startsWith("*") || cleaned.startsWith("-")) {
                cleaned = cleaned.substring(1).strip();
            }
            if (cleaned.isEmpty() || cleaned.equalsIgnoreCase("none")) {
                continue;
            }

            String[] parts = cleaned.split("\\|");
            String description = parts.length > 0 ? parts[0].strip() : "";
            String assignee = parts.length > 1 ? parts[1].strip() : null;
            LocalDate deadline = parts.length > 2 ? parseDeadline(parts[2].strip()) : null;

            if (assignee != null && (assignee.isEmpty() || assignee.equalsIgnoreCase("none"))) {
                assignee = null;
            }
            if (!description.isEmpty()) {
                items.add(new ParsedActionItem(description, assignee, deadline));
            }
        }
        return items;
    }

    private static LocalDate parseDeadline(String value) {
        if (value == null || value.isBlank() || value.equalsIgnoreCase("none")) {
            return null;
        }
        try {
            return LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return null;
        }
    }

    public record ParsedActionItem(String description, String assignee, LocalDate deadline) {}

    public record ParsedAiResult(
            String conciseSummary,
            String detailedSummary,
            String keyPoints,
            String decisions,
            String followUpNotes,
            List<ParsedActionItem> actionItems
    ) {}
}