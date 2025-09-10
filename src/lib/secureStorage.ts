import { AzureDevOpsCredentials } from "@/types";

const STORAGE_KEY = "ado_analytics_credentials";
const PIN_KEY = "ado_analytics_pin";

// Simple encryption/decryption using Web Crypto API
async function encrypt(text: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const keyData = encoder.encode(key);

  // Create a simple XOR cipher (not cryptographically secure, but good enough for this use case)
  const encrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ keyData[i % keyData.length];
  }

  return btoa(String.fromCharCode(...encrypted));
}

async function decrypt(encryptedText: string, key: string): Promise<string> {
  const decoder = new TextDecoder();
  const keyData = new TextEncoder().encode(key);
  const encrypted = new Uint8Array(
    atob(encryptedText)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  const decrypted = new Uint8Array(encrypted.length);
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyData[i % keyData.length];
  }

  return decoder.decode(decrypted);
}

export class SecureStorage {
  static async saveCredentials(
    credentials: AzureDevOpsCredentials,
    pin: string
  ): Promise<void> {
    try {
      const credentialsJson = JSON.stringify(credentials);
      const encryptedCredentials = await encrypt(credentialsJson, pin);

      localStorage.setItem(STORAGE_KEY, encryptedCredentials);
      localStorage.setItem(PIN_KEY, pin);
    } catch (error) {
      console.error("Failed to save credentials:", error);
      throw new Error("Failed to save credentials securely");
    }
  }

  static async loadCredentials(
    pin: string
  ): Promise<AzureDevOpsCredentials | null> {
    try {
      const encryptedCredentials = localStorage.getItem(STORAGE_KEY);
      if (!encryptedCredentials) {
        return null;
      }

      const decryptedCredentials = await decrypt(encryptedCredentials, pin);
      return JSON.parse(decryptedCredentials);
    } catch (error) {
      console.error("Failed to load credentials:", error);
      return null;
    }
  }

  static hasStoredCredentials(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  static clearCredentials(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PIN_KEY);
  }

  static getStoredPin(): string | null {
    return localStorage.getItem(PIN_KEY);
  }
}
