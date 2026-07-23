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

// Save web updates globally back to index.html on disk
function saveWebChanges() {
    const isAdmin = localStorage.getItem('vsb_ece_is_admin') === 'true';

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

    // Restore admin mode UI state immediately
    if (isAdmin) {
        enableAdminMode();
    }

    // 3. Make HTTP POST request to Python Local Server
    fetch('/save-html', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html: cleanHtml })
    })
    .then(res => {
        if (res.ok) {
            alert('Website changes saved globally to disk successfully! Auto-sync to GitHub will happen in 5 minutes.');
        } else {
            throw new Error('Server returned non-200 status');
        }
    })
    .catch(err => {
        console.warn('Save server is offline, saving to LocalStorage only:', err);
        // Fallback to localStorage edits
        const edits = {};
        editableElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                edits[id] = el.innerHTML;
            }
        });
        localStorage.setItem('vsb_ece_web_edits', JSON.stringify(edits));
        alert('Changes saved to browser local storage. Start the Python backend server for global file synchronization!');
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


// === 12. Initializer Loader ===
function loadAllWebData() {
    // Auto log in if admin state persists
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
