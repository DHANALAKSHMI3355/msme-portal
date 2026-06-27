// ==========================
// HERO SLIDER
// ==========================

const slides = document.querySelectorAll(".slide");
let currentSlide = 0;
let slideTimer = null;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
}

function startSlideShow() {
    slideTimer = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 4000);
}

function resetSlideShow() {
    if (slideTimer) {
        clearInterval(slideTimer);
    }
    startSlideShow();
}

showSlide(currentSlide);
startSlideShow();

const prevArrow = document.querySelector(".hero-arrow.prev");
const nextArrow = document.querySelector(".hero-arrow.next");

prevArrow.addEventListener("click", () => {
    showSlide(currentSlide - 1);
    resetSlideShow();
});

nextArrow.addEventListener("click", () => {
    showSlide(currentSlide + 1);
    resetSlideShow();
});


// ==========================
// SEARCH FUNCTION
// ==========================

const searchBtn = document.querySelector(".search-box button");
const searchInput = document.querySelector(".search-box input");

const schemes = [
    "PMEGP",
    "CGTMSE",
    "MUDRA",
    "Stand-Up India",
    "SIDBI Make in India",
    "ASPIRE",
    "SFURTI",
    "ZED Certification",
    "RAMP",
    "National SC-ST Hub",
    "Coir Vikas Yojana",
    "PM Vishwakarma",
    "CLCSS",
    "IIUS",
    "MSME Cluster Development Programme",
    "Technology Upgradation Fund Scheme",
    "Market Development Assistance (MDA)",
    "Incubation Support for MSMEs",
    "Entrepreneurship Skill Development Programme (ESDP)"
];

const categorySchemes = {
    "Loan & Finance": [
        "PMEGP",
        "CGTMSE",
        "MUDRA",
        "Stand-Up India",
        "SIDBI Make in India"
    ],
    "Infrastructure": [
        "IIUS",
        "MSME Cluster Development Programme",
        "Technology Upgradation Fund Scheme",
        "CLCSS"
    ],
    "Skill Development": [
        "ASPIRE",
        "PM Vishwakarma",
        "Entrepreneurship Skill Development Programme (ESDP)"
    ],
    "Innovation": [
        "ZED Certification",
        "Incubation Support for MSMEs",
        "Technology Upgradation Fund Scheme"
    ],
    "Export Support": [
        "RAMP",
        "Market Development Assistance (MDA)",
        "Export Promotion Schemes"
    ],
    "Artisans": [
        "PM Vishwakarma",
        "Coir Vikas Yojana",
        "SFURTI"
    ],
    "Special Support & Inclusion": [
        "National SC-ST Hub",
        "Stand-Up India",
        "Women Entrepreneurship Support"
    ]
};

searchBtn.addEventListener("click", () => {

    const value = searchInput.value.toLowerCase().trim();

    if(value === ""){
        alert("Please enter a scheme name");
        return;
    }

    const result = schemes.filter(scheme =>
        scheme.toLowerCase().includes(value)
    );

    if(result.length > 0){
        alert("Matching Schemes:\n\n" + result.join("\n"));
    }
    else{
        alert("No matching scheme found");
    }

});


// ==========================
// ENTER KEY SEARCH
// ==========================

searchInput.addEventListener("keypress", function(e){

    if(e.key === "Enter"){
        searchBtn.click();
    }

});


// ==========================
// APPLY NOW BUTTON
// ==========================

async function applyScheme(schemeName){

    alert("Apply button clicked");
    
    const response = await fetch('/apply-scheme',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            scheme_name:schemeName
        })
    });

    const result = await response.json();

    alert(result.message);
}

const applyBtn = document.querySelector(".apply-btn");

if(applyBtn){

    applyBtn.addEventListener("click", () => {

        applyScheme("PMEGP");

    });

}


// ==========================
// VIEW SCHEMES BUTTON
// ==========================

const viewBtn =
document.querySelector(".view-btn");

viewBtn.addEventListener("click", () => {

    alert("Opening Schemes Page");

    // Example
    // window.location.href = "schemes.html";

});


// ==========================
// CATEGORY CARD CLICK
// ==========================

const cards = document.querySelectorAll(".card");

cards.forEach(card => {
    card.addEventListener("click", () => {
        const category = card.querySelector("h3").innerText;
        const relatedSchemes = categorySchemes[category] || ["No related scheme list available yet"];

        alert(
            "Category: " + category + "\n\n" +
            "Related MSME schemes:\n• " + relatedSchemes.join("\n• ")
        );
    });
});


// ==========================
// SCHEME DETAILS BUTTON
// ==========================

const loginBtn = document.querySelector(".login");
const registerBtn = document.querySelector(".register");
const authButtons = document.getElementById("authButtons");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const authModal = document.getElementById("authModal");
const closeModalBtn = document.getElementById("closeModal");
const authForm = document.getElementById("authForm");
const authModalTitle = document.getElementById("authModalTitle");
const authModalText = document.getElementById("authModalText");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authConfirm = document.getElementById("authConfirm");

let authMode = "register";

function showLoggedInView(userName) {
    if (authButtons) authButtons.classList.add("hidden");
    if (userMenu) userMenu.setAttribute("aria-hidden", "true");
}

function resetAuthState() {
    localStorage.removeItem("msmeUser");
    if (authButtons) authButtons.classList.remove("hidden");
    if (userMenu) {
        userMenu.classList.remove("show");
        userMenu.setAttribute("aria-hidden", "true");
    }
}

