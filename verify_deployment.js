
import fetch from "node-fetch";

const checkEndpoint = async (url) => {
    try {
        console.log(`Fetching ${url}...`);
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);

        const contentType = res.headers.get("content-type");
        console.log("Content-Type:", contentType);

        if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            console.log("JSON Response:", JSON.stringify(data, null, 2));
        } else {
            const text = await res.text();
            console.log("Raw Response (First 1000 chars):", text.substring(0, 1000));
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
};

checkEndpoint("https://thefashionisto.vercel.app/api/debug");
checkEndpoint("https://thefashionisto.vercel.app/");
