import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

from lib.data.models import Image
# from env import config

config = {
    'CLOUDINARY_CLOUD_NAME': 'dqjwnlepl',
    'CLOUDINARY_API_KEY': '222114852314415',
    'CLOUDINARY_API_SECRET': 'g-C5V5TuatS0R6_H6wqVvPJ92yU'
}

class CloudinaryService:
    def __init__(self):
        cloudinary.config(
            cloud_name = config['CLOUDINARY_CLOUD_NAME'],
            api_key = config['CLOUDINARY_API_KEY'],
            api_secret = config['CLOUDINARY_API_SECRET'],
            secure = True
        )
    
    def upload(self, file):
        result = cloudinary.uploader.upload(file)
        url, _ = cloudinary_url(result['public_id'], fetch_format="auto", quality="auto")
        return url

    def destroy(self, public_id):
        cloudinary.uploader.destroy(public_id)

def get_cloudinary_service():
    return CloudinaryService()