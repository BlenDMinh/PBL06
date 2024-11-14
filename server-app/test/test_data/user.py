from lib.data.models import User


INIT_USER_NUM = 1000

init_users: list[User] = []
for i in range(INIT_USER_NUM):
    user = User(
        username=f"test_user_{i}",
        email=f"test_user_{i}@test.com"
    )
    init_users.append(user)

ADD_USER_NUM = 5
add_users: list[User] = []
for i in range(ADD_USER_NUM):
    user = {
        "username": f"add_user_{i}",
        "email": f"add_user_{i}@test.com"
    }
    add_users.append(user)
