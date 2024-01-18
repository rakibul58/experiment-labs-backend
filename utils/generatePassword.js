const generateCustomPassword = (student) => {
    const { firstName, phone } = student;
    const formattedFirstName = firstName.replace(/\s/g, '');
    const phoneString = phone + "";
    const lastFourDigits = phoneString.slice(-4);
    const password = `${formattedFirstName}_${lastFourDigits}`;
    return password;
};
module.exports = {
    generateCustomPassword,
};
