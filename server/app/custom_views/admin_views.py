from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from app.models import Task, User
from app.serializers import TaskSerializer, UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_view(request):
    user = request.user

    if user.role == 'Admin':
        tasks = Task.objects.filter(assigned_to__role='User')
    elif user.role == 'SuperAdmin':
        tasks = Task.objects.all()
    else:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    task_data = []
    for task in tasks.filter(status=Task.TaskStatus.COMPLETED):
        task_data.append({
            "id": task.id,
            "title": task.title,
            "assigned_to": task.assigned_to.username,
            "worked_hours": task.worked_hours,
            "completion_report": task.completion_report,
        })

    data = {
        "total": tasks.count(),
        "pending": tasks.filter(status=Task.TaskStatus.PENDING).count(),
        "inProgress": tasks.filter(status=Task.TaskStatus.IN_PROGRESS).count(),
        "completed": tasks.filter(status=Task.TaskStatus.COMPLETED).count(),
        "completed_reports": task_data,  # This is new
    }

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manage_users_view(request):
    if request.user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.exclude(id=request.user.id)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user_view(request):
    # SuperAdmin can create Admin, Admin can create Users
    if request.user.role == 'SuperAdmin':
        allowed_roles = ['Admin', 'User']
    elif request.user.role == 'Admin':
        allowed_roles = ['User']
    else:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()

    if 'role' not in data or data['role'] not in allowed_roles:
        return Response({"error": f"You can only assign roles: {allowed_roles}"}, status=status.HTTP_400_BAD_REQUEST)

    
    if 'password' in data:
        data['password'] = make_password(data['password'])

    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_view(request, pk):
    if request.user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)

    if request.user.role == 'Admin' and user.role != 'User':
        return Response({"error": "Admin can only update Users"}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    if 'password' in data and data['password']:
        data['password'] = make_password(data['password'])

    serializer = UserSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_view(request, pk):
    if request.user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)

    if request.user.role == 'Admin' and user.role != 'User':
        return Response({"error": "Admin can only delete Users"}, status=status.HTTP_403_FORBIDDEN)

    user.delete()
    return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_task_list_view(request):
    if request.user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    if request.user.role == 'Admin':
        tasks = Task.objects.filter(assigned_to__role='User')
    else:
        tasks = Task.objects.all()

    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_task_view(request):
    if request.user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_task_view(request, pk):
    if request.user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    task = get_object_or_404(Task, pk=pk)

    serializer = TaskSerializer(task, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task_view(request, pk):
    if request.user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    task = get_object_or_404(Task, pk=pk)
    task.delete()
    return Response({"message": "Task deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
