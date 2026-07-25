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
                roundsHtml += `<button onclick="startRound1Quiz(${idx})" class="event-reg-link" style="width: 100%; text-align: center; margin: 0; background: var(--accent-cyan); border: none; color: var(--bg-dark) !important;">${round.title}</button>`;
            } else if (round.type === 'link') {
                roundsHtml += `<a href="${round.url}" target="_blank" class="event-reg-link" style="width: 100%; text-align: center; margin: 0;">${round.title}</a>`;
            } else {
                roundsHtml += `<button onclick="showRoundChallenge(${idx})" class="event-reg-link" style="width: 100%; text-align: center; margin: 0; background: var(--accent-cyan); border: none; color: var(--bg-dark) !important;">${round.title}</button>`;
            }
        });

        // Add public Leaderboard button below the rounds list
        roundsHtml += `
            <button onclick="showPublicQuizResults()" class="event-reg-link" style="width: 100%; text-align: center; margin: 1.5rem 0 0 0; background: transparent; border: 1px solid var(--accent-cyan); color: var(--accent-cyan) !important;">🏆 View Round 1 Leaderboard</button>
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
    // 1. Scroll-to-Hide Header & Sub-navigation Menu
    const header = document.querySelector('header');
    const subNav = document.querySelector('.sub-nav');
    
    if (header && subNav) {
        if (window.scrollY > lastScrollY && window.scrollY > 180) {
            // Scrolling down: translate headers off-screen
            header.classList.add('header-hidden');
            subNav.classList.add('header-hidden');
        } else {
            // Scrolling up: slide headers back in
            header.classList.remove('header-hidden');
            subNav.classList.remove('header-hidden');
        }
    }
    lastScrollY = window.scrollY;

    // 2. Active Tab Link highlight
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
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

    loginBtn.textContent = 'Admin Mode Active';
    loginBtn.disabled = true;

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

    // Append to container
    document.getElementById('posters-carousel-container').appendChild(newCard);

    // Switch focus to the new card
    activeCard.classList.remove('active');
    newCard.classList.add('active');

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
    }
}


// === 9. HOD & Student Coordinator Real Photo Uploads ===
function triggerHodUpload() {
    document.getElementById('admin-hod-upload').click();
}

function handleHodPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

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
        document.getElementById('posters-carousel-container').innerHTML = state.postersHtml;
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
const quizQuestions = [
  {
    id: 1,
    q: "Of the four biasing circuits shown in figure, for a BJT, indicate the one which can have maximum bias stability",
    hasImg: true,
    img: "assets/quiz/q1.png",
    options: ["Fig A", "Fig B", "Fig C", "Fig D"],
    ans: "Fig A"
  },
  {
    id: 2,
    q: "Determine Vo in the circuit below.",
    hasImg: true,
    img: "assets/quiz/q2.png",
    options: ["24V", "1v", "12V", "2V"],
    ans: "12V"
  },
  {
    id: 3,
    q: "What is the voltage on capacitor C2 when all three switches are turned on?",
    hasImg: true,
    img: "assets/quiz/q3.png",
    options: ["16V", "20V", "30V", "10V"],
    ans: "10v"
  },
  {
    id: 4,
    q: "A 10V reference is drawn from the circuit shown in the figure. Zener diode of 10V, 400mW and with firing current of 5mA is used. The values of Rs is",
    hasImg: true,
    img: "assets/quiz/q4.png",
    options: ["50 ohms", "100 ohm", "200 ohm", "0 ohms"],
    ans: "100 ohm"
  },
  {
    id: 5,
    q: "What is the equivalent resistance for the circuit shown below",
    hasImg: true,
    img: "assets/quiz/q5.png",
    options: ["Equal to 6", "Less than 6", "Greater than 6", "None of the above"],
    ans: "Less than 6"
  },
  {
    id: 6,
    q: "What is the Output when Input is OV or 3.3V?",
    hasImg: true,
    img: "assets/quiz/q6.png",
    options: ["3.3V, 0V", "3.3V,3.3V", "0V,3.3V", "Non deterministic, OV"],
    ans: "3.3V, 0V"
  },
  {
    id: 7,
    q: "What is the output voltage across the 900 ohm in the circuit given below",
    hasImg: true,
    img: "assets/quiz/q7.png",
    options: ["10V", "14.67V", "20 V", "9.47V"],
    ans: "10V"
  },
  {
    id: 8,
    q: "Determine the output Y",
    hasImg: true,
    img: "assets/quiz/q8.png",
    options: ["Y = AB", "Y = /(AB)", "Y=A+B", "Y = /(AB)+/(AB)"],
    ans: "Y = AB"
  },
  {
    id: 9,
    q: "Two signals A & B are given at the same time to the circuit below whose propagation delays are mentioned in the figure. When will the output be available?",
    hasImg: true,
    img: "assets/quiz/q9.png",
    options: ["20 ns", "25 ns", "30 ns", "35 ns"],
    ans: "30 ns"
  },
  {
    id: 10,
    q: "For the RC circuit shown below, how would Vo waveform look like?",
    hasImg: true,
    img: "assets/quiz/q10.png",
    options: ["Fig A", "Fig B", "Fig C", "Fig D"],
    ans: "Fig D"
  },
  {
    id: 11,
    q: "If the inputs 1 & 2 are given to a digital logic EX-OR gate, what will be the appropriate output wave shape?",
    hasImg: true,
    img: "assets/quiz/q11.png",
    options: ["W1", "W2", "W3", "W4"],
    ans: "W4"
  },
  {
    id: 12,
    q: "What is the output pk-pk voltage in below circuit with Si diodes?",
    hasImg: true,
    img: "assets/quiz/q12.png",
    options: ["7.4V", "6.7V", "11.7V", "6.4V"],
    ans: "6.7V"
  },
  {
    id: 13,
    q: "If Y is \"1\", then, it implies that Data input D has",
    hasImg: true,
    img: "assets/quiz/q13.png",
    options: [
      "Changed from \"0\" to \"1\"",
      "Changed from \"1\" to \"0\"",
      "Not changed",
      "Changed its state either from \"0\" to \"1\" or \"1\" to \"0\""
    ],
    ans: "Changed its state either from \"0\" to \"1\" or \"1\" to \"0\""
  },
  {
    id: 14,
    q: "Calculate the rise time of this wave shape",
    hasImg: true,
    img: "assets/quiz/q14.png",
    options: ["30", "10", "8", "20"],
    ans: "10"
  },
  {
    id: 15,
    q: "Find the voltage across 9 ohm resistor",
    hasImg: true,
    img: "assets/quiz/q15.png",
    options: ["9 V", "5 V", "3 V", "Circuit incomplete"],
    ans: "3 V"
  },
  {
    id: 16,
    q: "Calculate the output voltage Vo",
    hasImg: true,
    img: "assets/quiz/q16.png",
    options: ["0.2 V", "0.4 V", "0.6 V", "0.8 V"],
    ans: "0.6 V"
  },
  {
    id: 17,
    q: "Find the current through the 2 ohm resistor",
    hasImg: true,
    img: "assets/quiz/q17.png",
    options: ["0.5 A", "4A", "6 A", "2A"],
    ans: "2A"
  },
  {
    id: 18,
    q: "A voltage regulator having vref = 1.25V needs to generate 5V output. Assume that ladj = 100uA and R1 = 10kohm. What should be the value of R2?",
    hasImg: true,
    img: "assets/quiz/q18.png",
    options: ["30kohm", "33.33kohm", "16.66kohm", "10kohm"],
    ans: "30kohm"
  },
  {
    id: 19,
    q: "What will be the output of Not gate if we give Sine wave (3V pp with 1.5V dc base)?",
    hasImg: false,
    options: [
      "Sine wave ranging from −Vcc/2 to +Vcc/2",
      "Square wave ranging from −Vcc/2 to +Vcc/2",
      "Sine wave ranging from 0V to +Vcc",
      "Square wave ranging from 0V to +Vcc"
    ],
    ans: "Square wave ranging from 0V to +Vcc"
  },
  {
    id: 20,
    q: "An ideal current meter & volt meter should have",
    hasImg: false,
    options: [
      "infinite resistance & Zero resistance",
      "Finite resistance & Infinite resistance",
      "Infinite resistance & Finite resistance",
      "Zero resistance & Infinite resistance"
    ],
    ans: "Zero resistance & Infinite resistance"
  },
  {
    id: 21,
    q: "When an AC current of 5A and DC current of 5A flow simultaneously through a circuit then which of the following statement is true?",
    hasImg: false,
    options: [
      "An AC ammeter will read less than 10A but more than 5A",
      "An AC ammeter will read only 5A",
      "A DC ammeter will read 10A",
      "A DC ammeter will read zero"
    ],
    ans: "An AC ammeter will read less than 10A but more than 5A"
  },
  {
    id: 22,
    q: "The frequency modulated (FM) radio frequency range is nearly",
    hasImg: false,
    options: ["90 – 105 MHz", "30 – 70 MHz", "250 – 300 MHz", "150 – 200 MHz"],
    ans: "90 – 105 MHz"
  },
  {
    id: 23,
    q: "An 8-bit SAR ADC has a full scale voltage of 2.5V. Its conversion time for an input of 0.5 volt is 20 μs. The conversion time for a 1.5 volts input is",
    hasImg: false,
    options: ["10 μs", "20 μs", "40 μs", "60 μs"],
    ans: "20 μs"
  },
  {
    id: 24,
    q: "A 6 bit representation of decimal value -7 is",
    hasImg: false,
    options: ["111", "101001", "11111", "111001"],
    ans: "111001"
  },
  {
    id: 25,
    q: "What is the lowest negative number you can express with 8 bits",
    hasImg: false,
    options: ["-8", "-64", "-128", "-256"],
    ans: "-128"
  }
];

let currentQuizIndex = 0;
let quizScore = 0;

let currentTeamDetails = null;
let quizTimerSeconds = 1200; // 20 minutes
let quizTimerInterval = null;
let quizStartTime = 0;

function startRound1Quiz(idx) {
    renderQuizRegistration();
}

function renderQuizRegistration() {
    portalContent.innerHTML = `
        <div class="quiz-registration-container" style="display: flex; flex-direction: column; width: 100%; max-width: 580px; margin: 0 auto; gap: 1.25rem; font-family: 'Plus Jakarta Sans', sans-serif;">
            <button class="btn-admin-logout" style="width: fit-content; padding: 0.4rem 1.2rem; margin: 0;" onclick="openClubInterface('electronics')">← Back to Rounds</button>
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; color: var(--accent-cyan); text-align: center; margin-bottom: 0.25rem;">Round 1 - Team Registration</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; margin-bottom: 0.5rem; line-height: 1.5;">Please enter team details to start the 20-minute Core Technical Quiz.</p>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">TEAM NAME *</label>
                    <input type="text" id="reg-team-name" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem; color: #fff; font-size: 0.9rem;" required placeholder="e.g. Innovators ECE">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">STUDENT NAME 1 *</label>
                        <input type="text" id="reg-student-1" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem; color: #fff; font-size: 0.9rem;" required placeholder="First Participant">
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">STUDENT NAME 2 *</label>
                        <input type="text" id="reg-student-2" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem; color: #fff; font-size: 0.9rem;" required placeholder="Second Participant">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">DEPARTMENT *</label>
                        <input type="text" id="reg-dept" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem; color: #fff; font-size: 0.9rem;" required placeholder="e.g. ECE">
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">YEAR *</label>
                        <select id="reg-year" class="form-control" style="background: #090e1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem; color: #fff; font-size: 0.9rem; height: 41px;" required>
                            <option value="" disabled selected>Select Year</option>
                            <option value="I">I Year</option>
                            <option value="II">II Year</option>
                            <option value="III">III Year</option>
                            <option value="IV">IV Year</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">REGISTER NUMBER *</label>
                        <input type="text" id="reg-regnum" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem; color: #fff; font-size: 0.9rem;" required placeholder="First Participant Reg No">
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; letter-spacing: 0.5px;">MAIL *</label>
                        <input type="email" id="reg-mail" class="form-control" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem; color: #fff; font-size: 0.9rem;" required placeholder="e.g. student@vsbec.edu.in">
                    </div>
                </div>
            </div>
            
            <button class="event-reg-link" onclick="validateAndStartQuiz()" style="width: 100%; margin-top: 1rem; border: none; padding: 0.85rem; background: var(--accent-cyan); color: var(--bg-dark) !important; cursor: pointer; border-radius: 50px; font-weight: bold; letter-spacing: 1px;">START CHALLENGE</button>
        </div>
    `;
}

function validateAndStartQuiz() {
    const teamName = document.getElementById('reg-team-name')?.value.trim();
    const student1 = document.getElementById('reg-student-1')?.value.trim();
    const student2 = document.getElementById('reg-student-2')?.value.trim();
    const dept = document.getElementById('reg-dept')?.value.trim();
    const year = document.getElementById('reg-year')?.value.trim();
    const regnum = document.getElementById('reg-regnum')?.value.trim();
    const mail = document.getElementById('reg-mail')?.value.trim();
    
    if (!teamName || !student1 || !student2 || !dept || !year || !regnum || !mail) {
        alert('Please fill out all required fields marked with *');
        return;
    }
    
    currentTeamDetails = {
        teamName,
        student1,
        student2,
        dept,
        year,
        regnum,
        mail
    };
    
    currentQuizIndex = 0;
    quizScore = 0;
    quizTimerSeconds = 1200; // 20 minutes
    quizStartTime = Date.now();
    
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    quizTimerInterval = setInterval(updateQuizTimer, 1000);
    
    renderQuizQuestion();
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
    
    let optionsHtml = '';
    q.options.forEach((opt, oIdx) => {
        optionsHtml += `
            <button class="quiz-option-btn" onclick="selectQuizOption(this, ${oIdx})" style="width: 100%; text-align: left; padding: 1rem; background: #060913; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: var(--text-primary); cursor: pointer; transition: all 0.3s ease; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between;">
                <span>${opt}</span>
                <span class="option-feedback" style="display: none; font-weight: bold;"></span>
            </button>
        `;
    });
    
    const mins = Math.floor(quizTimerSeconds / 60);
    const secs = quizTimerSeconds % 60;
    
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
            
            <div id="quiz-action-area" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; min-height: 40px;">
            </div>
        </div>
    `;
}

