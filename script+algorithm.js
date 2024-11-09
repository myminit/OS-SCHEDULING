let processes = []; //ex. [{p1, 0, 5, 1}, {p2, 1, 8, 0}] >> {name, arrivalTime, burstTime, priority}
let result_FCFS = []; //ex. [{p1, 0, 5, 5, 5, 0}, {p2, 1, 8,13, 12, 4}] >> {name, arrivalTime, burstTime, completionTime, turnAroundTime, waitingTime}
let timeline_FCFS = []; //ex. [{p1, 0, 5}, {p2, 5, 13}] >> {name, start, end}
let efficiency_FCFS = {}; //ex. {CPUutilization: 100, Throughput: 0.15384615384615385, avgTurnAroundTime: 8.5, avgWaitingTime: 2}
let result_RR = [];
let timeline_RR = []; //ex. [{p1, 0, 4}, {p2, 4, 8}, {p1, 8, 9}, {p2, 8, 12}] >> สมมุติ quantumtime = 4,  {name, start, end}
let efficiency_RR = {};
let result_SJF = [];
let timeline_SJF = [];
let efficiency_SJF = {};
let result_SRTF = [];
let timeline_SRTF = [];
let efficiency_SRTF = [];
let result_HRRN = [];
let timeline_HRRN = [];
let efficiency_HRRN = {};
let result_MQWF = [];
let timeline_MQWF = [];
let efficiency_MQWF = {};
let result_P = [];
let timeline_P = [];
let efficiency_P = {};
let quantumtime = Number(document.querySelector('#quantum-time').value);
let contextSwitch = Number(document.querySelector("#switch-time").value);
let tbody = document.getElementById('process-table-body'); 
let countAddProcess = 2; 

/*--------------------------------------------------ส่วนinput--------------------------------------------------*/

function deleteProcess(element) {
    const row = element.closest('tr');
    if (row) {
        row.remove();
    }
}

function addProcess() {
    const processId = `P${countAddProcess}`;
    const row = document.createElement('tr');
    row.innerHTML = `
    <td class="process-id">${processId}</td>
    <td class="arrival-time"><input type="number" min="0" step="1" value="0"></td>
    <td class="burst-time"><input type="number" min="1" step="1" value="1"></td>
    <td class="priority"><input type="number" min="1" step="1" value="1"></td>
    <td class="delete-process"><a class="material-symbols-outlined" onclick="deleteProcess(this)">delete</a></td>
    `;
    countAddProcess++;
    tbody.appendChild(row);
}

function resetProcess() {
    tbody.innerHTML = `
    <td class="process-id">p1</td>
    <td class="arrival-time"><input type="number" min="0" step="1" value="0"></td>
    <td class="burst-time"><input type="number" min="1" step="1" value="1"></td>
    <td class="priority"><input type="number" min="1" step="1" value="1"></td>
    <td class="delete-process"></td>
    `;
    countAddProcess = 2;
};

