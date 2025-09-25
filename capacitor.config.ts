import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5b1607bf6cad41dba94f1705af850f50',
  appName: 'ak-spice-dash',
  webDir: 'dist',
  server: {
    url: "https://5b1607bf-6cad-41db-a94f-1705af850f50.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;