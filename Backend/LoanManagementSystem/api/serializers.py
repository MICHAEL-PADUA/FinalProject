from rest_framework import serializers
from .models import User, Member, Loans, Amortization, BackupLog, RestoreLog
from auditlog.models import LogEntry

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Define the fields to be serialized/deserialized
        fields = ['id', 'username', 'firstname', 'lastname', 'middleinitial', 'address', 'usertype', 'is_active', 'password']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password is write-only and not exposed in API responses
        }

    def create(self, validated_data):
        # Create user instance and hash the password before saving
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Hash password
        user.save()
        return user

    def update(self, instance, validated_data):
        # If password is provided during update, hash and set it properly
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        # Call the default update method for other fields
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        """Override to ensure `is_active` returns 1 or 0 instead of True/False."""
        representation = super().to_representation(instance)
        representation['is_active'] = 1 if instance.is_active else 0
        return representation

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'  # Serialize all fields of Member model

class LoanSerializer(serializers.ModelSerializer):
    # Nested read-only member details included in loan representation
    member_details = MemberSerializer(source='member', read_only=True)

    class Meta:
        model = Loans
        fields = '__all__'  # Serialize all fields of Loans model
        depth = 0  # Disable automatic nested serialization beyond explicitly defined fields

class AmortizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Amortization
        # Explicitly list fields to include in serialization
        fields = ['seq', 'due_date', 'amortization', 'principal', 'interest', 'remaining_balance']

class AuditLogSerializer(serializers.ModelSerializer):
    # Custom fields to represent actor username, action type, and object details
    actor = serializers.SerializerMethodField()
    action = serializers.SerializerMethodField()
    object = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry
        fields = ['action', 'actor', 'timestamp', 'object']

    def get_actor(self, obj):
        # Return username of actor if available
        return obj.actor.username if obj.actor else None

    def get_action(self, obj):
        # Map integer action codes to descriptive strings
        action_map = {
            0: 'CREATE',
            1: 'UPDATE',
            2: 'DELETE'
        }
        return action_map.get(obj.action, obj.action)

    def get_object(self, obj):
        # Return dictionary with model name, object ID, and string representation
        return {
            "model": str(obj.content_type),
            "id": obj.object_pk,
            "representation": obj.object_repr
        }

class BackupLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupLog
        # Fields included in backup log serialization
        fields = ['backup_time', 'filename']

class RestoreLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestoreLog
        # Fields included in restore log serialization
        fields = ['timestamp']
