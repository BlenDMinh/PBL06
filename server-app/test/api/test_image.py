import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi import UploadFile
from io import BytesIO
from lib.data.models import Image
from test.test import engine, client, override_get_db
from lib.data.database import Base

@pytest.fixture(scope="module")
def setup_database():
    # Ensure that the database tables are created
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_get_all_images(setup_database):
    # Create test images in DB
    test_images = [
        Image(id=1, image_url="http://test1.jpg"),
        Image(id=2, image_url="http://test2.jpg")
    ]
    db = next(override_get_db())
    for img in test_images:
        db.add(img)
    db.commit()

    # Test default pagination
    response = client.get("/api/images/")
    assert response.status_code == 200
    assert len(response.json()) == 2
    
    # Test with pagination
    response = client.get("/api/images/?skip=1&limit=1")
    assert response.status_code == 200
    assert len(response.json()) == 1

@pytest.mark.asyncio
async def test_create_image_upload_task():
    # Mock dependencies
    mock_cloudinary = Mock()
    mock_cloudinary.upload.return_value = "http://fake-url.jpg"
    
    mock_db = Mock()
    mock_image = Mock()
    mock_db.query.return_value.filter.return_value.first.return_value = mock_image
    
    # Test function
    await create_image_upload_task(
        image_bytes=b"fake_image",
        image_id=1,
        cloudinary_service=mock_cloudinary,
        db=mock_db
    )
    
    # Verify calls
    mock_cloudinary.upload.assert_called_once_with(b"fake_image")
    assert mock_image.image_url == "http://fake-url.jpg"
    mock_db.commit.assert_called_once()

def test_upload_image_endpoint(setup_database):
    # Mock CloudinaryService
    mock_cloudinary = Mock()
    mock_cloudinary.upload.return_value = "http://fake-url.jpg"
    
    # Create test image data
    test_image = BytesIO(b"fake image content")
    files = {"image": ("test.jpg", test_image, "image/jpeg")}
    
    with patch('lib.service.cloudinary_service.CloudinaryService', return_value=mock_cloudinary):
        response = client.post("/api/images/upload", files=files)
        
    assert response.status_code == 200
    assert response.json()["image_url"] == "Upload in progress..."

def test_get_images_empty_db(setup_database):
    # Clear all images first
    db = next(override_get_db())
    db.query(Image).delete()
    db.commit()
    
    response = client.get("/api/images/")
    assert response.status_code == 200
    assert response.json() == []

def test_create_image(setup_database):
    # Test data
    image_data = {"image_url": "http://test-create.jpg"}
    
    # Create image
    response = client.post("/api/images/", json=image_data)
    
    # Assert response
    assert response.status_code == 201
    assert response.json()["image_url"] == image_data["image_url"]
    
    # Verify in database
    db = next(override_get_db())
    db_image = db.query(Image).filter(Image.image_url == image_data["image_url"]).first()
    assert db_image is not None

def test_get_image(setup_database):
    # Create test image
    test_image = Image(image_url="http://test-get.jpg")
    db = next(override_get_db())
    db.add(test_image)
    db.commit()
    
    # Get image
    response = client.get(f"/api/images/{test_image.id}")
    
    # Assert response
    assert response.status_code == 200
    assert response.json()["id"] == test_image.id
    assert response.json()["image_url"] == test_image.image_url

def test_get_nonexistent_image(setup_database):
    response = client.get("/api/images/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Image not found"

def test_update_image(setup_database):
    # Create test image
    test_image = Image(image_url="http://test-update.jpg")
    db = next(override_get_db())
    db.add(test_image)
    db.commit()
    
    # Update data
    update_data = {"image_url": "http://test-updated.jpg"}
    
    # Update image
    response = client.put(f"/api/images/{test_image.id}", json=update_data)
    
    # Assert response
    assert response.status_code == 200
    assert response.json()["image_url"] == update_data["image_url"]
    
    # Verify in database
    db.refresh(test_image)
    assert test_image.image_url == update_data["image_url"]

def test_update_nonexistent_image(setup_database):
    update_data = {"image_url": "http://test-invalid.jpg"}
    response = client.put("/api/images/99999", json=update_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Image not found"

def test_delete_image(setup_database):
    # Create test image
    test_image = Image(image_url="http://test-delete.jpg")
    db = next(override_get_db())
    db.add(test_image)
    db.commit()
    
    # Delete image
    response = client.delete(f"/api/images/{test_image.id}")
    
    # Assert response
    assert response.status_code == 200
    assert response.json()["detail"] == "Image deleted"
    
    # Verify deletion
    deleted_image = db.query(Image).filter(Image.id == test_image.id).first()
    assert deleted_image is None

def test_delete_nonexistent_image(setup_database):
    response = client.delete("/api/images/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Image not found"
