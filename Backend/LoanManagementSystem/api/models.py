from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from auditlog.registry import auditlog
from auditlog.models import AuditlogHistoryField

# Custom user manager to handle user creation and superuser creation
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        # Raise error if username is not provided
        if not username:
            raise ValueError('The Username field is required')
        # Create a user instance with given username and extra fields
        user = self.model(username=username, **extra_fields)
        # Set password (hashed)
        user.set_password(password)
        # Save user to database
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        # Set default fields for superuser
        extra_fields.setdefault('usertype', 'Admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # Call create_user with superuser attributes
        return self.create_user(username, password, **extra_fields)


# Custom User model inheriting from AbstractBaseUser and PermissionsMixin for auth support
class User(AbstractBaseUser, PermissionsMixin):
    # Constants for user types
    ADMIN = 'Admin'
    PERSONNEL = 'Personnel'

    # Choices for usertype field
    USER_TYPE_CHOICES = [
        (ADMIN, 'Admin'),
        (PERSONNEL, 'Personnel'),
    ]

    # User details fields
    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middleinitial = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    usertype = models.CharField(max_length=100, choices=USER_TYPE_CHOICES)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)  # Note: password field is already provided by AbstractBaseUser
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    # Auditlog field to keep change history of User records
    history = AuditlogHistoryField()

    # Attach the custom user manager
    objects = CustomUserManager()

    # Field used to identify user uniquely
    USERNAME_FIELD = 'username'
    # Required fields besides USERNAME_FIELD when creating superuser via CLI
    REQUIRED_FIELDS = ['firstname', 'lastname', 'usertype']

    def __str__(self):
        # Return full name for string representation
        return f"{self.firstname} {self.middleinitial}. {self.lastname}"

    class Meta:
        db_table = 'tblUser'  # Custom database table name


# Member model representing individual members with detailed info
class Member(models.Model):
    # Sex options
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    # Branch of service options
    BRANCH_OF_SERVICE_CHOICES = [
        ('Armed Forces', 'Armed Forces'),
        ('Philippine Coast Guard', 'Philippine Coast Guard'),
        ('Philippine Army', 'Philippine Army'),
        ('Philippine Marine Corps', 'Philippine Marine Corps'),
        ('Bureau of Fire Protection', 'Bureau of Fire Protection'),
        ('Philippine Navy', 'Philippine Navy'),
        ('Bureau of Jail Management and Penology', 'Bureau of Jail Management and Penology'),
        ('Philippine Coast Guard', 'Philippine Cost Guard'),  # Duplicate? Possibly typo
    ]
    
    # Member personal info fields
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
    # Auditlog history to track changes
    history = AuditlogHistoryField()

    class Meta:
        db_table = 'tblMember'  # Custom table name

    def __str__(self):
        # Return "Lastname, Firstname" for string representation
        return f"{self.lastname}, {self.firstname}"


# Loans model for storing loan records linked to a Member
class Loans(models.Model):
    # Loan status choices
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('released', 'Released'),
        ('reject', 'Reject'),
    ]

    # Loan type choices
    LOAN_TYPE_CHOICES = [
        ('quick', 'Quick'),
        ('salary', 'Salary'),
        ('emergency', 'Emergency'),
        ('multipurpose', 'Multipurpose'),
    ]

    # Foreign key linking loan to member
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='loans')
    loan_type = models.CharField(max_length=20, choices=LOAN_TYPE_CHOICES)
    loan_amount = models.DecimalField(max_digits=10, decimal_places=2)
    interest = models.DecimalField(max_digits=5, decimal_places=2)
    term = models.IntegerField()
    grace = models.IntegerField()
    payment_start_date = models.DateField(default=timezone.now)
    maturity_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Auditlog field to track loan record changes
    history = AuditlogHistoryField()

    class Meta:
        db_table = "tblLoans"  # Custom table name


# Amortization model to store payment schedule details for loans
class Amortization(models.Model):
    loan = models.ForeignKey('Loans', on_delete=models.CASCADE)  # Link to a loan
    seq = models.PositiveIntegerField()  # Sequence number of the payment
    due_date = models.DateField()
    amortization = models.DecimalField(max_digits=12, decimal_places=2)
    principal = models.DecimalField(max_digits=12, decimal_places=2)
    interest = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_balance = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        # String representation includes sequence and loan ID
        return f"Amortization {self.seq} for Loan {self.loan.id}"

    class Meta:
        db_table = 'tblAmortization'  # Custom table name


# Model to log backup events
class BackupLog(models.Model):
    backup_time = models.DateTimeField(auto_now_add=True)  # Timestamp auto-set on creation
    filename = models.CharField(max_length=255)  # Backup filename

    def __str__(self):
        # Display timestamp for backup log entries
        return f"Backup at {self.backup_time.strftime('%Y-%m-%d %H:%M:%S')}"
    

# Model to log restore events
class RestoreLog(models.Model):
    timestamp = models.DateTimeField(auto_now=True)  # Timestamp updated on each save

    def __str__(self):
        # Display timestamp for restore log entries
        return f"Restore at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
    

# Register models with auditlog to automatically track changes
auditlog.register(User)
auditlog.register(Member)
auditlog.register(Loans)
