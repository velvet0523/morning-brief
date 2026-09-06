# morning-brief
아침 경제·주식 뉴스 브리핑

## Android APK 만들기

최초 한 번 Expo 계정에 로그인합니다.

```bash
npx eas-cli@latest login
```

그다음 설치 가능한 APK 빌드를 시작합니다.

```bash
npm run build:apk
```

첫 빌드에서 EAS 프로젝트 생성 여부를 물으면 `Y`, Android 서명키 생성 여부를 물으면 `Generate new keystore`를 선택합니다. 빌드가 끝나면 터미널에 표시되는 링크에서 APK를 내려받아 Android 휴대폰에 설치합니다.
