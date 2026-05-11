#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HEATWISE="$SCRIPT_DIR/heatwise"
FRONTEND="$SCRIPT_DIR/uhi-simulator-main"

echo "====================================="
echo "  서울 UHI 시뮬레이터 시작"
echo "====================================="

# ── 1. Python 가상환경 ──
VENV="$SCRIPT_DIR/.venv"
if [ ! -d "$VENV" ]; then
  echo "[1/4] 가상환경 생성 중..."
  python3 -m venv "$VENV"
fi
source "$VENV/bin/activate"

# ── 2. Python 패키지 설치 ──
echo "[2/4] Python 패키지 설치 중..."
pip install -q --upgrade pip
pip install -q -r "$HEATWISE/requirements.txt"

# ── 3. 프론트엔드 빌드 ──
DIST="$HEATWISE/static/dist"
if [ ! -f "$DIST/index.html" ]; then
  echo "[3/4] 프론트엔드 빌드 중..."
  cd "$FRONTEND"
  if ! command -v node &>/dev/null; then
    echo "❌ Node.js가 없습니다. https://nodejs.org 에서 설치 후 다시 실행하세요."
    exit 1
  fi
  npm install --silent
  npm run build
  rm -rf "$DIST"
  cp -r "$FRONTEND/dist" "$DIST"
  echo "✅ 프론트엔드 빌드 완료"
else
  echo "[3/4] 프론트엔드 빌드 이미 존재, 건너뜀"
fi

# ── 4. 서버 실행 ──
echo "[4/4] 서버 시작..."
echo ""
echo "  ✅ http://localhost:8000 으로 접속하세요"
echo "  종료: Ctrl+C"
echo "====================================="
cd "$HEATWISE"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
