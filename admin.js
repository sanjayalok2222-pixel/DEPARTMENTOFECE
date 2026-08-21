// === 1. Secure Authentication & Tab Navigation ===
let indexDoc = null; // Background parsed DOM document of index.html
let activeTab = 'overview';
let cachedResultsList = [];

// Check persistent admin session on load
let globalSupaUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
let globalSupaKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';

// Check persistent admin session on load
window.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Supabase configuration from local config.json securely
    fetch('/get-config')
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
}


// Admin Authentication Login via Supabase Auth REST
async function handleCmsLogin(event) {
    event.preventDefault();
    const username = document.getElementById('cms-username').value.trim();
    const password = document.getElementById('cms-password').value.trim();

    // Use current form values or global variables
    let supaUrl = globalSupaUrl || (document.getElementById('field-supabase-url') ? document.getElementById('field-supabase-url').value.trim() : '');
    const supaKey = globalSupaKey || (document.getElementById('field-supabase-key') ? document.getElementById('field-supabase-key').value.trim() : '');

    // Clean trailing slash from URL path
    if (supaUrl.endsWith('/')) {
        supaUrl = supaUrl.slice(0, -1);
    }

    if (supaUrl && supaKey) {
        try {
            showNotification('Authenticating securely with Supabase Auth...');
            // Authenticate directly using Supabase Auth REST endpoint (No hardcoded credentials!)
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
                
                document.getElementById('login-overlay').style.display = 'none';
                document.getElementById('dashboard-container').style.display = 'flex';
                
                showNotification('Authenticated securely via Supabase Auth!');
                loadIndexHtmlDocument();
            } else {
                let errorMsg = 'Invalid email or password.';
                try {
                    const errData = await response.json();
                    errorMsg = errData.error_description || errData.error || errorMsg;
                } catch (e) {
                    errorMsg = `Server returned status ${response.status} (${response.statusText})`;
                }
                alert('Authentication failed: ' + errorMsg);
            }
        } catch (err) {
            alert('Supabase Auth error: ' + err.message);
        }
    } else {
        alert('Supabase connection is not configured! Please expand "Database Connection Settings" below to connect your project.');
    }
}

// Secure Logout
function handleCmsLogout() {
    localStorage.removeItem('vsb_ece_is_admin');
    localStorage.removeItem('vsb_ece_auth_token');
    window.location.reload();
}

function switchCmsTab(tabId) {
    // No-op - All panels are visible on a single page
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
        })
        .catch(err => {
            console.error(err);
            alert('CMS Loader Error: Make sure your Python server is running on http://localhost:8000 and you open admin.html from that server origin.');
        });
}

function pullStateFromSupabaseAndPopulate() {
    // If Supabase key/url are not set yet, wait for browser to load config
    setTimeout(() => {
        if (!globalSupaUrl || !globalSupaKey) {
            populateCmsForms();
            return;
        }

        const selectUrl = `${globalSupaUrl.trim()}/rest/v1/vsb_ece_state?key=eq.site_data`;
        fetch(selectUrl, {
            method: 'GET',
            headers: {
                'apikey': globalSupaKey.trim(),
                'Authorization': `Bearer ${globalSupaKey.trim()}`
            }
        })
        .then(res => {
            if (!res.ok) throw new Error('Could not query Supabase state');
            return res.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                const state = data[0].value;
                applyStateToCmsDoc(state);
                showNotification('Merged live content from Supabase cloud database!');
            }
            populateCmsForms();
        })
        .catch(err => {
            console.warn('Could not sync live updates on load. Using base HTML data:', err);
            populateCmsForms();
        });
    }, 400); // Small delay to allow config DOM fetch to complete
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

    // Updates Quick Stats overview counters
    document.getElementById('stat-flyers-count').textContent = document.querySelectorAll('.cms-poster-item-card').length;
    document.getElementById('stat-files-count').textContent = document.querySelectorAll('.cms-download-item-card').length;

    // Load Quiz Results and lock statuses on load
    loadQuizResultsInDashboard();
    fetchMcqLocksInDashboard();
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
                            <input type="text" class="form-control cms-poster-image-url" style="flex-grow:1;" value="${imgUrl}" placeholder="Paste direct image URL" onchange="previewCmsPosterLinkUrl(${index}, this)">
                            <label class="btn-upload-file" style="margin:0; padding: 0.6rem 1rem;">
                                📤 Upload
                                <input type="file" accept="image/*" style="display:none;" onchange="handleCmsPosterUploader(${index}, event)">
                            </label>
                        </div>
                    </div>
                </div>
                <button class="btn-delete-list-item" title="Delete Slide" onclick="cmsDeletePosterCardSlot(${index})">🗑️</button>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
}

