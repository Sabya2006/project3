// --- 1. DATA STATE MANAGEMENT (Memory & Presets) ---
let appState = JSON.parse(localStorage.getItem('myEmployeesData')) || {
    isSubscribed: false,
    users: [
        { email: 'employees568@gmail.com', id: 'ADHR0001', pass: 'Employees123', role: 'Admin' },
        { email: 'hr@gmail.com', id: 'HR00001', pass: 'Employees123', role: 'HR' },
        { email: 'emp@gmail.com', id: 'EM00001', pass: 'Employees123', role: 'Employee' }
    ],
    employees: [
        { id: 'ADHR0001', name: 'System Admin', email: 'employees568@gmail.com', role: 'Admin', post: 'Administrator', dept: 'Executive', salary: 2500000 },
        { id: 'HR00001', name: 'HR Manager', email: 'hr@gmail.com', role: 'HR', post: 'Head of HR', dept: 'Human Resources', salary: 1500000 },
        { id: 'EM00001', name: 'Normal Employee', email: 'emp@gmail.com', role: 'Employee', post: 'Software Engineer', dept: 'Engineering', salary: 800000 }
    ],
    departments:[
        { name: 'Executive', manager: 'Admin', used: 10 },
        { name: 'Human Resources', manager: 'HR Manager', used: 25 },
        { name: 'Engineering', manager: 'Alice Sharma', used: 75 }
    ],
    leaves:[
        { empId: 'EM00001', empName: 'Normal Employee', type: 'Sick Leave', days: 2, status: 'Pending' }
    ],
    attendance: [],
    reviews: [],
    counters: { Admin: 2, HR: 2, Employee: 2 }
};

let currentContext = { role: null, id: null };

function saveData() {
    localStorage.setItem('myEmployeesData', JSON.stringify(appState));
}

function resetData() {
    if(confirm("Factory Reset? This will delete all created data.")) {
        localStorage.removeItem('myEmployeesData');
        location.reload();
    }
}

// --- RENDER FUNCTIONS ---
function renderAll() {
    renderDashboard();
    renderEmployees();
    renderDepartments();
    renderLeaves();
    renderAttendance();
    renderPerformance();
    updateId();
    
    // Manage Trial Banner Visibility
    const banner = document.getElementById('trialBanner');
    if(banner) {
        if(appState.isSubscribed) banner.classList.add('hidden');
        else banner.classList.remove('hidden');
    }
}

function renderDashboard() {
    let list = appState.employees;
    if(currentContext.role === 'Employee') {
        list = appState.employees.filter(e => e.id === currentContext.id);
    }
    
    document.getElementById('statTotal').innerText = list.length;
    
    if(currentContext.role === 'Employee') {
        const myData = list[0];
        document.getElementById('statPayroll').innerText = myData ? '₹' + (myData.salary/100000).toFixed(1) + 'L' : 'N/A';
        document.getElementById('payrollLabel').innerText = 'My Salary';
        document.getElementById('empCountLabel').innerText = 'My Profile';
    } else {
        const total = appState.employees.reduce((acc, e) => acc + (e.salary || 0), 0);
        document.getElementById('statPayroll').innerText = '₹' + (total / 100000).toFixed(1) + 'L';
        document.getElementById('payrollLabel').innerText = 'Total Payroll';
        document.getElementById('empCountLabel').innerText = 'Total Employees';
    }
}

