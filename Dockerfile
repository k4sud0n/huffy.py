FROM python:3.13

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 패키지 설치를 위해 tzdata 추가
RUN apt-get update && apt-get install -y tzdata

# 시간대 설정 (한국 시간대: Asia/Seoul)
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Python 패키지 설치
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# 애플리케이션 코드 복사
COPY . /app

# 컨테이너 실행 명령
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
