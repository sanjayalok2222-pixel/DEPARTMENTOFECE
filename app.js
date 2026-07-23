// === 1. Three.js 3D Background Particles ===
let scene, camera, renderer, starGeo, stars;

function init3DBackground() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.position.x = 0;
    camera.position.y = 0;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Optimized particle count to prevent scroll lags and stutters on all devices
    starGeo = new THREE.BufferGeometry();
    const particleCount = 800; 
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 5;
        posArray[i+1] = (Math.random() - 0.5) * 5;
        posArray[i+2] = (Math.random() - 0.5) * 5;

        // Custom gradient of neon blues and cyans
        const r = 0.0;
        const g = Math.random() * 0.7 + 0.3; 
        const b = 1.0;
        colorArray[i] = r;
        colorArray[i+1] = g;
        colorArray[i+2] = b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 0.008, 
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);

    animate();
}

let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 150;
    mouseY = (e.clientY - window.innerHeight / 2) / 150;
});

function animate() {
    requestAnimationFrame(animate);

    stars.rotation.y += 0.001;
    stars.rotation.x += 0.0003;

    stars.rotation.y += (mouseX - stars.rotation.y) * 0.03;
    stars.rotation.x += (-mouseY - stars.rotation.x) * 0.03;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

window.addEventListener('DOMContentLoaded', init3DBackground);


// === 2. Interactive 3D Card Hover Tilt Effect ===
function apply3DTilt() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Disable tilts when text is focused to avoid cursor shift stutters
            if (document.activeElement && card.contains(document.activeElement)) {
                return;
            }
            const cardRect = card.getBoundingClientRect();
            const cardWidth = cardRect.width;
            const cardHeight = cardRect.height;
            
            const mouseX = e.clientX - cardRect.left - cardWidth / 2;
            const mouseY = e.clientY - cardRect.top - cardHeight / 2;
            
            const tiltX = (mouseY / (cardHeight / 2)) * -14;
            const tiltY = (mouseX / (cardWidth / 2)) * 14;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.04, 1.04, 1.04)`;
            card.style.boxShadow = `0 18px 45px rgba(0, 210, 255, 0.3)`;
            card.style.borderColor = `var(--accent-cyan)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.boxShadow = `0 10px 40px rgba(0, 0, 0, 0.55)`;
            card.style.borderColor = `var(--border-card)`;
        });
    });
}
window.addEventListener('DOMContentLoaded', apply3DTilt);


// === 3. Details Navigation Tabs ===
function switchTab(event, tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    
    apply3DTilt();
}


// === 4. Club Interactive Portal Interface ===
const clubModal = document.getElementById('clubInterfaceModal');
const portalContent = document.getElementById('club-portal-content');

const clubData = {
    electronics: {
        title: "🔌 Electronics Club Portal",
        faculty: "Mr. P. Anandhakumar (HoD ECE)",
        overview: "Dedicated to designing microelectronic layouts, debugging circuit faults, and mastering PCB printing technology.",
        activities: [
            "Circuitrix Debugging Contest (National Level)",
            "PCB Design bootcamps using KiCad",
            "Soldering & components assembly training labs"
        ],
        projects: "Smart Agriculture IoT kit, Wearable health monitoring sensors."
    }
};

function openClubInterface(clubType) {
    const data = clubData[clubType];
    if (!data) return;

    portalContent.innerHTML = `
        <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.8rem; color: var(--accent-cyan); margin-bottom: 1.25rem;">${data.title}</h3>
        
        <div style="margin-bottom: 1.5rem;">
            <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 0.25rem;">Faculty Advisor</span>
            <strong style="color: var(--text-primary); font-size: 1rem;">${data.faculty}</strong>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">${data.overview}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 0.6rem;">Key Core Activities</span>
            <ul style="list-style: none; padding: 0;">
                ${data.activities.map(act => `
                    <li style="position: relative; padding-left: 1.5rem; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-primary);">
                        <span style="position: absolute; left: 0; color: var(--accent-cyan);">✦</span> ${act}
                    </li>
                `).join('')}
            </ul>
        </div>

        <div>
            <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 0.25rem;">Recent Student Projects</span>
            <p style="color: var(--accent-cyan); font-weight: 500; font-size: 0.9rem;">${data.projects}</p>
        </div>
    `;
    
    clubModal.classList.add('active');
}

function closeClubModal() {
    clubModal.classList.remove('active');
}


