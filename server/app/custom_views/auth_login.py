from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    print("Incoming credentials:", username, password)

    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)

    if not user_obj.check_password(password):
        return Response({"error": "Incorrect password"}, status=status.HTTP_401_UNAUTHORIZED)

    if not user_obj.is_active:
        return Response({"error": "User is inactive"}, status=status.HTTP_403_FORBIDDEN)

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Authentication failed"}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "username": user.username,
        "role": user.role,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logout successful"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

# from rest_framework.decorators import api_view
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.response import Response
# from rest_framework import status
# from django.contrib.auth import authenticate
# from app.models import User
# from django.contrib.auth import get_user_model

# User = get_user_model()


# @api_view(['POST'])
# def login_view(request):
#     username = request.data.get('username')
#     password = request.data.get('password')
#     user = authenticate(username=username, password=password)
#     if user:
#         refresh = RefreshToken.for_user(user)
#         return Response({
#             'refresh': str(refresh),
#             'access': str(refresh.access_token),
#             'role': user.role,
#             'username': user.username
#         })
#     return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# @api_view(['POST'])
# def logout_view(request):
#     try:
#         refresh_token = request.data.get('refresh')
#         token = RefreshToken(refresh_token)
#         token.blacklist()
#         return Response({"message": "Logout successful"})
#     except Exception as e:
#         return Response({"error": "Invalid token or token expired"}, status=status.HTTP_400_BAD_REQUEST)
