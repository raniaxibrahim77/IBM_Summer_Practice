package com.summerpractice.autominutes.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AiResponseParser {

    private static final Pattern SECTION_PATTERN = Pattern.compile(
            "^(CONCISE_SUMMARY|DETAILED_SUMMARY|KEY_POINTS|DECISIONS|FOLLOW_UP_NOTES|ACTION_ITEMS):\\s*$",
            Pattern.MULTILINE
    );

    public static ParsedAiResult parseRawResponse(String raw) {
        if (raw == null || raw.isBlank()) {
            return new ParsedAiResult("", "", "", "", "", new ArrayList<>());
        }

        String normalized = raw.replace("\r\n", "\n").trim();

        String conciseSummary = extractSingleLineSection(normalized, "CONCISE_SUMMARY");
        String detailedSummary = extractSingleLineSection(normalized, "DETAILED_SUMMARY");
        String keyPoints = extractBulletSection(normalized, "KEY_POINTS");
        String decisions = extractBulletSection(normalized, "DECISIONS");
        String followUpNotes = extractSingleLineSection(normalized, "FOLLOW_UP_NOTES");
        List<ParsedActionItem> actionItems = extractActionItems(normalized);

        return new ParsedAiResult(
                conciseSummary,
                detailedSummary,
                keyPoints,
                decisions,
                followUpNotes,
                actionItems
        );
    }

    /**
     * Extracts everything between "LABEL:" and the next section header (or end of text),
     */
    private static String extractSingleLineSection(String text, String label) {
        String block = extractRawBlock(text, label);
        if (block == null) {
            return "";
        }
        return block.strip();
    }

    /**
     * Extracts a bullet-point section (KEY_POINTS, DECISIONS) and joins the bullets
     */
    private static String extractBulletSection(String text, String label) {
        String block = extractRawBlock(text, label);
        if (block == null) {
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

    /**
     * Extracts ACTION_ITEMS bullets in the form:
     */
    private static List<ParsedActionItem> extractActionItems(String text) {
        List<ParsedActionItem> items = new ArrayList<>();
        String block = extractRawBlock(text, "ACTION_ITEMS");
        if (block == null) {
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
            return null; // malformed date from the model — skip rather than fail the whole parse
        }
    }

    /**
     * Finds the text between a given section label and the next section header (or end of string).
     */
    private static String extractRawBlock(String text, String label) {
        Matcher matcher = Pattern.compile("^" + label + ":\\s*$", Pattern.MULTILINE).matcher(text);
        if (!matcher.find()) {
            return null;
        }
        int contentStart = matcher.end();

        Matcher nextSection = SECTION_PATTERN.matcher(text);
        int contentEnd = text.length();
        nextSection.region(contentStart, text.length());
        if (nextSection.find()) {
            contentEnd = nextSection.start();
        }

        return text.substring(contentStart, contentEnd).strip();
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