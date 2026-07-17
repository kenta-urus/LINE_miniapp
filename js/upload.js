// upload.js（アップロード専用）
import { baseUrl } from "./config.js";

export function handleUploadPreview() {
    const uploadInput = document.getElementById("uploadImage");
    const preview = document.getElementById("uploadPreview");

    const file = uploadInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => preview.src = reader.result;
    reader.readAsDataURL(file);
}

export async function uploadBackground(userId) {
    const uploadInput = document.getElementById("uploadImage");
    const file = uploadInput.files[0];

    if (!file) {
        alert("画像を選択してください");
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
        const base64 = reader.result;

        const payload = {
            line_user_id: userId,
            image_base64: encodeURIComponent(base64)
        };

        await fetch(`${baseUrl}/upload_background`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const patientRes = await fetch(`${baseUrl}/patient?line_user_id=${userId}`);
        const patientData = await patientRes.json();

        localStorage.setItem("clinic_card_image", patientData.card_image);
        showCard(patientData.card_image);
        showScreen("screen-card");
    };

    reader.readAsDataURL(file);
}
