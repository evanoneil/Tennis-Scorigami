// Tennis Scorigami Narrative JavaScript
// This file handles the narrative flow and visualization updates

console.log("Narrative.js loaded - version 20250425 - Updated for new layout");

// Global variables
let currentStep = 1;
let totalSteps = 0;
let narrativeSteps = [];
let currentStepIndex = 0;
const steps = [
    "all-scores",
    "straight-sets",
    "three-sets",
    "atp-2024",
    "wta-2024",
    "combined-2024",
    "since-1968",
    "never-seen",
    "rarest-2024",
    "rarest-all-time",
    "popular-2024",
    "popular-all-time",
    "explorer-intro"
];

// Initialize the narrative functionality
function initNarrative() {
    try {
        console.log("Initializing narrative functionality");
        
        // Set up event listeners with error handling
        const startExploringBtn = document.getElementById("start-exploring");
        if (startExploringBtn) {
            startExploringBtn.addEventListener("click", startNarrative);
            console.log("Start exploring button initialized");
        } else {
            console.error("Start exploring button not found");
        }
        
        const prevStepBtn = document.getElementById("prev-step");
        if (prevStepBtn) {
            prevStepBtn.addEventListener("click", goToPreviousStep);
            console.log("Previous step button initialized");
        } else {
            console.error("Previous step button not found");
        }
        
        const nextStepBtn = document.getElementById("next-step");
        if (nextStepBtn) {
            nextStepBtn.addEventListener("click", goToNextStep);
            console.log("Next step button initialized");
        } else {
            console.error("Next step button not found");
        }
        
        const backToNarrativeBtn = document.getElementById("back-to-narrative");
        if (backToNarrativeBtn) {
            backToNarrativeBtn.addEventListener("click", backToNarrative);
            console.log("Back to narrative button initialized");
        } else {
            console.error("Back to narrative button not found");
        }

        // Add event listener for the Go to Explorer button dynamically
        document.addEventListener('click', function(event) {
            if (event.target && event.target.id === 'go-to-explorer') {
                goToExplorer();
                console.log("Go to explorer button clicked");
            }
        });
        
        // Create the main visualization container
        createMainVisualization();
        
        console.log("Narrative initialization complete");
    } catch (error) {
        console.error("Error initializing narrative:", error);
    }
}

// Start the narrative journey
function startNarrative() {
    try {
        console.log("Starting narrative journey");
        
        // Hide intro section
        const introSection = document.getElementById("intro");
        if (introSection) {
            introSection.classList.add("hidden");
            console.log("Intro section hidden");
        } else {
            console.error("Intro section not found");
        }
        
        // Show narrative section
        const narrativeSection = document.getElementById("narrative-visualization");
        if (narrativeSection) {
            narrativeSection.classList.remove("hidden");
            console.log("Narrative section shown");
        } else {
            console.error("Narrative section not found");
        }
        
        // Set first step as active
        currentStepIndex = 0;
        updateStep();
    } catch (error) {
        console.error("Error starting narrative:", error);
    }
}

// Go to the previous step
function goToPreviousStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        updateStep();
    }
}

// Go to the next step
function goToNextStep() {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        updateStep();
    } else {
        // If we're at the last step (explorer intro), go to the explorer
        goToExplorer();
    }
}

// Update the current step
function updateStep() {
    try {
        console.log(`Updating to step ${currentStepIndex + 1}: ${steps[currentStepIndex]}`);
        
        // Update navigation buttons
        const prevStepBtn = document.getElementById("prev-step");
        if (prevStepBtn) {
            prevStepBtn.disabled = (currentStepIndex === 0);
        } else {
            console.error("Previous step button not found");
        }
        
        const nextStepBtn = document.getElementById("next-step");
        if (nextStepBtn) {
            if (currentStepIndex === steps.length - 1) {
                // Hide next button on the last step since we have a dedicated explorer button
                nextStepBtn.style.display = "none";
            } else {
                nextStepBtn.style.display = "";
                nextStepBtn.textContent = "NEXT";
            }
        } else {
            console.error("Next step button not found");
        }
        
        // Hide all steps
        const allSteps = document.querySelectorAll(".narrative-step");
        if (allSteps.length > 0) {
            allSteps.forEach(step => step.classList.remove("active"));
        } else {
            console.error("No narrative steps found");
        }
        
        // Show current step
        const currentStep = document.querySelector(`.narrative-step[data-step="${steps[currentStepIndex]}"]`);
        if (currentStep) {
            currentStep.classList.add("active");
        } else {
            console.error(`Step with data-step="${steps[currentStepIndex]}" not found`);
        }
        
        // Update visualization based on current step
        updateVisualization(steps[currentStepIndex]);
    } catch (error) {
        console.error("Error updating step:", error);
    }
}

