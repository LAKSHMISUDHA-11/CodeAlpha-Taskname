document.addEventListener("DOMContentLoaded", () => {
    const galleryGrid = document.getElementById("galleryGrid");
    const zoomModal = document.getElementById("zoomModal");
    const modalTargetImg = document.getElementById("modalTargetImg");
    const closeBtn = document.getElementById("closeBtn");
    const paletteBtn = document.getElementById("paletteBtn");
    const filterPanel = document.getElementById("filterPanel");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    // Load saved filters structure from localStorage or initialize empty
    const savedFilters = localStorage.getItem("globalGalleryFilters");
    const imageFiltersState = savedFilters ? JSON.parse(savedFilters) : {};
    
    let currentActiveIndex = null;

    // Dynamically assign mapping index based on image file sources
    if (galleryGrid) {
        const images = galleryGrid.querySelectorAll("img");
        images.forEach(img => {
            const uniqueKey = img.getAttribute("src");
            img.setAttribute("data-index", uniqueKey);

            // Reapply filters if they were previously configured
            if (imageFiltersState[uniqueKey]) {
                applyActiveFiltersString(uniqueKey, img);
            }
        });
    }

    const filterTemplates = {
        grayscale: "grayscale(100%)",
        blur: "blur(5px)",
        brightness: "brightness(150%)",
        sepia: "sepia(100%)",
        contrast: "contrast(175%)"
    };

    function applyActiveFiltersString(imgIndex, targetDomElement) {
        const states = imageFiltersState[imgIndex];
        if (!states) {
            targetDomElement.style.filter = "none";
            return;
        }

        let filterString = "";
        Object.keys(states).forEach(filterName => {
            if (states[filterName]) {
                filterString += `${filterTemplates[filterName]} `;
            }
        });

        targetDomElement.style.filter = filterString.trim() || "none";
    }

    function syncFilterPanelButtons(imgIndex) {
        const states = imageFiltersState[imgIndex] || {};
        filterButtons.forEach(btn => {
            const filterName = btn.getAttribute("data-filter");
            if (states[filterName]) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    // Open single image Zoom View Modal
    if (galleryGrid) {
        galleryGrid.addEventListener("click", (e) => {
            if (e.target.tagName === "IMG") {
                const clickedImg = e.target;
                currentActiveIndex = clickedImg.getAttribute("data-index");

                if (!imageFiltersState[currentActiveIndex]) {
                    imageFiltersState[currentActiveIndex] = {
                        grayscale: false, blur: false, brightness: false, sepia: false, contrast: false
                    };
                }

                modalTargetImg.src = clickedImg.src;
                modalTargetImg.alt = clickedImg.alt;
                
                applyActiveFiltersString(currentActiveIndex, modalTargetImg);
                syncFilterPanelButtons(currentActiveIndex);

                zoomModal.style.display = "flex";
            }
        });
    }

    // Close Modal View
    function closeModal() {
        if (!zoomModal) return;
        zoomModal.style.display = "none";
        filterPanel.style.display = "none";
        
        if (currentActiveIndex !== null) {
            const gridThumb = galleryGrid.querySelector(`img[data-index="${CSS.escape(currentActiveIndex)}"]`);
            if (gridThumb) {
                applyActiveFiltersString(currentActiveIndex, gridThumb);
            }
        }
        currentActiveIndex = null;
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (zoomModal) {
        zoomModal.addEventListener("click", (e) => {
            if (e.target === zoomModal) closeModal();
        });
    }

    // Toggle filter panel menu
    if (paletteBtn) {
        paletteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            filterPanel.style.display = filterPanel.style.display === "block" ? "none" : "block";
        });
    }

    // Toggle filter values and save to storage
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (currentActiveIndex === null) return;
            const filterName = button.getAttribute("data-filter");
            
            imageFiltersState[currentActiveIndex][filterName] = !imageFiltersState[currentActiveIndex][filterName];
            
            button.classList.toggle("active");
            applyActiveFiltersString(currentActiveIndex, modalTargetImg);

            // Sync state shifts directly to browser storage
            localStorage.setItem("globalGalleryFilters", JSON.stringify(imageFiltersState));
        });
    });

    // Clear individual filter settings completely
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            if (currentActiveIndex === null) return;
            
            Object.keys(imageFiltersState[currentActiveIndex]).forEach(key => {
                imageFiltersState[currentActiveIndex][key] = false;
            });

            syncFilterPanelButtons(currentActiveIndex);
            applyActiveFiltersString(currentActiveIndex, modalTargetImg);

            localStorage.setItem("globalGalleryFilters", JSON.stringify(imageFiltersState));
        });
    }
});

    