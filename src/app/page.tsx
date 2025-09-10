"use client";

import { useState, useEffect } from "react";
import { AzureDevOpsCredentials } from "@/types";
import AuthForm from "@/components/AuthForm";
import Dashboard from "@/components/Dashboard";
import PINEntry from "@/components/PINEntry";
import { SecureStorage } from "@/lib/secureStorage";

export default function Home() {
  const [credentials, setCredentials] = useState<AzureDevOpsCredentials | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPINEntry, setShowPINEntry] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Check for stored credentials on component mount
  useEffect(() => {
    if (SecureStorage.hasStoredCredentials()) {
      setShowPINEntry(true);
    }
  }, []);

  const handleAuthenticate = async (
    creds: AzureDevOpsCredentials,
    saveCredentials?: boolean,
    pin?: string
  ) => {
    setIsLoading(true);
    try {
      // Test the connection first
      const { AzureDevOpsClient } = await import("@/lib/azure");
      const client = new AzureDevOpsClient(creds);
      const isValid = await client.testConnection();

      if (isValid) {
        setCredentials(creds);

        // Save credentials if requested
        if (saveCredentials && pin) {
          await SecureStorage.saveCredentials(creds, pin);
        }
      } else {
        throw new Error(
          "Invalid credentials. Please check your organization, project, and Personal Access Token."
        );
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePINSubmit = async (pin: string) => {
    setIsLoading(true);
    setPinError(null);

    try {
      const storedCredentials = await SecureStorage.loadCredentials(pin);
      if (storedCredentials) {
        // Test the connection with stored credentials
        const { AzureDevOpsClient } = await import("@/lib/azure");
        const client = new AzureDevOpsClient(storedCredentials);
        const isValid = await client.testConnection();

        if (isValid) {
          setCredentials(storedCredentials);
          setShowPINEntry(false);
        } else {
          setPinError(
            "Stored credentials are invalid or expired. Please enter new credentials."
          );
          SecureStorage.clearCredentials();
        }
      } else {
        setPinError("Invalid PIN or no stored credentials found.");
      }
    } catch (error) {
      setPinError("Failed to load stored credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePINCancel = () => {
    setShowPINEntry(false);
    setPinError(null);
  };

  const handleLogout = () => {
    setCredentials(null);
    setShowPINEntry(false);
    setPinError(null);
  };

  if (credentials) {
    return <Dashboard credentials={credentials} onLogout={handleLogout} />;
  }

  if (showPINEntry) {
    return (
      <PINEntry
        onPINSubmit={handlePINSubmit}
        onCancel={handlePINCancel}
        isLoading={isLoading}
        error={pinError}
      />
    );
  }

  return <AuthForm onAuthenticate={handleAuthenticate} isLoading={isLoading} />;
}