// === 5. Real PDF Download Toast Notification ===
function showDownloadNotify(fileName) {
    const toast = document.getElementById('toast-notify');
    toast.textContent = `Downloading ${fileName}...`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.opacity = '1';
        }, 300);
    }, 2500);
}


// === 6. Dynamic Navigation Link Highlighting ===
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 180)) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});


// === 7. Real Admin Controls & Dynamic Data Systems ===
const loginModal = document.getElementById('adminLoginModal');
const addFileModal = document.getElementById('addFileModal');
const loginBtn = document.getElementById('admin-login-btn');
const adminControlsBar = document.getElementById('admin-controls-bar');
const adminLinkEditGroup = document.getElementById('admin-link-edit-fields');
const adminPosterAddGroup = document.getElementById('admin-poster-add-container');
const adminDownloadAddGroup = document.getElementById('admin-download-controls');

// Predefined list of editable element IDs in Admin Mode
const editableElements = [
    'college-name-header', 'college-auth-header', 'college-appr-header', 'college-nba-header',
    'hero-title', 'hero-subtitle', 'about-card-text', 'vision-text', 'mission-list', 
    'intake-ug-title', 'intake-ug-text', 'intake-pg-title', 'intake-pg-text', 
    'table-strength-data', 'table-mou-data', 'table-iste-data', 'club-title-card', 'club-desc-card',
    'hod-name', 'hod-designation', 'hod-msg-text', 'hod-research', 'hod-email', 'coordinators-container'
];

// Carousel State
let eventPosters = [];
let currentPosterIndex = 0;

// Downloads State
let customFiles = [];
const defaultDownloads = [
    { id: "syllabus", name: "ECE Curriculum Syllabus 2025-26", meta: "Official PDF Document • 120 KB", url: "ECE_Syllabus_2025_26.pdf", icon: "📄" },
    { id: "newsletter", name: "ECE Department Newsletter (Vol. X)", meta: "Official PDF Document • 135 KB", url: "ECE_Newsletter_V10.pdf", icon: "📰" },
    { id: "planner", name: "Academic Planning Template (Excel)", meta: "Spreadsheet Template • 5 KB", url: "ECE_Academic_Planner.xlsx", icon: "📊" },
    { id: "report", name: "Previous ECE Events Summary Report", meta: "PDF Summary Report • 150 KB", url: "ECE_Previous_Events_Report.pdf", icon: "🏆" }
];
let tempNewFileUrl = null;

// Modal triggers
function openLoginModal() {
    loginModal.classList.add('active');
}
function closeLoginModal() {
    loginModal.classList.remove('active');
    document.getElementById('adminLoginForm').reset();
}

function openAddFileModal() {
    addFileModal.classList.add('active');
}
function closeAddFileModal() {
    addFileModal.classList.remove('active');
    document.getElementById('addFileForm').reset();
    tempNewFileUrl = null;
}

// Submit Admin credentials
function submitAdminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if (user === 'ece_1234' && pass === 'ECE1234') {
        localStorage.setItem('vsb_ece_is_admin', 'true');
        closeLoginModal();
        enableAdminMode();
    } else {
        alert('Incorrect Admin credentials! Try again.');
    }
}

// Enable Admin mode options
function enableAdminMode() {
    document.body.classList.add('admin-mode');
    adminControlsBar.classList.add('active');
    
    // Show hidden edit panels
    adminLinkEditGroup.style.display = 'block';
    adminPosterAddGroup.style.display = 'block';
    adminDownloadAddGroup.style.display = 'block';

    loginBtn.textContent = 'Admin Mode Active';
    loginBtn.disabled = true;

    // Enable editing on all standard fields
    editableElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('contenteditable', 'true');
        }
    });

    // Make poster details inline editable too
    document.getElementById('event-title-text').setAttribute('contenteditable', 'true');
    document.getElementById('event-date-text').setAttribute('contenteditable', 'true');

    // Make table td and th elements contenteditable individually
    const tableCells = document.querySelectorAll('table th, table td');
    tableCells.forEach(cell => {
        cell.setAttribute('contenteditable', 'true');
    });

    renderDownloads();
}

