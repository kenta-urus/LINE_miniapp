async function main() {
    await liff.init({ liffId: "2009685891-3LT8yZiY" });

    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }

    const profile = await liff.getProfile();
    const userId = profile.userId;
    
    // ★ ローカル診察券を一旦無効化（背景画像のテスト用）
    // localStorage.removeItem("clinic_card_image");

    // FastAPI から診察券情報を取得
    let patientData = null;
    try {
        patientData = await fetchPatientInfo(userId);
    } catch (e) {
        console.error("APIエラー:", e);
    }

    if (patientData && patientData.card_image) {
        localStorage.setItem("clinic_card_image", patientData.card_image);
        showCard(patientData.card_image);
        showScreen("screen-card");
    } else {
        showScreen("screen-register");
    }

    //**************************************************//
    // ▼（イベント設定エリア）ここから下にイベントを追加する
    //**************************************************//
    //--------------------------------------------------//
    // 更新ボタン タップした時のアクション
    //--------------------------------------------------//
    document.getElementById("updateButton").onclick = async () => {
    
        // ローディング画面を表示
        showScreen("screen-loading");
        const data = await fetchPatientInfo(userId);
        if (!data) {
            showScreen("screen-register");
            return;
        }
        // 診察券画像を保存
        localStorage.setItem("clinic_card_image", data.card_image);
        // 診察券画像を更新（フェードアニメ対応）
        showCard(data.card_image);
        // 更新後にカード画面へ戻す
        showScreen("screen-card");
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

    setupUpload();
}

main();