// Go to the explorer section
function goToExplorer() {
    try {
        console.log("Going to explorer section");
        
        // In the future, this will navigate to a separate explorer page
        // For now, continue with the existing functionality
        
        // Hide narrative section
        const narrativeSection = document.getElementById("narrative-visualization");
        if (narrativeSection) {
            narrativeSection.classList.add("hidden");
            console.log("Narrative section hidden");
        } else {
            console.error("Narrative section not found");
        }
        
        // Show explorer section
        const explorerSection = document.getElementById("explorer");
        if (explorerSection) {
            explorerSection.classList.remove("hidden");
            console.log("Explorer section shown");
        } else {
            console.error("Explorer section not found");
        }
        
        // In the future, this will be: window.location.href = 'explorer.html';
    } catch (error) {
        console.error("Error going to explorer:", error);
    }
}

// Go back to the narrative section
function backToNarrative() {
    try {
        console.log("Going back to narrative section");
        
        // Hide explorer section
        const explorerSection = document.getElementById("explorer");
        if (explorerSection) {
            explorerSection.classList.add("hidden");
            console.log("Explorer section hidden");
        } else {
            console.error("Explorer section not found");
        }
        
        // Show narrative section
        const narrativeSection = document.getElementById("narrative-visualization");
        if (narrativeSection) {
            narrativeSection.classList.remove("hidden");
            console.log("Narrative section shown");
        } else {
            console.error("Narrative section not found");
        }
        
        // Set to the last narrative step (explorer intro)
        currentStepIndex = steps.length - 1;
        updateStep();
    } catch (error) {
        console.error("Error going back to narrative:", error);
    }
}

// Create the main visualization that will be updated throughout the narrative
function createMainVisualization() {
    console.log("Creating main visualization");
    
    // Get the container dimensions
    const container = d3.select("#main-viz");
    
    // Clear any existing content completely
    container.html("");
    
    // Get the container's dimensions
    const containerRect = container.node().getBoundingClientRect();
    const width = containerRect.width || 900; // Default to 900 if can't get width
    const height = containerRect.height || 600; // Default to 600 if can't get height
    
    console.log(`Visualization container dimensions: ${width}x${height}`);
    
    // Create a fresh SVG element
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    
    return svg;
}

// Update the visualization based on the current step
function updateVisualization(step) {
    console.log(`Updating visualization for step: ${step}`);
    
    try {
        // Get the SVG element
        const svg = createMainVisualization();
        
        // Clear any existing visualization
        clearVisualization(svg);
        
        // Update based on the current step
        if (step === "all-scores") {
            updateAllScoresViz(svg);
        } else if (step === "straight-sets") {
            updateStraightSetsViz(svg);
        } else if (step === "three-sets") {
            updateThreeSetsViz(svg);
        } else if (step === "atp-2024") {
            update2024Viz(svg, "atp");
        } else if (step === "wta-2024") {
            update2024Viz(svg, "wta");
        } else if (step === "combined-2024") {
            update2024Viz(svg, "all");
        } else if (step === "since-1968") {
            updateHistoricalViz(svg, "all");
        } else if (step === "never-seen") {
            updateHistoricalViz(svg, "never");
        } else if (step === "rarest-2024") {
            updateRareScoresViz(svg, "2024");
        } else if (step === "rarest-all-time") {
            updateRareScoresViz(svg, "all-time");
        } else if (step === "popular-2024") {
            updatePopularScoresViz(svg, "2024");
        } else if (step === "popular-all-time") {
            updatePopularScoresViz(svg, "all-time");
        } else if (step === "explorer-intro") {
            updateExplorerPreview(svg);
        } else {
            showPlaceholder(svg, "Visualization not available for this step");
        }
        
        console.log(`Visualization updated for step: ${step}`);
    } catch (error) {
        console.error(`Error updating visualization for step ${step}:`, error);
    }
}

