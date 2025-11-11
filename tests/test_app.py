from fastapi.testclient import TestClient
import pytest
from src.app import app, activities

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200  # FastAPI's RedirectResponse uses 200 by default
    assert response.url.path == "/static/index.html"  # Check the final URL after redirect

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert response.json() == activities

def test_signup_success():
    activity_name = "Chess Club"
    email = "new_student@mergington.edu"
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 200
    assert response.json() == {"message": f"Signed up {email} for {activity_name}"}
    assert email in activities[activity_name]["participants"]
    # Cleanup: remove the test participant
    activities[activity_name]["participants"].remove(email)

def test_signup_already_registered():
    activity_name = "Chess Club"
    email = "michael@mergington.edu"  # Already registered in this activity
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_activity_not_found():
    activity_name = "Non-Existent Club"
    email = "test@mergington.edu"
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]

def test_unregister_success():
    # First, add a test participant
    activity_name = "Chess Club"
    email = "temp_student@mergington.edu"
    activities[activity_name]["participants"].append(email)
    
    # Now try to unregister them
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 200
    assert response.json() == {"message": f"Unregistered {email} from {activity_name}"}
    assert email not in activities[activity_name]["participants"]

def test_unregister_not_found():
    activity_name = "Chess Club"
    email = "nonexistent@mergington.edu"
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 404
    assert "Student not found in activity" in response.json()["detail"]

def test_unregister_activity_not_found():
    activity_name = "Non-Existent Club"
    email = "test@mergington.edu"
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]