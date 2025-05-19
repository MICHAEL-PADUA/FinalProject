import os
import shutil
import tarfile
import subprocess
from django.conf import settings
from django.http import FileResponse, JsonResponse
from rest_framework.decorators import api_view
from datetime import datetime
import logging
import datetime
from .models import BackupLog  
from .models import RestoreLog

def is_within_directory(directory, target):
    # Check if the target path is within the given directory to avoid path traversal attacks
    abs_directory = os.path.abspath(directory)
    abs_target = os.path.abspath(target)
    return os.path.commonpath([abs_directory]) == os.path.commonpath([abs_directory, abs_target])

def safe_extract(tar, path=".", members=None):
    # Safely extract tar files by validating paths of each member file
    for member in tar.getmembers():
        member_path = os.path.join(path, member.name)
        if not is_within_directory(path, member_path):
            raise Exception("Attempted Path Traversal in Tar File")
    tar.extractall(path, members)

def full_backup():
    # Create backups directory if it doesn't exist
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    os.makedirs(backup_dir, exist_ok=True)

    # Generate timestamp string for unique backup filename
    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = os.path.join(backup_dir, f"full_backup_{timestamp_str}.tar.gz")

    # Open tar.gz archive for writing
    with tarfile.open(backup_filename, "w:gz") as tar:
        db_settings = settings.DATABASES['default']
        engine = db_settings['ENGINE']
        env = os.environ.copy()

        if "sqlite3" in engine:
            # For SQLite, add the database file directly to the archive
            db_file = db_settings['NAME']
            if os.path.exists(db_file):
                tar.add(db_file, arcname=os.path.basename(db_file))
        else:
            # For other DB engines, create a SQL dump first
            temp_dump = os.path.join(backup_dir, f"db_dump_{timestamp_str}.sql")

            if "postgresql" in engine:
                # Use pg_dump to export PostgreSQL database
                env["PGPASSWORD"] = db_settings["PASSWORD"]
                command = [
                    "pg_dump",
                    "-U", db_settings["USER"],
                    "-h", db_settings.get("HOST", "localhost"),
                    "-p", str(db_settings.get("PORT", "5432")),
                    "-F", "p",
                    db_settings["NAME"]
                ]
                with open(temp_dump, "w") as dump_file:
                    subprocess.run(command, stdout=dump_file, check=True, env=env)
            elif "mysql" in engine:
                # Use mysqldump for MySQL database (custom path to mysqldump.exe in XAMPP)
                env["MYSQL_PWD"] = db_settings["PASSWORD"]
                command = [
                    "D:\\xampp\\mysql\\bin\\mysqldump.exe",
                    "-u", db_settings["USER"],
                    db_settings["NAME"]
                ]
                with open(temp_dump, "w") as dump_file:
                    subprocess.run(command, stdout=dump_file, check=True, env=env)
            else:
                raise Exception("Unsupported database engine for backup.")

            # Add the SQL dump file to the archive and remove the temp dump
            tar.add(temp_dump, arcname=os.path.basename(temp_dump))
            os.remove(temp_dump)

        # Add the MEDIA_ROOT folder to the backup archive
        media_root = settings.MEDIA_ROOT
        if os.path.exists(media_root):
            tar.add(media_root, arcname=os.path.basename(media_root))

    # Log the backup operation with filename and timestamp in DB
    BackupLog.objects.create(filename=os.path.basename(backup_filename), backup_time=datetime.datetime.now())

    # Return full path to backup archive file
    return backup_filename

@api_view(["GET"])
def backup_view(request):
    # API endpoint to trigger full backup and return the backup file as download
    try:
        backup_file_path = full_backup()
        return FileResponse(
            open(backup_file_path, "rb"),
            content_type="application/gzip",
            as_attachment=True,
            filename=os.path.basename(backup_file_path)
        )
    except Exception as e:
        # Return error as JSON if backup fails
        return JsonResponse({"detail": f"Backup failed: {e}"}, status=500)


logger = logging.getLogger(__name__)