function renderEmployees() {
    const tbody = document.getElementById('empTable');
    tbody.innerHTML = '';
    
    let list = appState.employees;
    if(currentContext.role === 'Employee') list = list.filter(e => e.id === currentContext.id);

    list.forEach(e => {
        let color = "bg-blue-100 text-blue-700";
        if(e.role === 'Admin') color = "bg-purple-100 text-purple-700";
        
        const btn = currentContext.role === 'Employee' ? '' : 
            `<button class="text-red-400 hover:text-red-600 admin-only" onclick="deleteEmployee('${e.id}')"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition fade-in";
        tr.innerHTML = `
            <td class="p-4 font-mono text-xs font-bold text-indigo-500">${e.id}</td>
            <td class="p-4"><div class="font-medium text-slate-700 dark:text-slate-200">${e.name}</div><div class="text-xs text-slate-400">${e.email}</div></td>
            <td class="p-4 text-sm text-slate-500">${e.role}</td>
            <td class="p-4"><span class="${color} px-2 py-1 rounded text-xs font-bold">${e.dept}</span></td>
            <td class="admin-only p-4 text-right">${btn}</td>
        `;
        tbody.appendChild(tr);
    });
    lucide.createIcons();
}

function renderDepartments() {
    const grid = document.getElementById('deptGrid');
    grid.innerHTML = '';
    appState.departments.forEach((d, i) => {
        const delBtn = currentContext.role === 'Employee' ? '' : 
            `<button onclick="deleteDepartment(${i})" class="absolute top-3 right-3 text-red-400 hover:text-red-600 admin-only"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
        
        const div = document.createElement('div');
        div.className = "bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 fade-in relative";
        div.innerHTML = `
            ${delBtn}
            <h3 class="font-bold text-lg mb-2 dark:text-white">${d.name}</h3>
            <p class="text-sm text-slate-500 mb-4">Manager: ${d.manager}</p>
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2"><div class="bg-indigo-500 h-2 rounded-full" style="width: ${d.used}%"></div></div>
            <p class="text-xs text-slate-400">Budget: ${d.used}% Used</p>
        `;
        grid.appendChild(div);
    });
    lucide.createIcons();
}

