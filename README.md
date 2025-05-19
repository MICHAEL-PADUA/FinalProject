# ACCCLms 
Open XAMPP
Start Apache and MYSQL

CD BACKEND
pip install -r requirements.txt
CD LOANMANAGEMENTSYSTEM
python manage.py makemigrations
python manage.py migrate
python manage.py runserver localhost:8000

Open another command prompt
CD FRONTEND
npm install
npm run dev

There two user types: The Admin has access to all the system's functionalities while the Personnel is not allowed to backup or restore and access the user management page.

Admins can add new users and can activate or deactivate accounts.  

The main Members of ACCC are primarily uniformed personnel of the Philippines and are included in the system except for PNP.

There are four types of loans: Quick, Salary, Multipurpose and Emergency, upon adding a loan the default status would be pending and can be updated to released or reject

Amortization schedules cannot be generated unless a loan is approved. If a loan is approved the user can enter the monthly amortization and upon entering will auto generate the schedule.

The report generation page downloads an excel file which is identical to the excel files that ACCC works on.

Audit logs can be viewed by clicking the audit trails icon

The backup page downloads a tar gz file which can be uploaded in the restore page to backup and restore the database.

