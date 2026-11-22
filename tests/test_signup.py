from fastapi.testclient import TestClient

from src.app import activities, app


client = TestClient(app)


def test_signup_rejects_duplicate_student():
    activity_name = "Chess Club"
    email = "new-student@mergington.edu"
    original_participants = list(activities[activity_name]["participants"])

    try:
        first_response = client.post(
            f"/activities/{activity_name}/signup", params={"email": email}
        )
        duplicate_response = client.post(
            f"/activities/{activity_name}/signup", params={"email": email}
        )

        assert first_response.status_code == 200
        assert duplicate_response.status_code == 400
        assert duplicate_response.json()["detail"].startswith(
            f"{email} is already signed up"
        )
        assert activities[activity_name]["participants"].count(email) == 1
    finally:
        activities[activity_name]["participants"] = original_participants


def test_signup_duplicate_check_is_case_insensitive_and_trims_whitespace():
    activity_name = "Programming Class"
    email = "emma@mergington.edu"
    original_participants = list(activities[activity_name]["participants"])

    response = client.post(
        f"/activities/{activity_name}/signup",
        params={"email": "  EMMA@MERGINGTON.EDU  "},
    )

    assert response.status_code == 400
    assert activities[activity_name]["participants"] == original_participants
