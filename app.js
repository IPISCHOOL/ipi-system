// ============ IPI SaaS Application ============

// ============ State Management ============
let currentRole = null;
let currentUser = null;
let currentAdminTab = 'internal';
let currentWeekOffset = 0;
let currentMonthOffset = 0;
let currentViolationTab = 'good';

// ============ Default Credentials ============
const defaultCredentials = {
    admin: [
        { username: 'PAI-ADMIN-31600', password: 'PAI-ITIM-008855', realName: 'ผู้ดูแลระบบหลัก' }
    ],
    internal: [
        { username: 'staff001', password: '123456', realName: 'สมชาย ใจดี' },
        { username: 'staff002', password: '123456', realName: 'สมหญิง รักเรียน' }
    ],
    parent: [
        { username: 'parent001', password: '123456', realName: 'นายประสิทธิ์ รักลูก' },
        { username: 'parent002', password: '123456', realName: 'นางสมใจ ห่วงลูก' }
    ]
};

// ============ Initialize Data ============
function initializeData() {
    // Initialize credentials if not exists
    if (!localStorage.getItem('ipi_credentials')) {
        localStorage.setItem('ipi_credentials', JSON.stringify(defaultCredentials));
    }

    // Initialize members if not exists
    if (!localStorage.getItem('ipi_members')) {
        const sampleMembers = [
            { id: '001', name: 'เด็กชายอัณณ์วิชร ธนะดี', class: 'ม.2/2', club: 'ดนตรีสากล', phone: '081-234-5678', email: 'student1@ipi.ac.th' },
            { id: '002', name: 'เด็กหญิงกัลยา สุขสันต์', class: 'ม.2/3', club: 'ศิลปะ', phone: '082-345-6789', email: 'student2@ipi.ac.th' },
            { id: '003', name: 'เด็กชายภาคิน วิทยา', class: 'ม.3/1', club: 'กีฬา', phone: '083-456-7890', email: 'student3@ipi.ac.th' }
        ];
        localStorage.setItem('ipi_members', JSON.stringify(sampleMembers));
    }

    // Initialize clubs if not exists
    if (!localStorage.getItem('ipi_clubs')) {
        const sampleClubs = [
            { name: 'ชมรมดนตรีสากล', supervisor: 'อาจารย์สมศักดิ์ เสียงดี', members: 25, description: 'ฝึกซ้อมดนตรีและการแสดง' },
            { name: 'ชมรมศิลปะ', supervisor: 'อาจารย์วิไล พู่กัน', members: 20, description: 'วาดภาพและงานศิลปะ' },
            { name: 'ชมรมกีฬา', supervisor: 'อาจารย์สุเทพ แข็งแรง', members: 35, description: 'กีฬาหลากหลายประเภท' },
            { name: 'ชมรมวิทยาศาสตร์', supervisor: 'อาจารย์ปัญญา ฉลาด', members: 18, description: 'ทดลองและค้นคว้าวิทยาศาสตร์' },
            { name: 'ชมรมภาษาอังกฤษ', supervisor: 'อาจารย์นิรันดร์ English', members: 22, description: 'ฝึกทักษะภาษาอังกฤษ' },
            { name: 'ชมรมคอมพิวเตอร์', supervisor: 'อาจารย์เทคโน ล้ำสมัย', members: 28, description: 'โปรแกรมมิ่งและเทคโนโลยี' }
        ];
        localStorage.setItem('ipi_clubs', JSON.stringify(sampleClubs));
    }

    // Initialize training data if not exists
    if (!localStorage.getItem('ipi_training')) {
        const trainingData = {};
        localStorage.setItem('ipi_training', JSON.stringify(trainingData));
    }

    // Initialize violation data if not exists
    if (!localStorage.getItem('ipi_violations')) {
        const sampleViolations = {
            good: [],
            bad: []
        };
        localStorage.setItem('ipi_violations', JSON.stringify(sampleViolations));
    }

    // Initialize activity data if not exists
    if (!localStorage.getItem('ipi_activity')) {
        localStorage.setItem('ipi_activity', JSON.stringify({}));
    }
}

// ============ Navigation Functions ============
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function selectRole(role) {
    currentRole = role;
    showScreen('loginScreen');

    // Update login title based on role
    const titles = {
        internal: 'บุคคลภายใน',
        admin: 'ผู้บริหาร',
        parent: 'ผู้ปกครอง'
    };

    document.getElementById('loginSubtitle').textContent = titles[role];

    // Check for remembered credentials
    const remembered = localStorage.getItem(`ipi_remember_${role}`);
    if (remembered) {
        const data = JSON.parse(remembered);
        document.getElementById('username').value = data.username;
        document.getElementById('password').value = data.password;
        document.getElementById('rememberMe').checked = true;
    } else {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('rememberMe').checked = false;
    }

    // Hide error message
    document.getElementById('errorMessage').classList.add('hidden');
}

function goBack() {
    showScreen('roleScreen');
    currentRole = null;
}

function backToDashboard() {
    showScreen('dashboardScreen');
}

