# 판구조론 시뮬레이션 실험실 (Plate Tectonics Lab)

자바실험실(JavaLab) 스타일의 인터랙티브 지구과학 가상 실험실 웹 애플리케이션입니다.

## 🚀 로컬 실행 방법 (Local Development)

깃허브에서 저장소를 클론(`git clone`)한 후 아래 명령어로 실행할 수 있습니다:

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` (또는 터미널에 표시된 포트)로 접속합니다.

---

## 🌐 GitHub Pages 배포 설정 방법

저장소에 푸시했을 때 웹사이트로 배포하려면 GitHub 저장소 설정에서 Pages를 활성화해야 합니다:

1. GitHub 저장소 페이지 상단의 **Settings** 메뉴로 이동합니다.
2. 좌측 사이드바에서 **Pages**를 클릭합니다.
3. **Build and deployment** 섹션의 **Source** 드롭다운을:
   - `Deploy from a branch` ❌ 대신
   - **`GitHub Actions`** ✅ 로 선택합니다.
4. 이제 코드를 `main` 브랜치에 푸시하면 자동으로 빌드 및 배포가 진행되며, 수 분 내에 사이트 링크가 생성됩니다!

---

## 💡 깃허브 푸시 후 화면이 안 나왔던 원인 및 해결

1. **상대 경로(`base: './'`) 미설정**:
   - Vite 기본값은 절대 경로(`/assets/...`)를 참조하여, GitHub Pages 저장소 주소(`https://<user>.github.io/<repo>/`)에서 JS/CSS 파일을 찾지 못해 404 에러와 함께 흰 화면이 나타납니다.
   - `vite.config.ts`에 `base: './'`를 추가하여 해결했습니다.

2. **빌드 산출물 미배포**:
   - GitHub에는 소스 코드(`src/`)만 올라가고 빌드 결과물(`dist/`)은 `.gitignore`에 의해 올라가지 않습니다.
   - `.github/workflows/deploy.yml`을 추가하여 GitHub 서버에서 자동으로 `npm run build` 후 배포하도록 구성했습니다.
