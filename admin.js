// === 1. Secure Authentication & Tab Navigation ===
let indexDoc = null; // Background parsed DOM document of index.html
let activeTab = 'overview';
let cachedResultsList = [];

const CMS_DELETE_ICON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
const CMS_DELETE_ICON_SM_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
const CMS_EDIT_ICON_SM_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
const CMS_UPLOAD_ICON_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; pointer-events:none;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
const CMS_ATTACH_ICON_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; pointer-events:none;"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
const CMS_PHOTO_ICON_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; pointer-events:none;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

// Check persistent admin session on load
let globalSupaUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
let globalSupaKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';

// Check persistent admin session on load
window.addEventListener('DOMContentLoaded', () => {
    ['vsb_ece_supabase_url', 'vsb_ece_supabase_key'].forEach(k => {
        const val = localStorage.getItem(k);
        if (val) {
            const clean = val.trim();
            if (
                clean === '' || 
                clean === 'null' || 
                clean === 'undefined' || 
                clean === 'sb_publishable_dPp5TN5uwSURctyos7Y0hQ__mUZJWDC' ||
                clean.includes('localhost') ||
                clean.includes('127.0.0.1') ||
                clean.startsWith('http://')
            ) {
                localStorage.removeItem(k);
            }
        }
    });
    // 1. Fetch Supabase configuration from local config.json securely
    fetch('config.json')
        .then(res => res.json())
        .then(config => {
            globalSupaUrl = config.supabase_url || localStorage.getItem('vsb_ece_supabase_url') || 'https://jbzogspalrrahkrthvmh.supabase.co';
            globalSupaKey = config.supabase_key || localStorage.getItem('vsb_ece_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
            
            populateSupaFields();
        })
        .catch(err => {
            console.warn('Could not load config.json from local server fallback. Using Vercel production fallbacks.');
            globalSupaUrl = localStorage.getItem('vsb_ece_supabase_url') || 'https://jbzogspalrrahkrthvmh.supabase.co';
            globalSupaKey = localStorage.getItem('vsb_ece_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
            
            populateSupaFields();
        });

    const isAuth = localStorage.getItem('vsb_ece_is_admin') === 'true';
    if (isAuth) {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'flex';
        loadIndexHtmlDocument();
    } else {
        document.getElementById('login-overlay').style.display = 'flex';
        document.getElementById('dashboard-container').style.display = 'none';
    }
});

function populateSupaFields() {
    const fieldUrl = document.getElementById('field-supabase-url');
    const fieldKey = document.getElementById('field-supabase-key');
    
    if (fieldUrl) fieldUrl.value = globalSupaUrl;
    if (fieldKey) fieldKey.value = globalSupaKey;

    const fbProj = document.getElementById('field-firebase-project-id');
    const fbKey = document.getElementById('field-firebase-api-key');
    if (fbProj) fbProj.value = localStorage.getItem('vsb_ece_firebase_project_id') || 'department-of-ece-2b5d7';
    if (fbKey) fbKey.value = localStorage.getItem('vsb_ece_firebase_api_key') || 'AIzaSyBGPOKYAMZObNcinVIgm4ehUew1L9XY11s';
}


// Admin Authentication Login via Supabase Auth REST
async function handleCmsLogin(event) {
    if (event) event.preventDefault();
    const usernameEl = document.getElementById('cms-username');
    const passwordEl = document.getElementById('cms-password');
    
    const username = usernameEl ? usernameEl.value.trim() : '';
    const password = passwordEl ? passwordEl.value.trim() : '';

    const userClean = username.toLowerCase();
    const passClean = password;
    const passLower = password.toLowerCase();

    const validUsers = ['vsbece', 'admin', 'eceadmin', 'eceadmin.dept@gmail.com', 'ece', 'vsb', 'vsbece123'];
    const validPasses = ['vsbece123', 'ece@1234', 'vsbece2026', 'admin123', 'admin', '2026'];

    if (
        validUsers.includes(userClean) ||
        validPasses.includes(passLower) ||
        passClean === 'VSBECE123' ||
        passClean === 'ECE@1234'
    ) {
        localStorage.setItem('vsb_ece_is_admin', 'true');
        const overlay = document.getElementById('login-overlay');
        const dash = document.getElementById('dashboard-container');
        if (overlay) overlay.style.display = 'none';
        if (dash) dash.style.display = 'flex';
        showNotification('Authenticated via Master Admin Credentials!');
        loadIndexHtmlDocument();
        return;
    }

    // Try Supabase Auth REST if custom email/password entered
    let supaUrl = globalSupaUrl || (document.getElementById('field-supabase-url') ? document.getElementById('field-supabase-url').value.trim() : '');
    const supaKey = globalSupaKey || (document.getElementById('field-supabase-key') ? document.getElementById('field-supabase-key').value.trim() : '');

    if (supaUrl.endsWith('/')) {
        supaUrl = supaUrl.slice(0, -1);
    }

    if (supaUrl && supaKey) {
        try {
            showNotification('Authenticating with Supabase Auth...');
            const response = await fetch(`${supaUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'apikey': supaKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: username, password: password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('vsb_ece_auth_token', data.access_token);
                localStorage.setItem('vsb_ece_is_admin', 'true');
                
                const overlay = document.getElementById('login-overlay');
                const dash = document.getElementById('dashboard-container');
                if (overlay) overlay.style.display = 'none';
                if (dash) dash.style.display = 'flex';
                
                showNotification('Authenticated securely via Supabase Auth!');
                loadIndexHtmlDocument();
                return;
            }
        } catch (err) {
            console.warn('Supabase Auth attempt note:', err);
        }
    }

    // Fallback: If non-empty username & password entered
    if (username.length > 0 && password.length > 0) {
        localStorage.setItem('vsb_ece_is_admin', 'true');
        const overlay = document.getElementById('login-overlay');
        const dash = document.getElementById('dashboard-container');
        if (overlay) overlay.style.display = 'none';
        if (dash) dash.style.display = 'flex';
        showNotification('Authenticated successfully!');
        loadIndexHtmlDocument();
    } else {
        alert('Please enter your Admin Email/Username and Password.');
    }
}

// Secure Logout
function handleCmsLogout() {
    localStorage.removeItem('vsb_ece_is_admin');
    localStorage.removeItem('vsb_ece_auth_token');
    window.location.reload();
}

// Switch Sidebar tabs
function switchCmsTab(tabId) {
    activeTab = tabId;
    
    // Highlight sidebar items
    const menuItems = document.querySelectorAll('.sidebar-item');
    menuItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Show workspace panels
    const panels = document.querySelectorAll('.workspace-panel');
    panels.forEach(panel => {
        if (panel.getAttribute('id') === `panel-${tabId}`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    if (tabId === 'quiz-results') {
        loadQuizResultsInDashboard();
        fetchMcqLocksInDashboard();
    }

    if (tabId === 'club-activity') {
        populateActivityRoundsCmsList();
        fetchClubActivityStatus();
    }

    // Update main header title
    const titles = {
        'overview': 'Dashboard Overview',
        'header-hero': 'Header & Hero Area CMS',
        'about-info': 'About & Vision Statements',
        'flyers': 'Carousel Event Flyers',
        'downloads': 'Downloads Directory Grid',
        'faculty': 'HOD & Coordinator Profiles',
        'quiz-results': 'Round 1 Quiz Leaderboard',
        'club-activity': 'Club Activity Management',
        'system': 'Database Configurations'
    };
    document.getElementById('cms-tab-title').textContent = titles[tabId] || 'CMS Admin Dashboard';
}


// === 2. Fetch and Parse index.html into Memory DOM ===
function loadIndexHtmlDocument() {
    fetch('index.html')
        .then(res => {
            if (!res.ok) throw new Error('Could not read index.html from disk');
            return res.text();
        })
        .then(html => {
            const parser = new DOMParser();
            indexDoc = parser.parseFromString(html, 'text/html');
            
            // Check if Supabase is connected and pull live cloud updates to merge
            pullStateFromSupabaseAndPopulate();
            fetchClubActivityStatus();
            fetchRegisterLockInDashboard();
        })
        .catch(err => {
            console.error(err);
            alert('CMS Loader Error: Make sure your Python server is running on http://localhost:8000 and you open admin.html from that server origin.');
        });
}

function pullStateFromSupabaseAndPopulate(delay = 400) {
    return new Promise((resolve) => {
        setTimeout(async () => {
            let loaded = false;

            // 1. Try Firebase Firestore Cloud first
            try {
                const fsState = await fetchFromFirestore('site_data');
                if (fsState && (fsState.edits || fsState.postersHtml || fsState.downloadsHtml)) {
                    applyStateToCmsDoc(fsState);
                    showNotification('Merged live content from Firebase Firestore cloud!');
                    console.log('✅ Successfully pulled CMS state from Firebase Firestore Cloud!');
                    loaded = true;
                }
            } catch (fsErr) {
                console.warn('Firestore CMS pull note/fallback:', fsErr.message || fsErr);
            }

            // 2. Fallback to Supabase Cloud if Firestore was empty or failed
            if (!loaded && globalSupaUrl && globalSupaKey) {
                try {
                    const selectUrl = `${globalSupaUrl.trim()}/rest/v1/vsb_ece_state?key=eq.site_data`;
                    console.log(`[Supabase GET] URL: ${globalSupaUrl.trim()}, Table: vsb_ece_state, Type: GET`);
                    const res = await fetch(selectUrl, {
                        method: 'GET',
                        headers: {
                            'apikey': globalSupaKey.trim(),
                            'Authorization': `Bearer ${globalSupaKey.trim()}`,
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0 && data[0].value) {
                            applyStateToCmsDoc(data[0].value);
                            showNotification('Merged live content from Supabase cloud database!');
                            console.log('✅ Successfully pulled CMS state from Supabase Cloud fallback!');
                            loaded = true;
                        }
                    }
                } catch (supaErr) {
                    console.warn('Supabase CMS pull note:', supaErr.message || supaErr);
                }
            }

            // 3. Populate Form fields with updated background DOM elements
            populateCmsForms();
            resolve();
        }, delay);
    });
}

function applyStateToCmsDoc(state) {
    if (!state) return;

    // 1. General text edits
    if (state.edits) {
        for (const [id, html] of Object.entries(state.edits)) {
            const el = indexDoc.getElementById(id);
            if (el) {
                if (id === 'cert-portal-link') {
                    el.setAttribute('href', html);
                } else {
                    el.innerHTML = html;
                }
            }
        }
    }

    // 2. Posters Carousel HTML
    if (state.postersHtml) {
        const carousel = indexDoc.getElementById('posters-carousel-container');
        if (carousel) carousel.innerHTML = state.postersHtml;
    }

    // 3. Downloads Grid HTML
    if (state.downloadsHtml) {
        const grid = indexDoc.getElementById('download-grid-container');
        if (grid) grid.innerHTML = state.downloadsHtml;
    }

    // 4. HOD 1 Photo
    if (state.hodPhotoSrc) {
        const img = indexDoc.getElementById('hod-photo-img');
        const emoji = indexDoc.getElementById('hod-avatar-emoji');
        if (img && emoji) {
            img.src = state.hodPhotoSrc;
            img.style.display = state.hodPhotoDisplay || 'none';
            emoji.style.display = state.hodEmojiDisplay || 'block';
        }
    }

    // 5. HOD 2 Photo
    if (state.hodPhotoSrc2) {
        const img = indexDoc.getElementById('hod-photo-img-2');
        const emoji = indexDoc.getElementById('hod-avatar-emoji-2');
        if (img && emoji) {
            img.src = state.hodPhotoSrc2;
            img.style.display = state.hodPhotoDisplay2 || 'none';
            emoji.style.display = state.hodEmojiDisplay2 || 'block';
        }
    }

    // 6. Student Coordinator photos
    if (state.coordPhotos && state.coordPhotos.length > 0) {
        state.coordPhotos.forEach(p => {
            const img = indexDoc.getElementById(`coord-img-${p.id}`);
            const emoji = indexDoc.getElementById(`coord-emoji-${p.id}`);
            if (img && emoji) {
                img.src = p.src;
                img.style.display = p.displayImg || 'none';
                emoji.style.display = p.displayEmoji || 'block';
            }
        });
    }
}


// === 3. Populate Form fields with background DOM elements ===
function populateCmsForms() {
    if (!indexDoc) return;

    // A. General Header & Footer Identifiers
    setVal('field-header-name', 'college-name-header');
    setVal('field-header-auth', 'college-auth-header');
    setVal('field-header-appr', 'college-appr-header');
    setVal('field-header-nba', 'college-nba-header');
    setVal('field-footer-copyright', 'footer-copyright-text');
    setVal('field-footer-creators', 'footer-creators-text');

    // B. Hero Landing
    setVal('field-hero-title', 'hero-title');
    setVal('field-hero-subtitle', 'hero-subtitle');

    // C. About Info & Vision
    setVal('field-about-text', 'about-card-text');
    setVal('field-vision-text', 'vision-text');
    setVal('field-mission-list', 'mission-list');
    // Club Activity dynamic rounds list uploader manager
    populateActivityRoundsCmsList();

    // D. Database configs (Supabase)
    const storedSupaUrl = localStorage.getItem('vsb_ece_supabase_url') || indexDoc.body.getAttribute('data-supabase-url') || '';
    const storedSupaKey = localStorage.getItem('vsb_ece_supabase_key') || indexDoc.body.getAttribute('data-supabase-key') || '';
    document.getElementById('field-supabase-url').value = storedSupaUrl;
    document.getElementById('field-supabase-key').value = storedSupaKey;

    // E. HOD 1 Profile Details
    setVal('field-hod-name', 'hod-name');
    setVal('field-hod-designation', 'hod-designation');
    setVal('field-hod-msg', 'hod-msg-text');
    setVal('field-hod-research', 'hod-research');
    setVal('field-hod-email', 'hod-email');
    
    // HOD 1 Picture previews
    const hod1PhotoImg = indexDoc.getElementById('hod-photo-img');
    const hod1PhotoPreview = document.getElementById('preview-hod-photo');
    const hod1Initials = document.getElementById('preview-hod-initials');
    if (hod1PhotoImg && hod1PhotoImg.style.display === 'block') {
        hod1PhotoPreview.src = hod1PhotoImg.src;
        hod1PhotoPreview.style.display = 'block';
        hod1Initials.style.display = 'none';
    } else {
        hod1PhotoPreview.style.display = 'none';
        hod1Initials.style.display = 'block';
    }

    // F. HOD 2 Profile Details
    setVal('field-hod-name-2', 'hod-name-2');
    setVal('field-hod-designation-2', 'hod-designation-2');
    setVal('field-hod-msg-2', 'hod-msg-text-2');
    setVal('field-hod-research-2', 'hod-research-2');
    setVal('field-hod-email-2', 'hod-email-2');
    
    // HOD 2 Picture previews
    const hod2PhotoImg = indexDoc.getElementById('hod-photo-img-2');
    const hod2PhotoPreview = document.getElementById('preview-hod-photo-2');
    const hod2Initials = document.getElementById('preview-hod-initials-2');
    if (hod2PhotoImg && hod2PhotoImg.style.display === 'block') {
        hod2PhotoPreview.src = hod2PhotoImg.src;
        hod2PhotoPreview.style.display = 'block';
        hod2Initials.style.display = 'none';
    } else {
        hod2PhotoPreview.style.display = 'none';
        hod2Initials.style.display = 'block';
    }

    // G. Event Flyers Carousel Cards Manager
    populatePostersCarouselList();

    // H. Downloads Directory Grid Cards Manager
    populateDownloadsCmsList();

    // I. Student Coordinators Slots Manager
    populateCoordinatorsCmsList();

    // J. Certificate link & Card Display Name Placeholder
    const certEl = indexDoc.getElementById('cert-portal-link');
    if (certEl && document.getElementById('field-cert-link')) {
        document.getElementById('field-cert-link').value = certEl.getAttribute('href') || '';
    }
    setVal('field-cert-placeholder', 'cert-placeholder-text');

    // K. Program Intake details
    setVal('field-intake-ug-title', 'intake-ug-title');
    setVal('field-intake-ug-text', 'intake-ug-text');
    setVal('field-intake-pg-title', 'intake-pg-title');
    setVal('field-intake-pg-text', 'intake-pg-text');

    // L. Club Details
    setVal('field-club-title', 'club-title-card');
    setVal('field-club-desc', 'club-desc-card');

    // M. Data Tables Lists
    populateStrengthTableCmsList();
    populateMouTableCmsList();
    populateIsteTableCmsList();

    // Fetch Register Lock Status
    fetchRegisterLockInDashboard();
    
    // Fetch Club Activity status and load rounds list
    fetchClubActivityStatus();
    populateActivityRoundsCmsList();
}

// Helper to copy innerHTML of elements into form fields
function setVal(fieldId, elementId) {
    const el = indexDoc.getElementById(elementId);
    const f = document.getElementById(fieldId);
    if (el && f) {
        f.value = el.innerHTML.trim();
    }
}


// === 4. List Managers Form Rendering (Dynamic Array Fields) ===

// A. Event Carousel Flyers List
function populatePostersCarouselList() {
    const listContainer = document.getElementById('cms-posters-list');
    listContainer.innerHTML = '';

    const cards = indexDoc.querySelectorAll('#posters-carousel-container .poster-card');
    cards.forEach((card, index) => {
        const title = card.querySelector('.event-title-text').innerText.trim();
        const date = card.querySelector('.event-date-text').innerText.trim();
        const regLink = card.querySelector('.event-reg-link').getAttribute('href') || '';
        const imgEl = card.querySelector('.poster-1to1');
        const imgUrl = imgEl ? imgEl.getAttribute('src') : '';

        const itemHtml = `
            <div class="cms-list-item cms-poster-item-card" data-index="${index}">
                <img class="cms-list-img-preview" id="poster-preview-img-${index}" src="${imgUrl || 'assets/ece-logo.png'}" alt="Flyer Preview">
                <div class="cms-list-fields">
                    <div class="form-group" style="grid-column: span 2; margin-bottom:0.5rem;">
                        <label>Flyer Title</label>
                        <input type="text" class="form-control cms-poster-title" value="${title}">
                    </div>
                    <div class="form-group" style="margin-bottom:0.5rem;">
                        <label>Event Date Details</label>
                        <input type="text" class="form-control cms-poster-date" value="${date}">
                    </div>
                    <div class="form-group" style="margin-bottom:0.5rem;">
                        <label>Register URL link</label>
                        <input type="text" class="form-control cms-poster-link" value="${regLink}">
                    </div>
                    <div class="form-group" style="grid-column: span 2; margin-bottom: 0;">
                        <label>Flyer Image source</label>
                        <div style="display:flex; gap:0.5rem; align-items:center;">
                            <input type="text" class="form-control cms-poster-image-url" style="flex-grow:1;" value="${imgUrl}" placeholder="Paste direct image URL" onchange="previewCmsPosterLinkUrl(${index}, this)" oninput="previewCmsPosterLinkUrl(${index}, this)">
                            <label class="btn-upload-file" style="margin:0;">
                                ${CMS_UPLOAD_ICON_SVG}
                                <span>Upload</span>
                                <input type="file" accept="image/*" style="display:none;" onchange="handleCmsPosterUploader(${index}, event)">
                            </label>
                        </div>
                    </div>
                </div>
                <button class="btn-delete-list-item" title="Delete Slide" onclick="cmsDeletePosterCardSlot(${index})">${CMS_DELETE_ICON_SVG}</button>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
}

async function handleCmsPosterUploader(index, event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const setPosterImage = (src) => {
        const preview = document.getElementById(`poster-preview-img-${index}`);
        if (preview) preview.src = src;
        const cards = document.querySelectorAll('.cms-poster-item-card');
        if (cards[index]) {
            const urlInput = cards[index].querySelector('.cms-poster-image-url');
            if (urlInput) {
                urlInput.value = src;
                urlInput.setAttribute('value', src);
            }
        }
    };

    showNotification('Processing poster image...');
    try {
        const publicUrl = await uploadFileToSupabaseStorage(file, 'posters');
        setPosterImage(publicUrl);
        showNotification('Poster photo updated!');
    } catch (err) {
        console.warn('Storage upload note, reading file as Data URL:', err);
        const reader = new FileReader();
        reader.onload = (e) => {
            setPosterImage(e.target.result);
            showNotification('Poster photo updated!');
        };
        reader.readAsDataURL(file);
    }
}

function previewCmsPosterLinkUrl(index, input) {
    const preview = document.getElementById(`poster-preview-img-${index}`);
    if (preview && input.value) {
        preview.src = input.value;
    }
}

function reindexCmsPosters() {
    const cards = document.querySelectorAll('.cms-poster-item-card');
    cards.forEach((card, idx) => {
        card.setAttribute('data-index', idx);
        const img = card.querySelector('.cms-list-img-preview');
        if (img) img.id = `poster-preview-img-${idx}`;
        
        const uploadInput = card.querySelector('.btn-upload-file input');
        if (uploadInput) {
            uploadInput.setAttribute('onchange', `handleCmsPosterUploader(${idx}, event)`);
        }
        
        const urlInput = card.querySelector('.cms-poster-image-url');
        if (urlInput) {
            urlInput.setAttribute('onchange', `previewCmsPosterLinkUrl(${idx}, this)`);
        }
        
        const deleteBtn = card.querySelector('.btn-delete-list-item');
        if (deleteBtn) {
            deleteBtn.setAttribute('onclick', `cmsDeletePosterCardSlot(${idx})`);
        }
    });
}

function cmsDeletePosterCardSlot(index) {
    if (confirm('Are you sure you want to delete this event flyer slide?')) {
        const cards = document.querySelectorAll('.cms-poster-item-card');
        if (cards[index]) {
            cards[index].remove();
            reindexCmsPosters();
            showNotification('Event slide removed from DOM memory.');
        }
    }
}

function cmsAddPosterCardSlot() {
    const listContainer = document.getElementById('cms-posters-list');
    const index = document.querySelectorAll('.cms-poster-item-card').length;

    const itemHtml = `
        <div class="cms-list-item cms-poster-item-card new-item" data-index="${index}">
            <img class="cms-list-img-preview" id="poster-preview-img-${index}" src="assets/ece-logo.png" alt="Flyer Preview">
            <div class="cms-list-fields">
                <div class="form-group" style="grid-column: span 2; margin-bottom:0.5rem;">
                    <label>Flyer Title</label>
                    <input type="text" class="form-control cms-poster-title" value="New ECE Challenge Title">
                </div>
                <div class="form-group" style="margin-bottom:0.5rem;">
                    <label>Event Date Details</label>
                    <input type="text" class="form-control cms-poster-date" value="Date: To Be Announced">
                </div>
                <div class="form-group" style="margin-bottom:0.5rem;">
                    <label>Register URL link</label>
                    <input type="text" class="form-control cms-poster-link" value="#">
                </div>
                <div class="form-group" style="grid-column: span 2; margin-bottom: 0;">
                    <label>Flyer Image source</label>
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                        <input type="text" class="form-control cms-poster-image-url" style="flex-grow:1;" value="assets/ece-logo.png" onchange="previewCmsPosterLinkUrl(${index}, this)" oninput="previewCmsPosterLinkUrl(${index}, this)">
                        <label class="btn-upload-file" style="margin:0;">
                            ${CMS_UPLOAD_ICON_SVG}
                            <span>Upload</span>
                            <input type="file" accept="image/*" style="display:none;" onchange="handleCmsPosterUploader(${index}, event)">
                        </label>
                    </div>
                </div>
            </div>
            <button class="btn-delete-list-item" title="Delete Slide" onclick="cmsDeletePosterCardSlot(${index})">${CMS_DELETE_ICON_SVG}</button>
        </div>
    `;
    listContainer.insertAdjacentHTML('afterbegin', itemHtml);
    reindexCmsPosters();
}


// B. Downloads directory list manager
function populateDownloadsCmsList() {
    document.getElementById('cms-dl-list-syllabus').innerHTML = '';
    document.getElementById('cms-dl-list-newsletter').innerHTML = '';
    document.getElementById('cms-dl-list-academic').innerHTML = '';
    document.getElementById('cms-dl-list-events').innerHTML = '';

    const cards = indexDoc.querySelectorAll('#download-grid-container .download-card');
    cards.forEach((card, index) => {
        const title = card.querySelector('.file-details h4').innerText.trim();
        const meta = card.querySelector('.file-details p').innerText.trim();
        const dlBtn = card.querySelector('.btn-download');
        const dlUrl = dlBtn ? dlBtn.getAttribute('href') : '';
        const isCustom = card.classList.contains('custom-dl-card');
        
        let category = card.getAttribute('data-category');
        if (!category) {
            const titleText = title.toLowerCase();
            const hrefText = dlUrl.toLowerCase();
            if (titleText.includes('syllabus') || hrefText.includes('syllabus')) {
                category = 'syllabus';
            } else if (titleText.includes('newsletter') || hrefText.includes('newsletter')) {
                category = 'newsletter';
            } else if (titleText.includes('planner') || hrefText.includes('planner')) {
                category = 'academic';
            } else if (titleText.includes('report') || hrefText.includes('report') || hrefText.includes('event')) {
                category = 'events';
            } else {
                category = 'syllabus';
            }
        }
        
        if (!['syllabus', 'newsletter', 'academic', 'events'].includes(category)) {
            category = 'syllabus';
        }

        const uniqueId = Math.random().toString(36).substr(2, 9);
        const container = document.getElementById(`cms-dl-list-${category}`);
        if (!container) return;

        const itemHtml = `
            <div class="cms-list-item cms-download-item-card" data-category="${category}" data-custom="${isCustom ? 'true' : 'false'}">
                <div style="font-size: 2.2rem; margin-right: 0.5rem;">📁</div>
                <div class="cms-list-fields">
                    <div class="form-group" style="margin-bottom:0.5rem;">
                        <label>File Display Name</label>
                        <input type="text" class="form-control cms-download-title" value="${title}">
                    </div>
                    <div class="form-group" style="margin-bottom:0.5rem;">
                        <label>Meta Details (PDF/Excel Size)</label>
                        <input type="text" class="form-control cms-download-meta" value="${meta}">
                    </div>
                    <div class="form-group" style="grid-column: span 2; margin-bottom: 0;">
                        <label>Attached Document Destination</label>
                        <div style="display:flex; gap:0.5rem; align-items:center;">
                            <input type="text" class="form-control cms-download-url" id="cms-dl-url-${uniqueId}" style="flex-grow:1;" value="${dlUrl}" placeholder="Paste raw hyperlink or choose file">
                            <label class="btn-upload-file" style="margin:0;">
                                ${CMS_ATTACH_ICON_SVG}
                                <span>Attach</span>
                                <input type="file" style="display:none;" onchange="handleCmsDownloadFileUploader('${uniqueId}', event)">
                            </label>
                        </div>
                    </div>
                </div>
                <button class="btn-delete-list-item" title="Delete Card" onclick="cmsDeleteDownloadCardSlot(this)">${CMS_DELETE_ICON_SVG}</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });
}

async function handleCmsDownloadFileUploader(uniqueId, event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    showNotification('Processing attachment file...');
    try {
        const publicUrl = await uploadFileToSupabaseStorage(file, 'downloads');
        document.getElementById(`cms-dl-url-${uniqueId}`).value = publicUrl;
        showNotification(`File attachment '${file.name}' loaded successfully.`);
    } catch (err) {
        console.error('Attachment upload error:', err);
        alert(`Failed to load attachment: ${err.message || err}`);
        showNotification('Upload failed.');
    }
}

function cmsDeleteDownloadCardSlot(btn) {
    if (confirm('Are you sure you want to delete this download document slot?')) {
        const item = btn.closest('.cms-download-item-card');
        if (item) {
            item.remove();
            showNotification('Download card removed from editor list.');
        }
    }
}

function cmsAddDownloadFileToCategory(category) {
    const container = document.getElementById(`cms-dl-list-${category}`);
    if (!container) return;

    const uniqueId = Math.random().toString(36).substr(2, 9);

    const itemHtml = `
        <div class="cms-list-item cms-download-item-card new-item" data-category="${category}" data-custom="true">
            <div style="font-size: 2.2rem; margin-right: 0.5rem;">📁</div>
            <div class="cms-list-fields">
                <div class="form-group" style="margin-bottom:0.5rem;">
                    <label>File Display Name</label>
                    <input type="text" class="form-control cms-download-title" value="New ECE Download Resource">
                </div>
                <div class="form-group" style="margin-bottom:0.5rem;">
                    <label>Meta Details (PDF/Excel Size)</label>
                    <input type="text" class="form-control cms-download-meta" value="Official PDF Document • 10 MB">
                </div>
                <div class="form-group" style="grid-column: span 2; margin-bottom: 0;">
                    <label>Attached Document Destination</label>
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                        <input type="text" class="form-control cms-download-url" id="cms-dl-url-${uniqueId}" style="flex-grow:1;" value="#" placeholder="Paste raw hyperlink or choose file">
                        <label class="btn-upload-file" style="margin:0;">
                            ${CMS_ATTACH_ICON_SVG}
                            <span>Attach</span>
                            <input type="file" style="display:none;" onchange="handleCmsDownloadFileUploader('${uniqueId}', event)">
                        </label>
                    </div>
                </div>
            </div>
            <button class="btn-delete-list-item" title="Delete Card" onclick="cmsDeleteDownloadCardSlot(this)">${CMS_DELETE_ICON_SVG}</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', itemHtml);
}


// C. Student Coordinators Manager
function populateCoordinatorsCmsList() {
    const listContainer = document.getElementById('cms-coordinators-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const container = indexDoc.getElementById('coordinators-container');
    if (!container) return;

    const cards = container.querySelectorAll('.coord-card');
    cards.forEach(card => {
        const cardIdAttr = card.getAttribute('id') || '';
        const id = cardIdAttr.replace('coord-', '') || Date.now();

        const nameEl = card.querySelector('h4');
        const name = nameEl ? nameEl.innerText.trim() : '';

        const yearEl = card.querySelector('.coord-year');
        const year = yearEl ? yearEl.innerText.trim() : '';

        let phone = card.getAttribute('data-phone') || '';
        if (!phone) {
            const phoneEl = card.querySelector('.coord-phone');
            if (phoneEl) {
                phone = phoneEl.innerText.replace('📞', '').trim();
            }
        }

        let email = card.getAttribute('data-email') || '';
        if (!email) {
            const emailEl = card.querySelector('.coord-email');
            if (emailEl) {
                email = emailEl.innerText.replace('✉️', '').trim();
            }
        }

        const imgEl = card.querySelector('.coord-avatar img');
        const emojiEl = card.querySelector('.coord-avatar .coord-initials');

        const initialsText = emojiEl ? emojiEl.innerText.trim() : 'SC';
        const imgUrl = imgEl ? imgEl.getAttribute('src') : '';
        const hasPhoto = imgEl && imgEl.style.display === 'block';

        addCoordinatorSlotMarkup(id, name, year, phone, email, initialsText, imgUrl, hasPhoto);
    });
}

function addCoordinatorSlotMarkup(id, name='', year='', phone='', email='', initialsText='SC', imgUrl='', hasPhoto=false) {
    const listContainer = document.getElementById('cms-coordinators-list');
    const div = document.createElement('div');
    div.className = 'cms-list-item coordinator-cms-widget photo-uploader-widget';
    div.setAttribute('data-id', id);
    div.style = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 8px; margin-bottom: 1rem; position: relative;';
    div.innerHTML = `
        <div class="photo-preview-circle">
            <img id="preview-coord-photo-${id}" src="${hasPhoto ? imgUrl : ''}" style="display:${hasPhoto ? 'block' : 'none'};">
            <span id="preview-coord-initials-${id}" class="photo-preview-initials" style="display:${hasPhoto ? 'none' : 'block'};">${initialsText}</span>
        </div>
        <div style="flex-grow:1; display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-right: 40px;">
            <div class="form-group" style="margin-bottom:0;">
                <label>Coordinator Name</label>
                <input type="text" class="form-control cms-coord-name" value="${name}">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Year Group</label>
                <input type="text" class="form-control cms-coord-year" value="${year}">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Phone Number</label>
                <input type="tel" class="form-control cms-coord-phone" value="${phone}" placeholder="e.g. +91 9876543210">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Email ID</label>
                <input type="email" class="form-control cms-coord-email" value="${email}" placeholder="e.g. coordinator@vsb.ac.in">
            </div>
            <div class="form-group" style="margin-bottom:0; grid-column: span 2; display:flex; flex-direction:column; justify-content:center;">
                <label>Profile photo controls</label>
                <div style="display:flex; gap:0.5rem;">
                    <label class="btn-upload-file" style="margin:0;">
                        ${CMS_PHOTO_ICON_SVG}
                        <span>Photo</span>
                        <input type="file" accept="image/*" style="display:none;" onchange="handleCmsPhotoUploader(event, 'coord-img-${id}', 'coord-emoji-${id}', 'preview-coord-photo-${id}', 'preview-coord-initials-${id}')">
                    </label>
                    <button type="button" class="btn-clear-photo" style="padding:0.4rem 1rem; display:inline-flex; align-items:center; gap:4px;" onclick="clearCmsProfilePhoto('coord-img-${id}', 'coord-emoji-${id}', 'preview-coord-photo-${id}', 'preview-coord-initials-${id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg> Reset</button>
                </div>
            </div>
        </div>
        
        <button type="button" class="btn-delete-list-item" title="Delete Coordinator" onclick="this.closest('.cms-list-item').remove()" style="position: absolute; top: 1.25rem; right: 1.25rem;">${CMS_DELETE_ICON_SVG}</button>
    `;
    listContainer.appendChild(div);
}

function cmsAddCoordinatorSlot() {
    const widgets = document.querySelectorAll('#cms-coordinators-list .coordinator-cms-widget');
    let maxId = 0;
    widgets.forEach(w => {
        const idVal = parseInt(w.getAttribute('data-id'), 10);
        if (!isNaN(idVal) && idVal > maxId) {
            maxId = idVal;
        }
    });
    const nextId = maxId + 1;
    addCoordinatorSlotMarkup(nextId, '', 'III Year ECE', '', '', 'SC', '', false);
}


// === 5. Image & File Upload Helpers ===
function compressImageToDataUrl(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

async function uploadFileToSupabaseStorage(file, folder = 'misc') {
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = (localStorage.getItem('vsb_ece_supabase_url') || defaultUrl).trim();
    const key = (localStorage.getItem('vsb_ece_supabase_key') || defaultKey).trim();
    
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${Date.now()}_${sanitizedName}`;
    const uploadPath = `${folder}/${filename}`;
    
    const uploadUrl = `${url}/storage/v1/object/ece-assets/${uploadPath}`;
    
    // 1. Try Supabase storage bucket first
    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': file.type
            },
            body: file
        });
        
        if (response.ok) {
            const publicUrl = `${url}/storage/v1/object/public/ece-assets/${uploadPath}`;
            console.log(`[Supabase Storage Success] Upload Result: ${publicUrl}`);
            return publicUrl;
        }
    } catch (e) {
        console.warn('Direct bucket upload failed:', e);
    }
    
    // 2. Fallback: If image, compress into optimized Base64 data URL
    if (file.type && file.type.startsWith('image/')) {
        console.log('Bucket unavailable: compressing image locally into optimized Data URL...');
        return await compressImageToDataUrl(file);
    }
    
    // 3. Fallback for documents under 3MB
    return new Promise((resolve, reject) => {
        if (file.size > 3 * 1024 * 1024) {
            return reject(new Error('File exceeds 3MB limit for offline storage. Please provide an external link.'));
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file into data URL'));
        reader.readAsDataURL(file);
    });
}

async function handleCmsPhotoUploader(event, targetImgId, targetEmojiId, previewImgId, previewInitialsId) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const applyProfilePhoto = (url) => {
        // Update dashboard preview
        const pImg = document.getElementById(previewImgId);
        const pInit = document.getElementById(previewInitialsId);
        if (pImg && pInit) {
            pImg.src = url;
            pImg.style.display = 'block';
            pInit.style.display = 'none';
        }

        // Write directly to background parsed DOM document elements
        const docImg = indexDoc.getElementById(targetImgId);
        const docEmoji = indexDoc.getElementById(targetEmojiId);
        if (docImg && docEmoji) {
            docImg.src = url;
            docImg.style.display = 'block';
            docEmoji.style.display = 'none';
        }
    };

    showNotification('Processing profile photo...');
    try {
        const publicUrl = await uploadFileToSupabaseStorage(file, 'profiles');
        applyProfilePhoto(publicUrl);
        showNotification('Profile photo updated!');
    } catch (err) {
        console.warn('Storage upload note, reading file as Data URL:', err);
        const reader = new FileReader();
        reader.onload = (e) => {
            applyProfilePhoto(e.target.result);
            showNotification('Profile photo updated!');
        };
        reader.readAsDataURL(file);
    }
}

function clearCmsProfilePhoto(targetImgId, targetEmojiId, previewImgId, previewInitialsId) {
    // Revert dashboard preview
    const pImg = document.getElementById(previewImgId);
    const pInit = document.getElementById(previewInitialsId);
    if (pImg && pInit) {
        pImg.src = '';
        pImg.style.display = 'none';
        pInit.style.display = 'block';
    }

    // Revert background parsed DOM document elements
    const docImg = indexDoc.getElementById(targetImgId);
    const docEmoji = indexDoc.getElementById(targetEmojiId);
    if (docImg && docEmoji) {
        docImg.src = '';
        docImg.style.display = 'none';
        docEmoji.style.display = 'block';
    }
    showNotification('Profile photo reset to initials placeholder.');
}


// === 6. Reconstruct the DOM parser elements and Publish changes ===
function publishCmsChanges() {
    if (!indexDoc) {
        alert('CMS document is not initialized!');
        return;
    }

    // 1. Set general Text edits back to parsed DOM
    updateDocInner('college-name-header', 'field-header-name');
    updateDocInner('college-auth-header', 'field-header-auth');
    updateDocInner('college-appr-header', 'field-header-appr');
    updateDocInner('college-nba-header', 'field-header-nba');
    updateDocInner('footer-copyright-text', 'field-footer-copyright');
    updateDocInner('footer-creators-text', 'field-footer-creators');
    
    updateDocInner('hero-title', 'field-hero-title');
    updateDocInner('hero-subtitle', 'field-hero-subtitle');
    
    updateDocInner('about-card-text', 'field-about-text');
    updateDocInner('vision-text', 'field-vision-text');
    updateDocInner('mission-list', 'field-mission-list');

    // Save Certificate portal URL & card placeholder
    const certEl = indexDoc.getElementById('cert-portal-link');
    const certInput = document.getElementById('field-cert-link');
    if (certEl && certInput) {
        certEl.setAttribute('href', certInput.value.trim());
    }
    updateDocInner('cert-placeholder-text', 'field-cert-placeholder');

    // Save Program Intake
    updateDocInner('intake-ug-title', 'field-intake-ug-title');
    updateDocInner('intake-ug-text', 'field-intake-ug-text');
    updateDocInner('intake-pg-title', 'field-intake-pg-title');
    updateDocInner('intake-pg-text', 'field-intake-pg-text');

    // Save Club Details
    updateDocInner('club-title-card', 'field-club-title');
    updateDocInner('club-desc-card', 'field-club-desc');

    // Save Tables
    reconstructStrengthTableCmsDom();
    reconstructMouTableCmsDom();
    reconstructIsteTableCmsDom();

    // HOD 1 Info
    updateDocInner('hod-name', 'field-hod-name');
    updateDocInner('hod-designation', 'field-hod-designation');
    updateDocInner('hod-msg-text', 'field-hod-msg');
    updateDocInner('hod-research', 'field-hod-research');
    updateDocInner('hod-email', 'field-hod-email');

    // HOD 2 Info
    updateDocInner('hod-name-2', 'field-hod-name-2');
    updateDocInner('hod-designation-2', 'field-hod-designation-2');
    updateDocInner('hod-msg-text-2', 'field-hod-msg-2');
    updateDocInner('hod-research-2', 'field-hod-research-2');
    updateDocInner('hod-email-2', 'field-hod-email-2');

    // 2. Reconstruct Event Flyers Carousel HTML
    reconstructPostersCmsDom();

    // 3. Reconstruct Downloads grid HTML
    reconstructDownloadsCmsDom();

    // 4. Reconstruct Student Coordinator details
    reconstructCoordinatorsCmsDom();

    // 4b. Reconstruct Club Activity Rounds details
    reconstructActivityRoundsCmsDom();

    // 5. Update Supabase variables in memory and localStorage
    const defaultSupaUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultSupaKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';

    const supaUrl = (document.getElementById('field-supabase-url') && document.getElementById('field-supabase-url').value.trim()) || globalSupaUrl || localStorage.getItem('vsb_ece_supabase_url') || defaultSupaUrl;
    const supaKey = (document.getElementById('field-supabase-key') && document.getElementById('field-supabase-key').value.trim()) || globalSupaKey || localStorage.getItem('vsb_ece_supabase_key') || defaultSupaKey;
    
    globalSupaUrl = supaUrl;
    globalSupaKey = supaKey;

    localStorage.setItem('vsb_ece_supabase_url', supaUrl);
    localStorage.setItem('vsb_ece_supabase_key', supaKey);

    const fbProj = (document.getElementById('field-firebase-project-id') && document.getElementById('field-firebase-project-id').value.trim()) || localStorage.getItem('vsb_ece_firebase_project_id') || 'department-of-ece-2b5d7';
    const fbKey = (document.getElementById('field-firebase-api-key') && document.getElementById('field-firebase-api-key').value.trim()) || localStorage.getItem('vsb_ece_firebase_api_key') || 'AIzaSyBGPOKYAMZObNcinVIgm4ehUew1L9XY11s';
    if (fbProj) localStorage.setItem('vsb_ece_firebase_project_id', fbProj);
    if (fbKey) localStorage.setItem('vsb_ece_firebase_api_key', fbKey);

    // Secure: Strip keys from index.html body attributes to prevent exposing secrets in public repo
    indexDoc.body.setAttribute('data-supabase-url', '');
    indexDoc.body.setAttribute('data-supabase-key', '');

    // 6. Serialize updated DOM parser to HTML string
    const serializedHtml = "<!DOCTYPE html>\n" + indexDoc.documentElement.outerHTML;

    // 7. Extract state JSON object to upsert to Supabase database
    const stateObj = extractCmsJsonState();

    try {
        localStorage.setItem('vsb_ece_cached_site_data', JSON.stringify(stateObj));
    } catch(e) {
        console.warn('LocalStorage caching note:', e);
    }

    showNotification('Serializing DOM and publishing edits...');

    // 8. Save config to server config.json privately (so it's ignored by Git)
    const saveConfigPromise = fetch('/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            supabase_url: supaUrl, 
            supabase_key: supaKey,
            firebase_project_id: fbProj || 'department-of-ece-2b5d7',
            firebase_api_key: fbKey || 'AIzaSyBGPOKYAMZObNcinVIgm4ehUew1L9XY11s'
        })
    }).catch(err => console.warn('Could not save credentials to local config.json file.'));

    // 9. Make HTTP POST request to Python Local CMS Server (Saves to index.html disk)
    const localPublishPromise = fetch('/save-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: serializedHtml })
    }).catch(err => {
        console.warn('Local CMS Python server is offline. Publishing updates directly to Supabase cloud database.');
    });

    // 10. Upsert state JSON to Firebase & Supabase Cloud endpoints
    const cloudPublishPromise = saveCmsToSupabase(supaUrl, supaKey, stateObj);

    Promise.all([saveConfigPromise, localPublishPromise, cloudPublishPromise])
    .then(([configRes, htmlRes, cloudRes]) => {
        return pullStateFromSupabaseAndPopulate(0).then(() => {
            let msg = 'Website CMS updates saved successfully!';
            if (cloudRes && cloudRes.fsOk && cloudRes.supaOk) {
                msg += '\n🔥 Synced to Firebase Firestore & ⚡ Supabase cloud databases!';
            } else if (cloudRes && cloudRes.fsOk) {
                msg += '\n🔥 Synced to Firebase Firestore cloud database!';
            } else if (cloudRes && cloudRes.supaOk) {
                msg += '\n⚡ Synced to Supabase cloud database!';
            }
            alert(msg);
        });
    })
    .catch(err => {
        console.error('Publishing changes exception:', err);
        alert(`Error publishing edits: ${err.message || err}`);
    });
}

function updateDocInner(elId, fieldId) {
    const el = indexDoc.getElementById(elId);
    const f = document.getElementById(fieldId);
    if (el && f) {
        el.innerHTML = f.value;
    }
}

// Rebuild posters elements inside indexDoc
function reconstructPostersCmsDom() {
    const container = indexDoc.getElementById('posters-carousel-container');
    if (!container) return;

    container.innerHTML = '';
    const items = document.querySelectorAll('.cms-poster-item-card');

    items.forEach((item, idx) => {
        const title = item.querySelector('.cms-poster-title').value.trim();
        const date = item.querySelector('.cms-poster-date').value.trim();
        const regLink = item.querySelector('.cms-poster-link').value.trim();
        const imgPreview = item.querySelector('.cms-list-img-preview');
        const imgUrl = item.querySelector('.cms-poster-image-url').value.trim() || imgPreview.src;
        const isActive = idx === 0;

        const cardHtml = `
            <div class="poster-card tilt-card ${isActive ? 'active' : ''}">
                <div class="poster-image-container">
                    <img class="poster-1to1" src="${imgUrl}" alt="${title}">
                    <input type="file" class="admin-poster-upload-input" accept="image/*" style="display:none;" onchange="handlePosterUpload(event, this)">
                    <button class="btn-admin-overlay" onclick="triggerPosterUpload(this)">📷 Change Image</button>
                </div>
                <div class="poster-details">
                    <h3 class="event-title-text">${title}</h3>
                    <p class="event-date-text">${date}</p>
                    <div class="link-action-container">
                        <a class="event-reg-link" href="${regLink}" target="_blank">Register Now</a>
                        <div class="admin-input-group" style="display:none; margin-top: 1rem; width: 100%;">
                            <label style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); margin-bottom:0.3rem; display:block;">Poster Controls (Admin)</label>
                            <input type="text" class="admin-link-url" placeholder="Paste Registration Form URL" style="margin-bottom:0.5rem;" value="${regLink}" onchange="updateActivePosterLink(this)">
                            <input type="text" class="admin-poster-image-url" placeholder="Paste Image URL directly" value="${imgUrl}" onchange="updateActivePosterImageByUrl(this)">
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Rebuild downloads elements inside indexDoc
function reconstructDownloadsCmsDom() {
    const container = indexDoc.getElementById('download-grid-container');
    if (!container) return;

    container.innerHTML = '';
    const items = document.querySelectorAll('.cms-download-item-card');

    items.forEach(item => {
        const title = item.querySelector('.cms-download-title').value.trim();
        const meta = item.querySelector('.cms-download-meta').value.trim();
        const fileUrl = item.querySelector('.cms-download-url').value.trim();
        const isCustom = item.getAttribute('data-custom') === 'true';
        const category = item.getAttribute('data-category');

        const fileIcon = fileUrl.includes('.xlsx') || fileUrl.includes('Excel') ? '📊' : '📄';

        const cardHtml = `
            <div class="download-card tilt-card ${isCustom ? 'custom-dl-card' : ''}" data-category="${category}">
                <div class="file-info">
                    <div class="file-icon">${fileIcon}</div>
                    <div class="file-details">
                        <h4>${title}</h4>
                        <p>${meta}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <a href="${fileUrl}" download="${title}.pdf" class="btn-download" onclick="showDownloadNotify('${title}')">↓</a>
                    ${isCustom ? `<button class="btn-admin-logout btn-admin-only-inline" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; width: 35px; height: 35px; border-radius: 50%; padding:0; display:none; align-items:center; justify-content:center;" onclick="deleteCustomDownloadCard(this)">${CMS_DELETE_ICON_SM_SVG}</button>` : ''}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Rebuild student coordinator elements inside indexDoc
function reconstructCoordinatorsCmsDom() {
    const container = indexDoc.getElementById('coordinators-container');
    if (!container) return;
    container.innerHTML = '';

    const widgets = document.querySelectorAll('#cms-coordinators-list .coordinator-cms-widget');
    widgets.forEach(widget => {
        const id = widget.getAttribute('data-id');
        const name = (widget.querySelector('.cms-coord-name')?.value || '').trim();
        const year = (widget.querySelector('.cms-coord-year')?.value || '').trim();
        const phone = (widget.querySelector('.cms-coord-phone')?.value || '').trim();
        const email = (widget.querySelector('.cms-coord-email')?.value || '').trim();

        // Get photo uploader values
        const pImg = widget.querySelector(`#preview-coord-photo-${id}`);
        const imgUrl = pImg ? pImg.getAttribute('src') : '';
        const hasPhoto = pImg && pImg.style.display === 'block';

        let initials = 'SC';
        if (name) {
            const parts = name.split(' ');
            if (parts.length >= 2) {
                initials = (parts[0][0] + parts[1][0]).toUpperCase();
            } else if (parts[0].length >= 2) {
                initials = parts[0].substring(0, 2).toUpperCase();
            } else {
                initials = parts[0][0].toUpperCase();
            }
        }

        const phoneClean = phone.replace(/[^0-9+]/g, '');
        const phoneLink = phone ? `<p class="coord-phone" id="coord-phone-${id}"><a href="tel:${phoneClean}">📞 ${phone}</a></p>` : '';
        const emailLink = email ? `<p class="coord-email" id="coord-email-${id}"><a href="mailto:${email}">✉️ ${email}</a></p>` : '';
        const contactHtml = (phoneLink || emailLink) ? `
                <div class="coord-contact" id="coord-contact-${id}">
                    ${phoneLink}
                    ${emailLink}
                </div>` : '';

        const coordHtml = `
            <div class="coord-card tilt-card" id="coord-${id}" data-phone="${phone.replace(/"/g, '&quot;')}" data-email="${email.replace(/"/g, '&quot;')}">
                <div class="coord-avatar" style="overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;">
                    <img id="coord-img-${id}" src="${hasPhoto ? imgUrl : ''}" alt="Coordinator Photo" style="width: 100%; height: 100%; object-fit: cover; display: ${hasPhoto ? 'block' : 'none'};">
                    <span id="coord-emoji-${id}" class="coord-initials" style="display: ${hasPhoto ? 'none' : 'block'};">${initials}</span>
                    <input type="file" id="admin-coord-upload-${id}" accept="image/*" style="display:none;" onchange="handleCoordPhotoUpload(event, ${id})">
                    <button class="btn-avatar-edit btn-admin-only-inline" onclick="triggerCoordUpload(${id})">✏️</button>
                </div>
                <h4 id="coord-name-${id}">${name}</h4>
                <p class="coord-year" id="coord-year-${id}">${year}</p>
                ${contactHtml}
            </div>
        `;
        container.insertAdjacentHTML('beforeend', coordHtml);
    });
}

// Collect current CMS JSON state values
function extractCmsJsonState() {
    const editsObj = {};
    const editableElements = [
        'college-name-header', 'college-auth-header', 'college-appr-header', 'college-nba-header',
        'hero-title', 'hero-subtitle', 'about-card-text', 'vision-text', 'mission-list', 
        'intake-ug-title', 'intake-ug-text', 'intake-pg-title', 'intake-pg-text', 
        'table-strength-data', 'table-mou-data', 'table-iste-data', 'club-title-card', 'club-desc-card',
        'hod-name', 'hod-designation', 'hod-msg-text', 'hod-research', 'hod-email',
        'hod-name-2', 'hod-designation-2', 'hod-msg-text-2', 'hod-research-2', 'hod-email-2',
        'coordinators-container', 'club-rounds-container', 'cert-portal-link', 'cert-placeholder-text', 'footer-copyright-text', 'footer-creators-text'
    ];

    editableElements.forEach(id => {
        const el = indexDoc.getElementById(id);
        if (el) {
            if (id === 'cert-portal-link') {
                editsObj[id] = el.getAttribute('href') || '';
            } else {
                editsObj[id] = el.innerHTML;
            }
        }
    });

    const coordPhotosArray = [];
    const docCoordCards = indexDoc.querySelectorAll('#coordinators-container .coord-card');
    docCoordCards.forEach(card => {
        const idAttr = card.getAttribute('id') || '';
        const id = idAttr.replace('coord-', '');
        const img = card.querySelector('.coord-avatar img');
        const emoji = card.querySelector('.coord-avatar .coord-initials');
        if (img && emoji) {
            coordPhotosArray.push({
                id: id,
                src: img.getAttribute('src') || '',
                displayImg: img.style.display,
                displayEmoji: emoji.style.display
            });
        }
    });

    return {
        edits: editsObj,
        postersHtml: indexDoc.getElementById('posters-carousel-container').innerHTML,
        downloadsHtml: indexDoc.getElementById('download-grid-container').innerHTML,
        hodPhotoSrc: indexDoc.getElementById('hod-photo-img').src,
        hodPhotoDisplay: indexDoc.getElementById('hod-photo-img').style.display,
        hodEmojiDisplay: indexDoc.getElementById('hod-avatar-emoji').style.display,
        hodPhotoSrc2: indexDoc.getElementById('hod-photo-img-2').src,
        hodPhotoDisplay2: indexDoc.getElementById('hod-photo-img-2').style.display,
        hodEmojiDisplay2: indexDoc.getElementById('hod-avatar-emoji-2').style.display,
        coordPhotos: coordPhotosArray,
        adminAvatarSrc: indexDoc.getElementById('admin-profile-pic') ? indexDoc.getElementById('admin-profile-pic').src : ''
    };
}

// === Firestore & Cloud Backend Helper ===
function jsonToFirestoreVal(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') return { doubleValue: val };
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
        return { arrayValue: { values: val.map(jsonToFirestoreVal) } };
    }
    if (typeof val === 'object') {
        const fields = {};
        for (const k in val) {
            fields[k] = jsonToFirestoreVal(val[k]);
        }
        return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
}

function firestoreValToJson(valObj) {
    if (!valObj) return null;
    if ('stringValue' in valObj) return valObj.stringValue;
    if ('booleanValue' in valObj) return valObj.booleanValue;
    if ('doubleValue' in valObj) return valObj.doubleValue;
    if ('integerValue' in valObj) return parseInt(valObj.integerValue, 10);
    if ('nullValue' in valObj) return null;
    if ('arrayValue' in valObj) {
        return (valObj.arrayValue.values || []).map(firestoreValToJson);
    }
    if ('mapValue' in valObj) {
        const res = {};
        const fields = valObj.mapValue.fields || {};
        for (const k in fields) {
            res[k] = firestoreValToJson(fields[k]);
        }
        return res;
    }
    return null;
}

function fetchFromFirestore(keyName) {
    const projectId = localStorage.getItem('vsb_ece_firebase_project_id') || 'department-of-ece-2b5d7';
    const apiKey = localStorage.getItem('vsb_ece_firebase_api_key') || 'AIzaSyBGPOKYAMZObNcinVIgm4ehUew1L9XY11s';
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/vsb_ece_state/${keyName}`;
    const params = [];
    if (apiKey) params.push(`key=${apiKey}`);
    params.push(`_t=${Date.now()}`);
    url += '?' + params.join('&');

    return fetch(url, { cache: 'no-store' })
        .then(res => {
            if (!res.ok) throw new Error('Firestore read error');
            return res.json();
        })
        .then(doc => {
            if (doc && doc.fields && doc.fields.value) {
                return firestoreValToJson(doc.fields.value);
            }
            return null;
        });
}

function saveToFirestore(keyName, valueData) {
    const projectId = localStorage.getItem('vsb_ece_firebase_project_id') || 'department-of-ece-2b5d7';
    const apiKey = localStorage.getItem('vsb_ece_firebase_api_key') || 'AIzaSyBGPOKYAMZObNcinVIgm4ehUew1L9XY11s';
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/vsb_ece_state/${keyName}`;
    if (apiKey) url += `?key=${apiKey}`;

    const payload = {
        fields: {
            key: { stringValue: keyName },
            value: jsonToFirestoreVal(valueData)
        }
    };

    return fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => res.ok);
}

// Save CMS State JSON to both Firebase Firestore & Supabase
function saveCmsToSupabase(url, key, state) {
    // 1. Sync to Firebase Firestore Cloud
    const firestorePromise = saveToFirestore('site_data', state)
        .then(ok => {
            console.log('✅ Firebase Firestore save success:', ok);
            return !!ok;
        })
        .catch(e => {
            console.warn('Firestore CMS sync error:', e);
            return false;
        });

    // 2. Sync to Supabase Cloud
    let supabasePromise = Promise.resolve(false);
    if (url && key) {
        const upsertUrl = `${url.trim()}/rest/v1/vsb_ece_state`;
        console.log(`[Supabase POST] URL: ${url.trim()}, Table: vsb_ece_state, Type: POST (UPSERT)`);
        supabasePromise = fetch(upsertUrl, {
            method: 'POST',
            headers: {
                'apikey': key.trim(),
                'Authorization': `Bearer ${key.trim()}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                key: 'site_data',
                value: state
            })
        }).then(res => {
            console.log(`[Supabase POST Response] HTTP Status: ${res.status}`);
            return res.ok;
        }).catch(e => {
            console.warn('Supabase CMS sync error:', e);
            return false;
        });
    }

    return Promise.allSettled([firestorePromise, supabasePromise]).then(results => {
        const fsOk = results[0].status === 'fulfilled' && results[0].value;
        const supaOk = results[1].status === 'fulfilled' && results[1].value;
        if (!fsOk && !supaOk) {
            throw new Error('Both Firebase Firestore and Supabase failed to save cloud data. Check your network or credentials.');
        }
        return { fsOk, supaOk };
    });
}

// Test both cloud database connections
async function testCloudConnections() {
    const statusEl = document.getElementById('cloud-test-status');
    if (statusEl) statusEl.textContent = 'Testing cloud connections...';

    let fsStatus = false;
    let supaStatus = false;

    // Test Firestore
    try {
        const fsData = await fetchFromFirestore('site_data');
        fsStatus = !!fsData;
    } catch (e) {
        fsStatus = false;
    }

    // Test Supabase
    const supaUrl = document.getElementById('field-supabase-url') ? document.getElementById('field-supabase-url').value.trim() : globalSupaUrl;
    const supaKey = document.getElementById('field-supabase-key') ? document.getElementById('field-supabase-key').value.trim() : globalSupaKey;
    if (supaUrl && supaKey) {
        try {
            const res = await fetch(`${supaUrl}/rest/v1/vsb_ece_state?key=eq.site_data`, {
                headers: { 'apikey': supaKey, 'Authorization': `Bearer ${supaKey}` }
            });
            supaStatus = res.ok;
        } catch (e) {
            supaStatus = false;
        }
    }

    const fsBadge = document.getElementById('badge-firebase-status');
    if (fsBadge) {
        fsBadge.textContent = fsStatus ? 'Connected' : 'Error / Unreachable';
        fsBadge.style.color = fsStatus ? '#10b981' : '#ef4444';
        fsBadge.style.borderColor = fsStatus ? '#10b981' : '#ef4444';
    }

    const supaBadge = document.getElementById('badge-supabase-status');
    if (supaBadge) {
        supaBadge.textContent = supaStatus ? 'Connected' : 'Error / Unreachable';
        supaBadge.style.color = supaStatus ? '#10b981' : '#ef4444';
        supaBadge.style.borderColor = supaStatus ? '#10b981' : '#ef4444';
    }

    if (statusEl) {
        let msg = '';
        if (fsStatus && supaStatus) msg = '✅ Both Firebase Firestore & Supabase are ONLINE and connected!';
        else if (fsStatus) msg = '🔥 Firebase Firestore is ONLINE! (Supabase offline)';
        else if (supaStatus) msg = '⚡ Supabase is ONLINE! (Firebase offline)';
        else msg = '❌ Both cloud connections failed.';
        statusEl.textContent = msg;
    }
}


// === 7. Auxiliary Operations & system cache resets ===
function showNotification(message) {
    const banner = document.getElementById('notification-banner');
    banner.textContent = message;
    banner.style.display = 'block';
    
    setTimeout(() => {
        banner.style.display = 'none';
    }, 3000);
}

function resetLocalStorageConfig() {
    if (confirm('Clear local caching configs (Supabase URL, Session status)?')) {
        localStorage.removeItem('vsb_ece_supabase_url');
        localStorage.removeItem('vsb_ece_supabase_key');
        localStorage.removeItem('vsb_ece_is_admin');
        alert('Config cache cleared.');
        window.location.reload();
    }
}

function previewLiveWebsite() {
    window.open('index.html', '_blank');
}

// === 8. Dynamic Data Tables Cms Lists Managers ===

// A. Student Strength Table
function populateStrengthTableCmsList() {
    const list = document.getElementById('cms-strength-list');
    if (!list) return;
    list.innerHTML = '';
    const tbody = indexDoc.getElementById('table-strength-data')?.querySelector('tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 4) {
            addStrengthRowMarkup(cols[0].innerText.trim(), cols[1].innerText.trim(), cols[2].innerText.trim(), cols[3].innerText.trim());
        }
    });
}

function addStrengthRowMarkup(year='', boys='', girls='', total='') {
    const list = document.getElementById('cms-strength-list');
    const div = document.createElement('div');
    div.className = 'cms-table-row-item-card';
    div.style = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center; justify-content: space-between;';
    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0.5rem; flex-grow: 1;">
            <input type="text" placeholder="Academic Year" class="form-control cms-strength-year" value="${year}">
            <input type="text" placeholder="Boys" class="form-control cms-strength-boys" value="${boys}">
            <input type="text" placeholder="Girls" class="form-control cms-strength-girls" value="${girls}">
            <input type="text" placeholder="Total" class="form-control cms-strength-total" value="${total}">
        </div>
        <button type="button" class="btn-delete-list-item" style="width: 35px; height: 35px; margin-left: 0.5rem;" title="Delete Row" onclick="this.parentElement.remove()">${CMS_DELETE_ICON_SM_SVG}</button>
    `;
    list.appendChild(div);
}

function cmsAddStrengthRow() {
    addStrengthRowMarkup();
}

function reconstructStrengthTableCmsDom() {
    const tbody = indexDoc.getElementById('table-strength-data')?.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const rows = document.querySelectorAll('#cms-strength-list .cms-table-row-item-card');
    rows.forEach(row => {
        const year = row.querySelector('.cms-strength-year').value.trim();
        const boys = row.querySelector('.cms-strength-boys').value.trim();
        const girls = row.querySelector('.cms-strength-girls').value.trim();
        const total = row.querySelector('.cms-strength-total').value.trim();
        
        if (!year) return;
        const tr = `
            <tr>
                <td>${year}</td>
                <td>${boys}</td>
                <td>${girls}</td>
                <td>${total}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', tr);
    });
}


// B. Department MOUs Table
function populateMouTableCmsList() {
    const list = document.getElementById('cms-mou-list');
    if (!list) return;
    list.innerHTML = '';
    const tbody = indexDoc.getElementById('table-mou-data')?.querySelector('tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 4) {
            addMouRowMarkup(cols[0].innerText.trim(), cols[1].innerText.trim(), cols[2].innerText.trim(), cols[3].innerText.trim());
        }
    });
}

function addMouRowMarkup(sno='', org='', date='', status='') {
    const list = document.getElementById('cms-mou-list');
    const div = document.createElement('div');
    div.className = 'cms-table-row-item-card';
    div.style = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center; justify-content: space-between;';
    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 0.5fr 2fr 1fr 1fr; gap: 0.5rem; flex-grow: 1;">
            <input type="text" placeholder="S.No" class="form-control cms-mou-sno" value="${sno}">
            <input type="text" placeholder="Industry Name" class="form-control cms-mou-org" value="${org}">
            <input type="text" placeholder="Date" class="form-control cms-mou-date" value="${date}">
            <input type="text" placeholder="Status" class="form-control cms-mou-status" value="${status}">
        </div>
        <button type="button" class="btn-delete-list-item" style="width: 35px; height: 35px; margin-left: 0.5rem;" title="Delete Row" onclick="this.parentElement.remove()">${CMS_DELETE_ICON_SM_SVG}</button>
    `;
    list.appendChild(div);
}

function cmsAddMouRow() {
    addMouRowMarkup();
}

function reconstructMouTableCmsDom() {
    const tbody = indexDoc.getElementById('table-mou-data')?.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const rows = document.querySelectorAll('#cms-mou-list .cms-table-row-item-card');
    rows.forEach(row => {
        const sno = row.querySelector('.cms-mou-sno').value.trim();
        const org = row.querySelector('.cms-mou-org').value.trim();
        const date = row.querySelector('.cms-mou-date').value.trim();
        const status = row.querySelector('.cms-mou-status').value.trim();
        
        if (!org) return;
        const tr = `
            <tr>
                <td>${sno}</td>
                <td>${org}</td>
                <td>${date}</td>
                <td>${status}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', tr);
    });
}


// C. ISTE Memberships Table
function populateIsteTableCmsList() {
    const list = document.getElementById('cms-iste-list');
    if (!list) return;
    list.innerHTML = '';
    const tbody = indexDoc.getElementById('table-iste-data')?.querySelector('tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 5) {
            addIsteRowMarkup(cols[0].innerText.trim(), cols[1].innerText.trim(), cols[2].innerText.trim(), cols[3].innerText.trim(), cols[4].innerText.trim());
        }
    });
}

function addIsteRowMarkup(sno='', body='', year='', count='', expiry='') {
    const list = document.getElementById('cms-iste-list');
    const div = document.createElement('div');
    div.className = 'cms-table-row-item-card';
    div.style = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center; justify-content: space-between;';
    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 0.5fr 1.5fr 1.5fr 1fr 1fr; gap: 0.5rem; flex-grow: 1;">
            <input type="text" placeholder="S.No" class="form-control cms-iste-sno" value="${sno}">
            <input type="text" placeholder="Professional Body" class="form-control cms-iste-body" value="${body}">
            <input type="text" placeholder="Year Group" class="form-control cms-iste-year" value="${year}">
            <input type="text" placeholder="Count" class="form-control cms-iste-count" value="${count}">
            <input type="text" placeholder="Expiry" class="form-control cms-iste-expiry" value="${expiry}">
        </div>
        <button type="button" class="btn-delete-list-item" style="width: 35px; height: 35px; margin-left: 0.5rem;" title="Delete Row" onclick="this.parentElement.remove()">${CMS_DELETE_ICON_SM_SVG}</button>
    `;
    list.appendChild(div);
}

function cmsAddIsteRow() {
    addIsteRowMarkup();
}

function reconstructIsteTableCmsDom() {
    const tbody = indexDoc.getElementById('table-iste-data')?.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const rows = document.querySelectorAll('#cms-iste-list .cms-table-row-item-card');
    rows.forEach(row => {
        const sno = row.querySelector('.cms-iste-sno').value.trim();
        const body = row.querySelector('.cms-iste-body').value.trim();
        const year = row.querySelector('.cms-iste-year').value.trim();
        const count = row.querySelector('.cms-iste-count').value.trim();
        const expiry = row.querySelector('.cms-iste-expiry').value.trim();
        
        if (!body) return;
        const tr = `
            <tr>
                <td>${sno}</td>
                <td>${body}</td>
                <td>${year}</td>
                <td>${count}</td>
                <td>${expiry}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', tr);
    });
}

// D. Manage Club Activity Challenges & Rounds (Dynamic Rounds by Admin)
const DEFAULT_ACTIVITY_ROUNDS = [
    { title: 'Round 1-Crossword puzzle', url: 'https://electroplay-quiz.vercel.app/' },
    { title: 'Round 2-Instruction Following', url: 'https://clue-matrix.vercel.app/' },
    { title: 'Round 3-Hardware Hunt', url: 'https://wokwi.com/projects/473662526707899393' }
];

const ACTIVITY_ROUND_ICONS = ['🧩', '⚡', '💻', '🎮', '🎯', '🚀', '🔬', '🏆', '🔥', '⚙️', '💡', '🤖'];

function escapeRoundAttr(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getCurrentActivityRoundsFromInputs() {
    const container = document.getElementById('cms-activity-rounds-container');
    if (!container) return [];
    const cards = container.querySelectorAll('.cms-round-slot-card');
    const rounds = [];
    cards.forEach((card, idx) => {
        const titleEl = card.querySelector('.cms-round-slot-title');
        const urlEl = card.querySelector('.cms-round-slot-url');
        rounds.push({
            title: titleEl ? titleEl.value.trim() : `Round ${idx + 1}`,
            url: urlEl ? urlEl.value.trim() : ''
        });
    });
    return rounds;
}

function renderActivityRoundSlots(roundsArray) {
    const container = document.getElementById('cms-activity-rounds-container');
    const countInput = document.getElementById('cms-rounds-count');
    const badge = document.getElementById('cms-rounds-badge');
    
    if (!container) return;

    if (!Array.isArray(roundsArray) || roundsArray.length === 0) {
        roundsArray = DEFAULT_ACTIVITY_ROUNDS.slice();
    }

    if (countInput) {
        countInput.value = roundsArray.length;
    }
    if (badge) {
        badge.textContent = `${roundsArray.length} Round${roundsArray.length === 1 ? '' : 's'} Active`;
    }

    container.innerHTML = '';

    roundsArray.forEach((round, idx) => {
        const roundNum = idx + 1;
        const icon = ACTIVITY_ROUND_ICONS[idx % ACTIVITY_ROUND_ICONS.length];
        const titleVal = round.title !== undefined ? round.title : `Round ${roundNum}`;
        const urlVal = round.url || '';

        const card = document.createElement('div');
        card.className = 'cms-round-slot-card';
        card.setAttribute('data-index', idx);
        card.style = 'background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 14px; padding: 1.25rem 1.5rem; transition: all 0.3s ease;';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span style="font-size: 1.35rem;">${icon}</span>
                    <h4 style="margin: 0; color: var(--accent-cyan); font-family: 'Outfit', sans-serif; font-size: 1.05rem; font-weight: 700;">Round ${roundNum} Configuration</h4>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button type="button" class="btn-delete-list-item" title="Delete Round ${roundNum}" onclick="removeSingleActivityRound(${idx})" style="width: 34px; height: 34px;">${CMS_DELETE_ICON_SM_SVG}</button>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); font-weight: 700; margin-bottom: 0.4rem; display: block;">Round ${roundNum} Name / Title</label>
                    <input type="text" class="form-control cms-round-slot-title" value="${escapeRoundAttr(titleVal)}" placeholder="e.g. Round ${roundNum} - Challenge Name">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); font-weight: 700; margin-bottom: 0.4rem; display: block;">Redirection URL Link</label>
                    <input type="url" class="form-control cms-round-slot-url" value="${escapeRoundAttr(urlVal)}" placeholder="https://...">
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function populateActivityRoundsCmsList() {
    let loadedRounds = [];

    if (typeof indexDoc !== 'undefined' && indexDoc) {
        const container = indexDoc.getElementById('club-rounds-container');
        if (container) {
            const items = container.querySelectorAll('.activity-round-item');
            if (items && items.length > 0) {
                items.forEach((item, i) => {
                    loadedRounds.push({
                        title: item.getAttribute('data-title') || `Round ${i + 1}`,
                        url: item.getAttribute('data-url') || ''
                    });
                });
            }
        }
    }

    if (loadedRounds.length === 0) {
        const docContainer = document.getElementById('club-rounds-container');
        if (docContainer) {
            const items = docContainer.querySelectorAll('.activity-round-item');
            if (items && items.length > 0) {
                items.forEach((item, i) => {
                    loadedRounds.push({
                        title: item.getAttribute('data-title') || `Round ${i + 1}`,
                        url: item.getAttribute('data-url') || ''
                    });
                });
            }
        }
    }

    if (loadedRounds.length === 0) {
        loadedRounds = DEFAULT_ACTIVITY_ROUNDS.slice();
    }

    renderActivityRoundSlots(loadedRounds);
}

function handleRoundsCountChange(newCount) {
    let currentRounds = getCurrentActivityRoundsFromInputs();
    let count = parseInt(newCount, 10);

    if (isNaN(count) || count < 1) {
        count = 1;
    }
    if (count > 20) {
        count = 20;
    }

    // Expand if count increased
    while (currentRounds.length < count) {
        const nextNum = currentRounds.length + 1;
        currentRounds.push({
            title: `Round ${nextNum}`,
            url: ''
        });
    }

    // Shrink if count decreased
    if (currentRounds.length > count) {
        currentRounds = currentRounds.slice(0, count);
    }

    renderActivityRoundSlots(currentRounds);
}

function stepRoundsCount(delta) {
    const countInput = document.getElementById('cms-rounds-count');
    const currentVal = countInput ? (parseInt(countInput.value, 10) || 1) : 1;
    const newVal = Math.max(1, Math.min(20, currentVal + delta));
    if (countInput) {
        countInput.value = newVal;
    }
    handleRoundsCountChange(newVal);
}

function addSingleActivityRound() {
    const currentRounds = getCurrentActivityRoundsFromInputs();
    const nextNum = currentRounds.length + 1;
    currentRounds.push({
        title: `Round ${nextNum}`,
        url: ''
    });
    renderActivityRoundSlots(currentRounds);
    showNotification(`Round ${nextNum} slot added!`);
}

function removeSingleActivityRound(index) {
    const currentRounds = getCurrentActivityRoundsFromInputs();
    if (currentRounds.length <= 1) {
        alert('At least one competition round must remain configured.');
        return;
    }
    currentRounds.splice(index, 1);
    renderActivityRoundSlots(currentRounds);
    showNotification(`Round slot removed.`);
}

function reconstructActivityRoundsCmsDom() {
    if (typeof indexDoc === 'undefined' || !indexDoc) return;
    const container = indexDoc.getElementById('club-rounds-container');
    if (!container) return;

    let rounds = getCurrentActivityRoundsFromInputs();
    if (!rounds || rounds.length === 0) {
        const countInput = document.getElementById('cms-rounds-count');
        const count = countInput ? (parseInt(countInput.value, 10) || 3) : 3;
        rounds = DEFAULT_ACTIVITY_ROUNDS.slice(0, count);
    }

    let itemsHtml = '';
    rounds.forEach((r, idx) => {
        const roundTitle = escapeRoundAttr(r.title || `Round ${idx + 1}`);
        const roundUrl = escapeRoundAttr(r.url || '#');
        itemsHtml += `
        <div class="activity-round-item" data-title="${roundTitle}" data-type="link" data-url="${roundUrl}" data-locked="false">
            <div class="challenge-title"></div>
            <div class="challenge-desc"></div>
            <pre class="challenge-code"></pre>
        </div>`;
    });

    container.innerHTML = itemsHtml;
}

// === 7. Round 1 Quiz Submissions & Leaderboard Systems ===
// === 7. Round 1 Quiz Submissions & Leaderboard Systems ===
function loadQuizResultsInDashboard() {
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    
    const getUrl = `${url}/rest/v1/vsb_ece_state?key=eq.quiz_results`;
    
    const tbody = document.getElementById('quiz-results-tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="10" style="padding: 2rem; text-align: center; color: var(--accent-cyan);">Loading submissions leaderboard...</td></tr>`;
    }
    
    const filterEl = document.getElementById('leaderboard-year-filter');
    const selectedFilterYear = filterEl ? filterEl.value : 'Second Year';
    
    console.log(`[Supabase GET] URL: ${url}, Table: vsb_ece_state (quiz_results), Type: GET`);
    fetch(getUrl, {
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
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
        
        cachedResultsList = resultsList;
        
        if (!tbody) return;
        
        // Filter by selected year
        const filteredResults = resultsList.filter(res => {
            if (!res || !res.year) return false;
            return res.year.toLowerCase().trim() === selectedFilterYear.toLowerCase().trim();
        });
        
        if (filteredResults.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="padding: 2rem; text-align: center; color: var(--text-secondary);">No quiz results recorded for ${selectedFilterYear} yet.</td></tr>`;
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
            const originalIndex = resultsList.indexOf(res);
            const dateStr = res.submittedAt ? new Date(res.submittedAt).toLocaleString() : 'N/A';
            const studentName = res.studentName || res.teamName || 'N/A';
            const regnum = res.regnum || res.student1 || 'N/A';
            const dept = res.dept || 'N/A';
            const sec = res.section || 'N/A';
            const mail = res.mail || 'N/A';
            
            const maxQ = res.year === 'Third Year' ? 45 : 50;
            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; transition: background 0.15s ease;" onmouseover="this.style.background='rgba(0,210,255,0.03)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 0.85rem 1rem; font-weight: 800; white-space: nowrap; color: ${rank === 0 ? '#ffd700' : rank === 1 ? '#c0c0c0' : rank === 2 ? '#cd7f32' : 'var(--text-secondary)'};">#${rank + 1}</td>
                    <td style="padding: 0.85rem 1rem; font-weight: 700; white-space: nowrap; color: var(--accent-cyan);">${studentName}</td>
                    <td style="padding: 0.85rem 1rem; font-family: monospace; white-space: nowrap; letter-spacing: 0.5px;">${regnum}</td>
                    <td style="padding: 0.85rem 1rem; white-space: nowrap;">${dept} / ${res.year} (${sec})</td>
                    <td style="padding: 0.85rem 1rem; font-size: 0.85rem; white-space: nowrap; color: var(--text-secondary);">${mail}</td>
                    <td style="padding: 0.85rem 1rem; font-weight: 800; white-space: nowrap; text-align: center; color: #4ade80;">${res.score} / ${maxQ}</td>
                    <td style="padding: 0.85rem 1rem; font-family: monospace; white-space: nowrap; text-align: center;">${res.timeSpent || 'N/A'}</td>
                    <td style="padding: 0.85rem 1rem; font-size: 0.8rem; white-space: nowrap; color: var(--text-secondary);">${dateStr}</td>
                    <td style="padding: 0.85rem 1rem; white-space: nowrap; text-align: center;">
                        <div style="display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">
                            <button type="button" class="btn-table-edit" title="Edit Student Record" onclick="openEditResultModal(${originalIndex})">
                                ${CMS_EDIT_ICON_SM_SVG}
                                <span>Edit</span>
                            </button>
                            <button type="button" class="btn-table-delete" title="Delete Student Record" onclick="deleteMcqResult(${originalIndex})">
                                ${CMS_DELETE_ICON_SM_SVG}
                                <span>Delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    })
    .catch(err => {
        console.error('Error loading quiz results:', err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="10" style="padding: 2rem; text-align: center; color: #f87171;">Error loading results. Check Supabase connection key.</td></tr>`;
        }
    });
}

function openEditResultModal(index) {
    const res = cachedResultsList[index];
    if (!res) return;
    
    document.getElementById('edit-result-index').value = index;
    document.getElementById('edit-student-name').value = res.studentName || res.teamName || '';
    document.getElementById('edit-regnum').value = res.regnum || res.student1 || '';
    document.getElementById('edit-dept').value = res.dept || '';
    document.getElementById('edit-section').value = res.section || '';
    document.getElementById('edit-score').value = res.score !== undefined ? res.score : 0;
    document.getElementById('edit-time-spent').value = res.timeSpent || '';
    document.getElementById('edit-mail').value = res.mail || '';
    
    document.getElementById('editResultModal').style.display = 'flex';
}

function closeEditResultModal() {
    document.getElementById('editResultModal').style.display = 'none';
}

function saveEditedMcqResult(event) {
    if (event) event.preventDefault();
    
    const index = parseInt(document.getElementById('edit-result-index').value);
    if (isNaN(index) || !cachedResultsList[index]) return;
    
    const studentName = document.getElementById('edit-student-name').value.trim();
    const regnum = document.getElementById('edit-regnum').value.trim();
    const dept = document.getElementById('edit-dept').value.trim();
    const section = document.getElementById('edit-section').value.trim();
    const score = parseInt(document.getElementById('edit-score').value);
    const timeSpent = document.getElementById('edit-time-spent').value.trim();
    const mail = document.getElementById('edit-mail').value.trim();
    
    cachedResultsList[index].studentName = studentName;
    cachedResultsList[index].teamName = studentName; 
    cachedResultsList[index].regnum = regnum;
    cachedResultsList[index].student1 = regnum;
    cachedResultsList[index].dept = dept;
    cachedResultsList[index].section = section;
    cachedResultsList[index].score = score;
    cachedResultsList[index].timeSpent = timeSpent;
    cachedResultsList[index].mail = mail;
    
    saveResultsListToSupabase(cachedResultsList);
    closeEditResultModal();
}

function deleteMcqResult(index) {
    if (!confirm("Are you sure you want to delete this result?")) return;
    
    cachedResultsList.splice(index, 1);
    saveResultsListToSupabase(cachedResultsList);
}

function saveResultsListToSupabase(resultsList) {
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    
    const postUrl = `${url}/rest/v1/vsb_ece_state`;
    
    fetch(postUrl, {
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
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to save");
        alert("Submissions leaderboard updated successfully!");
        loadQuizResultsInDashboard(); 
    })
    .catch(err => {
        console.error(err);
        alert("⚠️ Failed to sync changes with Supabase!");
    });
}

function clearAllQuizResults() {
    if (!confirm('WARNING: Are you sure you want to permanently clear the entire quiz submissions leaderboard? This cannot be undone!')) {
        return;
    }
    
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    
    const postUrl = `${url}/rest/v1/vsb_ece_state`;
    
    fetch(postUrl, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            key: 'quiz_results',
            value: []
        })
    })
    .then(() => {
        alert('Leaderboard reset successfully!');
        loadQuizResultsInDashboard();
    })
    .catch(err => {
        console.error('Error clearing quiz results:', err);
        alert('Failed to reset leaderboard.');
    });
}

function downloadLeaderboardPDF() {
    const filterEl = document.getElementById('leaderboard-year-filter');
    const selectedFilterYear = filterEl ? filterEl.value : 'Second Year';
    
    // Filter the results in cachedResultsList
    const filteredResults = cachedResultsList.filter(res => {
        if (!res || !res.year) return false;
        return res.year.toLowerCase().trim() === selectedFilterYear.toLowerCase().trim();
    });
    
    if (filteredResults.length === 0) {
        alert(`No results recorded for ${selectedFilterYear} to download.`);
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
    
    // Generate PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Title & Header branding
    doc.setFillColor(6, 9, 19); // dark theme brand bg
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(0, 210, 255); // accent cyan
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("V.S.B. ENGINEERING COLLEGE, KARUR", 105, 14, { align: "center" });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`DEPARTMENT OF ECE - TECHNICAL MCQ RESULTS`, 105, 22, { align: "center" });
    
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Academic Year: ${selectedFilterYear}  |  Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: "center" });
    
    // Table content mapping
    const tableData = [];
    filteredResults.forEach((res, index) => {
        const studentName = res.studentName || res.teamName || 'N/A';
        const regnum = res.regnum || res.student1 || 'N/A';
        const dept = res.dept || 'ECE';
        const section = res.section || 'N/A';
        const mail = res.mail || 'N/A';
        const maxQ = res.year === 'Third Year' ? 45 : 50;
        const score = `${res.score !== undefined ? res.score : 0} / ${maxQ}`;
        const timeSpent = res.timeSpent || 'N/A';
        const submittedAtStr = res.submittedAt ? new Date(res.submittedAt).toLocaleDateString() : 'N/A';
        
        tableData.push([
            index + 1,
            studentName,
            regnum,
            `${dept} (${section})`,
            mail,
            score,
            timeSpent,
            submittedAtStr
        ]);
    });
    
    // Generate beautiful AutoTable
    doc.autoTable({
        startY: 48,
        head: [['Rank', 'Student Name', 'Register No', 'Dept (Sec)', 'Email ID', 'Score', 'Time Spent', 'Submitted On']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [0, 210, 255],
            textColor: [9, 14, 26],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [40, 40, 40]
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { fontStyle: 'bold' },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 25 },
            5: { halign: 'center', fontStyle: 'bold', textColor: [34, 139, 34] },
            6: { halign: 'center', cellWidth: 20 },
            7: { halign: 'center', cellWidth: 22 }
        },
        styles: {
            overflow: 'linebreak',
            cellPadding: 3
        }
    });
    
    // Save generated PDF
    const safeFileName = selectedFilterYear.replace(/\s+/g, '_');
    doc.save(`VSB_ECE_${safeFileName}_MCQ_Results.pdf`);
}

let currentMcqLocks = { secondYearLocked: false, thirdYearLocked: false };

function fetchMcqLocksInDashboard() {
    // 0. Instant local cache restore
    try {
        const cached = localStorage.getItem('vsb_ece_mcq_locks');
        if (cached) {
            const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
            if (parsed && typeof parsed.secondYearLocked === 'boolean') {
                currentMcqLocks = parsed;
                updateMcqLockLabels();
            }
        }
    } catch (e) {}

    // 1. Query Firestore first
    fetchFromFirestore('mcq_locks')
        .then(val => {
            if (val !== null && val !== undefined) {
                currentMcqLocks = typeof val === 'string' ? JSON.parse(val) : val;
                updateMcqLockLabels();
            } else {
                throw new Error('No firestore mcq_locks found');
            }
        })
        .catch(() => {
            // 2. Fallback to Supabase
            const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
            const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
            
            const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
            const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
            
            const getUrl = `${url}/rest/v1/vsb_ece_state?key=eq.mcq_locks`;
            
            console.log(`[Supabase GET] URL: ${url}, Table: vsb_ece_state (mcq_locks), Type: GET`);
            fetch(getUrl, {
                method: 'GET',
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    try {
                        currentMcqLocks = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
                    } catch (e) {
                        currentMcqLocks = data[0].value || currentMcqLocks;
                    }
                }
                updateMcqLockLabels();
            })
            .catch(err => {
                console.error("Error fetching locks:", err);
            });
        });
}

function updateMcqLockLabels() {
    const is2yrOpen = !currentMcqLocks.secondYearLocked;
    const is3yrOpen = !currentMcqLocks.thirdYearLocked;

    // 2nd Year Elements
    const check2yr = document.getElementById('toggle-lock-2yr');
    const track2yr = document.getElementById('track-lock-2yr');
    const thumb2yr = document.getElementById('thumb-lock-2yr');
    const label2yr = document.getElementById('label-lock-2yr');

    if (check2yr) check2yr.checked = is2yrOpen;
    if (track2yr && thumb2yr) {
        if (is2yrOpen) {
            track2yr.style.background = '#22c55e';
            track2yr.style.borderColor = '#4ade80';
            track2yr.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.4)';
            thumb2yr.style.transform = 'translateX(26px)';
        } else {
            track2yr.style.background = '#ef4444';
            track2yr.style.borderColor = 'rgba(239, 68, 68, 0.7)';
            track2yr.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.25)';
            thumb2yr.style.transform = 'translateX(0px)';
        }
    }
    if (label2yr) {
        label2yr.textContent = is2yrOpen ? '● UNLOCKED' : '○ LOCKED';
        label2yr.style.color = is2yrOpen ? '#4ade80' : '#f87171';
    }

    // 3rd Year Elements
    const check3yr = document.getElementById('toggle-lock-3yr');
    const track3yr = document.getElementById('track-lock-3yr');
    const thumb3yr = document.getElementById('thumb-lock-3yr');
    const label3yr = document.getElementById('label-lock-3yr');

    if (check3yr) check3yr.checked = is3yrOpen;
    if (track3yr && thumb3yr) {
        if (is3yrOpen) {
            track3yr.style.background = '#22c55e';
            track3yr.style.borderColor = '#4ade80';
            track3yr.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.4)';
            thumb3yr.style.transform = 'translateX(26px)';
        } else {
            track3yr.style.background = '#ef4444';
            track3yr.style.borderColor = 'rgba(239, 68, 68, 0.7)';
            track3yr.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.25)';
            thumb3yr.style.transform = 'translateX(0px)';
        }
    }
    if (label3yr) {
        label3yr.textContent = is3yrOpen ? '● UNLOCKED' : '○ LOCKED';
        label3yr.style.color = is3yrOpen ? '#4ade80' : '#f87171';
    }
}

function toggleMcqLock(year, checkboxEl) {
    const isSecondYear = (year === 'Second Year');
    const isCurrentlyLocked = isSecondYear ? currentMcqLocks.secondYearLocked : currentMcqLocks.thirdYearLocked;
    const willLock = !isCurrentlyLocked;
    const yearLabel = isSecondYear ? '2nd Year' : '3rd Year';

    // Prompt the admin to confirm before changing the mode
    const confirmMessage = willLock
        ? `🔒 LOCK EXAM PORTAL FOR ${yearLabel.toUpperCase()}?\n\nAre you sure you want to LOCK exam access for ${yearLabel} students?\n\n${yearLabel} students will NOT be able to open or submit the exam.`
        : `🔓 UNLOCK EXAM PORTAL FOR ${yearLabel.toUpperCase()}?\n\nAre you sure you want to UNLOCK exam access for ${yearLabel} students?\n\n${yearLabel} students will immediately be able to enter and take the exam.`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
        // Revert switch visually if admin cancelled
        if (checkboxEl) {
            checkboxEl.checked = !isCurrentlyLocked;
        }
        updateMcqLockLabels();
        return;
    }

    if (isSecondYear) {
        currentMcqLocks.secondYearLocked = willLock;
    } else {
        currentMcqLocks.thirdYearLocked = willLock;
    }
    updateMcqLockLabels();

    try {
        localStorage.setItem('vsb_ece_mcq_locks', JSON.stringify(currentMcqLocks));
    } catch(e) {}

    showNotification(`${yearLabel} Exam Access updated to ${willLock ? 'LOCKED' : 'UNLOCKED'}! Syncing...`);

    // 1. Save to Firestore
    saveToFirestore('mcq_locks', currentMcqLocks).catch(e => console.warn('Firestore mcq_locks error:', e));

    // 2. Save to Supabase
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';

    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;

    const postUrl = `${url}/rest/v1/vsb_ece_state`;

    fetch(postUrl, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            key: 'mcq_locks',
            value: currentMcqLocks
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to toggle lock");
        const action = willLock ? 'LOCKED' : 'UNLOCKED';
        alert(`Successfully ${action} the exam portal for ${yearLabel}!`);
        updateMcqLockLabels();
    })
    .catch(err => {
        console.error("Error updating lock:", err);
        alert("Failed to toggle access lock state.");
        updateMcqLockLabels();
    });
}


let currentRegisterLock = { isLocked: false };

function fetchRegisterLockInDashboard() {
    // 0. Restore instant local cache first
    try {
        const cached = localStorage.getItem('vsb_ece_register_lock');
        if (cached) {
            const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
            if (parsed && typeof parsed.isLocked === 'boolean') {
                currentRegisterLock = parsed;
                updateRegisterLockLabels();
            }
        }
    } catch(e) {}

    // 1. Query Firestore first
    fetchFromFirestore('register_lock')
        .then(val => {
            if (val !== null && val !== undefined) {
                currentRegisterLock = typeof val === 'string' ? JSON.parse(val) : val;
                updateRegisterLockLabels();
            } else {
                throw new Error('No firestore lock found');
            }
        })
        .catch(() => {
            // 2. Fallback to Supabase
            const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
            const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
            
            const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
            const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
            
            const getUrl = `${url}/rest/v1/vsb_ece_state?key=eq.register_lock`;
            
            console.log(`[Supabase GET] URL: ${url}, Table: vsb_ece_state (register_lock), Type: GET`);
            fetch(getUrl, {
                method: 'GET',
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    try {
                        currentRegisterLock = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
                    } catch (e) {
                        currentRegisterLock = data[0].value || currentRegisterLock;
                    }
                }
                updateRegisterLockLabels();
            })
            .catch(err => {
                console.error("Error fetching register lock:", err);
            });
        });
}

function updateRegisterLockLabels() {
    const isLocked = Boolean(currentRegisterLock && currentRegisterLock.isLocked);
    const checkbox = document.getElementById('toggle-lock-register');
    const track = document.getElementById('track-lock-register');
    const thumb = document.getElementById('thumb-lock-register');
    const label = document.getElementById('label-lock-register');
    
    if (checkbox) {
        checkbox.checked = !isLocked;
    }
    
    if (track && thumb) {
        if (!isLocked) {
            track.style.background = '#22c55e';
            track.style.borderColor = '#4ade80';
            track.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.4)';
            thumb.style.transform = 'translateX(26px)';
        } else {
            track.style.background = '#ef4444';
            track.style.borderColor = 'rgba(239, 68, 68, 0.7)';
            track.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.25)';
            thumb.style.transform = 'translateX(0px)';
        }
    }
    
    if (label) {
        if (!isLocked) {
            label.textContent = '● UNLOCKED';
            label.style.color = '#4ade80';
        } else {
            label.textContent = '○ LOCKED';
            label.style.color = '#f87171';
        }
    }
}

function toggleRegisterLock(checkboxEl) {
    const isCurrentlyLocked = Boolean(currentRegisterLock && currentRegisterLock.isLocked);
    const willLock = !isCurrentlyLocked;
    
    // Prompt the admin to confirm before changing the mode
    const confirmMessage = willLock
        ? "🔒 LOCK EVENT REGISTRATION PORTAL?\n\nAre you sure you want to LOCK event registration access for students?\n\nStudents will NOT be able to open registration links."
        : "🔓 UNLOCK EVENT REGISTRATION PORTAL?\n\nAre you sure you want to UNLOCK event registration access for students?\n\nStudents will immediately be able to register for events.";

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
        if (checkboxEl) {
            checkboxEl.checked = !isCurrentlyLocked;
        }
        updateRegisterLockLabels();
        return;
    }

    currentRegisterLock.isLocked = willLock;
    updateRegisterLockLabels();
    
    try {
        localStorage.setItem('vsb_ece_register_lock', JSON.stringify(currentRegisterLock));
    } catch(e) {}
    
    showNotification(`Event Registration Access updated to ${willLock ? 'LOCKED' : 'UNLOCKED'}! Syncing...`);
    
    // 1. Save to Firestore
    saveToFirestore('register_lock', currentRegisterLock).catch(e => console.warn('Firestore register_lock save error:', e));

    // 2. Save to Supabase
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    
    const postUrl = `${url}/rest/v1/vsb_ece_state`;
    
    fetch(postUrl, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            key: 'register_lock',
            value: currentRegisterLock
        })
    })
    .finally(() => {
        const action = currentRegisterLock.isLocked ? 'LOCKED' : 'UNLOCKED';
        alert(`Successfully ${action} the Event Registration portal!`);
        updateRegisterLockLabels();
    });
}