// ============ Authentication Functions ============
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const roleCredentials = credentials[currentRole] || [];

    const user = roleCredentials.find(u => u.username === username && u.password === password);

    if (user) {
        // Login successful
        currentUser = { ...user, role: currentRole };

        // Remember credentials if checked
        if (rememberMe) {
            localStorage.setItem(`ipi_remember_${currentRole}`, JSON.stringify({ username, password }));
        } else {
            localStorage.removeItem(`ipi_remember_${currentRole}`);
        }

        // Update dashboard
        document.getElementById('currentUserName').textContent = user.realName;

        const roleBadges = {
            internal: 'บุคคลภายใน',
            admin: 'ผู้บริหาร',
            parent: 'ผู้ปกครอง'
        };
        document.getElementById('userRoleBadge').textContent = roleBadges[currentRole];

        // Show/hide admin panel
        const adminPanel = document.getElementById('adminPanel');
        if (currentRole === 'admin') {
            adminPanel.classList.add('visible');
        } else {
            adminPanel.classList.remove('visible');
        }

        // Show/hide director panel
        const directorPanel = document.getElementById('directorPanel');
        const director = JSON.parse(localStorage.getItem('ipi_director') || 'null');

        if (director && director.username === user.username) {
            directorPanel.classList.remove('director-only');
        } else {
            directorPanel.classList.add('director-only');
        }

        // Show dashboard
        showScreen('dashboardScreen');
        document.getElementById('errorMessage').classList.add('hidden');
    } else {
        // Login failed
        document.getElementById('errorMessage').classList.remove('hidden');
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showScreen('roleScreen');
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.querySelector('.toggle-password i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ============ Module Navigation ============
function openModule(module) {
    switch (module) {
        case 'training':
            document.getElementById('trainingUserName').textContent = currentUser.realName;
            loadTrainingData();
            showScreen('trainingModule');
            break;
        case 'violation':
            document.getElementById('violationUserName').textContent = currentUser.realName;
            loadViolationData();
            showScreen('violationModule');
            break;
        case 'members':
            loadMemberData();
            showScreen('membersModule');
            break;
        case 'activity':
            loadActivityData();
            showScreen('activityModule');
            break;
        case 'clubs':
            loadClubsData();
            showScreen('clubsModule');
            break;
        case 'admin':
            if (currentRole === 'admin') {
                loadUserData();
                showScreen('adminModule');
            }
            break;
        case 'profile':
            loadProfileData();
            showScreen('profileModule');
            break;
    }
}

// ============ Training Report Functions ============
// New Before/After workflow

let trainingData = {
    title: '',
    beforeImage: '',
    afterImage: '',
    beforeDate: '',
    beforeTime: '',
    afterDate: '',
    afterTime: ''
};

function loadTrainingData() {
    // Initialize training records if not exists
    if (!localStorage.getItem('ipi_training_reports')) {
        localStorage.setItem('ipi_training_reports', JSON.stringify([]));
    }

    // Show menu, hide sections
    document.getElementById('trainingMenu').classList.remove('hidden');
    document.getElementById('trainingHistorySection').classList.add('hidden');
    document.getElementById('trainingReportSection').classList.add('hidden');
}

function backToTrainingMenu() {
    document.getElementById('trainingMenu').classList.remove('hidden');
    document.getElementById('trainingHistorySection').classList.add('hidden');
    document.getElementById('trainingReportSection').classList.add('hidden');
    resetTrainingForm();
}

function showTrainingHistory() {
    document.getElementById('trainingMenu').classList.add('hidden');
    document.getElementById('trainingHistorySection').classList.remove('hidden');
    loadTrainingHistory();
}

function loadTrainingHistory() {
    const reports = JSON.parse(localStorage.getItem('ipi_training_reports') || '[]');
    const tbody = document.getElementById('trainingHistoryBody');
    tbody.innerHTML = '';

    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-secondary);">ยังไม่มีประวัติการฝึกซ้อม</td></tr>';
        return;
    }

    reports.forEach((report, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${report.date}</td>
            <td>${report.time}</td>
            <td>${report.title}</td>
            <td><img src="${report.beforeImage}" alt="Before" onclick="viewImage('${report.beforeImage}')"></td>
            <td><img src="${report.afterImage}" alt="After" onclick="viewImage('${report.afterImage}')"></td>
        `;
        tbody.appendChild(row);
    });
}

function startTrainingReport() {
    document.getElementById('trainingMenu').classList.add('hidden');
    document.getElementById('trainingReportSection').classList.remove('hidden');

    // Reset form
    resetTrainingForm();

    // Show before form
    document.getElementById('beforeForm').classList.remove('hidden');
    document.getElementById('afterForm').classList.add('hidden');
    document.getElementById('confirmForm').classList.add('hidden');

    // Set auto date/time
    updateAutoDateTime('before');

    // Reset steps
    document.getElementById('step1').classList.add('active');
    document.getElementById('step1').classList.remove('completed');
    document.getElementById('step2').classList.remove('active', 'completed');
    document.getElementById('step3').classList.remove('active', 'completed');
}

function updateAutoDateTime(step) {
    const now = new Date();
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const date = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    if (step === 'before') {
        document.getElementById('beforeDate').textContent = date;
        document.getElementById('beforeTime').textContent = time;
        trainingData.beforeDate = date;
        trainingData.beforeTime = time;
    } else {
        document.getElementById('afterDate').textContent = date;
        document.getElementById('afterTime').textContent = time;
        trainingData.afterDate = date;
        trainingData.afterTime = time;
    }
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;

            // Save to training data
            if (previewId === 'beforeImagePreview') {
                trainingData.beforeImage = e.target.result;
            } else {
                trainingData.afterImage = e.target.result;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function goToAfterStep() {
    const title = document.getElementById('trainingTitle').value;

    if (!title) {
        alert('กรุณากรอกหัวข้อการฝึก');
        return;
    }

    if (!trainingData.beforeImage) {
        alert('กรุณาเลือกรูปภาพก่อนฝึก');
        return;
    }

    trainingData.title = title;

    // Update steps
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step1').classList.add('completed');
    document.getElementById('step2').classList.add('active');

    // Show after form
    document.getElementById('beforeForm').classList.add('hidden');
    document.getElementById('afterForm').classList.remove('hidden');

    // Set auto date/time for after
    updateAutoDateTime('after');
}

function goToConfirmStep() {
    if (!trainingData.afterImage) {
        alert('กรุณาเลือกรูปภาพหลังฝึก');
        return;
    }

    // Update steps
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step2').classList.add('completed');
    document.getElementById('step3').classList.add('active');

    // Show confirm form
    document.getElementById('afterForm').classList.add('hidden');
    document.getElementById('confirmForm').classList.remove('hidden');

    // Populate confirmation
    document.getElementById('confirmTitle').textContent = trainingData.title;
    document.getElementById('confirmBeforeImage').src = trainingData.beforeImage;
    document.getElementById('confirmAfterImage').src = trainingData.afterImage;
}

function submitTrainingReport() {
    const report = {
        title: trainingData.title,
        date: trainingData.beforeDate,
        time: trainingData.beforeTime,
        beforeImage: trainingData.beforeImage,
        afterImage: trainingData.afterImage
    };

    const reports = JSON.parse(localStorage.getItem('ipi_training_reports') || '[]');
    reports.push(report);
    localStorage.setItem('ipi_training_reports', JSON.stringify(reports));

    alert('บันทึกรายงานการฝึกซ้อมสำเร็จ!');

    // Go to history
    showTrainingHistory();
}

function resetTrainingForm() {
    trainingData = {
        title: '',
        beforeImage: '',
        afterImage: '',
        beforeDate: '',
        beforeTime: '',
        afterDate: '',
        afterTime: ''
    };

    document.getElementById('trainingTitle').value = '';
    document.getElementById('beforeImagePreview').innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>คลิกเพื่อเลือกรูปภาพ</p>';
    document.getElementById('afterImagePreview').innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>คลิกเพื่อเลือกรูปภาพ</p>';
    document.getElementById('beforeImage').value = '';
    document.getElementById('afterImage').value = '';
}

function viewImage(src) {
    window.open(src, '_blank');
}

// ============ Violation Report Functions ============
function loadViolationData() {
    const violations = JSON.parse(localStorage.getItem('ipi_violations'));
    const tbody = document.getElementById('violationBody');
    tbody.innerHTML = '';

    // Calculate scores
    let goodTotal = violations.good.reduce((sum, v) => sum + v.score, 0);
    let badTotal = violations.bad.reduce((sum, v) => sum + v.score, 0);
    let totalScore = goodTotal + badTotal;

    document.getElementById('goodScore').textContent = `+${goodTotal}`;
    document.getElementById('badScore').textContent = `${badTotal}`;
    document.getElementById('totalScore').textContent = totalScore >= 0 ? `+${totalScore}` : `${totalScore}`;

    // Show data based on current tab
    const data = currentViolationTab === 'good' ? violations.good : violations.bad;

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        const scoreClass = item.score > 0 ? 'style="color: #69f0ae;"' : 'style="color: #ff6b6b;"';
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.detail}</td>
            <td ${scoreClass}>${item.score > 0 ? '+' : ''}${item.score}</td>
            <td>${item.date}</td>
        `;
        tbody.appendChild(row);
    });
}