// Logout admin
function logoutAdmin() {
    localStorage.removeItem('vsb_ece_is_admin');
    document.body.classList.remove('admin-mode');
    adminControlsBar.classList.remove('active');
    
    adminLinkEditGroup.style.display = 'none';
    adminPosterAddGroup.style.display = 'none';
    adminDownloadAddGroup.style.display = 'none';

    loginBtn.textContent = 'Admin Login';
    loginBtn.disabled = false;

    // Disable editing
    editableElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('contenteditable', 'false');
        }
    });
    
    document.getElementById('event-title-text').setAttribute('contenteditable', 'false');
    document.getElementById('event-date-text').setAttribute('contenteditable', 'false');

    const tableCells = document.querySelectorAll('table th, table td');
    tableCells.forEach(cell => {
        cell.setAttribute('contenteditable', 'false');
    });

    alert('Logged out from admin system successfully.');
    window.location.reload();
}

// Save web updates locally
function saveWebChanges() {
    const edits = {};
    
    editableElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            edits[id] = el.innerHTML;
        }
    });
    localStorage.setItem('vsb_ece_web_edits', JSON.stringify(edits));

    // Save active poster details to active poster slot
    if (eventPosters.length > 0) {
        eventPosters[currentPosterIndex].title = document.getElementById('event-title-text').innerText;
        eventPosters[currentPosterIndex].date = document.getElementById('event-date-text').innerText;
        localStorage.setItem('vsb_ece_event_posters', JSON.stringify(eventPosters));
    }

    alert('All website edits and posters saved successfully to local storage!');
}


// === 8. Event Posters System (1:1 Carousel) ===
function initPosters() {
    const saved = localStorage.getItem('vsb_ece_event_posters');
    if (saved) {
        eventPosters = JSON.parse(saved);
    } else {
        // Seed initial poster generated by agent
        eventPosters = [
            {
                img: "assets/vsb-ece-poster.jpg",
                title: "VSB ECE Symposium 2026",
                date: "Date: September 15, 2026",
                link: "https://forms.gle/vsbece2026"
            }
        ];
        localStorage.setItem('vsb_ece_event_posters', JSON.stringify(eventPosters));
    }
    renderActivePoster();
}

function renderActivePoster() {
    if (eventPosters.length === 0) return;
    const p = eventPosters[currentPosterIndex];

    document.getElementById('event-poster-img').src = p.img;
    document.getElementById('event-title-text').innerText = p.title;
    document.getElementById('event-date-text').innerText = p.date;
    document.getElementById('event-reg-link').href = p.link;
    document.getElementById('admin-link-url').value = p.link;
}

function nextPoster() {
    if (eventPosters.length <= 1) return;
    // Sync current edits before switching
    if (localStorage.getItem('vsb_ece_is_admin') === 'true') {
        eventPosters[currentPosterIndex].title = document.getElementById('event-title-text').innerText;
        eventPosters[currentPosterIndex].date = document.getElementById('event-date-text').innerText;
    }
    
    currentPosterIndex = (currentPosterIndex + 1) % eventPosters.length;
    renderActivePoster();
}

function prevPoster() {
    if (eventPosters.length <= 1) return;
    // Sync current edits before switching
    if (localStorage.getItem('vsb_ece_is_admin') === 'true') {
        eventPosters[currentPosterIndex].title = document.getElementById('event-title-text').innerText;
        eventPosters[currentPosterIndex].date = document.getElementById('event-date-text').innerText;
    }

    currentPosterIndex = (currentPosterIndex - 1 + eventPosters.length) % eventPosters.length;
    renderActivePoster();
}

// Poster Upload
function triggerPosterUpload() {
    document.getElementById('admin-poster-upload').click();
}

function handlePosterUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        eventPosters[currentPosterIndex].img = e.target.result;
        localStorage.setItem('vsb_ece_event_posters', JSON.stringify(eventPosters));
        renderActivePoster();
    };
    reader.readAsDataURL(file);
}

// Update link for active poster
function updateActivePosterLink(newUrl) {
    eventPosters[currentPosterIndex].link = newUrl;
    document.getElementById('event-reg-link').href = newUrl;
    localStorage.setItem('vsb_ece_event_posters', JSON.stringify(eventPosters));
}

// Add new slot to carousel
function addNewPosterSlot() {
    eventPosters.push({
        img: "assets/ece-logo.png",
        title: "New ECE Event Title",
        date: "Date: To Be Announced",
        link: "#"
    });
    currentPosterIndex = eventPosters.length - 1;
    localStorage.setItem('vsb_ece_event_posters', JSON.stringify(eventPosters));
    renderActivePoster();
    alert('New poster slot added at the end of the carousel. You can now edit its text, link and upload its 1:1 image flyer!');
}

