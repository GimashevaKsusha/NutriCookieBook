FROM python:3.10.8

WORKDIR /nutricookiebook_api

COPY ./requirements.txt /nutricookiebook_api/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /nutricookiebook_api/requirements.txt

COPY . /nutricookiebook_api