from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.forms import ModelForm
from django import forms
from .models import User,Member,Loans,Amortization,BackupLog,RestoreLog

class UserCreationForm(ModelForm):
    password = forms.CharField(label='Password', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('username', 'firstname', 'lastname', 'usertype')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user


class UserChangeForm(ModelForm):
    class Meta:
        model = User
        fields = '__all__'


class CustomUserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    model = User

    list_display = ('username', 'firstname', 'lastname', 'usertype', 'is_active', 'is_staff')
    list_filter = ('usertype', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('firstname', 'middleinitial', 'lastname', 'address')}),
        ('Permissions', {'fields': ('usertype', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
    (None, {
        'classes': ('wide',),
        'fields': ('username', 'firstname', 'lastname', 'usertype', 'password'),
    }),
)
    search_fields = ('username', 'firstname', 'lastname')
    ordering = ('username',)

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('service_no', 'lastname', 'firstname', 'middlename', 'sex', 'branch_of_service', 'nationality')
    search_fields = ('service_no', 'lastname', 'firstname')
    list_filter = ('sex', 'branch_of_service', 'nationality')
    ordering = ('lastname',)

@admin.register(Loans)
class LoansAdmin(admin.ModelAdmin):
    list_display = ('id', 'member', 'loan_type', 'loan_amount', 'interest', 'term', 'grace', 'payment_start_date', 'maturity_date', 'status')
    search_fields = ('member__lastname', 'member__firstname', 'loan_type', 'status')
    list_filter = ('loan_type', 'status')
    ordering = ('-payment_start_date',)

@admin.register(Amortization)
class AmortizationAdmin(admin.ModelAdmin):
    list_display = ('loan', 'seq', 'due_date', 'amortization', 'principal', 'interest', 'remaining_balance')
    search_fields = ('loan__id',)
    ordering = ('loan', 'seq')

@admin.register(BackupLog)
class BackupLogAdmin(admin.ModelAdmin):
    list_display = ('backup_time', 'filename')
    ordering = ('-backup_time',)

@admin.register(RestoreLog)
class RestoreLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp',)
    ordering = ('-timestamp',)
admin.site.register(User, CustomUserAdmin)
