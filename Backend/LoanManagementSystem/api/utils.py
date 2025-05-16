from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from api.models import Amortization

def generate_amortization_schedule(loan, amortization):
    print(f"Generating amortization schedule for loan {loan.id} with fixed amortization {amortization}...")

    if Amortization.objects.filter(loan=loan).exists():
        print("Amortization records already exist.")
        return

    seq = 1
    due_date = loan.payment_start_date
    remaining_balance = Decimal(loan.loan_amount)
    amortization = Decimal(amortization)

    monthly_rate = (Decimal(loan.interest) / Decimal('100')) / Decimal('12')

    term = loan.term 

    for month in range(1, term + 1):
        interest = (remaining_balance * monthly_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        principal = (amortization - interest).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        if principal > remaining_balance:
            principal = remaining_balance
            amortization = (principal + interest).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        remaining_balance -= principal
        remaining_balance = remaining_balance.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        amort = Amortization(
            loan=loan,
            seq=seq,
            due_date=due_date,
            amortization=float(amortization),
            principal=float(principal),
            interest=float(interest),
            remaining_balance=float(max(remaining_balance, Decimal('0.00')))
        )
        amort.save()

        seq += 1
        due_date += timedelta(days=30)

        if remaining_balance <= 0:
            break

    print("Amortization records created.")
