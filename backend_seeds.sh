#!/usr/bin/env bash
echo "Running jwt_auth seeds..........."
python manage.py loaddata jwt_auth/seeds.json
echo "Running expenses seeds..........."
python manage.py loaddata expenses/seeds.json
