// Tennis Scorigami Visualization JavaScript
console.log("Tennis Scorigami Visualization v20250423 loaded - Axis titles removed, maximized space");
console.log("Tennis Scorigami Visualization v20250424 loaded - Legend moved above visualization");

// This file handles the data loading and visualization for the Tennis Scorigami site

// Global variables
let allScorelines = [];
let allMatches = [];
let yearCounts = [];
let scorelineCounts2024 = [];
let scorelineCountsAllTime = [];

// Color scales - defined globally but updated for each visualization
const defaultColors = ["#f0f0f0", "#B8E8C2", "#A2F359", "#4D9F64", "#13472A"];

// Add this at the beginning of the file, right after any imports or initial comments
if (typeof d3.nest === 'undefined') {
    // Polyfill for d3.nest() in D3.js v7
    d3.nest = function() {
        let keys = [], sortKeys = [], sortValues, rollup, nest;
        
        function addKey(f) {
            keys.push(f);
            return nest;
        }
        
        function addSortKey(f) {
            sortKeys.push(f);
            return nest;
        }
        
        function setRollup(f) {
            rollup = f;
            return nest;
        }
        
        function map(array) {
            const result = {};
            for (const item of array) {
                let current = result;
                for (let i = 0; i < keys.length - 1; i++) {
                    const keyValue = keys[i](item);
                    if (!current[keyValue]) current[keyValue] = {};
                    current = current[keyValue];
                }
                const lastKey = keys[keys.length - 1](item);
                if (!current[lastKey]) current[lastKey] = [];
                current[lastKey].push(item);
            }
            
            if (rollup) {
                const rollupResult = {};
                for (const key in result) {
                    rollupResult[key] = rollup(result[key]);
                }
                return rollupResult;
            }
            
            return result;
        }
        
        function entries(array) {
            const result = map(array);
            return map_entries(result);
        }
        
        function map_entries(obj) {
            const mapped = [];
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    if (Array.isArray(value)) {
                        mapped.push({key: key, values: value});
                    } else {
                        mapped.push({key: key, values: map_entries(value)});
                    }
                }
            }
            
            // Apply sortKeys if any
            if (sortKeys.length > 0) {
                mapped.sort((a, b) => {
                    for (const sort of sortKeys) {
                        const order = sort(a.key, b.key);
                        if (order !== 0) return order;
                    }
                    return 0;
                });
            }
            
            return mapped;
        }
        
        nest = {
            key: addKey,
            sortKeys: addSortKey,
            sortValues: function(f) { sortValues = f; return nest; },
            rollup: setRollup,
            map: map,
            entries: entries
        };
        
        return nest;
    };
}

// Load all data files
async function loadData() {
    try {
        // Show loading indicator
        document.body.insertAdjacentHTML('beforeend', 
            `<div id="loading-indicator" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
            background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.2); z-index: 9999;">
                <h3>Loading Tennis Scorigami Data...</h3>
                <p>Please wait while we load the visualization data.</p>
            </div>`);
        
        console.log("Starting data loading...");
        
        const [scorelinesData, matchesData, yearCountsData, counts2024Data, countsAllTimeData] = await Promise.all([
            d3.csv("processed_data/all_scorelines.csv").catch(error => { 
                console.error("Error loading all_scorelines.csv:", error); 
                throw new Error(`Failed to load all_scorelines.csv: ${error.message}`);
            }),
            d3.csv("processed_data/all_tennis_matches.csv").catch(error => { 
                console.error("Error loading all_tennis_matches.csv:", error); 
                throw new Error(`Failed to load all_tennis_matches.csv: ${error.message}`);
            }),
            d3.csv("processed_data/year_counts.csv").catch(error => { 
                console.error("Error loading year_counts.csv:", error); 
                throw new Error(`Failed to load year_counts.csv: ${error.message}`);
            }),
            d3.csv("processed_data/scoreline_counts_2024.csv").catch(error => { 
                console.error("Error loading scoreline_counts_2024.csv:", error); 
                throw new Error(`Failed to load scoreline_counts_2024.csv: ${error.message}`);
            }),
            d3.csv("processed_data/scoreline_counts_all_time.csv").catch(error => { 
                console.error("Error loading scoreline_counts_all_time.csv:", error); 
                throw new Error(`Failed to load scoreline_counts_all_time.csv: ${error.message}`);
            })
        ]);
        
        console.log("Data files loaded successfully");
        
        // Check if any data is missing or empty
        if (!scorelinesData || !scorelinesData.length) {
            throw new Error("All scorelines data is empty or invalid");
        }
        if (!matchesData || !matchesData.length) {
            throw new Error("Tennis matches data is empty or invalid");
        }
        if (!yearCountsData || !yearCountsData.length) {
            throw new Error("Year counts data is empty or invalid");
        }
        if (!counts2024Data || !counts2024Data.length) {
            throw new Error("2024 scoreline counts data is empty or invalid");
        }
        if (!countsAllTimeData || !countsAllTimeData.length) {
            throw new Error("All-time scoreline counts data is empty or invalid");
        }
        
        console.log("Processing data...");
        
        // Process the data
        allScorelines = scorelinesData.map(d => ({
            ...d,
            count_all_time: +d.count_all_time,
            count_atp_all_time: +d.count_atp_all_time,
            count_wta_all_time: +d.count_wta_all_time,
            count_2024: +d.count_2024,
            count_atp_2024: +d.count_atp_2024,
            count_wta_2024: +d.count_wta_2024,
            observed_all_time: d.observed_all_time === "TRUE",
            observed_2024: d.observed_2024 === "TRUE",
            is_straight_sets: d.is_straight_sets === "TRUE",
            num_sets: +d.num_sets
        }));
        
        allMatches = matchesData;
        
        yearCounts = yearCountsData.map(d => ({
            ...d,
            year: +d.year,
            ATP: +d.ATP,
            WTA: +d.WTA,
            total: +d.total
        }));
        
        scorelineCounts2024 = counts2024Data.map(d => ({
            ...d,
            total_count: +d.total_count,
            atp_count: +d.atp_count,
            wta_count: +d.wta_count
        }));
        
        scorelineCountsAllTime = countsAllTimeData.map(d => ({
            ...d,
            total_count: +d.total_count,
            atp_count: +d.atp_count,
            wta_count: +d.wta_count
        }));
        
        console.log("Data processing complete");
        
        // Remove loading indicator
        const loadingIndicator = document.getElementById("loading-indicator");
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Initialize visualizations
        console.log("Initializing visualizations...");
        initVisualizations();
        
        // Fill in statistics
        console.log("Updating statistics...");
        updateStatistics();
        
        console.log("Initialization complete");
        
    } catch (error) {
        console.error("Error loading data:", error);
        
        // Remove loading indicator if it exists
        const loadingIndicator = document.getElementById("loading-indicator");
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Display a user-friendly error message
        document.body.innerHTML = `
            <div class="error" style="max-width: 600px; margin: 100px auto; padding: 20px; background-color: #fff3f3; border: 1px solid #ffcaca; border-radius: 5px; text-align: center;">
                <h2 style="color: #d32f2f;">Error Loading Tennis Scorigami Data</h2>
                <p style="margin-bottom: 15px;">${error.message}</p>
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
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Technical details: ${error.stack ? error.stack.split('\n')[0] : 'Unknown error'}
                </p>
            </div>
        `;
    }
}

