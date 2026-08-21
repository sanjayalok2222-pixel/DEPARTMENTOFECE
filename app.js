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

    stars.rotation.y += 0.0002;
    stars.rotation.x += 0.00005;

    stars.rotation.y += (mouseX - stars.rotation.y) * 0.01;
    stars.rotation.x += (-mouseY - stars.rotation.x) * 0.01;

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
            
            const tiltX = (mouseY / (cardHeight / 2)) * -5;
            const tiltY = (mouseX / (cardWidth / 2)) * 5;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
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


// === 4. Club Interactive Portal Interface (Round 1, 2, 3 Buttons) ===
const clubModal = document.getElementById('clubInterfaceModal');
const portalContent = document.getElementById('club-portal-content');

let activeClubRounds = [];

function openClubInterface(clubType) {
    if (clubType === 'electronics') {
        activeClubRounds = [];
        const items = document.querySelectorAll('#club-rounds-container .activity-round-item');
        items.forEach(item => {
            activeClubRounds.push({
                title: item.getAttribute('data-title') || 'Round',
                type: item.getAttribute('data-type') || 'link',
                url: item.getAttribute('data-url') || '#',
                challengeTitle: item.querySelector('.challenge-title')?.innerText.trim() || '',
                challengeDesc: item.querySelector('.challenge-desc')?.innerText.trim() || '',
                challengeCode: item.querySelector('.challenge-code')?.innerText.trim() || ''
            });
        });

        const clubTitle = document.getElementById('club-title-card')?.innerText.trim() || '🔌 Electronics Club';

        let roundsHtml = '';
        activeClubRounds.forEach((round, idx) => {
            const isRound1 = idx === 0 || round.title.toLowerCase().includes('round 1') || round.title.toLowerCase().includes('round one');
            if (isRound1) {
                roundsHtml += `<button onclick="startTechnicalMcqSelection()" class="event-reg-link" style="width: 100%; text-align: center; margin: 0; background: var(--accent-cyan); border: none; color: var(--bg-dark) !important;">TECHNICAL MCQ</button>`;
            } else if (round.type === 'link') {
                roundsHtml += `<a href="${round.url}" target="_blank" class="event-reg-link" style="width: 100%; text-align: center; margin: 0;">${round.title}</a>`;
            } else {
                roundsHtml += `<button onclick="showRoundChallenge(${idx})" class="event-reg-link" style="width: 100%; text-align: center; margin: 0; background: var(--accent-cyan); border: none; color: var(--bg-dark) !important;">${round.title}</button>`;
            }
        });

        // Add public Leaderboard button below the rounds list
        roundsHtml += `
            <div style="width: 100%; margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); text-align: center; font-weight: bold; letter-spacing: 0.5px;">🏆 View Leaderboard</div>
                <div style="display: flex; gap: 0.5rem; width: 100%;">
                    <button onclick="showPublicQuizResults('Second Year')" class="event-reg-link" style="flex: 1; text-align: center; margin: 0; padding: 0.5rem; font-size: 0.8rem; background: transparent; border: 1px solid var(--accent-cyan); color: var(--accent-cyan) !important;">Second Yr</button>
                    <button onclick="showPublicQuizResults('Third Year')" class="event-reg-link" style="flex: 1; text-align: center; margin: 0; padding: 0.5rem; font-size: 0.8rem; background: transparent; border: 1px solid var(--accent-cyan); color: var(--accent-cyan) !important;">Third Yr</button>
                </div>
            </div>
        `;

        portalContent.innerHTML = `
            <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.8rem; color: var(--accent-cyan); margin-bottom: 1.5rem; text-align: center;">${clubTitle} Challenges</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; text-align: center;">Choose an active round from the choices below:</p>
            <div style="display: flex; flex-direction: column; gap: 1.25rem; align-items: center; width: 100%; max-width: 400px; margin: 0 auto;">
                ${roundsHtml || '<p style="color:var(--text-secondary);">No rounds active currently.</p>'}
            </div>
        `;
        clubModal.classList.add('active');
    }
}

function openMcqExamPortal(event) {
    if (event) event.preventDefault();
    openClubInterface('electronics');
    startTechnicalMcqSelection();
}

function showPublicResultsCard(year) {
    openClubInterface('electronics');
    showPublicQuizResults(year);
}

function showRoundChallenge(idx) {
    const round = activeClubRounds[idx];
    if (!round) return;

    portalContent.innerHTML = `
        <div class="round3-challenge-container" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
            <button class="btn-admin-logout" style="width: fit-content; padding: 0.4rem 1rem; margin-bottom: 0.5rem;" onclick="openClubInterface('electronics')">← Back to Rounds</button>
            <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.6rem; color: var(--accent-cyan); text-align: center; margin-bottom: 0.25rem;">${round.challengeTitle || 'Code Challenge'}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; text-align: center; margin-bottom: 1rem;">${round.challengeDesc || 'Copy the program, click Go To Tool, and run it.'}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; max-height: 380px; overflow-y: auto; padding-right: 0.5rem;">
                <!-- Code Option A (Default incorrect - missing closing bracket) -->
                <div style="background: #060913; border: 1px solid rgba(0, 210, 255, 0.15); border-radius: 8px; padding: 1rem; position: relative;">
                    <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; display: block; margin-bottom: 0.5rem;">Code 1 (Option A)</span>
                    <pre style="font-family: monospace; font-size: 0.72rem; color: #a1b0cb; overflow-x: auto; margin: 0; white-space: pre-wrap;">const int led = 13;
const int buzzer = 8;

void setup() {
  pinMode(led, OUTPUT);

void loop() {
  digitalWrite(led, HIGH);
  tone(buzzer, 2000);
  delay(1000);

  digitalWrite(led, LOW);
  noTone(buzzer);
  delay(1000);
}</pre>
                    <button onclick="copyToClipboard(this)" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,210,255,0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); font-size: 0.65rem; border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer;">Copy</button>
                </div>

                <!-- Code Option B (Default incorrect - missing semicolon) -->
                <div style="background: #060913; border: 1px solid rgba(0, 210, 255, 0.15); border-radius: 8px; padding: 1rem; position: relative;">
                    <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; display: block; margin-bottom: 0.5rem;">Code 2 (Option B)</span>
                    <pre style="font-family: monospace; font-size: 0.72rem; color: #a1b0cb; overflow-x: auto; margin: 0; white-space: pre-wrap;">const int led = 13
const int buzzer = 8;

void setup() {
  pinMode(led, OUTPUT);
}

void loop() {
  digitalWrite(led, HIGH);
  tone(buzzer, 2000);
  delay(1000);

  digitalWrite(led, LOW);
  noTone(buzzer);
  delay(1000);
}</pre>
                    <button onclick="copyToClipboard(this)" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,210,255,0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); font-size: 0.65rem; border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer;">Copy</button>
                </div>

                <!-- Code Option C (Dynamic correct code from Supabase) -->
                <div style="background: #060913; border: 1px solid rgba(0, 210, 255, 0.15); border-radius: 8px; padding: 1rem; position: relative;">
                    <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; display: block; margin-bottom: 0.5rem;">Code 3 (Option C)</span>
                    <pre style="font-family: monospace; font-size: 0.72rem; color: #a1b0cb; overflow-x: auto; margin: 0; white-space: pre-wrap;">${round.challengeCode}</pre>
                    <button onclick="copyToClipboard(this)" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,210,255,0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); font-size: 0.65rem; border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer;">Copy</button>
                </div>

                <!-- Code Option D (Default incorrect - loops method) -->
                <div style="background: #060913; border: 1px solid rgba(0, 210, 255, 0.15); border-radius: 8px; padding: 1rem; position: relative;">
                    <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; display: block; margin-bottom: 0.5rem;">Code 4 (Option D)</span>
                    <pre style="font-family: monospace; font-size: 0.72rem; color: #a1b0cb; overflow-x: auto; margin: 0; white-space: pre-wrap;">const int led = 13;
const int buzzer = 8;

void setup() {
  pinMode(led, OUTPUT);
}

void loops() {  
  digitalWrite(led, HIGH);
  tone(buzzer, 2000);
  delay(1000);

  digitalWrite(led, LOW);
  noTone(buzzer);
  delay(1000);
}</pre>
                    <button onclick="copyToClipboard(this)" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,210,255,0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); font-size: 0.65rem; border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer;">Copy</button>
                </div>
            </div>

            <div style="text-align: center; margin-top: 0.5rem;">
                <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; color: #ff4a4a; letter-spacing: 1px; margin-bottom: 0.75rem; font-weight: 800;">📢 COPY THE CORRECT CODE</h4>
                <a href="${round.url}" target="_blank" class="event-reg-link" style="margin: 0; width: 100%;">Go To Round 3</a>
            </div>
        </div>
    `;
}

function copyToClipboard(button) {
    const code = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        button.style.background = "#4ade80";
        button.style.borderColor = "#4ade80";
        button.style.color = "#05070e";
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = "rgba(0,210,255,0.1)";
            button.style.borderColor = "var(--accent-cyan)";
            button.style.color = "var(--accent-cyan)";
        }, 1500);
    }).catch(err => {
        console.error("Clipboard copy failure:", err);
    });
}

function closeClubModal() {
    if (isQuizActive) {
        // Do not allow closing modal when quiz is active to prevent accidental clicks outside
        return;
    }
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


// === 6. Dynamic Navigation & Scroll Hide Header system ===
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    // Scroll-to-Hide Header
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > lastScrollY && window.scrollY > 180) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
    }
    lastScrollY = window.scrollY;

    // Active Tab Link highlight
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 250)) {
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

// Predefined list of editable element IDs in Admin Mode (now including HOD Slot 2)
const editableElements = [
    'college-name-header', 'college-auth-header', 'college-appr-header', 'college-nba-header',
    'hero-title', 'hero-subtitle', 'about-card-text', 'vision-text', 'mission-list', 
    'intake-ug-title', 'intake-ug-text', 'intake-pg-title', 'intake-pg-text', 
    'table-strength-data', 'table-mou-data', 'table-iste-data', 'club-title-card', 'club-desc-card',
    'hod-name', 'hod-designation', 'hod-msg-text', 'hod-research', 'hod-email',
    'hod-name-2', 'hod-designation-2', 'hod-msg-text-2', 'hod-research-2', 'hod-email-2',
    'coordinators-container'
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

// Toggle Supabase Config view via settings gear icon click
function toggleSupabaseSettings() {
    const configPanel = document.querySelector('.admin-supabase-config');
    if (configPanel) {
        configPanel.classList.toggle('active');
    }
}

// Submit Admin credentials
function submitAdminLogin(event) {
    event.preventDefault();
    closeLoginModal();
    window.open('admin.html', '_blank');
}

// Enable Admin mode options
function enableAdminMode() {
    document.body.classList.add('admin-mode');
    adminControlsBar.classList.add('active');
    
    // Show hidden edit panels
    adminLinkEditGroup.style.display = 'block';
    adminPosterAddGroup.style.display = 'block';
    adminDownloadAddGroup.style.display = 'block';

    loginBtn.textContent = 'Dashboard ⚙️';
    loginBtn.disabled = false;
    loginBtn.onclick = () => window.open('admin.html', '_blank');

    // Enable editing on all standard fields
    editableElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('contenteditable', 'true');
        }
    });

    // Make all poster details and controls editable directly in DOM
    const eventTitles = document.querySelectorAll('.event-title-text');
    eventTitles.forEach(t => t.setAttribute('contenteditable', 'true'));
    const eventDates = document.querySelectorAll('.event-date-text');
    eventDates.forEach(d => d.setAttribute('contenteditable', 'true'));

    // Show admin input groups inside posters
    const adminPosterInputs = document.querySelectorAll('.admin-input-group');
    adminPosterInputs.forEach(g => g.style.display = 'block');

    // Make table td and th elements contenteditable individually
    const tableCells = document.querySelectorAll('table th, table td');
    tableCells.forEach(cell => {
        cell.setAttribute('contenteditable', 'true');
    });
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
    loginBtn.onclick = () => window.open('admin.html', '_blank');

    // Disable editing
    editableElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('contenteditable', 'false');
        }
    });

    const eventTitles = document.querySelectorAll('.event-title-text');
    eventTitles.forEach(t => t.setAttribute('contenteditable', 'false'));
    const eventDates = document.querySelectorAll('.event-date-text');
    eventDates.forEach(d => d.setAttribute('contenteditable', 'false'));

    const adminPosterInputs = document.querySelectorAll('.admin-input-group');
    adminPosterInputs.forEach(g => g.style.display = 'none');

    const tableCells = document.querySelectorAll('table th, table td');
    tableCells.forEach(cell => {
        cell.setAttribute('contenteditable', 'false');
    });

    alert('Logged out from admin system successfully.');
    window.location.reload();
}