// Update visualization for all scores
function updateAllScoresViz(svg) {
    console.log("Updating all scores visualization");
    
    try {
        if (typeof prepareGridData === 'function' && 
            typeof createScoreGrid === 'function' && 
            Array.isArray(allScorelines) && 
            allScorelines.length > 0) {
            
            console.log("Creating grid with all scorelines:", allScorelines.length);
            
            // Create grid data
            const gridData = prepareGridData(allScorelines);
            
            // Create the grid visualization directly in the SVG
            createScoreGrid(svg, gridData, svg.attr("width"), svg.attr("height"), "all-scores");
            
            console.log("All scores visualization created successfully");
        } else {
            console.error("Required functions or data not available for all scores visualization");
            showPlaceholder(svg, "All Possible Scores Visualization");
        }
    } catch (error) {
        console.error("Error creating all scores visualization:", error);
        showPlaceholder(svg, "Error creating visualization");
    }
}

// Update visualization for straight sets matches
function updateStraightSetsViz(svg) {
    console.log("Updating straight sets visualization");
    
    // Create visualization for straight sets
    if (typeof prepareGridData === "function" && typeof createScoreGrid === "function") {
        try {
            console.log("Creating straight sets visualization");
            
            // Create a visualization where straight sets are highlighted
            const gridData = prepareGridData(allScorelines);
            createScoreGrid(svg, gridData, svg.attr("width"), svg.attr("height"), "straight-sets");
            
            console.log("Straight sets visualization created successfully");
        } catch (error) {
            console.error("Error creating straight sets visualization:", error);
            showPlaceholder(svg, "Error creating visualization");
        }
    } else {
        showPlaceholder(svg, "Straight Sets Visualization");
    }
}

// Update visualization for three-set matches
function updateThreeSetsViz(svg) {
    console.log("Updating three-sets visualization");
    
    // Create visualization for three-set matches
    if (typeof prepareGridData === "function" && typeof createScoreGrid === "function") {
        try {
            console.log("Creating three-sets visualization");
            
            // Create a visualization where three-set matches are highlighted
            const gridData = prepareGridData(allScorelines);
            createScoreGrid(svg, gridData, svg.attr("width"), svg.attr("height"), "three-sets");
            
            console.log("Three-sets visualization created successfully");
        } catch (error) {
            console.error("Error creating three-sets visualization:", error);
            showPlaceholder(svg, "Error creating visualization");
        }
    } else {
        showPlaceholder(svg, "Three-Sets Visualization");
    }
}