function handleCmsPosterUploader(index, event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById(`poster-preview-img-${index}`).src = e.target.result;
        // Clear manual URL text input
        const input = document.querySelectorAll('.cms-poster-item-card')[index].querySelector('.cms-poster-image-url');
        if (input) input.value = '';
    };
    reader.readAsDataURL(file);
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
                        <input type="text" class="form-control cms-poster-image-url" style="flex-grow:1;" value="assets/ece-logo.png" onchange="previewCmsPosterLinkUrl(${index}, this)">
                        <label class="btn-upload-file" style="margin:0; padding: 0.6rem 1rem;">
                            📤 Upload
                            <input type="file" accept="image/*" style="display:none;" onchange="handleCmsPosterUploader(${index}, event)">
                        </label>
                    </div>
                </div>
            </div>
            <button class="btn-delete-list-item" title="Delete Slide" onclick="cmsDeletePosterCardSlot(${index})">🗑️</button>
        </div>
    `;
    listContainer.insertAdjacentHTML('afterbegin', itemHtml);
    reindexCmsPosters();
}


// B. Downloads directory list manager
// B. Downloads directory list manager
function populateDownloadsCmsList() {
    const listContainer = document.getElementById('cms-downloads-list');
    listContainer.innerHTML = '';

    const cards = indexDoc.querySelectorAll('#download-grid-container .download-card');
    cards.forEach((card, index) => {
        const title = card.querySelector('.file-details h4').innerText.trim();
        const meta = card.querySelector('.file-details p').innerText.trim();
        const dlBtn = card.querySelector('.btn-download');
        const dlUrl = dlBtn ? dlBtn.getAttribute('href') : '';
        const isCustom = card.classList.contains('custom-dl-card');

        const itemHtml = `
            <div class="cms-list-item cms-download-item-card" data-index="${index}" data-custom="${isCustom ? 'true' : 'false'}">
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
                            <input type="text" class="form-control cms-download-url" id="cms-dl-url-${index}" style="flex-grow:1;" value="${dlUrl}" placeholder="Paste raw hyperlink or choose file">
                            <label class="btn-upload-file" style="margin:0; padding: 0.6rem 1rem;">
                                📤 Attach
                                <input type="file" style="display:none;" onchange="handleCmsDownloadFileUploader(${index}, event)">
                            </label>
                        </div>
                    </div>
                </div>
                <button class="btn-delete-list-item" title="Delete Card" onclick="cmsDeleteDownloadCardSlot(${index})">🗑️</button>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
}

function handleCmsDownloadFileUploader(index, event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById(`cms-dl-url-${index}`).value = e.target.result; // Stores file Base64 target
        showNotification(`File attachment '${file.name}' converted successfully.`);
    };
    reader.readAsDataURL(file);
}

function cmsDeleteDownloadCardSlot(index) {
    if (confirm('Are you sure you want to delete this download document slot?')) {
        const cards = indexDoc.querySelectorAll('#download-grid-container .download-card');
        if (cards[index]) {
            cards[index].remove();
            populateDownloadsCmsList();
            showNotification('Download card removed from DOM memory.');
        }
    }
}

