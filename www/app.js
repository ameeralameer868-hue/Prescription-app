// MediCare Pro - Prescription Management App
// With SQLite Support for Cordova/Android

// Global variables
let db = null;
let prescriptions = [];
let currentLang = 'ar';
let currentColor = '#0891b2';
let medCounter = 0;
let currentLogo = null;
let isCordova = false;

// Translations
const translations = {
    ar: {
        appName: "MediCare Pro",
        prescriptionManagement: "إدارة الوصفات الطبية",
        totalPrescriptions: "إجمالي الوصفات",
        pendingPrescriptions: "قيد التنفيذ",
        completedPrescriptions: "تم الصرف",
        cancelledPrescriptions: "ملغاة",
        searchPlaceholder: "البحث باسم المريض...",
        allStatuses: "جميع الحالات",
        newPrescription: "وصفة جديدة",
        prescriptionsList: "قائمة الوصفات",
        archive: "الأرشيف",
        settings: "الإعدادات",
        patientData: "بيانات المريض",
        patientName: "اسم المريض",
        age: "العمر",
        fileNumber: "رقم الملف",
        date: "التاريخ",
        doctor: "الطبيب المعالج",
        doctorName: "اسم الطبيب",
        diagnosis: "التشخيص",
        medications: "الأدوية الموصوفة",
        addMedication: "إضافة دواء",
        medicationName: "اسم الدواء",
        dose: "الجرعة",
        frequency: "التكرار",
        duration: "المدة",
        route: "طريقة الأخذ",
        instructions: "تعليمات عامة",
        savePrescription: "حفظ الوصفة",
        noPrescriptions: "لا توجد وصفات محفوظة",
        createPrescriptionHint: "قم بإنشاء وصفة جديدة لحفظها هنا",
        systemSettings: "إعدادات النظام",
        hospitalLogo: "شعار المستشفى",
        hospitalNameAr: "اسم المستشفى (عربي)",
        hospitalNameEn: "اسم المستشفى (إنجليزي)",
        contactInfoAr: "معلومات الاتصال (عربي)",
        contactInfoEn: "معلومات الاتصال (إنجليزي)",
        identityColor: "لون الهوية",
        saveSettings: "حفظ الإعدادات",
        deleteLogo: "حذف الشعار",
        clickToSelectImage: "اختر صورة",
        prescriptionSaved: "تم حفظ الوصفة بنجاح!",
        prescriptionDeleted: "تم حذف الوصفة بنجاح!",
        prescriptionCancelled: "تم إلغاء الوصفة بنجاح!",
        settingsSaved: "تم حفظ الإعدادات بنجاح!",
        confirmDelete: "هل أنت متأكد من حذف هذه الوصفة؟",
        confirmCancel: "هل أنت متأكد من إلغاء هذه الوصفة؟",
        error: "حدث خطأ!",
        loading: "جاري التحميل...",
        status: "الحالة",
        actions: "الإجراءات",
        view: "عرض",
        print: "طباعة",
        edit: "تعديل",
        cancel: "إلغاء",
        delete: "حذف"
    },
    en: {
        appName: "MediCare Pro",
        prescriptionManagement: "Prescription Management",
        totalPrescriptions: "Total Prescriptions",
        pendingPrescriptions: "Pending",
        completedPrescriptions: "Dispensed",
        cancelledPrescriptions: "Cancelled",
        searchPlaceholder: "Search by patient name...",
        allStatuses: "All Statuses",
        newPrescription: "New Prescription",
        prescriptionsList: "Prescriptions List",
        archive: "Archive",
        settings: "Settings",
        patientData: "Patient Information",
        patientName: "Patient Name",
        age: "Age",
        fileNumber: "File Number",
        date: "Date",
        doctor: "Attending Physician",
        doctorName: "Doctor Name",
        diagnosis: "Diagnosis",
        medications: "Prescribed Medications",
        addMedication: "Add Medication",
        medicationName: "Medication Name",
        dose: "Dose",
        frequency: "Frequency",
        duration: "Duration",
        route: "Route",
        instructions: "Instructions",
        savePrescription: "Save Prescription",
        noPrescriptions: "No saved prescriptions",
        createPrescriptionHint: "Create a new prescription to save it here",
        systemSettings: "System Settings",
        hospitalLogo: "Hospital Logo",
        hospitalNameAr: "Hospital Name (Arabic)",
        hospitalNameEn: "Hospital Name (English)",
        contactInfoAr: "Contact Info (Arabic)",
        contactInfoEn: "Contact Info (English)",
        identityColor: "Identity Color",
        saveSettings: "Save Settings",
        deleteLogo: "Delete Logo",
        clickToSelectImage: "Select Image",
        prescriptionSaved: "Prescription saved successfully!",
        prescriptionDeleted: "Prescription deleted successfully!",
        prescriptionCancelled: "Prescription cancelled successfully!",
        settingsSaved: "Settings saved successfully!",
        confirmDelete: "Are you sure you want to delete this prescription?",
        confirmCancel: "Are you sure you want to cancel this prescription?",
        error: "An error occurred!",
        loading: "Loading...",
        status: "Status",
        actions: "Actions",
        view: "View",
        print: "Print",
        edit: "Edit",
        cancel: "Cancel",
        delete: "Delete"
    }
};