// Save web updates globally back to index.html on disk and to Supabase Cloud
function saveWebChanges() {
    const isAdmin = localStorage.getItem('vsb_ece_is_admin') === 'true';

    // Explicitly write current input value properties into the HTML element value attributes!
    const supaUrlInput = document.getElementById('admin-supabase-url');
    const supaKeyInput = document.getElementById('admin-supabase-key');
    if (supaUrlInput) supaUrlInput.setAttribute('value', supaUrlInput.value);
    if (supaKeyInput) supaKeyInput.setAttribute('value', supaKeyInput.value);

    // Save Supabase credentials to localStorage as persistent fallback
    if (supaUrlInput) localStorage.setItem('vsb_ece_supabase_url', supaUrlInput.value);
    if (supaKeyInput) localStorage.setItem('vsb_ece_supabase_key', supaKeyInput.value);

    const allTextInputFields = document.querySelectorAll('input[type="text"], input[type="password"]');
    allTextInputFields.forEach(input => {
        input.setAttribute('value', input.value);
    });

    // 1. Temporarily disable editing state for clean HTML serialization
    editableElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.removeAttribute('contenteditable');
        }
    });
    
    const eventTitles = document.querySelectorAll('.event-title-text');
    eventTitles.forEach(t => t.removeAttribute('contenteditable'));
    const eventDates = document.querySelectorAll('.event-date-text');
    eventDates.forEach(d => d.removeAttribute('contenteditable'));

    const tableCells = document.querySelectorAll('table th, table td');
    tableCells.forEach(cell => {
        cell.removeAttribute('contenteditable');
    });

    // Hide edit panels in output html
    document.body.classList.remove('admin-mode');
    adminControlsBar.classList.remove('active');
    adminLinkEditGroup.style.display = 'none';
    adminPosterAddGroup.style.display = 'none';
    adminDownloadAddGroup.style.display = 'none';
    
    const adminPosterInputs = document.querySelectorAll('.admin-input-group');
    adminPosterInputs.forEach(g => g.style.display = 'none');

    // 2. Clone the clean HTML document
    const cleanHtml = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;

    // Collect JSON state to upsert to Supabase
    const editsObj = {};
    editableElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            editsObj[id] = el.innerHTML;
        }
    });

    const coordPhotosArray = [];
    for (let id = 1; id <= 5; id++) {
        const img = document.getElementById(`coord-img-${id}`);
        const emoji = document.getElementById(`coord-emoji-${id}`);
        if (img && emoji) {
            coordPhotosArray.push({
                id: id,
                src: img.src,
                displayImg: img.style.display,
                displayEmoji: emoji.style.display
            });
        }
    }

    const stateObj = {
        edits: editsObj,
        postersHtml: document.getElementById('posters-carousel-container').innerHTML,
        downloadsHtml: document.getElementById('download-grid-container').innerHTML,
        hodPhotoSrc: document.getElementById('hod-photo-img').src,
        hodPhotoDisplay: document.getElementById('hod-photo-img').style.display,
        hodEmojiDisplay: document.getElementById('hod-avatar-emoji').style.display,
        hodPhotoSrc2: document.getElementById('hod-photo-img-2').src,
        hodPhotoDisplay2: document.getElementById('hod-photo-img-2').style.display,
        hodEmojiDisplay2: document.getElementById('hod-avatar-emoji-2').style.display,
        coordPhotos: coordPhotosArray,
        adminAvatarSrc: document.getElementById('admin-profile-pic').src
    };

    // Restore admin mode UI state immediately for admin session
    if (isAdmin) {
        enableAdminMode();
    }

    // 3. Make HTTP POST request to local Python Server (Updates local disk files)
    const localSavePromise = fetch('/save-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: cleanHtml })
    }).catch(err => {
        console.warn('Local CMS server is offline. Writing to Supabase Cloud directly.');
    });

    // 4. Upsert to Supabase Cloud Database (Updates global web clients)
    const supabaseSavePromise = saveToSupabase(stateObj);

    Promise.all([localSavePromise, supabaseSavePromise])
    .then(([localRes, supaRes]) => {
        let msg = 'Website changes saved successfully!';
        if (supaRes && supaRes.ok) {
            msg += ' Live cloud updates synced to Supabase database!';
        } else if (supaRes) {
            msg += ' (Supabase table save failed - check SQL setup or credentials)';
        }
        alert(msg);
    })
    .catch(err => {
        console.error('Save changes exception:', err);
        alert('Exception saving changes. Check config parameters.');
    });
}


// === 8. Event Posters System (1:1 Carousel directly in DOM) ===
function getPosterCards() {
    return document.querySelectorAll('#posters-carousel-container .poster-card');
}

function nextPoster() {
    const cards = getPosterCards();
    if (cards.length <= 1) return;
    
    let activeIdx = -1;
    cards.forEach((card, idx) => {
        if (card.classList.contains('active')) {
            activeIdx = idx;
        }
    });
    
    if (activeIdx !== -1) {
        cards[activeIdx].classList.remove('active');
        const nextIdx = (activeIdx + 1) % cards.length;
        cards[nextIdx].classList.add('active');
        
        const container = document.getElementById('posters-carousel-container');
        if (container) {
            container.style.transform = `translateX(-${nextIdx * 100}%)`;
        }
    }
}

function prevPoster() {
    const cards = getPosterCards();
    if (cards.length <= 1) return;
    
    let activeIdx = -1;
    cards.forEach((card, idx) => {
        if (card.classList.contains('active')) {
            activeIdx = idx;
        }
    });
    
    if (activeIdx !== -1) {
        cards[activeIdx].classList.remove('active');
        const prevIdx = (activeIdx - 1 + cards.length) % cards.length;
        cards[prevIdx].classList.add('active');
        
        const container = document.getElementById('posters-carousel-container');
        if (container) {
            container.style.transform = `translateX(-${prevIdx * 100}%)`;
        }
    }
}

// Poster Upload via local file selector
function triggerPosterUpload(btn) {
    const card = btn.closest('.poster-card');
    card.querySelector('.admin-poster-upload-input').click();
}

function handlePosterUpload(event, input) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const card = input.closest('.poster-card');
        card.querySelector('.poster-1to1').src = e.target.result;
        card.querySelector('.admin-poster-image-url').value = '';
    };
    reader.readAsDataURL(file);
}

// Update Active Poster Registration Link
function updateActivePosterLink(input) {
    const card = input.closest('.poster-card');
    card.querySelector('.event-reg-link').href = input.value;
}

// Paste Image URL directly from other websites
function updateActivePosterImageByUrl(input) {
    if (!input.value) return;
    const card = input.closest('.poster-card');
    card.querySelector('.poster-1to1').src = input.value;
}

// Add new slot to carousel in DOM
function addNewPosterSlot() {
    const activeCard = document.querySelector('#posters-carousel-container .poster-card.active');
    if (!activeCard) return;

    // Clone clean template
    const newCard = activeCard.cloneNode(true);
    newCard.classList.remove('active');
    
    // Set default placeholder data
    newCard.querySelector('.poster-1to1').src = 'assets/ece-logo.png';
    newCard.querySelector('.event-title-text').innerText = 'New ECE Event Title';
    newCard.querySelector('.event-date-text').innerText = 'Date: To Be Announced';
    newCard.querySelector('.event-reg-link').href = '#';
    newCard.querySelector('.admin-link-url').value = '#';
    newCard.querySelector('.admin-poster-image-url').value = 'assets/ece-logo.png';

    // Insert at the beginning of the container (newest first)
    const container = document.getElementById('posters-carousel-container');
    container.insertBefore(newCard, container.firstChild);

    // Switch focus to the new card
    activeCard.classList.remove('active');
    newCard.classList.add('active');
    container.style.transform = 'translateX(0%)';

    // Make sure edits are enabled if in admin mode
    if (localStorage.getItem('vsb_ece_is_admin') === 'true') {
        newCard.querySelector('.event-title-text').setAttribute('contenteditable', 'true');
        newCard.querySelector('.event-date-text').setAttribute('contenteditable', 'true');
        newCard.querySelector('.admin-input-group').style.display = 'block';
    }

    alert('New poster slot card added directly to carousel DOM! Edit its contents and click "Save & Sync Changes".');
}

// Delete active poster slot from DOM
function deleteActivePoster() {
    const cards = getPosterCards();
    if (cards.length <= 1) {
        alert('You must keep at least one active poster card slot!');
        return;
    }
    if (confirm('Are you sure you want to delete this poster card slot from the DOM carousel?')) {
        const activeCard = document.querySelector('#posters-carousel-container .poster-card.active');
        let sibling = activeCard.nextElementSibling || activeCard.previousElementSibling;
        
        activeCard.remove();
        if (sibling) {
            sibling.classList.add('active');
        }
        
        const newCards = getPosterCards();
        let activeIdx = 0;
        newCards.forEach((card, idx) => {
            if (card.classList.contains('active')) {
                activeIdx = idx;
            }
        });
        const container = document.getElementById('posters-carousel-container');
        if (container) {
            container.style.transform = `translateX(-${activeIdx * 100}%)`;
        }
    }
}


// === 9. HOD & Student Coordinator Real Photo Uploads ===
function triggerHodUpload() {
    document.getElementById('admin-hod-upload').click();
}

function handleHodPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        displayHodPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
}

function displayHodPhoto(base64Data) {
    const imgEl = document.getElementById('hod-photo-img');
    const emojiEl = document.getElementById('hod-avatar-emoji');
    if (base64Data) {
        imgEl.src = base64Data;
        imgEl.style.display = 'block';
        emojiEl.style.display = 'none';
    } else {
        imgEl.style.display = 'none';
        emojiEl.style.display = 'block';
    }
}

