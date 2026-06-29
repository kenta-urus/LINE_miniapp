async function main() {
    await liff.init({ liffId: "あなたのLIFF ID" });

    const profile = await liff.getProfile();
    const userId = profile.userId;

    const hasLocal = loadLocalCard();

    if (!hasLocal) {
        await updateCardFromAPI(userId);
    }

    document.getElementById("updateButton").onclick = async () => {
        await updateCardFromAPI(userId);
    };

    setupUpload();
}

main();
