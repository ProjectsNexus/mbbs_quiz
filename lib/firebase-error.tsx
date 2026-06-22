
type FirebaseErrorMessages = {
  [key: string]: string;
};

export const firebaseErrorMessages: FirebaseErrorMessages = {
  "auth/wrong-password": "❌ The current password you entered is incorrect.",
  "auth/weak-password": "❌ The new password is too weak (must be at least 6 characters).",
  "auth/requires-recent-login": "❌ Your session has expired. Please log in again.",
  "auth/user-mismatch": "❌ This credential does not match the current user.",
  "auth/user-not-found": "❌ No account found with this email.",
  "auth/email-already-in-use": "❌ This email is already registered.",
  "auth/invalid-email": "❌ Please enter a valid email address.",
  "auth/too-many-requests": "❌ Too many attempts. Please try again later.",
  "auth/network-request-failed": "❌ Network error. Please check your internet connection.",
};

export function getFirebaseErrorMessage(code: string): string {
  return firebaseErrorMessages[code] || "❌ Something went wrong. Please try again.";
}