// HOD 2 uploads
function triggerHodUpload2() {
    document.getElementById('admin-hod-upload-2').click();
}

function handleHodPhotoUpload2(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        displayHodPhoto2(e.target.result);
    };
    reader.readAsDataURL(file);
}

function displayHodPhoto2(base64Data) {
    const imgEl = document.getElementById('hod-photo-img-2');
    const emojiEl = document.getElementById('hod-avatar-emoji-2');
    if (base64Data) {
        imgEl.src = base64Data;
        imgEl.style.display = 'block';
        emojiEl.style.display = 'none';
    } else {
        imgEl.style.display = 'none';
        emojiEl.style.display = 'block';
    }
}

function triggerCoordUpload(id) {
    document.getElementById(`admin-coord-upload-${id}`).click();
}

function handleCoordPhotoUpload(event, id) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        displayCoordPhoto(id, e.target.result);
    };
    reader.readAsDataURL(file);
}

function displayCoordPhoto(id, base64Data) {
    const imgEl = document.getElementById(`coord-img-${id}`);
    const emojiEl = document.getElementById(`coord-emoji-${id}`);
    if (base64Data) {
        imgEl.src = base64Data;
        imgEl.style.display = 'block';
        emojiEl.style.display = 'none';
    } else {
        imgEl.style.display = 'none';
        emojiEl.style.display = 'block';
    }
}


// === 10. Admin Profile Avatar System ===
function triggerAvatarUpload() {
    document.getElementById('admin-avatar-upload').click();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('admin-profile-pic').src = e.target.result;
    };
    reader.readAsDataURL(file);
}


// === 11. Admin Dynamic Downloads System (Directly in DOM) ===
function handleNewFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

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

    const customCardId = "custom-" + Date.now();
    const container = document.getElementById('download-grid-container');

    const isAdmin = localStorage.getItem('vsb_ece_is_admin') === 'true';

    // Insert new download card directly to DOM grid container
    const newCardHtml = `
        <div class="download-card tilt-card custom-dl-card" id="${customCardId}" style="position: relative;">
            <div class="file-info">
                <div class="file-icon">📁</div>
                <div class="file-details">
                    <h4>${name}</h4>
                    <p>${meta}</p>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <a href="${tempNewFileUrl || '#'}" download="${name}.pdf" class="btn-download" onclick="showDownloadNotify('${name}')">↓</a>
                <button class="btn-admin-logout btn-admin-only-inline" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; width: 35px; height: 35px; border-radius: 50%; padding:0; display:${isAdmin ? 'flex' : 'none'}; align-items:center; justify-content:center;" onclick="deleteCustomDownloadCard(this)">🗑️</button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', newCardHtml);
    closeAddFileModal();
    apply3DTilt();
    alert('New download file card added to DOM! Click "Save & Sync Changes" to write it to disk.');
}

function deleteCustomDownloadCard(btn) {
    if (confirm('Are you sure you want to delete this custom download file?')) {
        const card = btn.closest('.download-card');
        if (card) {
            card.remove();
        }
    }
}


// === 12. Supabase Integration Logic ===
function loadFromSupabase() {
    // Restore Supabase credentials from local storage persistent cache
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'sb_publishable_dPp5TN5uwSURctyos7Y0hQ__mUZJWDC';

    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;

    if (url && document.getElementById('admin-supabase-url')) {
        document.getElementById('admin-supabase-url').value = url;
        document.getElementById('admin-supabase-url').setAttribute('value', url);
    }
    if (key && document.getElementById('admin-supabase-key')) {
        document.getElementById('admin-supabase-key').value = key;
        document.getElementById('admin-supabase-key').setAttribute('value', key);
    }

    if (!url || !key) {
        console.info('Supabase cloud parameters are not configured yet. Running in offline/file sync mode.');
        return;
    }

    const selectUrl = `${url.trim()}/rest/v1/vsb_ece_state?key=eq.site_data`;

    fetch(selectUrl, {
        method: 'GET',
        headers: {
            'apikey': key.trim(),
            'Authorization': `Bearer ${key.trim()}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Network error loading data');
        return res.json();
    })
    .then(data => {
        if (data && data.length > 0) {
            applyFetchedState(data[0].value);
            console.log('Successfully synced live web changes from Supabase Cloud!');
        }
    })
    .catch(err => {
        console.warn('Could not pull updates from Supabase database. Server RLS policy or setup error:', err);
    });
}

// Push state to Supabase
function saveToSupabase(state) {
    const url = document.getElementById('admin-supabase-url') ? document.getElementById('admin-supabase-url').value.trim() : '';
    const key = document.getElementById('admin-supabase-key') ? document.getElementById('admin-supabase-key').value.trim() : '';

    if (!url || !key) {
        return Promise.resolve(null);
    }

    const upsertUrl = `${url}/rest/v1/vsb_ece_state`;

    return fetch(upsertUrl, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            key: 'site_data',
            value: state
        })
    });
}

function applyFetchedState(state) {
    if (!state) return;

    // 1. Restore text edits
    if (state.edits) {
        for (const [id, html] of Object.entries(state.edits)) {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'cert-portal-link') {
                    el.setAttribute('href', html);
                } else {
                    el.innerHTML = html;
                }
            }
        }
    }

    // 2. Restore posters carousel HTML
    if (state.postersHtml) {
        const container = document.getElementById('posters-carousel-container');
        if (container) {
            container.innerHTML = state.postersHtml;
            const cards = container.querySelectorAll('.poster-card');
            let activeIdx = 0;
            cards.forEach((card, idx) => {
                if (card.classList.contains('active')) {
                    activeIdx = idx;
                }
            });
            container.style.transform = `translateX(-${activeIdx * 100}%)`;
        }
    }

    // 3. Restore downloads HTML
    if (state.downloadsHtml) {
        document.getElementById('download-grid-container').innerHTML = state.downloadsHtml;
    }

    // 4. Restore HOD Photo
    if (state.hodPhotoSrc) {
        const img = document.getElementById('hod-photo-img');
        const emoji = document.getElementById('hod-avatar-emoji');
        if (img && emoji) {
            img.src = state.hodPhotoSrc;
            img.style.display = state.hodPhotoDisplay || 'none';
            emoji.style.display = state.hodEmojiDisplay || 'block';
        }
    }

    // 5. Restore HOD 2 Photo
    if (state.hodPhotoSrc2) {
        const img = document.getElementById('hod-photo-img-2');
        const emoji = document.getElementById('hod-avatar-emoji-2');
        if (img && emoji) {
            img.src = state.hodPhotoSrc2;
            img.style.display = state.hodPhotoDisplay2 || 'none';
            emoji.style.display = state.hodEmojiDisplay2 || 'block';
        }
    }

    // 6. Restore Coordinators Photos
    if (state.coordPhotos && state.coordPhotos.length > 0) {
        state.coordPhotos.forEach(p => {
            const img = document.getElementById(`coord-img-${p.id}`);
            const emoji = document.getElementById(`coord-emoji-${p.id}`);
            if (img && emoji) {
                img.src = p.src;
                img.style.display = p.displayImg || 'none';
                emoji.style.display = p.displayEmoji || 'block';
            }
        });
    }

    // 7. Restore Admin Avatar
    if (state.adminAvatarSrc) {
        const adminPic = document.getElementById('admin-profile-pic');
        if (adminPic) {
            adminPic.src = state.adminAvatarSrc;
        }
    }

    // Reapply hover 3D tilt effects
    apply3DTilt();

    // Re-verify login editing triggers if admin is still active
    if (localStorage.getItem('vsb_ece_is_admin') === 'true') {
        enableAdminMode();
    }
}


