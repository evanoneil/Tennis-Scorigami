# Static Tennis Scorigami Visualization
# Creates a static PNG visualization with properly positioned legend

# Load required packages
library(ggplot2)
library(dplyr)
library(tidyr)
library(stringr)
library(grid)
library(gridExtra)

# Create output directory if it doesn't exist
dir.create("Output", showWarnings = FALSE)

# Load and process the ATP match data
atp_data <- read.csv("atp_matches_2024.csv", stringsAsFactors = FALSE)

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

# Parse all scores
atp_data$parsed_score <- sapply(atp_data$score, parse_score)

# Filter for valid BO3 matches
is_valid_bo3 <- function(score) {
  if (is.na(score)) return(FALSE)
  
  sets <- str_split(score, " ")[[1]]
  if (length(sets) < 2 || length(sets) > 3) return(FALSE)
  
  winner_sets <- 0
  for (set in sets) {
    parts <- as.numeric(strsplit(set, "-")[[1]])
    if (parts[1] > parts[2]) winner_sets <- winner_sets + 1
  }
  
  return(winner_sets == 2) # Valid BO3 match if winner has exactly 2 sets
}

atp_data <- atp_data[!is.na(atp_data$parsed_score), ]
atp_data$is_bo3 <- sapply(atp_data$parsed_score, is_valid_bo3)
bo3_matches <- atp_data[atp_data$is_bo3, ]

# Count occurrences of each scoreline
observed_scores <- table(bo3_matches$parsed_score)
observed_df <- data.frame(
  scoreline = names(observed_scores),
  count = as.numeric(observed_scores)
)

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
  
  # 3-set matches with first set lost (1-2)
  three_sets_1 <- expand.grid(
    set1 = losing_sets,
    set2 = winning_sets,
    set3 = winning_sets,
    stringsAsFactors = FALSE
  )
  three_sets_1$scoreline <- paste(three_sets_1$set1, three_sets_1$set2, three_sets_1$set3)
  three_sets_1$first_set <- three_sets_1$set1
  
  # 3-set matches with second set lost (2-1)
  three_sets_2 <- expand.grid(
    set1 = winning_sets,
    set2 = losing_sets,
    set3 = winning_sets,
    stringsAsFactors = FALSE
  )
  three_sets_2$scoreline <- paste(three_sets_2$set1, three_sets_2$set2, three_sets_2$set3)
  three_sets_2$first_set <- three_sets_2$set1
  
  # Combine all possible scorelines
  all_scorelines <- rbind(
    straight_sets[, c("scoreline", "first_set")],
    three_sets_1[, c("scoreline", "first_set")],
    three_sets_2[, c("scoreline", "first_set")]
  )
  
  # Add set count
  all_scorelines$num_sets <- sapply(all_scorelines$scoreline, function(x) {
    length(str_split(x, " ")[[1]])
  })
  
  # Add observed flag
  all_scorelines$observed <- all_scorelines$scoreline %in% observed_df$scoreline
  
  # Add count for observed scores
  all_scorelines$count <- 0
  for (i in 1:nrow(observed_df)) {
    idx <- which(all_scorelines$scoreline == observed_df$scoreline[i])
    if (length(idx) > 0) {
      all_scorelines$count[idx] <- observed_df$count[i]
    }
  }
  
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

# Define order for first set results
winning_set_order <- c("7-6", "7-5", "6-4", "6-3", "6-2", "6-1", "6-0")
losing_set_order <- c("6-7", "5-7", "4-6", "3-6", "2-6", "1-6", "0-6")

# Combine the sets in the desired order (7-6 at top, 6-0 at bottom)
first_set_order <- c(winning_set_order, losing_set_order)

# Create a factor for first set with the correct order
all_scorelines_df$first_set_ordered <- factor(
  all_scorelines_df$first_set,
  levels = rev(first_set_order)  # Reverse because ggplot starts from bottom
)

# Order the data by first set and rest of score
all_scorelines_df <- all_scorelines_df %>%
  arrange(first_set_ordered, set2_score, set3_score)

# Add position for grid layout
all_scorelines_df <- all_scorelines_df %>%
  group_by(first_set) %>%
  mutate(
    x_pos = row_number()
  ) %>%
  ungroup()

# Calculate statistics
total_possible <- nrow(all_scorelines_df)
total_observed <- sum(all_scorelines_df$observed)
fill_percentage <- (total_observed / total_possible) * 100

# Define the exact four colors
exact_colors <- c(
  "#FBFAA7", # Pale yellow
  "#A2F359", # Lime green
  "#4D9F64", # Medium green
  "#13472A"  # Dark green
)

