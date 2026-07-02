async function main() {
    await liff.init({ liffId: "2009685891-3LT8yZiY" });
    if (!liff.isLoggedIn()) {
        liff.login();
        return; // ログイン後に再読み込みされる
    }
    const profile = await liff.getProfile();
    const userId = profile.userId;

    // 1. ローカル診察券があるか？
    const hasLocal = loadLocalCard();

    if (hasLocal) {
        // ローカル診察券を表示
        showScreen("screen-card");
    } else {
        // 2. ローカルに無い → FastAPI で検索
        let patientData = null;
        try {
            patientData = await fetchPatientInfo(userId);  // /patient
        } catch (e) {
            console.error("APIエラー:", e);
        }

        if (patientData) {
            // 2.1 患者が存在する → 診察券画像を作成して保存
            if (patientData.card_image) {
                localStorage.setItem("clinic_card_image", patientData.card_image);
                showCard(patientData.card_image);
            }
            showScreen("screen-card");
        } else {
            // 2.2 患者が存在しない → 登録画面へ
            showScreen("screen-register");
        }
    }

    // ▼（イベント設定エリア）ここから下にイベントを追加する

    // 更新ボタン
    document.getElementById("updateButton").onclick = async () => {
        const data = await fetchPatientInfo(userId);
        if (!data) {
            showScreen("screen-register");
            return;
        }
        localStorage.setItem("clinic_card_image", data.card_image);
        showCard(data.card_image);
    };

    // 診察券変更ボタン
    document.getElementById("changeButton").onclick = () => {
        showScreen("screen-upload");
    };

    // ▼▼▼ ここに /register の処理を追加する（この位置が正しい） ▼▼▼
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

        // FastAPI の /register を呼ぶ（登録処理）
        const res = await fetch(`${baseUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.result === "ok") {
            alert("登録が完了しました");

            // 登録後に再度患者情報を取得して診察券表示へ
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
    // ▲▲▲ /register の処理はここに置くのが正しい ▲▲▲

    // アップロード処理
    setupUpload();
}

main();