// Initialize all visualizations
function initVisualizations() {
    console.log("Initializing visualizations for narrative approach");
    
    try {
        // Only initialize the explorer section and shared components
        // Skip the old scrollytelling visualizations
    createExplorerViz();
    
    // Populate year select dropdown
    populateYearSelect();
    
        // Create a robust tooltip div to be shared by all visualizations
        // First, remove any existing tooltip to prevent duplicates
        d3.select("#robust-tooltip").remove();
        
        // Create a new tooltip div appended to the body
        const robustTooltip = d3.select("body")
            .append("div")
            .attr("id", "robust-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "black")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "6px")
            .style("font-size", "14px")
            .style("pointer-events", "none")
            .style("z-index", "10000")
            .style("text-align", "center");
        
        // Update statistics for use in the narrative
        updateStatistics();
        
        console.log("Visualization initialization complete");
    } catch (error) {
        console.error("Error initializing visualizations:", error);
    }
}

// Update statistics in the HTML
function updateStatistics() {
    try {
        // Check if allScorelines exists
        if (!allScorelines || !allScorelines.length) {
            console.error("Scorelines data is missing or empty");
            return;
        }
        
        // Check if scorelineCounts2024 and scorelineCountsAllTime exist
        if (!scorelineCounts2024 || !scorelineCountsAllTime) {
            console.error("Scoreline counts data is missing");
            return;
        }
        
        // 2024 statistics - Update to use count_atp_2024 and count_wta_2024 > 0 for proper filtering
    const atp2024Count = allScorelines.filter(d => d.count_atp_2024 > 0).length;
    const wta2024Count = allScorelines.filter(d => d.count_wta_2024 > 0).length;
        const combined2024Count = allScorelines.filter(d => d.count_2024 > 0).length;
    const combined2024Percentage = (combined2024Count / allScorelines.length * 100).toFixed(1);
    
        // Calculate total ATP and WTA matches in 2024
        const totalATP2024Matches = allScorelines.reduce((sum, d) => sum + d.count_atp_2024, 0);
        const totalWTA2024Matches = allScorelines.reduce((sum, d) => sum + d.count_wta_2024, 0);
        const total2024Matches = totalATP2024Matches + totalWTA2024Matches;
        
        // Check if elements exist before updating
        if (document.getElementById("atp-2024-count")) {
    document.getElementById("atp-2024-count").textContent = atp2024Count;
        }
        if (document.getElementById("total-atp-2024-matches")) {
            document.getElementById("total-atp-2024-matches").textContent = totalATP2024Matches;
        }
        if (document.getElementById("wta-2024-count")) {
    document.getElementById("wta-2024-count").textContent = wta2024Count;
        }
        if (document.getElementById("total-wta-2024-matches")) {
            document.getElementById("total-wta-2024-matches").textContent = totalWTA2024Matches;
        }
        if (document.getElementById("combined-2024-count")) {
    document.getElementById("combined-2024-count").textContent = combined2024Count;
        }
        if (document.getElementById("combined-2024-percentage")) {
    document.getElementById("combined-2024-percentage").textContent = combined2024Percentage;
        }
    
    // Historical statistics
        const historicalCount = allScorelines.filter(d => d.count_all_time > 0).length;
    const neverSeenCount = allScorelines.length - historicalCount;
    
        if (document.getElementById("historical-count")) {
    document.getElementById("historical-count").textContent = historicalCount;
        }
        if (document.getElementById("never-seen-count")) {
    document.getElementById("never-seen-count").textContent = neverSeenCount;
        }
    
    // Rarest scores
    const rarestScore2024 = scorelineCounts2024
        .filter(d => d.total_count === 1)
        .sort((a, b) => a.scoreline.localeCompare(b.scoreline))[0];
    
    const rarestScoreAllTime = scorelineCountsAllTime
        .filter(d => d.total_count === 1)
        .sort((a, b) => a.scoreline.localeCompare(b.scoreline))[0];
    
        if (document.getElementById("rarest-2024")) {
    document.getElementById("rarest-2024").textContent = rarestScore2024 ? rarestScore2024.scoreline : "N/A";
        }
        if (document.getElementById("rarest-all-time")) {
    document.getElementById("rarest-all-time").textContent = rarestScoreAllTime ? rarestScoreAllTime.scoreline : "N/A";
        }
    
    // Most popular scores
    const popularScore2024 = scorelineCounts2024.sort((a, b) => b.total_count - a.total_count)[0];
    const popularScoreAllTime = scorelineCountsAllTime.sort((a, b) => b.total_count - a.total_count)[0];
    
        if (document.getElementById("popular-2024")) {
    document.getElementById("popular-2024").textContent = popularScore2024 ? popularScore2024.scoreline : "N/A";
        }
        if (document.getElementById("popular-2024-count")) {
    document.getElementById("popular-2024-count").textContent = popularScore2024 ? popularScore2024.total_count : "N/A";
        }
        if (document.getElementById("popular-all-time")) {
    document.getElementById("popular-all-time").textContent = popularScoreAllTime ? popularScoreAllTime.scoreline : "N/A";
        }
        if (document.getElementById("popular-all-time-count")) {
    document.getElementById("popular-all-time-count").textContent = popularScoreAllTime ? popularScoreAllTime.total_count : "N/A";
        }
    } catch (error) {
        console.error("Error updating statistics:", error);
    }
}

// Create visualization for all possible scores
function createAllScoresViz() {
    const container = d3.select("#all-scores-viz");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    
    // Clear previous content
    container.html("");
    
    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Define the grid layout
    const gridData = prepareGridData(allScorelines);
    
    // Create the grid visualization
    createScoreGrid(svg, gridData, width, height, "all");
}

// Create visualization for 2024 scores
function createScores2024Viz() {
    const container = d3.select("#scores-2024-viz");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    
    // Clear previous content
    container.html("");
    
    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Define the grid layout
    const gridData = prepareGridData(allScorelines);
    
    // Create the grid visualization
    createScoreGrid(svg, gridData, width, height, "2024");
}

// Create visualization for historical scores
function createHistoricalViz() {
    const container = d3.select("#historical-viz");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    
    // Clear previous content
    container.html("");
    
    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Define the grid layout
    const gridData = prepareGridData(allScorelines);
    
    // Create the grid visualization
    createScoreGrid(svg, gridData, width, height, "historical");
}

// Create visualization for rare scores
function createRareScoresViz() {
    const container = d3.select("#rare-scores-viz");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    
    // Clear previous content
    container.html("");
    
    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Check if scorelineCounts2024 and scorelineCountsAllTime exist
    if (!scorelineCounts2024 || !scorelineCountsAllTime) {
        console.error("Scoreline counts data is missing");
        return;
    }
    
    // Get the rarest scores (count = 1)
    const rareScores2024 = scorelineCounts2024
        .filter(d => d.total_count === 1)
        .map(d => d.scoreline);
    
    const rareScoresAllTime = scorelineCountsAllTime
        .filter(d => d.total_count === 1)
        .map(d => d.scoreline);
    
    // Define the grid layout
    const gridData = prepareGridData(allScorelines);
    
    // Highlight rare scores
    gridData.forEach(d => {
        d.isRare2024 = rareScores2024.includes(d.scoreline);
        d.isRareAllTime = rareScoresAllTime.includes(d.scoreline);
    });
    
    // Create the grid visualization
    createScoreGrid(svg, gridData, width, height, "rare");
}

// Create visualization for popular scores
function createPopularScoresViz() {
    const container = d3.select("#popular-scores-viz");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    
    // Clear previous content
    container.html("");
    
    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Check if scorelineCounts2024 and scorelineCountsAllTime exist
    if (!scorelineCounts2024 || !scorelineCountsAllTime) {
        console.error("Scoreline counts data is missing");
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
    
    // Define the grid layout
    const gridData = prepareGridData(allScorelines);
    
    // Highlight popular scores
    gridData.forEach(d => {
        d.isPopular2024 = popularScores2024.includes(d.scoreline);
        d.isPopularAllTime = popularScoresAllTime.includes(d.scoreline);
    });
    
    // Create the grid visualization
    createScoreGrid(svg, gridData, width, height, "popular");
}

// Create the explorer visualization
function createExplorerViz() {
    const container = d3.select("#explorer-viz");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    
    // Clear previous content
    container.html("");
    
    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Define the grid layout
    const gridData = prepareGridData(allScorelines);
    
    // Create the grid visualization
    createScoreGrid(svg, gridData, width, height, "explorer");
    
    // Add event listeners for controls
    setupExplorerControls(svg, gridData, width, height);
}

// Prepare grid data for visualization
function prepareGridData(scorelines) {
    // Check if scorelines is valid
    if (!scorelines || !Array.isArray(scorelines) || scorelines.length === 0) {
        console.error("Invalid or empty scorelines data provided to prepareGridData");
        return [];
    }
    
    console.log("Preparing grid data for", scorelines.length, "scorelines");
    
    // Log a sample of the data to understand its structure
    console.log("Sample scoreline data:", scorelines[0]);
    console.log("is_straight_sets value:", scorelines[0].is_straight_sets);
    console.log("num_sets value:", scorelines[0].num_sets);
    
    // Define the order for first set results
    const winningSetOrder = ["7-6", "7-5", "6-4", "6-3", "6-2", "6-1", "6-0"];
    const losingSetOrder = ["6-7", "5-7", "4-6", "3-6", "2-6", "1-6", "0-6"];
    const firstSetOrder = [...winningSetOrder, ...losingSetOrder];
    
    // Group by first set
    const groupedByFirstSet = d3.group(scorelines, d => d.first_set);
    console.log("Unique first sets:", Array.from(groupedByFirstSet.keys()));
    
    // Create grid data
    const gridData = [];
    
    firstSetOrder.forEach((firstSet, rowIndex) => {
        const scoresInRow = groupedByFirstSet.get(firstSet) || [];
        console.log(`First set ${firstSet}: ${scoresInRow.length} scores`);
        
        // Check if this is from the bottom half (winner lost first set)
        const isBottomHalf = losingSetOrder.includes(firstSet);
        
        // Sort by second set and third set
        scoresInRow.sort((a, b) => {
            if (a.set2_score !== b.set2_score) {
                // For bottom half, reverse the sort order
                if (isBottomHalf) {
                    return winningSetOrder.indexOf(b.set2_score) - winningSetOrder.indexOf(a.set2_score);
                } else {
                return winningSetOrder.indexOf(a.set2_score) - winningSetOrder.indexOf(b.set2_score);
                }
            }
            return (a.set3_score || "").localeCompare(b.set3_score || "");
        });
        
        // Add to grid data
        scoresInRow.forEach((score, colIndex) => {
            // Clean up NA in straight sets
            if (score.is_straight_sets && score.set3_score === "NA") {
                score.set3_score = null;
            }
            
            gridData.push({
                ...score,
                rowIndex,
                colIndex
            });
        });
    });
    
    // Log some stats about the grid data
    const rowCounts = {};
    gridData.forEach(d => {
        rowCounts[d.rowIndex] = (rowCounts[d.rowIndex] || 0) + 1;
    });
    
    console.log("Row counts:", rowCounts);
    console.log("Max scores in a row:", Math.max(...Object.values(rowCounts)));
    
    return gridData;
}

// Create the score grid visualization
function createScoreGrid(svg, gridData, width, height, mode) {
    console.log(`Creating score grid with mode: ${mode}`);
    console.log(`Grid data sample:`, gridData.slice(0, 3));
    
    if (!gridData || gridData.length === 0) {
        console.error("Invalid grid data provided to createScoreGrid");
        return;
    }
    
    // Clear any existing visualization
    svg.selectAll("*").remove();
    
    // Remove all existing labels from the entire document that might be leftover
    document.querySelectorAll('.axis-label, .viz-info').forEach(el => el.remove());
    
    // Get actual dimensions from the SVG container if width or height are not numeric
    let svgWidth = width;
    let svgHeight = height;
    
    // Check if width or height are strings (like '100%') and get actual dimensions from container
    if (typeof width !== 'number' || typeof height !== 'number' || width <= 0 || height <= 0) {
        const container = svg.node().parentNode;
        const containerRect = container.getBoundingClientRect();
        svgWidth = containerRect.width;
        svgHeight = containerRect.height;
        console.log(`Using container dimensions: ${svgWidth}x${svgHeight}`);
    }
    
    // Set margins with additional top margin for legend
    const margin = {top: 40, right: 10, bottom: 10, left: 30};
    const innerWidth = svgWidth - margin.left - margin.right;
    const innerHeight = svgHeight - margin.top - margin.bottom;
    
    // Make the SVG responsive
    svg.attr("width", "100%")
       .attr("height", "100%")
       .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
       .attr("preserveAspectRatio", "xMidYMid meet")
       .style("overflow", "visible") // Allow elements to overflow the SVG
       .style("display", "block"); // Prevent inline spacing issues
    
    // Create the main group element for the grid - centered
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .attr("class", "grid-group"); // Add class for easy selection
        
    // Store legendItems for later use
    let legendItemsForLater = [];
    
    // Define the order for first set results
    const winningSetOrder = ["7-6", "7-5", "6-4", "6-3", "6-2", "6-1", "6-0"];
    const losingSetOrder = ["6-7", "5-7", "4-6", "3-6", "2-6", "1-6", "0-6"];
    const firstSetOrder = [...winningSetOrder, ...losingSetOrder];
    
    // CALCULATE COLORS FOR EACH MODE - Using fixed thresholds for consistency
    let colorFunction;
    
    if (mode === "all-scores") {
        // Use default gray for all scores
        colorFunction = d => "white"; // Changed from #f0f0f0 to white for all cells
        legendItemsForLater = [
            { label: "All Possible Scorelines", color: "white" }
        ];
    }
    else if (mode === "straight-sets") {
        // Binary scale for straight sets victories
        colorFunction = d => {
            // Check for various possible formats of true value
            const isStraightSets = d.is_straight_sets === true || 
                                  d.is_straight_sets === 1 || 
                                  d.is_straight_sets === "true" || 
                                  d.is_straight_sets === "TRUE" || 
                                  d.is_straight_sets === "True";
            return isStraightSets ? "#4D9F64" : "white"; // Changed from #f0f0f0 to white
        };
        legendItemsForLater = [
            { label: "Straight Sets", color: "#4D9F64" },
            { label: "Three Sets", color: "white" } // Changed from #f0f0f0 to white
        ];
    }
    else if (mode === "three-sets") {
        // Binary scale for three sets matches
        colorFunction = d => {
            // Check for various possible formats of true value
            const isStraightSets = d.is_straight_sets === true || 
                                  d.is_straight_sets === 1 || 
                                  d.is_straight_sets === "true" || 
                                  d.is_straight_sets === "TRUE" || 
                                  d.is_straight_sets === "True";
            return !isStraightSets ? "#A2F359" : "white"; // Changed from #f0f0f0 to white
        };
        legendItemsForLater = [
            { label: "Three Sets", color: "#A2F359" },
            { label: "Straight Sets", color: "white" } // Changed from #f0f0f0 to white
        ];
    }
    else if (mode === "all") {
        // Binary scale for all possible scores
        colorFunction = d => {
            // Check for various possible formats of true value
            const isStraightSets = d.is_straight_sets === true || 
                                  d.is_straight_sets === 1 || 
                                  d.is_straight_sets === "true" || 
                                  d.is_straight_sets === "TRUE" || 
                                  d.is_straight_sets === "True";
            return isStraightSets ? "#4D9F64" : "white"; // Changed from #f0f0f0 to white
        };
        legendItemsForLater = [
            { label: "Straight Sets", color: "#4D9F64" },
            { label: "Three Sets", color: "white" } // Changed from #f0f0f0 to white
        ];
    } 
    else if (mode === "2024" || mode === "atp-2024" || mode === "wta-2024") {
        // Fixed scale for 2024 data
        const colors = ["#B8E8C2", "#A2F359", "#4D9F64", "#13472A"];
        
        // Check if data exists and log a sample
        if (gridData.length > 0) {
            const sampleTile = gridData[0];
            console.log(`Sample tile data for ${mode}:`, {
                scoreline: sampleTile.scoreline,
                count_2024: sampleTile.count_2024,
                observed_2024: sampleTile.observed_2024
            });
        }
        
        // Log max count for debugging
        const maxCount = d3.max(gridData, d => d.count_2024);
        console.log(`${mode} mode - Max count: ${maxCount}`);
        
        colorFunction = d => {
            // Always show all possible scores, with observed ones colored
            if (!d.observed_2024) return "white";
            
            // Check if count_2024 exists and is a number
            if (d.count_2024 === undefined || isNaN(d.count_2024)) {
                console.error(`Invalid count_2024 for ${d.scoreline}:`, d.count_2024);
                return "white";
            }
            
            const count = d.count_2024;
            
            // Use different thresholds based on ATP vs WTA data
            if (mode === "wta-2024") {
                // WTA-specific thresholds - lower than ATP due to different distribution
                if (count <= 15) return colors[0];   // rare
                if (count <= 40) return colors[1];   // uncommon
                if (count <= 70) return colors[2];   // common
                return colors[3];                    // very common
            } else if (mode === "atp-2024") {
                // ATP-specific thresholds
                if (count <= 30) return colors[0];   // rare
                if (count <= 60) return colors[1];   // uncommon
                if (count <= 120) return colors[2];  // common
                return colors[3];                    // very common
            } else {
                // Combined ATP+WTA data - use higher thresholds
                if (count <= 50) return colors[0];   // rare
                if (count <= 100) return colors[1];  // uncommon
                if (count <= 180) return colors[2];  // common
                return colors[3];                    // very common
            }
        };
        
        // Update legend based on whether we're showing ATP or WTA data
        if (mode === "wta-2024") {
            // WTA-specific legend with adjusted thresholds
            legendItemsForLater = [
                { label: "Not Observed", color: "white" },
                { label: "Rare (1-15)", color: "#B8E8C2" },
                { label: "Uncommon (16-40)", color: "#A2F359" },
                { label: "Common (41-70)", color: "#4D9F64" },
                { label: "Very Common (71+)", color: "#13472A" }
            ];
        } else if (mode === "atp-2024") {
            // ATP-specific legend
            legendItemsForLater = [
                { label: "Not Observed", color: "white" },
                { label: "Rare (1-30)", color: "#B8E8C2" },
                { label: "Uncommon (31-60)", color: "#A2F359" },
                { label: "Common (61-120)", color: "#4D9F64" },
                { label: "Very Common (121+)", color: "#13472A" }
            ];
        } else {
            // Combined data with higher thresholds
            legendItemsForLater = [
                { label: "Not Observed", color: "white" },
                { label: "Rare (1-50)", color: "#B8E8C2" },
                { label: "Uncommon (51-100)", color: "#A2F359" },
                { label: "Common (101-180)", color: "#4D9F64" },
                { label: "Very Common (181+)", color: "#13472A" }
            ];
        }
        
        console.log(`Using ${mode} mode with color scale and legend set up`);
    } 
    else if (mode === "historical" || mode === "explorer") {
        // For explorer mode, check if we're looking at a specific year
        let countProperty = "count_all_time";
        let observedProperty = "observed_all_time";
        
        if (mode === "explorer") {
            const yearSelect = document.getElementById("year-select");
            
            // Get selected years (multiple selection)
            const selectedYears = yearSelect ? 
                Array.from(yearSelect.selectedOptions).map(option => option.value) : 
                ["all"];
            
            // Handle special case: if "all" is selected along with other options, just use "all"
            const effectiveYears = selectedYears.includes("all") ? ["all"] : selectedYears;
            
            if (effectiveYears.length === 1) {
                if (effectiveYears[0] === "2024") {
                    countProperty = "count_2024";
                    observedProperty = "observed_2024";
                } else if (effectiveYears[0] !== "all") {
                    countProperty = "filtered_count";
                    observedProperty = "filtered_observed";
                }
            } else {
                // For multiple years selected
                countProperty = "filtered_count";
                observedProperty = "filtered_observed";
            }
        }
        
        // Log max count for debugging
        const maxCount = d3.max(gridData, d => d[countProperty]);
        console.log(`Historical/Explorer mode - Max count: ${maxCount}, countProperty: ${countProperty}`);
        
        // Fixed scale with much higher thresholds for historical data
        const colors = ["#B8E8C2", "#A2F359", "#4D9F64", "#13472A"];
        
        colorFunction = d => {
            // Always show all possible scores, with observed ones colored
            if (!d[observedProperty]) return "white";
            const count = d[countProperty];
            
            // Use different thresholds based on the data being displayed
            if (countProperty === "filtered_count") {
                // For specific years other than 2024, use lower thresholds
                if (count <= 5) return colors[0];     // rare
                if (count <= 20) return colors[1];    // uncommon
                if (count <= 50) return colors[2];    // common
                return colors[3];                     // very common
            } else if (countProperty === "count_2024") {
                // For 2024 data
                if (count <= 30) return colors[0];    // rare
                if (count <= 60) return colors[1];    // uncommon
                if (count <= 120) return colors[2];   // common
                return colors[3];                     // very common
            } else {
                // For all-time data
                if (count <= 100) return colors[0];   // rare
                if (count <= 500) return colors[1];   // uncommon
                if (count <= 1000) return colors[2];  // common
                return colors[3];                     // very common
            }
        };
        
        // Update legend based on the data being displayed
        if (countProperty === "filtered_count") {
            legendItemsForLater = [
                { label: "Not Observed", color: "white" },
                { label: "Rare (1-5)", color: "#B8E8C2" },
                { label: "Uncommon (6-20)", color: "#A2F359" },
                { label: "Common (21-50)", color: "#4D9F64" },
                { label: "Very Common (51+)", color: "#13472A" }
            ];
        } else if (countProperty === "count_2024") {
            legendItemsForLater = [
                { label: "Not Observed", color: "white" },
                { label: "Rare (1-30)", color: "#B8E8C2" },
                { label: "Uncommon (31-60)", color: "#A2F359" },
                { label: "Common (61-120)", color: "#4D9F64" },
                { label: "Very Common (121+)", color: "#13472A" }
            ];
        } else {
            legendItemsForLater = [
                { label: "Not Observed", color: "white" },
                { label: "Rare (1-100)", color: "#B8E8C2" },
                { label: "Uncommon (101-500)", color: "#A2F359" },
                { label: "Common (501-1000)", color: "#4D9F64" },
                { label: "Very Common (1001+)", color: "#13472A" }
            ];
        }
    } 
    else if (mode === "never-seen") {
        // Special mode for never-seen scores
        colorFunction = d => {
            // Highlight scores that have never been observed (count_all_time === 0)
            if (d.neverSeen || !d.observed_all_time) {
                return "#FF5252";  // Bright red for never-seen scores
            }
            return "white";  // Changed from #f0f0f0 to white for observed scores
        };
        
        // Create a legend for never-seen scores
        legendItemsForLater = [
            { label: "Never Seen", color: "#FF5252" },
            { label: "Observed", color: "white" }
        ];
        
        console.log("Using never-seen mode with highlighting");
    } 
    else if (mode === "rare") {
        // Colors for rare scores
        colorFunction = d => {
            // Always show all possible scores, with rare ones highlighted
            if (d.isRare2024) return "#FF9800";
            if (d.isRareAllTime) return "#9C27B0";
            return "white";
        };
        
        legendItemsForLater = [
            { label: "Not Selected", color: "white" },
            { label: "2024", color: "#FF9800" },
            { label: "All-Time", color: "#9C27B0" }
        ];
        
        console.log("Using rare mode with highlighting");
    } 
    else if (mode === "popular") {
        // Colors for popular scores
        colorFunction = d => {
            // Always show all possible scores, with popular ones highlighted
            if (d.isPopular2024) return "#FF9800";
            if (d.isPopularAllTime) return "#9C27B0";
            return "white";
        };
        
        legendItemsForLater = [
            { label: "Not Selected", color: "white" },
            { label: "2024", color: "#FF9800" },
            { label: "All-Time", color: "#9C27B0" }
        ];
        
        console.log("Using popular mode with highlighting");
    }
    
    // Create tiles with appropriate colors - No transition animation
    const tiles = g.selectAll(".score-tile")
        .data(gridData)
        .enter()
        .append("circle")
        .attr("class", "score-tile")
        .attr("cx", d => {
            // Position tiles based on their column index - center of circle
            const colIndex = d.colIndex || 0;
            const x = colIndex * (innerWidth / 56) + (innerWidth / 112); // Add half a cell width for center
            return isNaN(x) ? 0 : x;
        })
        .attr("cy", d => {
            // Center of the circle
            const rowIndex = d.rowIndex || 0;
            const y = rowIndex * (innerWidth / 56) + (innerWidth / 112); // Add half a cell height for center
            return isNaN(y) ? 0 : y;
        })
        .attr("r", () => {
            // Radius is half the tile width/height with small margin
            const radius = Math.max(1, innerWidth / 56 * 0.45); // Use 0.45 instead of 0.95/2 for spacing
            return isNaN(radius) ? 5 : radius;
        })
        .attr("fill", d => {
            // Log a sample of the coloring process
            if (d.rowIndex === 0 && d.colIndex === 0) {
                console.log("Coloring first tile:", d.scoreline);
                console.log("is_straight_sets:", d.is_straight_sets);
                console.log("num_sets:", d.num_sets);
                console.log("Color:", colorFunction(d));
            }
            return colorFunction(d);
        })
        // Add stroke for unobserved cells
        .attr("stroke", d => {
            // Determine which property to check for observed status based on the mode
            let isObserved = false;
            if (mode === "2024" || mode === "atp-2024" || mode === "wta-2024") {
                isObserved = d.observed_2024;
            } else if (mode === "historical" || mode === "explorer") {
                isObserved = d.observed_all_time;
            } else if (mode === "never-seen") {
                // For never-seen mode, we want to highlight the never-seen scores
                isObserved = d.observed_all_time;
            } else if (mode === "rare" || mode === "popular") {
                // For these modes, we consider a cell observed if it's highlighted
                isObserved = d.isRare2024 || d.isRareAllTime || d.isPopular2024 || d.isPopularAllTime;
            }
            
            // Add mid-gray stroke to unobserved cells, no stroke to observed cells
            return !isObserved ? "#DDDDDD" : "none";
        })
        .attr("stroke-width", d => {
            // Check if the cell is observed using the same logic as for stroke
            let isObserved = false;
            if (mode === "2024" || mode === "atp-2024" || mode === "wta-2024") {
                isObserved = d.observed_2024;
            } else if (mode === "historical" || mode === "explorer") {
                isObserved = d.observed_all_time;
            } else if (mode === "never-seen") {
                isObserved = d.observed_all_time;
            } else if (mode === "rare" || mode === "popular") {
                isObserved = d.isRare2024 || d.isRareAllTime || d.isPopular2024 || d.isPopularAllTime;
            }
            
            return !isObserved ? "1px" : "0";
        })
        .style("cursor", "pointer");
    
    // Add row labels (first set scores) with better alignment
    g.selectAll(".row-label")
        .data(firstSetOrder)
        .enter()
        .append("text")
        .attr("class", "row-label")
        .attr("x", -10)
        .attr("y", (d, i) => {
            const y = i * (innerWidth / 56) + (innerWidth / 112);
            return isNaN(y) ? i * 20 : y; // Fallback to a simple spacing if NaN
        })
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("font-size", 14)
        .attr("font-weight", "bold")
        .text(d => d);
    
    // Remove y-axis label (First Set Result) to maximize space
    
    // Remove x-axis label (Second & Third Set Combinations) to maximize space

    // First group the grid data by row index to handle top and bottom sections separately
    const rowsByIndex = {};
    gridData.forEach(d => {
        if (!rowsByIndex[d.rowIndex]) {
            rowsByIndex[d.rowIndex] = [];
        }
        rowsByIndex[d.rowIndex].push(d);
    });

    // Get all row indices, sorted
    const rowIndices = Object.keys(rowsByIndex).map(Number).sort((a, b) => a - b);
    
    // Find the middle index - separate top section (winner won first set) from bottom section (winner lost first set)
    const middleIndex = firstSetOrder.indexOf(losingSetOrder[0]);
    
    // Top section column labels (for rows where winner won first set)
    const topRows = rowIndices.filter(idx => idx < middleIndex);
    if (topRows.length > 0) {
        // Use the first row as reference for column positions
        const topRowCells = rowsByIndex[topRows[0]];
        
        // Add column labels for top section
        topRowCells.forEach(d => {
            const x = d.colIndex * (innerWidth / 56) + (innerWidth / 112); // Center of column
            
            if (!isNaN(x)) {
                g.append("text")
                    .attr("class", "col-label-text top-section")
                    .attr("transform", `translate(${x}, -7) rotate(-90)`)
                    .attr("text-anchor", "start") 
                    .attr("dy", ".3em")
                    .attr("font-size", 10)
                    .attr("fill", "#555")
                    .attr("font-weight", "normal")
                    .text(() => {
                        let label = d.set2_score;
            if (d.set3_score && d.set3_score !== "NA") {
                            label += ", " + d.set3_score;
                        }
                        return label;
                    });
            }
        });
    }
    
    // Bottom section column labels (for rows where winner lost first set)
    const bottomRows = rowIndices.filter(idx => idx >= middleIndex);
    if (bottomRows.length > 0) {
        // Use the first row of bottom section as reference for column positions
        const bottomRowCells = rowsByIndex[bottomRows[0]];
        
        // Calculate the y-position for the bottom labels - position them below the last row
        const lastRowIndex = Math.max(...rowIndices);
        const bottomLabelsY = (lastRowIndex + 1) * (innerWidth / 56) + 7; // Add some padding
        
        // Add column labels for bottom section at the bottom of the grid
        bottomRowCells.forEach(d => {
            const x = d.colIndex * (innerWidth / 56) + (innerWidth / 112); // Center of column
            
            if (!isNaN(x)) {
                g.append("text")
                    .attr("class", "col-label-text bottom-section")
                    .attr("transform", `translate(${x}, ${bottomLabelsY}) rotate(-90)`)
                    .attr("text-anchor", "end") // Changed to end to align properly at bottom
                    .attr("dy", ".25em") // Adjusted for bottom alignment
                    .attr("font-size", 10)
                    .attr("fill", "#555")
                    .attr("font-weight", "normal")
                    .text(() => {
                        let label = d.set2_score;
                        if (d.set3_score && d.set3_score !== "NA") {
                            label += ", " + d.set3_score;
                        }
                        return label;
                    });
            }
        });
    }

    // Create a robust tooltip div to be shared by all visualizations
    // First, remove any existing tooltip to prevent duplicates
    d3.select("#robust-tooltip").remove();
    
    // Create a new tooltip div appended to the body
    const robustTooltip = d3.select("body")
        .append("div")
        .attr("id", "robust-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "black")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "6px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", "10000")
        .style("text-align", "center");
    
    // Add tooltips using simple attributes
    tiles.attr("title", d => d.scoreline)  // Native HTML tooltip
        .style("cursor", "pointer");
    
    // Add hover effect without using event handlers
    tiles.on("mouseover", function(event, d) {
        // Store the original stroke for later restoration
        const originalStroke = d3.select(this).attr("stroke");
        
        // Highlight tile with a stroke and slightly larger radius
        d3.select(this)
            .attr("original-stroke", originalStroke) // Store original stroke
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .attr("r", function() {
                // Get current radius and increase it slightly
                const currentRadius = parseFloat(d3.select(this).attr("r"));
                return currentRadius * 1.1; // 10% larger on hover
            });
        
        // Show tooltip with scoreline and count information
        robustTooltip
            .style("visibility", "visible")
            .html(function() {
                let content = "<strong>" + d.scoreline + "</strong>";
                
                // Add count information based on the current mode
                if (mode === "2024" || mode === "atp-2024" || mode === "wta-2024") {
                    // For 2024 modes
                    if (d.observed_2024) {
                        let count = d.count_2024;
                        if (mode === "atp-2024") {
                            count = d.count_atp_2024;
                        } else if (mode === "wta-2024") {
                            count = d.count_wta_2024;
                        }
                        content += "<br>Occurred " + count + (count === 1 ? " time" : " times");
                    }
                } else if (mode === "historical" || mode === "explorer") {
                    // For historical/explorer modes
                    if (d.observed_all_time) {
                        content += "<br>Occurred " + d.count_all_time + (d.count_all_time === 1 ? " time" : " times");
                    }
                } else if (mode === "rare" || mode === "popular") {
                    // For rare/popular modes
                    if (d.isRare2024 || d.isRareAllTime) {
                        let count = d.isRare2024 ? d.count_2024 : d.count_all_time;
                        let period = d.isRare2024 ? " in 2024" : " all-time";
                        content += "<br>Occurred " + count + (count === 1 ? " time" : " times") + period;
                    } else if (d.isPopular2024 || d.isPopularAllTime) {
                        let count = d.isPopular2024 ? d.count_2024 : d.count_all_time;
                        let period = d.isPopular2024 ? " in 2024" : " all-time";
                        content += "<br>Occurred " + count + (count === 1 ? " time" : " times") + period;
                    }
                } else if (mode === "all") {
                    // For all-scores mode, show all-time counts for observed scores
                    if (d.observed_all_time) {
                        content += "<br>Occurred " + d.count_all_time + (d.count_all_time === 1 ? " time" : " times");
                    }
                } else if (mode === "never-seen") {
                    // For never-seen mode, no counts to show as these are unobserved scores
                } else if (mode === "straight-sets" || mode === "three-sets") {
                    // For straight-sets or three-sets modes, show all-time counts
                    if (d.observed_all_time) {
                        content += "<br>Occurred " + d.count_all_time + (d.count_all_time === 1 ? " time" : " times");
                }
            }
            
            return content;
        })
        .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 30) + "px");
    })
    .on("mousemove", function(event) {
        // Move tooltip with mouse
        robustTooltip
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function() {
        const element = d3.select(this);
        // Get original stroke if it exists
        let isObserved = false;
        
        // Check if the cell is observed using the same logic as for stroke
        if (mode === "2024" || mode === "atp-2024" || mode === "wta-2024") {
            isObserved = element.datum().observed_2024;
        } else if (mode === "historical" || mode === "explorer") {
            isObserved = element.datum().observed_all_time;
        } else if (mode === "never-seen") {
            isObserved = element.datum().observed_all_time;
        } else if (mode === "rare" || mode === "popular") {
            const d = element.datum();
            isObserved = d.isRare2024 || d.isRareAllTime || d.isPopular2024 || d.isPopularAllTime;
        }
        
        // Restore original stroke
        element
            .attr("stroke", !isObserved ? "#DDDDDD" : "none")
            .attr("stroke-width", !isObserved ? "1px" : "0")
            .attr("r", function() {
                // Get the original radius (divide current by 1.1)
                const currentRadius = parseFloat(d3.select(this).attr("r"));
                return currentRadius / 1.1; // Return to original size
            });
        
        // Hide tooltip
        robustTooltip.style("visibility", "hidden");
    });

    // Try using the dedicated legend container if it exists
    const legendContainer = document.getElementById('legend-container');
    if (legendContainer) {
        // Clear any existing content
        legendContainer.innerHTML = '';
        
        // Create a simple HTML legend with no background or shadow
        const legendHTML = document.createElement('div');
        legendHTML.style.display = 'inline-block';
        legendHTML.style.margin = '0 auto 10px auto'; // Add margin below the legend
        
        // Add legend items
        legendItemsForLater.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'inline-block';
            itemDiv.style.marginRight = '20px';
            
            // Create a circle instead of a box
            const colorCircle = document.createElement('span');
            colorCircle.style.display = 'inline-block';
            colorCircle.style.width = '15px';
            colorCircle.style.height = '15px';
            colorCircle.style.backgroundColor = item.color;
            colorCircle.style.marginRight = '5px';
            colorCircle.style.borderRadius = '50%'; // Make it circular
            colorCircle.style.verticalAlign = 'middle';
            if (item.color === "white") {
                colorCircle.style.border = '1px solid #333'; // Add border for white circles
            }
            
            const label = document.createElement('span');
            label.textContent = item.label;
            label.style.fontWeight = 'bold';
            label.style.verticalAlign = 'middle';
            label.style.fontFamily = "GT Planar Regular, sans-serif"; // Ensure consistent font
            
            itemDiv.appendChild(colorCircle);
            itemDiv.appendChild(label);
            legendHTML.appendChild(itemDiv);
        });
        
        legendContainer.appendChild(legendHTML);
    } else {
        // Fallback to SVG legend if container doesn't exist
        // Remove any existing legend first
        svg.selectAll(".legend").remove();

        // Create legend group at the top of the SVG
    const legend = svg.append("g")
        .attr("class", "legend")
            .attr("transform", `translate(${svgWidth/2 - legendItemsForLater.length * 75}, 15)`)
            .style("visibility", "visible")
            .style("opacity", 1);

        // No background rect - removed

        // Add legend circles and labels horizontally
        legendItemsForLater.forEach((item, i) => {
            // Use circles instead of rectangles
            legend.append("circle")
                .attr("cx", i * 150 + 7.5) // Center of where the rectangle would be
                .attr("cy", 7.5) // Center of where the rectangle would be
                .attr("r", 7.5) // Half the size of the original 15x15 rectangle
            .attr("fill", item.color)
                .style("stroke", item.color === "white" ? "#333" : "none") // Add stroke for white
                .style("stroke-width", item.color === "white" ? 1 : 0);
        
        legend.append("text")
                .attr("x", i * 150 + 25)
                .attr("y", 12)
            .attr("font-size", 12)
                .attr("fill", "#333")
                .attr("font-weight", "bold")
            .text(item.label);
        });
    }
}