# Assign color based on count
all_scorelines_df$color_bin <- cut(
  all_scorelines_df$count, 
  breaks = c(-Inf, 0, 5, 25, 75, Inf), 
  labels = c("not_observed", "rare", "uncommon", "common", "very_common")
)

# Assign color code
all_scorelines_df$color <- "#f0f0f0"  # Default (not observed)
all_scorelines_df$color[all_scorelines_df$color_bin == "rare"] <- exact_colors[1]
all_scorelines_df$color[all_scorelines_df$color_bin == "uncommon"] <- exact_colors[2]
all_scorelines_df$color[all_scorelines_df$color_bin == "common"] <- exact_colors[3]
all_scorelines_df$color[all_scorelines_df$color_bin == "very_common"] <- exact_colors[4]

# Prepare data for ggplot
plot_data <- all_scorelines_df %>%
  mutate(
    y_pos = match(first_set, rev(first_set_order)),
    label = scoreline
  )

# Create a function to determine text color based on background
get_text_color <- function(color_bin) {
  if (color_bin %in% c("common", "very_common")) {
    return("white")
  } else {
    return("black")
  }
}

# Create a function to format the score labels as a stacked vertical string
create_stacked_label <- function(row) {
  label <- row$set1_score
  
  if (!is.na(row$set2_score)) {
    label <- paste0(label, "\n", row$set2_score)
  }
  
  if (!is.na(row$set3_score)) {
    label <- paste0(label, "\n", row$set3_score)
  }
  
  return(label)
}

# Add stacked labels to the plot data
plot_data$stacked_label <- sapply(1:nrow(plot_data), function(i) {
  create_stacked_label(plot_data[i,])
})

# Add text color to the plot data
plot_data$text_color <- sapply(plot_data$color_bin, get_text_color)

# Create the static visualization with wider boxes
p <- ggplot(plot_data, aes(x = x_pos, y = y_pos)) +
  # Use geom_tile for the background with wider boxes
  geom_tile(aes(fill = color_bin), color = "white", width = 0.95, height = 0.95) +
  scale_fill_manual(
    values = c(
      "not_observed" = "#f0f0f0",
      "rare" = exact_colors[1],
      "uncommon" = exact_colors[2],
      "common" = exact_colors[3],
      "very_common" = exact_colors[4]
    ),
    labels = c(
      "not_observed" = "Not observed",
      "rare" = "1-5",
      "uncommon" = "6-25",
      "common" = "26-75",
      "very_common" = "76+"
    ),
    name = "Frequency"
  ) +
  scale_y_continuous(
    breaks = 1:length(first_set_order),
    labels = rev(first_set_order),
    expand = c(0, 0)
  ) +
  scale_x_continuous(expand = c(0, 0)) +
  labs(
    title = "Tennis Scorigami - 2024 ATP Tour",
    subtitle = sprintf("%d of %d possible scorelines observed (%.1f%%)", 
                      total_observed, total_possible, fill_percentage),
    caption = "Rows organized by first set result (7-6 at top to 0-6 at bottom)"
  ) +
  theme_minimal() +
  theme(
    axis.title = element_blank(),
    axis.text.x = element_blank(),
    axis.ticks = element_blank(),
    panel.grid = element_blank(),
    plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
    plot.subtitle = element_text(hjust = 0.5, size = 12),
    plot.caption = element_text(hjust = 0.5, size = 10),
    # Position the legend in the bottom right corner, not overlapping with the visualization
    legend.position = c(0.99, 0.01),  # x=0.99 (right), y=0.01 (bottom)
    legend.justification = c(1, 0),   # Anchor point at bottom right
    legend.box.just = "right",
    legend.margin = margin(5, 5, 5, 5),
    legend.background = element_rect(fill = "white", color = "#cccccc"),
    legend.key.size = unit(0.8, "cm")
  )

# Add the stacked text labels to the plot with bold font
p <- p +
  geom_text(
    data = plot_data,
    aes(label = stacked_label, color = text_color),
    size = 3.0,  # Larger text
    lineheight = 0.8,  # Control the line spacing
    fontface = "bold"  # Bold font
  ) +
  scale_color_identity()

# Save the plot as PNG with wider dimensions
ggsave("Output/tennis_scorigami.png", p, width = 20, height = 12, dpi = 300)

# Print summary
cat("\n===== STATIC TENNIS SCORIGAMI =====\n")
cat(sprintf("Total possible scorelines: %d\n", total_possible))
cat(sprintf("Observed scorelines: %d\n", total_observed))
cat(sprintf("Fill percentage: %.1f%%\n", fill_percentage))
cat("\nStatic visualization saved to: Output/tennis_scorigami.png\n")
cat("Legend is now properly positioned in the bottom right corner.\n")
cat("Score labels are now bold, stacked vertically, and boxes are wider with better spacing.\n") 