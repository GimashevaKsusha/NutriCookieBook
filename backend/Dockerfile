FROM python:3.10

WORKDIR /nutricookiebook_api

COPY ./requirements.txt /nutricookiebook_api/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /nutricookiebook_api/requirements.txt

COPY . /nutricookiebook_api

CMD ["uvicorn", "main:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "5000"]