// Initialize app
document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('DOMContentLoaded', onDOMReady, false);

function onDOMReady() {
    // Set initial date
    document.getElementById('prescriptionDate').value = new Date().toLocaleDateString('ar-SA');
    
    // Add initial medication row
    addMedicationRow();
    
    // Update preview
    updatePreview();
}

function onDeviceReady() {
    isCordova = true;
    
    // Initialize SQLite database
    initDatabase();
    
    // Hide loading overlay
    setTimeout(() => {
        hideLoading();
    }, 1000);
    
    // Handle back button
    document.addEventListener('backbutton', onBackKeyDown, false);
}

// Database Functions
function initDatabase() {
    if (!window.sqlitePlugin) {
        console.log('SQLite plugin not available, using localStorage');
        useLocalStorage();
        return;
    }
    
    db = window.sqlitePlugin.openDatabase({
        name: 'prescriptions.db',
        location: 'default'
    });
    
    db.transaction(function(tx) {
        // Create prescriptions table
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS prescriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_name TEXT,
                patient_age TEXT,
                file_number TEXT,
                doctor_name TEXT,
                diagnosis TEXT,
                instructions TEXT,
                status TEXT DEFAULT 'pending',
                date TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create medications table
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS medications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prescription_id INTEGER,
                name TEXT,
                dose TEXT,
                frequency TEXT,
                duration TEXT,
                route TEXT,
                FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
            )
        `);
        
        // Create settings table
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);
    }, function(error) {
        console.log('Database creation error: ' + error.message);
        useLocalStorage();
    }, function() {
        console.log('Database created successfully');
        loadData();
        loadSettings();
    });
}

function useLocalStorage() {
    // Fallback to localStorage
    prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];
    loadPrescriptionsTable();
    loadArchive();
    updateStats();
    loadSettingsFromLocalStorage();
    hideLoading();
}

// Data Operations
function savePrescriptionToDB(prescription, callback) {
    if (!db) {
        // Use localStorage fallback
        prescriptions.push(prescription);
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
        if (callback) callback();
        return;
    }
    
    db.transaction(function(tx) {
        tx.executeSql(
            `INSERT INTO prescriptions (patient_name, patient_age, file_number, doctor_name, diagnosis, instructions, status, date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [prescription.patientName, prescription.patientAge, prescription.fileNumber, 
             prescription.doctorName, prescription.diagnosis, prescription.instructions, 
             prescription.status, prescription.date],
            function(tx, result) {
                const prescriptionId = result.insertId;
                
                // Insert medications
                prescription.medications.forEach(function(med) {
                    tx.executeSql(
                        `INSERT INTO medications (prescription_id, name, dose, frequency, duration, route) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [prescriptionId, med.name, med.dose, med.freq, med.duration, med.route]
                    );
                });
                
                prescription.id = prescriptionId;
                if (callback) callback();
            }
        );
    });
}

function getAllPrescriptions(callback) {
    if (!db) {
        if (callback) callback(prescriptions);
        return;
    }
    
    db.transaction(function(tx) {
        tx.executeSql(
            `SELECT * FROM prescriptions ORDER BY created_at DESC`,
            [],
            function(tx, result) {
                const items = [];
                for (let i = 0; i < result.rows.length; i++) {
                    items.push(result.rows.item(i));
                }
                
                // Get medications for each prescription
                let processedCount = 0;
                if (items.length === 0) {
                    if (callback) callback(items);
                    return;
                }
                
                items.forEach(function(item) {
                    tx.executeSql(
                        `SELECT * FROM medications WHERE prescription_id = ?`,
                        [item.id],
                        function(tx, medResult) {
                            item.medications = [];
                            for (let j = 0; j < medResult.rows.length; j++) {
                                const med = medResult.rows.item(j);
                                item.medications.push({
                                    name: med.name,
                                    dose: med.dose,
                                    freq: med.frequency,
                                    duration: med.duration,
                                    route: med.route
                                });
                            }
                            processedCount++;
                            if (processedCount === items.length && callback) {
                                callback(items);
                            }
                        }
                    );
                });
            }
        );
    });
}

function updatePrescriptionStatus(id, status, callback) {
    if (!db) {
        const p = prescriptions.find(x => x.id === id);
        if (p) {
            p.status = status;
            localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
        }
        if (callback) callback();
        return;
    }
    
    db.transaction(function(tx) {
        tx.executeSql(
            `UPDATE prescriptions SET status = ? WHERE id = ?`,
            [status, id],
            function() {
                if (callback) callback();
            }
        );
    });
}

function deletePrescriptionFromDB(id, callback) {
    if (!db) {
        prescriptions = prescriptions.filter(p => p.id !== id);
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
        if (callback) callback();
        return;
    }
    
    db.transaction(function(tx) {
        tx.executeSql(
            `DELETE FROM prescriptions WHERE id = ?`,
            [id],
            function() {
                if (callback) callback();
            }
        );
    });
}

function saveSettingsToDB(settings, callback) {
    if (!db) {
        localStorage.setItem('hospitalSettings', JSON.stringify(settings));
        if (callback) callback();
        return;
    }
    
    db.transaction(function(tx) {
        for (const [key, value] of Object.entries(settings)) {
            tx.executeSql(
                `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
                [key, JSON.stringify(value)]
            );
        }
        if (callback) callback();
    });
}

function getSettings(callback) {
    if (!db) {
        const settings = JSON.parse(localStorage.getItem('hospitalSettings')) || {};
        if (callback) callback(settings);
        return;
    }
    
    db.transaction(function(tx) {
        tx.executeSql(`SELECT * FROM settings`, [], function(tx, result) {
            const settings = {};
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                try {
                    settings[row.key] = JSON.parse(row.value);
                } catch (e) {
                    settings[row.key] = row.value;
                }
            }
            if (callback) callback(settings);
        });
    });
}

// UI Functions
function loadData() {
    getAllPrescriptions(function(items) {
        prescriptions = items;
        loadPrescriptionsTable();
        loadArchive();
        updateStats();
    });
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('langText').textContent = currentLang === 'ar' ? 'EN' : 'عربي';
    
    // Update page title
    document.getElementById('pageTitle').textContent = translations[currentLang].prescriptionManagement;
    
    // Update placeholders
    document.getElementById('searchInput').placeholder = translations[currentLang].searchPlaceholder;
    document.getElementById('diagnosis').placeholder = currentLang === 'ar' ? 'اكتب التشخيص هنا...' : 'Enter diagnosis...';
    document.getElementById('instructions').placeholder = currentLang === 'ar' ? 'اكتب التعليمات هنا...' : 'Enter instructions...';
    
    // Reload data
    loadPrescriptionsTable();
    loadArchive();
}

// Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
}

