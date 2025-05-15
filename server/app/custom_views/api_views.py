from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from app.models import Task
from app.serializers import TaskSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_list_view(request):
    tasks = Task.objects.filter(assigned_to=request.user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def task_update_view(request, pk):
    task = get_object_or_404(Task, pk=pk, assigned_to=request.user)
    data = request.data.copy()

    if data.get('status') == Task.TaskStatus.COMPLETED:
        if not data.get('completion_report') or not data.get('worked_hours'):
            return Response(
                {"error": "Completion report and worked hours are required when marking as completed."},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        data.pop('completion_report', None)
        data.pop('worked_hours', None)

    serializer = TaskSerializer(task, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def completed_tasks_list_view(request):
    user = request.user
    if user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

    completed_tasks = Task.objects.filter(status=Task.TaskStatus.COMPLETED)
    # Prepare a list of dicts with required fields for each task
    data = [
        {
            "id": task.id,
            "title": task.title,
            "assigned_to": task.assigned_to.username,
            "worked_hours": task.worked_hours,
            "completion_report": task.completion_report,
        }
        for task in completed_tasks
    ]
    print(data)
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_report_view(request, pk):
    user = request.user
    if user.role not in ['Admin', 'SuperAdmin']:
        return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

    task = get_object_or_404(Task, pk=pk, status=Task.TaskStatus.COMPLETED)
    return Response({
        "completion_report": task.completion_report,
        "worked_hours": task.worked_hours,
        "user": task.assigned_to.username,
        "title": task.title,
    })
