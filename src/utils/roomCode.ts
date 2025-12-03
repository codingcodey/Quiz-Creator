// Room code validation and utilities

export function isValidRoomCode(code: string): boolean {
  // Must be exactly 4 digits
  return /^\d{4}$/.test(code);
}

export function formatRoomCode(code: string): string {
  // Remove non-digits
  const digitsOnly = code.replace(/\D/g, '');

  // Take first 4 digits
  const trimmed = digitsOnly.slice(0, 4);

  // Pad with zeros if needed
  return trimmed.padEnd(4, '0');
}

export function displayRoomCode(code: string): string {
  // Format as "1234" for display
  return code;
}

export function parseRoomCode(input: string): string | null {
  const formatted = formatRoomCode(input);
  return isValidRoomCode(formatted) ? formatted : null;
}
