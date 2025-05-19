from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from api.views import login_user,logout_view,refresh_token_view,protected_view,generate_loan_report,last_backup_time,last_restore_time,create_amortization_schedule,search_members
from api import views  
from api.backup_restore import backup_view, restore_view  # import the views


urlpatterns = [
    path('admin/', admin.site.urls),
#---USERS--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    path('api/users/', views.user_list, name='user_list'),
    path('api/users/<int:pk>/', views.user_detail, name='user_detail'),
    path('api/users/create/', views.create_user, name='create_user'), 
    path('api/users/<int:pk>/update/', views.update_user, name='update_user'),
    path('api/users/search/<str:query>/', views.search_users, name='search_users'),
#---MEMBERS--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    path('api/members/', views.get_members),
    path('api/members/create/', views.create_member),
    path('api/members/<int:pk>/update/', views.update_member),
    path('api/members/search/<str:query>/', search_members, name='search-members'),
#---LOANS--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    path('api/loans/create/', views.create_loan, name='create_loan'),
    path('api/loans/', views.get_loan, name='get_loan'),
    path('api/loans/create/', views.create_loan, name='create_loan'),
    path('api/loans/update/<int:pk>/', views.update_loan, name='update_loan'),
    path('api/loans/search/<int:pk>/', views.search_loan, name='search-loan'),
    path('api/loans/<int:pk>/amortization/', views.amortization_list, name='amortization-list'),
    path('api/loans/<int:pk>/amortization/create/', create_amortization_schedule, name='create-amortization-schedule'),
    path('api/loans/<int:loan_id>/report/', generate_loan_report, name='generate_loan_report'),
#---BACKUP & RESTORE--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    path('api/backup/', backup_view, name='backup'),
    path('api/backup/last/', last_backup_time, name='last_backup_time'),
    path('api/restore/', restore_view, name='restore'),
    path('api/restore/last/', last_restore_time, name='last_restore_time'),
#---LOGIN & LOGOUT JWT--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    path('api/login/', login_user),
    path('api/logout/', logout_view),
    path('api/refresh/', refresh_token_view),
    path('api/protected/', protected_view),
#---AUDIT LOGS--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

     path('api/auditlogs/', views.get_audit_logs, name='auditlogs-list'),
   
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # Serves media files during development
