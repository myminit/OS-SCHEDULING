describe('Scheduling Algorithms Web App', () => {
  
  beforeEach(() => {
    cy.visit('index.html'); // กำหนดให้ Cypress เข้าถึงหน้าเว็บของคุณ
  });
  
  it('should check if algorithms checkboxes are clickable and can be selected', () => {
    cy.get('input[name="fcfs"]').check().should('be.checked'); // ทดสอบการเลือก FCFS
    cy.get('input[name="rr"]').check().should('be.checked'); // ทดสอบการเลือก Round-Robin
    cy.get('input[name="sjf"]').check().should('be.checked'); // ทดสอบการเลือก SJF
  });

  it('should add processes and calculate Gantt chart and Comparison graph', () => {
    // เพิ่ม Process ใหม่
    cy.get('button.add-btn').click();
    
    // ตรวจสอบว่า Process ใหม่ถูกเพิ่มในตาราง
    cy.get('#process-table-body tr').should('have.length', 2);
    
    // กรอกข้อมูลในฟิลด์ Process ID, Arrival Time, Burst Time, Priority
    cy.get('td.arrival-time input').first().clear().type('2'); // กรอก Arrival Time
    cy.get('td.burst-time input').first().clear().type('5'); // กรอก Burst Time
    cy.get('td.priority input').first().clear().type('3'); // กรอก Priority
    
    // เลือกอัลกอริทึมที่ต้องการ
    cy.get('input[name="fcfs"]').check();
    
    // คลิกปุ่ม "Calculate"
    cy.get('button.calculate-btn').click();
    
    // ตรวจสอบว่า Gantt Chart และ Comparison Graph ถูกแสดงผล
    cy.get('#ganttCharts').should('be.visible');
    cy.get('#comparisonSection').should('be.visible');
    
    // ตรวจสอบว่า Gantt Chart มีการแสดงข้อมูล
    cy.get('.ganttChart').should('have.length', 1);
    
    // ตรวจสอบการแสดงผลของ Comparison Chart
    cy.get('#comparisonChart').should('be.visible');
  });
  
  it('should test the random process generation button', () => {
    // คลิกปุ่ม "Random Process"
    cy.get('button.random-btn').click();
    
    // ตรวจสอบว่า Process ใหม่ถูกเพิ่ม
    cy.get('#process-table-body tr').should('have.length', 2);  // 1 แถวเริ่มต้น + 1 แถวที่เพิ่มจากการสุ่ม
  });

  it('should reset the processes when clicking "Reset Process" button', () => {
    // กรอกข้อมูลในฟิลด์ต่าง ๆ และคลิกปุ่ม "Add Process"
    cy.get('button.add-btn').click();
    cy.get('td.arrival-time input').first().clear().type('3');
    cy.get('td.burst-time input').first().clear().type('4');
    cy.get('td.priority input').first().clear().type('2');
    
    // คลิกปุ่ม "Reset Process"
    cy.get('button.reset-btn').click();
    
    // ตรวจสอบว่า Process ถูกรีเซ็ต
    cy.get('#process-table-body tr').should('have.length', 1);  // ตรวจสอบว่าเหลือแค่ Process แถวเดียว
  });

  it('should show alert when no algorithm is selected', () => {
    // ไม่เลือกอัลกอริทึมใด ๆ
    cy.get('button.calculate-btn').click(); // คลิก "Calculate"
    
    // คาดว่าแจ้งเตือน "กรุณาเลือก Algorithm ที่ต้องการเปรียบเทียบ"
    cy.on('window:alert', (str) => {
      expect(str).to.equal('กรุณาเลือก Algorithm ที่ต้องการเปรียบเทียบ');
    });
  });

  it('should test Gantt chart rendering', () => {
    // เลือก FCFS algorithm
    cy.get('input[name="fcfs"]').check();
    
    // กรอกข้อมูล Process
    cy.get('button.add-btn').click();
    cy.get('td.arrival-time input').first().clear().type('1');
    cy.get('td.burst-time input').first().clear().type('5');
    
    // คลิก "Calculate"
    cy.get('button.calculate-btn').click();
    
    // ตรวจสอบว่า Gantt Chart มีการแสดงผล
    cy.get('.ganttChart').should('exist');
    cy.get('.ganttChart').should('contain', 'FCFS Gantt Chart');
  });
  
});
