# Tennis Scorigami - A Visual Journey

This project explores the concept of "Scorigami" in tennis - tracking the unique scorelines that have occurred in professional tennis matches. The visualization shows all possible scorelines in a best-of-three tennis match and highlights which ones have been observed in professional tennis since 1968.

## Features

- Interactive scrollytelling experience that guides users through the world of tennis scores
- Visualization of all 573 possible scorelines in a best-of-three tennis match
- Analysis of scores from both ATP (men's) and WTA (women's) tours
- Historical data from 1968 to present day
- Exploration of rare and common scorelines
- Interactive explorer to filter by tour, year, and search for specific scores

## Data Sources

- ATP and WTA match data from 1968 to 2024
- Each match includes the final score, players, tournament, and surface information

## Technical Details

- Built with HTML, CSS, and JavaScript
- Visualizations created using D3.js
- Scrollytelling functionality implemented with Scrollama
- Data processing performed with R

## How to Use

1. Open `index.html` in a modern web browser
2. Scroll through the narrative to explore different aspects of tennis scores
3. Use the explorer at the end to filter and search for specific scores
4. Hover over tiles to see detailed information about each score
5. Click on tiles in the explorer to see example matches with that score

## Project Structure

- `index.html` - Main HTML file
- `css/styles.css` - CSS styles
- `js/scorigami.js` - Visualization code
- `js/scrollytelling.js` - Scrollytelling functionality
- `processed_data/` - Processed data files
- `all_matches/` - Raw match data files
- `process_historical_data.R` - R script for data processing

## Credits

Created by Evan O'Neil

Data sourced from ATP and WTA match records. 