// Update visualization for 2024 scores
function update2024Viz(svg, filter) {
    console.log(`Updating 2024 visualization with filter: ${filter}`);
    
    // Create visualization for 2024 scores with the specified filter
    if (typeof prepareGridData === "function" && typeof createScoreGrid === "function") {
        try {
            console.log("Creating 2024 visualization with filter:", filter);
            
            // Use all scorelines but mark which ones are observed in 2024
            let filteredScores = [...allScorelines];
            
            // Log initial data state
            console.log(`Initial allScorelines sample:`, filteredScores.slice(0, 3));
            
            // Validate allScorelines data
            if (!filteredScores || filteredScores.length === 0) {
                console.error("Error: allScorelines is empty or invalid");
                showPlaceholder(svg, "Error: Data not available");
                return;
            }
            
            // Create a custom mode for createScoreGrid based on the filter
            let vizMode = "2024";
            
            // Filter scores based on the specified filter
            if (filter === "atp") {
                // Only ATP scores - Use count_atp_2024 > 0 to determine observed
                filteredScores.forEach(score => {
                    // Ensure count_atp_2024 is a valid number
                    if (typeof score.count_atp_2024 !== 'number') {
                        score.count_atp_2024 = parseInt(score.count_atp_2024) || 0;
                    }
                    
                    score.observed = score.count_atp_2024 > 0;
                    // IMPORTANT: Set the count_2024 to count_atp_2024 to ensure colors reflect ATP data
                    score.count_2024 = score.count_atp_2024;
                    // Also set observed_2024 for createScoreGrid function
                    score.observed_2024 = score.observed;
                });
                // Use ATP-specific mode with standard break points
                vizMode = "atp-2024";
                console.log("ATP filter applied, sample scores:", filteredScores.slice(0, 3).map(s => 
                    ({ scoreline: s.scoreline, count: s.count_2024, observed: s.observed_2024 })));
            } else if (filter === "wta") {
                // Only WTA scores - Use count_wta_2024 > 0 to determine observed
                filteredScores.forEach(score => {
                    // Ensure count_wta_2024 is a valid number
                    if (typeof score.count_wta_2024 !== 'number') {
                        score.count_wta_2024 = parseInt(score.count_wta_2024) || 0;
                    }
                    
                    score.observed = score.count_wta_2024 > 0;
                    // IMPORTANT: Set the count_2024 to count_wta_2024 to ensure colors reflect WTA data
                    score.count_2024 = score.count_wta_2024;
                    // Also set observed_2024 for createScoreGrid function
                    score.observed_2024 = score.observed;
                });
                // Use WTA-specific mode with adjusted break points
                vizMode = "wta-2024";
                console.log("WTA filter applied, sample scores:", filteredScores.slice(0, 3).map(s => 
                    ({ scoreline: s.scoreline, count: s.count_2024, observed: s.observed_2024 })));
            } else {
                // All 2024 scores (ATP and WTA combined) - No change needed, original data is already combined
                filteredScores.forEach(score => {
                    // Ensure count_atp_2024 and count_wta_2024 are valid numbers
                    if (typeof score.count_atp_2024 !== 'number') {
                        score.count_atp_2024 = parseInt(score.count_atp_2024) || 0;
                    }
                    if (typeof score.count_wta_2024 !== 'number') {
                        score.count_wta_2024 = parseInt(score.count_wta_2024) || 0;
                    }
                    
                    // IMPORTANT: For combined view, explicitly set count_2024 to the sum of ATP and WTA
                    // This ensures we properly see scores that are "Very Common" when combining both tours
                    score.count_2024 = score.count_atp_2024 + score.count_wta_2024;
                    
                    // Set observed flag based on the combined count
                    score.observed = score.count_2024 > 0;
                    // Also set observed_2024 for createScoreGrid function
                    score.observed_2024 = score.observed;
                });
                
                // Log the highest combined counts for debugging
                const highestCounts = [...filteredScores]
                    .filter(s => s.count_2024 > 0)
                    .sort((a, b) => b.count_2024 - a.count_2024)
                    .slice(0, 10);
                    
                console.log("Top 10 combined counts:", highestCounts.map(s => ({
                    scoreline: s.scoreline,
                    count: s.count_2024,
                    atp: s.count_atp_2024,
                    wta: s.count_wta_2024
                })));
                
                // Log count distribution for debugging
                const countDistribution = {
                    "1-50": filteredScores.filter(s => s.count_2024 >= 1 && s.count_2024 <= 50).length,
                    "51-100": filteredScores.filter(s => s.count_2024 >= 51 && s.count_2024 <= 100).length,
                    "101-200": filteredScores.filter(s => s.count_2024 >= 101 && s.count_2024 <= 200).length,
                    "201+": filteredScores.filter(s => s.count_2024 >= 201).length
                };
                console.log("Combined count distribution:", countDistribution);
                
                // Explicitly set vizMode for combined view
                vizMode = "2024";
                
                console.log("Combined filter applied, sample scores:", filteredScores.slice(0, 3).map(s => 
                    ({ scoreline: s.scoreline, count: s.count_2024, observed: s.observed_2024 })));
            }
            
            // Count number of observed scores for this filter
            const observedCount = filteredScores.filter(score => score.observed_2024).length;
            console.log(`Total observed scores for ${filter}: ${observedCount}`);
            
            // Prepare grid data
            const gridData = prepareGridData(filteredScores);
            console.log(`Grid data prepared with ${gridData.length} items`);
            
            // Create the visualization with the appropriate mode
            createScoreGrid(svg, gridData, svg.attr("width"), svg.attr("height"), vizMode);
            
            console.log("2024 visualization created successfully");
        } catch (error) {
            console.error("Error creating 2024 visualization:", error);
            showPlaceholder(svg, "Error creating visualization");
        }
    } else {
        console.error("Required functions not available: prepareGridData or createScoreGrid");
        showPlaceholder(svg, "Error: Required functions not available");
    }
}

