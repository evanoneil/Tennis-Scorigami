#!/usr/bin/env Rscript

# Process Historical Tennis Match Data for Scorigami Analysis
# This script processes all ATP and WTA match data from 1968 to 2024
# and creates a consolidated dataset for the scrollytelling visualization

# Load required packages
library(dplyr)
library(tidyr)
library(stringr)
library(readr)
library(purrr)

# Create output directory if it doesn't exist
dir.create("processed_data", showWarnings = FALSE)

# Function to parse tennis score (keeping exact scoreline format)
parse_score <- function(score_string) {
  if (is.na(score_string)) return(NA)
  
  # Skip retirements, walkovers, etc.
  if (grepl("RET|W/O|DEF|ABD|UNFINISHED", score_string, ignore.case = TRUE)) {
    return(NA)
  }
  
  # Extract sets (remove tiebreak details)
  sets <- c()
  for (part in str_split(score_string, " ")[[1]]) {
    # Handle sets with tiebreak info like "7-6(5)"
    if (grepl("\\(", part)) {
      set_score <- sub("(\\d+-\\d+)\\(.*\\)", "\\1", part)
      sets <- c(sets, set_score)
    } 
    # Handle normal set scores like "6-4"
    else if (grepl("^\\d+-\\d+$", part)) {
      sets <- c(sets, part)  # Use 'part' directly for normal scores
    }
  }
  
  if (length(sets) == 0) return(NA)
  return(paste(sets, collapse = " "))
}

# Function to check if a match is a valid BO3
is_valid_bo3 <- function(score) {
  if (is.na(score)) return(FALSE)
  
  sets <- str_split(score, " ")[[1]]
  if (length(sets) < 2 || length(sets) > 3) return(FALSE)
  
  winner_sets <- 0
  for (set in sets) {
    # Safely parse the set score
    parts <- tryCatch({
      as.numeric(strsplit(set, "-")[[1]])
    }, error = function(e) {
      return(c(NA, NA))
    })
    
    # Skip if we couldn't parse the score properly
    if (length(parts) != 2 || any(is.na(parts))) {
      return(FALSE)
    }
    
    if (parts[1] > parts[2]) winner_sets <- winner_sets + 1
  }
  
  return(winner_sets == 2) # Valid BO3 match if winner has exactly 2 sets
}

# Function to check if a score is a standard tiebreak-era score
is_standard_score <- function(set_score) {
  if (is.na(set_score)) return(FALSE)
  
  parts <- as.numeric(strsplit(set_score, "-")[[1]])
  
  # Standard winning scores: 6-0, 6-1, 6-2, 6-3, 6-4, 7-5, 7-6
  # Standard losing scores: 0-6, 1-6, 2-6, 3-6, 4-6, 5-7, 6-7
  
  # Check if it's a standard winning score
  if (parts[1] > parts[2]) {
    return((parts[1] == 6 && parts[2] <= 4) || 
           (parts[1] == 7 && (parts[2] == 5 || parts[2] == 6)))
  } 
  # Check if it's a standard losing score
  else if (parts[1] < parts[2]) {
    return((parts[2] == 6 && parts[1] <= 4) || 
           (parts[2] == 7 && (parts[1] == 5 || parts[1] == 6)))
  }
  
  return(FALSE)
}

# Function to check if a match has all standard set scores
has_standard_scores <- function(score) {
  if (is.na(score)) return(FALSE)
  
  sets <- str_split(score, " ")[[1]]
  all(sapply(sets, is_standard_score))
}

