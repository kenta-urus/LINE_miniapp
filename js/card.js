// card.js（表示専用）

export function showCard(base64FromServer = null) {
    const img = document.getElementById("card");

    const localImage = localStorage.getItem("clinic_card_image");
    if (localImage && localImage.startsWith("data:image")) {
        img.src = localImage;
        return;
    }

    if (base64FromServer && base64FromServer.startsWith("data:image")) {
        img.src = base64FromServer;
        return;
    }

    img.src = "default_card.png"; // 最終手段
}

export function loadLocalCard() {
    const savedImage = localStorage.getItem("clinic_card_image");
    if (savedImage) {
        showCard(savedImage);
        return true;
    }
    return false;
}

export function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}
