function setupUpload(userId) {
    const uploadInput = document.getElementById("uploadImage");
    const preview = document.getElementById("uploadPreview");
    const saveButton = document.getElementById("uploadSaveButton");

    uploadInput.onchange = () => {
        const file = uploadInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    saveButton.onclick = async () => {
        const file = uploadInput.files[0];
        if (!file) {
            alert("画像を選択してください");
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result;

            // FastAPI に送る payload
            const payload = {
                line_user_id: userId,
                image_base64: encodeURIComponent(base64)
            };
            // FastAPI の保存 API を呼ぶ
            const res = await fetch(`${baseUrl}/upload_background`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.result === "ok") {
                alert("背景画像を保存しました");

                localStorage.setItem("clinic_card_image", base64);
                showCard(base64);
                showScreen("screen-card");
            } else {
                alert("保存に失敗しました");
            }
        };

        reader.readAsDataURL(file);
    };
}
