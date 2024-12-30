FROM python:3.13

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 패키지 설치를 위해 tzdata 추가
RUN apt-get update && apt-get install -y tzdata

# 시간대 설정 (한국 시간대: Asia/Seoul)
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Poetry 설치
RUN pip install --no-cache-dir poetry

# Poetry 설정: 가상환경을 생성하지 않도록 설정
RUN poetry config virtualenvs.create false

# 종속성 파일 복사 및 설치
COPY pyproject.toml poetry.lock /app/
RUN poetry install --no-interaction --no-ansi

# 애플리케이션 코드 복사
COPY . /app

# 컨테이너 실행 명령
CMD ["fastapi", "run", "main.py", "--port", "80"]