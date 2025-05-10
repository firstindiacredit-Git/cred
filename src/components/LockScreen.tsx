import React, { useState, useEffect } from "react";
import { Modal, Input, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ isLocked, onUnlock }) => {
  const [pin, setPin] = useState("");
  const { user } = useAuth();
  const [storedPin, setStoredPin] = useState(); // Default PIN
  const [sending, setSending] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [reauthModalVisible, setReauthModalVisible] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthError, setReauthError] = useState("");

  useEffect(() => {
    const fetchPin = async () => {
      if (!user) return;

      try {
        const pinDoc = await getDoc(
          doc(db, "users", user.uid, "settings", "pin")
        );
        if (pinDoc.exists()) {
          setStoredPin(pinDoc.data().pin);
          // console.log("pin successfully fetched:", storedPin);
        }
      } catch (error) {
        console.error("Error fetching PIN:", error);
      }
    };

    fetchPin();
  }, [user]);

  useEffect(() => {
    if (isLocked) {
      localStorage.setItem("isLocked", "true");
    } else {
      localStorage.setItem("isLocked", "false");
    }
  }, [isLocked]);

  const handleUnlock = () => {
    if (pin === storedPin) {
      setPin("");
      localStorage.setItem("isLocked", "false");
      onUnlock();
    } else {
      message.error("Incorrect PIN");
      setPin("");
    }
  };

  const handleForgotLock = async () => {
    // if (!user || !user.email || !storedPin) {
    //   message.error("Unable to send PIN. Please contact support.");
    //   return;
    // }
    // setSending(true);
    // try {
    //   await sendEmailWithPin(user.email, storedPin);
    //   message.success("Your PIN has been sent to your email.");
    // } catch (err) {
    //   message.error("Failed to send email. Please try again.");
    // } finally {
    //   setSending(false);
    // }
  };

  const handleStartResetPin = () => {
    setReauthModalVisible(true);
    setReauthError("");
    setReauthPassword("");
  };

  const handleReauth = async () => {
    if (!user || !auth.currentUser) {
      setReauthError("User not authenticated. Please log in again.");
      return;
    }
    setReauthLoading(true);
    setReauthError("");
    try {
      const providerId = user.providerData[0]?.providerId;
      if (providerId === "password") {
        if (!user.email) {
          setReauthError("No email found for user.");
          setReauthLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(
          user.email,
          reauthPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
      } else if (providerId === "google.com") {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, provider);
      } else {
        setReauthError("Unsupported authentication provider.");
        setReauthLoading(false);
        return;
      }
      setReauthModalVisible(false);
      setResetModalVisible(true);
    } catch (err: any) {
      setReauthError(err.message || "Re-authentication failed.");
    } finally {
      setReauthLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (!user) {
      message.error("You must be logged in to reset your PIN.");
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      message.error("PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      message.error("PINs do not match.");
      return;
    }
    setResetLoading(true);
    try {
      await import("firebase/firestore").then(
        async ({ doc, setDoc, Timestamp }) => {
          const userSettingsRef = doc(db, "users", user.uid, "settings", "pin");
          await setDoc(userSettingsRef, {
            pin: newPin,
            updatedAt: Timestamp.fromDate(new Date()),
          });
        }
      );
      message.success("PIN updated successfully.");
      setResetModalVisible(false);
      setNewPin("");
      setConfirmPin("");
    } catch (error) {
      message.error("Failed to update PIN.");
    } finally {
      setResetLoading(false);
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <LockOutlined className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold">Screen Locked</h2>
          <p className="text-gray-500 mt-2">Enter your PIN to unlock</p>
        </div>

        <Input.Password
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onPressEnter={handleUnlock}
          maxLength={4}
          className="mb-4"
          autoFocus
        />

        <button
          onClick={handleUnlock}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Unlock
        </button>
        <div className="mt-4 text-center flex flex-col gap-2">
          <button
            className="text-blue-500 hover:underline disabled:opacity-50"
            onClick={handleStartResetPin}
            type="button"
          >
            Forgot PIN? Reset PIN
          </button>
        </div>
        <Modal
          title="Re-authenticate to Reset PIN"
          open={reauthModalVisible}
          onOk={handleReauth}
          onCancel={() => setReauthModalVisible(false)}
          confirmLoading={reauthLoading}
        >
          {user?.providerData[0]?.providerId === "password" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Password
                </label>
                <Input.Password
                  placeholder="Enter your account password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              {reauthError && (
                <div className="text-red-500 text-sm">{reauthError}</div>
              )}
            </div>
          ) : (
            <div>
              <p>Click OK to re-authenticate with Google.</p>
              {reauthError && (
                <div className="text-red-500 text-sm">{reauthError}</div>
              )}
            </div>
          )}
        </Modal>
        <Modal
          title="Reset Screen Lock PIN"
          open={resetModalVisible}
          onOk={handleResetPin}
          onCancel={() => {
            setResetModalVisible(false);
            setNewPin("");
            setConfirmPin("");
          }}
          confirmLoading={resetLoading}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New PIN
              </label>
              <Input.Password
                placeholder="Enter 4-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                maxLength={4}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm PIN
              </label>
              <Input.Password
                placeholder="Confirm 4-digit PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                maxLength={4}
                className="mt-1"
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LockScreen;