function selectQuizOption(selectedBtn, selectedIdx) {
    const q = quizQuestions[currentQuizIndex];
    const optionButtons = document.querySelectorAll('.quiz-option-btn');
    const actionArea = document.getElementById('quiz-action-area');
    
    optionButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });
    
    selectedBtn.style.borderColor = 'var(--accent-cyan)';
    selectedBtn.style.background = 'rgba(0, 210, 255, 0.05)';
    selectedBtn.style.color = 'var(--accent-cyan)';
    
    const selectedText = q.options[selectedIdx];
    const isCorrect = selectedText.trim().toLowerCase() === q.ans.trim().toLowerCase();
    
    if (isCorrect) {
        quizScore++;
    }
    
    const isLast = currentQuizIndex === quizQuestions.length - 1;
    const btnText = isLast ? 'Finish Quiz' : 'Next Question';
    const nextFn = isLast ? 'finishQuiz()' : 'goToNextQuestion()';
    
    actionArea.innerHTML = `
        <button class="event-reg-link" onclick="${nextFn}" style="margin: 0; padding: 0.6rem 2rem; background: var(--accent-cyan); border: none; color: var(--bg-dark) !important;">
            ${btnText}
        </button>
    `;
}

function goToNextQuestion() {
    currentQuizIndex++;
    renderQuizQuestion();
}