function openAuthModal(mode) {
    authMode = mode;
    if (mode === "login") {
        authModalTitle.textContent = "Login";
        authModalText.textContent = "Enter your email and password to continue.";
        authSubmitBtn.textContent = "Login";
        authName.style.display = "none";
        authConfirm.style.display = "none";
    } else {
        authModalTitle.textContent = "Create Account";
        authModalText.textContent = "Enter your username, verification email, and password.";
        authSubmitBtn.textContent = "Register";
        authName.style.display = "block";
        authConfirm.style.display = "block";
    }
    authModal.classList.add("open");
    authModal.setAttribute("aria-hidden", "false");
}

function closeAuthModal() {
    authModal.classList.remove("open");
    authModal.setAttribute("aria-hidden", "true");
    authForm.reset();
}

if (loginBtn) loginBtn.addEventListener("click", () => openAuthModal("login"));
if (registerBtn) registerBtn.addEventListener("click", () => openAuthModal("register"));
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        resetAuthState();
        userMenu.classList.remove("show");
        alert("You have been logged out. You can sign in again from the top buttons.");
    });
}

document.addEventListener("click", () => {
    if (userMenu) {
        userMenu.classList.remove("show");
        userMenu.setAttribute("aria-hidden", "true");
    }
});
if (closeModalBtn) closeModalBtn.addEventListener("click", closeAuthModal);
if (authModal) authModal.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuthModal();
});

if (authForm) {
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = authName.value.trim();
        const email = authEmail.value.trim();
        const password = authPassword.value;
        const confirmPassword = authConfirm.value;

        if (authMode === "register") {
            if (!name) {
                alert("Please enter your username.");
                return;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
            localStorage.setItem("msmeUser", JSON.stringify({ name, email, password }));
            showLoggedInView(name);
            closeAuthModal();
            alert("Registration successful. Verification email sent to " + email);
            return;
        }

        const savedUser = JSON.parse(localStorage.getItem("msmeUser") || "null");
        if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
            alert("Invalid email or password.");
            return;
        }

        showLoggedInView(savedUser.name);
        closeAuthModal();
        alert("Login successful. Welcome back, " + savedUser.name);
    });
}

const savedUser = JSON.parse(localStorage.getItem("msmeUser") || "null");
if (savedUser) {
    showLoggedInView(savedUser.name);
}

const detailButtons =
document.querySelectorAll(".scheme-card button");

detailButtons.forEach(button => {

    button.addEventListener("click", () => {

        const scheme =
        button.parentElement.querySelector("h3").innerText;

        alert(
            scheme +
            "\n\nMore details will open here."
        );

    });

});


// ==========================
// SCROLL ANIMATION
// ==========================

const observer =
new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.style.opacity = "1";
            entry.target.style.transform =
            "translateY(0px)";

        }

    });

});

document.querySelectorAll(
".card, .scheme-card"
).forEach(el => {

    el.style.opacity = "0";
    el.style.transform =
    "translateY(50px)";
    el.style.transition =
    "0.8s ease";

    observer.observe(el);

});

// ==========================
// APPLY SCHEME API
// ==========================

async function applyScheme(schemeName, officialUrl){

    // Open official website immediately
    window.open(officialUrl, "_blank");

    try{

        const response = await fetch('/apply-scheme',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                scheme_name: schemeName
            })
        });

        const result = await response.json();

        alert(result.message);

    }
    catch(error){

        console.error(error);

        alert("Email/Application recording failed");
    }
}
// ==========================
// APPLY BUTTONS
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const applyButtons =
    document.querySelectorAll(".apply-btn");

    applyButtons.forEach(button => {

        button.addEventListener("click", () => {

            const schemeName =
            button.getAttribute("data-scheme");

            if(!schemeName){

                alert(
                    "Scheme name not found."
                );

                return;
            }

            applyScheme(schemeName);

        });

    });

});

// ==========================
// WELCOME MESSAGE
// ==========================

window.addEventListener("load", () => {

    console.log(
        "MSME Portal Loaded Successfully"
    );

});
function recommendScheme(){

const goal =
document.getElementById("goalSelect").value;

const box =
document.getElementById("recommendationBox");

let content = "";

switch(goal){

case "loan":

content = `
<h3>Recommended Schemes</h3>
<p><b>PMEGP</b> - Subsidy and financial support for new businesses.</p>
<p><b>CGTMSE</b> - Collateral free loans.</p>
<p><b>Self Reliant India Fund</b> - Growth funding support.</p>
`;

break;

case "startup":

content = `
<h3>Recommended Schemes</h3>
<p><b>ASPIRE</b> - Startup incubation support.</p>
<p><b>MSME Champions</b> - Business guidance.</p>
`;

break;

case "artisan":

content = `
<h3>Recommended Schemes</h3>
<p><b>PM Vishwakarma</b></p>
<p><b>SFURTI</b></p>
<p><b>Khadi Gramodyog Vikas Yojana</b></p>
<p><b>Coir Vikas Yojana</b></p>
`;

break;

case "training":

content = `
<h3>Recommended Schemes</h3>
<p><b>ESDP</b></p>
<p><b>ATI</b></p>
<p><b>Tool Rooms</b></p>
`;

break;

case "export":

content = `
<h3>Recommended Schemes</h3>
<p><b>International Cooperation Scheme</b></p>
`;

break;

case "quality":

content = `
<h3>Recommended Schemes</h3>
<p><b>ZED Certification</b></p>
`;

break;

case "scst":

content = `
<h3>Recommended Schemes</h3>
<p><b>National SC-ST Hub</b></p>
`;

break;

case "cluster":

content = `
<h3>Recommended Schemes</h3>
<p><b>MSE-CDP</b></p>
`;

break;

case "growth":

content = `
<h3>Recommended Schemes</h3>
<p><b>RAMP</b></p>
<p><b>Self Reliant India Fund</b></p>
`;

break;

default:

content = `
<p>Please select a goal.</p>
`;
}

box.style.display = "block";
box.innerHTML = content;
}