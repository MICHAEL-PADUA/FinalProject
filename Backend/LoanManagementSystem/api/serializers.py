from rest_framework import serializers
from .models import User, Member, Loans, Amortization, BackupLog,RestoreLog
from auditlog.models import LogEntry
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'firstname', 'lastname', 'middleinitial','address', 'usertype', 'is_active', 'password']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password is write-only
        }

    def create(self, validated_data):
        # Hash the password before saving the user
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Set hashed password
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)
    def to_representation(self, instance):
        """Override to ensure proper representation of `is_active` as 1 or 0."""
        representation = super().to_representation(instance)
        representation['is_active'] = 1 if instance.is_active else 0  # Convert True/False to 1/0
        return representation
class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'  
        
class LoanSerializer(serializers.ModelSerializer):
    member_details = MemberSerializer(source='member', read_only=True)

    class Meta:
        model = Loans
        fields = '__all__'
        depth = 0 


class AmortizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Amortization
        fields = ['seq', 'due_date', 'amortization', 'principal', 'interest', 'remaining_balance']
        
from rest_framework import serializers
from auditlog.models import LogEntry
class AuditLogSerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()
    action = serializers.SerializerMethodField()
    object = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry
        fields = ['action', 'actor', 'timestamp', 'object']

    def get_actor(self, obj):
        return obj.actor.username if obj.actor else None

    def get_action(self, obj):
        action_map = {
            0: 'CREATE',
            1: 'UPDATE',
            2: 'DELETE'
        }
        return action_map.get(obj.action, obj.action)

    def get_object(self, obj):
        return {
            "model": str(obj.content_type), 
            "id": obj.object_pk,
            "representation": obj.object_repr  
        }
        
class BackupLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupLog
        fields = ['backup_time', 'filename']
        
class RestoreLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestoreLog
        fields = ['timestamp']