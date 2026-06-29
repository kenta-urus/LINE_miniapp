function setupUpload() {
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

    saveButton.onclick = () => {
        const file = uploadInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            localStorage.setItem("clinic_card_image", base64);
            showCard(base64);
            showScreen("screen-card");
        };
        reader.readAsDataURL(file);
    };
}