function switchTab(tab) {
    currentViolationTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadViolationData();
}

// ============ Member Functions ============
// Now loads from internal staff credentials instead of separate members list
function loadMemberData() {
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const internalStaff = credentials.internal || [];
    const tbody = document.getElementById('memberBody');
    tbody.innerHTML = '';

    internalStaff.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="clickable-name" onclick="showMemberDetail('${user.username}', '${user.realName}')">${user.username}</td>
            <td>${user.realName}</td>
            <td><span class="status-badge">บุคคลภายใน</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Current member data for modal
let currentMemberDetail = { username: '', realName: '' };

function showMemberDetail(username, realName) {
    currentMemberDetail = { username, realName };

    document.getElementById('detailUsername').textContent = username;
    document.getElementById('detailRealName').textContent = realName;

    // Calculate scores for this member
    const violations = JSON.parse(localStorage.getItem('ipi_violations') || '{"good":[],"bad":[]}');

    // Filter scores by member name
    const memberGoodScores = violations.good.filter(v => v.member === realName);
    const memberBadScores = violations.bad.filter(v => v.member === realName);

    const goodTotal = memberGoodScores.reduce((sum, v) => sum + v.score, 0);
    const badTotal = memberBadScores.reduce((sum, v) => sum + v.score, 0);
    const totalScore = goodTotal + badTotal;

    // Display scores
    document.getElementById('detailGoodScore').textContent = `+${goodTotal}`;
    document.getElementById('detailBadScore').textContent = `${badTotal}`;
    document.getElementById('detailTotalScore').textContent = totalScore >= 0 ? `+${totalScore}` : `${totalScore}`;

    document.getElementById('memberDetailModal').classList.add('active');
}

// ============ Activity Check-in Functions ============
function loadActivityData() {
    const members = JSON.parse(localStorage.getItem('ipi_members'));
    const activity = JSON.parse(localStorage.getItem('ipi_activity'));

    // Update month display
    const today = new Date();
    today.setMonth(today.getMonth() + currentMonthOffset);
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    document.getElementById('currentMonth').textContent =
        `${thaiMonths[today.getMonth()]} ${today.getFullYear() + 543}`;

    // Build header
    const header = document.getElementById('activityHeader');
    header.innerHTML = '<th>ชื่อ-นามสกุล</th>';

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= Math.min(daysInMonth, 15); i++) {
        header.innerHTML += `<th>${i}</th>`;
    }

    // Build body
    const tbody = document.getElementById('activityBody');
    tbody.innerHTML = '';

    members.forEach((member, mIndex) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${member.name}</td>`;

        for (let i = 1; i <= Math.min(daysInMonth, 15); i++) {
            const key = `${today.getFullYear()}-${today.getMonth()}-${i}-${mIndex}`;
            const checked = activity[key] ? 'checked' : '';
            row.innerHTML += `<td><input type="checkbox" data-key="${key}" ${checked}></td>`;
        }

        tbody.appendChild(row);
    });
}

function changeMonth(offset) {
    currentMonthOffset += offset;
    loadActivityData();
}

function saveActivity() {
    const checkboxes = document.querySelectorAll('#activityBody input[type="checkbox"]');
    const activity = {};

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            activity[checkbox.dataset.key] = true;
        }
    });

    localStorage.setItem('ipi_activity', JSON.stringify(activity));
    alert('บันทึกข้อมูลสำเร็จ!');
}

// ============ Clubs Functions ============
function loadClubsData() {
    const clubs = JSON.parse(localStorage.getItem('ipi_clubs'));
    const grid = document.getElementById('clubsGrid');
    grid.innerHTML = '';

    clubs.forEach(club => {
        const card = document.createElement('div');
        card.className = 'club-card';
        card.innerHTML = `
            <h4><i class="fas fa-users"></i> ${club.name}</h4>
            <p><strong>ผู้ดูแล:</strong> ${club.supervisor}</p>
            <p><strong>สมาชิก:</strong> ${club.members} คน</p>
            <p><strong>กิจกรรม:</strong> ${club.description}</p>
        `;
        grid.appendChild(card);
    });
}

// ============ Admin Functions ============
function loadUserData() {
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const users = credentials[currentAdminTab] || [];
    const tbody = document.getElementById('userBody');
    tbody.innerHTML = '';

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td>${user.realName}</td>
            <td>
                <button class="delete-btn" onclick="deleteUser(${index})"><i class="fas fa-trash"></i> ลบ</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function switchAdminTab(tab) {
    currentAdminTab = tab;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadUserData();
}

function addUser(event) {
    event.preventDefault();

    const newUser = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        realName: document.getElementById('newRealName').value
    };

    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    if (!credentials[currentAdminTab]) {
        credentials[currentAdminTab] = [];
    }
    credentials[currentAdminTab].push(newUser);
    localStorage.setItem('ipi_credentials', JSON.stringify(credentials));

    // Clear form
    document.getElementById('addUserForm').reset();

    loadUserData();
    alert('เพิ่มผู้ใช้สำเร็จ!');
}

function deleteUser(index) {
    if (confirm('คุณต้องการลบผู้ใช้นี้หรือไม่?')) {
        const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
        credentials[currentAdminTab].splice(index, 1);
        localStorage.setItem('ipi_credentials', JSON.stringify(credentials));
        loadUserData();
    }
}

// ============ Password Change Functions ============
function openChangePassword() {
    document.getElementById('passwordModal').classList.add('active');
    document.getElementById('changePasswordForm').reset();
    document.getElementById('passwordError').classList.add('hidden');
    document.getElementById('passwordSuccess').classList.add('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function changePassword(event) {
    event.preventDefault();

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate old password
    if (oldPassword !== currentUser.password) {
        showPasswordError('รหัสผ่านเดิมไม่ถูกต้อง');
        return;
    }

    // Validate new passwords match
    if (newPassword !== confirmPassword) {
        showPasswordError('รหัสผ่านใหม่ไม่ตรงกัน');
        return;
    }

    // Validate new password is different
    if (newPassword === oldPassword) {
        showPasswordError('รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านเดิม');
        return;
    }

    // Update password in credentials
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const users = credentials[currentRole];
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('ipi_credentials', JSON.stringify(credentials));

        // Update current user
        currentUser.password = newPassword;

        // Update remembered password if exists
        const remembered = localStorage.getItem(`ipi_remember_${currentRole}`);
        if (remembered) {
            const data = JSON.parse(remembered);
            if (data.username === currentUser.username) {
                data.password = newPassword;
                localStorage.setItem(`ipi_remember_${currentRole}`, JSON.stringify(data));
            }
        }

        document.getElementById('passwordError').classList.add('hidden');
        document.getElementById('passwordSuccess').classList.remove('hidden');

        setTimeout(() => {
            closeModal('passwordModal');
        }, 1500);
    }
}

function showPasswordError(message) {
    const errorDiv = document.getElementById('passwordError');
    errorDiv.querySelector('span').textContent = message;
    errorDiv.classList.remove('hidden');
    document.getElementById('passwordSuccess').classList.add('hidden');
}

// ============ Utility Functions ============
function formatThaiDate(date) {
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function formatShortDate(date) {
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
}

// ============ Initialize Application ============
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    showScreen('roleScreen');
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// ============ New Admin Section Functions ============
let currentScoreTab = 'good';

function openAdminSection(section) {
    // Hide main menu
    document.getElementById('adminMainMenu').classList.add('hidden');

    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));

    // Show selected section
    switch (section) {
        case 'users':
            document.getElementById('adminUsersSection').classList.remove('hidden');
            loadUserData();
            break;
        case 'scores':
            document.getElementById('adminScoresSection').classList.remove('hidden');
            loadScoreData();
            break;
        case 'members':
            document.getElementById('adminMembersSection').classList.remove('hidden');
            loadAdminMemberData();
            break;
        case 'training':
            document.getElementById('adminTrainingSection').classList.remove('hidden');
            break;
        case 'clubs':
            document.getElementById('adminClubsSection').classList.remove('hidden');
            loadAdminClubData();
            break;
    }
}

function backToAdminMenu() {
    // Show main menu
    document.getElementById('adminMainMenu').classList.remove('hidden');

    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
}

// ============ Score Management Functions ============
function switchScoreTab(tab) {
    currentScoreTab = tab;
    document.querySelectorAll('#adminScoresSection .admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadScoreData();
}

function loadScoreMemberSelect() {
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const internalStaff = credentials.internal || [];
    const select = document.getElementById('scoreMemberSelect');
    select.innerHTML = '<option value="">-- เลือกสมาชิก --</option>';

    internalStaff.forEach(user => {
        const option = document.createElement('option');
        option.value = user.realName;
        option.textContent = `${user.realName} (${user.username})`;
        select.appendChild(option);
    });
}

function loadScoreData() {
    const violations = JSON.parse(localStorage.getItem('ipi_violations'));
    const data = violations[currentScoreTab] || [];
    const tbody = document.getElementById('scoreBody');
    tbody.innerHTML = '';

    // Also load member dropdown
    loadScoreMemberSelect();

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        const scoreClass = item.score > 0 ? 'style="color: #69f0ae;"' : 'style="color: #ff6b6b;"';
        const memberName = item.member || '-';
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${memberName}</td>
            <td>${item.detail}</td>
            <td ${scoreClass}>${item.score > 0 ? '+' : ''}${item.score}</td>
            <td>${item.date}</td>
            <td>
                <button class="delete-btn" onclick="deleteScore(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addScore(event) {
    event.preventDefault();

    let scoreValue = parseInt(document.getElementById('scoreValue').value);
    const memberName = document.getElementById('scoreMemberSelect').value;

    // Adjust score based on tab (bad scores should be negative)
    if (currentScoreTab === 'bad' && scoreValue > 0) {
        scoreValue = -scoreValue;
    } else if (currentScoreTab === 'good' && scoreValue < 0) {
        scoreValue = Math.abs(scoreValue);
    }

    // Auto-generate Thai date
    const today = new Date();
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const autoDate = `${today.getDate()} ${thaiMonths[today.getMonth()]} ${today.getFullYear() + 543}`;

    const newScore = {
        member: memberName,
        detail: document.getElementById('scoreDetail').value,
        score: scoreValue,
        date: autoDate
    };

    const violations = JSON.parse(localStorage.getItem('ipi_violations'));
    violations[currentScoreTab].push(newScore);
    localStorage.setItem('ipi_violations', JSON.stringify(violations));

    // Clear form
    document.getElementById('addScoreForm').reset();
    loadScoreData();
    alert('เพิ่มคะแนนสำเร็จ!');
}

function deleteScore(index) {
    if (confirm('คุณต้องการลบคะแนนนี้หรือไม่?')) {
        const violations = JSON.parse(localStorage.getItem('ipi_violations'));
        violations[currentScoreTab].splice(index, 1);
        localStorage.setItem('ipi_violations', JSON.stringify(violations));
        loadScoreData();
    }
}

// ============ Admin Member Management Functions ============
function loadAdminMemberData() {
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const internalStaff = credentials.internal || [];
    const tbody = document.getElementById('adminMemberBody');
    tbody.innerHTML = '';

    internalStaff.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.realName}</td>
            <td>${user.username}</td>
            <td>บุคคลภายใน</td>
            <td>
                <button class="delete-btn" onclick="deleteMemberAdmin(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addMemberAdmin(event) {
    event.preventDefault();

    const member = {
        name: document.getElementById('adminMemberName').value,
        id: document.getElementById('adminMemberId').value,
        class: '',
        club: document.getElementById('adminMemberClub').value || '-',
        phone: '',
        email: ''
    };

    const members = JSON.parse(localStorage.getItem('ipi_members'));
    members.push(member);
    localStorage.setItem('ipi_members', JSON.stringify(members));

    // Clear form
    document.getElementById('addMemberForm').reset();
    loadAdminMemberData();
    alert('เพิ่มสมาชิกสำเร็จ!');
}

function deleteMemberAdmin(index) {
    if (confirm('คุณต้องการลบสมาชิกนี้หรือไม่?')) {
        const members = JSON.parse(localStorage.getItem('ipi_members'));
        members.splice(index, 1);
        localStorage.setItem('ipi_members', JSON.stringify(members));
        loadAdminMemberData();
    }
}

// ============ Admin Club Management Functions ============
function loadAdminClubData() {
    const clubs = JSON.parse(localStorage.getItem('ipi_clubs'));
    const tbody = document.getElementById('adminClubBody');
    tbody.innerHTML = '';

    clubs.forEach((club, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${club.name}</td>
            <td>${club.supervisor}</td>
            <td>${club.members} คน</td>
            <td>
                <button class="delete-btn" onclick="deleteClub(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addClub(event) {
    event.preventDefault();

    const club = {
        name: document.getElementById('clubName').value,
        supervisor: document.getElementById('clubSupervisor').value,
        members: parseInt(document.getElementById('clubMembers').value),
        description: document.getElementById('clubDescription').value || '-'
    };

    const clubs = JSON.parse(localStorage.getItem('ipi_clubs'));
    clubs.push(club);
    localStorage.setItem('ipi_clubs', JSON.stringify(clubs));

    // Clear form
    document.getElementById('addClubForm').reset();
    loadAdminClubData();
    alert('เพิ่มชมรมสำเร็จ!');
}

function deleteClub(index) {
    if (confirm('คุณต้องการลบชมรมนี้หรือไม่?')) {
        const clubs = JSON.parse(localStorage.getItem('ipi_clubs'));
        clubs.splice(index, 1);
        localStorage.setItem('ipi_clubs', JSON.stringify(clubs));
        loadAdminClubData();
    }
}

// ============ Clear All Data Function ============
function clearAllData() {
    if (confirm('คุณต้องการล้างข้อมูลทั้งหมดหรือไม่?\n\nคำเตือน: ข้อมูลทั้งหมดจะถูกลบและรีเซ็ตเป็นค่าเริ่มต้น!')) {
        if (confirm('ยืนยันอีกครั้ง: ต้องการล้างข้อมูลทั้งหมดจริงหรือไม่?')) {
            localStorage.removeItem('ipi_credentials');
            localStorage.removeItem('ipi_members');
            localStorage.removeItem('ipi_clubs');
            localStorage.removeItem('ipi_training');
            localStorage.removeItem('ipi_violations');
            localStorage.removeItem('ipi_activity');

            // Reinitialize with default data
            initializeData();

            alert('ล้างข้อมูลและรีเซ็ตเป็นค่าเริ่มต้นสำเร็จ!');
            logout();
        }
    }
}

// ============ SCORE REQUEST SYSTEM (with Director Approval) ============
let scoreImageData = '';

function previewScoreImage(input) {
    const preview = document.getElementById('scoreImagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            scoreImageData = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function submitScoreRequest(event) {
    event.preventDefault();

    const member = document.getElementById('scoreMemberSelect').value;
    const detail = document.getElementById('scoreDetail').value;
    let scoreValue = parseInt(document.getElementById('scoreValue').value);

    if (!member) {
        alert('กรุณาเลือกสมาชิก');
        return;
    }

    // Adjust score based on tab
    if (currentScoreTab === 'bad' && scoreValue > 0) {
        scoreValue = -scoreValue;
    } else if (currentScoreTab === 'good' && scoreValue < 0) {
        scoreValue = Math.abs(scoreValue);
    }

    const now = new Date();
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const date = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const request = {
        id: Date.now(),
        member: member,
        type: currentScoreTab,
        score: scoreValue,
        detail: detail,
        image: scoreImageData,
        date: date,
        time: time,
        status: 'pending'
    };

    // Save to pending requests
    let requests = JSON.parse(localStorage.getItem('ipi_score_requests') || '[]');
    requests.push(request);
    localStorage.setItem('ipi_score_requests', JSON.stringify(requests));

    // Reset form
    document.getElementById('addScoreForm').reset();
    document.getElementById('scoreImagePreview').innerHTML = '<i class="fas fa-camera"></i><p>คลิกเพื่อเลือกรูปภาพ</p>';
    scoreImageData = '';

    alert('ส่งคำขอเพิ่มคะแนนเรียบร้อยแล้ว รอการอนุมัติจากผู้อำนวยการ');
}

// ============ DIRECTOR ASSIGNMENT ============
function openAdminDirectorSection() {
    loadDirectorSelect();
    loadCurrentDirector();
}

function loadDirectorSelect() {
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const internalStaff = credentials.internal || [];
    const select = document.getElementById('directorSelect');

    select.innerHTML = '<option value="">-- เลือกบุคคล --</option>';

    internalStaff.forEach(user => {
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = `${user.realName} (${user.username})`;
        select.appendChild(option);
    });
}

function loadCurrentDirector() {
    const director = JSON.parse(localStorage.getItem('ipi_director') || 'null');
    const display = document.getElementById('currentDirectorDisplay');

    if (director) {
        display.innerHTML = `<i class="fas fa-user-tie"></i><span>${director.realName} (${director.username})</span>`;
    } else {
        display.innerHTML = `<i class="fas fa-user-tie"></i><span>ยังไม่ได้แต่งตั้ง</span>`;
    }
}

function assignDirector(event) {
    event.preventDefault();

    const username = document.getElementById('directorSelect').value;
    if (!username) return;

    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const user = credentials.internal.find(u => u.username === username);

    if (user) {
        const director = {
            username: user.username,
            realName: user.realName
        };
        localStorage.setItem('ipi_director', JSON.stringify(director));

        loadCurrentDirector();
        alert(`แต่งตั้ง ${user.realName} เป็นผู้อำนวยการเรียบร้อยแล้ว`);
    }
}

// ============ DIRECTOR DASHBOARD ============
function loadDirectorData() {
    loadPendingBadges();
    // Show menu grid and hide all sections
    document.querySelector('.director-menu-grid').classList.remove('hidden');
    document.getElementById('directorPendingSection').classList.add('hidden');
    document.getElementById('directorAppealsSection').classList.add('hidden');
    document.getElementById('directorConfirmSection').classList.add('hidden');
}

function loadPendingBadges() {
    const requests = JSON.parse(localStorage.getItem('ipi_score_requests') || '[]');
    const pendingRequests = requests.filter(r => r.status === 'pending');
    document.getElementById('pendingBadge').textContent = pendingRequests.length;

    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const pendingAppeals = appeals.filter(a => a.status === 'pending');
    document.getElementById('appealsBadge').textContent = pendingAppeals.length;

    const confirmAppeals = appeals.filter(a => a.status === 'task_done');
    document.getElementById('confirmBadge').textContent = confirmAppeals.length;
}

function openDirectorSection(section) {
    document.querySelectorAll('.director-menu-grid, #directorPendingSection, #directorAppealsSection, #directorConfirmSection').forEach(el => {
        el.classList.add('hidden');
    });

    if (section === 'pending') {
        document.getElementById('directorPendingSection').classList.remove('hidden');
        loadPendingScores();
    } else if (section === 'appeals') {
        document.getElementById('directorAppealsSection').classList.remove('hidden');
        loadDirectorAppeals();
    } else if (section === 'confirm') {
        document.getElementById('directorConfirmSection').classList.remove('hidden');
        loadConfirmAppeals();
    }
}

function backToDirectorMenu() {
    document.querySelectorAll('.director-menu-grid, #directorPendingSection, #directorAppealsSection, #directorConfirmSection').forEach(el => {
        el.classList.add('hidden');
    });
    document.querySelector('.director-menu-grid').classList.remove('hidden');
    loadPendingBadges();
}

function loadPendingScores() {
    const requests = JSON.parse(localStorage.getItem('ipi_score_requests') || '[]');
    const pending = requests.filter(r => r.status === 'pending');
    const tbody = document.getElementById('pendingScoreBody');
    tbody.innerHTML = '';

    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--text-secondary);">ไม่มีคำขอรอการอนุมัติ</td></tr>';
        return;
    }

    pending.forEach(req => {
        const typeText = req.type === 'good' ? '<span style="color:#69f0ae">คะแนนบวก</span>' : '<span style="color:#ff6b6b">คะแนนลบ</span>';
        const scoreColor = req.score > 0 ? '#69f0ae' : '#ff6b6b';
        const imageHtml = req.image ? `<img src="${req.image}" onclick="viewImage('${req.image}')">` : '-';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${req.date}</td>
            <td>${req.time}</td>
            <td>${req.member}</td>
            <td>${typeText}</td>
            <td style="color:${scoreColor}">${req.score > 0 ? '+' : ''}${req.score}</td>
            <td>${req.detail}</td>
            <td>${imageHtml}</td>
            <td>
                <button class="approve-btn" onclick="approveScore(${req.id})"><i class="fas fa-check"></i> อนุมัติ</button>
                <button class="reject-btn" onclick="rejectScore(${req.id})"><i class="fas fa-times"></i> ไม่อนุมัติ</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function approveScore(id) {
    if (!confirm('ยืนยันการอนุมัติคะแนนนี้?')) return;

    const requests = JSON.parse(localStorage.getItem('ipi_score_requests') || '[]');
    const request = requests.find(r => r.id === id);

    if (request) {
        // Add to violations
        const violations = JSON.parse(localStorage.getItem('ipi_violations'));
        const scoreEntry = {
            member: request.member,
            detail: request.detail,
            score: request.score,
            date: request.date,
            image: request.image
        };
        violations[request.type].push(scoreEntry);
        localStorage.setItem('ipi_violations', JSON.stringify(violations));

        // Update request status
        request.status = 'approved';
        localStorage.setItem('ipi_score_requests', JSON.stringify(requests));

        alert('อนุมัติคะแนนเรียบร้อยแล้ว');
        loadPendingScores();
        loadPendingBadges();
    }
}

function rejectScore(id) {
    if (!confirm('ยืนยันการไม่อนุมัติคะแนนนี้?')) return;

    const requests = JSON.parse(localStorage.getItem('ipi_score_requests') || '[]');
    const request = requests.find(r => r.id === id);

    if (request) {
        request.status = 'rejected';
        localStorage.setItem('ipi_score_requests', JSON.stringify(requests));

        alert('ปฏิเสธคำขอเรียบร้อยแล้ว');
        loadPendingScores();
        loadPendingBadges();
    }
}

// ============ SCORE APPEAL SYSTEM ============
let selectedViolationIndex = -1;
let currentAppealId = null;
let taskImageData = '';

function loadAppealData() {
    // Show menu, hide sections
    document.getElementById('appealMenu').classList.remove('hidden');
    document.getElementById('appealFormSection').classList.add('hidden');
    document.getElementById('appealStatusSection').classList.add('hidden');
    document.getElementById('taskCompletionSection').classList.add('hidden');
}

function backToAppealMenu() {
    document.getElementById('appealMenu').classList.remove('hidden');
    document.getElementById('appealFormSection').classList.add('hidden');
    document.getElementById('appealStatusSection').classList.add('hidden');
    document.getElementById('taskCompletionSection').classList.add('hidden');
}

function showAppealForm() {
    document.getElementById('appealMenu').classList.add('hidden');
    document.getElementById('appealFormSection').classList.remove('hidden');

    loadUserViolations();
    updateAppealDateTime();
}

function updateAppealDateTime() {
    const now = new Date();
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const date = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    document.getElementById('appealDate').textContent = date;
    document.getElementById('appealTime').textContent = time;
}

function loadUserViolations() {
    const violations = JSON.parse(localStorage.getItem('ipi_violations'));
    const badViolations = violations.bad || [];
    const tbody = document.getElementById('userViolationsBody');
    tbody.innerHTML = '';

    const userName = localStorage.getItem('ipi_currentUser');

    if (badViolations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-secondary);">ไม่มีคะแนนที่ถูกหัก</td></tr>';
        return;
    }

    badViolations.forEach((v, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="radio" name="violationSelect" value="${index}" onchange="selectedViolationIndex=${index}"></td>
            <td>${v.date}</td>
            <td>${v.detail}</td>
            <td style="color:#ff6b6b">${v.score}</td>
        `;
        tbody.appendChild(row);
    });
}

