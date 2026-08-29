async function test() {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
    const data = await res.json();
    if (data.models) {
        console.log("AVAILABLE MODELS:", data.models.map(m => m.name).filter(n => n.includes("gemini")));
    } else {
        console.log("ERROR FETCHING MODELS:", data);
    }
}
test();
