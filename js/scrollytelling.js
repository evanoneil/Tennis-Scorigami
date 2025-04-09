// Tennis Scorigami Scrollytelling JavaScript
console.log("Scrollytelling.js loaded - version 1678234573 - Explorer multi-select fix");

// This file handles the scrollytelling functionality for the Tennis Scorigami site

// Initialize scrollama
function initScrollytelling() {
    // Initialize the scrollama instances for each section
    initAllPossibleScoresScroller();
    initScores2024Scroller();
    initHistoricalScoresScroller();
    initRareScoresScroller();
    initPopularScoresScroller();
}

// Initialize the All Possible Scores section scroller
function initAllPossibleScoresScroller() {
    const scroller = scrollama();
    
    scroller
        .setup({
            step: "#all-possible-scores .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            // Add active class to the current step
            response.element.classList.add("is-active");
            
            // Update the visualization based on the current step
            const step = response.element.dataset.step;
            updateAllScoresViz(step);
        })
        .onStepExit(response => {
            // Remove active class from the exited step
            response.element.classList.remove("is-active");
        });
    
    // Handle resize event
    window.addEventListener("resize", scroller.resize);
}

// Update the All Possible Scores visualization based on the current step
function updateAllScoresViz(step) {
    const svg = d3.select("#all-scores-viz svg");
    
    // Skip if SVG doesn't exist yet
    if (svg.empty()) {
        console.warn("All scores SVG not found, visualization may not be initialized yet");
        return;
    }
    
    if (step === "all-scores") {
        // Show all possible scores
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", "#f0f0f0");
    } else if (step === "straight-sets") {
        // Highlight straight sets victories
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => d.is_straight_sets ? "#4D9F64" : "#f0f0f0");
    } else if (step === "three-sets") {
        // Highlight three-set matches
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => !d.is_straight_sets ? "#A2F359" : "#f0f0f0");
    }
}

// Initialize the 2024 Scores section scroller
function initScores2024Scroller() {
    const scroller = scrollama();
    
    scroller
        .setup({
            step: "#scores-2024 .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            // Add active class to the current step
            response.element.classList.add("is-active");
            
            // Update the visualization based on the current step
            const step = response.element.dataset.step;
            updateScores2024Viz(step);
        })
        .onStepExit(response => {
            // Remove active class from the exited step
            response.element.classList.remove("is-active");
        });
    
    // Handle resize event
    window.addEventListener("resize", scroller.resize);
}

// Update the 2024 Scores visualization based on the current step
function updateScores2024Viz(step) {
    console.log("Updating 2024 scores visualization with step:", step);
    
    const svg = d3.select("#scores-2024-viz svg");
    
    // Skip if SVG doesn't exist yet
    if (svg.empty()) {
        console.warn("2024 scores SVG not found, visualization may not be initialized yet");
        return;
    }
    
    // Define color scale for this visualization
    const colors = ["#B8E8C2", "#A2F359", "#4D9F64", "#13472A"];
    
    // Helper function to determine color based on count
    function getColor(count) {
        console.log("getColor called with count:", count);
        if (count <= 0) return "#f0f0f0";
        
        // Use much higher thresholds for 2024 data
        if (count <= 30) return colors[0];   // rare
        if (count <= 60) return colors[1];   // uncommon
        if (count <= 120) return colors[2];  // common
        return colors[3];                    // very common
    }
    
    // Log the max count to see what we're dealing with
    if (step === "combined-2024") {
        const maxCount = d3.max(allScorelines, d => d.count_2024);
        console.log("Max count for combined 2024:", maxCount);
        
        // Log a few examples of high counts
        const highCounts = allScorelines
            .filter(d => d.count_2024 > 60)
            .sort((a, b) => b.count_2024 - a.count_2024)
            .slice(0, 5);
        
        console.log("Top 5 highest counts in 2024:", highCounts.map(d => ({
            scoreline: d.scoreline,
            count: d.count_2024
        })));
    }
    
    if (step === "matches-2024") {
        // Reset all tiles
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", "#f0f0f0");
    } else if (step === "atp-2024") {
        // Show ATP scores in 2024
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => getColor(d.count_atp_2024));
    } else if (step === "wta-2024") {
        // Show WTA scores in 2024
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => getColor(d.count_wta_2024));
    } else if (step === "combined-2024") {
        // Show combined scores in 2024
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => getColor(d.count_2024));
    }
}

