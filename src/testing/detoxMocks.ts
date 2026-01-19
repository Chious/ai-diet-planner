type DetoxMocks = {
  autoScan?: boolean;
  gemini?: boolean;
};

export function applyDetoxMocks() {
  if (!__DEV__) {
    return;
  }

  const autoScan = process.env.EXPO_PUBLIC_AUTO_SCAN === 'true';
  const gemini = process.env.EXPO_PUBLIC_MOCK_GEMINI === 'true';

  if (autoScan || gemini) {
    (globalThis as { __DETOX_MOCKS__?: DetoxMocks }).__DETOX_MOCKS__ = {
      autoScan,
      gemini,
    };
  }
}
