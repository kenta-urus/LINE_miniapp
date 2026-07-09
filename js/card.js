function showCard(base64FromServer = null) {
    const img = document.getElementById("card");

    // ① ローカル保存された画像があればそれを優先
    const localImage = localStorage.getItem("clinic_card_image");
    if (localImage) {
        img.src = localImage;
        return;
    }

    // ② ローカルが無ければ FastAPI から取得した画像を使う
    if (base64FromServer) {
        img.src = base64FromServer;
        return;
    }

    // ③ どちらも無ければデフォルト画像
    img.src = "default_card.png";
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
