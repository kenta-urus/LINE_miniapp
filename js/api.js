// api.js（FastAPI 呼び出し専用）

export async function fetchPatientInfo(userId) {
    const url = `${baseUrl}/patient?line_user_id=${userId}`;
    const res = await fetch(url);

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("HTTP Error " + res.status);

    return await res.json();
}

export async function handleUpdate(userId) {
    localStorage.removeItem("clinic_card_image");
    showScreen("screen-loading");

    const data = await fetchPatientInfo(userId);
    if (!data) {
        showScreen("screen-register");
        return;
    }

    localStorage.setItem("clinic_card_image", data.card_image);
    showCard(data.card_image);
    showScreen("screen-card");
}

export function handleDeleteLocal() {
    localStorage.removeItem("clinic_card_image");
    alert("ローカルの診察券画像を消去しました");
}

export async function handleDeleteImage(userId) {
    localStorage.removeItem("clinic_card_image");

    await fetch(`${baseUrl}/delete_card_image?userId=${userId}`, {
        method: "DELETE"
    });

    const patientRes = await fetch(`${baseUrl}/patient?line_user_id=${userId}`);
    const patientData = await patientRes.json();

    localStorage.setItem("clinic_card_image", patientData.card_image);
    showCard(patientData.card_image);
    showScreen("screen-card");
}

export async function handleRegister(userId) {
    const payload = {
        line_user_id: userId,
        patient_id: document.getElementById("patientIdInput").value,
        name: document.getElementById("nameInput").value,
        birth_date: document.getElementById("birthInput").value
    };

    const res = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.result === "ok") {
        const newPatient = await fetchPatientInfo(userId);
        localStorage.setItem("clinic_card_image", newPatient.card_image);
        showCard(newPatient.card_image);
        showScreen("screen-card");
    } else {
        alert("登録に失敗しました");
    }
}
