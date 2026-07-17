// ===============================
// グローバル
// ===============================
import { baseUrl } from "./config.js";
import { fetchPatientInfo, handleUpdate, handleDeleteLocal, handleDeleteImage, handleRegister } from "./api.js";
import { showCard, loadLocalCard, showScreen } from "./card.js";
import { handleUploadPreview, uploadBackground } from "./upload.js";

let userId = null;

//===============================
// LIFF 初期化 & 初期画面表示
// ===============================
async function initApp() {
    await liff.init({ liffId: "2009685891-3LT8yZiY" });

    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }

    const profile = await liff.getProfile();
    userId = profile.userId;

    // ローカル画像があれば最優先
    if (loadLocalCard()) {
        showScreen("screen-card");
        return;
    }

    // FastAPI から診察券取得
    const patientData = await fetchPatientInfo(userId);

    if (patientData?.card_image) {
        localStorage.setItem("clinic_card_image", patientData.card_image);
        showCard(patientData.card_image);
        showScreen("screen-card");
    } else {
        showScreen("screen-register");
    }
}

// ===============================
// DOMContentLoaded：イベント登録だけ
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

    await initApp();

    // ===== カード画面 =====
    document.getElementById("updateButton").onclick = () => handleUpdate(userId);
    document.getElementById("deleteButton").onclick = () => handleDeleteLocal();
    document.getElementById("changeButton").onclick = () => showScreen("screen-upload");
    document.getElementById("delimgButton").onclick = () => handleDeleteImage(userId);

    // ===== 登録画面 =====
    document.getElementById("registerButton").onclick = () => handleRegister(userId);

    // ===== アップロード画面 =====
    document.getElementById("uploadImage").onchange = handleUploadPreview;
    document.getElementById("uploadSaveButton").onclick = () => uploadBackground(userId);
    document.getElementById("uploadCancelButton").onclick = () => showScreen("screen-card");
});
