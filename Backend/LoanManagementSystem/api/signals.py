# # api/signals.py
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Loans
# from .utils import generate_amortization_schedule

# @receiver(post_save, sender=Loans)
# def generate_amortization_on_release(sender, instance, created, **kwargs):
#     if instance.status == 'released':
#         print(f"[Signal Triggered] Loan {instance.id} status is released.")
#         generate_amortization_schedule(instance)
