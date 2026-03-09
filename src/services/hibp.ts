// hibp.ts — Have I Been Pwned Pwned Passwords API service
// Uses k-anonymity: only the first 5 chars of a SHA-1 hash are sent to the API.
// The real password never leaves the browser.

async function sha1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function isPasswordPwned(password: string): Promise<number> {
  // Returns the number of times the password has been seen in breaches (0 = safe)
  const hash = await sha1(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true" },
  });

  if (!response.ok) throw new Error("HIBP API request failed");

  const text = await response.text();
  const lines = text.split("\n");

  for (const line of lines) {
    const [hashSuffix, countStr] = line.split(":");
    if (hashSuffix.trim() === suffix) {
      return parseInt(countStr.trim(), 10);
    }
  }

  return 0; // Not found — password is safe
}

export async function checkAllPasswords(
  entries: { id: number; password: string }[]
): Promise<Map<number, number>> {
  // Returns a map of entry id -> breach count
  const results = new Map<number, number>();
  for (const entry of entries) {
    try {
      const count = await isPasswordPwned(entry.password);
      results.set(entry.id, count);
    } catch {
      results.set(entry.id, -1); // -1 = error checking
    }
  }
  return results;
}