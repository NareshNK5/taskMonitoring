from django.urls import path
from app.custom_views import api_views, admin_views, auth_login

urlpatterns = [
    # Auth
    path('auth/login/', auth_login.login_view),
    path('auth/logout/', auth_login.logout_view),

    # User Task
    path('tasks/', api_views.task_list_view),
    path('tasks/<int:pk>/update/', api_views.task_update_view),
    path('tasks/<int:pk>/report/', api_views.task_report_view),

    # Admin User Management
    path('admin/users/', admin_views.manage_users_view),
    path('admin/users/create/', admin_views.create_user_view),
    path('admin/users/<int:pk>/', admin_views.update_user_view),
    path('admin/users/<int:pk>/delete/', admin_views.delete_user_view),

    # Admin Task Management
    path('admin/tasks/', admin_views.admin_task_list_view),
    path('admin/tasks/create/', admin_views.create_task_view),
    path('admin/tasks/<int:pk>/', admin_views.update_task_view),
    path('admin/tasks/<int:pk>/delete/', admin_views.delete_task_view),

    # Admin Dashboard
    path('admin/dashboard/', admin_views.admin_dashboard_view),
    
    path('admin/task/complete/', api_views.completed_tasks_list_view),
    path('admin/task/complete/<int:pk>/', api_views.task_report_view),
]