// Populate year select dropdown
function populateYearSelect() {
    const yearSelect = document.getElementById("year-select");
    
    // Check if yearCounts exists and has data
    if (!yearCounts || !yearCounts.length) {
        console.error("Year counts data is missing or empty");
        return;
    }
    
    // Get unique years
    const years = [...new Set(yearCounts.map(d => d.year))].sort((a, b) => b - a);
    
    // Check if yearSelect exists
    if (!yearSelect) {
        console.error("Year select element not found");
        return;
    }
    
    // Add options
    years.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Setup explorer controls
function setupExplorerControls(svg, gridData, width, height) {
    const tourSelect = document.getElementById("tour-select");
    const yearSelect = document.getElementById("year-select");
    
    // Event listeners
    tourSelect.addEventListener("change", updateExplorer);
    yearSelect.addEventListener("change", updateExplorer);
    
    function updateExplorer() {
        // Get the container
        const container = d3.select("#explorer-viz");
        
        // Create or update loading indicator
        let loadingIndicator = container.select(".loading-indicator");
        
        // If loading indicator doesn't exist, create it
        if (loadingIndicator.empty()) {
            loadingIndicator = container.append("div")
                .attr("class", "loading-indicator")
                .style("position", "absolute")
                .style("top", "50%")
                .style("left", "50%")
                .style("transform", "translate(-50%, -50%)")
                .style("text-align", "center")
                .style("background", "rgba(255, 255, 255, 0.9)")
                .style("padding", "20px")
                .style("border-radius", "10px")
                .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.2)")
                .style("z-index", "1000")
                .style("display", "none");
                
            loadingIndicator.append("div")
                .attr("class", "spinner")
                .style("border", "5px solid #f3f3f3")
                .style("border-top", "5px solid #3498db")
                .style("border-radius", "50%")
                .style("width", "40px")
                .style("height", "40px")
                .style("margin", "0 auto 15px auto")
                .style("animation", "spin 2s linear infinite");
                
            loadingIndicator.append("p")
                .attr("class", "loading-text")
                .text("Loading data...")
                .style("margin", "0")
                .style("font-weight", "bold");
        }
        
        // Show the loading indicator
        loadingIndicator.style("display", "block");
        
        // Use setTimeout to allow the loading indicator to render before processing data
        setTimeout(() => {
            // Get selected tours (multiple selection)
            const selectedTours = Array.from(tourSelect.selectedOptions).map(option => option.value);
            
            // Get selected years (multiple selection)
            const selectedYears = Array.from(yearSelect.selectedOptions).map(option => option.value);
            
            // Handle special case: if "all" is selected along with other options, just use "all"
            const effectiveTours = selectedTours.includes("all") ? ["all"] : selectedTours;
            const effectiveYears = selectedYears.includes("all") ? ["all"] : selectedYears;
            
            console.log("Selected years:", effectiveYears);
            
            // Check if "all" is selected in either dropdown
            const allToursSelected = effectiveTours.includes("all");
            const allYearsSelected = effectiveYears.includes("all");
            
            // Clear container and remove loading indicator
        container.html("");
        
        // Create SVG
        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);
        
            // Start with all possible scorelines
            let allPossibleScores = [...allScorelines];
            console.log("All possible scores count:", allPossibleScores.length);
            
            // Create a set of observed scorelines based on the filters
            const observedScorelines = new Set();
            
            // Apply year filter to determine which scores are observed
            if (allYearsSelected) {
                // If all years are selected, use the observed_all_time property
                allScorelines.filter(d => d.observed_all_time).forEach(d => {
                    observedScorelines.add(d.scoreline);
                });
            } else if (effectiveYears.length > 0) {
                effectiveYears.forEach(year => {
                    if (year === "2024") {
                        // For 2024, use the pre-calculated observed_2024 property
                        allScorelines.filter(d => d.observed_2024).forEach(d => {
                            observedScorelines.add(d.scoreline);
                        });
                    } else {
                        // For other specific years, get scorelines from matches for that year
            const matchesForYear = allMatches.filter(m => m.year === year);
                        matchesForYear.forEach(match => {
                            observedScorelines.add(match.scoreline);
                        });
                    }
                });
                
                console.log(`Total unique observed scorelines across selected years: ${observedScorelines.size}`);
            }
            
            // Apply tour filter to further refine observed scorelines
            if (!allToursSelected && effectiveTours.length > 0) {
                // Create sets for ATP and WTA scorelines
                const atpScorelines = new Set();
                const wtaScorelines = new Set();
                
                // Populate the sets based on the year filter
                if (allYearsSelected) {
                    // If all years are selected, use the all-time counts
                    allScorelines.filter(d => d.count_atp_all_time > 0).forEach(d => {
                        atpScorelines.add(d.scoreline);
                    });
                    
                    allScorelines.filter(d => d.count_wta_all_time > 0).forEach(d => {
                        wtaScorelines.add(d.scoreline);
                    });
                } else if (effectiveYears.includes("2024")) {
                    // If 2024 is one of the selected years, include 2024 counts
                    allScorelines.filter(d => d.count_atp_2024 > 0).forEach(d => {
                        atpScorelines.add(d.scoreline);
                    });
                    
                    allScorelines.filter(d => d.count_wta_2024 > 0).forEach(d => {
                        wtaScorelines.add(d.scoreline);
                    });
                }
                
                // For other specific years, get scorelines from matches for those years
                effectiveYears.forEach(year => {
                    if (year !== "all" && year !== "2024") {
                        const atpMatchesForYear = allMatches.filter(m => m.year === year && m.tour === "ATP");
                        atpMatchesForYear.forEach(match => {
                            atpScorelines.add(match.scoreline);
                        });
                        
                        const wtaMatchesForYear = allMatches.filter(m => m.year === year && m.tour === "WTA");
                        wtaMatchesForYear.forEach(match => {
                            wtaScorelines.add(match.scoreline);
                        });
                    }
                });
                
                console.log(`ATP scorelines: ${atpScorelines.size}, WTA scorelines: ${wtaScorelines.size}`);
                
                // Filter based on selected tours
                const tourScorelines = new Set();
                
                if (effectiveTours.includes("atp")) {
                    atpScorelines.forEach(scoreline => {
                        tourScorelines.add(scoreline);
                    });
                }
                
                if (effectiveTours.includes("wta")) {
                    wtaScorelines.forEach(scoreline => {
                        tourScorelines.add(scoreline);
                    });
                }
                
                console.log(`Total scorelines for selected tours: ${tourScorelines.size}`);
                
                // Intersect with the year-filtered scorelines
                const filteredObservedScorelines = new Set();
                observedScorelines.forEach(scoreline => {
                    if (tourScorelines.has(scoreline)) {
                        filteredObservedScorelines.add(scoreline);
                    }
                });
                
                // Replace the observed scorelines set with the filtered one
                observedScorelines.clear();
                filteredObservedScorelines.forEach(scoreline => {
                    observedScorelines.add(scoreline);
                });
                
                console.log("Observed scorelines after tour filter:", observedScorelines.size);
            }
            
            // Add a filtered_observed property to each scoreline
            allPossibleScores.forEach(d => {
                d.filtered_observed = observedScorelines.has(d.scoreline);
                
                // Set filtered_count based on the filters
                if (allYearsSelected && allToursSelected) {
                    d.filtered_count = d.count_all_time;
                } else if (allYearsSelected) {
                    if (effectiveTours.includes("atp") && !effectiveTours.includes("wta")) {
                        d.filtered_count = d.count_atp_all_time;
                    } else if (effectiveTours.includes("wta") && !effectiveTours.includes("atp")) {
                        d.filtered_count = d.count_wta_all_time;
                    } else {
                        d.filtered_count = d.count_all_time;
                    }
                } else if (effectiveYears.includes("2024") && effectiveYears.length === 1) {
                    if (allToursSelected) {
                        d.filtered_count = d.count_2024;
                    } else if (effectiveTours.includes("atp") && !effectiveTours.includes("wta")) {
                        d.filtered_count = d.count_atp_2024;
                    } else if (effectiveTours.includes("wta") && !effectiveTours.includes("atp")) {
                        d.filtered_count = d.count_wta_2024;
                    } else {
                        d.filtered_count = d.count_2024;
                    }
                } else {
                    // For other years or combinations, calculate the count from the matches data
                    const scoreline = d.scoreline;
                    let count = 0;
                    
                    // Filter matches based on selected years and tours
                    const filteredMatches = allMatches.filter(match => {
                        // Check if the match's year is in the selected years
                        const yearMatch = effectiveYears.includes(match.year);
                        
                        // Check if the match's tour is in the selected tours
                        const tourMatch = allToursSelected || 
                            (effectiveTours.includes("atp") && match.tour === "ATP") ||
                            (effectiveTours.includes("wta") && match.tour === "WTA");
                        
                        return yearMatch && tourMatch;
                    });
                    
                    // Count matches with this scoreline
                    count = filteredMatches.filter(match => match.scoreline === scoreline).length;
                    d.filtered_count = count;
                }
            });
            
            // Prepare the grid data with all possible scores
            const preparedGridData = prepareGridData(allPossibleScores);
            console.log("Prepared grid data count:", preparedGridData.length);
            
            // Create the grid visualization with all possible scores
            createScoreGrid(svg, preparedGridData, width, height, "explorer");
            
            // Hide the loading indicator after visualization is complete
            loadingIndicator.style("display", "none");
        }, 100); // Add a small delay to ensure UI updates
    }
    
    // Initial update
    updateExplorer();
}

