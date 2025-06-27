// using this Since we’re skipping Lambda, we’ll simulate this step locally using Chainlink Functions’ request model.

module.exports = {
  codeLocation: 1, // Inline
  codeLanguage: 0, // JavaScript
  source: `
    const credit_score = args[0];
    const income = args[1];
    const asset_value = args[2];

    if (credit_score >= 750 && income >= 100000 && asset_value >= 300000) {
      return Functions.encodeString("A");
    } else if (credit_score >= 650 && income >= 50000 && asset_value >= 100000) {
      return Functions.encodeString("B");
    } else {
      return Functions.encodeString("C");
    }
  `,
  args: ["720", "60000", "120000"], // Simulated inputs
  secrets: {},
};
