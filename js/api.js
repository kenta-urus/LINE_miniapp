//  cloudflared URL
const baseUrl = "https://gain-idaho-career-winner.trycloudflare.com";

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