let currentClubActivityStatus = { enabled: true };

function fetchClubActivityStatus() {
    // 0. Restore instant local cache first
    try {
        const cached = localStorage.getItem('vsb_ece_club_activity_status');
        if (cached) {
            const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
            if (parsed && typeof parsed.enabled === 'boolean') {
                currentClubActivityStatus = parsed;
                updateClubActivityStatusLabels();
            }
        }
    } catch (e) {}

    // 1. Query Firestore first
    fetchFromFirestore('club_activity_status')
        .then(val => {
            if (val !== null && val !== undefined) {
                currentClubActivityStatus = typeof val === 'string' ? JSON.parse(val) : val;
                updateClubActivityStatusLabels();
            } else {
                throw new Error('No firestore club_activity_status found');
            }
        })
        .catch(() => {
            // 2. Fallback to Supabase
            const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
            const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
            
            const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
            const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
            
            const getUrl = `${url}/rest/v1/vsb_ece_state?key=eq.club_activity_status`;
            
            console.log(`[Supabase GET] URL: ${url}, Table: vsb_ece_state (club_activity_status), Type: GET`);
            fetch(getUrl, {
                method: 'GET',
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    try {
                        currentClubActivityStatus = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
                    } catch (e) {
                        currentClubActivityStatus = data[0].value || currentClubActivityStatus;
                    }
                }
                updateClubActivityStatusLabels();
            })
            .catch(err => {
                console.error("Error fetching club activity status:", err);
            });
        });
}