function submitAppeal(event) {
    event.preventDefault();

    if (selectedViolationIndex < 0) {
        alert('กรุณาเลือกรายการที่ต้องการขอคืน');
        return;
    }

    const reason = document.getElementById('appealReason').value;
    const violations = JSON.parse(localStorage.getItem('ipi_violations'));
    const violation = violations.bad[selectedViolationIndex];

    const now = new Date();
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const date = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;

    const appeal = {
        id: Date.now(),
        requester: localStorage.getItem('ipi_currentUser'),
        violationIndex: selectedViolationIndex,
        violationDetail: violation.detail,
        violationScore: violation.score,
        reason: reason,
        date: date,
        status: 'pending',
        directorTask: '',
        taskEvidence: '',
        taskNote: '',
        pointsReturned: 0
    };

    if (confirm('ยืนยันการส่งคำร้องขอคืนคะแนน?')) {
        let appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
        appeals.push(appeal);
        localStorage.setItem('ipi_appeals', JSON.stringify(appeals));

        document.getElementById('appealReason').value = '';
        selectedViolationIndex = -1;

        alert('ส่งคำร้องเรียบร้อยแล้ว รอการตอบรับจากผู้อำนวยการ');
        showAppealStatus();
    }
}

function showAppealStatus() {
    document.getElementById('appealMenu').classList.add('hidden');
    document.getElementById('appealFormSection').classList.add('hidden');
    document.getElementById('appealStatusSection').classList.remove('hidden');
    document.getElementById('taskCompletionSection').classList.add('hidden');

    loadMyAppeals();
}

