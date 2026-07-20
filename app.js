// Switch tabs in Department Info Section
function switchTab(event, tabId) {
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show the selected tab content and activate the clicked button
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Modal popup controls
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

// Mock Download Event Center
function mockDownload(fileName) {
    alert(`Starting download: ${fileName}\nThe file will download in the background.`);
}

// Close modal if user clicks outside content card
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Dynamic Active Nav Highlighting on Scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 150)) {
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