function cmsAddDownloadCardSlot() {
    const listContainer = document.getElementById('cms-downloads-list');
    const index = document.querySelectorAll('.cms-download-item-card').length;

    const itemHtml = `
        <div class="cms-list-item cms-download-item-card new-item" data-index="${index}" data-custom="true">
            <div style="font-size: 2.2rem; margin-right: 0.5rem;">📁</div>
            <div class="cms-list-fields">
                <div class="form-group" style="margin-bottom:0.5rem;">
                    <label>File Display Name</label>
                    <input type="text" class="form-control cms-download-title" value="New ECE Download Resource">
                </div>
                <div class="form-group" style="margin-bottom:0.5rem;">
                    <label>Meta Details (PDF/Excel Size)</label>
                    <input type="text" class="form-control cms-download-meta" value="Official PDF Document • 150 KB">
                </div>
                <div class="form-group" style="grid-column: span 2; margin-bottom: 0;">
                    <label>Attached Document Destination</label>
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                        <input type="text" class="form-control cms-download-url" id="cms-dl-url-${index}" style="flex-grow:1;" value="#" placeholder="Paste raw hyperlink or choose file">
                        <label class="btn-upload-file" style="margin:0; padding: 0.6rem 1rem;">
                            📤 Attach
                            <input type="file" style="display:none;" onchange="handleCmsDownloadFileUploader(${index}, event)">
                        </label>
                    </div>
                </div>
            </div>
            <button class="btn-delete-list-item" title="Delete Card" onclick="this.closest('.cms-list-item').remove()">🗑️</button>
        </div>
    `;
    listContainer.insertAdjacentHTML('beforeend', itemHtml);
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

        const roleEl = card.querySelector('.coord-role');
        const role = roleEl ? roleEl.innerText.trim() : '';

        const yearEl = card.querySelector('.coord-year');
        const year = yearEl ? yearEl.innerText.trim() : '';

        const imgEl = card.querySelector('.coord-avatar img');
        const emojiEl = card.querySelector('.coord-avatar .coord-initials');

        const initialsText = emojiEl ? emojiEl.innerText.trim() : 'SC';
        const imgUrl = imgEl ? imgEl.getAttribute('src') : '';
        const hasPhoto = imgEl && imgEl.style.display === 'block';

        addCoordinatorSlotMarkup(id, name, role, year, initialsText, imgUrl, hasPhoto);
    });
}

function addCoordinatorSlotMarkup(id, name='', role='', year='', initialsText='SC', imgUrl='', hasPhoto=false) {
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
                <label>Coordinator Role</label>
                <input type="text" class="form-control cms-coord-role" value="${role}">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Year Group</label>
                <input type="text" class="form-control cms-coord-year" value="${year}">
            </div>
            <div class="form-group" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:center;">
                <label>Profile photo controls</label>
                <div style="display:flex; gap:0.5rem;">
                    <label class="btn-upload-file" style="margin:0;">
                        📤 Photo
                        <input type="file" accept="image/*" style="display:none;" onchange="handleCmsPhotoUploader(event, 'coord-img-${id}', 'coord-emoji-${id}', 'preview-coord-photo-${id}', 'preview-coord-initials-${id}')">
                    </label>
                    <button class="btn-clear-photo" style="padding:0.4rem 1rem;" onclick="clearCmsProfilePhoto('coord-img-${id}', 'coord-emoji-${id}', 'preview-coord-photo-${id}', 'preview-coord-initials-${id}')">🗑️ Reset</button>
                </div>
            </div>
        </div>
        
        <button type="button" class="btn-delete-list-item" title="Delete Coordinator" onclick="this.closest('.cms-list-item').remove()" style="position: absolute; top: 1.25rem; right: 1.25rem;">🗑️</button>
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
    addCoordinatorSlotMarkup(nextId, '', 'Student Coordinator', 'III Year ECE', 'SC', '', false);
}


