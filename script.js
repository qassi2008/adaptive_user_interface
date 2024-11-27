document.addEventListener("DOMContentLoaded", () => {
    const increaseLoadBtn = document.getElementById("increaseLoad");
    const increaseHeartRateBtn = document.getElementById("increaseHeartRate");
    const resetLoadBtn = document.getElementById("resetLoad");

    const chartSection = document.getElementById("chart");
    const toolsSection = document.getElementById("tools");
    const summarySection = document.getElementById("summary");
    const notification = document.getElementById("notification");

    const loadLevelDisplay = document.getElementById("loadLevel");
    const heartRateDisplay = document.getElementById("heartRate");
    const summaryContent = document.getElementById("summaryContent");

    const loadProgress = document.getElementById("loadProgress");
    const heartRateProgress = document.getElementById("heartRateProgress");

    let cognitiveLoadLevel = 0; // Cognitive load level, 0 = normal, 1 = simplified, 2 = high load
    let heartRate = 70; // Starting heart rate
    let mistakeCount = 0; // Tracks user errors
    let time = 0; // Simulated time in seconds
    let idleTime = 0; // Inactivity tracking
    let resetTimer;
    
    let breakTime = 5; // Default break reminder time (minutes)
    let maxHeartRate = 100; // Max heart rate before alert

    // Data for the Chart.js chart
    const loadData = {
        labels: [],
        datasets: [
            {
                label: 'Cognitive Load Level',
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                data: []
            },
            {
                label: 'Heart Rate',
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                data: []
            }
        ]
    };

    // Chart.js setup
    const ctx = document.getElementById('cognitiveLoadChart').getContext('2d');
    const cognitiveLoadChart = new Chart(ctx, {
        type: 'line',
        data: loadData,
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cognitive Load / Heart Rate'
                    }
                }
            }
        }
    });

    // Function to adjust the UI based on cognitive load level
    function adjustUI() {
        loadData.labels.push(time);
        loadData.datasets[0].data.push(cognitiveLoadLevel);
        loadData.datasets[1].data.push(heartRate);
        cognitiveLoadChart.update();
        updateSummary();
        updateProgressBars();

        if (cognitiveLoadLevel === 1) {
            chartSection.classList.add("hidden");
            reduceTools();
            summarySection.classList.add("simplified");
            showNotification("Detected cognitive load increase. Simplifying the interface.");
        } else if (cognitiveLoadLevel === 2) {
            chartSection.classList.add("hidden");
            toolsSection.classList.add("hidden");
            summarySection.classList.add("simplified");
            summaryContent.innerHTML = "Key insights only shown to reduce cognitive load.";
            showNotification("High cognitive load detected. Suggesting a break.");
            
            // Apply high-load styles
            document.body.classList.add("high-load");
            document.querySelector(".navbar").classList.add("high-load");
        } else {
            chartSection.classList.remove("hidden");
            toolsSection.classList.remove("hidden");
            resetTools();
            summarySection.classList.remove("simplified");
            summaryContent.innerHTML = "This section contains key insights and important data points.";
            hideNotification();
            
            // Remove high-load styles
            document.body.classList.remove("high-load");
            document.querySelector(".navbar").classList.remove("high-load");
        }

        loadLevelDisplay.textContent = cognitiveLoadLevel;
        heartRateDisplay.textContent = heartRate;

        time += 1;
    }

    // Update progress bars
    function updateProgressBars() {
        loadProgress.value = cognitiveLoadLevel * 50; // Scale to 100
        heartRateProgress.value = heartRate;
    }

    // Update summary content based on cognitive load
    function updateSummary() {
        if (cognitiveLoadLevel === 0) {
            summaryContent.innerHTML = `
                <strong>Task Progress:</strong> 80% complete<br>
                <strong>Errors Flagged:</strong> 10% of data<br>
                <strong>Recommendation:</strong> Review flagged items and proceed.<br>
                <strong>Notifications:</strong> 3 reports are overdue.
            `;
        } else if (cognitiveLoadLevel === 1) {
            summaryContent.innerHTML = `
                <strong>Key Metrics:</strong> Task completion at 80%, Errors flagged at 10%.<br>
                <strong>Next Step:</strong> Focus on correcting flagged errors.
            `;
        } else if (cognitiveLoadLevel === 2) {
            summaryContent.innerHTML = `
                <strong>Focus on:</strong> Correcting errors flagged in the report.<br>
                <strong>Task Completion:</strong> 80% done.<br>
                <em>Consider taking a break.</em>
            `;
        }
    }
    
    function reduceTools() {
        const toolList = document.getElementById("toolList");
        toolList.innerHTML = "<li>Basic Filters</li><li>Quick Search</li>";
    }

    function resetTools() {
        const toolList = document.getElementById("toolList");
        toolList.innerHTML = `
            <li>Data Filters</li>
            <li>Search Tool</li>
            <li>Export Data</li>
            <li>Detailed Analytics</li>
            <li>Custom Reporting Tool</li>
        `;
    }

    function showNotification(message) {
        notification.querySelector("p").textContent = message;
        notification.classList.add("active");
    }

    function hideNotification() {
        notification.classList.remove("active");
    }

    // Reset after inactivity
    function resetAfterCustomMinutes(minutes) {
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            cognitiveLoadLevel = 0;
            heartRate = 70;
            mistakeCount = 0;
            loadData.labels = [];
            loadData.datasets[0].data = [];
            loadData.datasets[1].data = [];
            cognitiveLoadChart.update();
            time = 0; 
            adjustUI();
            showNotification("System reset after inactivity.");
        }, minutes * 60000); // Converts minutes to milliseconds
    }

    // Simulate errors and cognitive load increase
    increaseLoadBtn.addEventListener("click", () => {
        mistakeCount++;
        if (mistakeCount >= 3 && cognitiveLoadLevel < 2) {
            cognitiveLoadLevel++;
        }
        adjustUI();
        resetAfterCustomMinutes(breakTime);
    });

    // Simulate heart rate increase
    increaseHeartRateBtn.addEventListener("click", () => {
        heartRate += 10;
        if (heartRate > maxHeartRate && cognitiveLoadLevel < 2) {
            cognitiveLoadLevel = 2;
            showNotification(`Heart rate is high. Suggesting a break at ${maxHeartRate} bpm.`);
        }
        adjustUI();
        resetAfterCustomMinutes(breakTime);
    });

    // Reset load and heart rate manually
    resetLoadBtn.addEventListener("click", () => {
        cognitiveLoadLevel = 0;
        heartRate = 70;
        mistakeCount = 0;
        loadData.labels = [];
        loadData.datasets[0].data = [];
        loadData.datasets[1].data = [];
        cognitiveLoadChart.update();
        time = 0;
        adjustUI();
        clearTimeout(resetTimer); 
    });

    // Change break time and max heart rate
    document.getElementById("breakTime").addEventListener("change", (e) => {
        breakTime = parseInt(e.target.value, 10);
    });

    document.getElementById("maxHeartRate").addEventListener("change", (e) => {
        maxHeartRate = parseInt(e.target.value, 10);
    });

    // Export report
    document.getElementById("exportReport").addEventListener("click", () => {
        const report = {
            cognitiveLoadHistory: loadData.datasets[0].data,
            heartRateHistory: loadData.datasets[1].data
        };
        const reportBlob = new Blob([JSON.stringify(report)], {type: 'application/json'});
        const reportUrl = URL.createObjectURL(reportBlob);
        const a = document.createElement("a");
        a.href = reportUrl;
        a.download = "weekly_report.json";
        a.click();
    });

    // Idle Detection
    document.addEventListener("mousemove", resetIdleTime);
    document.addEventListener("keypress", resetIdleTime);

    function resetIdleTime() {
        idleTime = 0;
    }

    setInterval(() => {
        idleTime++;
        if (idleTime >= 300) { 
            showNotification("You've been idle for 5 minutes. Time to take a break!");
            adjustUI();
        }
    }, 1000); 

    // Initial load state
    adjustUI();
});
