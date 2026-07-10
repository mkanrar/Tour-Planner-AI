const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined" ? "http://localhost:8000" : "")

export async function fetchDestinations(type?: string) {
  const url = type
    ? `${API_BASE}/api/destinations?type=${type}`
    : `${API_BASE}/api/destinations`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch destinations")
  return res.json()
}

export async function fetchPackages(season?: string) {
  const url = season
    ? `${API_BASE}/api/tours?season=${season}`
    : `${API_BASE}/api/tours`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch packages")
  return res.json()
}

export async function streamChat(
  message: string,
  history: { role: string; content: string }[],
  sessionId: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, session_id: sessionId }),
  })

  if (!res.ok) throw new Error("Chat request failed")

  const reader = res.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value, { stream: true })
    // SSE format: lines starting with "data: "
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ")) {
        const chunk = line.slice(6)
        if (chunk && chunk !== "[DONE]") onChunk(chunk)
      }
    }
  }
}
