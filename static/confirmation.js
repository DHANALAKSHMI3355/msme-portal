/**
 * MSME Scheme Confirmation Form Engine
 * Handles dynamic content switches, auto-filtering dropdown pipelines and field validations.
 */

console.log("JS STARTED");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM LOADED");
    // List of all verifiable operational Schemes
    const msmeSchemes = [
        "PMEGP", "CGTMSE", "MSE-CDP", "SFURTI", "ESDP", "ATI", 
        "Coir Vikas Yojana", "PMS Scheme", "International Cooperation Scheme", 
        "National SC-ST Hub", "ASPIRE", "KGVY", 
        "Promotion of MSMEs in NER and Sikkim", "PM Vishwakarma Scheme", 
        "Tool Rooms Scheme", "MSME Champions Scheme", "SRI Fund", 
        "RAMP Scheme", "ZED Certification Scheme"
    ];

    // Core HTML DOM Elements references
    const form = document.getElementById('msmeForm');
    const radioYes = document.getElementById('radioYes');
    const radioNo = document.getElementById('radioNo');
    console.log("FORM FOUND:", form);
    console.log("YES RADIO:", radioYes);
    console.log("NO RADIO:", radioNo);
    const schemeDetailsSection = document.getElementById('schemeDetailsSection');
    const noSchemeNotice = document.getElementById('noSchemeNotice');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = document.getElementById('btnSpinner');
    
    // Dynamic Scheme Dropdown Lookup references
    const schemeSearchInput = document.getElementById('schemeSearch');
    const selectedSchemeHidden = document.getElementById('selectedScheme');
    const schemeList = document.getElementById('schemeList');
    
    // Status Modal Dialogue interface links
    const successModal = document.getElementById('successModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    /* ==========================================================================
       DYNAMIC SECTION SWAP LOGIC (YES / NO RADIO RESPONSES)
       ========================================================================== */
    function handleRadioChange() {
        if (radioYes.checked) {
            // Reveal operational details grid entry components
            schemeDetailsSection.classList.remove('hidden');
            noSchemeNotice.classList.add('hidden');
            btnText.textContent = "Submit Details";
            toggleSchemeFieldsRequirement(true);
        } else if (radioNo.checked) {
            // Hide details section and display animated inline instant notification
            schemeDetailsSection.classList.add('hidden');
            noSchemeNotice.classList.remove('hidden');
            btnText.textContent = "Finish Process";
            toggleSchemeFieldsRequirement(false);
            clearSectionValidationErrors(schemeDetailsSection);
        }
        removeValidationError('radioError');
    }

    function toggleSchemeFieldsRequirement(isRequired) {
        const fields = [
            document.getElementById('applicationDate')
        ];
        fields.forEach(field => {
            if (isRequired) {
                field.setAttribute('required', 'required');
            } else {
                field.removeAttribute('required');
            }
        });
    }

    radioYes.addEventListener('change', handleRadioChange);
    radioNo.addEventListener('change', handleRadioChange);

    /* ==========================================================================
       SEARCHABLE DROPDOWN MECHANICS
       ========================================================================== */
    function populateDropdown(filterText = '') {
        schemeList.innerHTML = '';
        const filtered = msmeSchemes.filter(scheme => 
            scheme.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            const li = document.createElement('li');
            li.textContent = "No matching schemes found";
            li.style.color = 'var(--text-muted)';
            li.style.cursor = 'default';
            schemeList.appendChild(li);
        } else {
            filtered.forEach(scheme => {
                const li = document.createElement('li');
                li.textContent = scheme;
                li.addEventListener('click', () => {
                    schemeSearchInput.value = scheme;
                    selectedSchemeHidden.value = scheme;
                    schemeList.classList.remove('show');
                    removeValidationError('schemeError');
                });
                schemeList.appendChild(li);
            });
        }
    }

    schemeSearchInput.addEventListener('focus', () => {
        populateDropdown(schemeSearchInput.value);
        schemeList.classList.add('show');
    });

    schemeSearchInput.addEventListener('input', (e) => {
        selectedSchemeHidden.value = ''; 
        populateDropdown(e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.searchable-dropdown-container')) {
            schemeList.classList.remove('show');
            if(msmeSchemes.includes(schemeSearchInput.value.trim())) {
                selectedSchemeHidden.value = schemeSearchInput.value.trim();
            }
        }
    });

    /* ==========================================================================
       VALIDATION FRAMEWORK
       ========================================================================== */
    function setValidationError(elementId, containerSelector = '.input-group') {
        const errorSpan = document.getElementById(elementId);
        if (errorSpan) {
            const container = errorSpan.closest(containerSelector);
            if (container) container.classList.add('invalid');
        }
    }

    function removeValidationError(elementId, containerSelector = '.input-group') {
        const errorSpan = document.getElementById(elementId);
        if (errorSpan) {
            const container = errorSpan.closest(containerSelector);
            if (container) container.classList.remove('invalid');
        }
    }

    function clearSectionValidationErrors(sectionElement) {
        const invalidGroups = sectionElement.querySelectorAll('.input-group.invalid');
        invalidGroups.forEach(group => group.classList.remove('invalid'));
    }

    // Inline event validation helpers
    document.getElementById('fullName').addEventListener('input', function() {
        if(this.value.trim() !== "") removeValidationError('nameError');
    });

    document.getElementById('email').addEventListener('input', function() {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if(gmailRegex.test(this.value.trim())) removeValidationError('emailError');
    });

    document.getElementById('contactNumber').addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, ''); 
        if(this.value.length === 10) removeValidationError('phoneError');
    });

    document.getElementById('occupation').addEventListener('change', function() {
        if(this.value !== "") removeValidationError('occupationError');
    });