function finishQuiz() {
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    
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
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">Round 1 Complete!</h3>
            <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 1.25rem;">Thank you for participating in the Electronics Club challenge.</p>
            
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
                <button class="event-reg-link" style="width: 100%; padding: 0.75rem; margin: 0; border: none; background: var(--accent-cyan); color: var(--bg-dark) !important;" onclick="openClubInterface('electronics')">Back to Rounds</button>
            </div>
        </div>
    `;
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

function showPublicQuizResults() {
    portalContent.innerHTML = `
        <div class="quiz-container" style="display: flex; flex-direction: column; width: 100%; max-height: 480px; overflow-y: auto; padding-right: 0.5rem; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <button class="btn-admin-logout" style="width: fit-content; padding: 0.4rem 1.2rem; margin: 0;" onclick="openClubInterface('electronics')">← Back to Rounds</button>
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; color: var(--accent-cyan); margin: 0;">🏆 Round 1 Leaderboard</h3>
            </div>
            
            <div class="table-container" style="overflow-x: auto; background: rgba(8, 12, 23, 0.6); border: 1px solid rgba(0, 210, 255, 0.15); border-radius: 12px; padding: 1rem;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); color: var(--accent-cyan); font-family: 'Outfit', sans-serif;">
                            <th style="padding: 0.75rem;">Rank</th>
                            <th style="padding: 0.75rem;">Team Name</th>
                            <th style="padding: 0.75rem;">Students</th>
                            <th style="padding: 0.75rem;">Dept / Year</th>
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
        
        if (resultsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-secondary);">No quiz results recorded yet.</td></tr>`;
            return;
        }
        
        // Sort results: Score descending, Time Taken ascending
        resultsList.sort((a, b) => {
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
        resultsList.forEach((res, rank) => {
            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.75rem; font-weight: bold; color: ${rank === 0 ? '#ffd700' : rank === 1 ? '#c0c0c0' : rank === 2 ? '#cd7f32' : 'var(--text-secondary)'};">#${rank + 1}</td>
                    <td style="padding: 0.75rem; font-weight: bold; color: var(--accent-cyan);">${res.teamName || 'N/A'}</td>
                    <td style="padding: 0.75rem; font-size: 0.85rem;">${res.student1 || 'N/A'}<br>${res.student2 || 'N/A'}</td>
                    <td style="padding: 0.75rem; font-size: 0.85rem;">${res.dept || 'N/A'} / ${res.year || 'N/A'} Yr</td>
                    <td style="padding: 0.75rem; font-weight: bold; color: #4ade80;">${res.score} / 25</td>
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
