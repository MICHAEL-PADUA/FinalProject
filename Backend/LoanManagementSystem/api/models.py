from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from auditlog.registry import auditlog
from auditlog.models import AuditlogHistoryField

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field is required')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('usertype', 'Admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ADMIN = 'Admin'
    PERSONNEL = 'Personnel'

    USER_TYPE_CHOICES = [
        (ADMIN, 'Admin'),
        (PERSONNEL, 'Personnel'),
    ]

    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middleinitial = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    usertype = models.CharField(max_length=100, choices=USER_TYPE_CHOICES)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    history = AuditlogHistoryField()

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['firstname', 'lastname', 'usertype']

    def __str__(self):
        return f"{self.firstname} {self.middleinitial}. {self.lastname}"

    class Meta:
        db_table = 'tblUser'


class Member(models.Model):
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    BRANCH_OF_SERVICE_CHOICES = [
        ('Armed Forces', 'Armed Forces'),
        ('Philippine Coast Guard', 'Philippine Coast Guard'),
        ('Philippine Army', 'Philippine Army'),
        ('Philippine Marine Corps', 'Philippine Marine Corps'),
        ('Bureau of Fire Protection', 'Bureau of Fire Protection'),
        ('Philippine Navy', 'Philippine Navy'),
        ('Bureau of Jail Management and Penology', 'Bureau of Jail Management and Penology'),
        ('Philippine Coast Guard', 'Philippine Cost Guard'),  
    ]
    
    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, blank=True)
    nationality = models.CharField(max_length=50)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    branch_of_service = models.CharField(max_length=100, choices=BRANCH_OF_SERVICE_CHOICES)
    service_no = models.CharField(max_length=50, unique=True)
    office_business_address = models.TextField()
    unit_assignment = models.CharField(max_length=255)
    unit_office_telephone_no = models.CharField(max_length=20, blank=True)
    occupation_designation = models.CharField(max_length=100)
    source_of_income = models.CharField(max_length=100)
    member_signature = models.TextField(blank=True, null=True)
    member_picture = models.ImageField(upload_to='member_pictures/', null=True, blank=True)
    history = AuditlogHistoryField()

    class Meta:
        db_table = 'tblMember'

    def __str__(self):
        return f"{self.lastname}, {self.firstname}"


class Loans(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('released', 'Released'),
        ('reject', 'Reject'),
    ]

    LOAN_TYPE_CHOICES = [
        ('quick', 'Quick'),
        ('salary', 'Salary'),
        ('emergency', 'Emergency'),
        ('multipurpose', 'Multipurpose'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='loans')
    loan_type = models.CharField(max_length=20, choices=LOAN_TYPE_CHOICES)
    loan_amount = models.DecimalField(max_digits=10, decimal_places=2)
    interest = models.DecimalField(max_digits=5, decimal_places=2)
    term = models.IntegerField()
    grace = models.IntegerField()
    payment_start_date = models.DateField(default=timezone.now)
    maturity_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    history = AuditlogHistoryField()




    class Meta:
        db_table = "tblLoans"



class Amortization(models.Model):
    loan = models.ForeignKey('Loans', on_delete=models.CASCADE)
    seq = models.PositiveIntegerField()
    due_date = models.DateField()
    amortization = models.DecimalField(max_digits=12, decimal_places=2)
    principal = models.DecimalField(max_digits=12, decimal_places=2)
    interest = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_balance = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Amortization {self.seq} for Loan {self.loan.id}"
    class Meta:
        db_table = 'tblAmortization'
        
class BackupLog(models.Model):
    backup_time = models.DateTimeField(auto_now_add=True)
    filename = models.CharField(max_length=255)

    def __str__(self):
        return f"Backup at {self.backup_time.strftime('%Y-%m-%d %H:%M:%S')}"
    
class RestoreLog(models.Model):
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Restore at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
    
auditlog.register(User)
auditlog.register(Member)
auditlog.register(Loans)