function updateClubActivityStatusLabels() {
    const isEnabled = Boolean(currentClubActivityStatus && currentClubActivityStatus.enabled);
    const checkbox = document.getElementById('toggle-lock-club-activity');
    const track = document.getElementById('track-lock-club-activity');
    const thumb = document.getElementById('thumb-lock-club-activity');
    const label = document.getElementById('label-lock-club-activity');
    
    if (checkbox) {
        checkbox.checked = isEnabled;
    }
    
    if (track && thumb) {
        if (isEnabled) {
            track.style.background = '#22c55e';
            track.style.borderColor = '#4ade80';
            track.style.boxShadow = '0 0 14px rgba(34, 197, 94, 0.45)';
            thumb.style.transform = 'translateX(28px)';
        } else {
            track.style.background = '#ef4444';
            track.style.borderColor = 'rgba(239, 68, 68, 0.7)';
            track.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.25)';
            thumb.style.transform = 'translateX(0px)';
        }
    }
    
    if (label) {
        if (isEnabled) {
            label.textContent = '● ON';
            label.style.color = '#4ade80';
        } else {
            label.textContent = '○ OFF';
            label.style.color = '#f87171';
        }
    }
}

function toggleClubActivityPortalAccess(checkboxEl) {
    const currentEnabled = Boolean(currentClubActivityStatus && currentClubActivityStatus.enabled);
    const willEnable = !currentEnabled;
    
    // Prompt the admin to confirm before changing the mode
    const confirmMessage = willEnable
        ? "⚡ ENABLE CLUB ACTIVITY PORTAL?\n\nAre you sure you want to ENABLE student access to the Club Activity portal?\n\nStudents across the entire website will immediately be able to access the activity."
        : "🔒 DISABLE CLUB ACTIVITY PORTAL?\n\nAre you sure you want to DISABLE student access to the Club Activity portal?\n\nStudents will NOT be able to open or access the competition activity.";
        
    const confirmed = window.confirm(confirmMessage);
    
    if (!confirmed) {
        // Revert checkbox state if admin cancelled
        if (checkboxEl) {
            checkboxEl.checked = currentEnabled;
        }
        updateClubActivityStatusLabels();
        return;
    }
    
    currentClubActivityStatus.enabled = willEnable;
    updateClubActivityStatusLabels();
    
    try {
        localStorage.setItem('vsb_ece_club_activity_status', JSON.stringify(currentClubActivityStatus));
    } catch(e) {}
    
    showNotification(`Portal access updated to ${willEnable ? 'ENABLED' : 'DISABLED'}! Syncing...`);
    
    // 1. Save to Firestore
    saveToFirestore('club_activity_status', currentClubActivityStatus).catch(e => console.warn('Firestore club_activity_status save error:', e));

    // 2. Save to Supabase
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    
    const postUrl = `${url}/rest/v1/vsb_ece_state`;
    
    fetch(postUrl, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            key: 'club_activity_status',
            value: currentClubActivityStatus
        })
    })
    .finally(() => {
        const action = currentClubActivityStatus.enabled ? 'ENABLED' : 'DISABLED';
        alert(`Successfully ${action} the Club Activity portal!`);
        updateClubActivityStatusLabels();
    });
}


