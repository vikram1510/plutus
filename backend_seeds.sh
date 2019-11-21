#!/usr/bin/env bash
echo "Flushing DB...."
python manage.py flush
echo "Running jwt_auth seeds..........."
python manage.py loaddata jwt_auth/demo_seeds.json
echo "Running expenses seeds..........."
python manage.py loaddata expenses/demo_seeds.json