function randomProcess() {
    const numRandom = Number(document.querySelector('.head-input input').value);
    let arrival, burst, priority, processId;
    
    for(let i = 0; i < numRandom; i++) {
        arrival = Math.floor(Math.random() * (numRandom * 5));
        burst = Math.floor(Math.random() * 50) + 1;
        priority = Math.floor(Math.random() * 5) + 1;
        processId = `P${countAddProcess}`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
        <td class="process-id">${processId}</td>
        <td class="arrival-time"><input type="number" min="0" step="1" value="${arrival}"></td>
        <td class="burst-time"><input type="number" min="1" step="1" value="${burst}"></td>
        <td class="priority"><input type="number" min="1" step="1" value="${priority}"></td>
        <td class="delete-process"><a class="material-symbols-outlined" onclick="deleteProcess(this)">delete</a></td>
        `;
        
        tbody.appendChild(row); 
        countAddProcess++;
    }
}

function calculate() {
    const names = document.querySelectorAll('tbody .process-id');
    const arrivals = document.querySelectorAll('tbody .arrival-time input');
    const bursts = document.querySelectorAll('tbody .burst-time input');
    const priorities = document.querySelectorAll('tbody .priority input');
    quantumtime = Number(document.querySelector('#quantum-time').value);
    contextSwitch = Number(document.querySelector("#switch-time").value);
    
    if (names.length === arrivals.length && arrivals.length === bursts.length && bursts.length === priorities.length) {
        processes.length = 0;
        for (let i = 0; i < names.length; i++) {
            processes.push({
                name: names[i].textContent.trim(),
                arrivalTime: parseInt(arrivals[i].value),
                burstTime: parseInt(bursts[i].value),
                priority: parseInt(priorities[i].value)
            });
        }
    }

    runComparison();
    
}

/*--------------------------------------------------ส่วนAlgorithm--------------------------------------------------*/

function sortArrivaltime(process){
    // Sort processes โดยเรียงตาม arrival time จากน้อยไปมาก
    return process.sort((a, b) => a.arrivalTime - b.arrivalTime);
}

function sortPriority(process){
    // Sort processes โดยเรียงตาม priority จากน้อยไปมาก
    return process.sort((a, b) => a.priority - b.priority);
}

function CPUutilizationCal(EndCompletionTime) {
    let CPUtime = 0;
    processes.forEach(element => {
        CPUtime += element.burstTime;
    });

    return (CPUtime / EndCompletionTime) * 100.00;
}

function ThroughputCal(NumProcess, EndCompletionTime){
    return NumProcess / EndCompletionTime;
}

function avgTurnAroundTime(result){ 
    let sum = 0
    result.forEach( element => { sum += element.turnAroundTime } );
    return sum / result.length ;
}

function avgWaitingTime(result){
    let sum = 0
    result.forEach( element => { sum += element.waitingTime } );
    return sum / result.length ;
}

function avgResponseTime(result){
    let sum = 0
    result.forEach( element => { sum += element.responseTime } );
    return sum / result.length ;
}

function FCFS() {
    let copy_process = sortArrivaltime(processes).slice();
    let currentTime = 0;
    let lastCompletionTime = 0;
    result_FCFS = [];
    timeline_FCFS = [];
    efficiency_FCFS = {};
    
    copy_process.forEach(process => {
        let startTime = Math.max(currentTime, process.arrivalTime);
        let completionTime = startTime + process.burstTime;
        let turnAroundTime = completionTime - process.arrivalTime; 
        let waitingTime = turnAroundTime - process.burstTime; 
        let responseTime = startTime - process.arrivalTime;
        
        result_FCFS.push({ 
            name: process.name, 
            completionTime: completionTime, 
            turnAroundTime: turnAroundTime, 
            waitingTime: waitingTime,
            responseTime: responseTime
        });
        timeline_FCFS.push({ 
            name: process.name, 
            start: startTime, 
            end: completionTime 
        });
        
        currentTime = completionTime + contextSwitch;
        lastCompletionTime = completionTime;
        
    });
    
    efficiency_FCFS = {CPUutilization: CPUutilizationCal(lastCompletionTime), 
        Throughput: ThroughputCal(timeline_FCFS.length, lastCompletionTime), 
        avgTurnAroundTime: avgTurnAroundTime(result_FCFS), 
        avgWaitingTime: avgWaitingTime(result_FCFS),
        avgResponseTime: avgResponseTime(result_FCFS)};
}
    
function RR() {
    let copy_process = sortArrivaltime(processes).slice();
    let queue = [];
    let currentTime = 0;
    let lastCompletionTime = 0;
    result_RR = [];
    timeline_RR = [];
    efficiency_RR = {};
    
    let remainingBurst = {};
    let firstExecutionTime = {};

    copy_process.forEach(process => {
        remainingBurst[process.name] = process.burstTime;
        firstExecutionTime[process.name] = null; 
    });
    
    queue.push(...copy_process);
    
    while (queue.length > 0) {
        currentProcess = queue.shift();
    
        if (currentProcess.arrivalTime > currentTime) {
            queue.splice(1, 0, currentProcess);
            currentTime++;
            continue;
        }
    
        let startTime = currentTime;
    
        if (firstExecutionTime[currentProcess.name] === null) {
            firstExecutionTime[currentProcess.name] = startTime;
        }
    
        let timeToExecute = Math.min(quantumtime, remainingBurst[currentProcess.name]);
        currentTime += timeToExecute;
        remainingBurst[currentProcess.name] -= timeToExecute;
    
        timeline_RR.push({ name: currentProcess.name, start: startTime, end: currentTime });
    
        if (remainingBurst[currentProcess.name] === 0) { 
            // ถ้า process ทำงานเสร็จ
            let completionTime = currentTime;
            let turnAroundTime = completionTime - currentProcess.arrivalTime;
            let waitingTime = turnAroundTime - currentProcess.burstTime;
            let responseTime = firstExecutionTime[currentProcess.name] - currentProcess.arrivalTime;
    
            result_RR.push({
                name: currentProcess.name,
                arrivalTime: currentProcess.arrivalTime,
                burstTime: currentProcess.burstTime,
                completionTime: completionTime,
                turnAroundTime: turnAroundTime,
                waitingTime: waitingTime,
                responseTime: responseTime 
            });
    
            lastCompletionTime = completionTime;
        } else if (remainingBurst[currentProcess.name] > 0) {
            queue.push(currentProcess);
        }
    
        currentTime += contextSwitch;
    }
    
    efficiency_RR = {
        CPUutilization: CPUutilizationCal(lastCompletionTime),
        Throughput: ThroughputCal(result_RR.length, lastCompletionTime),
        avgTurnAroundTime: avgTurnAroundTime(result_RR),
        avgWaitingTime: avgWaitingTime(result_RR),
        avgResponseTime: avgResponseTime(result_RR)
    };
}    

function MQWF() {
    let timeq = quantumtime; 
    let queues = [];
    let uniquePriorities = new Set();
    result_MQWF = [];
    timeline_MQWF = [];
    efficiency_MQWF = {};
    
    processes.forEach(process => {
        uniquePriorities.add(process.priority);
    });
    
    let maxPriority = Math.max(...uniquePriorities);
    uniquePriorities.forEach(priority => { //สร้างคิวโดยที่มีค่าของ priority มากสุดทำ FCFS นอกนั้นทำ RR โดยมี quantum time เพิ่มขึ้นทีละ 2n
        if (priority !== maxPriority) {
            queues.push({ priority: priority, quantum: timeq, processes: [] });
            timeq *= 2;
        } else {
            queues.push({ priority: priority, quantum: 0, processes: [] });
        }
    });
    
    queues = sortPriority(queues);
    
    let currentTime = 0;
    let lastCompletionTime = 0;
    let copy_process = sortArrivaltime(processes).slice();
    copy_process.forEach(process => {
        let targetQueue = queues.find(queue => queue.priority === process.priority);
        if (targetQueue) {
            targetQueue.processes.push(process);
        }
    });
    
    let remainingBurst = {};
    let firstExecutionTime = {};
    
    copy_process.forEach(process => {
        remainingBurst[process.name] = process.burstTime;
        firstExecutionTime[process.name] = null; 
    });
    
    while (queues.some(queue => queue.processes.length > 0)) {
        let foundProcess = false;
    
        for (let i = 0; i < queues.length; i++) {
            let queue = queues[i];
    
            if (queue.processes.length > 0) {
                let currentProcess = queue.processes[0]; 
    
                if (currentProcess.arrivalTime > currentTime) {
                    queue.processes.splice(1, 0, currentProcess);
                    currentTime++;
                    continue;
                }
    
                foundProcess = true;
                currentProcess = queue.processes.shift();
                let startTime = currentTime;
    
                if (firstExecutionTime[currentProcess.name] === null) {
                    firstExecutionTime[currentProcess.name] = startTime;
                }
    
                let timeToExecute = queue.quantum > 0
                    ? Math.min(queue.quantum, remainingBurst[currentProcess.name])
                    : remainingBurst[currentProcess.name];
    
                currentTime += timeToExecute;
                remainingBurst[currentProcess.name] -= timeToExecute;
    
                timeline_MQWF.push({ name: currentProcess.name, start: startTime, end: currentTime });
    
                if (remainingBurst[currentProcess.name] === 0) {
                    let completionTime = currentTime;
                    let turnAroundTime = completionTime - currentProcess.arrivalTime;
                    let waitingTime = turnAroundTime - currentProcess.burstTime;
                    let responseTime = firstExecutionTime[currentProcess.name] - currentProcess.arrivalTime;
    
                    result_MQWF.push({
                        name: currentProcess.name,
                        arrivalTime: currentProcess.arrivalTime,
                        burstTime: currentProcess.burstTime,
                        completionTime: completionTime,
                        turnAroundTime: turnAroundTime,
                        waitingTime: waitingTime,
                        responseTime: responseTime 
                    });
    
                    lastCompletionTime = completionTime;
                } else {
                    if (i + 1 < queues.length) {
                        queues[i + 1].processes.push(currentProcess);
                    }
                }
                break;
            }
        }
    
        if (!foundProcess) {
            currentTime = Math.max(currentTime, copy_process[0]?.arrivalTime || currentTime);
        }
    
        currentTime += contextSwitch;
    }    
    
    efficiency_MQWF = {
        CPUutilization: CPUutilizationCal(lastCompletionTime),
        Throughput: ThroughputCal(result_MQWF.length, lastCompletionTime),
        avgTurnAroundTime: avgTurnAroundTime(result_MQWF),
        avgWaitingTime: avgWaitingTime(result_MQWF),
        avgResponseTime: avgResponseTime(result_MQWF) 
    };
}

function SJF() {
    let copy_process = sortArrivaltime(processes).slice(); // เรียงโปรเซสตามเวลาที่เข้ามา
    let currentTime = 0;
    let lastCompletionTime = 0;
    result_SJF = [];
    timeline_SJF = [];
    efficiency_SJF = {};

    while (copy_process.length > 0) {
        // ค้นหาโปรเซสที่เข้ามาก่อนและมีเวลาทำงานสั้นที่สุด
        let availableProcesses = copy_process.filter(process => process.arrivalTime <= currentTime);
        if (availableProcesses.length === 0) {
            // หากไม่มีโปรเซสที่เข้ามา รอจนกว่าจะมีโปรเซสเข้ามา
            currentTime = copy_process[0].arrivalTime;
            continue;
        }

        // เรียงโปรเซสตาม burst time
        availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
        let currentProcess = availableProcesses[0]; // โปรเซสที่มีเวลาทำงานสั้นที่สุด

        // คำนวณเวลาที่ใช้ในการทำงาน
        let startTime = currentTime;
        let completionTime = startTime + currentProcess.burstTime;
        let turnAroundTime = completionTime - currentProcess.arrivalTime; 
        let waitingTime = turnAroundTime - currentProcess.burstTime; 
        let responseTime = startTime - currentProcess.arrivalTime;

        // เก็บผลลัพธ์
        result_SJF.push({
            name: currentProcess.name,
            completionTime: completionTime,
            turnAroundTime: turnAroundTime,
            waitingTime: waitingTime,
            responseTime: responseTime
        });

        timeline_SJF.push({ 
            name: currentProcess.name, 
            start: startTime, 
            end: completionTime 
        });

        // อัปเดตเวลา
        currentTime = completionTime + contextSwitch; // เพิ่มเวลา context switch
        lastCompletionTime = completionTime;

        // ลบโปรเซสที่เสร็จสิ้นออกจากคิว
        copy_process = copy_process.filter(process => process.name !== currentProcess.name);
    }

    // คำนวณประสิทธิภาพ
    efficiency_SJF = {
        CPUutilization: CPUutilizationCal(lastCompletionTime),
        Throughput: ThroughputCal(timeline_SJF.length, lastCompletionTime),
        avgTurnAroundTime: avgTurnAroundTime(result_SJF),
        avgWaitingTime: avgWaitingTime(result_SJF),
        avgResponseTime: avgResponseTime(result_SJF)
    };
}

function HRRN() {
    result_HRRN = [];
    timeline_HRRN = [];
    efficiency_HRRN = {};
    let currentTime = 0;
    let lastCompletionTime = 0;
    let copy_process = sortArrivaltime(processes).slice(); 

    while (copy_process.length > 0) {
        // กรองกระบวนการที่สามารถเข้าถึงได้
        let availableProcesses = copy_process.filter(process => process.arrivalTime <= currentTime);

        if (availableProcesses.length === 0) {
            // ถ้าไม่มีโปรเซสที่สามารถทำงานได้ ข้ามไปยังเวลาถัดไป
            currentTime++;
            continue;
        }

        // คำนวณ Response Ratio
        availableProcesses.forEach(process => {
            process.responseRatio = ((currentTime - process.arrivalTime) + process.burstTime) / process.burstTime;
        });

        // เลือกโปรเซสที่มี Response Ratio สูงสุด
        let selectedProcess = availableProcesses.reduce((prev, current) => {
            if (prev.responseRatio > current.responseRatio) {
                return prev;
            } else if (prev.responseRatio < current.responseRatio) {
                return current;
            } else {
                let prevNum = parseInt(prev.name.replace(/\D/g, ''), 10);
                let currentNum = parseInt(current.name.replace(/\D/g, ''), 10);
                return prevNum < currentNum ? prev : current;
            }
        });

        // ปรับเวลาปัจจุบันกับกระบวนการที่เลือก
        currentTime += selectedProcess.burstTime;
        
        // คำนวณค่าเวลาในการเสร็จสิ้น
        let completionTime = currentTime;
        let turnAroundTime = completionTime - selectedProcess.arrivalTime;
        let waitingTime = turnAroundTime - selectedProcess.burstTime;
        let responseTime = completionTime - selectedProcess.arrivalTime - selectedProcess.burstTime;

        result_HRRN.push({
            name: selectedProcess.name,
            arrivalTime: selectedProcess.arrivalTime,
            burstTime: selectedProcess.burstTime,
            completionTime: completionTime,
            turnAroundTime: turnAroundTime,
            waitingTime: waitingTime,
            responseTime: responseTime 
        });

        timeline_HRRN.push({ name: selectedProcess.name, start: currentTime - selectedProcess.burstTime, end: currentTime });

        // ลบโปรเซสที่เลือกออกจากคัดลอก
        copy_process = copy_process.filter(process => process.name !== selectedProcess.name);
        lastCompletionTime = completionTime; 
    }    

    efficiency_HRRN = {
        CPUutilization: CPUutilizationCal(lastCompletionTime),
        Throughput: ThroughputCal(result_HRRN.length, lastCompletionTime),
        avgTurnAroundTime: avgTurnAroundTime(result_HRRN),
        avgWaitingTime: avgWaitingTime(result_HRRN),
        avgResponseTime: avgResponseTime(result_HRRN) 
    };
}

function Priority() {
    let copy_process = sortArrivaltime(processes).slice();
    let currentTime = 0;
    let lastCompletionTime = 0;
    
    result_P = []; 
    timeline_P = [];
    efficiency_P = {};

    while (copy_process.length > 0) {
        // หาโปรเซสที่พร้อมทำงาน (arrivalTime <= currentTime) และมี Priority สูงที่สุด (priority ต่ำสุด)
        let availableProcesses = copy_process.filter(process => process.arrivalTime <= currentTime);
        
        if (availableProcesses.length === 0) {
            // หากไม่มีโปรเซสที่พร้อมทำงาน ให้เพิ่ม currentTime ไปยังเวลาที่มีโปรเซสเข้ามาใหม่
            currentTime = copy_process[0].arrivalTime;
            continue;
        }

        // เรียงโปรเซสตาม priority (ค่า priority ที่น้อยกว่าแสดงถึง priority สูงกว่า)
        availableProcesses.sort((a, b) => a.priority - b.priority);
        let currentProcess = availableProcesses[0]; // เลือกโปรเซสที่มี priority สูงสุด

        // คำนวณเวลาทำงานของโปรเซส
        let startTime = currentTime;
        let completionTime = startTime + currentProcess.burstTime;
        let turnAroundTime = completionTime - currentProcess.arrivalTime;
        let waitingTime = turnAroundTime - currentProcess.burstTime;
        let responseTime = startTime - currentProcess.arrivalTime;

        result_P.push({
            name: currentProcess.name,
            completionTime: completionTime,
            turnAroundTime: turnAroundTime,
            waitingTime: waitingTime,
            responseTime: responseTime
        });

        timeline_P.push({ 
            name: currentProcess.name, 
            start: startTime, 
            end: completionTime 
        });

        // อัปเดตเวลา currentTime และลบโปรเซสที่เสร็จสิ้นออกจากคิว
        currentTime = completionTime + contextSwitch;
        lastCompletionTime = completionTime;
        copy_process = copy_process.filter(process => process.name !== currentProcess.name);
    }

    efficiency_P = {
        CPUutilization: CPUutilizationCal(lastCompletionTime),
        Throughput: ThroughputCal(timeline_P.length, lastCompletionTime),
        avgTurnAroundTime: avgTurnAroundTime(result_P),
        avgWaitingTime: avgWaitingTime(result_P),
        avgResponseTime: avgResponseTime(result_P)
    };
}

function SRTF() {
    let copy_process = sortArrivaltime(processes).slice();
    let currentTime = 0;
    let lastCompletionTime = 0;
    result_SRTF = [];
    timeline_SRTF = [];
    efficiency_SRTF = {};

    let remainingBurst = {};
    let firstExecutionTime = {};
    let completedProcesses = new Set();
    let currentTimelineEntry = null;

    copy_process.forEach(process => {
        remainingBurst[process.name] = process.burstTime;
        firstExecutionTime[process.name] = null;
    });

    while (completedProcesses.size < processes.length) {
        let availableProcesses = copy_process.filter(
            process => process.arrivalTime <= currentTime && !completedProcesses.has(process.name)
        );

        if (availableProcesses.length > 0) {
            let currentProcess = availableProcesses.reduce((minProcess, process) => {
                return remainingBurst[process.name] < remainingBurst[minProcess.name] ? process : minProcess;
            });

            let startTime = currentTime;

            if (firstExecutionTime[currentProcess.name] === null) {
                firstExecutionTime[currentProcess.name] = startTime;
            }

            // Execute process for 1 time unit
            currentTime += 1;
            remainingBurst[currentProcess.name] -= 1;

            // If it's a new entry or a different process, finalize the previous entry and start a new one
            if (!currentTimelineEntry || currentTimelineEntry.name !== currentProcess.name) {
                if (currentTimelineEntry) {
                    currentTimelineEntry.end = startTime;
                    timeline_SRTF.push(currentTimelineEntry);
                }
                currentTimelineEntry = { name: currentProcess.name, start: startTime, end: null };
            }

            // Check if the process is completed
            if (remainingBurst[currentProcess.name] === 0) {
                let completionTime = currentTime;
                let turnAroundTime = completionTime - currentProcess.arrivalTime;
                let waitingTime = turnAroundTime - currentProcess.burstTime;
                let responseTime = firstExecutionTime[currentProcess.name] - currentProcess.arrivalTime;

                result_SRTF.push({
                    name: currentProcess.name,
                    arrivalTime: currentProcess.arrivalTime,
                    burstTime: currentProcess.burstTime,
                    completionTime: completionTime,
                    turnAroundTime: turnAroundTime,
                    waitingTime: waitingTime,
                    responseTime: responseTime
                });

                completedProcesses.add(currentProcess.name);
                lastCompletionTime = completionTime;

                // Finalize the timeline entry for the completed process
                currentTimelineEntry.end = currentTime;
                timeline_SRTF.push(currentTimelineEntry);
                currentTimelineEntry = null;
            }
        } else {
            currentTime++;
        }

        currentTime += contextSwitch;
    }

    efficiency_SRTF = {
        CPUutilization: CPUutilizationCal(lastCompletionTime),
        Throughput: ThroughputCal(result_SRTF.length, lastCompletionTime),
        avgTurnAroundTime: avgTurnAroundTime(result_SRTF),
        avgWaitingTime: avgWaitingTime(result_SRTF),
        avgResponseTime: avgResponseTime(result_SRTF)
    };
}