// === 13. Initializer Loader ===
function loadAllWebData() {
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'sb_publishable_dPp5TN5uwSURctyos7Y0hQ__mUZJWDC';

    // 1. Fetch Supabase configuration from local config.json securely if running locally
    fetch('/get-config')
        .then(res => res.json())
        .then(config => {
            const url = config.supabase_url || localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
            const key = config.supabase_key || localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
            
            if (url) {
                localStorage.setItem('vsb_ece_supabase_url', url);
                if (document.getElementById('admin-supabase-url')) {
                    document.getElementById('admin-supabase-url').value = url;
                    document.getElementById('admin-supabase-url').setAttribute('value', url);
                }
            }
            if (key) {
                localStorage.setItem('vsb_ece_supabase_key', key);
                if (document.getElementById('admin-supabase-key')) {
                    document.getElementById('admin-supabase-key').value = key;
                    document.getElementById('admin-supabase-key').setAttribute('value', key);
                }
            }
            
            // 2. Query and sync live database state from Supabase Cloud
            loadFromSupabase();
        })
        .catch(err => {
            // Standalone production hosting fallback (e.g. Vercel)
            const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
            const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
            
            if (url && document.getElementById('admin-supabase-url')) {
                document.getElementById('admin-supabase-url').value = url;
                document.getElementById('admin-supabase-url').setAttribute('value', url);
            }
            if (key && document.getElementById('admin-supabase-key')) {
                document.getElementById('admin-supabase-key').value = key;
                document.getElementById('admin-supabase-key').setAttribute('value', key);
            }
            
            loadFromSupabase();
        });

    // 3. Auto log in if admin session persists
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

// === 8. Round 1 Quiz Game Implementation ===
const quizQuestions2nd = [
    {
        "id": 1,
        "q": "A PN junction diode is mainly used as a:",
        "hasImg": false,
        "options": [
            "Amplifier",
            "Rectifier",
            "Oscillator",
            "Filter"
        ],
        "ans": "Rectifier"
    },
    {
        "id": 2,
        "q": "The symbol 'P' in a PN junction represents:",
        "hasImg": false,
        "options": [
            "Positive charge",
            "Proton",
            "P-type semiconductor",
            "Power"
        ],
        "ans": "P-type semiconductor"
    },
    {
        "id": 3,
        "q": "The symbol 'N' in a PN junction represents:",
        "hasImg": false,
        "options": [
            "Negative terminal",
            "N-type semiconductor",
            "Neutral material",
            "None of these"
        ],
        "ans": "N-type semiconductor"
    },
    {
        "id": 4,
        "q": "The diode conducts current easily when it is:",
        "hasImg": false,
        "options": [
            "Reverse biased",
            "Forward biased",
            "Unbiased",
            "Open circuited"
        ],
        "ans": "Forward biased"
    },
    {
        "id": 5,
        "q": "During forward bias, the P-region is connected to:",
        "hasImg": false,
        "options": [
            "Negative terminal",
            "Ground only",
            "Positive terminal",
            "Neutral terminal"
        ],
        "ans": "Positive terminal"
    },
    {
        "id": 6,
        "q": "What is the primary function of a Zener diode?",
        "hasImg": false,
        "options": [
            "Amplification",
            "Rectification",
            "Voltage regulation",
            "Oscillation"
        ],
        "ans": "Voltage regulation"
    },
    {
        "id": 7,
        "q": "A Zener diode is designed to operate in which region?",
        "hasImg": false,
        "options": [
            "Forward bias only",
            "Reverse breakdown region",
            "Cut-off region",
            "Saturation region"
        ],
        "ans": "Reverse breakdown region"
    },
    {
        "id": 8,
        "q": "The breakdown voltage of a Zener diode is called:",
        "hasImg": false,
        "options": [
            "Threshold voltage",
            "Knee voltage",
            "Zener voltage",
            "Peak voltage"
        ],
        "ans": "Zener voltage"
    },
    {
        "id": 9,
        "q": "In forward bias, a Zener diode behaves like:",
        "hasImg": false,
        "options": [
            "Capacitor",
            "Inductor",
            "Ordinary silicon diode",
            "Transistor"
        ],
        "ans": "Ordinary silicon diode"
    },
    {
        "id": 10,
        "q": "The unit of Zener voltage is:",
        "hasImg": false,
        "options": [
            "Ampere",
            "Volt",
            "Ohm",
            "Watt"
        ],
        "ans": "Volt"
    },
    {
        "id": 11,
        "q": "What is the primary purpose of a Zener diode?",
        "hasImg": false,
        "options": [
            "Rectification",
            "Amplification",
            "Voltage regulation",
            "Oscillation"
        ],
        "ans": "Voltage regulation"
    },
    {
        "id": 12,
        "q": "A Zener diode is normally operated in:",
        "hasImg": false,
        "options": [
            "Forward bias",
            "Reverse bias",
            "Zero bias",
            "Both forward and reverse bias"
        ],
        "ans": "Reverse bias"
    },
    {
        "id": 13,
        "q": "The voltage across a Zener diode in the breakdown region is called:",
        "hasImg": false,
        "options": [
            "Forward voltage",
            "Reverse voltage",
            "Zener voltage",
            "Threshold voltage"
        ],
        "ans": "Zener voltage"
    },
    {
        "id": 14,
        "q": "Which region of the Zener diode is used for voltage regulation?",
        "hasImg": false,
        "options": [
            "Forward conduction region",
            "Reverse breakdown region",
            "Cut-off region",
            "Saturation region"
        ],
        "ans": "Reverse breakdown region"
    },
    {
        "id": 15,
        "q": "The unit of Zener voltage is:",
        "hasImg": false,
        "options": [
            "Ampere",
            "Ohm",
            "Volt",
            "Watt"
        ],
        "ans": "Volt"
    },
    {
        "id": 16,
        "q": "What is the full form of SCR?",
        "hasImg": false,
        "options": [
            "Silicon Current Rectifier",
            "Silicon Controlled Rectifier",
            "Semiconductor Current Regulator",
            "Silicon Control Relay"
        ],
        "ans": "Silicon Controlled Rectifier"
    },
    {
        "id": 17,
        "q": "An SCR belongs to which family of devices?",
        "hasImg": false,
        "options": [
            "Bipolar transistor",
            "MOSFET",
            "Thyristor",
            "IGBT"
        ],
        "ans": "Thyristor"
    },
    {
        "id": 18,
        "q": "An SCR has how many semiconductor layers?",
        "hasImg": false,
        "options": [
            "2",
            "3",
            "4",
            "5"
        ],
        "ans": "4"
    },
    {
        "id": 19,
        "q": "An SCR consists of _______ junctions.",
        "hasImg": false,
        "options": [
            "One",
            "Two",
            "Three",
            "Four"
        ],
        "ans": "Three"
    },
    {
        "id": 20,
        "q": "How many terminals does an SCR have?",
        "hasImg": false,
        "options": [
            "Two",
            "Three",
            "Four",
            "Five"
        ],
        "ans": "Three"
    },
    {
        "id": 21,
        "q": "What is the primary function of a half-wave rectifier?",
        "hasImg": false,
        "options": [
            "Amplification",
            "Oscillation",
            "Conversion of AC to pulsating DC",
            "Voltage regulation"
        ],
        "ans": "Conversion of AC to pulsating DC"
    },
    {
        "id": 22,
        "q": "A half-wave rectifier uses how many diodes?",
        "hasImg": false,
        "options": [
            "1",
            "2",
            "4",
            "6"
        ],
        "ans": "1"
    },
    {
        "id": 23,
        "q": "During the positive half-cycle of the input AC, the diode is:",
        "hasImg": false,
        "options": [
            "Reverse biased",
            "Forward biased",
            "Open-circuited",
            "Short-circuited"
        ],
        "ans": "Forward biased"
    },
    {
        "id": 24,
        "q": "During the negative half-cycle, the diode is:",
        "hasImg": false,
        "options": [
            "Forward biased",
            "Reverse biased",
            "Saturated",
            "Conducting fully"
        ],
        "ans": "Reverse biased"
    },
    {
        "id": 25,
        "q": "The output waveform of a half-wave rectifier contains:",
        "hasImg": false,
        "options": [
            "Both positive and negative half cycles",
            "Only positive half cycles (assuming positive rectification)",
            "Only negative half cycles",
            "A constant DC voltage"
        ],
        "ans": "Only positive half cycles (assuming positive rectification)"
    },
    {
        "id": 26,
        "q": "During reverse bias, the P-region is connected to:",
        "hasImg": false,
        "options": [
            "Positive terminal",
            "Negative terminal",
            "Neutral terminal",
            "Load"
        ],
        "ans": "Negative terminal"
    },
    {
        "id": 27,
        "q": "The barrier potential of a Silicon diode is approximately:",
        "hasImg": false,
        "options": [
            "0.3 V",
            "0.7 V",
            "1.5 V",
            "5 V"
        ],
        "ans": "0.7 V"
    },
    {
        "id": 28,
        "q": "The barrier potential of a Germanium diode is approximately:",
        "hasImg": false,
        "options": [
            "0.3 V",
            "0.7 V",
            "1.2 V",
            "5 V"
        ],
        "ans": "0.3 V"
    },
    {
        "id": 29,
        "q": "The current in reverse bias is called:",
        "hasImg": false,
        "options": [
            "Forward current",
            "Leakage current",
            "Saturation current",
            "Load current"
        ],
        "ans": "Leakage current"
    },
    {
        "id": 30,
        "q": "The graph between current and voltage of a diode is called:",
        "hasImg": false,
        "options": [
            "Transfer characteristic",
            "V-I characteristic",
            "Frequency response",
            "Output characteristic"
        ],
        "ans": "V-I characteristic"
    },
    {
        "id": 31,
        "q": "Which instrument is used to measure voltage across the Zener diode?",
        "hasImg": false,
        "options": [
            "Ammeter",
            "Wattmeter",
            "Voltmeter",
            "Galvanometer"
        ],
        "ans": "Voltmeter"
    },
    {
        "id": 32,
        "q": "Which instrument measures current through the Zener diode?",
        "hasImg": false,
        "options": [
            "Voltmeter",
            "Ammeter",
            "Ohmmeter",
            "CRO"
        ],
        "ans": "Ammeter"
    },
    {
        "id": 33,
        "q": "The reverse current before breakdown is called:",
        "hasImg": false,
        "options": [
            "Leakage current",
            "Saturation current",
            "Drift current",
            "Ripple current"
        ],
        "ans": "Leakage current"
    },
    {
        "id": 34,
        "q": "The graph plotted in this experiment is between:",
        "hasImg": false,
        "options": [
            "Voltage and Resistance",
            "Voltage and Current",
            "Current and Power",
            "Voltage and Power"
        ],
        "ans": "Voltage and Current"
    },
    {
        "id": 35,
        "q": "The symbol of a Zener diode differs from a PN diode because of:",
        "hasImg": false,
        "options": [
            "Curved cathode line",
            "Zig-zag cathode line",
            "Longer anode",
            "Circular symbol"
        ],
        "ans": "Zig-zag cathode line"
    },
    {
        "id": 36,
        "q": "Which electronic component is connected in series with a Zener diode to limit current?",
        "hasImg": false,
        "options": [
            "Capacitor",
            "Inductor",
            "Resistor",
            "Transistor"
        ],
        "ans": "Resistor"
    },
    {
        "id": 37,
        "q": "The Zener diode maintains a nearly constant output voltage despite changes in:",
        "hasImg": false,
        "options": [
            "Input voltage",
            "Load current",
            "Both A and B",
            "Frequency"
        ],
        "ans": "Both A and B"
    },
    {
        "id": 38,
        "q": "The breakdown voltage of a Zener diode is determined during:",
        "hasImg": false,
        "options": [
            "Fabrication",
            "Packaging",
            "Testing",
            "Installation"
        ],
        "ans": "Fabrication"
    },
    {
        "id": 39,
        "q": "Which parameter indicates the effectiveness of voltage regulation?",
        "hasImg": false,
        "options": [
            "Current gain",
            "Voltage regulation",
            "Power factor",
            "Efficiency"
        ],
        "ans": "Voltage regulation"
    },
    {
        "id": 40,
        "q": "The symbol of a Zener diode differs from a normal diode because of:",
        "hasImg": false,
        "options": [
            "Curved cathode line",
            "Straight cathode line",
            "Additional terminal",
            "Larger anode"
        ],
        "ans": "Curved cathode line"
    },
    {
        "id": 41,
        "q": "The three terminals of an SCR are:",
        "hasImg": false,
        "options": [
            "Emitter, Base, Collector",
            "Drain, Gate, Source",
            "Anode, Cathode, Gate",
            "Input, Output, Ground"
        ],
        "ans": "Anode, Cathode, Gate"
    },
    {
        "id": 42,
        "q": "The gate terminal is used to:",
        "hasImg": false,
        "options": [
            "Turn OFF the SCR",
            "Trigger the SCR into conduction",
            "Increase voltage",
            "Reduce current"
        ],
        "ans": "Trigger the SCR into conduction"
    },
    {
        "id": 43,
        "q": "The SCR conducts when:",
        "hasImg": false,
        "options": [
            "Reverse biased",
            "Forward biased and gate pulse is applied",
            "Gate is open",
            "Cathode voltage is high"
        ],
        "ans": "Forward biased and gate pulse is applied"
    },
    {
        "id": 44,
        "q": "The minimum gate current required to turn ON an SCR is called:",
        "hasImg": false,
        "options": [
            "Holding current",
            "Latching current",
            "Gate trigger current",
            "Leakage current"
        ],
        "ans": "Gate trigger current"
    },
    {
        "id": 45,
        "q": "Which current is required to keep the SCR continuously ON?",
        "hasImg": false,
        "options": [
            "Reverse current",
            "Holding current",
            "Gate current",
            "Breakdown current"
        ],
        "ans": "Holding current"
    },
    {
        "id": 46,
        "q": "The average DC output voltage of an ideal half-wave rectifier is:",
        "hasImg": false,
        "options": [
            "Vm/pi",
            "2Vm/pi",
            "Vm/2",
            "Vm"
        ],
        "ans": "Vm/pi"
    },
    {
        "id": 47,
        "q": "The RMS output voltage of an ideal half-wave rectifier is:",
        "hasImg": false,
        "options": [
            "Vm/2",
            "Vm/sqrt(2)",
            "Vm/pi",
            "Vm"
        ],
        "ans": "Vm/2"
    },
    {
        "id": 48,
        "q": "The ripple factor of a half-wave rectifier is approximately:",
        "hasImg": false,
        "options": [
            "0.482",
            "0.812",
            "1.21",
            "1.57"
        ],
        "ans": "1.21"
    },
    {
        "id": 49,
        "q": "The maximum rectification efficiency of a half-wave rectifier is:",
        "hasImg": false,
        "options": [
            "40.6%",
            "50%",
            "81.2%",
            "100%"
        ],
        "ans": "40.6%"
    },
    {
        "id": 50,
        "q": "The Peak Inverse Voltage (PIV) of the diode in a half-wave rectifier is:",
        "hasImg": false,
        "options": [
            "Vm",
            "2Vm",
            "Vm/2",
            "4Vm"
        ],
        "ans": "Vm"
    }
];

const quizQuestions3rd = [
    {
        "id": 1,
        "q": "Calculate the current through 48 ohm resistor in the circuit shown. Assume the diode drop is 0.7V.",
        "hasImg": true,
        "img": "assets/quiz/q1.png",
        "options": [
            "1.72mA",
            "17.2mA",
            "172mA",
            "0.172mA"
        ],
        "ans": "1.72mA"
    },
    {
        "id": 2,
        "q": "Find the voltage VA in the circuit shown below",
        "hasImg": true,
        "img": "assets/quiz/q2.png",
        "options": [
            "19.7V",
            "20V",
            "12V",
            "0.7V"
        ],
        "ans": "19.7V"
    },
    {
        "id": 3,
        "q": "Find the current which passes through the circuit shown below",
        "hasImg": true,
        "img": "assets/quiz/q3.png",
        "options": [
            "0.5A",
            "1A",
            "1.5A",
            "2A"
        ],
        "ans": "0.5A"
    },
    {
        "id": 4,
        "q": "Consider the circuit with R1 = 5 ohms and R2 = 3 ohms and current source I1 = 5A. Determine the voltage drop(Vs) across the current source using KVL.",
        "hasImg": true,
        "img": "assets/quiz/q4.png",
        "options": [
            "40V",
            "15V",
            "25V",
            "10V"
        ],
        "ans": "40V"
    },
    {
        "id": 5,
        "q": "Determine current through each diode in the circuit shown below. Assume diodes to be similar.",
        "hasImg": true,
        "img": "assets/quiz/q5.png",
        "options": [
            "14.3mA",
            "28.6mA",
            "7.15mA",
            "0mA"
        ],
        "ans": "14.3mA"
    },
    {
        "id": 6,
        "q": "What is the equivalent resistance if three resistances of 6 ohm, 3 ohm, and 8 ohm are connected in parallel?",
        "hasImg": false,
        "options": [
            "1.6 Ohms",
            "2 Ohms",
            "17 Ohms",
            "0.6 Ohms"
        ],
        "ans": "1.6 Ohms"
    },
    {
        "id": 7,
        "q": "Find the equivalent resistance for the circuit shown below.",
        "hasImg": true,
        "img": "assets/quiz/q7.png",
        "options": [
            "9.6 Ohms",
            "10 Ohms",
            "12 Ohms",
            "8.4 Ohms"
        ],
        "ans": "9.6 Ohms"
    },
    {
        "id": 8,
        "q": "Find the equivalent resistance for the circuit shown below",
        "hasImg": true,
        "img": "assets/quiz/q8.png",
        "options": [
            "17 Ohms",
            "20 Ohms",
            "15 Ohms",
            "30 Ohms"
        ],
        "ans": "17 Ohms"
    },
    {
        "id": 9,
        "q": "How to connect Ammeter and Voltmeter in a circuit?",
        "hasImg": false,
        "options": [
            "Ammeter in series, Voltmeter in parallel",
            "Ammeter in parallel, Voltmeter in series",
            "Both in series",
            "Both in parallel"
        ],
        "ans": "Ammeter in series, Voltmeter in parallel"
    },
    {
        "id": 10,
        "q": "How many select lines would be required for an 32-line-to-1-line multiplexer?",
        "hasImg": false,
        "options": [
            "5",
            "4",
            "6",
            "32"
        ],
        "ans": "5"
    },
    {
        "id": 11,
        "q": "In the given 4-to-1 multiplexer, if c1 = 0 and c0 = 1 then the output M is ___________",
        "hasImg": true,
        "img": "assets/quiz/q11.png",
        "options": [
            "X0",
            "X1",
            "X2",
            "X3"
        ],
        "ans": "X1"
    },
    {
        "id": 12,
        "q": "A Multiplexer has _______ inputs, _______ output, and _______ selection lines.",
        "hasImg": false,
        "options": [
            "2^n inputs, 1 output and n selection lines",
            "n inputs, 1 output and 2^n selection lines",
            "2^n inputs, n outputs and 1 selection line",
            "2 inputs, 1 output and 1 selection line"
        ],
        "ans": "2^n inputs, 1 output and n selection lines"
    },
    {
        "id": 13,
        "q": "The output waveform of the following circuit is.",
        "hasImg": true,
        "img": "assets/quiz/q13.png",
        "options": [
            "Clamped positively to 8V",
            "Clamped negatively to -8V",
            "Sine wave shifted upwards with peaks at 16V and 8V",
            "Rectified half sine wave"
        ],
        "ans": "Sine wave shifted upwards with peaks at 16V and 8V"
    },
    {
        "id": 14,
        "q": "In a full wave rectification the input frequency is 50Hz and what will be the output frequency?",
        "hasImg": false,
        "options": [
            "50Hz",
            "100Hz",
            "25Hz",
            "200Hz"
        ],
        "ans": "100Hz"
    },
    {
        "id": 15,
        "q": "What will be the output if 100V DC is supplied to 1:2 transformer?",
        "hasImg": false,
        "options": [
            "0V",
            "200V",
            "50V",
            "100V"
        ],
        "ans": "0V"
    },
    {
        "id": 16,
        "q": "For the following inverting operational amplifier find the closed loop voltage gain",
        "hasImg": true,
        "img": "assets/quiz/q16.png",
        "options": [
            "-4",
            "-2",
            "4",
            "-0.25"
        ],
        "ans": "-4"
    },
    {
        "id": 17,
        "q": "Draw the output wave form for the below circuit.",
        "hasImg": true,
        "img": "assets/quiz/q17.png",
        "options": [
            "Inverted sine wave with 2V peak",
            "Non-inverted sine wave with 2V peak",
            "Square wave with 2V peak",
            "Inverted sine wave with 1V peak"
        ],
        "ans": "Inverted sine wave with 2V peak"
    },
    {
        "id": 18,
        "q": "Bulb 1 is labeled as 60W, 120V and bulb 2 is labeled as 120W, 120V. Which one would be brighter when connected in series?",
        "hasImg": false,
        "options": [
            "60W Bulb",
            "120W Bulb",
            "Both equally bright",
            "Neither will glow"
        ],
        "ans": "60W Bulb"
    },
    {
        "id": 19,
        "q": "Bulb 1 is labeled as 60W, 120V and bulb 2 is labeled as 120W, 120V. Which one would be brighter when connected in Parallel?",
        "hasImg": false,
        "options": [
            "60W Bulb",
            "120W Bulb",
            "Both equally bright",
            "Neither will glow"
        ],
        "ans": "120W Bulb"
    },
    {
        "id": 20,
        "q": "When 5 DC sources with rating of 3V, 1A each are connected in series and in parallel. What will be the effective voltage and current delivered?",
        "hasImg": false,
        "options": [
            "Series = 15V & 1A, Parallel = 3V & 5A",
            "Series = 3V & 5A, Parallel = 15V & 1A",
            "Series = 15V & 5A, Parallel = 3V & 1A",
            "Series = 3V & 1A, Parallel = 15V & 5A"
        ],
        "ans": "Series = 15V & 1A, Parallel = 3V & 5A"
    },
    {
        "id": 21,
        "q": "Calculate the maximum safe current that can pass through a 1.8 kOhm resistor rated at 0.5W.",
        "hasImg": false,
        "options": [
            "16.7mA",
            "27.8mA",
            "5.5mA",
            "1.67mA"
        ],
        "ans": "16.7mA"
    },
    {
        "id": 22,
        "q": "Obtain the source current I and the total power delivered by the current source to the circuit in the figure.",
        "hasImg": true,
        "img": "assets/quiz/q22.png",
        "options": [
            "6A",
            "4A",
            "10A",
            "2A"
        ],
        "ans": "6A"
    },
    {
        "id": 23,
        "q": "Calculate the equivalent capacitance across the terminal A and B.",
        "hasImg": true,
        "img": "assets/quiz/q23.png",
        "options": [
            "6.66uF",
            "30uF",
            "15uF",
            "5uF"
        ],
        "ans": "6.66uF"
    },
    {
        "id": 24,
        "q": "Find out the voltage across diode (Vo) for the circuits shown below",
        "hasImg": true,
        "img": "assets/quiz/q24.png",
        "options": [
            "3V",
            "0V",
            "0.7V",
            "1.4V"
        ],
        "ans": "3V"
    },
    {
        "id": 25,
        "q": "Find out the voltage across diode (Vo) for the circuits shown below",
        "hasImg": true,
        "img": "assets/quiz/q25.png",
        "options": [
            "0V",
            "3V",
            "0.7V",
            "1.5V"
        ],
        "ans": "0V"
    },
    {
        "id": 26,
        "q": "Write the truth table of XOR gate.",
        "hasImg": false,
        "options": [
            "0 for same inputs, 1 for different inputs",
            "1 for same inputs, 0 for different inputs",
            "Always 1",
            "Always 0"
        ],
        "ans": "0 for same inputs, 1 for different inputs"
    },
    {
        "id": 27,
        "q": "What is the given circuit called as?",
        "hasImg": true,
        "img": "assets/quiz/q27.png",
        "options": [
            "Positive clipper",
            "Negative clipper",
            "Clamper",
            "Rectifier"
        ],
        "ans": "Positive clipper"
    },
    {
        "id": 28,
        "q": "In below given circuits determine the boolean equations",
        "hasImg": true,
        "img": "assets/quiz/q28.png",
        "options": [
            "Y = A'.B + A'.Y, X = A.B' + B'.X",
            "Y = A.B + A.Y, X = A'.B' + B.X",
            "Y = A+B, X = A'+B'",
            "Y = AB, X = A'B'"
        ],
        "ans": "Y = A'.B + A'.Y, X = A.B' + B'.X"
    },
    {
        "id": 29,
        "q": "Consider the counter shown in figure. Let the initial state before clock is applied be (Q1Q2Q3Q4) = 1010. After the first CLK, what will be the values for (Q1Q2Q3Q4) and Z?",
        "hasImg": true,
        "img": "assets/quiz/q29.png",
        "options": [
            "0101, 1",
            "1010, 0",
            "1100, 1",
            "0011, 0"
        ],
        "ans": "0101, 1"
    },
    {
        "id": 30,
        "q": "Consider the counter shown in figure. Let the initial state before clock is applied be (Q1Q2Q3Q4) = 1010. After the second CLK, what will be the values for (Q1Q2Q3Q4) and Z?",
        "hasImg": true,
        "img": "assets/quiz/q30.png",
        "options": [
            "1010, 0",
            "0101, 1",
            "1111, 1",
            "0000, 0"
        ],
        "ans": "1010, 0"
    },
    {
        "id": 31,
        "q": "The circuit shown in the figure represents a:",
        "hasImg": true,
        "img": "assets/quiz/q31.png",
        "options": [
            "Voltage Controlled Voltage Source",
            "Voltage controlled Current source",
            "Current Controlled current source",
            "Current controlled Current source"
        ],
        "ans": "Current controlled Current source"
    },
    {
        "id": 32,
        "q": "The minimum number of 2-input NAND gates required to implement a 2-input XOR gate is:",
        "hasImg": false,
        "options": [
            "4",
            "3",
            "5",
            "6"
        ],
        "ans": "4"
    },
    {
        "id": 33,
        "q": "The output of the logic gate in figure is:",
        "hasImg": true,
        "img": "assets/quiz/q33.png",
        "options": [
            "A'",
            "A",
            "0",
            "1"
        ],
        "ans": "A'"
    },
    {
        "id": 34,
        "q": "In the circuit shown below, P and Q are the inputs. The logical function realized is:",
        "hasImg": true,
        "img": "assets/quiz/q34.png",
        "options": [
            "Y = P XOR Q",
            "Y = PQ",
            "Y = P + Q",
            "Y = P'Q"
        ],
        "ans": "Y = P XOR Q"
    },
    {
        "id": 35,
        "q": "What is the condition for sampling process with respect to message signal and carrier signal frequency?",
        "hasImg": false,
        "options": [
            "Fs >= 2fm",
            "Fs < 2fm",
            "Fs = fm",
            "Fs = 1/2 fm"
        ],
        "ans": "Fs >= 2fm"
    },
    {
        "id": 36,
        "q": "Binary number 1101.101 is equivalent to decimal number:",
        "hasImg": false,
        "options": [
            "13.625",
            "13.5",
            "13.75",
            "14.625"
        ],
        "ans": "13.625"
    },
    {
        "id": 37,
        "q": "In figure v1 = 8 V and v2 = 4 V. Which diode will conduct?",
        "hasImg": true,
        "img": "assets/quiz/q37.png",
        "options": [
            "D1",
            "D2",
            "Both D1 and D2",
            "Neither D1 nor D2"
        ],
        "ans": "D1"
    },
    {
        "id": 38,
        "q": "The input impedance of op-amp circuit of figure is:",
        "hasImg": true,
        "img": "assets/quiz/q38.png",
        "options": [
            "10K Ohm",
            "20K Ohm",
            "Infinite",
            "0 Ohm"
        ],
        "ans": "10K Ohm"
    },
    {
        "id": 39,
        "q": "Crossover distortion behaviour is characteristic of which amplifier?",
        "hasImg": true,
        "img": "assets/quiz/q39.png",
        "options": [
            "Class B",
            "Class A",
            "Class AB",
            "Class C"
        ],
        "ans": "Class B"
    },
    {
        "id": 40,
        "q": "A potential difference across 24 ohm resistor is 12V. What is the current through the resistor?",
        "hasImg": true,
        "img": "assets/quiz/q40.png",
        "options": [
            "0.5A",
            "2A",
            "1.2A",
            "0.25A"
        ],
        "ans": "0.5A"
    },
    {
        "id": 41,
        "q": "Calculate equivalent resistance for circuit connected to 24 V battery and find potential difference across 4 ohm and 6 ohm resistors.",
        "hasImg": true,
        "img": "assets/quiz/q41.png",
        "options": [
            "Req = 10 Ohm, V1 = 9.6V, V2 = 14.4V",
            "Req = 5 Ohm, V1 = 12V, V2 = 12V",
            "Req = 10 Ohm, V1 = 12V, V2 = 12V",
            "Req = 2.4 Ohm, V1 = 9.6V, V2 = 14.4V"
        ],
        "ans": "Req = 10 Ohm, V1 = 9.6V, V2 = 14.4V"
    },
    {
        "id": 42,
        "q": "Calculate equivalent resistance in the circuit and find the currents I, I1 and I2.",
        "hasImg": true,
        "img": "assets/quiz/q42.png",
        "options": [
            "Req = 2.4 Ohm, I1 = 6A, I2 = 4A",
            "Req = 10 Ohm, I1 = 2.4A, I2 = 2.4A",
            "Req = 2.4 Ohm, I1 = 4A, I2 = 6A",
            "Req = 5 Ohm, I1 = 6A, I2 = 4A"
        ],
        "ans": "Req = 2.4 Ohm, I1 = 6A, I2 = 4A"
    },
    {
        "id": 43,
        "q": "Calculate the equivalent resistance in the following circuit:",
        "hasImg": true,
        "img": "assets/quiz/q43.png",
        "options": [
            "6 Ohm",
            "12 Ohm",
            "3 Ohm",
            "1.6 Ohm"
        ],
        "ans": "6 Ohm"
    },
    {
        "id": 44,
        "q": "What is the name of the following circuit?",
        "hasImg": true,
        "img": "assets/quiz/q44.png",
        "options": [
            "Positive series Clipper",
            "Negative series Clipper",
            "Positive shunt Clipper",
            "Negative shunt Clipper"
        ],
        "ans": "Positive series Clipper"
    },
    {
        "id": 45,
        "q": "What is the name of the following circuit?",
        "hasImg": true,
        "img": "assets/quiz/q45.png",
        "options": [
            "Positive shunt Clipper",
            "Negative shunt Clipper",
            "Positive series Clipper",
            "Negative series Clipper"
        ],
        "ans": "Positive shunt Clipper"
    }
];

let quizQuestions = [];
let selectedAnswers = {}; // Keep track of selected answer index for each question index (key: question index, value: selected option index)

let currentQuizIndex = 0;
let quizScore = 0;

let currentTeamDetails = null;
let quizTimerSeconds = 2700; // 45 minutes
let quizTimerInterval = null;
let quizStartTime = 0;

let selectedCmsYear = ''; // 'Second Year' or 'Third Year'
let proctorViolations = 0;
let isQuizActive = false;

function startTechnicalMcqSelection() {
    selectedCmsYear = '';
    portalContent.innerHTML = `
        <div class="mcq-selection-container" style="display: flex; flex-direction: column; width: 100%; max-width: 480px; margin: 0 auto; gap: 1.5rem; font-family: 'Plus Jakarta Sans', sans-serif; text-align: center;">
            <button class="btn-admin-logout" style="width: fit-content; padding: 0.4rem 1.2rem; margin: 0;" onclick="openClubInterface('electronics')">← Back to Rounds</button>
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.25rem;">TECHNICAL MCQ</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Select your academic year to verify credentials and unlock the exam portal.</p>
            
            <div id="year-selection-btns" style="display: flex; gap: 1rem; width: 100%;">
                <button onclick="selectMcqYear('Second Year')" id="btn-select-2yr" class="event-reg-link" style="flex: 1; margin: 0; padding: 1rem 0; font-weight: bold; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #fff !important; cursor: pointer;">Second Year</button>
                <button onclick="selectMcqYear('Third Year')" id="btn-select-3yr" class="event-reg-link" style="flex: 1; margin: 0; padding: 1rem 0; font-weight: bold; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #fff !important; cursor: pointer;">Third Year</button>
            </div>
            
            <div id="pin-verification-area" style="display: none; flex-direction: column; gap: 1rem; margin-top: 1rem; padding: 1.5rem; background: rgba(8, 12, 23, 0.6); border: 1px solid rgba(0, 210, 255, 0.15); border-radius: 12px;">
                <label style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; text-align: left;">Enter PIN *</label>
                <input type="password" id="mcq-auth-pin" class="form-control" maxlength="4" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem; color: #fff; font-size: 1.1rem; text-align: center; letter-spacing: 4px;" placeholder="XXXX" required>
                <div id="pin-error-msg" style="color: #f87171; font-size: 0.8rem; text-align: left; display: none;">Invalid PIN code! Please check your entry.</div>
                <button onclick="verifyMcqAuthPin()" class="event-reg-link" style="width: 100%; margin-top: 0.5rem; border: none; padding: 0.75rem; background: var(--accent-cyan); color: var(--bg-dark) !important; font-weight: bold; letter-spacing: 1px; cursor: pointer;">VERIFY & PROCEED</button>
            </div>
        </div>
    `;
}

function selectMcqYear(year) {
    selectedCmsYear = year;
    
    const btn2 = document.getElementById('btn-select-2yr');
    const btn3 = document.getElementById('btn-select-3yr');
    
    if (year === 'Second Year') {
        if (btn2) {
            btn2.style.borderColor = 'var(--accent-cyan)';
            btn2.style.background = 'rgba(0, 210, 255, 0.05)';
            btn2.style.color = 'var(--accent-cyan)';
        }
        if (btn3) {
            btn3.style.borderColor = 'rgba(255,255,255,0.15)';
            btn3.style.background = 'transparent';
            btn3.style.color = '#fff';
        }
    } else {
        if (btn3) {
            btn3.style.borderColor = 'var(--accent-cyan)';
            btn3.style.background = 'rgba(0, 210, 255, 0.05)';
            btn3.style.color = 'var(--accent-cyan)';
        }
        if (btn2) {
            btn2.style.borderColor = 'rgba(255,255,255,0.15)';
            btn2.style.background = 'transparent';
            btn2.style.color = '#fff';
        }
    }
    
    document.getElementById('pin-verification-area').style.display = 'flex';
    document.getElementById('mcq-auth-pin').value = '';
    document.getElementById('mcq-auth-pin').focus();
    document.getElementById('pin-error-msg').style.display = 'none';
}

function verifyMcqAuthPin() {
    const pinVal = document.getElementById('mcq-auth-pin').value.trim();
    const errorMsg = document.getElementById('pin-error-msg');
    
    let isCorrect = false;
    if (selectedCmsYear === 'Second Year' && pinVal === '2029') {
        isCorrect = true;
    } else if (selectedCmsYear === 'Third Year' && pinVal === '2028') {
        isCorrect = true;
    }
    
    if (isCorrect) {
        checkMcqLockStatusAndProceed();
    } else {
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.style.color = '#ef4444';
            errorMsg.textContent = 'Invalid Access PIN code.';
        }
    }
}