function onBackKeyDown() {
    if (document.getElementById('sidebar').classList.contains('open')) {
        closeSidebar();
    } else {
        navigator.app.exitApp();
    }
}

// Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    
    // Show selected section
    document.getElementById(section + '-section').classList.add('active');
    
    // Update nav tabs
    const tabs = document.querySelectorAll('.nav-tab');
    const tabIndex = section === 'new' ? 0 : section === 'list' ? 1 : section === 'archive' ? 2 : 3;
    if (tabs[tabIndex]) tabs[tabIndex].classList.add('active');
    
    // Update sidebar
    const menuLinks = document.querySelectorAll('.menu-link');
    if (menuLinks[tabIndex]) menuLinks[tabIndex].classList.add('active');
    
    // Show/hide elements based on section
    const statsSection = document.getElementById('statsSection');
    const filterSection = document.getElementById('filterSection');
    const tableSection = document.getElementById('tableSection');
    
    if (section === 'new') {
        statsSection.style.display = 'grid';
        filterSection.style.display = 'flex';
        tableSection.style.display = 'block';
    } else if (section === 'list') {
        statsSection.style.display = 'none';
        filterSection.style.display = 'none';
        tableSection.style.display = 'none';
        loadListTable();
    } else {
        statsSection.style.display = 'none';
        filterSection.style.display = 'none';
        tableSection.style.display = 'none';
    }
    
    // Close sidebar on mobile
    closeSidebar();
}

