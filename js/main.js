function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

async function main() {
    await liff.init({ liffId: "2009685891-3LT8yZiY" });

    const profile = await liff.getProfile();
    const userId = profile.userId;

    const hasLocal = loadLocalCard();

    if (hasLocal) {
        showScreen("screen-card");
    } else {
        const data = await fetchPatientInfo(userId);

        if (!data) {
            showScreen("screen-register");
        } else {
            localStorage.setItem("clinic_card_image", data.card_image);
            showCard(data.card_image);
            showScreen("screen-card");
        }
    }

    document.getElementById("updateButton").onclick = async () => {
        await updateCardFromAPI(userId);
    };

    document.getElementById("changeButton").onclick = () => {
        showScreen("screen-upload");
    };

    setupUpload();
}

main();