# Function to process a single match file
process_match_file <- function(file_path, tour_type) {
  # Extract year from filename
  year <- as.numeric(str_extract(basename(file_path), "\\d{4}"))
  
  # Read the data
  tryCatch({
    matches <- read.csv(file_path, stringsAsFactors = FALSE)
    
    # Check if the file has the required columns
    required_cols <- c("score", "tourney_name", "surface", "winner_name", "loser_name")
    missing_cols <- required_cols[!required_cols %in% names(matches)]
    
    if (length(missing_cols) > 0) {
      cat(sprintf("Warning: File %s is missing columns: %s. Skipping.\n", 
                  basename(file_path), paste(missing_cols, collapse = ", ")))
      return(data.frame())
    }
    
    # Parse scores
    matches$parsed_score <- sapply(matches$score, parse_score)
    
    # Filter for valid BO3 matches
    matches <- matches[!is.na(matches$parsed_score), ]
    matches$is_bo3 <- sapply(matches$parsed_score, is_valid_bo3)
    bo3_matches <- matches[matches$is_bo3, ]
    
    # Filter for standard tiebreak-era scores
    bo3_matches$has_standard_scores <- sapply(bo3_matches$parsed_score, has_standard_scores)
    bo3_matches <- bo3_matches[bo3_matches$has_standard_scores, ]
    
    # Skip if no valid matches
    if (nrow(bo3_matches) == 0) {
      cat(sprintf("Warning: No valid BO3 matches found in %s\n", basename(file_path)))
      return(data.frame())
    }
    
    # Create a simplified dataset
    result <- data.frame(
      tour = tour_type,
      year = year,
      scoreline = bo3_matches$parsed_score,
      match_id = paste(tour_type, year, 1:nrow(bo3_matches), sep = "_"),
      tourney_name = bo3_matches$tourney_name,
      surface = bo3_matches$surface,
      winner_name = bo3_matches$winner_name,
      loser_name = bo3_matches$loser_name,
      stringsAsFactors = FALSE
    )
    
    return(result)
  }, error = function(e) {
    cat(sprintf("Error processing file %s: %s\n", basename(file_path), e$message))
    return(data.frame())
  })
}

# Get all ATP match files
atp_files <- list.files("all_matches", pattern = "atp_matches_\\d{4}\\.csv", full.names = TRUE)

# Get all WTA match files
wta_files <- list.files("all_matches", pattern = "wta_matches_\\d{4}\\.csv", full.names = TRUE)

# Process all ATP files
cat("Processing ATP match files...\n")
atp_results <- map_df(atp_files, function(file) {
  cat(sprintf("Processing %s...\n", basename(file)))
  process_match_file(file, "ATP")
})

# Process all WTA files
cat("Processing WTA match files...\n")
wta_results <- map_df(wta_files, function(file) {
  cat(sprintf("Processing %s...\n", basename(file)))
  process_match_file(file, "WTA")
})

# Combine results
all_results <- bind_rows(atp_results, wta_results)

# Save the combined dataset
write_csv(all_results, "processed_data/all_tennis_matches.csv")

# Generate summary statistics
# 1. Count by scoreline across all years
scoreline_counts <- all_results %>%
  group_by(scoreline) %>%
  summarise(
    total_count = n(),
    atp_count = sum(tour == "ATP"),
    wta_count = sum(tour == "WTA")
  ) %>%
  arrange(desc(total_count))

# 2. Count by scoreline for 2024 only
scoreline_counts_2024 <- all_results %>%
  filter(year == 2024) %>%
  group_by(scoreline) %>%
  summarise(
    total_count = n(),
    atp_count = sum(tour == "ATP"),
    wta_count = sum(tour == "WTA")
  ) %>%
  arrange(desc(total_count))

# 3. Count by year
year_counts <- all_results %>%
  group_by(year, tour) %>%
  summarise(count = n(), .groups = "drop") %>%
  pivot_wider(names_from = tour, values_from = count, values_fill = 0) %>%
  mutate(total = ATP + WTA)

# Generate all possible scorelines
generate_all_scorelines <- function() {
  # Set score possibilities
  winning_sets <- c("6-0", "6-1", "6-2", "6-3", "6-4", "7-5", "7-6")
  losing_sets <- c("0-6", "1-6", "2-6", "3-6", "4-6", "5-7", "6-7")
  
  # Straight sets (2-0)
  straight_sets <- expand.grid(
    set1 = winning_sets,
    set2 = winning_sets,
    stringsAsFactors = FALSE
  )
  straight_sets$scoreline <- paste(straight_sets$set1, straight_sets$set2)
  straight_sets$first_set <- straight_sets$set1
  straight_sets$is_straight_sets <- TRUE
  
  # 3-set matches with first set lost (1-2)
  three_sets_1 <- expand.grid(
    set1 = losing_sets,
    set2 = winning_sets,
    set3 = winning_sets,
    stringsAsFactors = FALSE
  )
  three_sets_1$scoreline <- paste(three_sets_1$set1, three_sets_1$set2, three_sets_1$set3)
  three_sets_1$first_set <- three_sets_1$set1
  three_sets_1$is_straight_sets <- FALSE
  
  # 3-set matches with second set lost (2-1)
  three_sets_2 <- expand.grid(
    set1 = winning_sets,
    set2 = losing_sets,
    set3 = winning_sets,
    stringsAsFactors = FALSE
  )
  three_sets_2$scoreline <- paste(three_sets_2$set1, three_sets_2$set2, three_sets_2$set3)
  three_sets_2$first_set <- three_sets_2$set1
  three_sets_2$is_straight_sets <- FALSE
  
  # Combine all possible scorelines
  all_scorelines <- rbind(
    straight_sets[, c("scoreline", "first_set", "is_straight_sets")],
    three_sets_1[, c("scoreline", "first_set", "is_straight_sets")],
    three_sets_2[, c("scoreline", "first_set", "is_straight_sets")]
  )
  
  # Add set count
  all_scorelines$num_sets <- sapply(all_scorelines$scoreline, function(x) {
    length(str_split(x, " ")[[1]])
  })
  
  # Add individual set scores
  all_scorelines <- all_scorelines %>%
    mutate(
      set1_score = sapply(scoreline, function(x) {
        parts <- str_split(x, " ")[[1]]
        return(parts[1])
      }),
      set2_score = sapply(scoreline, function(x) {
        parts <- str_split(x, " ")[[1]]
        if (length(parts) >= 2) return(parts[2]) else return(NA)
      }),
      set3_score = sapply(scoreline, function(x) {
        parts <- str_split(x, " ")[[1]]
        if (length(parts) >= 3) return(parts[3]) else return(NA)
      })
    )
  
  return(all_scorelines)
}

