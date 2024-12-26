import requests
from env import config
from lib.data.models import Image

class ImageService:
    def __init__(self, local_api_url):
        self.local_api_url = local_api_url
    
    def upload(self, image) -> Image:
        response = requests.post(self.local_api_url + '/images/upload', files={"image": image})
        image: Image = Image(**response.json())
        return image

def get_image_service():
    url = f"{config['SERVER_APP_HOST']}:{config['SERVER_APP_PORT']}/api"
    if config['SERVER_APP_PORT'] == "80":
        url = f"{config['SERVER_APP_HOST']}/api"
    return ImageService(url)