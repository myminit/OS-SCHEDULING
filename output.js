function runComparison() {
    const checkboxes = document.querySelectorAll('.select-algorithm input[type="checkbox"]');
    const selectedAlgorithms = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    let results = [];

    if (selectedAlgorithms.length > 0) {
        selectedAlgorithms.forEach(algorithm => {
            switch (algorithm) {
                case 'fcfs':
                    FCFS();
                    results.push({ name: "FCFS", efficiency: efficiency_FCFS, timeline: timeline_FCFS });
                    break;
                case 'rr':
                    RR();
                    results.push({ name: "RR", efficiency: efficiency_RR, timeline: timeline_RR });
                    break;
                case 'sjf':
                    SJF();
                    results.push({ name: "SJF", efficiency: efficiency_SJF, timeline: timeline_SJF });
                    break;
                case 'srtf':
                    SRTF();
                    results.push({ name: "SRTF", efficiency: efficiency_SRTF, timeline: timeline_SRTF });
                    break;
                case 'p':
                    Priority();
                    results.push({ name: "Priority", efficiency: efficiency_P, timeline: timeline_P });
                    break;
                case 'hrrn':
                    HRRN();
                    results.push({ name: "HRRN", efficiency: efficiency_HRRN, timeline: timeline_HRRN });
                    break;
                case 'mqwf':
                    MQWF();
                    results.push({ name: "MQWF", efficiency: efficiency_MQWF, timeline: timeline_MQWF });
                    break;
                default:
                    break;
            }
        });

        document.getElementById('ganttCharts').style.visibility = 'visible';
        
        const comparisonSection = document.createElement('div');
        comparisonSection.id = 'comparisonSection';
        comparisonSection.innerHTML = `
            <h3 class="comparison-title">Comparison Graph</h3>
            <div class="comparison-container">
                <canvas id="comparisonChart"></canvas>
            </div>
        `;
        
        const existingSection = document.getElementById('comparisonSection');
        if (existingSection) {
            existingSection.remove();
        }
        
        document.getElementById('ganttCharts').insertAdjacentElement('afterend', comparisonSection);
        
        displayGanttCharts(results);
        displayComparisonChart(results);

    } else {
        alert("กรุณาเลือก Algorithm ที่ต้องการเปรียบเทียบ");
    }
}

function displayGanttCharts(results) {
    const ganttContainer = document.getElementById('ganttCharts');
    ganttContainer.innerHTML = ''; 

    results.forEach(result => {
        const chartDiv = document.createElement('div');
        chartDiv.classList.add('ganttChart');
        chartDiv.innerHTML = `<h5>${result.name} Gantt Chart</h5>`;

        const totalTime = result.timeline[result.timeline.length - 1].end;
        
        const timelineDiv = document.createElement('div');
        timelineDiv.classList.add('timeline');

        // เพิ่มเฉพาะเวลาเริ่มต้นของ Gantt
        const startMarker = document.createElement('span');
        startMarker.classList.add('timeMarker');
        startMarker.style.left = `0%`;
        startMarker.innerText = result.timeline[0].start;
        timelineDiv.appendChild(startMarker);

        result.timeline.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('ganttTask');
            
            const taskDuration = task.end - task.start;
            taskDiv.style.width = `${(taskDuration / totalTime) * 100}%`;
            taskDiv.innerHTML = `${task.name} <span class="end-time">${task.end}</span>`;
            
            timelineDiv.appendChild(taskDiv);
        });

        chartDiv.appendChild(timelineDiv);
        ganttContainer.appendChild(chartDiv);
    });
}

function displayComparisonChart(results) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    const existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const labels = results.map(result => result.name);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CPU Utilization (%)',
                    data: results.map(result => result.efficiency.CPUutilization),
                    backgroundColor: '#E3242B'
                },
                {
                    label: 'Average Waiting Time',
                    data: results.map(result => result.efficiency.avgWaitingTime),
                    backgroundColor: '#610C04'
                },
                {
                    label: 'Average Turnaround Time',
                    data: results.map(result => result.efficiency.avgTurnAroundTime),
                    backgroundColor: '#A91B0D'
                },
                {
                    label: 'Average Response Time',
                    data: results.map(result => result.efficiency.avgResponseTime),
                    backgroundColor: '#420C09'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Values'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        boxWidth: 12
                    }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 10
                }
            }
        }
    });
}