// Initialize the Historical Scores section scroller
function initHistoricalScoresScroller() {
    const scroller = scrollama();
    
    scroller
        .setup({
            step: "#historical-scores .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            // Add active class to the current step
            response.element.classList.add("is-active");
            
            // Update the visualization based on the current step
            const step = response.element.dataset.step;
            updateHistoricalViz(step);
        })
        .onStepExit(response => {
            // Remove active class from the exited step
            response.element.classList.remove("is-active");
        });
    
    // Handle resize event
    window.addEventListener("resize", scroller.resize);
}

// Update the Historical Scores visualization based on the current step
function updateHistoricalViz(step) {
    console.log("Updating historical visualization with step:", step);
    
    const svg = d3.select("#historical-viz svg");
    
    // Skip if SVG doesn't exist yet
    if (svg.empty()) {
        console.warn("Historical scores SVG not found, visualization may not be initialized yet");
        return;
    }
    
    // Define color scale for this visualization
    const colors = ["#B8E8C2", "#A2F359", "#4D9F64", "#13472A"];
    
    // Helper function to determine color based on count
    function getColor(count) {
        console.log("getColor called with count:", count);
        if (count <= 0) return "#f0f0f0";
        
        // Use much higher thresholds for historical data
        if (count <= 100) return colors[0];    // rare
        if (count <= 500) return colors[1];   // uncommon
        if (count <= 1000) return colors[2];   // common
        return colors[3];                     // very common
    }
    
    // Log the max count to see what we're dealing with
    if (step === "since-1968") {
        const maxCount = d3.max(allScorelines, d => d.count_all_time);
        console.log("Max count for all time:", maxCount);
        
        // Log a few examples of high counts
        const highCounts = allScorelines
            .filter(d => d.count_all_time > 500)
            .sort((a, b) => b.count_all_time - a.count_all_time)
            .slice(0, 5);
        
        console.log("Top 5 highest counts all time:", highCounts.map(d => ({
            scoreline: d.scoreline,
            count: d.count_all_time
        })));
    }
    
    if (step === "since-1968") {
        // Show all observed scores since 1968
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => getColor(d.count_all_time));
    } else if (step === "never-seen") {
        // Highlight scores never seen
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => !d.observed_all_time ? "#FF5252" : "#f0f0f0");
    }
}

// Initialize the Rare Scores section scroller
function initRareScoresScroller() {
    const scroller = scrollama();
    
    scroller
        .setup({
            step: "#rare-scores .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            // Add active class to the current step
            response.element.classList.add("is-active");
            
            // Update the visualization based on the current step
            const step = response.element.dataset.step;
            updateRareScoresViz(step);
        })
        .onStepExit(response => {
            // Remove active class from the exited step
            response.element.classList.remove("is-active");
        });
    
    // Handle resize event
    window.addEventListener("resize", scroller.resize);
}

// Update the Rare Scores visualization based on the current step
function updateRareScoresViz(step) {
    const svg = d3.select("#rare-scores-viz svg");
    
    // Skip if SVG doesn't exist yet
    if (svg.empty()) {
        console.warn("Rare scores SVG not found, visualization may not be initialized yet");
        return;
    }
    
    // Skip if data isn't available
    if (!scorelineCounts2024 || !scorelineCountsAllTime) {
        console.warn("Scoreline counts data is missing");
        return;
    }
    
    // Get the rarest scores (count = 1)
    const rareScores2024 = scorelineCounts2024
        .filter(d => d.total_count === 1)
        .map(d => d.scoreline);
    
    const rareScoresAllTime = scorelineCountsAllTime
        .filter(d => d.total_count === 1)
        .map(d => d.scoreline);
    
    if (step === "rarest-2024") {
        // Show rarest scores in 2024
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => rareScores2024.includes(d.scoreline) ? "#FF9800" : "#f0f0f0");
    } else if (step === "rarest-all-time") {
        // Show rarest scores of all time
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => rareScoresAllTime.includes(d.scoreline) ? "#9C27B0" : "#f0f0f0");
    }
}

