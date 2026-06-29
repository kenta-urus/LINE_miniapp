async function main() {
    await liff.init({ liffId: "2009685891-3LT8yZiY" });

    const profile = await liff.getProfile();
    const userId = profile.userId;

    // 1. ローカル診察券があるか？
    const hasLocal = loadLocalCard();  // localStorage から clinic_card_image を読む

    if (hasLocal) {
        // 1. ローカルに診察券画像が存在する → それを表示して終了
        showScreen("screen-card");
    } else {
        // 2. ローカルに存在しない → line_user_id で患者検索
        let patientData = null;
        try {
            patientData = await fetchPatientInfo(userId);  // 200ならJSON、404なら null を返す設計
        } catch (e) {
            console.error("APIエラー:", e);
        }

        if (patientData) {
            // 2.1 患者が存在する → 登録情報をもとに診察券画像を作成して保存・表示
            // ここで「診察券画像を作成する」処理がどこにあるか次第で分岐
            // 例：FastAPI が card_image を返す場合
            if (patientData.card_image) {
                localStorage.setItem("clinic_card_image", patientData.card_image);
                showCard(patientData.card_image);
            } else {
                // まだ画像がない場合はデフォルト or クライアント側で生成
                showCard("img/診察券.jpg");
            }
            showScreen("screen-card");
        } else {
            // 2.2 患者が存在しない → 初めて登録画面を表示
            showScreen("screen-register");
        }
    }

    // ▼ 更新ボタン：常に FastAPI から最新を取りに行き、ローカルを更新
    document.getElementById("updateButton").onclick = async () => {
        try {
            const data = await fetchPatientInfo(userId);
            if (!data) {
                showScreen("screen-register");
                return;
            }
            if (data.card_image) {
                localStorage.setItem("clinic_card_image", data.card_image);
                showCard(data.card_image);
            }
        } catch (e) {
            console.error("更新エラー:", e);
        }
    };

    // ▼ 診察券変更ボタン：アップロード画面へ
    document.getElementById("changeButton").onclick = () => {
        showScreen("screen-upload");
    };

    // ▼ 登録ボタン：新規患者登録（2.2 の後）
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

    setupUpload();
}

main();