function checkMcqLockStatusAndProceed() {
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    
    const getUrl = `${url}/rest/v1/vsb_ece_state?key=eq.mcq_locks`;
    
    const errorMsg = document.getElementById('pin-error-msg');
    if (errorMsg) {
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#38bdf8';
        errorMsg.textContent = 'Checking test status...';
    }
    
    fetch(getUrl, {
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    })
    .then(res => res.json())
    .then(data => {
        let locks = { secondYearLocked: false, thirdYearLocked: false };
        if (data && data.length > 0) {
            try {
                locks = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
            } catch (e) {
                locks = data[0].value || locks;
            }
        }
        
        const isLocked = selectedCmsYear === 'Second Year' ? locks.secondYearLocked : locks.thirdYearLocked;
        
        if (isLocked) {
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.style.color = '#f87171';
                errorMsg.textContent = `⚠️ The MCQ Test for ${selectedCmsYear} is currently locked by the administrator!`;
            }
            alert(`⚠️ The MCQ Test for ${selectedCmsYear} is currently locked by the administrator. Please wait for the admin to unlock the test!`);
        } else {
            if (errorMsg) errorMsg.style.display = 'none';
            renderMcqRegistration();
        }
    })
    .catch(err => {
        console.error("Error checking MCQ locks:", err);
        // Fallback: if network fails, let it proceed
        if (errorMsg) errorMsg.style.display = 'none';
        renderMcqRegistration();
    });
}

