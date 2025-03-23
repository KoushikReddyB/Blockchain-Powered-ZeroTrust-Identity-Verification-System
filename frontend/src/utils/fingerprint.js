import FingerprintJS from "@fingerprintjs/fingerprintjs";
import CryptoJS from "crypto-js";

export const getDeviceFingerprint = async () => {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return CryptoJS.SHA256(result.visitorId).toString(); // Hashing the fingerprint
};