function loadMyAppeals() {
    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const myAppeals = appeals.filter(a => a.requester === localStorage.getItem('ipi_currentUser'));
    const tbody = document.getElementById('myAppealsBody');
    tbody.innerHTML = '';

    if (myAppeals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-secondary);">ไม่มีคำร้อง</td></tr>';
        return;
    }

    myAppeals.forEach(appeal => {
        const statusText = getAppealStatusText(appeal.status);
        let actionHtml = '-';

        if (appeal.status === 'task_assigned') {
            actionHtml = `<button class="approve-btn" onclick="showTaskCompletion(${appeal.id})"><i class="fas fa-tasks"></i> ทำงาน</button>`;
        } else if (appeal.status === 'completed') {
            actionHtml = `<span class="status-completed">✓ คืนคะแนน ${appeal.pointsReturned} คะแนน</span>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appeal.date}</td>
            <td>${appeal.violationDetail}</td>
            <td>${statusText}</td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

function getAppealStatusText(status) {
    switch (status) {
        case 'pending': return '<span class="status-pending">รอการพิจารณา</span>';
        case 'task_assigned': return '<span class="status-task">มีงานให้ทำ</span>';
        case 'task_done': return '<span class="status-pending">รอยืนยันงาน</span>';
        case 'completed': return '<span class="status-completed">เสร็จสิ้น</span>';
        case 'rejected': return '<span class="status-rejected">ถูกปฏิเสธ</span>';
        default: return status;
    }
}

function showTaskCompletion(appealId) {
    currentAppealId = appealId;
    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const appeal = appeals.find(a => a.id === appealId);

    if (appeal) {
        document.getElementById('appealStatusSection').classList.add('hidden');
        document.getElementById('taskCompletionSection').classList.remove('hidden');

        document.getElementById('taskDetailCard').innerHTML = `
            <h4><i class="fas fa-clipboard-list"></i> งานที่ผู้อำนวยการกำหนด</h4>
            <p style="margin-top:10px; font-size:1.1rem;">${appeal.directorTask}</p>
        `;
    }
}

function previewTaskImage(input) {
    const preview = document.getElementById('taskImagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            taskImageData = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function backToAppealStatus() {
    showAppealStatus();
}

function submitTaskCompletion(event) {
    event.preventDefault();

    if (!taskImageData) {
        alert('กรุณาเลือกรูปภาพหลักฐาน');
        return;
    }

    if (!confirm('ยืนยันการส่งหลักฐาน?')) return;

    const note = document.getElementById('taskNote').value;
    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const appeal = appeals.find(a => a.id === currentAppealId);

    if (appeal) {
        appeal.taskEvidence = taskImageData;
        appeal.taskNote = note;
        appeal.status = 'task_done';
        localStorage.setItem('ipi_appeals', JSON.stringify(appeals));

        taskImageData = '';
        document.getElementById('taskNote').value = '';
        document.getElementById('taskImagePreview').innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>คลิกเพื่อเลือกรูปภาพ</p>';

        alert('ส่งหลักฐานเรียบร้อยแล้ว รอการยืนยันจากผู้อำนวยการ');
        showAppealStatus();
    }
}

// ============ DIRECTOR APPEALS PROCESSING ============
function loadDirectorAppeals() {
    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const pending = appeals.filter(a => a.status === 'pending');
    const tbody = document.getElementById('appealsBody');
    tbody.innerHTML = '';

    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-secondary);">ไม่มีคำร้องรอพิจารณา</td></tr>';
        return;
    }

    pending.forEach(appeal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appeal.date}</td>
            <td>${appeal.requester}</td>
            <td>${appeal.violationDetail} (${appeal.violationScore} คะแนน)</td>
            <td>${appeal.reason}</td>
            <td>
                <button class="approve-btn" onclick="assignTask(${appeal.id})"><i class="fas fa-tasks"></i> มอบหมายงาน</button>
                <button class="reject-btn" onclick="rejectAppeal(${appeal.id})"><i class="fas fa-times"></i> ปฏิเสธ</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function assignTask(appealId) {
    const task = prompt('ระบุสิ่งที่ผู้ร้องต้องทำ:');
    if (task) {
        const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
        const appeal = appeals.find(a => a.id === appealId);

        if (appeal) {
            appeal.directorTask = task;
            appeal.status = 'task_assigned';
            localStorage.setItem('ipi_appeals', JSON.stringify(appeals));

            alert('มอบหมายงานเรียบร้อยแล้ว');
            loadDirectorAppeals();
            loadPendingBadges();
        }
    }
}

function rejectAppeal(appealId) {
    if (!confirm('ยืนยันการปฏิเสธคำร้องนี้?')) return;

    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const appeal = appeals.find(a => a.id === appealId);

    if (appeal) {
        appeal.status = 'rejected';
        localStorage.setItem('ipi_appeals', JSON.stringify(appeals));

        alert('ปฏิเสธคำร้องเรียบร้อยแล้ว');
        loadDirectorAppeals();
        loadPendingBadges();
    }
}

function loadConfirmAppeals() {
    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const taskDone = appeals.filter(a => a.status === 'task_done');
    const tbody = document.getElementById('confirmBody');
    tbody.innerHTML = '';

    if (taskDone.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-secondary);">ไม่มีรายการรอยืนยัน</td></tr>';
        return;
    }

    taskDone.forEach(appeal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appeal.date}</td>
            <td>${appeal.requester}</td>
            <td>${appeal.directorTask}</td>
            <td><img src="${appeal.taskEvidence}" onclick="viewImage('${appeal.taskEvidence}')" style="max-width:60px; cursor:pointer;"></td>
            <td>
                <button class="approve-btn" onclick="confirmReturn(${appeal.id})"><i class="fas fa-check"></i> ยืนยันคืนคะแนน</button>
                <button class="reject-btn" onclick="rejectTaskCompletion(${appeal.id})"><i class="fas fa-times"></i> ไม่ผ่าน</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function confirmReturn(appealId) {
    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const appeal = appeals.find(a => a.id === appealId);

    if (appeal) {
        const maxPoints = Math.abs(appeal.violationScore);
        const points = prompt(`ระบุคะแนนที่จะคืน (สูงสุด ${maxPoints} คะแนน):`, maxPoints);

        if (points !== null) {
            const returnPoints = Math.min(parseInt(points), maxPoints);

            if (confirm(`ยืนยันการคืนคะแนน ${returnPoints} คะแนน ให้ ${appeal.requester}?`)) {
                if (confirm('ยืนยันอีกครั้ง?')) {
                    // Add positive score
                    const violations = JSON.parse(localStorage.getItem('ipi_violations'));
                    violations.good.push({
                        member: appeal.requester,
                        detail: `คืนคะแนน: ${appeal.violationDetail}`,
                        score: returnPoints,
                        date: new Date().toLocaleDateString('th-TH')
                    });
                    localStorage.setItem('ipi_violations', JSON.stringify(violations));

                    // Update appeal
                    appeal.pointsReturned = returnPoints;
                    appeal.status = 'completed';
                    localStorage.setItem('ipi_appeals', JSON.stringify(appeals));

                    alert(`คืนคะแนน ${returnPoints} คะแนน ให้ ${appeal.requester} เรียบร้อยแล้ว`);
                    loadConfirmAppeals();
                    loadPendingBadges();
                }
            }
        }
    }
}

function rejectTaskCompletion(appealId) {
    if (!confirm('ยืนยันว่างานไม่ผ่าน?')) return;

    const appeals = JSON.parse(localStorage.getItem('ipi_appeals') || '[]');
    const appeal = appeals.find(a => a.id === appealId);

    if (appeal) {
        appeal.status = 'task_assigned';
        appeal.taskEvidence = '';
        appeal.taskNote = '';
        localStorage.setItem('ipi_appeals', JSON.stringify(appeals));

        alert('ส่งกลับให้ทำใหม่เรียบร้อยแล้ว');
        loadConfirmAppeals();
        loadPendingBadges();
    }
}

// ============ UPDATE OPEN MODULE FOR NEW MODULES ============
const originalOpenModule = openModule;
openModule = function (moduleName) {
    // Handle new modules
    if (moduleName === 'director') {
        showScreen('directorModule');
        loadDirectorData();
    } else if (moduleName === 'appeal') {
        showScreen('appealModule');
        loadAppealData();
    } else {
        // Call original function for existing modules
        originalOpenModule(moduleName);
    }
}

// ============ UPDATE OPEN ADMIN SECTION FOR DIRECTOR ============
const originalOpenAdminSection = openAdminSection;
openAdminSection = function (section) {
    if (section === 'director') {
        // Hide main menu
        document.getElementById('adminMainMenu').classList.add('hidden');
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
        // Show director section
        document.getElementById('adminDirectorSection').classList.remove('hidden');
        openAdminDirectorSection();
    } else if (section === 'profiles') {
        // Hide main menu
        document.getElementById('adminMainMenu').classList.add('hidden');
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
        // Show profiles section
        document.getElementById('adminProfilesSection').classList.remove('hidden');
        loadAdminProfilesSection();
    } else {
        // Call original function for other sections
        originalOpenAdminSection(section);
    }
}

// ============ PROFILE MODULE FUNCTIONS ============
let profileAvatarData = '';

function loadProfileData() {
    if (!currentUser) return;

    // Initialize profile data if not exists
    let profiles = JSON.parse(localStorage.getItem('ipi_profiles') || '{}');
    let profile = profiles[currentUser.username] || {};

    // Get role name
    const roleNames = {
        internal: 'บุคคลภายใน',
        admin: 'ผู้บริหาร',
        parent: 'ผู้ปกครอง'
    };

    // Update profile view
    const profileNameEl = document.getElementById('profileName');
    const profileCard = document.querySelector('.profile-card');

    // Check if user is director
    const director = JSON.parse(localStorage.getItem('ipi_director') || 'null');
    const isDirector = director && director.username === currentUser.username;

    // Set default values based on role
    let displayPosition = profile.position || 'ไม่ระบุตำแหน่ง';
    let displayDepartment = profile.department || '-';
    let displayName = currentUser.realName || currentUser.username;
    let displayRole = roleNames[currentRole] || 'บุคคลภายใน';

    // Remove existing special classes
    profileNameEl.classList.remove('admin-name', 'director-name');
    profileCard.classList.remove('admin-card', 'director-card');

    // Admin is highest rank (check first)
    if (currentRole === 'admin') {
        displayPosition = '👑 ผู้บริหารสูงสุด';
        displayDepartment = 'Supreme Administrator';
        displayName = '🌟 ' + displayName + ' 🌟';
        displayRole = '👑 ผู้ดูแลระบบสูงสุด';
        profileNameEl.classList.add('admin-name');
        profileCard.classList.add('admin-card');
    } else if (isDirector) {
        displayPosition = '⭐ ผู้อำนวยการ';
        displayDepartment = 'Executive Office';
        displayName = '✨ ' + displayName;
        displayRole = '🏆 ผู้อำนวยการ';
        profileNameEl.classList.add('director-name');
        profileCard.classList.add('director-card');
    }

    profileNameEl.textContent = displayName;
    document.getElementById('profilePosition').textContent = displayPosition;
    document.getElementById('profileRole').textContent = displayRole;

    // Update details
    document.getElementById('detailName').textContent = currentUser.realName || '-';
    document.getElementById('detailUsername').textContent = currentUser.username || '-';
    document.getElementById('detailPosition').textContent = displayPosition;
    document.getElementById('detailDepartment').textContent = displayDepartment;

    // Update avatar
    const avatarDisplay = document.getElementById('profileAvatarDisplay');
    if (profile.avatar) {
        avatarDisplay.innerHTML = `<img src="${profile.avatar}" alt="Avatar">`;
    } else {
        avatarDisplay.innerHTML = '<i class="fas fa-user-circle"></i>';
    }

    // Show profile view, hide edit
    document.getElementById('profileView').classList.remove('hidden');
    document.getElementById('profileEdit').classList.add('hidden');
}

function showEditProfile() {
    if (!currentUser) return;

    // Get profile data
    let profiles = JSON.parse(localStorage.getItem('ipi_profiles') || '{}');
    let profile = profiles[currentUser.username] || {};

    // Populate form
    document.getElementById('editName').value = currentUser.realName || '';
    document.getElementById('editPosition').value = profile.position || '';
    document.getElementById('editDepartment').value = profile.department || '';
    document.getElementById('editPhone').value = profile.phone || '';
    document.getElementById('editEmail').value = profile.email || '';

    // Update avatar preview
    const avatarPreview = document.getElementById('avatarPreview');
    if (profile.avatar) {
        avatarPreview.innerHTML = `<img src="${profile.avatar}" alt="Avatar">`;
        profileAvatarData = profile.avatar;
    } else {
        avatarPreview.innerHTML = '<i class="fas fa-user-circle"></i>';
        profileAvatarData = '';
    }

    // Show edit form, hide view
    document.getElementById('profileView').classList.add('hidden');
    document.getElementById('profileEdit').classList.remove('hidden');
}

function cancelEditProfile() {
    document.getElementById('profileView').classList.remove('hidden');
    document.getElementById('profileEdit').classList.add('hidden');
}

function previewAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profileAvatarData = e.target.result;
            document.getElementById('avatarPreview').innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveProfile(event) {
    event.preventDefault();

    if (!currentUser) return;

    // Update profile data (only avatar)
    let profiles = JSON.parse(localStorage.getItem('ipi_profiles') || '{}');
    if (!profiles[currentUser.username]) {
        profiles[currentUser.username] = {};
    }
    profiles[currentUser.username].avatar = profileAvatarData;
    localStorage.setItem('ipi_profiles', JSON.stringify(profiles));

    alert('บันทึกรูปโปรไฟล์เรียบร้อยแล้ว!');
    loadProfileData();
}

// ============ ADMIN PROFILE MANAGEMENT ============
let selectedProfileUser = null;

function loadAdminProfilesSection() {
    loadAdminProfileSelect();
    document.getElementById('adminProfileEditForm').classList.add('hidden');
}

function loadAdminProfileSelect() {
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const internalStaff = credentials.internal || [];
    const select = document.getElementById('adminProfileSelect');

    select.innerHTML = '<option value="">-- เลือกผู้ใช้ --</option>';

    internalStaff.forEach(user => {
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = `${user.realName} (${user.username})`;
        select.appendChild(option);
    });
}

function loadUserProfileForEdit() {
    const username = document.getElementById('adminProfileSelect').value;
    if (!username) {
        document.getElementById('adminProfileEditForm').classList.add('hidden');
        return;
    }

    // Find user in credentials
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const user = credentials.internal.find(u => u.username === username);

    if (!user) return;

    selectedProfileUser = user;

    // Get profile data
    const profiles = JSON.parse(localStorage.getItem('ipi_profiles') || '{}');
    const profile = profiles[username] || {};

    // Populate form
    document.getElementById('adminEditName').value = user.realName || '';
    document.getElementById('adminEditPosition').value = profile.position || '';
    document.getElementById('adminEditDepartment').value = profile.department || '';

    // Show form
    document.getElementById('adminProfileEditForm').classList.remove('hidden');
}

function saveAdminProfileEdit(event) {
    event.preventDefault();

    if (!selectedProfileUser) return;

    const newName = document.getElementById('adminEditName').value;
    const position = document.getElementById('adminEditPosition').value;
    const department = document.getElementById('adminEditDepartment').value;

    // Update credentials (realName)
    const credentials = JSON.parse(localStorage.getItem('ipi_credentials'));
    const userIndex = credentials.internal.findIndex(u => u.username === selectedProfileUser.username);
    if (userIndex !== -1) {
        credentials.internal[userIndex].realName = newName;
        localStorage.setItem('ipi_credentials', JSON.stringify(credentials));
    }

    // Update profile data
    let profiles = JSON.parse(localStorage.getItem('ipi_profiles') || '{}');
    if (!profiles[selectedProfileUser.username]) {
        profiles[selectedProfileUser.username] = {};
    }
    profiles[selectedProfileUser.username].position = position;
    profiles[selectedProfileUser.username].department = department;
    localStorage.setItem('ipi_profiles', JSON.stringify(profiles));

    alert('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');

    // Reload select
    loadAdminProfileSelect();
    document.getElementById('adminProfileEditForm').classList.add('hidden');
    document.getElementById('adminProfileSelect').value = '';
    selectedProfileUser = null;
}