function renderMcqRegistration() {
    portalContent.innerHTML = `
        <div class="quiz-registration-container" style="display: flex; flex-direction: column; width: 100%; max-width: 760px; aspect-ratio: 16 / 9; margin: 0 auto; gap: 1rem; font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; justify-content: center; padding: 1.5rem; background: rgba(8, 12, 23, 0.4); border-radius: 16px; border: 1px solid rgba(0, 210, 255, 0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <button class="btn-admin-logout" style="width: fit-content; padding: 0.3rem 1rem; margin: 0;" onclick="startTechnicalMcqSelection()">← Back</button>
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; color: var(--accent-cyan); margin: 0;">Registration (${selectedCmsYear})</h3>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem; margin: 0;">
                    <label style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">STUDENT NAME *</label>
                    <input type="text" id="reg-student-name" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.55rem; color: #fff; font-size: 0.85rem;" required placeholder="Enter your full name">
                </div>
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem; margin: 0;">
                    <label style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">REGISTER NUMBER *</label>
                    <input type="text" id="reg-regnum" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.55rem; color: #fff; font-size: 0.85rem;" required placeholder="Enter Register Number">
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem; margin: 0;">
                    <label style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">DEPARTMENT *</label>
                    <input type="text" id="reg-dept" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.55rem; color: #fff; font-size: 0.85rem;" value="ECE" required>
                </div>
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem; margin: 0;">
                    <label style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">YEAR</label>
                    <input type="text" id="reg-year" class="form-control" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.55rem; color: #aaa; font-size: 0.85rem;" value="${selectedCmsYear}" disabled readonly>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem; margin: 0;">
                    <label style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">SECTION *</label>
                    <input type="text" id="reg-section" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.55rem; color: #fff; font-size: 0.85rem;" required placeholder="e.g. A or B">
                </div>
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem; margin: 0;">
                    <label style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">MAIL *</label>
                    <input type="email" id="reg-mail" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.55rem; color: #fff; font-size: 0.85rem;" required placeholder="e.g. name@vsbec.edu.in">
                </div>
            </div>
            
            <button class="event-reg-link" onclick="validateAndStartMcqQuiz()" style="width: 100%; margin-top: 0.5rem; border: none; padding: 0.75rem; background: var(--accent-cyan); color: var(--bg-dark) !important; cursor: pointer; border-radius: 50px; font-weight: bold; letter-spacing: 1px; font-size: 0.9rem;">START TEST</button>
        </div>
    `;
}

