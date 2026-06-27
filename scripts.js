const search = document.getElementById("search");

/* ==========================
   SEARCH FUNCTION
========================== */

search.addEventListener("keyup", () => {

    const value =
    search.value.toLowerCase();

    const schemes =
    document.querySelectorAll(".scheme-item");

    schemes.forEach(item => {

        const text =
        item.innerText.toLowerCase();

        item.style.display =
        text.includes(value)
        ? "flex"
        : "none";

    });

});


/* ==========================
   SAVE SCHEME FUNCTION
========================== */

const buttons =
document.querySelectorAll(".save-btn");

buttons.forEach(button => {

    const scheme =
    button.dataset.scheme;

    /* Load previously saved schemes */

    let savedSchemes =
    JSON.parse(
    localStorage.getItem(
    "savedSchemes"
    )) || [];


    /* Restore bookmark after refresh */

    if(savedSchemes.includes(scheme))
    {
        button.classList.remove(
        "fa-regular"
        );

        button.classList.add(
        "fa-solid",
        "saved"
        );
    }


    /* Save button click */

    button.addEventListener(
    "click",
    ()=>{

        let savedSchemes =
        JSON.parse(
        localStorage.getItem(
        "savedSchemes"
        )) || [];



        if(savedSchemes.includes(
        scheme
        ))
        {

            /* Remove scheme */

            savedSchemes =
            savedSchemes.filter(
            item => item !== scheme
            );

            button.classList.remove(
            "fa-solid",
            "saved"
            );

            button.classList.add(
            "fa-regular"
            );

        }
        else
        {

            /* Add scheme */

            savedSchemes.push(
            scheme
            );

            button.classList.remove(
            "fa-regular"
            );

            button.classList.add(
            "fa-solid",
            "saved"
            );

        }


        /* Store data */

        localStorage.setItem(
        "savedSchemes",
        JSON.stringify(
        savedSchemes
        )
        );

    });

});