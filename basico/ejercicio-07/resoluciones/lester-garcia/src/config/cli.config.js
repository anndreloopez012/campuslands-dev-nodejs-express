export const parseCliArguments = () => {
  const args = process.argv.slice(2);
  const config = {
    port: 3000,
    currency: "USD"
  };

  args.forEach((arg) => {
    if (arg.startsWith("--port=")) {
      const parsedPort = Number(arg.split("=")[1]);
      if (!isNaN(parsedPort) && parsedPort > 0) {
        config.port = parsedPort;
      }
    }

    if (arg.startsWith("--currency=")) {
      const currency = arg.split("=")[1].toUpperCase();
      if (["USD", "EUR"].includes(currency)) {
        config.currency = currency;
      }
    }
  });

  return config;
};