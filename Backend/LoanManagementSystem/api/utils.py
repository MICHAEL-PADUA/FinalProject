from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from api.models import Amortization

def generate_amortization_schedule(loan, amortization):
    # Print start of schedule generation for debugging
    print(f"Generating amortization schedule for loan {loan.id} with fixed amortization {amortization}...")

    # Check if amortization schedule for this loan already exists to avoid duplicates
    if Amortization.objects.filter(loan=loan).exists():
        print("Amortization records already exist.")
        return

    seq = 1  # Sequence number of amortization payment
    due_date = loan.payment_start_date  # Initial due date
    remaining_balance = Decimal(loan.loan_amount)  # Starting loan principal balance
    amortization = Decimal(amortization)  # Fixed amortization payment amount

    # Monthly interest rate calculated from annual interest percentage
    monthly_rate = (Decimal(loan.interest) / Decimal('100')) / Decimal('12')

    term = loan.term  # Number of months for loan term

    for month in range(1, term + 1):
        # Calculate interest for current month based on remaining balance
        interest = (remaining_balance * monthly_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        # Calculate principal portion by subtracting interest from amortization payment
        principal = (amortization - interest).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # Adjust principal and amortization if principal payment exceeds remaining balance (final payment)
        if principal > remaining_balance:
            principal = remaining_balance
            amortization = (principal + interest).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # Subtract principal payment from remaining balance and round
        remaining_balance -= principal
        remaining_balance = remaining_balance.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # Create amortization record with all calculated fields and save to DB
        amort = Amortization(
            loan=loan,
            seq=seq,
            due_date=due_date,
            amortization=float(amortization),
            principal=float(principal),
            interest=float(interest),
            remaining_balance=float(max(remaining_balance, Decimal('0.00')))  # Ensure balance not negative
        )
        amort.save()

        # Increment sequence number and move due date to next month (+30 days)
        seq += 1
        due_date += timedelta(days=30)

        # Exit loop if loan is fully paid off
        if remaining_balance <= 0:
            break

    # Print confirmation that records were created
    print("Amortization records created.")
