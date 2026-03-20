# Mobile App

React Native app built with Expo SDK 54 and Expo Router.

## Running the app

### Option 1: Windows (emulator or device)

Run all commands from a Windows terminal (PowerShell or CMD) in `C:\Users\mike\dev\productivity-app\mobile`.

```cmd
npm install
npx expo start --android
```

The Android emulator must already be running before starting Expo.

### Option 2: WSL (Expo Go on physical device via tunnel)

Run from WSL in `/home/mike/dev/productivity-app/mobile`.

```bash
npx expo start --tunnel --clear
```

Scan the QR code with Expo Go on your phone. Requires ngrok auth token:

```bash
npx ngrok config add-authtoken <your-token>
```

Sign up free at https://ngrok.com to get a token.

## Notes

- Always use `--clear` after dependency or config changes to reset the Metro cache
- `EXPO_ROUTER_APP_ROOT` is set in `metro.config.js` and `babel.config.js` — required for monorepo setup
- Package versions are pinned to Expo SDK 54 compatibility. Use `npx expo install --fix` if you see TurboModule errors after updating packages

The Android emulator is running on Windows but WSL can't reach it
  directly. You need to point WSL's ADB at the Windows host's ADB
  server.

  In WSL, run:

  # Get Windows host IP
  export WINDOWS_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')

  # Tell adb to use the Windows ADB server
  export ANDROID_ADB_SERVER_ADDRESS=$WINDOWS_IP
  export ANDROID_ADB_SERVER_PORT=5037

  # Verify the emulator is visible
  adb devices

  First make sure ADB server is running on Windows — open a Windows
  terminal and run:
  adb start-server

  Then from WSL start Expo targeting Android:
  ANDROID_ADB_SERVER_ADDRESS=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}') npx expo start --android --clear

  You may also want to add those exports to your ~/.bashrc so you don't
  have to set them every time:
  echo 'export ANDROID_ADB_SERVER_ADDRESS=$(cat /etc/resolv.conf | grep
  nameserver | awk "{print \$2}")' >> ~/.bashrc
  echo 'export ANDROID_ADB_SERVER_PORT=5037' >> ~/.bashrc