function validateAndStartMcqQuiz() {
    const studentName = document.getElementById('reg-student-name')?.value.trim();
    const regnum = document.getElementById('reg-regnum')?.value.trim();
    const dept = document.getElementById('reg-dept')?.value.trim();
    const section = document.getElementById('reg-section')?.value.trim();
    const mail = document.getElementById('reg-mail')?.value.trim();
    
    if (!studentName || !regnum || !dept || !section || !mail) {
        alert('Please fill out all required fields marked with *');
        return;
    }
    
    currentTeamDetails = {
        studentName,
        regnum,
        dept,
        year: selectedCmsYear,
        section,
        mail
    };
    
    // Load the correct set of questions based on Year selection
    let masterQuestions = [];
    if (selectedCmsYear === 'Third Year') {
        masterQuestions = quizQuestions3rd;
    } else {
        masterQuestions = quizQuestions2nd;
    }
    
    // Fisher-Yates shuffle the questions to prevent cheating in simultaneous class testing
    quizQuestions = [...masterQuestions];
    for (let i = quizQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [quizQuestions[i], quizQuestions[j]] = [quizQuestions[j], quizQuestions[i]];
    }
    
    currentQuizIndex = 0;
    quizScore = 0;
    selectedAnswers = {}; // reset selections
    quizTimerSeconds = 2700; // 45 minutes
    quizStartTime = Date.now();
    
    // Request Fullscreen Mode
    requestFullscreen();
    setupProctoring();
    
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    quizTimerInterval = setInterval(updateQuizTimer, 1000);
    
    renderQuizQuestion();
}

function requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen().catch(()=>{});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(()=>{});
    else if (el.msRequestFullscreen) el.msRequestFullscreen().catch(()=>{});
}

let lastViolationTime = 0;

function preventProhibitedQuizActions(e) {
    e.preventDefault();
}

function registerProctorViolation(reason) {
    if (!isQuizActive) return;
    
    const now = Date.now();
    if (now - lastViolationTime < 1500) {
        return;
    }
    lastViolationTime = now;
    
    proctorViolations++;
    if (proctorViolations >= 3) {
        alert(`Proctor Warning: 3 violations reached (${reason}). Auto-submitting your test.`);
        finishQuiz();
    } else {
        alert(`⚠️ PROCTORING ALERT: ${reason}! (Violation ${proctorViolations} of 2)`);
    }
}

function handleWindowBlur() {
    registerProctorViolation("Screen search, Screenshot overlay, or Google Lens invocation detected");
}

function setupProctoring() {
    proctorViolations = 0;
    isQuizActive = true;
    
    // Inject anti-copy style during setup
    if (!document.getElementById('quiz-anti-copy-style')) {
        const style = document.createElement('style');
        style.id = 'quiz-anti-copy-style';
        style.innerHTML = `
            .quiz-active-mode {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
            }
            .quiz-active-mode img {
                pointer-events: none !important;
                -webkit-touch-callout: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.classList.add('quiz-active-mode');
    
    // Add event listeners for proctor lock
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    
    // Disable text operations
    document.addEventListener('contextmenu', preventProhibitedQuizActions);
    document.addEventListener('copy', preventProhibitedQuizActions);
    document.addEventListener('cut', preventProhibitedQuizActions);
    document.addEventListener('selectstart', preventProhibitedQuizActions);
}

function removeProctoring() {
    isQuizActive = false;
    document.body.classList.remove('quiz-active-mode');
    
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    
    // Enable text operations back
    document.removeEventListener('contextmenu', preventProhibitedQuizActions);
    document.removeEventListener('copy', preventProhibitedQuizActions);
    document.removeEventListener('cut', preventProhibitedQuizActions);
    document.removeEventListener('selectstart', preventProhibitedQuizActions);
    
    // Exit fullscreen
    if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen().catch(()=>{});
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen().catch(()=>{});
    else if (document.msExitFullscreen) document.msExitFullscreen().catch(()=>{});
}

function handleFullscreenChange() {
    if (!isQuizActive) return;
    
    const isFullscreen = document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.mozFullScreenElement || 
                         document.msFullscreenElement;
                         
    if (!isFullscreen) {
        proctorViolations++;
        if (proctorViolations >= 3) {
            alert("Proctor Penalty: Multiple fullscreen exits detected. Your test is being submitted automatically.");
            finishQuiz();
        } else {
            showFullscreenBlocker();
        }
    }
}

function showFullscreenBlocker() {
    portalContent.innerHTML = `
        <div class="proctor-blocker" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%; height: 350px; padding: 2rem; background: rgba(239, 68, 68, 0.05); border: 2px solid var(--accent-red); border-radius: 12px; animation: fadeIn 0.3s ease;">
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; color: var(--accent-red); margin-bottom: 1rem;">⚠️ PROCTORING ALERT</h3>
            <p style="color: var(--text-primary); font-size: 1rem; margin-bottom: 1.5rem; max-width: 480px;">Exiting Fullscreen Mode is strictly prohibited during the exam. You must stay in fullscreen until submission. (Violation ${proctorViolations} of 2)</p>
            <button onclick="resumeFullscreenTest()" class="event-reg-link" style="width: auto; padding: 0.8rem 2.5rem; background: var(--accent-cyan); color: var(--bg-dark) !important; border: none; font-weight: bold; border-radius: 50px; cursor: pointer;">RE-ENTER FULLSCREEN</button>
        </div>
    `;
}

function resumeFullscreenTest() {
    requestFullscreen();
    setTimeout(renderQuizQuestion, 100);
}

function handleVisibilityChange() {
    if (!isQuizActive) return;
    if (document.hidden) {
        registerProctorViolation("Tab/App switching or background minimization detected");
    }
}

function updateQuizTimer() {
    quizTimerSeconds--;
    
    const timerDisplay = document.getElementById('quiz-timer-display');
    if (timerDisplay) {
        const mins = Math.floor(quizTimerSeconds / 60);
        const secs = quizTimerSeconds % 60;
        timerDisplay.innerText = `Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (quizTimerSeconds < 120) {
            timerDisplay.style.color = '#f87171';
            timerDisplay.style.textShadow = '0 0 10px rgba(248,113,113,0.5)';
            timerDisplay.style.borderColor = '#f87171';
            timerDisplay.style.background = 'rgba(248,113,113,0.05)';
        }
    }
    
    if (quizTimerSeconds <= 0) {
        clearInterval(quizTimerInterval);
        alert('Time is up! Your answers are being submitted.');
        finishQuiz();
    }
}

function exitQuizAlert() {
    if (confirm("Are you sure you want to exit the quiz? Your progress will be lost!")) {
        if (quizTimerInterval) clearInterval(quizTimerInterval);
        removeProctoring();
        openClubInterface('electronics');
    }
}

function renderQuizQuestion() {
    const q = quizQuestions[currentQuizIndex];
    const progressPercent = ((currentQuizIndex + 1) / quizQuestions.length) * 100;
    
    let figureHtml = '';
    if (q.hasImg) {
        figureHtml = `
            <div style="text-align: center; margin: 1rem 0;">
                <img src="${q.img}" alt="Circuit Diagram" style="max-width: 100%; max-height: 220px; border-radius: 8px; border: 1px solid rgba(0, 210, 255, 0.2); padding: 0.5rem; background: rgba(8, 12, 23, 0.6); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            </div>
        `;
    }
    
    // Retrieve previously selected answer if any
    const savedIdx = selectedAnswers[currentQuizIndex] !== undefined ? selectedAnswers[currentQuizIndex] : null;
    
    let optionsHtml = '';
    q.options.forEach((opt, oIdx) => {
        const isSelected = savedIdx === oIdx;
        const borderStyle = isSelected ? 'border-color: var(--accent-cyan); background: rgba(0, 210, 255, 0.05); color: var(--accent-cyan);' : 'border-color: rgba(255,255,255,0.08); background: #060913; color: var(--text-primary);';
        
        optionsHtml += `
            <button class="quiz-option-btn" onclick="selectQuizOption(this, ${oIdx})" style="width: 100%; text-align: left; padding: 1rem; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between; ${borderStyle}">
                <span>${opt}</span>
                <span class="option-feedback" style="display: none; font-weight: bold;"></span>
            </button>
        `;
    });
    
    const mins = Math.floor(quizTimerSeconds / 60);
    const secs = quizTimerSeconds % 60;
    
    // Show back button only if we are past the first question to allow students to edit prior answers
    const hasBack = currentQuizIndex > 0;
    const backBtnHtml = hasBack ? `
        <button class="event-reg-link" style="margin: 0; padding: 0.6rem 2.0rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff !important; cursor: pointer;" onclick="navigatePrevQuestion()">
            Previous
        </button>
    ` : '';
    
    const isLast = currentQuizIndex === quizQuestions.length - 1;
    const btnText = isLast ? 'Finish Quiz' : 'Next Question';
    const actionBtnHtml = `
        <button class="event-reg-link" style="margin: 0; padding: 0.6rem 2.5rem; background: var(--accent-cyan); border: none; color: var(--bg-dark) !important; cursor: pointer;" onclick="navigateNextQuestion()">
            ${btnText}
        </button>
    `;
    
    portalContent.innerHTML = `
        <div class="quiz-container" style="display: flex; flex-direction: column; width: 100%; max-height: 480px; overflow-y: auto; padding-right: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <button class="btn-admin-logout" style="width: fit-content; padding: 0.4rem 1.2rem; margin: 0;" onclick="exitQuizAlert()">← Exit Quiz</button>
                <div id="quiz-timer-display" style="font-family: monospace; font-size: 0.95rem; font-weight: bold; color: var(--accent-cyan); background: rgba(0,210,255,0.05); padding: 0.25rem 0.75rem; border-radius: 6px; border: 1px solid rgba(0,210,255,0.15);">Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}</div>
            </div>
            
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; margin-bottom: 1.5rem; overflow: hidden; position: relative;">
                <div style="width: ${progressPercent}%; height: 100%; background: var(--accent-cyan); transition: width 0.3s ease; box-shadow: var(--text-glow);"></div>
            </div>
            
            <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; color: var(--text-primary); font-weight: 800; line-height: 1.5; margin: 0 0 1rem 0;">
                Question ${currentQuizIndex + 1} of ${quizQuestions.length}:<br>
                <span style="font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; color: var(--text-secondary);">${q.q}</span>
            </h4>
            
            ${figureHtml}
            
            <div id="quiz-options-wrapper" style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
                ${optionsHtml}
            </div>
            
            <div id="quiz-action-area" style="margin-top: 1.5rem; display: flex; justify-content: space-between; min-height: 40px; align-items: center;">
                <div>${backBtnHtml}</div>
                <div>${actionBtnHtml}</div>
            </div>
        </div>
    `;
}