@api_view(["POST"])
def restore_view(request):
    # API endpoint to restore backup from uploaded file
    backup_file = request.FILES.get("backup_file")
    if not backup_file:
        return JsonResponse({"detail": "No backup file provided."}, status=400)

    # Ensure backups directory exists
    backup_dir = os.path.join(settings.BASE_DIR, "backups")
    os.makedirs(backup_dir, exist_ok=True)

    # Save uploaded backup file temporarily on disk
    temp_backup_path = os.path.join(backup_dir, backup_file.name)
    with open(temp_backup_path, "wb+") as destination:
        for chunk in backup_file.chunks():
            destination.write(chunk)

    try:
        # Debugging info about base and media paths
        logger.debug(f"BASE_DIR: {settings.BASE_DIR}")
        logger.debug(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
        print(f"BASE_DIR: {settings.BASE_DIR}")
        print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")

        if not settings.MEDIA_ROOT:
            raise Exception("MEDIA_ROOT is not configured in Django settings.")

        # Prepare temp directory to extract backup archive contents
        temp_extract_dir = os.path.join(backup_dir, "temp_restore")
        if os.path.exists(temp_extract_dir):
            shutil.rmtree(temp_extract_dir)
        os.makedirs(temp_extract_dir)

        # Safely extract backup archive contents to temp directory
        with tarfile.open(temp_backup_path, "r:gz") as tar:
            safe_extract(tar, path=temp_extract_dir)

        db_settings = settings.DATABASES["default"]
        engine = db_settings["ENGINE"]
        env = os.environ.copy()

        if "sqlite3" in engine:
            # For SQLite, copy extracted .sqlite3 database file back to original location
            for fname in os.listdir(temp_extract_dir):
                if fname.endswith(".sqlite3"):
                    db_file = os.path.join(temp_extract_dir, fname)
                    shutil.copyfile(db_file, db_settings["NAME"])
                    break
            else:
                raise Exception("SQLite database file not found in backup.")
        else:
            # For PostgreSQL/MySQL, find the SQL dump file extracted from backup
            dump_file = None
            for fname in os.listdir(temp_extract_dir):
                if fname.startswith("db_dump"):
                    dump_file = os.path.join(temp_extract_dir, fname)
                    break
            if not dump_file:
                # Try to find any .sql file as fallback
                for fname in os.listdir(temp_extract_dir):
                    if fname.endswith(".sql"):
                        dump_file = os.path.join(temp_extract_dir, fname)
                        break
            if not dump_file:
                raise Exception("SQL dump file not found in backup.")

            print(f"Using SQL dump file: {dump_file}")

            # Restore database from SQL dump file depending on engine
            if "postgresql" in engine:
                env["PGPASSWORD"] = db_settings["PASSWORD"]
                command = [
                    "psql",
                    "-U", db_settings["USER"],
                    "-h", db_settings.get("HOST", "localhost"),
                    "-p", str(db_settings.get("PORT", "5432")),
                    "-d", db_settings["NAME"],
                    "-f", dump_file
                ]
                subprocess.run(command, check=True, env=env)
            elif "mysql" in engine:
                env["MYSQL_PWD"] = db_settings["PASSWORD"]
                command = [
                    "D:\\xampp\\mysql\\bin\\mysql.exe",  
                    "-u", db_settings["USER"],
                    db_settings["NAME"]
                ]
                with open(dump_file, "r") as f:
                    subprocess.run(command, stdin=f, check=True, env=env)
            else:
                raise Exception("Unsupported database engine for restore.")

        # Restore media files by copying extracted media folder over MEDIA_ROOT
        media_dir_name = os.path.basename(settings.MEDIA_ROOT)
        print(f"media_dir_name (basename of MEDIA_ROOT): {media_dir_name}")

        media_backup_path = os.path.join(temp_extract_dir, media_dir_name)
        print(f"media_backup_path: {media_backup_path}")

        media_restored = False
        if os.path.exists(media_backup_path):
            if os.path.exists(settings.MEDIA_ROOT):
                shutil.rmtree(settings.MEDIA_ROOT)
            shutil.copytree(media_backup_path, settings.MEDIA_ROOT)
            media_restored = True
        else:
            logger.warning("Media backup folder not found in archive. Skipping media restore.")

        # Clean up temporary extracted files and uploaded backup archive
        shutil.rmtree(temp_extract_dir)
        os.remove(temp_backup_path)

        # Log restore operation in database
        RestoreLog.objects.create()

        # Return success response with restore info
        return JsonResponse({
            "detail": "Restore completed successfully.",
            "media_restored": media_restored,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    except Exception as e:
        # Log and return error response if restore fails
        logger.error(f"Restore failed: {e}")
        return JsonResponse({"detail": f"Restore failed: {e}"}, status=500)