// === 5. Image & File Upload Helpers ===
function handleCmsPhotoUploader(event, targetImgId, targetEmojiId, previewImgId, previewInitialsId) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds the 15MB limit. Please upload a file smaller than 15MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        // Update dashboard preview
        const pImg = document.getElementById(previewImgId);
        const pInit = document.getElementById(previewInitialsId);
        if (pImg && pInit) {
            pImg.src = e.target.result;
            pImg.style.display = 'block';
            pInit.style.display = 'none';
        }

        // Write directly to background parsed DOM document elements
        const docImg = indexDoc.getElementById(targetImgId);
        const docEmoji = indexDoc.getElementById(targetEmojiId);
        if (docImg && docEmoji) {
            docImg.src = e.target.result;
            docImg.style.display = 'block';
            docEmoji.style.display = 'none';
        }
        showNotification('Profile photo processed and saved in DOM memory!');
    };
    reader.readAsDataURL(file);
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
    // Save dynamic Activity challenges rounds list
    reconstructActivityRoundsCmsDom();

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

    // 5. Update Supabase variables in memory and localStorage
    const supaUrl = document.getElementById('field-supabase-url').value.trim();
    const supaKey = document.getElementById('field-supabase-key').value.trim();
    
    globalSupaUrl = supaUrl;
    globalSupaKey = supaKey;

    localStorage.setItem('vsb_ece_supabase_url', supaUrl);
    localStorage.setItem('vsb_ece_supabase_key', supaKey);

    // Secure: Strip keys from index.html body attributes to prevent exposing secrets in public repo
    indexDoc.body.setAttribute('data-supabase-url', '');
    indexDoc.body.setAttribute('data-supabase-key', '');

    // 6. Serialize updated DOM parser to HTML string
    const serializedHtml = "<!DOCTYPE html>\n" + indexDoc.documentElement.outerHTML;

    // 7. Extract state JSON object to upsert to Supabase database
    const stateObj = extractCmsJsonState();

    showNotification('Serializing DOM and publishing edits...');

    // 8. Save config to server config.json privately (so it's ignored by Git)
    const saveConfigPromise = fetch('/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabase_url: supaUrl, supabase_key: supaKey })
    }).catch(err => console.warn('Could not save credentials to local config.json file.'));

    // 9. Make HTTP POST request to Python Local CMS Server (Saves to index.html disk)
    const localPublishPromise = fetch('/save-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: serializedHtml })
    }).catch(err => {
        console.warn('Local CMS Python server is offline. Publishing updates directly to Supabase cloud database.');
    });

    // 10. Upsert state JSON to Supabase Cloud REST endpoint
    const cloudPublishPromise = saveCmsToSupabase(supaUrl, supaKey, stateObj);

    Promise.all([saveConfigPromise, localPublishPromise, cloudPublishPromise])
    .then(([localRes, cloudRes]) => {
        let msg = 'Website CMS updates saved successfully!';
        if (cloudRes && cloudRes.ok) {
            msg += ' Supabase live cloud database updated and synchronized!';
        } else if (cloudRes) {
            msg += ' (Supabase sync failed - verify RLS settings or API keys)';
        }
        alert(msg);
        window.location.reload(); // Refresh the CMS forms with the newly updated DOM values
    })
    .catch(err => {
        console.error('Publishing changes exception:', err);
        alert('Error publishing edits. Verify system configuration endpoints.');
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

        const fileIcon = fileUrl.includes('.xlsx') || fileUrl.includes('Excel') ? '📊' : '📄';

        const cardHtml = `
            <div class="download-card tilt-card ${isCustom ? 'custom-dl-card' : ''}">
                <div class="file-info">
                    <div class="file-icon">${fileIcon}</div>
                    <div class="file-details">
                        <h4>${title}</h4>
                        <p>${meta}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <a href="${fileUrl}" download="${title}.pdf" class="btn-download" onclick="showDownloadNotify('${title}')">↓</a>
                    ${isCustom ? `<button class="btn-admin-logout btn-admin-only-inline" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; width: 35px; height: 35px; border-radius: 50%; padding:0; display:none; align-items:center; justify-content:center;" onclick="deleteCustomDownloadCard(this)">🗑️</button>` : ''}
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
        const name = widget.querySelector('.cms-coord-name').value.trim();
        const role = widget.querySelector('.cms-coord-role').value.trim();
        const year = widget.querySelector('.cms-coord-year').value.trim();

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

        const coordHtml = `
            <div class="coord-card tilt-card" id="coord-${id}">
                <div class="coord-avatar" style="overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;">
                    <img id="coord-img-${id}" src="${hasPhoto ? imgUrl : ''}" alt="Coordinator Photo" style="width: 100%; height: 100%; object-fit: cover; display: ${hasPhoto ? 'block' : 'none'};">
                    <span id="coord-emoji-${id}" class="coord-initials" style="display: ${hasPhoto ? 'none' : 'block'};">${initials}</span>
                    <input type="file" id="admin-coord-upload-${id}" accept="image/*" style="display:none;" onchange="handleCoordPhotoUpload(event, ${id})">
                    <button class="btn-avatar-edit btn-admin-only-inline" onclick="triggerCoordUpload(${id})">✏️</button>
                </div>
                <h4 id="coord-name-${id}">${name}</h4>
                <p class="coord-role" id="coord-role-${id}">${role}</p>
                <p class="coord-year" id="coord-year-${id}">${year}</p>
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

// Save CMS State JSON to Supabase
function saveCmsToSupabase(url, key, state) {
    if (!url || !key) return Promise.resolve(null);
    
    const upsertUrl = `${url.trim()}/rest/v1/vsb_ece_state`;
    return fetch(upsertUrl, {
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
    });
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
        <button type="button" class="btn-admin-logout" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; width: 35px; height: 35px; border-radius: 50%; padding:0; display:flex; align-items:center; justify-content:center; margin-left: 0.5rem;" onclick="this.parentElement.remove()">🗑️</button>
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
        <button type="button" class="btn-admin-logout" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; width: 35px; height: 35px; border-radius: 50%; padding:0; display:flex; align-items:center; justify-content:center; margin-left: 0.5rem;" onclick="this.parentElement.remove()">🗑️</button>
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
        <button type="button" class="btn-admin-logout" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; width: 35px; height: 35px; border-radius: 50%; padding:0; display:flex; align-items:center; justify-content:center; margin-left: 0.5rem;" onclick="this.parentElement.remove()">🗑️</button>
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

// D. Manage Club Activity Challenges & Rounds
function populateActivityRoundsCmsList() {
    const list = document.getElementById('cms-activity-rounds-list');
    if (!list) return;
    list.innerHTML = '';
    const container = indexDoc.getElementById('club-rounds-container');
    if (!container) return;
    const items = container.querySelectorAll('.activity-round-item');
    items.forEach((item, index) => {
        const title = item.getAttribute('data-title') || 'Round';
        const type = item.getAttribute('data-type') || 'link';
        const url = item.getAttribute('data-url') || '';
        const cTitle = item.querySelector('.challenge-title')?.innerText.trim() || '';
        const cDesc = item.querySelector('.challenge-desc')?.innerText.trim() || '';
        const cCode = item.querySelector('.challenge-code')?.innerText.trim() || '';
        
        addActivityRoundSlotMarkup(index, title, type, url, cTitle, cDesc, cCode);
    });
}

function addActivityRoundSlotMarkup(index, title='', type='link', url='', cTitle='', cDesc='', cCode='') {
    const list = document.getElementById('cms-activity-rounds-list');
    const div = document.createElement('div');
    div.className = 'cms-list-item cms-activity-round-card';
    div.style = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 8px; margin-bottom: 1rem; position: relative;';
    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; width: calc(100% - 40px);">
            <div class="form-group" style="margin-bottom:0;">
                <label>Round Label / Title</label>
                <input type="text" class="form-control cms-round-title" value="${title}" placeholder="e.g. Round 1 - Play">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Round Type / Action</label>
                <select class="form-control cms-round-type" onchange="toggleCmsRoundFields(this)">
                    <option value="link" ${type === 'link' ? 'selected' : ''}>Redirect External Link</option>
                    <option value="challenge" ${type === 'challenge' ? 'selected' : ''}>Interactive Code Challenge</option>
                </select>
            </div>
        </div>
        
        <!-- Redirect Link Fields -->
        <div class="cms-round-fields-link" style="display: ${type === 'link' ? 'block' : 'none'};">
            <div class="form-group">
                <label>Redirection URL</label>
                <input type="text" class="form-control cms-round-url" value="${url}" placeholder="e.g. https://...">
            </div>
        </div>
        
        <!-- Code Challenge Fields -->
        <div class="cms-round-fields-challenge" style="display: ${type === 'challenge' ? 'block' : 'none'};">
            <div class="form-group">
                <label>Challenge Card Header Title</label>
                <input type="text" class="form-control cms-round-ctitle" value="${cTitle}" placeholder="e.g. 💻 Arduino Uno Code Challenge">
            </div>
            <div class="form-group">
                <label>Challenge Card Instructions Text</label>
                <textarea class="form-control cms-round-cdesc" placeholder="Enter instructions...">${cDesc}</textarea>
            </div>
            <div class="form-group">
                <label>Option D Correct Arduino Code Snippet</label>
                <textarea class="form-control cms-round-ccode" style="font-family: monospace; min-height: 120px;" placeholder="Paste Arduino code...">${cCode}</textarea>
            </div>
            <div class="form-group">
                <label>Simulation Platform URL</label>
                <input type="text" class="form-control cms-round-url-challenge" value="${url}" placeholder="e.g. Wokwi URL https://...">
            </div>
        </div>
        
        <button type="button" class="btn-delete-list-item" title="Delete Round" onclick="this.closest('.cms-list-item').remove()" style="position: absolute; top: 1.25rem; right: 1.25rem;">🗑️</button>
    `;
    list.appendChild(div);
}

function toggleCmsRoundFields(select) {
    const card = select.closest('.cms-activity-round-card');
    const linkDiv = card.querySelector('.cms-round-fields-link');
    const challengeDiv = card.querySelector('.cms-round-fields-challenge');
    
    if (select.value === 'link') {
        linkDiv.style.display = 'block';
        challengeDiv.style.display = 'none';
    } else {
        linkDiv.style.display = 'none';
        challengeDiv.style.display = 'block';
    }
}

function cmsAddActivityRoundSlot() {
    addActivityRoundSlotMarkup(Date.now());
}

function reconstructActivityRoundsCmsDom() {
    const container = indexDoc.getElementById('club-rounds-container');
    if (!container) return;
    container.innerHTML = '';
    
    const cards = document.querySelectorAll('#cms-activity-rounds-list .cms-activity-round-card');
    cards.forEach(card => {
        const title = card.querySelector('.cms-round-title').value.trim();
        const type = card.querySelector('.cms-round-type').value.trim();
        let url = '';
        if (type === 'link') {
            url = card.querySelector('.cms-round-url').value.trim();
        } else {
            url = card.querySelector('.cms-round-url-challenge').value.trim();
        }
        const cTitle = card.querySelector('.cms-round-ctitle').value.trim();
        const cDesc = card.querySelector('.cms-round-cdesc').value.trim();
        const cCode = card.querySelector('.cms-round-ccode').value.trim();
        
        const itemHtml = `
            <div class="activity-round-item" data-title="${title}" data-type="${type}" data-url="${url}">
                <div class="challenge-title">${cTitle}</div>
                <div class="challenge-desc">${cDesc}</div>
                <pre class="challenge-code">${cCode}</pre>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });
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
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.75rem; font-weight: bold; color: ${rank === 0 ? '#ffd700' : rank === 1 ? '#c0c0c0' : rank === 2 ? '#cd7f32' : 'var(--text-secondary)'};">#${rank + 1}</td>
                    <td style="padding: 0.75rem; font-weight: bold; color: var(--accent-cyan);">${studentName}</td>
                    <td style="padding: 0.75rem; font-family: monospace;">${regnum}</td>
                    <td style="padding: 0.75rem;">${dept} / ${res.year} (${sec})</td>
                    <td style="padding: 0.75rem; font-size: 0.85rem; color: var(--text-secondary);">${mail}</td>
                    <td style="padding: 0.75rem; font-weight: bold; color: #4ade80;">${res.score} / ${maxQ}</td>
                    <td style="padding: 0.75rem; font-family: monospace;">${res.timeSpent || 'N/A'}</td>
                    <td style="padding: 0.75rem; font-size: 0.8rem; color: var(--text-secondary);">${dateStr}</td>
                    <td style="padding: 0.75rem;">
                        <button type="button" class="btn-preview" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;" onclick="openEditResultModal(${originalIndex})">✏️ Edit</button>
                        <button type="button" class="btn-admin-logout" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; margin: 0;" onclick="deleteMcqResult(${originalIndex})">🗑️ Delete</button>
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
    const defaultUrl = 'https://jbzogspalrrahkrthvmh.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impiem9nc3BhbHJyYWhrcnRodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1NjIsImV4cCI6MjEwMDM3NTU2Mn0.b1ndU8lbQKLYF51KhkJ2Rl9IxQ7aTblUQlRN-hoIBEo';
    
    const url = localStorage.getItem('vsb_ece_supabase_url') || defaultUrl;
    const key = localStorage.getItem('vsb_ece_supabase_key') || defaultKey;
    
    const getUrl = `${url}/rest/v1/vsb_ece_state?key=eq.mcq_locks`;
    
    fetch(getUrl, {
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
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
}

function updateMcqLockLabels() {
    const label2yr = document.getElementById('label-lock-2yr');
    const btn2yr = document.getElementById('btn-toggle-lock-2yr');
    const label3yr = document.getElementById('label-lock-3yr');
    const btn3yr = document.getElementById('btn-toggle-lock-3yr');
    
    if (label2yr && btn2yr) {
        if (currentMcqLocks.secondYearLocked) {
            label2yr.textContent = 'LOCKED';
            label2yr.style.color = '#f87171'; // red
            btn2yr.textContent = 'Unlock';
            btn2yr.style.background = '#22c55e'; // green
            btn2yr.style.color = '#fff';
        } else {
            label2yr.textContent = 'UNLOCKED';
            label2yr.style.color = '#4ade80'; // green
            btn2yr.textContent = 'Lock';
            btn2yr.style.background = '#ef4444'; // red
            btn2yr.style.color = '#fff';
        }
    }
    
    if (label3yr && btn3yr) {
        if (currentMcqLocks.thirdYearLocked) {
            label3yr.textContent = 'LOCKED';
            label3yr.style.color = '#f87171'; // red
            btn3yr.textContent = 'Unlock';
            btn3yr.style.background = '#22c55e'; // green
            btn3yr.style.color = '#fff';
        } else {
            label3yr.textContent = 'UNLOCKED';
            label3yr.style.color = '#4ade80'; // green
            btn3yr.textContent = 'Lock';
            btn3yr.style.background = '#ef4444'; // red
            btn3yr.style.color = '#fff';
        }
    }
}

function toggleMcqLock(year) {
    if (year === 'Second Year') {
        currentMcqLocks.secondYearLocked = !currentMcqLocks.secondYearLocked;
    } else {
        currentMcqLocks.thirdYearLocked = !currentMcqLocks.thirdYearLocked;
    }
    
    // Save to Supabase
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
        const action = (year === 'Second Year' ? currentMcqLocks.secondYearLocked : currentMcqLocks.thirdYearLocked) ? 'LOCKED' : 'UNLOCKED';
        alert(`Successfully ${action} the exam portal for ${year}!`);
        updateMcqLockLabels();
    })
    .catch(err => {
        console.error("Error updating lock:", err);
        alert("Failed to toggle access lock state.");
    });
}