function selectQuizOption(selectedBtn, selectedIdx) {
    // Record selection
    selectedAnswers[currentQuizIndex] = selectedIdx;
    
    // Clear selection highlights from all buttons
    const optionButtons = document.querySelectorAll('.quiz-option-btn');
    optionButtons.forEach(btn => {
        btn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        btn.style.background = '#060913';
        btn.style.color = 'var(--text-primary)';
    });
    
    // Highlight the newly selected option
    selectedBtn.style.borderColor = 'var(--accent-cyan)';
    selectedBtn.style.background = 'rgba(0, 210, 255, 0.05)';
    selectedBtn.style.color = 'var(--accent-cyan)';
}

function navigatePrevQuestion() {
    if (currentQuizIndex > 0) {
        currentQuizIndex--;
        renderQuizQuestion();
    }
}

function navigateNextQuestion() {
    // Verify that student selected an option before navigating next
    if (selectedAnswers[currentQuizIndex] === undefined) {
        alert("Please select an answer before proceeding.");
        return;
    }
    
    const isLast = currentQuizIndex === quizQuestions.length - 1;
    if (isLast) {
        // Calculate the score when exam is finished
        calculateMcqQuizScore();
        finishQuiz();
    } else {
        currentQuizIndex++;
        renderQuizQuestion();
    }
}

function calculateMcqQuizScore() {
    quizScore = 0;
    quizQuestions.forEach((q, idx) => {
        const selectedIdx = selectedAnswers[idx];
        if (selectedIdx !== undefined) {
            const selectedText = q.options[selectedIdx];
            if (selectedText.trim().toLowerCase() === q.ans.trim().toLowerCase()) {
                quizScore++;
            }
        }
    });
}

function finishQuiz() {
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    removeProctoring();
    
    const elapsedMs = Date.now() - quizStartTime;
    const elapsedMins = Math.floor(elapsedMs / 60000);
    const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);
    const timeSpentStr = `${elapsedMins.toString().padStart(2, '0')}:${elapsedSecs.toString().padStart(2, '0')}`;
    
    const submission = {
        ...currentTeamDetails,
        score: quizScore,
        timeSpent: timeSpentStr,
        submittedAt: new Date().toISOString()
    };
    
    saveQuizResultToSupabase(submission);
    
    const scorePercent = Math.round((quizScore / quizQuestions.length) * 100);
    
    let badge = 'Novice';
    if (scorePercent >= 90) badge = '🏆 Elite ECE Genius';
    else if (scorePercent >= 75) badge = '🌟 Expert Circuits Engineer';
    else if (scorePercent >= 50) badge = '⚡ Competent Practitioner';
    
    portalContent.innerHTML = `
        <div class="quiz-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%; padding: 2rem 1rem;">
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">TECHNICAL MCQ Complete!</h3>
            <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 1.25rem;">Thank you for participating in the ECE MCQ challenge.</p>
            
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;" id="submit-status">Submitting result to leaderboard...</div>
            
            <div style="background: rgba(8, 12, 23, 0.6); border: 1px solid rgba(0, 210, 255, 0.15); border-radius: 12px; padding: 2rem; width: 100%; max-width: 320px; margin-bottom: 2rem;">
                <div style="font-family: 'Outfit', sans-serif; font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">Your Score</div>
                <div style="font-family: 'Outfit', sans-serif; font-size: 3.2rem; font-weight: 900; color: var(--accent-cyan); line-height: 1; margin-bottom: 0.5rem;">${quizScore} <span style="font-size: 1.5rem; font-weight: 500; color: var(--text-secondary);">/ ${quizQuestions.length}</span></div>
                <div style="font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 700; color: #4ade80; margin-bottom: 0.5rem;">Accuracy: ${scorePercent}%</div>
                <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Time Taken: ${timeSpentStr}</div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Achievement Rank</div>
                    <div style="font-family: 'Outfit', sans-serif; font-size: 1.05rem; font-weight: 800; color: var(--text-primary);">${badge}</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; width: 100%; max-width: 320px;">
                <button class="event-reg-link" style="width: 100%; padding: 0.75rem; margin: 0; border: none; background: var(--accent-cyan); color: var(--bg-dark) !important;" onclick="closeClubModal()">Finish & Exit</button>
            </div>
        </div>
    `;
    
    // Automatically close modal after 6 seconds
    setTimeout(() => {
        closeClubModal();
    }, 6000);
}

function saveQuizResultToSupabase(submission) {
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    
    const getUrl = `${url}/rest/v1/vsb_ece_state?key=eq.quiz_results`;
    
    fetch(getUrl, {
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    })
    .then(res => res.json())
    .then(data => {
        let resultsList = [];
        if (data && data.length > 0) {
            try {
                resultsList = JSON.parse(data[0].value) || [];
            } catch (e) {
                resultsList = data[0].value || [];
            }
        }
        
        resultsList.push(submission);
        
        const postUrl = `${url}/rest/v1/vsb_ece_state`;
        return fetch(postUrl, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                key: 'quiz_results',
                value: resultsList
            })
        });
    })
    .then(() => {
        console.log('Quiz result submitted successfully!');
        const statusEl = document.getElementById('submit-status');
        if (statusEl) {
            statusEl.innerText = '✓ Leaderboard updated successfully!';
            statusEl.style.color = '#4ade80';
        }
    })
    .catch(err => {
        console.error('Error saving quiz result:', err);
        const statusEl = document.getElementById('submit-status');
        if (statusEl) {
            statusEl.innerText = '⚠️ Leaderboard sync failed - recorded locally.';
            statusEl.style.color = '#f87171';
        }
    });
}

function showPublicQuizResults(year) {
    const selectedYear = year || 'Second Year';
    portalContent.innerHTML = `
        <div class="quiz-container" style="display: flex; flex-direction: column; width: 100%; max-height: 480px; overflow-y: auto; padding-right: 0.5rem; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <button class="btn-admin-logout" style="width: fit-content; padding: 0.4rem 1.2rem; margin: 0;" onclick="openClubInterface('electronics')">← Back to Rounds</button>
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; color: var(--accent-cyan); margin: 0;">🏆 ${selectedYear} Leaderboard</h3>
            </div>
            
            <div class="table-container" style="overflow-x: auto; background: rgba(8, 12, 23, 0.6); border: 1px solid rgba(0, 210, 255, 0.15); border-radius: 12px; padding: 1rem;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); color: var(--accent-cyan); font-family: 'Outfit', sans-serif;">
                            <th style="padding: 0.75rem;">Rank</th>
                            <th style="padding: 0.75rem;">Student Name</th>
                            <th style="padding: 0.75rem;">Register Number</th>
                            <th style="padding: 0.75rem;">Dept / Sec</th>
                            <th style="padding: 0.75rem;">Score</th>
                            <th style="padding: 0.75rem;">Time Taken</th>
                        </tr>
                    </thead>
                    <tbody id="public-quiz-tbody">
                        <tr>
                            <td colspan="6" style="padding: 2rem; text-align: center; color: var(--accent-cyan);">Loading submissions leaderboard...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    const getUrl = `${url}/rest/v1/vsb_ece_state?key=eq.quiz_results`;
    
    const tbody = document.getElementById('public-quiz-tbody');
    
    fetch(getUrl, {
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    })
    .then(res => res.json())
    .then(data => {
        let resultsList = [];
        if (data && data.length > 0) {
            try {
                resultsList = JSON.parse(data[0].value) || [];
            } catch (e) {
                resultsList = data[0].value || [];
            }
        }
        
        if (!tbody) return;
        
        // Filter by selected year
        const filteredResults = resultsList.filter(res => {
            if (!res || !res.year) return false;
            return res.year.toLowerCase().trim() === selectedYear.toLowerCase().trim();
        });
        
        if (filteredResults.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-secondary);">No quiz results recorded for ${selectedYear} yet.</td></tr>`;
            return;
        }
        
        // Sort results: Score descending, Time Taken ascending
        filteredResults.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            const parseTime = str => {
                if (!str) return 9999;
                const parts = str.split(':');
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            };
            return parseTime(a.timeSpent) - parseTime(b.timeSpent);
        });
        
        let html = '';
        filteredResults.forEach((res, rank) => {
            const studentName = res.studentName || res.teamName || 'N/A';
            const regnum = res.regnum || res.student1 || 'N/A';
            const dept = res.dept || 'N/A';
            const sec = res.section || 'N/A';
            const maxQ = res.year === 'Third Year' ? 45 : 50;
            
            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.75rem; font-weight: bold; color: ${rank === 0 ? '#ffd700' : rank === 1 ? '#c0c0c0' : rank === 2 ? '#cd7f32' : 'var(--text-secondary)'};">#${rank + 1}</td>
                    <td style="padding: 0.75rem; font-weight: bold; color: var(--accent-cyan);">${studentName}</td>
                    <td style="padding: 0.75rem; font-family: monospace;">${regnum}</td>
                    <td style="padding: 0.75rem;">${dept} (Sec: ${sec})</td>
                    <td style="padding: 0.75rem; font-weight: bold; color: #4ade80;">${res.score} / ${maxQ}</td>
                    <td style="padding: 0.75rem; font-family: monospace;">${res.timeSpent || 'N/A'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    })
    .catch(err => {
        console.error('Error loading public leaderboard:', err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: #f87171;">Error loading leaderboard.</td></tr>`;
        }
    });
}