function renderLeaves() {
    const list = document.getElementById('leaveList');
    list.innerHTML = '';
    
    let displayList = appState.leaves;
    if(currentContext.role === 'Employee') displayList = displayList.filter(l => l.empId === currentContext.id);

    displayList.forEach((l, i) => {
        const div = document.createElement('div');
        div.className = "bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center fade-in";
        
        let actions = '';
        if(l.status === 'Pending' && currentContext.role !== 'Employee') {
            actions = `<button class="p-2 bg-green-100 text-green-700 rounded-lg mr-2" onclick="updateLeave(${i}, 'Approved')"><i data-lucide="check" class="w-4 h-4"></i></button>
                       <button class="p-2 bg-red-100 text-red-700 rounded-lg" onclick="updateLeave(${i}, 'Rejected')"><i data-lucide="x" class="w-4 h-4"></i></button>`;
        } else {
            const color = l.status === 'Approved' ? 'bg-green-100 text-green-800' : (l.status==='Rejected'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800');
            actions = `<span class="${color} px-2 py-1 rounded text-xs font-bold">${l.status}</span>`;
        }

        div.innerHTML = `<div><h4 class="font-bold dark:text-white">${l.empName}</h4><p class="text-sm text-slate-500">${l.type} • ${l.days} Days</p></div><div>${actions}</div>`;
        list.appendChild(div);
    });
    lucide.createIcons();
}

function renderAttendance() {
    const tbody = document.getElementById('attendanceTable');
    tbody.innerHTML = '';
    
    let list = appState.employees;
    if(currentContext.role === 'Employee') list = list.filter(e => e.id === currentContext.id);
    const today = new Date().toISOString().split('T')[0];

    list.forEach(e => {
        const record = appState.attendance.find(a => a.empId === e.id && a.date === today);
        const status = record ? record.status : 'Not Marked';
        
        let actions = '';
        if(currentContext.role !== 'Employee' || (currentContext.role === 'Employee' && status === 'Not Marked')) {
             actions = `<button onclick="markAtt('${e.id}','Present')" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded mr-2 font-bold">Present</button>
                        <button onclick="markAtt('${e.id}','Absent')" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-bold">Absent</button>`;
        } else {
             const color = status === 'Present' ? 'text-green-500' : 'text-red-500';
             actions = `<span class="${color} font-bold text-sm">${status}</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="p-4 font-bold dark:text-white">${e.name}</td><td class="p-4 text-right">${actions}</td>`;
        tbody.appendChild(tr);
    });
}

function renderPerformance() {
     const grid = document.getElementById('performanceGrid');
     grid.innerHTML = '';
     let list = appState.reviews;
     if(currentContext.role === 'Employee') list = list.filter(r => r.empId === currentContext.id);
     
     list.forEach(r => {
         const div = document.createElement('div');
         div.className = "bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm fade-in";
         div.innerHTML = `<div class="flex justify-between mb-2"><h4 class="font-bold dark:text-white">${r.empName}</h4><span class="text-yellow-500 font-bold">${r.rating}/5 ⭐</span></div><p class="text-sm italic opacity-70">"${r.review}"</p>`;
         grid.appendChild(div);
     });
}

// --- ACTIONS ---
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const id = document.getElementById('loginId').value.trim().toUpperCase();
    const pass = document.getElementById('loginPassword').value.trim();
    const btn = document.getElementById('btnText');
    
    btn.innerText = "Verifying...";
    setTimeout(() => {
        const user = appState.users.find(u => u.email === email && u.id === id && u.pass === pass);
        if(user) {
            currentContext = { role: user.role, id: user.id };
            document.getElementById('loginScreen').classList.add('slide-out');
            document.getElementById('appScreen').classList.remove('hidden');
            document.getElementById('appScreen').classList.add('fade-in');
            
            document.getElementById('userAvatar').innerText = user.role.substring(0,2).toUpperCase();
            document.getElementById('currentIdLabel').innerText = user.id;
            
            if(user.role === 'Employee') {
                 document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
            }
            
            renderAll();
        } else {
            alert('Invalid Login');
            btn.innerText = "Login";
        }
    }, 600);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const id = document.getElementById('regEmpId').value.toUpperCase();
    const pass = document.getElementById('regPassword').value;
    
    let role = 'Employee';
    if(id.startsWith('ADHR')) role = 'Admin';
    else if(id.startsWith('HR')) role = 'HR';
    
    appState.users.push({ email, id, pass, role });
    appState.employees.push({ id, name, email, role, post: 'New User', dept: 'General', salary: 500000 });
    
    saveData();
    alert("Registered! Please Login.");
    showLogin();
}

function saveEmployee() {
    const name = document.getElementById('newName').value;
    const email = document.getElementById('newEmail').value;
    const id = document.getElementById('newId').value;
    const role = document.getElementById('newRole').value;
    const post = document.getElementById('newPost').value;
    const dept = document.getElementById('newDept').value;
    const salary = Number(document.getElementById('newSalary').value);

    appState.employees.push({ id, name, email, role, post, dept, salary });
    appState.users.push({ email, id, pass: 'Pass123', role }); 
    
    if(role === 'Admin') appState.counters.Admin++;
    else if(role === 'HR') appState.counters.HR++;
    else appState.counters.Employee++;
    
    saveData();
    renderAll();
    closeModal('modal');
    showToast("Employee Added");
}

function deleteEmployee(id) {
    if(confirm("Delete Employee?")) {
        appState.employees = appState.employees.filter(e => e.id !== id);
        appState.users = appState.users.filter(u => u.id !== id);
        saveData();
        renderAll();
    }
}

function saveDepartment() {
    const name = document.getElementById('deptName').value;
    const manager = document.getElementById('deptManager').value;
    appState.departments.push({ name, manager, used: 0 });
    saveData();
    renderAll();
    closeModal('deptModal');
}

function deleteDepartment(i) {
    appState.departments.splice(i, 1);
    saveData();
    renderAll();
}

function submitLeave() {
    const type = document.getElementById('leaveType').value;
    const days = document.getElementById('leaveDays').value;
    const user = appState.employees.find(e => e.id === currentContext.id);
    appState.leaves.push({ empId: user.id, empName: user.name, type, days, status: 'Pending' });
    saveData();
    renderAll();
    closeModal('leaveModal');
    showToast("Leave Requested");
}

function updateLeave(i, status) {
    appState.leaves[i].status = status;
    saveData();
    renderAll();
}

function markAtt(id, status) {
    const today = new Date().toISOString().split('T')[0];
    appState.attendance.push({ empId: id, date: today, status });
    saveData();
    renderAll();
}

function savePerformance() {
    const empId = document.getElementById('perfEmpId').value;
    const rating = document.getElementById('perfRating').value;
    const review = document.getElementById('perfReview').value;
    const emp = appState.employees.find(e => e.id === empId);
    
    appState.reviews.push({ empId, empName: emp.name, rating, review });
    saveData();
    renderAll();
    closeModal('performanceModal');
}

// --- UI ---
function switchTab(tabId) {
    ['dashboard','employees','departments','leaves','attendance','performance','documents','meeting','chat'].forEach(id => {
        document.getElementById('view-' + id).classList.add('hidden');
        document.getElementById('nav-' + id).classList.remove('active-nav');
    });
    document.getElementById('view-' + tabId).classList.remove('hidden');
    document.getElementById('nav-' + tabId).classList.add('active-nav');
    document.getElementById('pageTitle').innerText = tabId.charAt(0).toUpperCase() + tabId.slice(1);
}

function showRegister() { document.getElementById('loginScreen').classList.add('hidden'); document.getElementById('registerScreen').classList.remove('hidden'); }
function showLogin() { document.getElementById('registerScreen').classList.add('hidden'); document.getElementById('loginScreen').classList.remove('hidden'); }
function openModal() { document.getElementById('modal').classList.remove('hidden'); updateId(); }
function openDeptModal() { document.getElementById('deptModal').classList.remove('hidden'); }
function openLeaveModal() { document.getElementById('leaveModal').classList.remove('hidden'); }

// --- PAYMENT MODAL LOGIC ---
function openPaymentModal() {
    document.getElementById('paymentModal').classList.remove('hidden');
    document.getElementById('planSelection').classList.remove('hidden');
    document.getElementById('qrCodeSection').classList.add('hidden');
}

function showQRCode() {
    document.getElementById('planSelection').classList.add('hidden');
    document.getElementById('qrCodeSection').classList.remove('hidden');
}

function hideQRCode() {
    document.getElementById('planSelection').classList.remove('hidden');
    document.getElementById('qrCodeSection').classList.add('hidden');
}

function completePayment() {
    appState.isSubscribed = true;
    saveData();
    renderAll();
    closeModal('paymentModal');
    showToast("Payment Successful! Premium Unlocked.");
}

function openPerformanceModal() {
    const s = document.getElementById('perfEmpId'); s.innerHTML='<option value="">Select...</option>';
    appState.employees.forEach(e => s.innerHTML += `<option value="${e.id}">${e.name}</option>`);
    document.getElementById('performanceModal').classList.remove('hidden');
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function updateId() {
    const r = document.getElementById('newRole').value;
    let p="EM", c=appState.counters.Employee, pad=5;
    if(r==='Admin'){p="ADHR";c=appState.counters.Admin;pad=4;}
    if(r==='HR'){p="HR";c=appState.counters.HR;pad=5;}
    document.getElementById('newId').value = p + String(c).padStart(pad, '0');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    t.style.transform="translateX(0)"; t.style.opacity="1";
    setTimeout(()=>{ t.style.transform="translateX(200%)"; t.style.opacity="0"; }, 3000);
}

function handleLogout() { location.reload(); }
function toggleTheme() { document.documentElement.classList.toggle('dark'); }

lucide.createIcons();