// Delete active poster slot
function deleteActivePoster() {
    if (eventPosters.length <= 1) {
        alert('You must keep at least one active poster slot!');
        return;
    }
    if (confirm('Are you sure you want to delete this poster slot from the carousel?')) {
        eventPosters.splice(currentPosterIndex, 1);
        currentPosterIndex = 0;
        localStorage.setItem('vsb_ece_event_posters', JSON.stringify(eventPosters));
        renderActivePoster();
    }
}


// === 9. Admin Profile Avatar System ===
function triggerAvatarUpload() {
    document.getElementById('admin-avatar-upload').click();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('admin-profile-pic').src = e.target.result;
        localStorage.setItem('vsb_ece_admin_avatar', e.target.result);
    };
    reader.readAsDataURL(file);
}

function initAdminAvatar() {
    const savedAvatar = localStorage.getItem('vsb_ece_admin_avatar');
    if (savedAvatar) {
        document.getElementById('admin-profile-pic').src = savedAvatar;
    }
}


// === 10. Admin Dynamic Downloads System ===
function initDownloads() {
    const saved = localStorage.getItem('vsb_ece_custom_downloads');
    if (saved) {
        customFiles = JSON.parse(saved);
    }
    renderDownloads();
}

function renderDownloads() {
    const container = document.getElementById('download-grid-container');
    if (!container) return;
    container.innerHTML = '';

    const isAdmin = localStorage.getItem('vsb_ece_is_admin') === 'true';

    // 1. Render default files
    defaultDownloads.forEach(file => {
        container.innerHTML += `
            <div class="download-card tilt-card">
                <div class="file-info">
                    <div class="file-icon">${file.icon}</div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${file.meta}</p>
                    </div>
                </div>
                <a href="${file.url}" download="${file.url}" class="btn-download" onclick="showDownloadNotify('${file.url}')">↓</a>
            </div>
        `;
    });

    // 2. Render custom files uploaded by admin
    customFiles.forEach(file => {
        container.innerHTML += `
            <div class="download-card tilt-card" style="position: relative;">
                <div class="file-info">
                    <div class="file-icon">${file.icon}</div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${file.meta}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <a href="${file.url}" download="${file.name}.pdf" class="btn-download" onclick="showDownloadNotify('${file.name}')">↓</a>
                    ${isAdmin ? `<button class="btn-admin-logout" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; width: 35px; height: 35px; border-radius: 50%; padding:0; display:flex; align-items:center; justify-content:center;" onclick="deleteCustomFile('${file.id}')">🗑️</button>` : ''}
                </div>
            </div>
        `;
    });

    apply3DTilt();
}

function handleNewFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        tempNewFileUrl = e.target.result; // Stores Base64 file contents
    };
    reader.readAsDataURL(file);
}

function submitAddNewFile(event) {
    event.preventDefault();
    const name = document.getElementById('new-file-name').value;
    const meta = document.getElementById('new-file-meta').value;

    const newFile = {
        id: "file-" + Date.now(),
        name: name,
        meta: meta,
        url: tempNewFileUrl || "#", // Fallback if no file uploaded
        icon: "📁"
    };

    customFiles.push(newFile);
    localStorage.setItem('vsb_ece_custom_downloads', JSON.stringify(customFiles));
    closeAddFileModal();
    renderDownloads();
    alert('New download file added successfully!');
}

function deleteCustomFile(id) {
    if (confirm('Are you sure you want to delete this custom download file?')) {
        customFiles = customFiles.filter(file => file.id !== id);
        localStorage.setItem('vsb_ece_custom_downloads', JSON.stringify(customFiles));
        renderDownloads();
    }
}


// === 11. Initializer Loader ===
function loadAllWebData() {
    // 1. Load basic text edits
    const saved = localStorage.getItem('vsb_ece_web_edits');
    if (saved) {
        const edits = JSON.parse(saved);
        for (const [id, html] of Object.entries(edits)) {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = html;
            }
        }
    }

    // 2. Load custom sections data
    initPosters();
    initDownloads();
    initAdminAvatar();

    // 3. Auto log in if admin state persists
    if (localStorage.getItem('vsb_ece_is_admin') === 'true') {
        enableAdminMode();
    }
}

// Run loader on load
window.addEventListener('DOMContentLoaded', loadAllWebData);

// Close overlay modal backdrop clicks
window.onclick = function(event) {
    if (event.target === loginModal) {
        closeLoginModal();
    } else if (event.target === addFileModal) {
        closeAddFileModal();
    } else if (event.target === clubModal) {
        closeClubModal();
    }
}
