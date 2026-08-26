# 장동호 디자이너 — 포트폴리오

BX 디자이너 장동호의 개인 포트폴리오 사이트.

---

## 어떻게 만들어졌나

```
Project/            ← 원본 자료 (GitHub에 올라가지 않음, 내 컴퓨터에만)
      ↓  npm run assets  (이미지 축소 · GIF→mp4 · 비메오 주소 추출)
public/works/       ← 웹용 변환본
content/works.json  ← 프로젝트 목록 (제목·번호·카테고리·순서)
content/about.md    ← 이력 페이지 내용
```

- 프레임워크 — Next.js (App Router) + TypeScript
- 스타일 — Tailwind CSS
- 애니메이션 — Framer Motion
- 배포 — Vercel (main 브랜치에 푸시하면 자동 배포)
- **백엔드·데이터베이스 없음**

---

## 자주 하는 일

### 이력 내용 고치기

**GitHub 웹사이트에서 `content/about.md` 파일을 열어 고치고 저장**하면 됩니다.
Vercel이 1~2분 안에 자동으로 사이트에 반영합니다. 컴퓨터도 터미널도 필요 없고 폰에서도 됩니다.

### 프로젝트 추가하기

1. `Project/` 아래에 폴더를 만들고 자료를 넣는다
2. `scripts/build-assets.mjs` 의 `PROJECTS` 목록에 한 줄 추가한다
3. 아래 명령을 실행한다

```bash
npm run assets   # 자료 변환
git add -A && git commit -m "작업 추가" && git push
```

### 순서·제목·카테고리 바꾸기

`scripts/build-assets.mjs` 의 `PROJECTS` 배열 순서를 바꾸고 `npm run assets` 를 다시 실행합니다.

---

## 파일 이름 규칙

프로젝트 폴더 안의 파일은 **이름 끝의 숫자 순서대로** 화면에 나옵니다.

| 파일 | 화면에 나오는 것 |
|---|---|
| `1.jpg`, `2.png` … | 이미지 |
| `3.txt` | 비메오 영상 — 파일 안에 비핸스에서 복사한 iframe 코드를 그대로 넣으면 됨 |
| `*Thum*` 이 들어간 파일 | 메인 화면 썸네일 (1:1 권장) |

`.txt` 안의 iframe에 `background=1` 이 있으면 **무한 반복(컨트롤 없음)**, 없으면 **일반 플레이어**로 나옵니다.

---

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 배포 전 확인
```

`npm run assets` 는 [ffmpeg](https://ffmpeg.org/)이 설치돼 있어야 합니다.
