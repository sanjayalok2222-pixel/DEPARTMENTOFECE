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

    // Create 3D particles geometry
    starGeo = new THREE.BufferGeometry();
    const particleCount = 1500;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Position coordinates
        posArray[i] = (Math.random() - 0.5) * 5;
        posArray[i+1] = (Math.random() - 0.5) * 5;
        posArray[i+2] = (Math.random() - 0.5) * 5;

        // Color values: gradient of electric blues and cyans
        const r = 0.0;
        const g = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
        const b = 1.0;
        colorArray[i] = r;
        colorArray[i+1] = g;
        colorArray[i+2] = b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Custom material for points
    const starMaterial = new THREE.PointsMaterial({
        size: 0.006,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);

    // Run animation
    animate();
}

// Track mouse positioning to make 3D particles responsive to user cursor
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 100;
    mouseY = (e.clientY - window.innerHeight / 2) / 100;
});

function animate() {
    requestAnimationFrame(animate);

    // Slowly rotate stars in space
    stars.rotation.y += 0.0015;
    stars.rotation.x += 0.0005;

    // Fluid movement based on cursor coordinates
    stars.rotation.y += (mouseX - stars.rotation.y) * 0.05;
    stars.rotation.x += (-mouseY - stars.rotation.x) * 0.05;

    renderer.render(scene, camera);
}

// Handle browser window scaling
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Initialize Three.js on page load
window.addEventListener('DOMContentLoaded', init3DBackground);


// === 2. Interactive 3D Card Hover Tilt Effect ===
const cards = document.querySelectorAll('.tilt-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const cardRect = card.getBoundingClientRect();
        const cardWidth = cardRect.width;
        const cardHeight = cardRect.height;
        
        // Find cursor relative coords inside the element
        const mouseX = e.clientX - cardRect.left - cardWidth / 2;
        const mouseY = e.clientY - cardRect.top - cardHeight / 2;
        
        // Calculate tilt percentages (-15 to 15 degrees max)
        const tiltX = (mouseY / (cardHeight / 2)) * -12;
        const tiltY = (mouseX / (cardWidth / 2)) * 12;

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`;
        card.style.boxShadow = `0 15px 45px rgba(0, 210, 255, 0.25)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.boxShadow = `0 10px 40px rgba(0, 0, 0, 0.55)`;
    });
});


// === 3. Details Navigation Tabs & Table Switching ===
function switchTab(event, tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}


// === 4. Popups Modals ===
const modal = document.getElementById('registerModal');
const modalTitle = document.getElementById('modalEventTitle');

function openRegisterModal(eventName) {
    modalTitle.textContent = `${eventName} Registration`;
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    document.getElementById('registrationForm').reset();
}

function submitRegistration(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    alert(`Thank you, ${name}! Your registration for ${modalTitle.textContent.replace(' Registration', '')} was successful.`);
    closeModal();
}

function mockDownload(fileName) {
    alert(`Starting download: ${fileName}\nThe file will download in the background.`);
}

window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}


// === 5. Dynamic Navigation Link Highlighting ===
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
