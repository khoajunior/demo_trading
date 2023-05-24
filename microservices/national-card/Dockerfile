FROM python:3.8-slim-buster
WORKDIR /app


RUN apt-get -y update && apt-get install -y libzbar-dev 
RUN apt-get install ffmpeg libsm6 libxext6  -y

COPY requirements.txt requirements.txt
COPY app.py app.py


RUN pip3 install -r requirements.txt

CMD ["gunicorn", "-w 4", "-b", "0.0.0.0:8000", "app:app"]

# CMD [ "python3", "app.py"]