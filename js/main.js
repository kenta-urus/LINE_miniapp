let userId = null;   // ★ グローバルに宣言
async function main() {
    //##################################################
    // 診察券メイン処理
    //##################################################
    await liff.init({ liffId: "2009685891-3LT8yZiY" });

    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }

    const profile = await liff.getProfile();
    userId = profile.userId;    // グローバル変数に代入

    // ① ローカル診察券画像を最優先
    const localImage = localStorage.getItem("clinic_card_image");
    if (localImage) {
        
        console.log("ローカルに診察券がありました。");

        // ローカル画像がある → FastAPI に行かずに表示
        showCard(localImage);
        showScreen("screen-card");
        return;
    }

    // ② ローカル画像が無い → FastAPI に問い合わせる
    console.log("FastAPIから診察券を取得します。");
    let patientData = null;
    try {
        patientData = await fetchPatientInfo(userId);
    } catch (e) {
        console.error("APIエラー:", e);
    }

    if (patientData && patientData.card_image) {
        // FastAPI の診察券画像をローカルに保存
        localStorage.setItem("clinic_card_image", patientData.card_image);
        // 表示
        showCard(patientData.card_image);
        showScreen("screen-card");
    } else {
        // 登録情報が無い
        showScreen("screen-register");
    }

    //**************************************************//
    // ▼（イベント設定エリア）ここから下にイベントを追加する
    //**************************************************//
    //--------------------------------------------------//
    // 更新ボタン タップした時のアクション
    //--------------------------------------------------//
    document.getElementById("updateButton").onclick = async () => {

        // ① ローカルの診察券画像を消去
        localStorage.removeItem("clinic_card_image");
        console.log("ローカル診察券画像を削除しました");
    
        // ローディング画面を表示
        showScreen("screen-loading");
    
        // ② FastAPI に問い合わせて診察券イメージを再作成
        const data = await fetchPatientInfo(userId);
        if (!data) {
            showScreen("screen-register");
            return;
        }
    
        // ③ FastAPI の診察券画像をローカルに保存
        localStorage.setItem("clinic_card_image", data.card_image);
        console.log("FastAPIから取得した診察券画像をローカルに保存:", data.card_image);
    
        // ④ 保存したローカル画像を表示（仕様どおり）
        const localImage = localStorage.getItem("clinic_card_image");
        showCard(localImage);
    
        // カード画面へ戻す
        showScreen("screen-card");
    };
    //--------------------------------------------------//
    // 削除ボタン タップした時のアクション
    //--------------------------------------------------//
    document.getElementById("deleteButton").onclick = async () => {

        // ① ローカルの診察券画像を消去
        localStorage.removeItem("clinic_card_image");
        console.log("ローカル診察券画像を削除しました");
        alert("ローカルの診察券画像を消去しました");
    };
    //--------------------------------------------------//
    // 診察券変更ボタン タップした時のアクション
    //--------------------------------------------------//
    document.getElementById("changeButton").onclick = () => {
        showScreen("screen-upload");
    };
    //--------------------------------------------------//
    // 診察券変更時にキャンセルボタンをタップした時のアクション
    //--------------------------------------------------//
    document.getElementById("uploadCancelButton").onclick = () => {
        showScreen("screen-card");
    };

    //--------------------------------------------------//
    // 登録処理
    //--------------------------------------------------//
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

            const newPatient = await fetchPatientInfo(userId);
            if (newPatient && newPatient.card_image) {
                localStorage.setItem("clinic_card_image", newPatient.card_image);
                showCard(newPatient.card_image);
            }
            showScreen("screen-card");
        } else {
            alert("登録に失敗しました");
        }
    };

    setupUpload(userId);
}



//##################################################//
// main処理
//##################################################//
document.addEventListener("DOMContentLoaded", async () => {
    
    await main();  // ← LIFF 初期化 → DOM 再構築 → 画面表示

    // ★ ここでイベントを登録する（最重要）
    const updateBtn = document.getElementById("updateButton");
    const deleteBtn = document.getElementById("deleteButton");
    const changeBtn = document.getElementById("changeButton");

    console.log("updateButton:", updateBtn);
    console.log("deleteButton:", deleteBtn);
    console.log("changeButton:", changeBtn);

    //--------------------------------------------------
    // 更新ボタンクリックイベント
    //--------------------------------------------------
    if (updateBtn) {
        updateBtn.onclick = async () => {
            console.log("更新ボタンが押されました");
            // ① ローカルの診察券画像を消去
            localStorage.removeItem("clinic_card_image");
            console.log("ローカル診察券画像を削除しました");
        
            // ローディング画面を表示
            showScreen("screen-loading");
        
            // ② FastAPI に問い合わせて診察券イメージを再作成
            const data = await fetchPatientInfo(userId);
            if (!data) {
                showScreen("screen-register");
                return;
            }
        
            // ③ FastAPI の診察券画像をローカルに保存
            localStorage.setItem("clinic_card_image", data.card_image);
            console.log("FastAPIから取得した診察券画像をローカルに保存しました。");
        
            // ④ 保存したローカル画像を表示（仕様どおり）
            const localImage = localStorage.getItem("clinic_card_image");
            showCard(localImage);
        
            // カード画面へ戻す
            showScreen("screen-card");
        };
    }
    
    //--------------------------------------------------
    // 削除ボタンクリックイベント
    //--------------------------------------------------
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            console.log("削除ボタンが押されました");
            localStorage.removeItem("clinic_card_image");
            alert("ローカルの診察券画像を消去しました");
        };
    }

    //--------------------------------------------------
    // 画像の変更ボタンクリックイベント
    //--------------------------------------------------
    if (changeBtn) {
        changeBtn.onclick = () => {
            console.log("画像変更ボタンが押されました");
            showScreen("screen-upload");
        };
    }
    
});

//--------------------------------------------------
// 画像削除ボタンクリックイベント
//--------------------------------------------------
const deleteImageBtn = document.getElementById("delimgButton");
if (deleteImageBtn) {
    deleteImageBtn.onclick = async () => {
        
        console.log("画像削除ボタンが押されました");
        // ① ローカル画像削除
        localStorage.removeItem("clinic_card_image");
        // ② FastAPI 側の画像削除APIを呼ぶ
        const res = await fetch(`${baseUrl}/delete_card_image?userId=${userId}`, {
            method: "DELETE"
        });
        const result = await res.json();
        console.log("FastAPI側の画像削除結果:", result);

        // ③ 削除後の診察券画像を /patient から再取得する
        const patientRes = await fetch(`${baseUrl}/patient?userId=${userId}`);
        const patientData = await patientRes.json();

        // ④ 診察券画像をローカル保存
        localStorage.setItem("clinic_card_image", patientData.card_image);
        // ④ showCard に FastAPI のデフォルト画像を渡す
        showCard(patientData.card_image);
        // ④ カード画面へ戻す
        showScreen("screen-card");
    };
}