// Stats Functions
function updateStats() {
    const total = prescriptions.length;
    const pending = prescriptions.filter(p => p.status === 'pending').length;
    const completed = prescriptions.filter(p => p.status === 'completed').length;
    const cancelled = prescriptions.filter(p => p.status === 'cancelled').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('statCancelled').textContent = cancelled;
}

// Filter Functions
function filterPrescriptions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = prescriptions.filter(p => {
        const matchesSearch = p.patient_name ? 
            p.patient_name.toLowerCase().includes(searchTerm) : 
            p.patientName.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || (p.status === statusFilter);
        return matchesSearch && matchesStatus;
    });

    renderPrescriptionsTable(filtered);
}

// Table Functions
function loadPrescriptionsTable() {
    renderPrescriptionsTable(prescriptions);
}

function loadListTable() {
    const tbody = document.getElementById('listTableBody');
    
    if (prescriptions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">${currentLang === 'ar' ? 'لا توجد وصفات' : 'No prescriptions'}</td></tr>`;
        return;
    }

    tbody.innerHTML = prescriptions.map((p, index) => {
        const statusClass = p.status === 'completed' ? 'badge-success' : 
                          p.status === 'pending' ? 'badge-warning' : 'badge-danger';
        const statusText = currentLang === 'ar' ? 
            (p.status === 'completed' ? 'تم الصرف' : p.status === 'pending' ? 'قيد التنفيذ' : 'ملغاة') :
            (p.status === 'completed' ? 'Dispensed' : p.status === 'pending' ? 'Pending' : 'Cancelled');
        
        const patientName = p.patient_name || p.patientName;
        const doctorName = p.doctor_name || p.doctorName;
        const initial = patientName ? patientName.charAt(0) : '?';
        const colors = ['var(--primary)', 'var(--secondary)', 'var(--warning)', 'var(--danger)', 'var(--info)'];
        const color = colors[index % colors.length];

        return `
            <tr>
                <td><strong style="color: var(--primary);">#${p.id}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 28px; height: 28px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.8rem;">${initial}</div>
                        <span>${patientName}</span>
                    </div>
                </td>
                <td>${doctorName}</td>
                <td>${p.date}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-view" onclick="viewPrescription(${p.id})"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon btn-print" onclick="printPrescription(${p.id})"><i class="fas fa-print"></i></button>
                        ${p.status === 'pending' ? `<button class="btn-icon btn-delete" onclick="cancelPrescription(${p.id})"><i class="fas fa-times"></i></button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPrescriptionsTable(data) {
    const tbody = document.getElementById('prescriptionsTableBody');
    const totalCount = document.getElementById('totalCount');
    
    totalCount.textContent = (currentLang === 'ar' ? 'إجمالي: ' : 'Total: ') + data.length;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">${currentLang === 'ar' ? 'لا توجد نتائج' : 'No results'}</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((p, index) => {
        const statusClass = p.status === 'completed' ? 'badge-success' : 
                          p.status === 'pending' ? 'badge-warning' : 'badge-danger';
        const statusText = currentLang === 'ar' ? 
            (p.status === 'completed' ? 'تم الصرف' : p.status === 'pending' ? 'قيد التنفيذ' : 'ملغاة') :
            (p.status === 'completed' ? 'Dispensed' : p.status === 'pending' ? 'Pending' : 'Cancelled');
        
        const patientName = p.patient_name || p.patientName;
        const doctorName = p.doctor_name || p.doctorName;
        const initial = patientName ? patientName.charAt(0) : '?';
        const colors = ['var(--primary)', 'var(--secondary)', 'var(--warning)', 'var(--danger)', 'var(--info)'];
        const color = colors[index % colors.length];

        return `
            <tr>
                <td><strong style="color: var(--primary);">#${p.id}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 28px; height: 28px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.8rem;">${initial}</div>
                        <span>${patientName}</span>
                    </div>
                </td>
                <td>${doctorName}</td>
                <td>${p.date}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-view" onclick="viewPrescription(${p.id})"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon btn-print" onclick="printPrescription(${p.id})"><i class="fas fa-print"></i></button>
                        ${p.status === 'pending' ? `<button class="btn-icon btn-delete" onclick="cancelPrescription(${p.id})"><i class="fas fa-times"></i></button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Medication Functions
function addMedicationRow() {
    medCounter++;
    const tbody = document.getElementById('medTableBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td style="text-align: center; font-weight: 800;">${medCounter}</td>
        <td><input type="text" placeholder="${currentLang === 'ar' ? 'اسم الدواء' : 'Name'}" oninput="updatePreview()" class="med-name"></td>
        <td><input type="text" placeholder="${currentLang === 'ar' ? 'الجرعة' : 'Dose'}" oninput="updatePreview()" class="med-dose"></td>
        <td><input type="text" placeholder="${currentLang === 'ar' ? 'التكرار' : 'Freq'}" oninput="updatePreview()" class="med-freq"></td>
        <td><input type="text" placeholder="${currentLang === 'ar' ? 'المدة' : 'Dur'}" oninput="updatePreview()" class="med-duration"></td>
        <td><input type="text" placeholder="${currentLang === 'ar' ? 'طريقة' : 'Route'}" oninput="updatePreview()" class="med-route"></td>
        <td><button class="btn-remove btn-danger" onclick="removeMedRow(this)"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
    updatePreview();
}

function removeMedRow(btn) {
    btn.closest('tr').remove();
    renumberMeds();
    updatePreview();
}

function renumberMeds() {
    const rows = document.querySelectorAll('#medTableBody tr');
    medCounter = 0;
    rows.forEach((row) => {
        medCounter++;
        row.cells[0].textContent = medCounter;
    });
}

// Preview Functions
function updatePreview() {
    document.getElementById('previewPatientName').textContent = document.getElementById('patientName').value;
    document.getElementById('previewPatientAge').textContent = document.getElementById('patientAge').value;
    document.getElementById('previewFileNumber').textContent = document.getElementById('fileNumber').value;
    document.getElementById('previewDate').textContent = document.getElementById('prescriptionDate').value;
    document.getElementById('previewDoctorNameOnly').textContent = document.getElementById('doctorName').value;
    document.getElementById('previewDiagnosis').textContent = document.getElementById('diagnosis').value;
    document.getElementById('previewInstructions').textContent = document.getElementById('instructions').value;

    const previewTbody = document.getElementById('previewMedTable');
    previewTbody.innerHTML = '';
    
    const rows = document.querySelectorAll('#medTableBody tr');
    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${inputs[0].value}</td>
            <td>${inputs[1].value}</td>
            <td>${inputs[2].value}</td>
            <td>${inputs[3].value}</td>
            <td>${inputs[4].value}</td>
        `;
        previewTbody.appendChild(tr);
    });
}

// Save Prescription
function savePrescription() {
    const patientName = document.getElementById('patientName').value.trim();
    
    if (!patientName) {
        showToast(currentLang === 'ar' ? 'يرجى إدخال اسم المريض' : 'Please enter patient name', 'error');
        return;
    }
    
    const prescription = {
        patientName: patientName,
        patientAge: document.getElementById('patientAge').value,
        fileNumber: document.getElementById('fileNumber').value,
        doctorName: document.getElementById('doctorName').value,
        diagnosis: document.getElementById('diagnosis').value,
        instructions: document.getElementById('instructions').value,
        status: 'pending',
        date: new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US'),
        medications: []
    };

    const rows = document.querySelectorAll('#medTableBody tr');
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs[0].value.trim()) {
            prescription.medications.push({
                name: inputs[0].value,
                dose: inputs[1].value,
                freq: inputs[2].value,
                duration: inputs[3].value,
                route: inputs[4].value
            });
        }
    });

    savePrescriptionToDB(prescription, function() {
        showToast(translations[currentLang].prescriptionSaved, 'success');
        
        // Reload data
        loadData();
        
        // Reset form
        document.getElementById('patientName').value = '';
        document.getElementById('patientAge').value = '';
        document.getElementById('fileNumber').value = '';
        document.getElementById('diagnosis').value = '';
        document.getElementById('instructions').value = '';
        document.getElementById('medTableBody').innerHTML = '';
        medCounter = 0;
        addMedicationRow();
        updatePreview();
    });
}

// Archive Functions
function loadArchive() {
    const grid = document.getElementById('archiveGrid');
    const empty = document.getElementById('emptyArchive');
    
    if (prescriptions.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    grid.innerHTML = prescriptions.slice(0, 6).map(p => {
        const patientName = p.patient_name || p.patientName;
        const doctorName = p.doctor_name || p.doctorName;
        const meds = p.medications ? p.medications.map(m => m.name).join(' - ') : '';
        
        return `
            <div class="archive-card">
                <div class="archive-date"><i class="fas fa-calendar-alt"></i> ${p.date}</div>
                <div class="archive-patient">${patientName}</div>
                <div class="archive-doctor"><i class="fas fa-user-md"></i> ${doctorName}</div>
                <div class="archive-meds">${meds}</div>
                <div class="archive-actions">
                    <button class="btn-action btn-view" onclick="viewPrescription(${p.id})"><i class="fas fa-eye"></i> ${currentLang === 'ar' ? 'عرض' : 'View'}</button>
                    <button class="btn-action btn-print" onclick="printPrescription(${p.id})"><i class="fas fa-print"></i> ${currentLang === 'ar' ? 'طباعة' : 'Print'}</button>
                    <button class="btn-action btn-danger" onclick="deletePrescription(${p.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function viewPrescription(id) {
    const p = prescriptions.find(x => x.id === id);
    if (!p) return;
    
    const patientName = p.patient_name || p.patientName;
    const doctorName = p.doctor_name || p.doctorName;
    const meds = p.medications ? p.medications.map(m => `${m.name} - ${m.dose}`).join('\n') : '';
    
    alert(`${currentLang === 'ar' ? 'تفاصيل الوصفة' : 'Prescription Details'}:\n\n${currentLang === 'ar' ? 'المريض' : 'Patient'}: ${patientName}\n${currentLang === 'ar' ? 'الطبيب' : 'Doctor'}: ${doctorName}\n${currentLang === 'ar' ? 'التشخيص' : 'Diagnosis'}: ${p.diagnosis}\n\n${currentLang === 'ar' ? 'الأدوية' : 'Medications'}:\n${meds}`);
}

function printPrescription(id) {
    window.print();
}

function cancelPrescription(id) {
    if (confirm(translations[currentLang].confirmCancel)) {
        updatePrescriptionStatus(id, 'cancelled', function() {
            showToast(translations[currentLang].prescriptionCancelled, 'success');
            loadData();
        });
    }
}

function deletePrescription(id) {
    if (confirm(translations[currentLang].confirmDelete)) {
        deletePrescriptionFromDB(id, function() {
            showToast(translations[currentLang].prescriptionDeleted, 'success');
            loadData();
        });
    }
}

// Settings Functions
function previewLogo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentLogo = e.target.result;
            const img = document.getElementById('settingsLogoPreview');
            img.src = currentLogo;
            img.style.display = 'block';
            document.getElementById('logoPlaceholder').style.display = 'none';
            updateLogoPreview(currentLogo);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function updateLogoPreview(logoSrc) {
    const svgElement = document.getElementById('defaultLogoSvg');
    const imgElement = document.getElementById('previewLogoImg');
    
    if (logoSrc) {
        svgElement.style.display = 'none';
        imgElement.src = logoSrc;
        imgElement.style.display = 'block';
    } else {
        svgElement.style.display = 'block';
        imgElement.style.display = 'none';
        imgElement.src = '';
    }
}

function removeLogo() {
    currentLogo = null;
    document.getElementById('logoInput').value = '';
    document.getElementById('settingsLogoPreview').style.display = 'none';
    document.getElementById('logoPlaceholder').style.display = 'block';
    updateLogoPreview(null);
}

function selectColor(el, color) {
    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    currentColor = color;
}

function saveSettings() {
    const settings = {
        hospitalAr: document.getElementById('settingsHospitalAr').value,
        hospitalEn: document.getElementById('settingsHospitalEn').value,
        infoAr: document.getElementById('settingsInfoAr').value,
        infoEn: document.getElementById('settingsInfoEn').value,
        color: currentColor,
        logo: currentLogo
    };
    
    saveSettingsToDB(settings, function() {
        applySettings(settings);
        showToast(translations[currentLang].settingsSaved, 'success');
    });
}

function loadSettings() {
    getSettings(function(settings) {
        applySettingsToForm(settings);
    });
}

function loadSettingsFromLocalStorage() {
    const settings = JSON.parse(localStorage.getItem('hospitalSettings')) || {};
    applySettingsToForm(settings);
}

function applySettingsToForm(settings) {
    if (settings.hospitalAr) document.getElementById('settingsHospitalAr').value = settings.hospitalAr;
    if (settings.hospitalEn) document.getElementById('settingsHospitalEn').value = settings.hospitalEn;
    if (settings.infoAr) document.getElementById('settingsInfoAr').value = settings.infoAr;
    if (settings.infoEn) document.getElementById('settingsInfoEn').value = settings.infoEn;
    
    if (settings.logo) {
        currentLogo = settings.logo;
        const img = document.getElementById('settingsLogoPreview');
        img.src = currentLogo;
        img.style.display = 'block';
        document.getElementById('logoPlaceholder').style.display = 'none';
        updateLogoPreview(currentLogo);
    }
    
    if (settings.color) {
        currentColor = settings.color;
        document.querySelectorAll('.color-option').forEach(o => {
            o.classList.remove('selected');
            if (o.getAttribute('onclick').includes(currentColor)) {
                o.classList.add('selected');
            }
        });
    }
    
    applySettings(settings);
}

function applySettings(settings) {
    document.getElementById('previewHospitalAr').textContent = settings.hospitalAr || 'مستشفى الشفاء الدولي';
    document.getElementById('previewHospitalEn').textContent = settings.hospitalEn || 'Al-Shifa Hospital';
    document.getElementById('previewInfoAr').innerHTML = (settings.infoAr || 'الرياض، المملكة العربية السعودية<br>هاتف: 011-1234567').replace('\n', '<br>');
    document.getElementById('previewInfoEn').innerHTML = (settings.infoEn || 'Riyadh, KSA<br>Tel: +966-11-1234567').replace('\n', '<br>');
    
    const color = settings.color || '#0891b2';
    document.querySelectorAll('.preview-hospital-name').forEach(el => el.style.color = color);
    document.querySelectorAll('.preview-info-label').forEach(el => el.style.color = color);
    document.querySelectorAll('.preview-body-horizontal').forEach(el => el.style.borderColor = color);
    document.querySelectorAll('.preview-table th').forEach(el => el.style.background = color);
    document.querySelectorAll('.preview-rx').forEach(el => el.style.color = color);
}
