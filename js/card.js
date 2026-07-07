function showCard(imageData) {
    const img = document.getElementById("card");
    img.src = imageData;
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
        showScreen("screen-register");
        return;
    }

    localStorage.setItem("clinic_card_image", data.card_image);
    showCard(data.card_image);
}

// ▼▼▼ これを追加する ▼▼▼
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}
