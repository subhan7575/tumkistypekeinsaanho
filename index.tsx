// App.tsx ke andar performAnalysis function ko update karein:
const performAnalysis = async (base64: string) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, lang })
    });

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textError = await response.text();
      console.error("Server returned non-JSON:", textError);
      throw new Error("Server error (Check Vercel Logs)");
    }

    const data = await response.json();
    // ... baki code same rahega
