const generateCustomPassword = (student) => {
  const { name, phone } = student;
  const formattedName = name.replace(/\s/g, "");
  const phoneString = phone + "";
  const lastFourDigits = phoneString.slice(-4);
  const password = `${formattedName}_${lastFourDigits}`;
  return password;
};
module.exports = {
  generateCustomPassword,
};
