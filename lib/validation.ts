export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateNickname(nickname: string): boolean {
  const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return nicknameRegex.test(nickname);
}

export function validateTwitterHandle(handle: string): boolean {
  // Remove @ if present
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
  const twitterRegex = /^[a-zA-Z0-9_]{1,15}$/;
  return twitterRegex.test(cleanHandle);
}

export function validateWalletAddress(address: string): boolean {
  // Loose validation: EVM (0x...), Solana (base58), or at least 20 chars
  if (address.startsWith("0x") && address.length >= 42) {
    return true;
  }
  // Base58 check (Solana-like)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if (base58Regex.test(address)) {
    return true;
  }
  // Fallback: at least 20 characters
  return address.length >= 20;
}

export function validateIdentifier(
  type: string,
  identifier: string
): { valid: boolean; error?: string } {
  if (type === "twitter") {
    if (!validateTwitterHandle(identifier)) {
      return {
        valid: false,
        error: "Invalid Twitter handle. Must be 1-15 alphanumeric characters or underscores.",
      };
    }
  } else if (type === "deployer") {
    if (!validateWalletAddress(identifier)) {
      return {
        valid: false,
        error: "Invalid wallet address. Must be at least 20 characters.",
      };
    }
  } else {
    return { valid: false, error: "Invalid report type." };
  }
  return { valid: true };
}
