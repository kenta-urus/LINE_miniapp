function showCard(imageData) {
    const img = document.getElementById("cardImage");
    img.src = imageData;
    img.style.display = "block";
}

function loadLocalCard() {
    const savedImage = localStorage.getItem("clinic_card_image");
    if (savedImage) {
        showCard(savedImage);
        return true;
    }
    return false;
}

async function updateCardFromAPI(userId) {
    const data = await fetchPatientInfo(userId);

    if (!data) {
        document.getElementById("registerForm").style.display = "block";
        return;
    }

    localStorage.setItem("clinic_card_image", data.card_image);
    showCard(data.card_image);
}

function setupUpload() {
    document.getElementById("uploadButton").onclick = () => {
        const file = document.getElementById("uploadImage").files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            localStorage.setItem("clinic_card_image", base64);
            showCard(base64);
        };
        reader.readAsDataURL(file);
    };
}
