import { device } from 'detox';

async function launchAppWithMocks() {
  await device.launchApp({
    newInstance: true,
    launchArgs: {
      EXPO_PUBLIC_MOCK_GEMINI: 'true',
      EXPO_PUBLIC_AUTO_SCAN: 'true',
    },
  });
}

module.exports = {
  launchAppWithMocks,
};