// Update visualization for historical scores
function updateHistoricalViz(svg, filter) {
    console.log(`Updating historical visualization with filter: ${filter}`);
    
    try {
        if (typeof prepareGridData !== 'function' || typeof createScoreGrid !== 'function') {
            console.error("Required functions not found");
            showPlaceholder(svg, "Error: Required functions not found");
            return;
        }
        
        // Filter scores based on the specified filter
        let filteredScores = [...allScorelines];
        
        // Set visualization mode
        let vizMode = "historical";
        
        if (filter === "all") {
            // Mark scores that have been observed historically
            filteredScores.forEach(score => {
                score.observed = score.count_all_time > 0;
                score.observed_all_time = score.count_all_time > 0;
            });
        } else if (filter === "never") {
            // Mark scores that have never been observed
            filteredScores.forEach(score => {
                score.observed = score.count_all_time === 0;
                // Make sure observed_all_time is also properly set
                score.observed_all_time = score.count_all_time > 0;
                // Add a special property for never-seen scores
                score.neverSeen = score.count_all_time === 0;
            });
            // Use a special mode for never-seen scores
            vizMode = "never-seen";
            
            // Log how many never-seen scores we have
            const neverSeenCount = filteredScores.filter(score => score.count_all_time === 0).length;
            console.log(`Number of never-seen scores: ${neverSeenCount}`);
        }
        
        // Prepare grid data
        const gridData = prepareGridData(filteredScores);
        
        // Create the visualization with the appropriate mode
        createScoreGrid(svg, gridData, svg.attr("width"), svg.attr("height"), vizMode);
        
        console.log(`Historical visualization created with ${filteredScores.length} scores, mode: ${vizMode}`);
    } catch (error) {
        console.error("Error updating historical visualization:", error);
        showPlaceholder(svg, "Error creating visualization");
    }
}

// Update visualization for rare scores
function updateRareScoresViz(svg, period) {
    console.log(`Updating rare scores visualization for period: ${period}`);
    
    try {
        if (typeof prepareGridData !== 'function' || typeof createScoreGrid !== 'function') {
            console.error("Required functions not found");
            showPlaceholder(svg, "Error: Required functions not found");
            return;
        }
        
        // Use all scorelines but mark which ones are rare
        let filteredScores = [...allScorelines];
        
        // Mark rare scores based on period
        filteredScores.forEach(score => {
            score.isRare2024 = false;
            score.isRareAllTime = false;
        });
        
        if (period === "2024") {
            // Mark scores that occurred exactly once in 2024
            filteredScores.forEach(score => {
                score.isRare2024 = score.count_2024 === 1;
            });
            console.log("Marking rare 2024 scores");
        } else if (period === "all-time") {
            // Mark scores that occurred exactly once all-time
            filteredScores.forEach(score => {
                score.isRareAllTime = score.count_all_time === 1;
            });
            console.log("Marking rare all-time scores");
        }
        
        // Prepare grid data
        const gridData = prepareGridData(filteredScores);
        
        // Create the visualization
        createScoreGrid(svg, gridData, svg.attr("width"), svg.attr("height"), "rare");
        
        console.log(`Rare scores visualization created with ${filteredScores.length} scores`);
    } catch (error) {
        console.error("Error updating rare scores visualization:", error);
        showPlaceholder(svg, "Error creating visualization");
    }
}

// Update visualization for popular scores
function updatePopularScoresViz(svg, period) {
    console.log(`Updating popular scores visualization for period: ${period}`);
    
    try {
        if (typeof prepareGridData !== 'function' || typeof createScoreGrid !== 'function') {
            console.error("Required functions not found");
            showPlaceholder(svg, "Error: Required functions not found");
            return;
        }
        
        // Use all scorelines
        let filteredScores = [...allScorelines];
        
        // Reset popular flags
        filteredScores.forEach(score => {
            score.isPopular2024 = false;
            score.isPopularAllTime = false;
        });
        
        // Determine threshold for popular scores (top 10%)
        let threshold;
        if (period === "2024") {
            // Get scores that occurred in 2024
            const scores2024 = filteredScores.filter(score => score.count_2024 > 0);
            // Sort by count (descending)
            scores2024.sort((a, b) => b.count_2024 - a.count_2024);
            // Take top 10%
            threshold = scores2024[Math.floor(scores2024.length * 0.1)]?.count_2024 || 0;
            
            // Mark popular scores
            filteredScores.forEach(score => {
                score.isPopular2024 = score.count_2024 >= threshold;
            });
            
            console.log(`Marking popular 2024 scores with threshold: ${threshold}`);
        } else if (period === "all-time") {
            // Get scores that occurred all-time
            const scoresAllTime = filteredScores.filter(score => score.count_all_time > 0);
            // Sort by count (descending)
            scoresAllTime.sort((a, b) => b.count_all_time - a.count_all_time);
            // Take top 10%
            threshold = scoresAllTime[Math.floor(scoresAllTime.length * 0.1)]?.count_all_time || 0;
            
            // Mark popular scores
            filteredScores.forEach(score => {
                score.isPopularAllTime = score.count_all_time >= threshold;
            });
            
            console.log(`Marking popular all-time scores with threshold: ${threshold}`);
        }
        
        // Prepare grid data
        const gridData = prepareGridData(filteredScores);
        
        // Create the visualization
        createScoreGrid(svg, gridData, svg.attr("width"), svg.attr("height"), "popular");
        
        console.log(`Popular scores visualization created with ${filteredScores.length} scores`);
    } catch (error) {
        console.error("Error updating popular scores visualization:", error);
        showPlaceholder(svg, "Error creating visualization");
    }
}

