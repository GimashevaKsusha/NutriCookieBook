import uvicorn

from app import create_app

if __name__ == '__main__':
    uvicorn.run("main:app", host="localhost", port=5000, log_level="info", reload=True, reload_dirs=["app"])
else:
    app = create_app()