# Generate all possible scorelines
all_scorelines_df <- generate_all_scorelines()

# Add observed flags and counts
all_scorelines_df$observed_all_time <- all_scorelines_df$scoreline %in% scoreline_counts$scoreline
all_scorelines_df$observed_2024 <- all_scorelines_df$scoreline %in% scoreline_counts_2024$scoreline

# Add counts
all_scorelines_df$count_all_time <- 0
all_scorelines_df$count_atp_all_time <- 0
all_scorelines_df$count_wta_all_time <- 0
all_scorelines_df$count_2024 <- 0
all_scorelines_df$count_atp_2024 <- 0
all_scorelines_df$count_wta_2024 <- 0

# Fill in counts for all time
for (i in 1:nrow(scoreline_counts)) {
  idx <- which(all_scorelines_df$scoreline == scoreline_counts$scoreline[i])
  if (length(idx) > 0) {
    all_scorelines_df$count_all_time[idx] <- scoreline_counts$total_count[i]
    all_scorelines_df$count_atp_all_time[idx] <- scoreline_counts$atp_count[i]
    all_scorelines_df$count_wta_all_time[idx] <- scoreline_counts$wta_count[i]
  }
}

# Fill in counts for 2024
for (i in 1:nrow(scoreline_counts_2024)) {
  idx <- which(all_scorelines_df$scoreline == scoreline_counts_2024$scoreline[i])
  if (length(idx) > 0) {
    all_scorelines_df$count_2024[idx] <- scoreline_counts_2024$total_count[i]
    all_scorelines_df$count_atp_2024[idx] <- scoreline_counts_2024$atp_count[i]
    all_scorelines_df$count_wta_2024[idx] <- scoreline_counts_2024$wta_count[i]
  }
}

# Save the processed data
write_csv(all_scorelines_df, "processed_data/all_scorelines.csv")
write_csv(scoreline_counts, "processed_data/scoreline_counts_all_time.csv")
write_csv(scoreline_counts_2024, "processed_data/scoreline_counts_2024.csv")
write_csv(year_counts, "processed_data/year_counts.csv")

# Print summary statistics
cat("\n===== TENNIS SCORIGAMI DATA PROCESSING SUMMARY =====\n")
cat(sprintf("Total possible scorelines: %d\n", nrow(all_scorelines_df)))
cat(sprintf("Total straight sets possibilities: %d\n", sum(all_scorelines_df$is_straight_sets)))
cat(sprintf("Total three sets possibilities: %d\n", sum(!all_scorelines_df$is_straight_sets)))
cat("\n")
cat(sprintf("Observed scorelines (all time): %d (%.1f%%)\n", 
            sum(all_scorelines_df$observed_all_time), 
            sum(all_scorelines_df$observed_all_time) / nrow(all_scorelines_df) * 100))
cat(sprintf("Observed scorelines (2024): %d (%.1f%%)\n", 
            sum(all_scorelines_df$observed_2024), 
            sum(all_scorelines_df$observed_2024) / nrow(all_scorelines_df) * 100))
cat("\n")
cat(sprintf("Total matches processed: %d\n", nrow(all_results)))
cat(sprintf("ATP matches: %d\n", sum(all_results$tour == "ATP")))
cat(sprintf("WTA matches: %d\n", sum(all_results$tour == "WTA")))
cat("\n")
cat("Data processing complete. Files saved to processed_data/ directory.\n") 