console.log("ATTACHING SUBMIT EVENT");
    /* ==========================================================================
       FORM SUBMISSION PIPELINE MANAGEMENT
       ========================================================================== */
    form.addEventListener('submit', async (e) => {
        console.log("SUBMIT CLICKED");
        e.preventDefault(); 
        
        let isFormValid = true;

        // 1. Core Profile Details Field Checking
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const contactNumber = document.getElementById('contactNumber').value.trim();
        const occupation = document.getElementById('occupation').value;

        if (fullName === "") {
            setValidationError('nameError');
            isFormValid = false;
        } else {
            removeValidationError('nameError');
        }

        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            setValidationError('emailError');
            isFormValid = false;
        } else {
            removeValidationError('emailError');
        }

        if (contactNumber.length !== 10) {
            setValidationError('phoneError');
            isFormValid = false;
        } else {
            removeValidationError('phoneError');
        }

        if (!occupation) {
            setValidationError('occupationError');
            isFormValid = false;
        } else {
            removeValidationError('occupationError');
        }

        // 2. Radio Assessment Field Checking
        if (!radioYes.checked && !radioNo.checked) {
            setValidationError('radioError', '.form-section');
            isFormValid = false;
            return;
        } else {
            removeValidationError('radioError', '.form-section');
        }

        // 3. Conditional validation rules dependent on structural state choices
        if (radioYes.checked) {
            const schemeSelected = selectedSchemeHidden.value;
            const appDate = document.getElementById('applicationDate').value;

            if (!schemeSelected || !msmeSchemes.includes(schemeSelected)) {
                setValidationError('schemeError', '.input-group');
                isFormValid = false;
            } else {
                removeValidationError('schemeError', '.input-group');
            }

            if (!appDate) {
                setValidationError('dateError');
                isFormValid = false;
            } else {
                removeValidationError('dateError');
            }
        }

        if (!isFormValid) {
            const firstError = document.querySelector('.input-group.invalid, .form-section.invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const appliedScheme =
radioYes.checked ? "yes" : "no";

const token =
window.location.pathname.split('/').pop();

console.log("Submit button clicked");


console.log("EMAIL =", email);
console.log("TOKEN =", token);
console.log("APPLIED =", appliedScheme);

const response = await fetch('/submit-confirmation', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email,
        token,
        appliedScheme
    })
});

const result = await response.json();

console.log("SUCCESS:", result);



        // EXECUTE SUBMIT LOADING STATE EFFECT ANIMATIONS
        
        submitBtn.disabled = true;
        btnText.style.opacity = '0.5';
        btnSpinner.classList.remove('hidden');

        setTimeout(() => {
            submitBtn.disabled = false;
            btnText.style.opacity = '1';
            btnSpinner.classList.add('hidden');
            successModal.classList.remove('hidden');
        }, 1500); 
    });

    /* ==========================================================================
       MODAL RESET ACTION CAPTURES
       ========================================================================== */
    modalCloseBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        form.reset();
        schemeDetailsSection.classList.add('hidden');
        noSchemeNotice.classList.add('hidden');
        btnText.textContent = "Submit Details";
        selectedSchemeHidden.value = '';
    });
});