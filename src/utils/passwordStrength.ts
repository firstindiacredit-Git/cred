interface PasswordStrength {
  score: number; // 0-4
  color: string;
  label: string;
  crackTime: string;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  // Basic checks
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const length = password.length;

  // Calculate base score
  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (hasLower && hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  // Fun crack time messages based on password strength
  const crackTimeMessages = [
    "Faster than making instant noodles 🍜",
    "A coffee break ☕",
    "A few months 📅",
    "Several human lifetimes 👴",
    "Age of the universe² 🌌"
  ];

  // Colors for different strength levels
  const colors = [
    "#ff4d4f", // Red
    "#faad14", // Orange
    "#fadb14", // Yellow
    "#52c41a", // Green
    "#1890ff"  // Blue
  ];

  // Labels for different strength levels
  const labels = [
    "Very Weak",
    "Weak",
    "Medium",
    "Strong",
    "Very Strong"
  ];

  return {
    score,
    color: colors[score],
    label: labels[score],
    crackTime: crackTimeMessages[score]
  };
};
