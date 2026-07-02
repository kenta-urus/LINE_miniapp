const baseUrl = "https://law-humanity-hunter-farm.trycloudflare.com";

async function fetchPatientInfo(userId) {
    const url = `${baseUrl}/patient?line_user_id=${userId}`;

    const res = await fetch(url);

    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        throw new Error("HTTP Error " + res.status);
    }

    return await res.json();
}
