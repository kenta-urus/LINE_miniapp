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

    document.getElementById("registerButton").onclick = async () => {
        const patientId = document.getElementById("patientIdInput").value;
        const name = document.getElementById("nameInput").value;
        const birth = document.getElementById("birthInput").value;
    
        if (!patientId || !name || !birth) {
            alert("すべての項目を入力してください");
            return;
        }
    
        const payload = {
            line_user_id: userId,
            patient_id: patientId,
            name: name,
            birth_date: birth
        };
    
        const res = await fetch(`${baseUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    
        const data = await res.json();
    
        if (data.result === "ok") {
            alert("登録が完了しました");
            showScreen("screen-card");
        } else {
            alert("登録に失敗しました");
        }
    };

    document.getElementById("updateButton").onclick = async () => {
        await updateCardFromAPI(userId);
    };

    document.getElementById("changeButton").onclick = () => {
        showScreen("screen-upload");
    };

    setupUpload();
}

main();
