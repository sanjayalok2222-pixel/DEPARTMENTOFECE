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
        size: 0.008, // slightly larger, clearer particles
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
            const cardRect = card.getBoundingClientRect();
            const cardWidth = cardRect.width;
            const cardHeight = cardRect.height;
            
            const mouseX = e.clientX - cardRect.left - cardWidth / 2;
            const mouseY = e.clientY - cardRect.top - cardHeight / 2;
            
            // Highly smooth tilt calculation (up to 14 degrees max)
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

// Close modals on clicking backdrop
window.onclick = function(event) {
    if (event.target === clubModal) {
        closeClubModal();
    }
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
