export async function parseJsonSafe(res) {
  if (!res) throw new Error('No response provided to parseJsonSafe');

  // If upstream returned non-2xx, capture body text for diagnostics
  if (!res.ok) {
    let text;
    try {
      text = await res.text();
    } catch (e) {
      text = String(e.message || e);
    }
    throw new Error(`Upstream returned status ${res.status}: ${text}`);
  }

  const contentType = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
  if (!contentType.includes('application/json')) {
    let text;
    try {
      text = await res.text();
    } catch (e) {
      text = String(e.message || e);
    }
    throw new Error(`Expected application/json but got ${contentType}: ${text}`);
  }

  try {
    return await res.json();
  } catch (err) {
    // Try to read raw text for better error message (body may be consumed in some runtimes)
    let text;
    try {
      text = await res.text();
    } catch (e) {
      text = String(e.message || e);
    }
    throw new Error(`Invalid JSON from upstream: ${text || err.message}`);
  }
}