// Update visualization for explorer preview
function updateExplorerPreview(svg) {
    console.log("Updating explorer preview");
    
    // No visualization needed on this slide anymore as it will link to a separate page
    clearVisualization(svg);
    
    // The button will handle navigation to the explorer
    console.log("Explorer preview slide updated - visualization removed");
}

// Clear the visualization
function clearVisualization(svg) {
    console.log("Clearing visualization");
    svg.selectAll("*").remove();
}

// Show a placeholder when visualization functions are not available
function showPlaceholder(svg, text) {
    svg.append("rect")
        .attr("x", 100)
        .attr("y", 100)
        .attr("width", 800)
        .attr("height", 400)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "#ccc");
    
    svg.append("text")
        .attr("x", 500)
        .attr("y", 300)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .text(text);
}

// Initialize when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("Narrative.js: DOM content loaded");
    
    // Check if we need to wait for data loading
    if (typeof loadData === "function") {
        console.log("Narrative.js: Waiting for data to load");
        
        // Store the original initVisualizations function
        const originalInitVisualizations = window.initVisualizations;
        
        // Override initVisualizations to also initialize our narrative
        window.initVisualizations = function() {
            console.log("Narrative.js: Data loaded, initializing visualizations");
            
            // Call the original initialization function
            if (typeof originalInitVisualizations === "function") {
                originalInitVisualizations();
            }
            
            // Check if data is available
            if (typeof allScorelines !== 'undefined' && allScorelines.length > 0) {
                console.log("Narrative.js: Data is available, scorelines count:", allScorelines.length);
                
                // Wait a short time to ensure DOM is updated
                setTimeout(() => {
                    // Initialize the narrative
                    console.log("Narrative.js: Initializing narrative");
                    initNarrative();
                }, 100);
            } else {
                console.error("Narrative.js: Data not available after initialization");
                
                // Show error message
                document.body.innerHTML = `
                    <div class="error" style="max-width: 600px; margin: 100px auto; padding: 20px; background-color: #fff3f3; border: 1px solid #ffcaca; border-radius: 5px; text-align: center;">
                        <h2 style="color: #d32f2f;">Error Loading Tennis Scorigami Data</h2>
                        <p style="margin-bottom: 15px;">Data could not be loaded properly.</p>
                        <p>Please try the following:</p>
                        <ul style="text-align: left; margin: 15px auto; max-width: 400px;">
                            <li>Refresh the page to try again</li>
                            <li>Check your internet connection</li>
                            <li>Clear your browser cache</li>
                            <li>Try a different browser</li>
                        </ul>
                        <button onclick="location.reload()" style="padding: 10px 20px; background-color: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Reload Page
                        </button>
                    </div>
                `;
            }
        };
    } else {
        // If loadData doesn't exist, show error
        console.error("Narrative.js: Data loading function not found");
        
        // Show error message
        document.body.innerHTML = `
            <div class="error" style="max-width: 600px; margin: 100px auto; padding: 20px; background-color: #fff3f3; border: 1px solid #ffcaca; border-radius: 5px; text-align: center;">
                <h2 style="color: #d32f2f;">Error Loading Tennis Scorigami</h2>
                <p style="margin-bottom: 15px;">Required functions not found.</p>
                <p>Please try the following:</p>
                <ul style="text-align: left; margin: 15px auto; max-width: 400px;">
                    <li>Refresh the page to try again</li>
                    <li>Check your internet connection</li>
                    <li>Clear your browser cache</li>
                    <li>Try a different browser</li>
                </ul>
                <button onclick="location.reload()" style="padding: 10px 20px; background-color: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
    }
}); 