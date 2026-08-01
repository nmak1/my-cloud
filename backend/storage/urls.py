# backend/storage/urls.py
from django.urls import path
from . import views

app_name = 'storage'

urlpatterns = [
    path('files/', views.list_files, name='list_files'),
    path('files/upload/', views.upload_file, name='upload_file'),
    path('files/<int:file_id>/', views.delete_file, name='delete_file'),
    path('files/<int:file_id>/rename/', views.rename_file, name='rename_file'),
    path('files/<int:file_id>/comment/', views.update_comment, name='update_comment'),
    path('files/<int:file_id>/share/', views.share_file, name='share_file'),
    path('files/<int:file_id>/download/', views.download_file, name='download_file'),
    path('shared/<str:token>/', views.download_shared_file, name='shared_download'),
]