// Show score details in the explorer
function showScoreDetails(score) {
    console.log("Showing details for score:", score.scoreline);
    
    // Remove highlights from all tiles
    d3.selectAll(".score-tile").classed("highlighted", false);
    
    // Highlight the tile for this score
    d3.selectAll(".score-tile")
        .filter(d => d.scoreline === score.scoreline)
        .classed("highlighted", true);
    
    // Check if detail panel exists, create it if not
    let detailPanel = document.getElementById("score-detail-panel");
    if (!detailPanel) {
        detailPanel = document.createElement("div");
        detailPanel.id = "score-detail-panel";
        detailPanel.className = "score-detail-panel";
        document.body.appendChild(detailPanel);
    }
    
    // Create HTML content
    let content = `
        <div class="detail-header">
            <h3>Score Details</h3>
            <button class="close-button">×</button>
        </div>
        <hr>
        <h4>Score: ${score.scoreline}</h4>
    `;
    
    // Add statistics
    content += `<div class="stats">
        <p><strong>ATP 2024:</strong> ${score.count_atp_2024} matches</p>
        <p><strong>WTA 2024:</strong> ${score.count_wta_2024} matches</p>
        <p><strong>Total 2024:</strong> ${score.count_2024} matches</p>
        <p><strong>ATP All-Time:</strong> ${score.count_atp_all_time} matches</p>
        <p><strong>WTA All-Time:</strong> ${score.count_wta_all_time} matches</p>
        <p><strong>Total All-Time:</strong> ${score.count_all_time} matches</p>
    </div>`;
    
    // Add match examples if available
    if (score.count_all_time > 0 && allMatches && allMatches.length) {
        // Find example matches with this score
        const exampleMatches = allMatches
            .filter(m => m.scoreline === score.scoreline)
            .sort((a, b) => b.year - a.year) // Most recent first
            .slice(0, 5); // Limit to 5 examples
        
        if (exampleMatches.length > 0) {
            content += `<hr><h5>Example Matches:</h5>
            <ul class="match-examples">`;
            
            exampleMatches.forEach(match => {
                content += `<li>
                    <strong>${match.year}:</strong> ${match.winner_name} def. ${match.loser_name} 
                    <span class="score">${match.scoreline}</span>
                    <span class="tournament">(${match.tourney_name}, ${match.surface})</span>
                </li>`;
            });
            
            content += `</ul>`;
        }
    }
    
    // Add a note about clicking elsewhere to close
    content += `<div style="margin-top: 15px; font-style: italic; font-size: 12px; color: #666;">Click the X to close this panel</div>`;
    
    // Update the detail panel
    detailPanel.innerHTML = content;
    detailPanel.style.display = "block";
    
    // Add close button functionality
    detailPanel.querySelector(".close-button").addEventListener("click", function() {
        detailPanel.style.display = "none";
        d3.selectAll(".score-tile").classed("highlighted", false);
    });
}

// Initialization when the page loads
document.addEventListener("DOMContentLoaded", function() {
    loadData().then(() => {
        initVisualizations();
    });
}); 