const container =
document.getElementById(
    "savedContainer"
);

let savedSchemes =
JSON.parse(
    localStorage.getItem(
        "savedSchemes"
    )
)||[];


if(savedSchemes.length===0){

    container.innerHTML=
    '<p class="empty">No saved schemes</p>';

}
else{

    savedSchemes.forEach(
        scheme=>{

            const div=
            document.createElement(
                "div"
           );

           div.className=
           "scheme-card";

           div.innerHTML=`

           <div class="scheme-name">
            ${scheme}
           </div>

           <i class="fa-solid fa-trash remove-btn"></i>
           `;

         container.appendChild(
            div
         );

        const removeBtn=
        div.querySelector(
              ".remove-btn"
        );

        removeBtn.addEventListener(
            "click",
            ()=>{

                savedSchemes=
                savedSchemes.filter(
                     item=>item!==scheme
                );

                localStorage.setItem(
                    "savedSchemes",
                    JSON.stringify(
                        savedSchemes
                    )
                );
                location.reload();
            }
        );
    }
);

}