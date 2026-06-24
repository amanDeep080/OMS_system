/* eslint-disable no-await-in-loop */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const {
  sequelize, User, Department, Employee, Attendance, Leave, Payroll, Performance,
  Announcement, Notification, Task, Document, Asset, Expense, AuditLog, Ticket,
  Post, Comment, Reaction, Course, Enrollment, Skill, EmployeeSkill, Kudos,
  Reward, RewardTransaction, Goal, InternalJob, TimelineEvent, Club, ClubMembership, Event
} = require('../models');

const SALT_ROUNDS = 10;
const TOTAL_EMPLOYEES = 1500;

const DEPARTMENTS = [
  { name: 'Engineering', code: 'ENG', color: '#1F3A5F' },
  { name: 'Product', code: 'PRD', color: '#2B6CB0' },
  { name: 'Human Resources', code: 'HR', color: '#C8893B' },
  { name: 'Finance', code: 'FIN', color: '#2F855A' },
  { name: 'Marketing', code: 'MKT', color: '#B83280' },
  { name: 'Sales', code: 'SAL', color: '#C53030' },
  { name: 'Operations', code: 'OPS', color: '#6B46C1' },
  { name: 'Customer Support', code: 'CS', color: '#319795' },
  { name: 'Logistics', code: 'LOG', color: '#975A16' },
  { name: 'Procurement', code: 'PRC', color: '#4A5568' },
  { name: 'Legal', code: 'LGL', color: '#702459' },
  { name: 'Compliance', code: 'CMP', color: '#2D3748' },
  { name: 'Security', code: 'SEC', color: '#E53E3E' },
  { name: 'Data Analytics', code: 'DAT', color: '#38A169' },
  { name: 'IT Support', code: 'ITS', color: '#3182CE' },
];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randomInt(0, arr.length - 1)]; }
function isWeekend(date) { const d = date.getDay(); return d === 0 || d === 6; }

