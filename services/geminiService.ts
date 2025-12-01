export const getDurationFromQuery = async (query: string): Promise<number | null> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error("API request failed:", response.statusText);
      return null;
    }

    const data = await response.json() as { seconds: number };
    return typeof data.seconds === 'number' && data.seconds > 0 ? data.seconds : null;

  } catch (error) {
    console.error("Error fetching duration from Gemini:", error);
    return null;
  }
};