// Initialize the Popular Scores section scroller
function initPopularScoresScroller() {
    const scroller = scrollama();
    
    scroller
        .setup({
            step: "#popular-scores .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            // Add active class to the current step
            response.element.classList.add("is-active");
            
            // Update the visualization based on the current step
            const step = response.element.dataset.step;
            updatePopularScoresViz(step);
        })
        .onStepExit(response => {
            // Remove active class from the exited step
            response.element.classList.remove("is-active");
        });
    
    // Handle resize event
    window.addEventListener("resize", scroller.resize);
}

// Update the Popular Scores visualization based on the current step
function updatePopularScoresViz(step) {
    const svg = d3.select("#popular-scores-viz svg");
    
    // Skip if SVG doesn't exist yet
    if (svg.empty()) {
        console.warn("Popular scores SVG not found, visualization may not be initialized yet");
        return;
    }
    
    // Skip if data isn't available
    if (!scorelineCounts2024 || !scorelineCountsAllTime) {
        console.warn("Scoreline counts data is missing");
        return;
    }
    
    // Get the most popular scores (top 10)
    const popularScores2024 = scorelineCounts2024
        .sort((a, b) => b.total_count - a.total_count)
        .slice(0, 10)
        .map(d => d.scoreline);
    
    const popularScoresAllTime = scorelineCountsAllTime
        .sort((a, b) => b.total_count - a.total_count)
        .slice(0, 10)
        .map(d => d.scoreline);
    
    if (step === "popular-2024") {
        // Show most popular scores in 2024
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => popularScores2024.includes(d.scoreline) ? "#FF9800" : "#f0f0f0");
    } else if (step === "popular-all-time") {
        // Show most popular scores of all time
        svg.selectAll(".score-tile")
            .transition()
            .duration(500)
            .attr("fill", d => popularScoresAllTime.includes(d.scoreline) ? "#9C27B0" : "#f0f0f0");
    }
}

// Add scroll indicator animation
function setupScrollIndicator() {
    const scrollIndicator = document.querySelector(".scroll-indicator");
    
    if (scrollIndicator) {
        window.addEventListener("scroll", () => {
            const scrollPosition = window.scrollY;
            
            // Hide the scroll indicator when the user starts scrolling
            if (scrollPosition > 100) {
                scrollIndicator.style.opacity = "0";
            } else {
                scrollIndicator.style.opacity = "1";
            }
        });
    }
}

// Initialize everything when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Wait for the data to load before initializing scrollytelling
    const checkDataLoaded = setInterval(() => {
        if (allScorelines.length > 0) {
            clearInterval(checkDataLoaded);
            
            // Make sure all visualizations are created first
            console.log("Initializing visualizations...");
            
            // Check if visualizations exist, if not create them
            if (d3.select("#all-scores-viz svg").empty()) {
                console.log("Creating All Scores visualization...");
                createAllScoresViz();
            }
            
            if (d3.select("#scores-2024-viz svg").empty()) {
                console.log("Creating 2024 Scores visualization...");
                createScores2024Viz();
            }
            
            if (d3.select("#historical-viz svg").empty()) {
                console.log("Creating Historical visualization...");
                createHistoricalViz();
            }
            
            if (d3.select("#rare-scores-viz svg").empty()) {
                console.log("Creating Rare Scores visualization...");
                createRareScoresViz();
            }
            
            if (d3.select("#popular-scores-viz svg").empty()) {
                console.log("Creating Popular Scores visualization...");
                createPopularScoresViz();
            }
            
            if (d3.select("#explorer-viz svg").empty()) {
                console.log("Creating Explorer visualization...");
                createExplorerViz();
            }
            
            // Now initialize scrollytelling
            console.log("Initializing scrollytelling...");
            initScrollytelling();
            setupScrollIndicator();
        }
    }, 100);
}); 