async function run() {
  console.log('Connecting to database...');
  await sequelize.authenticate();
  console.log('Clearing existing data...');
  await sequelize.sync({ force: true });

  console.log('Seeding departments...');
  const deptMap = {};
  for (const d of DEPARTMENTS) {
    const rec = await Department.create({ name: d.name, code: d.code, colorTag: d.color, budget: randomInt(1000000, 10000000) });
    deptMap[d.code] = rec;
  }

  const allStaff = [];
  const usedEmails = new Set();
  const adminPass = await bcrypt.hash('Admin@123', SALT_ROUNDS);
  const hrPass = await bcrypt.hash('Hr@123', SALT_ROUNDS);
  const mgrPass = await bcrypt.hash('Manager@123', SALT_ROUNDS);
  const empPass = await bcrypt.hash('Employee@123', SALT_ROUNDS);

  const getUniqueEmail = (firstName, lastName) => {
    let email = faker.internet.email({ firstName, lastName }).toLowerCase();
    let counter = 1;
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@spreetail.com`;
      counter++;
    }
    usedEmails.add(email);
    return email;
  };

  console.log('Creating CEO...');
  const ceoEmail = 'admin@spreetail.com';
  const ceo = await Employee.create({
    employeeCode: 'EMP0001', firstName: 'Alexandra', lastName: 'Whitfield', email: ceoEmail,
    phone: '+1-555-0101', gender: 'female', designation: 'Chief Executive Officer',
    employmentType: 'full_time', joiningDate: '2015-01-01', annualSalary: 450000,
    bio: 'CEO of Spreetail. Passionate about e-commerce and innovation.'
  });
  usedEmails.add(ceoEmail);
  await User.create({ employeeId: ceo.id, email: ceoEmail, passwordHash: adminPass, role: 'super_admin' });
  allStaff.push(ceo);

  console.log('Creating Directors...');
  const directors = [];
  for (const code of Object.keys(deptMap)) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = getUniqueEmail(firstName, lastName);
    const d = await Employee.create({
      employeeCode: `DIR${code}`, firstName, lastName, email,
      phone: faker.phone.number(), gender: pick(['male', 'female']),
      departmentId: deptMap[code].id, designation: `${deptMap[code].name} Director`,
      joiningDate: faker.date.past({ years: 8 }), annualSalary: randomInt(200000, 300000), managerId: ceo.id
    });
    await User.create({ employeeId: d.id, email, passwordHash: mgrPass, role: code === 'HR' ? 'hr' : 'manager' });
    directors.push(d);
    allStaff.push(d);
    await deptMap[code].update({ headEmployeeId: d.id });
  }

  console.log('Creating Managers...');
  const managers = [];
  for (let i = 0; i < 50; i++) {
    const director = pick(directors);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let email = getUniqueEmail(firstName, lastName);

    if (i === 0) email = 'hr@spreetail.com';
    else if (i === 1) email = 'manager@spreetail.com';

    usedEmails.add(email);

    const m = await Employee.create({
      employeeCode: `MGR${String(i + 1).padStart(3, '0')}`, firstName, lastName, email,
      phone: faker.phone.number(), gender: pick(['male', 'female']),
      departmentId: director.departmentId, designation: `Team Lead`,
      joiningDate: faker.date.past({ years: 5 }), annualSalary: randomInt(120000, 180000), managerId: director.id
    });

    let role = 'manager';
    let pass = mgrPass;
    if (email === 'hr@spreetail.com') { role = 'hr'; pass = hrPass; }

    await User.create({ employeeId: m.id, email, passwordHash: pass, role });
    managers.push(m);
    allStaff.push(m);
  }

  console.log('Creating 1500 Employees...');
  const employeesToBulk = [];
  const usersToBulk = [];
  for (let i = 1; i <= TOTAL_EMPLOYEES; i++) {
    const manager = pick(managers);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = i === 1 ? 'employee@spreetail.com' : getUniqueEmail(firstName, lastName);
    const id = faker.string.uuid();

    employeesToBulk.push({
      id, employeeCode: `EMP${String(allStaff.length + i).padStart(4, '0')}`,
      firstName, lastName, email, phone: faker.phone.number(), gender: pick(['male', 'female', 'other']),
      departmentId: manager.departmentId, designation: 'Associate', joiningDate: faker.date.past({ years: 4 }),
      annualSalary: randomInt(50000, 110000), managerId: manager.id, rewardPoints: randomInt(100, 5000),
      dateOfBirth: faker.date.birthdate({ min: 22, max: 60, mode: 'age' }).toISOString().slice(0, 10),
      employmentStatus: 'active'
    });

    usersToBulk.push({
      employeeId: id,
      email,
      passwordHash: email === 'employee@spreetail.com' ? empPass : await bcrypt.hash('Employee@123', 5),
      role: 'employee'
    });

    if (employeesToBulk.length === 250) {
      await Employee.bulkCreate(employeesToBulk);
      await User.bulkCreate(usersToBulk);
      allStaff.push(...employeesToBulk);
      employeesToBulk.length = 0;
      usersToBulk.length = 0;
      console.log(`...seeded ${allStaff.length} employees total`);
    }
  }
  if (employeesToBulk.length > 0) {
    await Employee.bulkCreate(employeesToBulk);
    await User.bulkCreate(usersToBulk);
    allStaff.push(...employeesToBulk);
  }

  console.log('Seeding 6 months of Attendance for 200 employees...');
  const attendanceData = [];
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  for (const emp of allStaff.slice(0, 200)) {
    let curr = new Date(sixMonthsAgo);
    while (curr <= today) {
      if (!isWeekend(curr)) {
        const statusRoll = Math.random();
        let status = 'present';
        let checkIn = '09:00:00';
        let checkOut = '18:00:00';

        if (statusRoll < 0.05) { status = 'absent'; checkIn = null; checkOut = null; }
        else if (statusRoll < 0.15) { status = 'work_from_home'; }
        else if (statusRoll < 0.25) { status = 'late'; checkIn = '09:35:00'; }

        attendanceData.push({
          employeeId: emp.id,
          date: curr.toISOString().slice(0, 10),
          status,
          checkIn,
          checkOut,
          hoursWorked: status === 'absent' ? 0 : 8 + Math.random(),
          overtimeHours: Math.random() > 0.8 ? randomInt(1, 3) : 0
        });
      }
      curr.setDate(curr.getDate() + 1);
      if (attendanceData.length >= 2000) {
        await Attendance.bulkCreate(attendanceData);
        attendanceData.length = 0;
      }
    }
  }
  if (attendanceData.length > 0) await Attendance.bulkCreate(attendanceData);

  console.log('Seeding Leave Requests...');
  const leaveData = [];
  for (let i = 0; i < 1000; i++) {
    const emp = pick(allStaff);
    const start = faker.date.past();
    const end = new Date(start);
    const days = randomInt(1, 5);
    end.setDate(end.getDate() + days);
    leaveData.push({
      employeeId: emp.id,
      leaveType: pick(['sick_leave', 'casual_leave', 'earned_leave']),
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      totalDays: days,
      status: pick(['approved', 'approved', 'pending', 'rejected']),
      reason: faker.lorem.sentence(),
      appliedOn: start
    });
    if (leaveData.length === 500) { await Leave.bulkCreate(leaveData); leaveData.length = 0; }
  }
  if (leaveData.length > 0) await Leave.bulkCreate(leaveData);

  console.log('Seeding 12 months of Payroll for 300 employees...');
  const payrollData = [];
  let payslipCounter = 10000;
  for (let m = 1; m <= 12; m++) {
    for (const emp of allStaff.slice(0, 300)) {
      const basic = (emp.annualSalary || 60000) / 12 * 0.5;
      const hra = basic * 0.4;
      const gross = basic + hra + randomInt(1000, 2000);
      const tax = gross * 0.1;
      const net = gross - tax;

      payrollData.push({
        employeeId: emp.id,
        payslipNumber: `PAY-${payslipCounter++}`,
        month: m,
        year: 2024,
        basic,
        hra,
        otherAllowances: 1000,
        bonus: m === 12 ? 5000 : 0,
        tax,
        grossPay: gross,
        netPay: net,
        status: 'paid',
        paidOn: new Date(2024, m-1, 28).toISOString().slice(0, 10)
      });
      if (payrollData.length === 500) {
        await Payroll.bulkCreate(payrollData);
        payrollData.length = 0;
      }
    }
  }
  if (payrollData.length > 0) await Payroll.bulkCreate(payrollData);

  console.log('Seeding Announcements...');
  const annData = [];
  for (let i = 0; i < 100; i++) {
    annData.push({
      title: faker.company.catchPhrase(),
      body: faker.lorem.paragraphs(2),
      category: pick(['hiring', 'results', 'event', 'office_update', 'holiday', 'recognition', 'general']),
      postedById: pick(directors).id,
      postedAt: faker.date.past()
    });
  }
  await Announcement.bulkCreate(annData);

  console.log('Seeding Performance Reviews...');
  const perfData = [];
  for (const emp of allStaff.slice(0, 300)) {
    perfData.push({
      employeeId: emp.id,
      reviewerId: ceo.id,
      year: 2024,
      quarter: pick(['Q1', 'Q2', 'Q3']),
      rating: randomInt(3, 5),
      kpiScore: randomInt(75, 100),
      managerFeedback: faker.lorem.sentence(),
      reviewDate: new Date().toISOString().slice(0, 10)
    });
  }
  await Performance.bulkCreate(perfData);

  console.log('Seeding Tasks...');
  const taskData = [];
  for (let i = 0; i < 1500; i++) {
    const assignee = pick(allStaff);
    const creator = pick(managers.concat(directors));
    const status = pick(['pending', 'in_progress', 'completed']);
    taskData.push({
      title: faker.git.commitMessage(),
      description: faker.lorem.sentence(),
      priority: pick(['low', 'medium', 'high', 'critical']),
      status,
      assignedToId: assignee.id,
      assignedById: creator.id,
      dueDate: faker.date.future(),
      completedAt: status === 'completed' ? new Date() : null
    });
    if (taskData.length === 500) {
      await Task.bulkCreate(taskData);
      taskData.length = 0;
    }
  }
  if (taskData.length > 0) await Task.bulkCreate(taskData);

  console.log('Seeding Assets...');
  const assetData = [];
  for (let i = 0; i < 2000; i++) {
    const status = pick(['assigned', 'available', 'maintenance']);
    const emp = status === 'assigned' ? pick(allStaff) : null;
    assetData.push({
      name: pick(['MacBook Pro 14"', 'Dell XPS 15', 'iPhone 15', 'Monitor 27"', 'Logitech Mouse', 'Mechanical Keyboard']),
      type: pick(['laptop', 'phone', 'monitor', 'headset', 'other']),
      serialNumber: faker.string.alphanumeric(10).toUpperCase(),
      status,
      employeeId: emp ? emp.id : null,
      assignedAt: emp ? faker.date.past() : null,
      specifications: { ram: '16GB', storage: '512GB SSD' }
    });
    if (assetData.length === 500) {
      await Asset.bulkCreate(assetData);
      assetData.length = 0;
    }
  }
  if (assetData.length > 0) await Asset.bulkCreate(assetData);

  console.log('Seeding Expenses...');
  const expData = [];
  for (let i = 0; i < 1200; i++) {
    const emp = pick(allStaff);
    const status = pick(['paid', 'approved', 'pending', 'rejected']);
    expData.push({
      title: pick(['Client Dinner', 'Cloud Subscription', 'Home Office Desk', 'Business Trip', 'Training Course']),
      amount: randomInt(50, 2500),
      category: pick(['travel', 'food', 'internet', 'medical', 'office_supplies', 'other']),
      status,
      employeeId: emp.id,
      approvedById: (status === 'paid' || status === 'approved') ? pick(managers).id : null,
      notes: faker.lorem.sentence(),
      createdAt: faker.date.past()
    });
    if (expData.length === 400) {
      await Expense.bulkCreate(expData);
      expData.length = 0;
    }
  }
  if (expData.length > 0) await Expense.bulkCreate(expData);

  console.log('Seeding Audit Logs...');
  const auditLogs = [];
  const allUsers = await User.findAll({ attributes: ['id'] });
  for (let i = 0; i < 2000; i++) {
    auditLogs.push({
      userId: pick(allUsers).id,
      action: pick(['Created Employee', 'Updated Salary', 'Approved Leave', 'Logged In', 'Deleted Task']),
      module: pick(['Employee', 'Payroll', 'Leave', 'Auth', 'Task']),
      details: { info: faker.lorem.sentence() },
      ipAddress: faker.internet.ip(),
      createdAt: faker.date.past()
    });
    if (auditLogs.length === 500) {
      await AuditLog.bulkCreate(auditLogs);
      auditLogs.length = 0;
    }
  }
  if (auditLogs.length > 0) await AuditLog.bulkCreate(auditLogs);

  console.log('Seeding Social Content...');
  const postData = [];
  for (let i = 0; i < 1000; i++) {
    postData.push({
      content: faker.lorem.sentence(),
      type: pick(['update', 'achievement', 'news', 'event']),
      employeeId: pick(allStaff).id,
      hashtags: [faker.lorem.word()],
      createdAt: faker.date.recent({ days: 30 })
    });
    if (postData.length === 500) { await Post.bulkCreate(postData); postData.length = 0; }
  }
  if (postData.length > 0) await Post.bulkCreate(postData);

  const kudosData = [];
  for (let i = 0; i < 500; i++) {
    const giver = pick(allStaff);
    const receiver = pick(allStaff);
    if (giver.id !== receiver.id) {
      kudosData.push({
        giverId: giver.id,
        receiverId: receiver.id,
        message: faker.company.buzzPhrase(),
        type: pick(['Innovation', 'Leadership', 'Teamwork', 'Excellence'])
      });
    }
    if (kudosData.length === 250) { await Kudos.bulkCreate(kudosData); kudosData.length = 0; }
  }
  if (kudosData.length > 0) await Kudos.bulkCreate(kudosData);

  console.log('\n✅ Enterprise Seed complete!');
  await sequelize.close();
}

run().catch(console.error);
