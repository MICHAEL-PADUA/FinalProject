# ACCCLms 
Open XAMPP
Start Apache and MYSQL
CD BACKEND
pip install -r requirements.txt
CD LOANMANAGEMENTSYSTEM
python manage.py makemigrations
python manage.py migrate
python manage.py runserver localhost:8000

CD FRONTEND
npm run dev

There two user types: The admin has access to all the system's functionalities while the Personnel is not allowed to backup or restore and access the user management page.

Amortization schedules cannot be generated unless a loan is approved

The report generation page downloads an excel file which is identical to the excel files that ACCC works on.


